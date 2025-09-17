import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./auth";
import "./css/PanelRoles.css";
import logoColegio from "./assets/logo-colegio.png";

// Lista completa de TODOS los paneles que existen
const TODOS_LOS_PANELES = [
  { key: "coordinador", title: "COORDINADOR", emoji: "👩‍💼", tone: "t-amarillo" },
  { key: "registro_docentes", title: "REGISTRO DOCENTES", emoji: "👩‍🏫", tone: "t-verde" },
  { key: "maestros", title: "MAESTROS", emoji: "👨‍🏫", tone: "t-azul" },
  { key: "secretaria", title: "SECRETARÍA \n solvencia/insolvencia", emoji: "📋", tone: "t-lila" },
  { key: "registro_alumnos", title: "REGISTRO ALUMNOS/PADRES", emoji: "📚", tone: "t-madera" },
  { key: "registro_padres", title: "REGISTRO PADRES", emoji: "👨‍👩‍👧", tone: "t-amarillo" } 
];

// Mapeo de permisos por rol_id de la base de datos
const ROLES_POR_PERFIL = {
  // Secretaría: Solo ve su panel, registro de alumnos y registro de padres
  1: ["secretaria", "registro_alumnos"],
  
  // Coordinador: Ve todo
  2: ["coordinador", "registro_docentes", "maestros", "secretaria", "registro_alumnos", "registro_padres"],
  
  // Docente: Solo ve su panel
  3: ["maestros"],
};

export default function PanelRoles() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, text: "" });

  const panelesVisibles = useMemo(() => {
    const userRole = auth.getRole();
    const permisos = ROLES_POR_PERFIL[userRole] || [];
    return TODOS_LOS_PANELES.filter(panel => permisos.includes(panel.key));
  }, []);

  const selectRole = (key) => {
    const roleNameMap = {
      coordinador: "Coordinador",
      registro_docentes: "Registro de docentes",
      maestros: "Portal Docente",
      secretaria: "Módulo de Secretaría",
      registro_alumnos: "Registro de alumnos/padres"
    };
    const friendlyName = roleNameMap[key] || key;

    setToast({ show: true, text: `Accediendo a ${friendlyName}…` });
    setTimeout(() => setToast({ show: false, text: "" }), 1200);

    let path = `/panel/${key}`;
    if (key === 'registro_docentes') path = '/docentes/registro';
    if (key === 'registro_alumnos') path = '/student-register';
    if (key === 'registro_padres') path = '/parent-register';
    if (key === 'maestros') path = '/teacher';
    if (key === 'secretaria') path = '/panel/secretaria';

    setTimeout(() => navigate(path, { replace: true }), 700);
  };
  
  const logout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      auth.logout();
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
  }, [panelesVisibles]);

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

        <section className="pr-gridRoles pr-grid-3-2">
          {panelesVisibles.map((r) => (
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