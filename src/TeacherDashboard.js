// src/TeacherDashboard.js
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/TeacherDashboard.css";
import logoColegio from "./assets/logo-colegio.png";

const SUBJECTS = ["Lenguaje", "Computación", "Sociales"];
const GRADES = ["4to Bach", "5to Bach", "4to A", "5to A", "1° Primaria", "2° Primaria"];

// Maqueta de alumnos por grado
const seedStudents = (grade) => [
  { id: "s1", name: "María José García", grade },
  { id: "s2", name: "Carlos Pérez Morales", grade },
  { id: "s3", name: "Sofía Elía Rodríguez", grade },
];

export default function TeacherDashboard() {
  const navigate = useNavigate();

  // ⬇️ Por defecto abrimos Seguimiento (ya no existe "resumen")
  const [activeTab, setActiveTab] = useState("seguimiento");
  const [guideGrade, setGuideGrade] = useState("4to Bach");

  // Tareas base (se filtran por grade)
  const [tasks, setTasks] = useState([
    { id: "t1", subject: "Lenguaje",     grade: "4to Bach", title: "Ensayo de lectura",                date: "2025-09-15" },
    { id: "t2", subject: "Computación",  grade: "4to Bach", title: "Formateo de tabla en Excel",       date: "2025-09-16" },
    { id: "t3", subject: "Sociales",     grade: "4to Bach", title: "Mapa conceptual de la revolución",  date: "2025-09-18" },
  ]);

  // Alumnos varían con el grado guía
  const students = useMemo(() => seedStudents(guideGrade), [guideGrade]);

  // Seguimiento: { [studentId]: { [taskId]: boolean } }
  const [checklist, setChecklist] = useState({});
  const toggleCheck = (sid, tid, force) =>
    setChecklist((p) => ({
      ...p,
      [sid]: { ...(p[sid] || {}), [tid]: force ?? !p[sid]?.[tid] },
    }));

  // Modales
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "Lenguaje",
    grade: guideGrade,
    date: "",
  });

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFor, setReportFor] = useState(null); // { student, pend }
  const [reportObs, setReportObs] = useState("");
  const [reportChecks, setReportChecks] = useState({}); // { taskId: boolean }

  // Pendientes por alumno (todo lo del grado guía menos lo marcado como hecho)
  const pendingByStudent = useMemo(() => {
    const gradeTasks = tasks.filter((t) => t.grade === guideGrade);
    const map = {};
    students.forEach((s) => {
      const done = checklist[s.id] || {};
      map[s.id] = gradeTasks.filter((t) => !done[t.id]);
    });
    return map;
  }, [students, tasks, checklist, guideGrade]);

  // ===== Seguimiento filtrado por materia
  const [segSubject, setSegSubject] = useState(SUBJECTS[0]);

  // Solo tareas del grado guía + materia seleccionada
  const segTasks = useMemo(
    () => tasks.filter((t) => t.grade === guideGrade && t.subject === segSubject),
    [tasks, guideGrade, segSubject]
  );

  // Guardar nueva tarea
  const saveNewTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.date) return;
    setTasks((p) => [...p, { id: `t${Date.now()}`, ...newTask }]);
    setShowTaskModal(false);
    setNewTask({ title: "", subject: "Lenguaje", grade: guideGrade, date: "" });
  };

  const openReport = (student) => {
    const pend = pendingByStudent[student.id] || [];
    setReportFor({ student, pend });
    const initial = {};
    pend.forEach((t) => (initial[t.id] = false));
    setReportChecks(initial);
    setReportObs("");
    setShowReportModal(true);
  };

  const saveReport = () => {
    setShowReportModal(false);
    alert("Reporte guardado (simulado).");
  };

  // ===== Helpers Seguimiento
  const markColumnForAll = (taskId, checked) => {
    setChecklist((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.id] = next[s.id] || {};
        next[s.id][taskId] = checked;
      });
      return next;
    });
  };

  const markRow = (studentId, checked) => {
    setChecklist((prev) => {
      const next = { ...prev };
      next[studentId] = next[studentId] || {};
      segTasks.forEach((t) => (next[studentId][t.id] = checked));
      return next;
    });
  };

  const progressOf = (studentId) => {
    const total = segTasks.length || 1;
    const done = segTasks.filter((t) => checklist?.[studentId]?.[t.id]).length;
    return Math.round((done / total) * 100);
  };

  return (
    <div className="tdb-page">
      {/* HEADER */}
      <header className="tdb-header">
        <div className="tdb-header-inner">
          {/* ⬆️ El tamaño real lo controlamos en CSS (.tdb-logo) */}
          <img src={logoColegio} alt="Colegio Mixto El Jardín" className="tdb-logo" />
          <div className="tdb-titleBlock">
            <h1>COLEGIO MIXTO EL JARDÍN</h1>
            <p>San Raymundo — Panel Docente</p>
          </div>
        </div>

        <div className="tdb-headActions">
          <button className="tdb-btn tdb-btn--ghost" onClick={() => setShowTaskModal(true)}>
            + Nueva tarea
          </button>
          <button className="tdb-btn tdb-btn--primary">Exportar</button>
          <button className="tdb-btn tdb-btn--secondary" onClick={() => navigate("/panel")}>
            ⬅ Volver a Panel de Roles
          </button>
        </div>

        {/* ⬇️ Tabs: solo Seguimiento y Reportes */}
        <nav className="tdb-tabs">
          {["seguimiento", "reportes"].map((k) => (
            <button
              key={k}
              className={`tdb-tab ${activeTab === k ? "active" : ""}`}
              onClick={() => setActiveTab(k)}
            >
              {k === "seguimiento" ? "Seguimiento" : "Reportes"}
            </button>
          ))}
        </nav>
      </header>

      <main className="tdb-main">
        {/* -------------- SEGUIMIENTO -------------- */}
        {activeTab === "seguimiento" && (
          <section className="tdb-section">
            <div className="tdb-card">
              <div className="tdb-cardTitle">
                Seguimiento de tareas — <strong>{guideGrade}</strong>
              </div>

              {/* Filtros Seguimiento */}
              <div className="tdb-followToolbar">
                <div className="tdb-followGroup">
                  <label className="tdb-label">Grado</label>
                  <select
                    className="tdb-select"
                    value={guideGrade}
                    onChange={(e) => {
                      setGuideGrade(e.target.value);
                      // si el usuario abre modal, por defecto la tarea se va al mismo grado
                      setNewTask((p) => ({ ...p, grade: e.target.value }));
                    }}
                  >
                    {GRADES.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="tdb-followGroup">
                  <label className="tdb-label">Materia</label>
                  <div className="tdb-chipRow">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`tdb-chip ${segSubject === s ? "active" : ""}`}
                        onClick={() => setSegSubject(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tdb-followMeta">
                  <span className="tdb-muted">
                    {segTasks.length ? `${segTasks.length} tareas visibles` : "Sin tareas en esta materia"}
                  </span>
                </div>
              </div>

              {/* Matriz */}
              <div className="tdb-trackWrap">
                <table className="tdb-matrix">
                  <thead>
                    <tr>
                      <th className="sticky-left">Alumno</th>
                      {segTasks.map((t) => (
                        <th key={`h-${t.id}`}>
                          <div className="th-col">
                            <span className="th-title" title={`${t.subject} — ${t.title}`}>
                              {t.title}
                            </span>
                            <label className="th-check">
                              <input
                                type="checkbox"
                                onChange={(e) => markColumnForAll(t.id, e.target.checked)}
                                aria-label={`Marcar todos en ${t.title}`}
                              />
                              <small>todos</small>
                            </label>
                          </div>
                        </th>
                      ))}
                      <th>Progreso</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td className="sticky-left">
                          <div className="td-rowName">
                            <label className="th-check">
                              <input
                                type="checkbox"
                                onChange={(e) => markRow(s.id, e.target.checked)}
                                aria-label={`Marcar toda la fila de ${s.name}`}
                              />
                              <small>fila</small>
                            </label>
                            <span>{s.name}</span>
                          </div>
                        </td>

                        {segTasks.map((t) => (
                          <td key={`${s.id}-${t.id}`} className="td-center">
                            <input
                              className="chk"
                              type="checkbox"
                              checked={!!checklist?.[s.id]?.[t.id]}
                              onChange={() => toggleCheck(s.id, t.id)}
                              aria-label={`${s.name} completó ${t.title}`}
                            />
                          </td>
                        ))}

                        <td>
                          <div className="td-progress">
                            <div style={{ width: `${progressOf(s.id)}%` }} />
                          </div>
                          <small className="muted">{progressOf(s.id)}%</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="tdb-actionsRow">
                <button className="tdb-btn tdb-btn--ghost" onClick={() => setChecklist({})}>
                  Limpiar selección
                </button>
                <button
                  className="tdb-btn tdb-btn--primary"
                  onClick={() => alert("Progreso guardado (demo)")}
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ----------------- REPORTES ---------------- */}
        {activeTab === "reportes" && (
          <section className="tdb-section">
            <div className="tdb-controlsRow">
              <select
                className="tdb-select"
                value={guideGrade}
                onChange={(e) => setGuideGrade(e.target.value)}
              >
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <button
                className="tdb-btn tdb-btn--whatsapp"
                onClick={() => alert("WhatsApp masivo (simulado)")}
              >
                🟢 Enviar WhatsApp masivo
              </button>
            </div>

            <div className="tdb-gridCards">
              {students.map((s) => (
                <article key={s.id} className="tdb-reportCard">
                  <div className="tdb-reportHeader">
                    <div>
                      <div className="tdb-stuBold">{s.name}</div>
                      <div className="tdb-stuMeta">{guideGrade} — Mis materias</div>
                    </div>
                    <button
                      className="tdb-btn tdb-btn--whatsapp"
                      onClick={() =>
                        alert(`Enviar WhatsApp a papá/mamá de ${s.name} (simulado)`)
                      }
                    >
                      WhatsApp
                    </button>
                  </div>

                  <div className="tdb-reportBody">
                    <div className="tdb-reportTitle">Tareas pendientes:</div>
                    <ul className="tdb-bulletList">
                      {(pendingByStudent[s.id] || []).map((t) => (
                        <li key={t.id}>
                          <span className="tdb-dot" />
                          {t.title} <em className="tdb-muted">({t.subject})</em>
                        </li>
                      ))}
                      {(!pendingByStudent[s.id] || pendingByStudent[s.id].length === 0) && (
                        <li className="tdb-muted">Sin pendientes 🎉</li>
                      )}
                    </ul>

                    <div className="tdb-actionsRight">
                      <button className="tdb-btn" onClick={() => openReport(s)}>
                        ✏️ Editar reporte
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* -------- MODAL: NUEVA TAREA -------- */}
      {showTaskModal && (
        <div className="tdb-modal" role="dialog" aria-modal="true">
          <div className="tdb-modalCard">
            <div className="tdb-modalHeader">
              <h3>➕ Nueva tarea</h3>
              <button className="tdb-x" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>

            <form onSubmit={saveNewTask} className="tdb-form">
              <label className="tdb-label">Título / descripción corta</label>
              <textarea
                className="tdb-textarea"
                rows={4}
                placeholder="Descripción / instrucciones…"
                value={newTask.title}
                onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
              />

              <div className="tdb-formRow">
                <div className="tdb-formCol">
                  <label className="tdb-label">Materia</label>
                  <div className="tdb-chipRow">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`tdb-chip ${newTask.subject === s ? "active" : ""}`}
                        onClick={() => setNewTask((p) => ({ ...p, subject: s }))}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="tdb-formRow">
                <div className="tdb-formCol">
                  <label className="tdb-label">Grado</label>
                  <select
                    className="tdb-select"
                    value={newTask.grade}
                    onChange={(e) => setNewTask((p) => ({ ...p, grade: e.target.value }))}
                  >
                    {GRADES.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="tdb-formCol">
                  <label className="tdb-label">Fecha</label>
                  <input
                    type="date"
                    className="tdb-input"
                    value={newTask.date}
                    onChange={(e) => setNewTask((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="tdb-modalActions">
                <button type="button" className="tdb-btn tdb-btn--ghost" onClick={() => setShowTaskModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="tdb-btn tdb-btn--success">
                  Guardar 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- MODAL: EDITAR REPORTE -------- */}
      {showReportModal && reportFor && (
        <div className="tdb-modal" role="dialog" aria-modal="true">
          <div className="tdb-modalCard wide">
            <div className="tdb-modalHeader">
              <h3>Editar Reporte — {reportFor.student.name}</h3>
              <button className="tdb-x" onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <div className="tdb-modalBody">
              <div className="tdb-infoBox tdb-grid2">
                <div><strong>Grado:</strong> {guideGrade}</div>
                <div><strong>Materia(s):</strong> {SUBJECTS.join(", ")}</div>
                <div><strong>Quincena:</strong> 01–15 agosto 2025</div>
              </div>

              <div className="tdb-card tdb-card--flat">
                <div className="tdb-cardTitle">Tareas pendientes</div>
                <ul className="tdb-reportList">
                  {reportFor.pend.length ? (
                    reportFor.pend.map((t) => (
                      <li key={t.id} className="tdb-reportItem">
                        <label className="tdb-check big">
                          <input
                            type="checkbox"
                            checked={!!reportChecks[t.id]}
                            onChange={() =>
                              setReportChecks((p) => ({ ...p, [t.id]: !p[t.id] }))
                            }
                          />
                          <span />
                        </label>
                        <div className="tdb-reportText">
                          <div className="tdb-taskTitle">{t.title}</div>
                          <div className="tdb-taskMeta">
                            <em>{t.subject}</em> — {new Date(t.date).toLocaleDateString()}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="tdb-muted">Sin pendientes 🎉</li>
                  )}
                </ul>
              </div>

              <label className="tdb-label mt8">Observaciones</label>
              <textarea
                className="tdb-textarea"
                rows={5}
                placeholder="Escribe observaciones para padres/encargados…"
                value={reportObs}
                onChange={(e) => setReportObs(e.target.value)}
              />
            </div>

            <div className="tdb-modalActions">
              <button className="tdb-btn tdb-btn--ghost" onClick={() => setShowReportModal(false)}>
                Cancelar
              </button>
              <button className="tdb-btn tdb-btn--success" onClick={saveReport}>
                Guardar 💾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}