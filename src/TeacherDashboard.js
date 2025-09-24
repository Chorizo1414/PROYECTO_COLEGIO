import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { auth } from "./auth";
import './css/TeacherDashboard.css';

const TaskModal = ({ assignmentId, courses, taskToEdit, onClose, onSave }) => {
    const [form, setForm] = useState({
        titulo: '',
        fecha_entrega: '',
        id_curso: ''
    });

    useEffect(() => {
        if (taskToEdit) {
            setForm({
                titulo: taskToEdit.titulo,
                fecha_entrega: new Date(taskToEdit.fecha_entrega).toISOString().split('T')[0],
                id_curso: taskToEdit.id_curso
            });
        } else if (courses && courses.length > 0) {
            setForm(prev => ({ titulo: '', fecha_entrega: '', id_curso: courses[0].id_curso }));
        }
    }, [taskToEdit, courses]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim() || !form.fecha_entrega || !form.id_curso) {
            alert('Todos los campos son obligatorios.');
            return;
        }
        
        const token = localStorage.getItem('accessToken');
        try {
            if (taskToEdit) {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/teachers/tasks/${taskToEdit.id_tarea}`, 
                    { ...form, id_asignacion: assignmentId }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/teachers/tasks`,
                    { ...form, id_asignacion: assignmentId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            onSave();
        } catch (error) {
            alert('Error al guardar la tarea.');
        }
    };

    return (
        <div className="tdb-modal-backdrop">
            <div className="tdb-modal">
                <h2>{taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                <form onSubmit={handleSubmit}>
                    <select name="id_curso" value={form.id_curso} onChange={handleChange} required>
                        {courses.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
                    </select>
                    <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título de la tarea" required />
                    <input name="fecha_entrega" type="date" value={form.fecha_entrega} onChange={handleChange} required />
                    <div className="tdb-modal-actions">
                        <button type="button" onClick={onClose}>Cancelar</button>
                        <button type="submit">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function TeacherDashboard() {
  const { id_asignacion: paramId } = useParams();
  const navigate = useNavigate();
  const [userAssignments, setUserAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(paramId || '');
  const [data, setData] = useState({ grado: '', seccion: '', anio: '', cursos: [], students: [], tasks: [], deliveries: {} });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [sendingCui, setSendingCui] = useState(null);
  
  const role = auth.getRole();
  const isCoordinatorView = role === 2;

  const fetchData = useCallback(async (assignmentId) => {
    if (!assignmentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/teachers/assignment-data/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch assignment data", error);
      alert('Error al cargar datos de la asignación.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const user = auth.getUser();
        let assignments = [];

        if (isCoordinatorView && paramId) {
          assignments = [{ id_asignacion: paramId, description: 'Vista Coordinador' }];
        } else if (user?.cui_docente) {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/teachers/${user.cui_docente}/assignments`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          assignments = res.data || [];
        }

        setUserAssignments(assignments);

        if (paramId) {
          setSelectedAssignmentId(paramId);
          await fetchData(paramId);
        } else if (assignments.length > 0) {
          const firstId = String(assignments[0].id_asignacion);
          setSelectedAssignmentId(firstId);
          await fetchData(firstId);
        } else {
          // sin asignaciones: no dispares más llamadas ni muestres errores
          setSelectedAssignmentId('');
          setData({ grado: '', seccion: '', anio: '', cursos: [], students: [], tasks: [], deliveries: {} });
          setLoading(false);
        }
      } catch (err) {
        // Si el backend responde 404, lo tratamos como "sin asignaciones"
        if (err?.response?.status === 404) {
          setUserAssignments([]);
          setSelectedAssignmentId('');
          setData({ grado: '', seccion: '', anio: '', cursos: [], students: [], tasks: [], deliveries: {} });
          setLoading(false);
        } else {
          console.error(err);
          alert('No fue posible cargar tus asignaciones.');
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [paramId, isCoordinatorView, fetchData]);


  const handleAssignmentChange = (e) => {
    const newId = e.target.value;
    setSelectedAssignmentId(newId);
    if(newId) fetchData(newId);
    else setData({ grado: '', seccion: '', anio: '', cursos: [], students: [], tasks: [], deliveries: {} });
  };

  const handleCheckChange = async (cui_estudiante, id_tarea) => {
    const entregado = !data.deliveries[cui_estudiante]?.[id_tarea];
    setData(prev => ({
      ...prev,
      deliveries: {
        ...prev.deliveries,
        [cui_estudiante]: { ...(prev.deliveries[cui_estudiante] || {}), [id_tarea]: entregado }
      }
    }));

    try {
      const token = localStorage.getItem('accessToken');
      const payload = { cui_estudiante, id_tarea, entregado };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/teachers/deliveries`, 
        { deliveries: [payload] }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      alert('Error al guardar, por favor intente de nuevo.');
      fetchData(selectedAssignmentId);
    }
  };

  const handleSendReminders = async (studentCUIs) => {
    if (sendingCui && studentCUIs.length === 1) return;
    if (studentCUIs.length === 1) setSendingCui(studentCUIs[0]);

    try {
        const token = localStorage.getItem('accessToken');
        const payload = {
            studentCUIs: studentCUIs,
            assignmentId: selectedAssignmentId
        };
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications/homework-reminder`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.msg);
    } catch (error) {
        alert("Error al enviar recordatorios.");
    } finally {
        if (studentCUIs.length === 1) setSendingCui(null);
    }
  };
  
  const handleTaskDelete = async (taskId) => {
    if (window.confirm("¿Seguro que quieres eliminar esta tarea? Se borrarán también las entregas asociadas.")) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/teachers/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData(selectedAssignmentId);
      } catch (error) {
        alert('Error al eliminar la tarea.');
      }
    }
  };

  const { students, tasks, deliveries } = data;
  const backPath = isCoordinatorView ? '/coordinator/dashboard' : '/panel';
  
  const sortedTasks = useMemo(() => [...tasks].sort((a,b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega)), [tasks]);

  return (
    <div className="tdb-page">
      {isModalOpen && (
        <TaskModal 
            assignmentId={selectedAssignmentId} 
            courses={data.cursos} 
            taskToEdit={taskToEdit} 
            onClose={() => { setIsModalOpen(false); setTaskToEdit(null); }} 
            onSave={() => { 
                setIsModalOpen(false); 
                setTaskToEdit(null); 
                fetchData(selectedAssignmentId); 
            }} 
        />
      )}
        <div className="tdb-container">
            <header className="tdb-header">
                <h1>Panel del Docente</h1>
                <button className="tdb-back-btn" onClick={() => navigate(backPath)}>Volver</button>
            </header>
        
        {!isCoordinatorView && (
          <div className="tdb-assignment-selector">
            <label htmlFor="assignment-select">Mis Asignaciones:</label>
            <select id="assignment-select" value={selectedAssignmentId} onChange={handleAssignmentChange}>
              <option value="">-- Seleccione una --</option>
              {userAssignments.map(a => <option key={a.id_asignacion} value={a.id_asignacion}>{a.description}</option>)}
            </select>
          </div>
        )}

        {selectedAssignmentId && (
          <div className="tdb-content">
            <div className="tdb-info-header">
              <h2>{data.grado} {data.seccion} ({data.anio})</h2>
              {!isCoordinatorView && <button className="tdb-add-task-btn" onClick={() => setIsModalOpen(true)}>+ Nueva Tarea</button>}
            </div>
            {loading ? <p>Cargando datos...</p> : (
              <div className="tdb-table-container">
                <table className="tdb-table">
                  <thead>
                    <tr>
                      <th className="student-name-header">Estudiante</th>
                      {sortedTasks.map((t) => (
                        <th key={t.id_tarea} className="task-header">
                          <div className="task-title">{t.titulo} <span className="task-course">({t.nombre_curso})</span></div>
                          <div className="task-date">{new Date(t.fecha_entrega).toLocaleDateString()}</div>
                          {!isCoordinatorView && (
                            <div className="task-actions">
                              <button onClick={() => { setTaskToEdit(t); setIsModalOpen(true); }}>✏️</button>
                              <button onClick={() => handleTaskDelete(t.id_tarea)}>🗑️</button>
                            </div>
                          )}
                        </th>
                      ))}
                      <th className="tdb-action-header">
                        {!isCoordinatorView && (
                           <button className="tdb-btn-icon" onClick={() => handleSendReminders(students.map(s => s.cui_estudiante))} title="Enviar recordatorio a todos">💬 Todos</button>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.cui_estudiante}>
                        <td className="student-name"><span>{s.apellidos}, {s.nombres}</span></td>
                        {sortedTasks.map((t) => (
                          <td key={`${s.cui_estudiante}-${t.id_tarea}`} className="task-check">
                            <input className="tdb-checkbox" type="checkbox" checked={!!deliveries[s.cui_estudiante]?.[t.id_tarea]} onChange={() => handleCheckChange(s.cui_estudiante, t.id_tarea)} disabled={isCoordinatorView} />
                          </td>
                        ))}
                        <td className="tdb-action-cell">
                          {!isCoordinatorView && (
                            <button 
                              className="tdb-btn-icon" 
                              onClick={() => handleSendReminders([s.cui_estudiante])}
                              disabled={sendingCui === s.cui_estudiante}
                              title="Enviar reporte de tareas pendientes"
                            >
                              {sendingCui === s.cui_estudiante ? '⏳' : '💬'}
                            </button>
                          )}
                        </td>
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