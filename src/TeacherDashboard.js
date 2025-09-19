import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "./auth";

// --- Estilos CSS (embebidos para evitar problemas de importación) ---
const TeacherDashboardStyles = () => (
  <style>{`
    :root{
      --azul:#014BA0; --madera:#783714; --amarillo:#F7D547; --rojo:#FF3936;
      --verde:#008311; --blanco:#FFFFFF; --grisC:#E0E0E0; --gris:#333333;
      --bg:#f1f5f9; --ink:#0F172A; --muted:#64748B;
    }
    *{ box-sizing:border-box; }
    .tdb-page{ background:#f8fafc; min-height:100vh; font-family: sans-serif; }
    .tdb-header{
      background: linear-gradient(135deg, var(--azul) 0%, var(--verde) 100%);
      color:var(--blanco); padding:24px 20px 0; position:sticky; top:0; z-index:10;
      box-shadow: 0 8px 20px rgba(0,0,0,.06);
    }
    .tdb-header-inner{ display:flex; align-items:center; gap:14px; margin:0 auto; max-width:1200px; }
    .tdb-logo{ height:60px; width: 60px; object-fit:contain;flex-shrink: 0; background: white; border-radius: 50%; padding: 5px; }
    .tdb-titleBlock h1{ margin:0; font-size:20px; letter-spacing:.5px; }
    .tdb-titleBlock p{ margin:2px 0 0; opacity:.9; }
    .tdb-headActions{ max-width:1200px; margin:12px auto 10px; display:flex; gap:8px; flex-wrap:wrap; }
    .tdb-btn{
      border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer;
      background:#e5e7eb; color:#111827; transition: all 0.2s ease;
    }
    .tdb-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }
    .tdb-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }
    .tdb-btn--primary{ background:#0ea5e9; color:white; }
    .tdb-btn--secondary{ background:#334155; color:white; }
    .tdb-btn--ghost{ background:rgba(255,255,255,.2); color:white; border:1px solid rgba(255,255,255,.35); }
    .tdb-btn--success{ background:#16a34a; color:white; }
    .tdb-main{ max-width:1200px; margin:18px auto; padding:0 16px 32px; }
    .tdb-section{ display:grid; gap:14px; }
    .tdb-card{
      background:white; border-radius:16px; padding:16px; box-shadow:0 3px 12px rgba(2,6,23,.06);
      border:2px solid #e5e7eb;
    }
    .tdb-card--flat{ box-shadow:none; border:2px dashed #e5e7eb; }
    .tdb-cardTitle{ font-weight:800; color:var(--ink); margin-bottom:8px; }
    .tdb-select, .tdb-input, .tdb-textarea{
      width:100%; border:2px solid #e5e7eb; border-radius:10px; padding:10px 12px; font-size:14px;
    }
    .tdb-input:focus, .tdb-select:focus, .tdb-textarea:focus{ outline:none; border-color:#60a5fa; box-shadow:0 0 0 3px rgba(96,165,250,.2); }
    .tdb-followToolbar{ display:grid; grid-template-columns: 1fr; gap:12px; align-items:end; margin-bottom:12px; }
    .tdb-followGroup{ display:grid; gap:6px; }
    .tdb-label{ font-size:12px; color:#334155; font-weight:700; }
    .tdb-trackWrap{ overflow:auto; border:2px solid #e5e7eb; border-radius:12px; }
    .tdb-matrix{ width:max-content; min-width:100%; border-collapse:separate; border-spacing:0; }
    .tdb-matrix th, .tdb-matrix td{
      background:white; border-bottom:1px solid #e5e7eb; padding:10px 12px; vertical-align:middle;
      white-space: nowrap;
    }
    .tdb-matrix thead th{ position:sticky; top:0; background:#f8fafc; z-index:1; }
    .sticky-left{ position:sticky; left:0; background:#f8fafc !important; z-index:2; }
    td.sticky-left { background: white !important; }
    tr:hover td.sticky-left { background: #f9fafb !important; }
    .td-center{ text-align:center; }
    .th-col{ display:grid; gap:6px; min-width:180px; }
    .th-title{ font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 180px; }
    .chk{ width:18px; height:18px; }
    .tdb-actionsRow{ display:flex; gap:10px; justify-content:flex-end; margin-top:10px; }
    .tdb-modal{
      position:fixed; inset:0; background:rgba(2,6,23,.45);
      display:flex; align-items:center; justify-content:center; padding:16px; z-index:50;
    }
    .tdb-modalCard{
      background:white; width:min(520px, 96vw); max-height:90vh;
      border-radius:18px; border:2px solid #e5e7eb; box-shadow:0 10px 50px rgba(2,6,23,.3);
      display:flex; flex-direction:column;
    }
    .tdb-modalHeader{
      display:flex; align-items:center; justify-content:space-between; gap:10px;
      padding:14px 16px; border-bottom:2px solid #e5e7eb; background:#f8fafc; border-top-left-radius:18px; border-top-right-radius:18px;
    }
    .tdb-x{ border:none; background:#e5e7eb; border-radius:10px; padding:6px 10px; cursor:pointer; font-weight:800; }
    .tdb-form{ display:grid; gap:14px; padding:16px; }
    .tdb-formCol{ display:grid; gap:6px; }
    .tdb-modalActions{
      display:flex; justify-content:flex-end; gap:10px;
      padding:10px 16px 16px; border-top:2px solid #e5e7eb; background:#fff; border-bottom-left-radius:18px; border-bottom-right-radius:18px;
    }
  `}</style>
);

