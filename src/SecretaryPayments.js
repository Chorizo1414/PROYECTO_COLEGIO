import { auth } from './auth';
import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./css/SecretaryPayments.css";

export default function SecretaryPayments() {
  const navigate = useNavigate();
  const role = auth.getRole();
  const backPath = role === 2 ? '/coordinator/dashboard' : '/secretary/dashboard';
  const isSecretary = role === 1;

  const [students, setStudents] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingCUI, setSendingCUI] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [grade, setGrade] = useState("Todos los grados");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

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
  
  const openEditor = (student) => {
    setEditing(student.cui_estudiante);
    setMessage(`Estimado padre de familia de ${student.nombre_completo}, le recordamos que el pago está pendiente.`);
  };
  const closeEditor = () => setEditing(null);
  const saveMessage = () => {
    console.log("Guardando mensaje para CUI", editing, ":", message);
    closeEditor();
  };
  
  const sendPaymentReminder = async (student) => {
    if (!window.confirm(`¿Enviar recordatorio de pago por WhatsApp al encargado de ${student.nombre_completo}?`)) return;

    setSendingCUI(student.cui_estudiante); // Bloquear botón y mostrar "Enviando..."
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:4000/api/notifications/payment-reminder', 
        { cui_estudiante: student.cui_estudiante },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert(response.data.msg); // <-- Esta alerta te dirá "Mensaje enviado..."
    } catch (err) {
      const errorMessage = err.response?.data?.msg || "No se pudo enviar el mensaje.";
      alert('Error: ' + errorMessage); // <-- O esta si hay un error
    } finally {
      setSendingCUI(null); // Desbloquear botón
    }
  };
  
  if (loading) return <div className="sp-page">Cargando alumnos...</div>;
  if (error) return <div className="sp-page" style={{color: 'red'}}>{error}</div>;

  return (
    <div className="sp-page">
      <div className="sp-container">
        <header className="sp-header">
          <h1>Panel de Pagos</h1>
          <p>Gestión de solvencia de estudiantes</p>
        </header>
        
        <button onClick={() => navigate(backPath)} className="sp-btn-volver">
          ⬅ Volver al Panel
        </button>
      
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
                
                {isSecretary && (
                  <div className="sp-actions">
                    <button 
                      className="sp-chip sp-chipGreen"
                      onClick={() => sendPaymentReminder(s)}
                      disabled={s.estado_pago !== 'PENDIENTE' || sendingCUI === s.cui_estudiante}
                    >
                      {sendingCUI === s.cui_estudiante ? 'Enviando...' : '📱 Recordar Pago'}
                    </button>
                    <button 
                      className="sp-chip sp-chipBlue" 
                      onClick={() => markAsSolvent(s.cui_estudiante)}
                      disabled={s.estado_pago !== 'PENDIENTE'}
                    >
                      ✅ Marcar solvente
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
        
        {editing && (
          <div className="sp-modalMask">
              <div className="sp-modal">
                  <div className="sp-modalHead">
                    <h3>Editar Mensaje para <span>{students.find(s => s.cui_estudiante === editing)?.nombre_completo}</span></h3>
                    <button onClick={closeEditor} className="sp-close">✕</button>
                  </div>
                  <textarea 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      rows="5"
                      className="sp-textarea"
                  />
                  <div className="sp-modalActions">
                      <button onClick={closeEditor} className="sp-btn sp-btnGhost">Cancelar</button>
                      <button onClick={saveMessage} className="sp-btn sp-btnPrimary">Guardar y Enviar</button>
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}