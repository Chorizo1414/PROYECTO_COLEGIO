// src/SecretaryPayments.js
import React, { useMemo, useState } from "react";
import "./SecretaryPayments.css";
import logoColegio from "./assets/logo-colegio.png";

/** Datos de ejemplo (luego los reemplazas por tu API) */
const STUDENTS = [
  {
    id: 1,
    name: "María José García López",
    cui: "1234567885",
    parent: "Juan García Pérez",
    phone: "4936-3234",
    grade: "3° Primaria",
    status: "PENDIENTE",
  },
  {
    id: 2,
    name: "Carlos Antonio Pérez Morales",
    cui: "9765432134",
    parent: "Ana Morales de Pérez",
    phone: "4575-5251",
    grade: "6° Primaria",
    status: "PENDIENTE",
  },
  {
    id: 3,
    name: "Sofía Elia Rodríguez",
    cui: "6758441002",
    parent: "Roberto Rodríguez",
    phone: "5432-3234",
    grade: "1° Primaria",
    status: "AL_DIA",
  },
];

const GRADES = [
  "Todos los grados",
  "1° Primaria",
  "2° Primaria",
  "3° Primaria",
  "4° Primaria",
  "5° Primaria",
  "6° Primaria",
];

const MONTHS = [
  "Todos los meses",
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export default function SecretaryPayments() {
  const [grade, setGrade] = useState("Todos los grados");
  const [month, setMonth] = useState("Todos los meses");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // student object en edición
  const [message, setMessage] = useState("");

  // Filtrado: por ahora no hay datos por mes, así que NO usamos "month" aquí.
  const filtered = useMemo(() => {
    return STUDENTS.filter((s) => {
      const byGrade = grade === "Todos los grados" ? true : s.grade === grade;
      const byQuery = s.name.toLowerCase().includes(query.trim().toLowerCase());
      return byGrade && byQuery;
    });
    // 👇 OJO: 'month' NO va aquí para evitar el warning de ESLint
  }, [grade, query]);

  const totals = useMemo(() => {
    const total = STUDENTS.length;
    const pendientes = STUDENTS.filter((s) => s.status === "PENDIENTE").length;
    const alDia = total - pendientes;
    return { total, pendientes, alDia };
  }, []);

  function openEditor(student) {
    setEditing(student);
    const base =
      `Estimado(a) ${student.parent},\n\n` +
      `Le saludamos de Colegio Mixto El Jardín. ` +
      `Le recordamos que el pago del mes de ${month !== "Todos los meses" ? month : "_____"} ` +
      `se encuentra pendiente para ${student.name} (Grado: ${student.grade}).\n\n` +
      `Agradecemos su pronta gestión.\nCoordinación Administrativa.`;
    setMessage(base);
  }

  function closeEditor() {
    setEditing(null);
    setMessage("");
  }

  function applyTemplate(kind) {
    if (!editing) return;
    const map = {
      suave:
        `Hola ${editing.parent}, ¿cómo está? 😊\n` +
        `Le escribimos del Colegio para recordar el pago del mes de ${month !== "Todos los meses" ? month : "_____"} ` +
        `de ${editing.name}. ¡Gracias por su apoyo!`,
      formal:
        `Estimado(a) ${editing.parent}:\n` +
        `Se le informa que el pago del mes de ${month !== "Todos los meses" ? month : "_____"} ` +
        `de ${editing.name} está pendiente. Agradecemos su gestión.\nAtentamente,\nAdministración`,
      agradecimiento:
        `¡Gracias por estar al día! 🙌\n` +
        `Apreciamos su puntualidad con los pagos de ${editing.name}. Cualquier duda, estamos a la orden.`,
    };
    setMessage(map[kind]);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(message);
    alert("Mensaje copiado al portapapeles ✅");
  }

  function openWhatsApp(phone) {
    const numero = phone.replace(/\D/g, ""); // limpiar
    const url = `https://wa.me/502${numero}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  function markSolvent(id) {
    alert(`(Demo) Marcando como solvente al id ${id}`);
  }

  return (
    <div className="sp-page">
      {/* HEADER con logo grande sin burbuja */}
      <header className="sp-header">
        <img src={logoColegio} alt="Colegio Mixto El Jardín" className="sp-logo" />
        <h1 className="sp-title">COLEGIO MIXTO EL JARDÍN</h1>
        <p className="sp-sub">San Raymundo</p>
        <p className="sp-desc">Sistema de Control de Pagos</p>
      </header>

      {/* RESUMEN */}
      <section className="sp-stats">
        <h2 className="sp-statsTitle">Resumen de Pagos</h2>
        <div className="sp-statsGrid">
          <article className="sp-stat sp-borde-azul">
            <div className="sp-statNumber">{totals.total}</div>
            <div className="sp-statLabel">Total de Estudiantes</div>
          </article>
          <article className="sp-stat sp-borde-rojo">
            <div className="sp-statNumber">{totals.pendientes}</div>
            <div className="sp-statLabel">Pagos Pendientes</div>
          </article>
          <article className="sp-stat sp-borde-verde">
            <div className="sp-statNumber">{totals.alDia}</div>
            <div className="sp-statLabel">Al Día</div>
          </article>
        </div>
      </section>

      {/* CONTROLES */}
      <section className="sp-controls">
        <div className="sp-controlsHeader">
          <h2 className="sp-sectionTitle">Control de Estudiantes</h2>

          <div className="sp-filters">
            <div className="sp-selectWrap">
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="sp-selectWrap">
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="sp-searchWrap">
              <input
                className="sp-search"
                placeholder="Buscar estudiante…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="sp-btn sp-btnPrimary"
                onClick={() => {
                  /* aquí dispararías un fetch al backend con {grade, month, query} */
                }}
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>

        {/* LISTA */}
        <div className="sp-grid">
          {filtered.map((s) => (
            <article key={s.id} className="sp-card">
              <div className="sp-cardTop">
                <div className="sp-cardInfo">
                  <h3 className="sp-studentName">{s.name}</h3>
                  <p className="sp-details">
                    <strong>CUI:</strong> {s.cui}
                    <br />
                    <strong>Padre:</strong> {s.parent}
                    <br />
                    <strong>Teléfono:</strong> {s.phone}
                  </p>
                </div>

                <div className={`sp-badge ${s.status === "PENDIENTE" ? "pendiente" : "aldia"}`}>
                  {s.status === "PENDIENTE" ? "Pago pendiente" : "Al día"}
                </div>
              </div>

              <div className="sp-actions">
                <button className="sp-chip sp-chipYellow" onClick={() => openEditor(s)}>
                  ✏️ Editar mensaje
                </button>
                <button
                  className="sp-chip sp-chipGreen"
                  onClick={() => {
                    setEditing(s);
                    setMessage(`Hola ${s.parent}, le escribimos del Colegio Mixto El Jardín.`);
                    openWhatsApp(s.phone);
                  }}
                >
                  📱 WhatsApp
                </button>
                <button className="sp-chip sp-chipBlue" onClick={() => markSolvent(s.id)}>
                  ✅ Marcar solvente
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="sp-footer">
        <button className="sp-logout">🚪 Cerrar sesión</button>
        <div className="sp-footText">Sistema Académico v2.0 | © 2025 Colegio Mixto El Jardín</div>
      </footer>

      {/* MODAL DE EDICIÓN */}
      {editing && (
        <div className="sp-modalMask" onClick={closeEditor}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <header className="sp-modalHead">
              <h3>
                Mensaje para <span>{editing.parent}</span>
              </h3>
              <button className="sp-close" onClick={closeEditor}>
                ✕
              </button>
            </header>

            <div className="sp-templates">
              <span>Plantillas rápidas:</span>
              <div className="sp-buttonsRow">
                <button onClick={() => applyTemplate("suave")} className="sp-mini">
                  🤝 Amable
                </button>
                <button onClick={() => applyTemplate("formal")} className="sp-mini">
                  📄 Formal
                </button>
                <button onClick={() => applyTemplate("agradecimiento")} className="sp-mini">
                  🙏 Gracias
                </button>
              </div>
            </div>

            <label className="sp-label">Mensaje</label>
            <textarea
              className="sp-textarea"
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="sp-counter">{message.length} caracteres</div>

            <div className="sp-preview">
              <div className="sp-previewTitle">Vista previa</div>
              <pre>{message}</pre>
            </div>

            <div className="sp-modalActions">
              <button className="sp-btn sp-btnGhost" onClick={copyToClipboard}>
                📋 Copiar
              </button>
              <button className="sp-btn sp-btnPrimary" onClick={() => openWhatsApp(editing.phone)}>
                📱 Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}