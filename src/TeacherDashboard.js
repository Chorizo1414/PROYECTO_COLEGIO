import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { auth } from "./auth";
import './css/TeacherDashboard.css';

const TaskModal = ({ assignmentId, onClose, onSave }) => {
    const [titulo, setTitulo] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo.trim() || !fechaEntrega) {
            alert("Por favor, complete el título y la fecha.");
            return;
        }
        try {
            const token = localStorage.getItem("accessToken");
            const payload = { id_asignacion: assignmentId, titulo, fecha_entrega: fechaEntrega };
            const res = await axios.post("http://localhost:4000/api/teachers/tasks", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSave(res.data);
        } catch (err) {
            console.error("Error creating task", err);
            alert("Error al crear la tarea: " + (err.response?.data?.msg || err.message));
        }
    };

    return (
        <div className="tdb-modal">
            <div className="tdb-modalCard">
                <div className="tdb-modalHeader">
                    <h3>➕ Nueva tarea</h3>
                    <button className="tdb-x" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="tdb-form">
                        <div className="tdb-formCol">
                            <label className="tdb-label">Título de la tarea</label>
                            <input className="tdb-input" placeholder="Ej: Resumen del capítulo 5" value={titulo} onChange={e => setTitulo(e.target.value)} required />
                        </div>
                        <div className="tdb-formCol">
                            <label className="tdb-label">Fecha de entrega</label>
                            <input type="date" className="tdb-input" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} required />
                        </div>
                    </div>
                    <div className="tdb-modalActions">
                        <button type="button" className="tdb-btn" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="tdb-btn tdb-btn--primary">Guardar Tarea</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { cui } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [currentAssignmentId, setCurrentAssignmentId] = useState("");
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState({ assignments: true, data: false });
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
  
  const loggedInUser = auth.getUser();
  const isCoordinatorView = !!cui;
  const targetCui = cui || loggedInUser?.cui_docente;

  const fetchData = useCallback(async () => {
    if (!targetCui) {
      setError("No se pudo identificar al docente.");
      setLoading({ assignments: false, data: false });
      return;
    }
    setLoading(p => ({ ...p, assignments: true }));
    try {
      const token = localStorage.getItem("accessToken");
      const [teacherRes, assignmentsRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/teachers/${targetCui}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:4000/api/teachers/assignments/${targetCui}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTeacherInfo(teacherRes.data);
      setAssignments(assignmentsRes.data);
      if (assignmentsRes.data.length > 0) {
        setCurrentAssignmentId(assignmentsRes.data[0].id_asignacion);
      } else {
        setCurrentAssignmentId("");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No se pudieron cargar los datos del docente.");
    } finally {
      setLoading(p => ({ ...p, assignments: false }));
    }
  }, [targetCui]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAssignmentData = useCallback(async () => {
    if (!currentAssignmentId) {
        setStudents([]); setTasks([]); setDeliveries({}); return;
    }
    setLoading(p => ({ ...p, data: true }));
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`http://localhost:4000/api/teachers/assignment-data/${currentAssignmentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.data.students);
      setTasks(res.data.tasks);
      setDeliveries(res.data.deliveries || {});
    } catch (err) {
      console.error(`Error fetching assignment data`, err);
      setError("No se pudieron cargar los datos de la asignación.");
    } finally {
      setLoading(p => ({ ...p, data: false }));
    }
  }, [currentAssignmentId]);
  
  useEffect(() => { fetchAssignmentData(); }, [fetchAssignmentData]);

  const handleCheckChange = (studentId, taskId) => {
    if(isCoordinatorView) return;
    setDeliveries(prev => {
      const studentDeliveries = { ...(prev[studentId] || {}) };
      studentDeliveries[taskId] = !studentDeliveries[taskId];
      return { ...prev, [studentId]: studentDeliveries };
    });
  };
  
  const handleSaveDeliveries = async () => {
    const payload = [];
    Object.keys(deliveries).forEach(cui_estudiante => {
        Object.keys(deliveries[cui_estudiante]).forEach(id_tarea => {
            payload.push({ cui_estudiante, id_tarea, entregado: !!deliveries[cui_estudiante][id_tarea] });
        });
    });
    if (payload.length === 0) return alert("No hay cambios para guardar.");
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post("http://localhost:4000/api/teachers/deliveries", { deliveries: payload }, { headers: { Authorization: `Bearer ${token}` } });
      alert("¡Progreso guardado con éxito!");
    } catch(err) {
        console.error("Error saving deliveries", err);
        alert("Hubo un error al guardar el progreso.");
    }
  };

  const handleTaskSaved = (newTask) => {
    setTasks(prev => [newTask, ...prev].sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega)));
    setShowTaskModal(false);
  };

  const logout = () => {
      if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
          auth.logout();
          navigate("/login", { replace: true });
      }
  };

  return (
    <div className="tdb-page">
      <div className="tdb-container">
        {/* CORRECCIÓN #2: Se conecta la función handleTaskSaved al modal */}
        {showTaskModal && <TaskModal assignmentId={currentAssignmentId} onClose={() => setShowTaskModal(false)} onSave={handleTaskSaved} />}
        
        <header className="tdb-header">
          <h1>Panel de Docente: {teacherInfo?.nombre_completo || 'Cargando...'}</h1>
          <p>Seguimiento y control de tareas</p>
        </header>

        <div className="tdb-actions-bar">
          {isCoordinatorView ? (
            <button className="tdb-btn tdb-btn--secondary" onClick={() => navigate('/seleccionar-docente')}>⬅ Volver a la Selección</button>
          ) : (
            <button className="tdb-btn tdb-btn--danger" onClick={logout}>🚪 Cerrar Sesión</button>
          )}

          {!isCoordinatorView && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              <button className="tdb-btn tdb-btn--secondary" onClick={() => setShowTaskModal(true)} disabled={!currentAssignmentId}>+ Nueva Tarea</button>
              <button className="tdb-btn tdb-btn--primary" onClick={handleSaveDeliveries}>💾 Guardar Cambios</button>
            </div>
          )}
        </div>

        {loading.assignments ? <p>Cargando...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
          <div className="tdb-card">
            <h2 className="tdb-card-title">Seguimiento de Tareas</h2>
            <div className="tdb-controls">
              <div className="tdb-control-group">
                <label htmlFor="curso-select" className="tdb-label">Curso Asignado</label>
                <select id="curso-select" className="tdb-select" value={currentAssignmentId} onChange={(e) => setCurrentAssignmentId(e.target.value)} disabled={assignments.length === 0}>
                  {assignments.length === 0 ? <option>No tienes cursos asignados</option> : assignments.map((a) => (
                    <option key={a.id_asignacion} value={a.id_asignacion}>
                      {a.nombre_grado} - {a.nombre_seccion} ({a.cursos ? a.cursos.join(', ') : '...'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading.data ? <p>Cargando alumnos...</p> : (
              <div className="tdb-track-wrapper">
                <table className="tdb-matrix">
                  <thead>
                    <tr>
                      <th className="student-name">Alumno</th>
                      {tasks.map((t) => (
                        <th key={t.id_tarea} className="tdb-task-header">
                          <span className="title" title={t.titulo}>{t.titulo}</span>
                          <span className="date">{new Date(t.fecha_entrega).toLocaleDateString()}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.cui_estudiante}>
                        <td className="student-name"><span>{s.apellidos}, {s.nombres}</span></td>
                        {tasks.map((t) => (
                          <td key={`${s.cui_estudiante}-${t.id_tarea}`} className="task-check">
                            {/* CORRECCIÓN #1: Se conecta la función handleCheckChange al checkbox */}
                            <input className="tdb-checkbox" type="checkbox" checked={!!deliveries[s.cui_estudiante]?.[t.id_tarea]} onChange={() => handleCheckChange(s.cui_estudiante, t.id_tarea)} aria-label={`${s.nombres} completó ${t.titulo}`} disabled={isCoordinatorView} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}