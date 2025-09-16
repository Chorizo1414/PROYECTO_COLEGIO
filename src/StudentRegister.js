// src/StudentRegister.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Mock por ahora
    alert("Alumno guardado (demo).");
    console.log("Alumno:", form);
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