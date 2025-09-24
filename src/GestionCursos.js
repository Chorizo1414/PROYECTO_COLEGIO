import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/GestionCursos.css';

export default function GestionCursos() {
    const [cursos, setCursos] = useState([]);
    const [grados, setGrados] = useState([]);
    const [form, setForm] = useState({ nombre_curso: '', id_grado: '' });
    const [editingCurso, setEditingCurso] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const [cursosRes, gradosRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/cursos`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/grades`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setCursos(cursosRes.data);
            setGrados(gradosRes.data);
        } catch (error) {
            alert('Error al cargar datos.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editingCurso) {
            setEditingCurso({ ...editingCurso, [name]: value });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('accessToken');
  const API = process.env.REACT_APP_API_URL;

  // toma el origen de datos (editando o creando)
  const raw = editingCurso ? editingCurso : form;

  // <-- ESTE ES EL PAYLOAD QUE NO LOGRABAS PEGAR -->
  const payload = {
    nombre_curso: (raw.nombre_curso || '').trim(),
    // tu tabla exige NOT NULL; si no usás descripción, manda cadena vacía
    descripcion_curso: (raw.descripcion_curso || '').trim(),
    id_grado:
      raw.id_grado === '' || raw.id_grado === null || typeof raw.id_grado === 'undefined'
        ? null
        : Number(raw.id_grado)
  };

  try {
    if (editingCurso) {
      await axios.put(`${API}/api/cursos/${editingCurso.id_curso}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Curso actualizado.');
    } else {
      await axios.post(`${API}/api/cursos`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Curso creado.');
    }
    await fetchData();
    setForm({ nombre_curso: '', id_grado: '' });
    setEditingCurso(null);
  } catch (error) {
    alert('Error al guardar el curso.');
    console.error(error);
  }
};

   const handleDelete = async (id) => {
  if (!window.confirm('¿Eliminar este curso?')) return;
  const token = localStorage.getItem('accessToken');
  const API = process.env.REACT_APP_API_URL;
  try {
    await axios.delete(`${API}/api/cursos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCursos(prev => prev.filter(c => c.id_curso !== id));
  } catch (e) {
    alert('No se pudo eliminar el curso. Verifica si está asignado o tiene tareas.');
    console.error(e);
  }
};

    const handleEdit = (curso) => setEditingCurso(curso);
    const cancelEdit = () => setEditingCurso(null);

    return (
    <div className="gc-page">
        <div className="gc-container">
            <header className="gc-header">
              <h1>Gestión de Cursos</h1>
            </header>
            <div className="back-row">
              <button type="button" className="btn-volver" onClick={() => navigate('/coordinator/dashboard')}>
                Volver al Panel
              </button>
            </div>
                    <div className="gc-grid">
                        <div className="gc-card">
                            <h2>{editingCurso ? 'Editando Curso' : 'Agregar Nuevo Curso'}</h2>
                            <form className="gc-form" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="nombre_curso"
                                    value={editingCurso ? editingCurso.nombre_curso : form.nombre_curso}
                                    onChange={handleChange}
                                    placeholder="Nombre del curso"
                                    required
                                />
                                <select
                                    name="id_grado"
                                    value={editingCurso ? editingCurso.id_grado : form.id_grado}
                                    onChange={handleChange}
                                >
                                    
                                    <option value="">Curso general (sin grado)</option>
                                    {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>)}
                                </select>
                                <div className="gc-form-actions">
                                  {editingCurso && (
                                    <button
                                      type="button"
                                      className="gc-btn gc-btn--secondary"
                                      onClick={cancelEdit}
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                  <button type="submit" className="gc-btn gc-btn--primary">
                                    {editingCurso ? 'Guardar Cambios' : 'Agregar Curso'}
                                  </button>
                                </div>
                            </form>
                        </div>

                        <div className="gc-card">
                            <h3>Listado de Cursos</h3>
                            <div className="gc-list">
                      {cursos.map(c => (
                        <div key={c.id_curso} className="gc-list-item">
                          <div>
                            <span className="gc-curso-nombre">{c.nombre_curso}</span>
                            <span className="gc-grado">{c.nombre_grado ?? 'General'}</span>
                          </div>
                          <button className="gc-btn gc-btn--primary" onClick={() => handleEdit(c)}>✏️ Editar</button>
                          <button className="gc-btn gc-btn--danger" onClick={() => handleDelete(c.id_curso)}>🗑️ Borrar</button>
                        </div>
                      ))}
                    </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}