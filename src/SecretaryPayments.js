import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./css/SecretaryPayments.css";
import logoColegio from "./assets/logo-colegio.png";
import { auth } from './auth'; // Importamos auth para obtener el token

// Constantes para los filtros que ya tenías
const GRADES = [
  "Todos los grados", "Primero Primaria", "Segundo Primaria", "Tercero Primaria", 
  "Cuarto Primaria", "Quinto Primaria", "Sexto Primaria"
];
const MONTHS = [
  "Todos los meses", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre"
];

export default function SecretaryPayments() {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [students, setStudents] = useState([]); // Estado para guardar los alumnos de la API
  const [loading, setLoading] = useState(true); // Estado para mostrar un mensaje de carga
  const [error, setError] = useState(null);     // Estado para manejar errores de la API
  const [refreshKey, setRefreshKey] = useState(0);
  // Estados para los filtros y el modal (los que ya tenías)
  const [grade, setGrade] = useState("Todos los grados");
  const [month, setMonth] = useState("Todos los meses");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // Guarda el CUI del alumno que se está editando
  const [message, setMessage] = useState("");   // Guarda el texto del mensaje en el modal

  // --- EFECTO PARA CARGAR DATOS DE LA API ---
  useEffect(() => {
    const fetchStudents = async () => {
      const token = auth.isLogged() ? localStorage.getItem('accessToken') : null;
      if (!token) {
        alert("Sesión no válida. Por favor, inicie sesión de nuevo.");
        return navigate('/login');
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:4000/api/students/details', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStudents(response.data);
      } catch (err) {
        setError('Error al cargar alumnos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate, refreshKey]);// Se ejecuta solo una vez cuando el componente se monta

  // --- LÓGICA DE FILTRADO Y TOTALES ---
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

  // --- FUNCIONES DE ACCIÓN ---
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
      
      // En lugar de actualizar el estado local, cambiamos 'refresh' para
      // que el useEffect se vuelva a ejecutar y traiga los datos actualizados.
      setRefreshKey(oldKey => oldKey + 1);

    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message;
      alert('Error al actualizar: ' + errorMessage);
    }
  };

  // Funciones para el modal que ya tenías
  const openEditor = (student) => {
    setEditing(student.cui_estudiante);
    setMessage(`Estimado padre de familia de ${student.nombre_completo}, le recordamos que el pago está pendiente.`);
  };
  const closeEditor = () => setEditing(null);
  const saveMessage = () => {
    console.log("Guardando mensaje para CUI", editing, ":", message);
    closeEditor();
  };
  
  // --- RENDERIZADO ---
  if (loading) return <div className="sp-page">Cargando alumnos...</div>;
  if (error) return <div className="sp-page" style={{color: 'red'}}>{error}</div>;

  return (
    <div className="sp-page">
      <header className="sp-header">
        <button onClick={() => navigate('/panel-roles')} className="sp-back-button">
          ‹ Volver al Panel
        </button>
        <img src={logoColegio} alt="Colegio Mixto El Jardín" className="sp-logo" />
        <h1 className="sp-title">COLEGIO MIXTO EL JARDÍN</h1>
        <p className="sp-sub">San Raymundo</p>
        <p className="sp-desc">Sistema de Control de Pagos</p>
      </header>
      
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
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
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
              <div className="sp-actions">
                <button className="sp-chip sp-chipYellow" onClick={() => openEditor(s)}>
                  ✏️ Editar mensaje
                </button>
                <button className="sp-chip sp-chipGreen">
                  📱 WhatsApp
                </button>
                <button 
                  className="sp-chip sp-chipBlue" 
                  onClick={() => markAsSolvent(s.cui_estudiante)}
                  disabled={s.estado_pago !== 'PENDIENTE'}
                >
                  ✅ Marcar solvente
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      
      {editing && (
        <div className="sp-editor-overlay">
            <div className="sp-editor">
                <h2>Editar Mensaje</h2>
                <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                />
                <div className="sp-editor-actions">
                    <button onClick={saveMessage} className="sp-btn-save">Guardar</button>
                    <button onClick={closeEditor} className="sp-btn-cancel">Cancelar</button>
                </div>
            </div>
        </div>
      )}

      <footer className="sp-footer">
        <p>Colegio Mixto El Jardín © 2025</p>
      </footer>
    </div>
  );
}