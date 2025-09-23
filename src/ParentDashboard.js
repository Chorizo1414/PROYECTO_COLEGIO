import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "./auth";
//import './css/ParentDashboard.css';

export default function ParentDashboard() {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = auth.getUser();

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!user || !user.cui_padre) {
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('accessToken');

                // --- MODIFICACIÓN ---
                // para usar en la nube (Render)
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students/parent/${user.cui_padre}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // para usar localmente
                /*
                const res = await axios.get(`http://localhost:4000/api/students/parent/${user.cui_padre}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                */
                // --- FIN DE MODIFICACIÓN ---
                
                setStudentData(res.data);
            } catch (error) {
                console.error("Error fetching student data for parent", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [user]);

    const logout = () => {
        if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            auth.logout();
            navigate("/login", { replace: true });
        }
    };

    if (loading) return <div className="pd-page">Cargando datos del estudiante...</div>;
    if (!studentData) return <div className="pd-page">No se encontraron datos del estudiante.</div>;

    return (
        <div className="pd-page">
            <div className="pd-container">
                <header className="pd-header">
                    <h1>Bienvenido, {studentData.parent_name}</h1>
                    <p>Panel de seguimiento para {studentData.student_name}</p>
                </header>
                <main className="pd-grid">
                    <div className="pd-card">
                        <h3>Estado Financiero</h3>
                        <p className={`pd-status ${studentData.financial_status === 'Solvente' ? 'solvent' : 'pending'}`}>
                            {studentData.financial_status}
                        </p>
                        <p>Cuotas pendientes: <strong>{studentData.pending_fees}</strong></p>
                    </div>
                    <div className="pd-card">
                        <h3>Tareas Pendientes</h3>
                        {studentData.pending_tasks.length > 0 ? (
                            <ul className="pd-task-list">
                                {studentData.pending_tasks.map(task => (
                                    <li key={task.id_tarea}>
                                        {task.titulo} <span>({task.nombre_curso})</span>
                                        <small> - Entrega: {new Date(task.fecha_entrega).toLocaleDateString()}</small>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>¡Felicidades! No hay tareas pendientes.</p>
                        )}
                    </div>
                </main>
                <footer className="pd-footer">
                    <button onClick={logout} className="pd-logout-btn">Cerrar Sesión</button>
                </footer>
            </div>
        </div>
    );
}