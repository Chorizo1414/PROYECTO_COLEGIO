import { auth } from './auth';
import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./css/SecretaryPayments.css";

// --- NUEVO: Componente para el Modal de Edición de Mensajes ---
const MessageEditorModal = ({ student, onClose, onSend }) => {
    const defaultMessage = `Estimado/a ${student.nombre_padre}, le saludamos del Colegio "El Jardín". Le recordamos amablemente que el pago de la colegiatura para el/la estudiante ${student.nombre_completo} se encuentra pendiente. ¡Gracias!`;
    const [message, setMessage] = useState(defaultMessage);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        setIsSending(true);
        await onSend(message); // Llama a la función que realmente envía el mensaje
        setIsSending(false);
        onClose(); // Cierra el modal después de enviar
    };

    return (
        <div className="sp-modalMask">
            <div className="sp-modal">
                <div className="sp-modalHead">
                    <h3>Editar Mensaje para <span>{student.nombre_completo}</span></h3>
                    <button onClick={onClose} className="sp-close">✕</button>
                </div>
                <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    className="sp-textarea"
                />
                <div className="sp-modalActions">
                    <button onClick={onClose} className="sp-btn sp-btnGhost">Cancelar</button>
                    <button onClick={handleSend} className="sp-btn sp-btnPrimary" disabled={isSending}>
                        {isSending ? 'Enviando...' : 'Guardar y Enviar'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal ---
export default function SecretaryPayments() {
  const navigate = useNavigate();
  const role = auth.getRole();
  const backPath = role === 2 ? '/coordinator/dashboard' : '/secretary/dashboard';
  const isSecretary = role === 1;

  const [students, setStudents] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [grade, setGrade] = useState("Todos los grados");
  const [query, setQuery] = useState("");
  
  // Estados para envíos de WhatsApp
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    const token = auth.isLogged() ? localStorage.getItem('accessToken') : null;
    if (!token) {
      alert("Sesión no válida. Por favor, inicie sesión de nuevo.");
      return navigate('/login');
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsResponse, gradesResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/students/details', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://localhost:4000/api/grades', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        setStudents(studentsResponse.data);
        setGrados(gradesResponse.data);
      } catch (err) {
        setError('Error al cargar los datos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, refreshKey]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const byGrade = grade === "Todos los grados" ? true : s.nombre_grado === grade;
      const byQuery = s.nombre_completo.toLowerCase().includes(query.trim().toLowerCase());
      return byGrade && byQuery;
    });
  }, [students, grade, query]);

  const studentsWithDebt = useMemo(() => {
    return students.filter((s) => s.estado_pago === "PENDIENTE");
  }, [students]);

  const totals = useMemo(() => {
    const total = students.length;
    const pendientes = students.filter((s) => s.estado_pago === "PENDIENTE").length;
    const alDia = total - pendientes;
    return { total, pendientes, alDia };
  }, [students]);

  const markAsSolvent = async (cui_estudiante) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!window.confirm(`¿Deseas marcar como solvente al alumno para el período ${currentMonth}?`)) {
      return;
    }
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post('http://localhost:4000/api/students/financial-status', 
        { cui_estudiante, periodo: currentMonth },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('¡Alumno marcado como solvente!');
      setRefreshKey(oldKey => oldKey + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message;
      alert('Error al actualizar: ' + errorMessage);
    }
  };
  
  // --- LÓGICA DE ENVÍO DE MENSAJES ---
  const handleSendReminders = async ({ studentCUIs, customMessage = null }) => {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await axios.post('http://localhost:4000/api/notifications/payment-reminder', 
            { studentCUIs, customMessage },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        alert(response.data.msg);
    } catch (err) {
        const errorMessage = err.response?.data?.msg || "No se pudo enviar el/los mensaje(s).";
        alert('Error: ' + errorMessage);
    }
  };

  const handleSendAll = async () => {
    if (studentsWithDebt.length === 0) {
        return alert("No hay estudiantes con pagos pendientes.");
    }
    if (!window.confirm(`Se enviará un recordatorio a ${studentsWithDebt.length} encargado(s). ¿Continuar?`)) return;

    setIsSendingAll(true);
    await handleSendReminders({ studentCUIs: studentsWithDebt.map(s => s.cui_estudiante) });
    setIsSendingAll(false);
  };

  const handleSendCustom = async (message) => {
    if (!editingStudent) return;
    await handleSendReminders({ studentCUIs: [editingStudent.cui_estudiante], customMessage: message });
  };
  
  if (loading) return <div className="sp-page">Cargando alumnos...</div>;
  if (error) return <div className="sp-page" style={{color: 'red'}}>{error}</div>;

  return (
    <div className="sp-page">
      <div className="sp-container">
        {editingStudent && <MessageEditorModal student={editingStudent} onClose={() => setEditingStudent(null)} onSend={handleSendCustom} />}
        
        <header className="sp-header">
          <h1>Panel de Pagos</h1>
          <p>Gestión de solvencia de estudiantes</p>
        </header>
        
        <button onClick={() => navigate(backPath)} className="sp-btn-volver">
          ⬅ Volver al Panel
        </button>

        {isSecretary && (
            <div className="sp-bulk-actions">
                <button className="sp-btn sp-btnPrimary" onClick={handleSendAll} disabled={isSendingAll || studentsWithDebt.length === 0}>
                    {isSendingAll ? 'Enviando...' : `📱 Notificar a ${studentsWithDebt.length} Pendientes`}
                </button>
            </div>
        )}
      
        <section className="sp-stats">
          <h2 className="sp-statsTitle">Resumen de Pagos</h2>
          <div className="sp-statsGrid">
            <article className="sp-stat sp-borde-azul">
              <div className="sp-statNumber">{totals.total}</div>
              <div className="sp-statLabel">Total de Estudiantes</div>
            </article>
            <article className="sp-stat sp-borde-rojo">
              <div className="sp-statNumber">{totals.pendientes}</div>
              <div className="sp-statLabel">Pagos Pendientes</div>
            </article>
            <article className="sp-stat sp-borde-verde">
              <div className="sp-statNumber">{totals.alDia}</div>
              <div className="sp-statLabel">Al Día</div>
            </article>
          </div>
        </section>

        <section className="sp-controls">
          <div className="sp-controlsHeader">
              <h2 className="sp-sectionTitle">Control de Estudiantes</h2>
              <div className="sp-filters">
                  <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                      <option value="Todos los grados">Todos los grados</option>
                      {grados.map(g => <option key={g.id_grado} value={g.nombre_grado}>{g.nombre_grado}</option>)}
                  </select>
                  <input 
                      type="search" 
                      placeholder="Buscar por nombre..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                  />
              </div>
          </div>
          
          <div className="sp-grid">
            {filtered.map((s) => (
              <article key={s.cui_estudiante} className="sp-card">
                <div className="sp-cardTop">
                  <div className="sp-cardInfo">
                    <h3 className="sp-studentName">{s.nombre_completo}</h3>
                    <p className="sp-details">
                      <strong>CUI:</strong> {s.cui_estudiante}
                      <br />
                      <strong>Padre:</strong> {s.nombre_padre || 'No asignado'}
                      <br />
                      <strong>Teléfono:</strong> {s.telefono || 'No asignado'}
                    </p>
                  </div>
                  <div className={`sp-badge ${s.estado_pago === "PENDIENTE" ? "pendiente" : "aldia"}`}>
                    {s.estado_pago === "PENDIENTE" ? "Pago pendiente" : "Al día"}
                  </div>
                </div>
                
                {isSecretary && s.estado_pago === 'PENDIENTE' && (
                  <div className="sp-actions">
                    <button className="sp-chip sp-chipYellow" onClick={() => setEditingStudent(s)}>
                      ✏️ Editar y Enviar
                    </button>
                    <button 
                      className="sp-chip sp-chipBlue" 
                      onClick={() => markAsSolvent(s.cui_estudiante)}
                    >
                      ✅ Marcar solvente
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}