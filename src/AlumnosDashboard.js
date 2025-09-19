import { auth } from './auth';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/AlumnosDashboard.css';

export default function AlumnosDashboard() {
  const [alumnos, setAlumnos] = useState([]);
  const [secciones, setSecciones] = useState([]); // <-- NUEVO: Estado para guardar todas las secciones
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const role = auth.getRole();
  const backPath = role === 2 ? '/coordinator/dashboard' : '/secretary/dashboard';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      // <-- CAMBIO: Hacemos dos peticiones al mismo tiempo
      const [alumnosRes, seccionesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/students', { headers }),
        axios.get('http://localhost:4000/api/grades/sections/all', { headers }) // <-- Petición a la nueva ruta
      ]);

      setAlumnos(alumnosRes.data);
      setSecciones(seccionesRes.data); // <-- Guardamos las secciones
    } catch (err) {
      setError('No se pudieron cargar los datos.');
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // <-- NUEVO: Función para manejar el cambio de sección
  const handleSectionChange = async (cui_estudiante, new_id_seccion) => {
    // Buscamos al alumno en el estado actual para tener todos sus datos
    const alumnoToUpdate = alumnos.find(a => a.cui_estudiante === cui_estudiante);
    if (!alumnoToUpdate) return;
    
    // Creamos el objeto con los datos actualizados
    const updatedData = { ...alumnoToUpdate, id_seccion: new_id_seccion };

    // Actualizamos el estado localmente para una respuesta visual inmediata
    setAlumnos(alumnos.map(a => a.cui_estudiante === cui_estudiante ? { ...a, id_seccion: new_id_seccion, nombre_seccion: secciones.find(s => s.id_seccion == new_id_seccion)?.nombre_seccion } : a));

    try {
      const token = localStorage.getItem('accessToken');
      // Usamos la ruta PUT que ya existe para actualizar estudiantes
      await axios.put(`http://localhost:4000/api/students/${cui_estudiante}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Opcional: mostrar un mensaje de éxito
    } catch (error) {
      alert('Error al guardar la sección.');
      // Si falla, revertimos el cambio en la UI
      fetchData();
    }
  };

  // El resto de las funciones (deactivate, activate) no cambian
  const handleDeactivate = async (cui, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas dar de baja a ${nombre}?`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.put(`http://localhost:4000/api/students/deactivate/${cui}`, {}, { headers: { Authorization: `Bearer ${token}` }});
        fetchData();
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
        await axios.put(`http://localhost:4000/api/students/activate/${cui}`, {}, { headers: { Authorization: `Bearer ${token}` }});
        fetchData();
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
          <button className="ad-btn ad-btn--secondary" onClick={() => navigate(backPath)}>
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

                {/* <-- NUEVO: Selector de sección --> */}
                <div className="ad-section-selector">
                  <label htmlFor={`seccion-${alumno.cui_estudiante}`}>Sección:</label>
                  <select
                    id={`seccion-${alumno.cui_estudiante}`}
                    value={alumno.id_seccion || ''}
                    onChange={(e) => handleSectionChange(alumno.cui_estudiante, e.target.value)}
                    disabled={!alumno.id_grado} // Se deshabilita si no tiene grado
                  >
                    <option value="">-- Asignar --</option>
                    {/* Filtramos las secciones que corresponden al grado del alumno */}
                    {secciones
                      .filter(s => s.id_grado === alumno.id_grado)
                      .map(s => (
                        <option key={s.id_seccion} value={s.id_seccion}>{s.nombre_seccion}</option>
                      ))
                    }
                  </select>
                </div>

              </div>
              <div className={`ad-badge ${alumno.estado_id === 1 ? 'active' : 'inactive'}`}>
                {alumno.estado_id === 1 ? 'Activo' : 'Inactivo'}
              </div>
              <div className="ad-card-actions">
                <button className="ad-chip ad-chip-edit" onClick={() => navigate(`/alumnos/editar/${alumno.cui_estudiante}`)}>✏️ Modificar</button>
                {alumno.estado_id === 1 ? (
                  <button className="ad-chip ad-chip-delete" onClick={() => handleDeactivate(alumno.cui_estudiante, alumno.nombre_completo)}>
                    🗑️ Dar de Baja
                  </button>
                ) : (
                  <button className="ad-chip ad-chip-activate" onClick={() => handleActivate(alumno.cui_estudiante, alumno.nombre_completo)}>
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