// src/StudentRegister.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import "./css/StudentRegister.css";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    fechaNac: "",
    genero: "",
    cuiEst: "",
    cuiPadre: "",
    id_grado: "",
  });
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true); // 1. Nuevo estado de carga

  useEffect(() => {
  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:4000/api/grades', {
        // si la ruta queda pública, puedes borrar headers
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setGrados(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Tu sesión expiró. Iniciá sesión de nuevo.');
        navigate('/login');
      } else {
        alert('No pude cargar los grados. Revisa la consola.');
      }
      console.error('Error al cargar los grados', error);
    } finally {
      setLoading(false);
    }
  };
  fetchGrades();
}, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("Sesión no válida.");
      return navigate('/login');
    }

    // Prepara todos los datos en un solo objeto
    const studentData = {
      cui_estudiante: form.cuiEst,
      nombres: form.nombres,
      apellidos: form.apellidos,
      fecha_nacimiento: form.fechaNac,
      genero_id: form.genero === 'F' ? 1 : 2,
      id_grado: form.id_grado,
      id_seccion: form.id_seccion, // Asegúrate de que este campo esté en tu estado 'form'
      cui_padre: form.cuiPadre, // El CUI del padre va en el mismo objeto
      usuario_agrego: "secretaria" // O puedes obtenerlo del token
    };

    try {
      // UNA SOLA LLAMADA A LA API
      await axios.post('http://localhost:4000/api/students', studentData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('¡Estudiante guardado con éxito!');
      navigate('/alumnos'); // Redirige al nuevo dashboard de alumnos

    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Ocurrió un error inesperado.";
      console.error('Error al guardar:', errorMessage);
      alert('Error al guardar: ' + errorMessage);
    }
  };

  if (loading) {
    return <div className="reg-container"><div>Cargando información...</div></div>;
  }
  
  return (
    <div className="reg-container">
      <div className="reg-card">
        <header className="reg-header">
          <h1>Registro de Alumnos</h1>
        </header>

        <form className="reg-form" onSubmit={onSubmit}>
          <label className="reg-label" htmlFor="nombres">Nombres del Estudiante</label>
          <input id="nombres" name="nombres" className="reg-input" value={form.nombres} onChange={onChange} required />

          <label className="reg-label" htmlFor="apellidos">Apellidos del Estudiante</label>
          <input id="apellidos" name="apellidos" className="reg-input" value={form.apellidos} onChange={onChange} required />

          <label className="reg-label" htmlFor="fechaNac">Fecha de Nacimiento</label>
          <input id="fechaNac" name="fechaNac" type="date" className="reg-input" value={form.fechaNac} onChange={onChange} required />

          {/* CAMPO DE GRADO EN EL ORDEN CORRECTO */}
          <label className="reg-label" htmlFor="id_grado">Grado a Cursar</label>
          <select
            id="id_grado"
            name="id_grado"
            className="reg-input"
            value={form.id_grado}
            onChange={onChange}
            required
          >
            <option value="">-- Seleccione un Grado --</option>
            {grados.map((grado) => (
              <option key={grado.id_grado} value={grado.id_grado}>
                {grado.nombre_grado}
              </option>
            ))}
          </select>

          <fieldset className="reg-fieldset">
            <legend className="reg-legend">Género</legend>
            <div className="reg-radio-row">
              <label className="reg-radio">
                <input type="radio" name="genero" value="F" checked={form.genero==="F"} onChange={onChange} required />
                <span className="reg-radio-icon">♀</span><span>Femenino</span>
              </label>
              <label className="reg-radio">
                <input type="radio" name="genero" value="M" checked={form.genero==="M"} onChange={onChange} required />
                <span className="reg-radio-icon">♂</span><span>Masculino</span>
              </label>
            </div>
          </fieldset>

          <label className="reg-label" htmlFor="cuiEst">CUI Estudiante</label>
          <input id="cuiEst" name="cuiEst" className="reg-input" value={form.cuiEst} onChange={onChange} required />

          <label className="reg-label" htmlFor="cuiPadre">CUI de Padre/Encargado</label>
          <input id="cuiPadre" name="cuiPadre" className="reg-input" value={form.cuiPadre} onChange={onChange} required />

          <button
            type="button"
            className="reg-link-btn"
            onClick={() => navigate("/parent-register")}
          >
            ¿El padre no está registrado? <strong>Click aquí</strong>
          </button>

          <div className="reg-actions">
            <button className="reg-save" type="submit">Guardar</button>
          </div>
        </form>

        <footer className="reg-footer">
          <Link to="/alumnos" className="reg-back">Volver a Gestión de Alumnos</Link>
        </footer>
      </div>
    </div>
  );
}