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
    id_grado: "", // 2. Añade id_grado al estado del formulario
  });
  const [grados, setGrados] = useState([]); // 3. Nuevo estado para la lista de grados

  // 4. useEffect para cargar los grados desde la API
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:4000/api/grades', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setGrados(res.data);
      } catch (error) {
        console.error("Error al cargar los grados", error);
      }
    };
    fetchGrades();
  }, []); // El array vacío asegura que solo se ejecute una vez

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sesión no válida.");
      return navigate('/login');
    }

  // Prepara los datos del estudiante para la API
  const studentData = {
    cui_estudiante: form.cuiEst,
    nombres: form.nombres,
    apellidos: form.apellidos,
    fecha_nacimiento: form.fechaNac,
    genero_id: form.genero === 'F' ? 1 : 2, // Temporalmente, luego lo harás dinámico
    id_grado: form.id_grado,  // Temporalmente, luego lo harás dinámico
    id_seccion: 1, // Temporalmente
    usuario_agrego: "secretaria"
  };

  try {
      // Guardar al estudiante
      const studentRes = await axios.post('http://localhost:4000/api/students', studentData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Vincular al padre
      const linkData = {
        cui_estudiante: form.cuiEst,
        cui_padre: form.cuiPadre
      };
      await axios.post('http://localhost:4000/api/students/link-parent', linkData, {
          headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('¡Estudiante y padre vinculados con éxito!');
      navigate('/panel'); // Redirige al panel

    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message;
      console.error('Error al guardar:', errorMessage);
      alert('Error al guardar: ' + errorMessage);
    }
  };

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

          {/* 5. AÑADE ESTE NUEVO CAMPO PARA EL GRADO */}
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

          <label className="reg-label" htmlFor="fechaNac">Fecha de Nacimiento</label>
          <input id="fechaNac" name="fechaNac" type="date" className="reg-input" value={form.fechaNac} onChange={onChange} required />

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
          <Link to="/panel" className="reg-back">Volver al panel</Link>
        </footer>
      </div>
    </div>
  );
}