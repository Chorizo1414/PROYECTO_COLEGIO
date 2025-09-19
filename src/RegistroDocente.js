import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./css/RegistroDocente.css";

export default function RegistroDocente() {
  const [form, setForm] = useState({
    cui_docente: "",
    nombre_completo: "",
    grado_guia: "",
    email: "",
    telefono: "",
    estado_id: "1",
    username: "",
    password: "",
  });
  const [grados, setGrados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get('http://localhost:4000/api/grades', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setGrados(res.data);
      } catch (error) {
        console.error("Error al cargar los grados", error);
        alert("No se pudieron cargar los grados desde el servidor.");
      }
    };
    fetchGrades();
  }, []);

  const onChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert("Sesión no válida.");
      return navigate('/login');
    }

    try {
      await axios.post('http://localhost:4000/api/teachers/register', form, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('¡Docente y su cuenta de usuario guardados con éxito!');
      navigate('/panel');
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Ocurrió un error inesperado.";
      console.error('Error al guardar el docente:', errorMessage);
      alert('Error al guardar: ' + errorMessage);
    }
  };

  return (
    <div className="treg-container">
      <div className="treg-card">
        <header className="treg-header">
          <h1>Registro de Docentes</h1>
        </header>
        <form className="treg-form" onSubmit={onSubmit}>
          <label className="treg-label" htmlFor="cui_docente">CUI del Docente (13 dígitos)</label>
          <input id="cui_docente" name="cui_docente" className="treg-input" value={form.cui_docente} onChange={onChange} placeholder="2546789101234" required maxLength="13" />
          <label className="treg-label" htmlFor="nombre_completo">Nombre Completo</label>
          <input id="nombre_completo" name="nombre_completo" className="treg-input" value={form.nombre_completo} onChange={onChange} maxLength={100} required />
          <label className="treg-label" htmlFor="username">Nombre de Usuario para Iniciar Sesión</label>
          <input id="username" name="username" className="treg-input" value={form.username} onChange={onChange} placeholder="ej. csolis" required />
          <label className="treg-label" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" className="treg-input" value={form.password} onChange={onChange} placeholder="Mínimo 8 caracteres" required minLength="8" />
          <label className="treg-label" htmlFor="grado_guia">Grado Guía (opcional)</label>
          <select id="grado_guia" name="grado_guia" className="treg-input" value={form.grado_guia} onChange={onChange}>
            <option value="">-- No Asignado --</option>
            {grados.map((grado) => (<option key={grado.id_grado} value={grado.id_grado}>{grado.nombre_grado}</option>))}
          </select>
          <label className="treg-label" htmlFor="email">Correo (opcional)</label>
          <input id="email" name="email" type="email" className="treg-input" value={form.email} onChange={onChange} placeholder="docente@escuela.edu.gt" maxLength={50} />
          <label className="treg-label" htmlFor="telefono">Teléfono (opcional)</label>
          <input id="telefono" name="telefono" className="treg-input" value={form.telefono} onChange={onChange} placeholder="1234-5678" maxLength={20} />
          <fieldset className="treg-fieldset">
            <legend className="treg-legend">Estado del Docente</legend>
            <div className="treg-radio-row">
              <label className="treg-radio">
                <input type="radio" name="estado_id" value="1" checked={form.estado_id === "1"} onChange={onChange} required />
                <span>Activo</span>
              </label>
              <label className="treg-radio">
                <input type="radio" name="estado_id" value="2" checked={form.estado_id === "2"} onChange={onChange} />
                <span>Inactivo</span>
              </label>
            </div>
          </fieldset>
          <div className="treg-actions">
            <button className="treg-save" type="submit">Guardar Docente</button>
          </div>
        </form>
        <footer className="treg-footer">
          <Link to="/panel" className="treg-back">Volver al panel</Link>
        </footer>
      </div>
    </div>
  );
}

