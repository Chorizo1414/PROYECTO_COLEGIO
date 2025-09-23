import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/SeleccionarDocente.css';

export default function SeleccionarDocente() {
    const [docentes, setDocentes] = useState([]);
    const [selectedDocente, setSelectedDocente] = useState('');
    const [asignaciones, setAsignaciones] = useState([]);
    const [selectedAsignacion, setSelectedAsignacion] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocentes = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                // --- MODIFICACIÓN ---
                // para usar en la nube (Render)
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/teachers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // para usar localmente
                /*
                const res = await axios.get('http://localhost:4000/api/teachers', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                */
                // --- FIN DE MODIFICACIÓN ---

                setDocentes(res.data);
            } catch (error) {
                alert("Error al cargar docentes.");
            }
        };
        fetchDocentes();
    }, []);

    const handleDocenteChange = async (cui_docente) => {
        setSelectedDocente(cui_docente);
        setSelectedAsignacion('');
        setAsignaciones([]);
        if (cui_docente) {
            const token = localStorage.getItem('accessToken');
            try {
                // --- MODIFICACIÓN ---
                // para usar en la nube (Render)
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/teachers/${cui_docente}/assignments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // para usar localmente
                /*
                const res = await axios.get(`http://localhost:4000/api/teachers/${cui_docente}/assignments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                */
                // --- FIN DE MODIFICACIÓN ---

                setAsignaciones(res.data);
            } catch (error) {
                alert("Error al cargar asignaciones.");
            }
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if(selectedAsignacion) {
            navigate(`/teacher-dashboard/${selectedAsignacion}`);
        }
    };
    
    return (
        <div className="sd-page">
            <div className="sd-container">
                <header className="sd-header">
                    <h1>Seleccionar Asignación</h1>
                    <p>Elige un docente y una de sus asignaciones para ver el detalle.</p>
                </header>
                <form onSubmit={handleSubmit} className="sd-form">
                    <label htmlFor="docente">Docente:</label>
                    <select id="docente" value={selectedDocente} onChange={(e) => handleDocenteChange(e.target.value)}>
                        <option value="">-- Seleccione un docente --</option>
                        {docentes.map(d => <option key={d.cui_docente} value={d.cui_docente}>{d.nombre_completo}</option>)}
                    </select>

                    <label htmlFor="asignacion">Asignación:</label>
                    <select id="asignacion" value={selectedAsignacion} onChange={(e) => setSelectedAsignacion(e.target.value)} disabled={!selectedDocente}>
                        <option value="">-- Seleccione una asignación --</option>
                        {asignaciones.map(a => <option key={a.id_asignacion} value={a.id_asignacion}>{a.description}</option>)}
                    </select>

                    <div className="sd-actions">
                        <button type="button" onClick={() => navigate('/coordinator/dashboard')}>Volver</button>
                        <button type="submit" disabled={!selectedAsignacion}>Ver Panel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}