import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./auth";                   // usamos tu auth existente (named export)
import logoColegio from "./assets/logo-colegio.png"; // ✅ logo dentro de src/assets
import "./css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [show, setShow]   = useState(false);
  const [msg, setMsg]     = useState({ type: "", text: "" });
  const [busy, setBusy]   = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    // ✅ por ahora: entra con cualquier usuario/clave (solo que no estén vacíos)
    if (!user.trim() || !pass.trim()) {
      setMsg({ type: "err", text: "Completa usuario y contraseña." });
      return;
    }

    setBusy(true);
    setTimeout(() => {
      setMsg({ type: "ok", text: "¡Acceso exitoso! Redirigiendo..." });
      auth.login(user || "invitado");
      setTimeout(() => navigate("/panel", { replace: true }), 700);
      setBusy(false);
    }, 600);
  };

  return (
    <main className="lgx-page">
      <section className="lgx-card" role="dialog" aria-labelledby="lgx-title">
        {/* HEADER */}
        <header className="lgx-header">
          <div className="lgx-grid" aria-hidden="true" />
          <div className="lgx-logoBox">
            <div className="lgx-logoRing" />
            <div className="lgx-logoPlate">
              <img src={logoColegio} alt="Colegio Mixto El Jardín" />
            </div>
          </div>

          <h1 id="lgx-title" className="lgx-brand">COLEGIO MIXTO EL JARDÍN</h1>
          <p className="lgx-subbrand">San Raymundo</p>
        </header>

        {/* BODY */}
        <section className="lgx-body">
          <div className="lgx-welcome">
            <h2>Iniciar Sesión</h2>
    
          </div>

          <form className="lgx-form" onSubmit={onSubmit} noValidate>
            {/* Usuario */}
            <div className="lgx-field">
              <label htmlFor="user" className="lgx-label">Usuario</label>
              <input
                id="user"
                className="lgx-input"
                placeholder="usuario@colegio.edu"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* Contraseña */}
            <div className="lgx-field">
              <label htmlFor="pass" className="lgx-label">Contraseña</label>
              <div className="lgx-inputWrap">
                <input
                  id="pass"
                  className="lgx-input"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoComplete="current-password"
                />
                {pass.length > 0 && (
                  <button
                    type="button"
                    className="lgx-eye"
                    onClick={() => setShow(s => !s)}
                    aria-pressed={show}
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {show ? (
                      // eye-off
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.35-6.35A3 3 0 1 0 9.9 4.24z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      // eye
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Mensaje */}
            {msg.text && (
              <div
                role="alert"
                className={`lgx-msg ${msg.type === "ok" ? "lgx-msg--ok" : "lgx-msg--err"}`}
              >
                {msg.text}
              </div>
            )}

            {/* Botón */}
            <button className="lgx-btn" type="submit" disabled={busy}>
              {busy && <span className="lgx-spin" aria-hidden="true" />}
              {busy ? "Verificando..." : "Iniciar Sesión"}
            </button>

            <hr className="lgx-div" />
            <p className="lgx-help">
              <button
                type="button"
                className="lgx-linkBtn"
                onClick={() => alert("Recuperación de contraseña (pendiente backend)")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </p>
          </form>
        </section>

        {/* FOOTER */}
        <footer className="lgx-footer">
          <p>Sistema Académico v2.0</p>
          <nav className="lgx-links">
            <button type="button" className="lgx-linkBtn">Privacidad</button>
            <button type="button" className="lgx-linkBtn">Términos</button>
            <button type="button" className="lgx-linkBtn">Ayuda</button>
          </nav>
        </footer>
      </section>
    </main>
  );
}