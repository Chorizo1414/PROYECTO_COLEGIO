import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/AsignarCursos.css';

const AsignarCursos = () => {
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    cui_docente: '',
    id_grado: '',
    id_seccion: '',
    cursos_ids: [],
    anio: new Date().getFullYear(),
  };
  const [form, setForm] = useState(initialFormState);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      setLoading(true);
      
      // --- MODIFICACIÓN ---
      // para usar en la nube (Render)
      const [docentesRes, gradosRes, asignacionesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/teachers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/grades`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/asignaciones`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // para usar localmente
      /*
      const [docentesRes, gradosRes, asignacionesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/teachers', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:4000/api/grades', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:4000/api/asignaciones', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      */
      // --- FIN DE MODIFICACIÓN ---
      
      setDocentes(docentesRes.data);
      setGrados(gradosRes.data);
      setAsignaciones(asignacionesRes.data);
    } catch (error) {
      console.error("Error fetching initial data", error);
      alert('Error al cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGradoChange = async (gradoId) => {
    const token = localStorage.getItem('accessToken');
    setForm({ ...form, id_grado: gradoId, id_seccion: '', cursos_ids: [] });
    if (gradoId) {
      try {
        // --- MODIFICACIÓN ---
        // para usar en la nube (Render)
        const [seccionesRes, cursosRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/grades/${gradoId}/sections`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/cursos/grado/${gradoId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // para usar localmente
        /*
        const [seccionesRes, cursosRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/grades/${gradoId}/sections`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:4000/api/cursos/grado/${gradoId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        */
        // --- FIN DE MODIFICACIÓN ---
        
        setSecciones(seccionesRes.data);
        setCursos(cursosRes.data);
      } catch (error) {
        console.error("Error fetching sections or courses", error);
        alert('Error al cargar secciones o cursos.');
      }
    } else {
      setSecciones([]);
      setCursos([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id_grado') {
      handleGradoChange(value);
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  
  const handleCursoChange = (cursoId) => {
    const newCursosIds = form.cursos_ids.includes(cursoId)
      ? form.cursos_ids.filter(id => id !== cursoId)
      : [...form.cursos_ids, cursoId];
    setForm({ ...form, cursos_ids: newCursosIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      if (editingId) {
        // --- MODIFICACIÓN ---
        // para usar en la nube (Render)
        await axios.put(`${process.env.REACT_APP_API_URL}/api/asignaciones/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // para usar localmente
        /*
        await axios.put(`http://localhost:4000/api/asignaciones/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        */
        // --- FIN DE MODIFICACIÓN ---
        alert('Asignación actualizada con éxito.');
      } else {
        // --- MODIFICACIÓN ---
        // para usar en la nube (Render)
        await axios.post(`${process.env.REACT_APP_API_URL}/api/asignaciones`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // para usar localmente
        /*
        await axios.post('http://localhost:4000/api/asignaciones', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        */
        // --- FIN DE MODIFICACIÓN ---
        alert('Cursos asignados con éxito.');
      }
      setForm(initialFormState);
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Error submitting form", error);
      alert('Error al guardar la asignación: ' + (error.response?.data?.msg || 'Error desconocido.'));
    }
  };
  
  const handleEditClick = (asignacion) => {
    setEditingId(asignacion.id_asignacion);
    handleGradoChange(asignacion.id_grado);
    setForm({
      cui_docente: asignacion.cui_docente,
      id_grado: asignacion.id_grado,
      id_seccion: asignacion.id_seccion,
      cursos_ids: asignacion.cursos_ids || [],
      anio: asignacion.anio
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialFormState);
    setSecciones([]);
    setCursos([]);
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      const token = localStorage.getItem('accessToken');
      try {
        // --- MODIFICACIÓN ---
        // para usar en la nube (Render)
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/asignaciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // para usar localmente
        /*
        await axios.delete(`http://localhost:4000/api/asignaciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        */
        // --- FIN DE MODIFICACIÓN ---

        alert('Asignación eliminada.');
        fetchData();
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
          <h1>Asignación de Cursos a Docentes</h1>
          <button className="ac-btn-back" onClick={() => navigate('/coordinator/dashboard')}>Volver al Panel</button>
        </header>

        <div className="ac-content-grid">
          <div className="ac-card ac-form-card">
            <h2>{editingId ? 'Editando Asignación' : 'Nueva Asignación'}</h2>
            <form onSubmit={handleSubmit}>
              <label>Docente</label>
              <select name="cui_docente" value={form.cui_docente} onChange={handleChange} required>
                <option value="">Seleccione un docente</option>
                {docentes.map(d => <option key={d.cui_docente} value={d.cui_docente}>{d.nombre_completo}</option>)}
              </select>
              <label>Grado</label>
              <select name="id_grado" value={form.id_grado} onChange={handleChange} required>
                <option value="">Seleccione un grado</option>
                {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>)}
              </select>
              <label>Sección</label>
              <select name="id_seccion" value={form.id_seccion} onChange={handleChange} required disabled={!form.id_grado}>
                <option value="">Seleccione una sección</option>
                {secciones.map(s => <option key={s.id_seccion} value={s.id_seccion}>{s.nombre_seccion}</option>)}
              </select>
              <fieldset>
                <legend>Cursos a impartir</legend>
                <div className="ac-cursos-checkboxes">
                  {cursos.map(c => (
                    <label key={c.id_curso}>
                      <input type="checkbox" checked={form.cursos_ids.includes(c.id_curso)} onChange={() => handleCursoChange(c.id_curso)} />
                      {c.nombre_curso}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>Año</label>
              <input type="number" name="anio" value={form.anio} onChange={handleChange} required />
              <div className="ac-form-actions">
                  {editingId && (
                      <button type="button" className="ac-btn ac-btn--secondary" onClick={handleCancelEdit}>Cancelar Edición</button>
                  )}
                  <button type="submit" className="ac-btn ac-btn--primary">{editingId ? 'Guardar Cambios' : 'Asignar Cursos'}</button>
              </div>
            </form>
          </div>
          <div className="ac-card">
            <h2>Asignaciones Actuales</h2>
            <div className="ac-list">
              {asignaciones.map(a => (
                <div key={a.id_asignacion} className="ac-list-item">
                  <div>
                    <strong className="ac-docente">{a.docente}</strong>
                    <span className="ac-detalle">{a.grado} {a.seccion} - {a.cursos ? a.cursos.join(', ') : 'Sin cursos'} ({a.anio})</span>
                  </div>
                  <div className="ac-item-actions">
                    <button className="ac-action-btn" onClick={() => handleEditClick(a)}>✏️</button>
                    <button className="ac-action-btn ac-delete-btn" onClick={() => handleDelete(a.id_asignacion)}>🗑️</button>
                  </div>
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