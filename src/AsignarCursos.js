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
      const [docentesRes, gradosRes, asignacionesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/teachers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/grades`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/asignaciones`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setDocentes(docentesRes.data.filter(d => d.estado_id === 1));
      setGrados(gradosRes.data);
      setAsignaciones(asignacionesRes.data);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (form.id_grado) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/grades/${form.id_grado}/sections`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setSecciones(res.data));
      axios.get(`${process.env.REACT_APP_API_URL}/api/asignaciones/cursos/${form.id_grado}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCursos(res.data));
    } else {
      setSecciones([]);
      setCursos([]);
    }
  }, [form.id_grado]);

  const handleCursosChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => String(option.value));
    setForm(prev => ({ ...prev, cursos_ids: selectedIds }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const method = editingId ? 'put' : 'post';
    const url = `${process.env.REACT_APP_API_URL}/api/asignaciones${editingId ? `/${editingId}` : ''}`;

    try {
      await axios[method](url, form, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Asignación ${editingId ? 'actualizada' : 'creada'} con éxito`);
      handleCancelEdit();
      fetchData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.msg || 'Error inesperado'));
    }
  };

  const handleEditClick = async (asignacion) => {
      const token = localStorage.getItem('accessToken');
      try {
          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/asignaciones/${asignacion.id_asignacion}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setEditingId(asignacion.id_asignacion);
          setForm({
              cui_docente: data.cui_docente,
              id_grado: data.id_grado,
              id_seccion: data.id_seccion,
              cursos_ids: data.cursos_ids.map(String),
              anio: data.anio
          });
          window.scrollTo(0, 0);
      } catch (error) {
          alert('No se pudieron cargar los datos para editar.');
      }
  };
  
  const handleCancelEdit = () => {
      setEditingId(null);
      setForm(initialFormState);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
        const token = localStorage.getItem('accessToken');
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/asignaciones/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
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
          <p>Asigna grados, secciones y múltiples cursos a cada docente para el ciclo actual.</p>
        </header>
        <button className="ac-btn-volver" onClick={() => navigate('/coordinator/dashboard')}>
          ⬅ Volver al Panel de Coordinación
        </button>
        <div className="ac-grid">
          <div className="ac-card">
            <h2>{editingId ? 'Editando Asignación' : 'Nueva Asignación'}</h2>
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
              
              <label htmlFor="cursos_ids">Cursos (mantén Ctrl para varios)</label>
              <select 
                id="cursos_ids"
                name="cursos_ids" 
                value={form.cursos_ids} 
                onChange={handleCursosChange} 
                required 
                multiple 
                disabled={!form.id_grado}
                size="5"
              >
                {cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
              </select>

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