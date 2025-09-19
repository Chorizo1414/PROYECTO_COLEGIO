import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

// --- Lógica de Autenticación (integrada para simplicidad) ---
const auth = {
  getRole: () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.user ? decoded.user.role : null;
    } catch (e) { return null; }
  },
  logout: () => {
    localStorage.removeItem("accessToken");
  },
};

// --- Estilos CSS (integrados para evitar errores de ruta) ---
const PanelRolesStyles = () => (
  <style>{`
    :root{
      --azul:#014BA0; --madera:#783714; --amarillo:#F7D547; --rojo:#FF3936;
      --verde:#008311; --blanco:#FFFFFF; --grisC:#E0E0E0; --gris:#333333;
      --radius:16px; --shadow-lg:0 10px 30px rgba(0,0,0,.10);
      --shadow-md:0 6px 18px rgba(0,0,0,.10); --shadow-sm:0 2px 8px rgba(0,0,0,.08);
    }
    .pr-page{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:28px; background:#f5f7fb; font-family: sans-serif;}
    .pr-container{width:100%;max-width:1200px}
    .pr-header{
      position:relative; border-radius:24px; padding:40px 28px 56px; color:var(--blanco);
      overflow:hidden; background:linear-gradient(135deg,var(--azul) 0%, var(--verde) 100%);
      box-shadow:var(--shadow-lg); text-align:center;
    }
    .pr-logoBig{
      width:160px; height:160px; object-fit:contain; display:block;
      margin:0 auto 14px; border-radius:0; background:transparent; padding:0;
      box-shadow:none; filter:none; 
    }
    .pr-title{font-size:28px;letter-spacing:.5px;margin:6px 0 4px;font-weight:800;text-transform:uppercase}
    .pr-sub{margin:0 0 6px;font-weight:600;opacity:.95}
    .pr-system{margin:0;opacity:.9;font-size:14px}
    .pr-gridRoles{ margin-top:-28px; padding:32px 20px 8px; display:grid; gap:20px; }
    .pr-grid-3-2{ grid-template-columns:repeat(3, 1fr); }
    @media (max-width: 1024px){ .pr-grid-3-2{grid-template-columns:repeat(2,1fr)} .pr-grid-3-2 > *{grid-column:auto !important} }
    @media (max-width: 600px){ .pr-grid-3-2{grid-template-columns:1fr} }
    .pr-card{
      appearance:none;border:none;background:var(--blanco); border-radius:18px;
      box-shadow:var(--shadow-sm); padding:28px 18px;cursor:pointer;text-align:center;
      transition:.25s ease; position:relative; min-height:150px; display:flex;flex-direction:column;
      align-items:center;justify-content:center; border:2px solid transparent;
    }
    .pr-card:hover{transform:translateY(-4px); box-shadow:var(--shadow-md); border-color:rgba(1,75,160,.15)}
    .pr-icon{font-size:40px; line-height:1; margin-bottom:10px;}
    .pr-cardTitle{margin:0; font-size:16px; font-weight:800; letter-spacing:.4px;}
    .t-amarillo{background:linear-gradient(180deg,#fffaf0 0%, #fff3c9 100%)}
    .t-verde{background:linear-gradient(180deg,#f0fff4 0%, #dcfbe4 100%)}
    .t-azul{background:linear-gradient(180deg,#eef6ff 0%, #dbeafe 100%)}
    .t-lila{background:linear-gradient(180deg,#faf5ff 0%, #f3e8ff 100%)}
    .t-madera{background:linear-gradient(180deg,#fff7ed 0%, #fdeedc 100%)}
    .pr-actions{display:flex;justify-content:center;gap:12px;margin:18px 0 6px}
    .pr-btn{
      padding:12px 18px;border:none;border-radius:12px;font-weight:700;cursor:pointer;
      transition:.2s ease; box-shadow:var(--shadow-sm); background:#e9eef6; color:var(--gris);
    }
    .pr-btn:hover{filter:brightness(.97); transform:translateY(-1px)}
    .pr-btn--danger{background:var(--rojo); color:var(--blanco)}
    .pr-footer{margin-top:10px;text-align:center;color:#64748b}
  `}</style>
);

const TODOS_LOS_PANELES = [
  { key: "registro_docentes", title: "REGISTRAR DOCENTES", emoji: "👩‍🏫", tone: "t-verde" },
  { key: "registro_alumnos", title: "REGISTRAR ALUMNOS", emoji: "📚", tone: "t-madera" },
  { key: "secretaria", title: "VER PAGOS (SECRETARÍA)", emoji: "📋", tone: "t-lila" },
  { key: "maestros", title: "VER PANEL DE MAESTROS", emoji: "👨‍🏫", tone: "t-azul" },
];

const ROLES_POR_PERFIL = {
  1: ["secretaria", "registro_alumnos"],
  // CORRECCIÓN: El coordinador ahora ve los paneles de registro y los de supervisión.
  2: ["registro_docentes", "registro_alumnos", "secretaria", "maestros"],
  3: ["maestros"],
};

export default function PanelRoles() {
  const navigate = useNavigate();
  const [userRole] = useState(() => auth.getRole());
  const logoUrl = "https://i.imgur.com/xCE6PxC.png";

  const selectRole = useCallback((key) => {
    let path = '/';
    if (key === 'registro_docentes') path = '/docentes/registro';
    if (key === 'registro_alumnos') path = '/student-register';
    if (key === 'maestros') path = '/teacher';
    if (key === 'secretaria') path = '/panel/secretaria';
    navigate(path);
  }, [navigate]);

  const panelesVisibles = useMemo(() => {
    if (!userRole) return [];
    const permisos = ROLES_POR_PERFIL[userRole] || [];
    return TODOS_LOS_PANELES.filter(panel => permisos.includes(panel.key));
  }, [userRole]);

  // Se encarga de la redirección automática SOLO si el rol tiene un único panel (ej. Docente)
  useEffect(() => {
    const permisos = ROLES_POR_PERFIL[userRole] || [];
    if (permisos.length === 1 && panelesVisibles.length === 1) {
      const timer = setTimeout(() => selectRole(panelesVisibles[0].key), 50);
      return () => clearTimeout(timer);
    }
  }, [panelesVisibles, selectRole, userRole]);
  
  const logout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      auth.logout();
      navigate("/login", { replace: true });
    }
  };

  // Mensaje de carga mientras se determina si se debe redirigir o no
  if (ROLES_POR_PERFIL[userRole]?.length === 1) {
      return <div className="pr-page">Cargando su panel...</div>;
  }

  return (
    <div className="pr-page">
      <PanelRolesStyles />
      <div className="pr-container">
        <header className="pr-header">
          <img className="pr-logoBig" src={logoUrl} alt="Logo Colegio Mixto El Jardín" />
          <h1 className="pr-title">COLEGIO MIXTO EL JARDÍN</h1>
          <p className="pr-sub">San Raymundo</p>
          <p className="pr-system">Sistema de Gestión Académica</p>
        </header>
        <section className="pr-gridRoles pr-grid-3-2">
          {panelesVisibles.map((r) => (
            <button key={r.key} type="button" className={`pr-card ${r.tone}`} onClick={() => selectRole(r.key)}>
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
    </div>
  );
}

