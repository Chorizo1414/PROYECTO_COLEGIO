import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/AsignarCursos.css';

const AsignarCursos = () => {
  const navigate = useNavigate();
  // Estados para datos de la API
  const [docentes, setDocentes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  // Estados del formulario
  const [form, setForm] = useState({
    cui_docente: '',
    id_grado: '',
    id_seccion: '',
    id_curso: '',
    anio: new Date().getFullYear(),
  });

  const [loading, setLoading] = useState(true);

  // Carga inicial de datos
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const fetchData = async () => {
      try {
        const [docentesRes, gradosRes, asignacionesRes] = await Promise.all([
          axios.get('http://localhost:4000/api/teachers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:4000/api/grades', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:4000/api/asignaciones', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setDocentes(docentesRes.data.filter(d => d.estado_id === 1)); // Solo activos
        setGrados(gradosRes.data);
        setAsignaciones(asignacionesRes.data);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cargar secciones cuando cambia el grado
  useEffect(() => {
    if (form.id_grado) {
      const token = localStorage.getItem('accessToken');
      axios.get(`http://localhost:4000/api/grades/${form.id_grado}/sections`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setSecciones(res.data))
        .catch(err => console.error("Error al cargar secciones", err));
        
      axios.get(`http://localhost:4000/api/asignaciones/cursos/${form.id_grado}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCursos(res.data))
        .catch(err => console.error("Error al cargar cursos", err));
    }
  }, [form.id_grado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post('http://localhost:4000/api/asignaciones', form, { headers: { Authorization: `Bearer ${token}` } });
      alert('Asignación creada con éxito');
      // Recargar la lista de asignaciones
      const asignacionesRes = await axios.get('http://localhost:4000/api/asignaciones', { headers: { Authorization: `Bearer ${token}` } });
      setAsignaciones(asignacionesRes.data);
    } catch (error) {
      alert('Error al crear la asignación: ' + (error.response?.data?.msg || 'Error inesperado'));
    }
  };
  
  const handleDelete = async (id) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
          const token = localStorage.getItem('accessToken');
          try {
              await axios.delete(`http://localhost:4000/api/asignaciones/${id}`, { headers: { Authorization: `Bearer ${token}` } });
              setAsignaciones(asignaciones.filter(a => a.id_asignacion !== id));
              alert('Asignación eliminada.');
          } catch (error) {
              alert('Error al eliminar.');
          }
      }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="ac-page">
      <div className="ac-container">
        <header className="ac-header">
          <h1>Asignación de Cursos</h1>
          <p>Asigna grados, secciones y cursos a cada docente para el ciclo actual.</p>
        </header>

        <button className="ac-btn-volver" onClick={() => navigate('/coordinator/dashboard')}>
          ⬅ Volver al Panel de Coordinación
        </button>
        
        <div className="ac-grid">
          <div className="ac-card">
            <h2>Nueva Asignación</h2>
            <form onSubmit={handleSubmit} className="ac-form">
              <select name="cui_docente" value={form.cui_docente} onChange={handleChange} required>
                <option value="">-- Seleccione un Docente --</option>
                {docentes.map(d => <option key={d.cui_docente} value={d.cui_docente}>{d.nombre_completo}</option>)}
              </select>
              <select name="id_grado" value={form.id_grado} onChange={handleChange} required>
                <option value="">-- Seleccione un Grado --</option>
                {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>)}
              </select>
              <select name="id_seccion" value={form.id_seccion} onChange={handleChange} required disabled={!form.id_grado}>
                <option value="">-- Seleccione una Sección --</option>
                {secciones.map(s => <option key={s.id_seccion} value={s.id_seccion}>{s.nombre_seccion}</option>)}
              </select>
              <select name="id_curso" value={form.id_curso} onChange={handleChange} required disabled={!form.id_grado}>
                <option value="">-- Seleccione un Curso --</option>
                {cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
              </select>
              <input type="number" name="anio" value={form.anio} onChange={handleChange} required />
              <button type="submit" className="ac-btn ac-btn--primary">Asignar Curso</button>
            </form>
          </div>
          
          <div className="ac-card">
            <h2>Asignaciones Actuales</h2>
            <div className="ac-list">
              {asignaciones.map(a => (
                <div key={a.id_asignacion} className="ac-list-item">
                  <div>
                    <strong className="ac-docente">{a.docente}</strong>
                    <span className="ac-detalle">{a.grado} {a.seccion} - {a.curso} ({a.anio})</span>
                  </div>
                  <button className="ac-delete-btn" onClick={() => handleDelete(a.id_asignacion)}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsignarCursos;