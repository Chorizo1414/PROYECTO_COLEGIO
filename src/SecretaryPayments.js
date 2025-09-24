import { auth } from './auth';
import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./css/SecretaryPayments.css";

const MessageEditorModal = ({ student, onClose, onSend }) => {
    const defaultMessage = `Estimado/a ${student.nombre_padre}, le saludamos del Colegio "El Jardín". Le recordamos amablemente que el pago de la colegiatura para el/la estudiante ${student.nombre_completo} se encuentra pendiente. ¡Gracias!`;
    const [message, setMessage] = useState(defaultMessage);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        setIsSending(true);
        await onSend(message);
        setIsSending(false);
        onClose();
    };

    return (
      <div className="pagina-centrada">
          <div className="sp-modalMask">
              <div className="sp-modal">
                  <div className="sp-modalHead">
                      <h3>Editar Mensaje para <span>{student.nombre_completo}</span></h3>
                      <button onClick={onClose} className="sp-close">✕</button>
                  </div>
                  <textarea 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      rows="5"
                      className="sp-textarea"
                  />
                  <div className="sp-modalFoot">
                      <button onClick={onClose} className="sp-btn sp-btn--ghost">Cancelar</button>
                      <button onClick={handleSend} disabled={isSending} className="sp-btn sp-btn--primary">
                          {isSending ? "Enviando..." : "Enviar Recordatorio"}
                      </button>
                  </div>
              </div>
          </div>
        </div>
    );
};

export default function SecretaryPayments() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();
  const role = auth.getRole();
  const isSecretary = role === 3;
  const backPath = isSecretary ? '/secretary/dashboard' : '/coordinator/dashboard';

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(res.data);
    } catch (err) {
      setError("No se pudieron cargar los datos de los estudiantes.");
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markAsSolvent = async (cui_estudiante) => {
    if (window.confirm("¿Confirmas que el estudiante está solvente para el mes actual?")) {
      try {
        const token = localStorage.getItem('accessToken');

        await axios.put(`${process.env.REACT_APP_API_URL}/api/students/financial-status/${cui_estudiante}`, 
          { estado: 'Solvente' }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert("Estado actualizado a solvente.");
        fetchData();
      } catch (err) {
        alert("Error al actualizar el estado.");
        console.error("Error updating status:", err);
      }
    }
  };

  const sendReminder = async (customMessage) => {
    try {
        const token = localStorage.getItem('accessToken');
        const payload = {
            studentCUIs: [editingStudent.cui_estudiante],
            customMessage: customMessage
        };

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications/payment-reminder`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert(response.data.msg);
    } catch (err) {
        alert("Error al enviar el recordatorio.");
        console.error("Error sending reminder:", err);
    }
  };

  const filteredStudents = useMemo(() => 
    students.filter(s => 
      s.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.cui_estudiante.toString().includes(searchTerm)
    ), 
    [students, searchTerm]
  );
  
  if (loading) return <div className="sp-page">Cargando...</div>;
  if (error) return <div className="sp-page"><div className="sp-error">{error}</div></div>;

  return (
    <div className="sp-page">
      {editingStudent && (
          <MessageEditorModal 
              student={editingStudent} 
              onClose={() => setEditingStudent(null)} 
              onSend={sendReminder}
          />
      )}
      <div className="sp-container">
        <header className="sp-header">
          <h1>Panel de Pagos y Solvencia</h1>
          <p>Estado financiero de los estudiantes para el mes en curso.</p>
        </header>

        <nav className="sp-navbar">
          <button className="sp-btn sp-btn--secondary" onClick={() => navigate(backPath)}>
            ⬅ Volver al Panel
          </button>
          <input 
            type="text"
            className="sp-search"
            placeholder="Buscar por nombre o CUI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </nav>

        <section className="sp-main-content">
          <div className="sp-grid">
            {filteredStudents.map(s => (
              <article key={s.cui_estudiante} className="sp-card">
                <div className="sp-cardTop">
                  <div className="sp-cardInfo">
                    <h3 className="sp-studentName">{s.nombre_completo}</h3>
                    <p className="sp-details">
                      <strong>CUI:</strong> {s.cui_estudiante}
                      <br />
                      <strong>Padre:</strong> {s.nombre_padre || 'No asignado'}
                      <br />
                      <strong>Teléfono:</strong> {s.telefono || 'No asignado'}
                    </p>
                  </div>
                  <div className={`sp-badge ${s.estado_pago === "PENDIENTE" ? "pendiente" : "aldia"}`}>
                    {s.estado_pago === "PENDIENTE" ? "Pago pendiente" : "Al día"}
                  </div>
                </div>
                
                {isSecretary && s.estado_pago === 'PENDIENTE' && (
                  <div className="sp-actions">
                    <button className="sp-chip sp-chipYellow" onClick={() => setEditingStudent(s)}>
                      ✏️ Editar y Enviar
                    </button>
                    <button 
                      className="sp-chip sp-chipBlue" 
                      onClick={() => markAsSolvent(s.cui_estudiante)}
                    >
                      ✅ Marcar solvente
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}