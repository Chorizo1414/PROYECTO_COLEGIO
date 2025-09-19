import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'; // Para redirigir
import axios from 'axios'; // Para llamar a la API
import "./css/ParentRegister.css";

export default function ParentRegister() {
  const [form, setForm] = useState({
    parentCui: "",
    parentName: "",
    phone: "",
    address: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const navigate = useNavigate(); 

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Obtener el token que guardaste en el login
    const token = localStorage.getItem('accessToken');

    // Verificación por si no hay token
    if (!token) {
      alert("Sesión no válida. Por favor, inicie sesión de nuevo.");
      navigate('/alumnos'); // Redirige al login
      return;
    }

    // 2. Preparar los datos con los nombres que espera tu API
    const parentData = {
      cui_padre: form.parentCui,
      nombre_completo: form.parentName,
      direccion: form.address,
      telefono: form.phone,
      usuario_agrego: "secretaria" // Puedes cambiar esto si lo obtienes del usuario logueado
    };

    // 3. Configurar los headers para enviar el token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    // 4. Enviar la petición al backend
    try {
      await axios.post('http://localhost:4000/api/parents', parentData, config);
      alert('¡Padre/Encargado guardado con éxito!');
      
      // Regresa al formulario de estudiante para continuar el flujo
      navigate('/alumnos'); 

    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message;
      console.error('Error al guardar el padre:', errorMessage);
      alert('Error al guardar: ' + errorMessage);
    }
  };

  const goBack = () => window.history.back();

  return (
    <div className="prg-page">
      <div className="prg-card">
        <h1 className="prg-title">REGISTRO DE PADRES</h1>

        <form onSubmit={onSubmit} className="prg-form">
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