import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/GestionCursos.css'; // Crearemos este archivo a continuación

const GestionCursos = () => {
  const navigate = useNavigate();
  // Estados para datos
  const [cursos, setCursos] = useState([]);
  const [grados, setGrados] = useState([]);
  
  // Estados del formulario
  const [form, setForm] = useState({
    nombre_curso: '',
    descripcion_curso: '',
    id_grado: '', // Vacío para "Curso General"
  });

  const [loading, setLoading] = useState(true);

  // Carga inicial de datos
  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      setLoading(true);
      const [cursosRes, gradosRes] = await Promise.all([
        axios.get('http://localhost:4000/api/cursos', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:4000/api/grades', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setCursos(cursosRes.data);
      setGrados(gradosRes.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      await axios.post('http://localhost:4000/api/cursos', form, { headers: { Authorization: `Bearer ${token}` } });
      alert('Curso creado con éxito');
      setForm({ nombre_curso: '', descripcion_curso: '', id_grado: '' }); // Limpiar formulario
      fetchData(); // Recargar la lista
    } catch (error) {
      alert('Error al crear el curso: ' + (error.response?.data?.msg || 'Error inesperado'));
    }
  };
  
  const handleDelete = async (id) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar este curso? No se podrá eliminar si ya está asignado a un docente.')) {
          const token = localStorage.getItem('accessToken');
          try {
              await axios.delete(`http://localhost:4000/api/cursos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
              fetchData(); // Recargar la lista
              alert('Curso eliminado.');
          } catch (error) {
              alert('Error al eliminar: ' + (error.response?.data?.msg || 'Error inesperado'));
          }
      }
  };

  if (loading) return <div className="gc-page">Cargando...</div>;

  return (
    <div className="gc-page">
      <div className="gc-container">
        <header className="gc-header">
          <h1>Gestión de Cursos</h1>
          <p>Crea, visualiza y elimina las materias del pénsum académico.</p>
        </header>

        <button className="gc-btn-volver" onClick={() => navigate('/coordinator/dashboard')}>
          ⬅ Volver al Panel de Coordinación
        </button>
        
        <div className="gc-grid">
          <div className="gc-card">
            <h2>Crear Nuevo Curso</h2>
            <form onSubmit={handleSubmit} className="gc-form">
              <input type="text" name="nombre_curso" value={form.nombre_curso} onChange={handleChange} placeholder="Nombre del Curso (ej. Matemática I)" required />
              <textarea name="descripcion_curso" value={form.descripcion_curso} onChange={handleChange} placeholder="Descripción breve del curso" required rows="3"></textarea>
              <select name="id_grado" value={form.id_grado} onChange={handleChange}>
                <option value="">Curso General (sin grado específico)</option>
                {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>)}
              </select>
              <button type="submit" className="gc-btn gc-btn--primary">Crear Curso</button>
            </form>
          </div>
          
          <div className="gc-card">
            <h2>Cursos Existentes</h2>
            <div className="gc-list">
              {cursos.map(c => (
                <div key={c.id_curso} className="gc-list-item">
                  <div>
                    <strong className="gc-curso-nombre">{c.nombre_curso}</strong>
                    <span className="gc-detalle">{c.descripcion_curso}</span>
                    <span className="gc-grado">{c.nombre_grado || 'General'}</span>
                  </div>
                  <button className="gc-delete-btn" onClick={() => handleDelete(c.id_curso)}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionCursos;