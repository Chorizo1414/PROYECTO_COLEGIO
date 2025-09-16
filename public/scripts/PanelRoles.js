// src/PanelRoles.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PanelRoles.css";
import logoColegio from "./assets/logo-colegio.png";

const ROLES = [
  { key: "coordinador", title: "COORDINADOR", emoji: "👩‍💼", tone: "t-amarillo" },
  { key: "registro_docentes", title: "REGISTRO DOCENTES", emoji: "👩‍🏫", tone: "t-verde" },
  { key: "maestros", title: "MAESTROS", emoji: "👨‍🏫", tone: "t-azul" },
  { key: "secretaria", title: "SECRETARÍA", emoji: "📋", tone: "t-lila" },
  { key: "registro_alumnos", title: "REGISTRO ALUMNOS", emoji: "📚", tone: "t-madera" },
];

export default function PanelRoles() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, text: "" });

  const roleName = (k) =>
    ({
      coordinador: "Coordinador",
      registro_docentes: "Registro de docentes",
      maestros: "Portal Docente",
      secretaria: "Módulo de Secretaría",
      registro_alumnos: "Registro de alumnos",
    }[k]);

  const selectRole = (key) => {
    // Registro de docentes -> módulo Docentes /registro
    if (key === "registro_docentes") {
      setToast({ show: true, text: `Abriendo ${roleName(key)}…` });
      setTimeout(() => setToast({ show: false, text: "" }), 1200);
      setTimeout(() => navigate("/docentes/registro", { replace: true }), 700);
      return;
    }

    // Registro de alumnos -> pantalla de registro de alumnos
    if (key === "registro_alumnos") {
      setToast({ show: true, text: `Abriendo ${roleName(key)}…` });
      setTimeout(() => setToast({ show: false, text: "" }), 1200);
      setTimeout(() => navigate("/student-register", { replace: true }), 700);
      return;
    }

    // Maestros -> dashboard de docentes
    if (key === "maestros") {
      setToast({ show: true, text: `Accediendo a ${roleName(key)}…` });
      setTimeout(() => setToast({ show: false, text: "" }), 1200);
      setTimeout(() => navigate("/teacher", { replace: true }), 700);
      return;
    }

    // Resto de roles: navegar a subruta del panel con la key
    setToast({ show: true, text: `Accediendo a ${roleName(key) || key}…` });
    setTimeout(() => setToast({ show: false, text: "" }), 1200);
    setTimeout(() => navigate(`/panel/${key}`, { replace: true }), 700);
  };

  const logout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const cards = document.querySelectorAll(".pr-card");
    cards.forEach((c, i) => {
      c.style.opacity = 0;
      c.style.transform = "translateY(24px)";
      setTimeout(() => {
        c.style.transition = "all .55s ease";
        c.style.opacity = 1;
        c.style.transform = "translateY(0)";
      }, 90 * i);
    });
  }, []);

  return (
    <div className="pr-page">
      <div className="pr-container">
        <header className="pr-header">
          <div className="pr-grid" aria-hidden="true" />
          <img className="pr-logoBig" src={logoColegio} alt="Logo Colegio Mixto El Jardín" />
          <h1 className="pr-title">COLEGIO MIXTO EL JARDÍN</h1>
          <p className="pr-sub">San Raymundo</p>
          <p className="pr-system">Sistema de Gestión Académica</p>
        </header>

        {/* Grid 3x2 en desktop (5 items => 3 arriba, 2 abajo) */}
        <section className="pr-gridRoles pr-grid-3-2">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`pr-card ${r.tone}`}
              onClick={() => selectRole(r.key)}
            >
              <div className="pr-icon" aria-hidden="true">{r.emoji}</div>
              <h3 className="pr-cardTitle">{r.title}</h3>
            </button>
          ))}
        </section>

        <section className="pr-actions">
          <button className="pr-btn pr-btn--danger" onClick={logout}>🚪 Cerrar Sesión</button>
        </section>

        <footer className="pr-footer">
          <p>Sistema Académico v2.0 | © 2025 Colegio Mixto El Jardín</p>
        </footer>
      </div>

      <div className={`pr-toast ${toast.show ? "show" : ""}`}>
        <strong>{toast.text || "Accediendo…"}</strong>
      </div>
    </div>
  );
}