import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./css/RegistroDocente.css";


export default function RegistroDocente() {
  const [docentes, setDocentes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("docentes")) || []; }
    catch { return []; }
  });

  const [form, setForm] = useState({
    cui_docente: "",         // BIGINT -> lo manejamos como string para validar longitud
    nombre_completo: "",
    grado_guia: "",          // "" | "1".. "12"
    email: "",
    telefono: "",
    estado_id: "",           // "1".."4"
    usuario_agrego: "Coordinador",
    usuario_modifico: "",    // opcional
  });

  useEffect(() => {
    localStorage.setItem("docentes", JSON.stringify(docentes));
  }, [docentes]);

  const onChange = (e) => {
    let { name, value } = e.target;

    if (name === "cui_docente") {
      // Solo dígitos, máximo 13
      value = value.replace(/\D/g, "").slice(0, 13);
    }

    if (name === "telefono") {
      const digits = value.replace(/\D/g, "").slice(0, 8);
      value = digits.length > 4 ? `${digits.slice(0,4)}-${digits.slice(4)}` : digits;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validaciones requeridos
    if (!form.cui_docente || form.cui_docente.length !== 13) {
      alert("El CUI del docente debe tener 13 dígitos.");
      return;
    }
    if (!form.nombre_completo.trim()) {
      alert("Ingresa el nombre completo del docente.");
      return;
    }
    if (!form.estado_id) {
      alert("Selecciona el estado del docente.");
      return;
    }
    if (!form.usuario_agrego.trim()) {
      alert("Ingresa el usuario que registra.");
      return;
    }

    // Unicidad por CUI
    if (docentes.some(d => d.cui_docente === form.cui_docente)) {
      alert("Ya existe un docente con este CUI.");
      return;
    }
    // Unicidad por email (si fue ingresado)
    if (
      form.email &&
      docentes.some(d => (d.email || "").toLowerCase() === form.email.toLowerCase())
    ) {
      alert("Ya existe un docente con este email.");
      return;
    }

    const nuevo = {
      cui_docente: form.cui_docente,
      nombre_completo: form.nombre_completo.trim(),
      grado_guia: form.grado_guia ? parseInt(form.grado_guia) : null,
      email: form.email || null,
      telefono: form.telefono || null,
      estado_id: parseInt(form.estado_id),               // INT
      usuario_agrego: form.usuario_agrego.trim(),
      usuario_modifico: form.usuario_modifico.trim() || null,
      fecha_agrega: new Date().toISOString(),            // simulamos now()
      fecha_modifico: null,
    };

    setDocentes((prev) => [...prev, nuevo]);
    alert("Docente guardado (demo).");
    console.log("Docente -> listo para BD:", nuevo);

    // Reset (usuario_agrego queda por defecto en admin)
    setForm({
      cui_docente: "",
      nombre_completo: "",
      grado_guia: "",
      email: "",
      telefono: "",
      estado_id: "",
      usuario_agrego: "admin",
      usuario_modifico: "",
    });
  };

  return (
    <div className="treg-container">
      <div className="treg-card">
        <header className="treg-header">
          <h1>Registro de Docentes</h1>
        </header>

        <form className="treg-form" onSubmit={onSubmit}>
          <label className="treg-label" htmlFor="cui_docente">CUI del Docente</label>
          <input
            id="cui_docente"
            name="cui_docente"
            className="treg-input"
            value={form.cui_docente}
            onChange={onChange}
            placeholder="2546789101234"
            required
          />

          <label className="treg-label" htmlFor="nombre_completo">Nombre Completo</label>
          <input
            id="nombre_completo"
            name="nombre_completo"
            className="treg-input"
            value={form.nombre_completo}
            onChange={onChange}
            maxLength={100}
            required
          />

          <label className="treg-label" htmlFor="grado_guia">Grado Guía (opcional)</label>
          <select
            id="grado_guia"
            name="grado_guia"
            className="treg-input"
            value={form.grado_guia}
            onChange={onChange}
          >
            <option value="">Seleccione</option>
            <option value="2">1ro Primaria</option>
            <option value="3">2do Primaria</option>
            <option value="4">3ro Primaria</option>
            <option value="5">4to Primaria</option>
            <option value="6">5to Primaria</option>
            <option value="7">6to Primaria</option>
            <option value="8">1ro Básico</option>
            <option value="9">2do Básico</option>
            <option value="10">3ro Básico</option>
            <option value="11">4to Bachillerato</option>
            <option value="12">5to Bachillerato</option>
          </select>

          <label className="treg-label" htmlFor="email">Correo (opcional)</label>
          <input
            id="email"
            name="email"
            type="email"
            className="treg-input"
            value={form.email}
            onChange={onChange}
            placeholder="docente@escuela.edu.gt"
            maxLength={50}
          />

          <label className="treg-label" htmlFor="telefono">Teléfono (opcional)</label>
          <input
            id="telefono"
            name="telefono"
            className="treg-input"
            value={form.telefono}
            onChange={onChange}
            placeholder="1234-5678"
            maxLength={9}
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
                    type="radio"
                    name="estado_id"
                    value={opt.id}
                    checked={form.estado_id === String(opt.id)}
                    onChange={onChange}
                    required
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="treg-label" htmlFor="usuario_agrego">Usuario que registra</label>
          <input
            id="usuario_agrego"
            name="usuario_agrego"
            className="treg-input"
            value={form.usuario_agrego}
            onChange={onChange}
            maxLength={20}
            required
          />

          <label className="treg-label" htmlFor="usuario_modifico">Usuario modificó (opcional)</label>
          <input
            id="usuario_modifico"
            name="usuario_modifico"
            className="treg-input"
            value={form.usuario_modifico}
            onChange={onChange}
            maxLength={20}
          />

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