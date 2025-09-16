import React, { useState } from "react";
import "./ParentRegister.css";

export default function ParentRegister() {
  const [form, setForm] = useState({
    studentCui: "",
    parentCui: "",
    parentName: "",
    phone: "",
    address: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    // por ahora solo muestra datos; el backend vendrá luego
    alert("Guardado (demo):\n" + JSON.stringify(form, null, 2));
  };

  const goBack = () => window.history.back();

  return (
    <div className="prg-page">
      <div className="prg-card">
        <h1 className="prg-title">REGISTRO DE PADRES</h1>

        <form onSubmit={onSubmit} className="prg-form">
          <label className="prg-label">CUI Estudiante
            <input
              className="prg-input"
              name="studentCui"
              value={form.studentCui}
              onChange={onChange}
              placeholder="0000 00000 0000"
            />
          </label>

          <label className="prg-label">CUI de Padre/Encargado
            <input
              className="prg-input"
              name="parentCui"
              value={form.parentCui}
              onChange={onChange}
              placeholder="0000 00000 0000"
            />
          </label>

          <label className="prg-label">Nombres y Apellidos del Padre
            <input
              className="prg-input"
              name="parentName"
              value={form.parentName}
              onChange={onChange}
              placeholder="Nombre completo"
            />
          </label>

          <label className="prg-label">Teléfono
            <input
              className="prg-input"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="(502) 0000-0000"
            />
          </label>

          <label className="prg-label">Dirección
            <textarea
              className="prg-input prg-textarea"
              name="address"
              rows="3"
              value={form.address}
              onChange={onChange}
              placeholder="Calle, avenida, zona, municipio…"
            />
          </label>

          <div className="prg-actions">
            <button type="button" className="prg-btn prg-btn--ghost" onClick={goBack}>
              ATRAS
            </button>
            <button type="submit" className="prg-btn prg-btn--primary">
              GUARDAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}