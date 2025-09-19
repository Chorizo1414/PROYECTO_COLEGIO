import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/AlumnosDashboard.css'; // Crearemos este CSS

export default function AlumnosDashboard() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  
  const fetchAlumnos = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('http://localhost:4000/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlumnos(res.data);
    } catch (err) {
      setError('No se pudieron cargar los alumnos.');
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleDeactivate = async (cui, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas dar de baja a ${nombre}?`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.put(`http://localhost:4000/api/students/deactivate/${cui}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchAlumnos(); // Recargar la lista para ver el cambio
        alert('Estudiante dado de baja con éxito.');
      } catch (error) {
        alert('Error al dar de baja al estudiante.');
      }
    }
  };

  const handleActivate = async (cui, nombre) => {
  if (window.confirm(`¿Estás seguro de que deseas reactivar a ${nombre}?`)) {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`http://localhost:4000/api/students/activate/${cui}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAlumnos(); // Recargar la lista
      alert('Estudiante reactivado con éxito.');
    } catch (error) {
      alert('Error al reactivar al estudiante.');
    }
  }
};

  if (loading) return <div className="ad-page"><div>Cargando alumnos...</div></div>;
  if (error) return <div className="ad-page"><div className="ad-error">{error}</div></div>;

  return (
    <div className="ad-page">
      <div className="ad-container">
        <header className="ad-header">
          <h1>Gestión de Alumnos</h1>
          <p>Administra a los estudiantes inscritos</p>
        </header>

        <div className="ad-actions-bar">
          <button className="ad-btn ad-btn--secondary" onClick={() => navigate('/coordinator/dashboard')}>
            ⬅ Volver al Panel
          </button>
          <button className="ad-btn ad-btn--primary" onClick={() => navigate('/alumnos/registro')}>
            + Inscribir Nuevo Alumno
          </button>
        </div>

        <main className="ad-grid">
          {alumnos.map((alumno) => (
            <article key={alumno.cui_estudiante} className="ad-card">
              <div className="ad-card-info">
                <h3 className="ad-student-name">{alumno.nombre_completo}</h3>
                <p className="ad-details">
                  <strong>CUI:</strong> {alumno.cui_estudiante} <br />
                  <strong>Grado:</strong> {alumno.nombre_grado || 'No asignado'} <br />
                  <strong>Encargado:</strong> {alumno.nombre_padre || 'No asignado'}
                </p>
              </div>
              <div className={`ad-badge ${alumno.estado_id === 1 ? 'active' : 'inactive'}`}>
                {alumno.estado_id === 1 ? 'Activo' : 'Inactivo'}
              </div>
              <div className="ad-card-actions">
                <button className="ad-chip ad-chip-edit" onClick={() => navigate(`/alumnos/editar/${alumno.cui_estudiante}`)}>✏️ Modificar</button>

                {/* LÓGICA DE BOTÓN DINÁMICO */}
                  {alumno.estado_id === 1 ? (
                  <button 
                    className="ad-chip ad-chip-delete"
                    onClick={() => handleDeactivate(alumno.cui_estudiante, alumno.nombre_completo)}
                  >
                    🗑️ Dar de Baja
                  </button>
                ) : (
                  <button 
                    className="ad-chip ad-chip-activate"
                    onClick={() => handleActivate(alumno.cui_estudiante, alumno.nombre_completo)}
                  >
                    ⬆️ Dar de Alta
                  </button>
                )}
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}