const Loader = ({ text = "Cargando..." }) => (
  <div className="tdb-card tdb-card--flat" style={{ textAlign: "center", padding: "40px" }}>
    <div style={{ marginBottom: "12px" }}>{text}</div>
    <div style={{
      border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%',
      width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto'
    }}></div>
  </div>
);

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
                        <button type="submit" className="tdb-btn tdb-btn--success">Guardar Tarea</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [currentAssignmentId, setCurrentAssignmentId] = useState("");
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState({ assignments: true, data: false });
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const logoUrl = "https://i.imgur.com/xCE6PxC.png";

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("http://localhost:4000/api/teachers/assignments", { headers: { Authorization: `Bearer ${token}` } });
        setAssignments(res.data);
        if (res.data.length > 0) setCurrentAssignmentId(res.data[0].id_asignacion);
      } catch (err) {
        console.error("Error fetching assignments", err);
        setError("No se pudieron cargar las asignaciones del docente.");
      } finally {
        setLoading(p => ({ ...p, assignments: false }));
      }
    };
    fetchAssignments();
  }, []);

  const fetchAssignmentData = useCallback(async () => {
    if (!currentAssignmentId) return;
    setLoading(p => ({ ...p, data: true }));
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`http://localhost:4000/api/teachers/assignment-data/${currentAssignmentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.data.students);
      setTasks(res.data.tasks);
      setDeliveries(res.data.deliveries || {});
    } catch (err) {
      console.error(`Error fetching data for assignment ${currentAssignmentId}`, err);
      setError("No se pudieron cargar los datos de la asignación.");
    } finally {
      setLoading(p => ({ ...p, data: false }));
    }
  }, [currentAssignmentId]);
  
  useEffect(() => { fetchAssignmentData(); }, [fetchAssignmentData]);

  const handleCheckChange = (studentId, taskId) => {
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
  }

  const currentAssignment = assignments.find(a => a.id_asignacion === Number(currentAssignmentId));

  return (
    <div className="tdb-page">
      <TeacherDashboardStyles />
      {showTaskModal && <TaskModal assignmentId={currentAssignmentId} onClose={() => setShowTaskModal(false)} onSave={handleTaskSaved} />}
      
      <header className="tdb-header">
        <div className="tdb-header-inner">
          <img src={logoUrl} alt="Colegio Mixto El Jardín" className="tdb-logo" />
          <div className="tdb-titleBlock">
            <h1>COLEGIO MIXTO EL JARDÍN</h1>
            <p>San Raymundo — Panel Docente</p>
          </div>
        </div>
        <div className="tdb-headActions">
           <button className="tdb-btn tdb-btn--secondary" onClick={() => navigate("/panel")}>⬅ Volver</button>
           <button className="tdb-btn tdb-btn--ghost" onClick={() => setShowTaskModal(true)} disabled={!currentAssignmentId}>+ Nueva tarea</button>
        </div>
      </header>
      
      <main className="tdb-main">
        {loading.assignments ? <Loader text="Cargando asignaciones..." /> : error ? (
           <div className="tdb-card tdb-card--flat" style={{color: 'red'}}>{error}</div>
        ) : (
          <section className="tdb-section">
            <div className="tdb-card">
              <div className="tdb-cardTitle">
                Seguimiento de tareas — <strong>{currentAssignment ? `${currentAssignment.nombre_grado} ${currentAssignment.nombre_seccion}` : 'Ninguna'}</strong>
              </div>
              <div className="tdb-followToolbar">
                <div className="tdb-followGroup">
                  <label className="tdb-label">Curso Asignado</label>
                  <select className="tdb-select" value={currentAssignmentId} onChange={(e) => setCurrentAssignmentId(e.target.value)} disabled={assignments.length === 0}>
                    {assignments.length === 0 ? <option>No tienes cursos asignados</option> : assignments.map((a) => (
                      <option key={a.id_asignacion} value={a.id_asignacion}>{a.nombre_grado} - {a.nombre_seccion} ({a.nombre_curso})</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading.data ? <Loader text="Cargando alumnos y tareas..."/> : (
                <>
                  <div className="tdb-trackWrap">
                    <table className="tdb-matrix">
                      <thead>
                        <tr>
                          <th className="sticky-left">Alumno</th>
                          {tasks.map((t) => (
                            <th key={t.id_tarea}>
                              <div className="th-col">
                                <span className="th-title" title={t.titulo}>{t.titulo}</span>
                                <small>{new Date(t.fecha_entrega).toLocaleDateString()}</small>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.cui_estudiante}>
                            <td className="sticky-left"><span>{s.apellidos}, {s.nombres}</span></td>
                            {tasks.map((t) => (
                              <td key={`${s.cui_estudiante}-${t.id_tarea}`} className="td-center">
                                <input className="chk" type="checkbox" checked={!!deliveries[s.cui_estudiante]?.[t.id_tarea]} onChange={() => handleCheckChange(s.cui_estudiante, t.id_tarea)} aria-label={`${s.nombres} completó ${t.titulo}`} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="tdb-actionsRow">
                    <button className="tdb-btn tdb-btn--primary" onClick={handleSaveDeliveries}>Guardar cambios</button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}