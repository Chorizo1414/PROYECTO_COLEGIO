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
    estado_id: "",
    usuario_agrego: "secretaria",
  });
  const [grados, setGrados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('token');
        // AQUÍ APUNTAMOS A LA NUEVA Y CORRECTA RUTA
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
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Sesión no válida.");
      return navigate('/login');
    }

    const teacherData = {
      ...form,
      grado_guia: form.grado_guia || null,
      email: form.email || null,
      telefono: form.telefono || null,
    };

    try {
      await axios.post('http://localhost:4000/api/teachers', teacherData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('¡Docente guardado con éxito!');
      navigate('/panel');
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message;
      console.error('Error al guardar el docente:', errorMessage);
      alert('Error al guardar: ' + errorMessage);
    }
  };

  // El JSX (return) no cambia, ya que el mapeo de `grados` es correcto.
  // ...PEGA AQUÍ EL RETURN COMPLETO DE TU ARCHIVO...
  return (
    <div className="treg-container">
      <div className="treg-card">
        <header className="treg-header">
          <h1>Registro de Docentes</h1>
        </header>

        <form className="treg-form" onSubmit={onSubmit}>
          <label className="treg-label" htmlFor="cui_docente">CUI del Docente</label>
          <input
            id="cui_docente" name="cui_docente" className="treg-input"
            value={form.cui_docente} onChange={onChange}
            placeholder="2546789101234" required
          />

          <label className="treg-label" htmlFor="nombre_completo">Nombre Completo</label>
          <input
            id="nombre_completo" name="nombre_completo" className="treg-input"
            value={form.nombre_completo} onChange={onChange}
            maxLength={100} required
          />

          <label className="treg-label" htmlFor="grado_guia">Grado Guía (opcional)</label>
          <select
            id="grado_guia" name="grado_guia" className="treg-input"
            value={form.grado_guia} onChange={onChange}
          >
            <option value="">-- No Asignado --</option>
            {grados.map((grado) => (
              <option key={grado.id_grado} value={grado.id_grado}>
                {grado.nombre_grado}
              </option>
            ))}
          </select>

          <label className="treg-label" htmlFor="email">Correo (opcional)</label>
          <input
            id="email" name="email" type="email" className="treg-input"
            value={form.email} onChange={onChange}
            placeholder="docente@escuela.edu.gt" maxLength={50}
          />

          <label className="treg-label" htmlFor="telefono">Teléfono (opcional)</label>
          <input
            id="telefono" name="telefono" className="treg-input"
            value={form.telefono} onChange={onChange}
            placeholder="1234-5678" maxLength={9}
          />

          <fieldset className="treg-fieldset">
            <legend className="treg-legend">Estado (requerido)</legend>
            <div className="treg-radio-row">
              {[
                { id: 1, label: "Activo" },
                { id: 2, label: "Inactivo" },
                { id: 3, label: "Suspendido" },
              ].map((opt) => (
                <label className="treg-radio" key={opt.id}>
                  <input
                    type="radio" name="estado_id" value={opt.id}
                    checked={form.estado_id === String(opt.id)} onChange={onChange}
                    required
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="treg-actions">
            <button className="treg-save" type="submit">Guardar</button>
          </div>
        </form>

        <footer className="treg-footer">
          <Link to="/panel" className="treg-back">Volver al panel</Link>
        </footer>
      </div>
    </div>
  );
}