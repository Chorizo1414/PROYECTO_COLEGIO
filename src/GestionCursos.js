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
        const data = editingCurso ? { nombre_curso: editingCurso.nombre_curso, id_grado: editingCurso.id_grado } : form;

        try {
            if (editingCurso) {
                await axios.put(`${process.env.REACT_APP_API_URL}/api/cursos/${editingCurso.id_curso}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Curso actualizado.');
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/cursos`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Curso creado.');
            }
            fetchData();
            setForm({ nombre_curso: '', id_grado: '' });
            setEditingCurso(null);
        } catch (error) {
            alert('Error al guardar el curso.');
        }
    };

    const handleEdit = (curso) => setEditingCurso(curso);
    const cancelEdit = () => setEditingCurso(null);

    return (
        <div className="pagina-centrada">
            <div className="gc-page">
                <div className="gc-container">
                    <header className="gc-header">
                        <h1>Gestión de Cursos</h1>
                        <button className="gc-back-btn" onClick={() => navigate('/coordinator/dashboard')}>Volver</button>
                    </header>

                    <div className="gc-content">
                        <div className="gc-form-card">
                            <h3>{editingCurso ? 'Editando Curso' : 'Agregar Nuevo Curso'}</h3>
                            <form onSubmit={handleSubmit}>
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
                                    required
                                >
                                    <option value="">Asignar a un grado</option>
                                    {grados.map(g => <option key={g.id_grado} value={g.id_grado}>{g.nombre_grado}</option>)}
                                </select>
                                <div className="gc-actions">
                                    {editingCurso && <button type="button" onClick={cancelEdit}>Cancelar</button>}
                                    <button type="submit">{editingCurso ? 'Guardar Cambios' : 'Agregar Curso'}</button>
                                </div>
                            </form>
                        </div>

                        <div className="gc-list-card">
                            <h3>Listado de Cursos</h3>
                            <ul className="gc-list">
                                {cursos.map(c => (
                                    <li key={c.id_curso}>
                                        <span>{c.nombre_curso} ({c.nombre_grado})</span>
                                        <button onClick={() => handleEdit(c)}>✏️ Editar</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}