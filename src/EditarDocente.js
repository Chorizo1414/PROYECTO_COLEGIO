import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import "./css/EditarDocente.css"; // Usaremos un nuevo CSS para mantener el estilo

export default function EditarDocente() {
  const { cui } = useParams(); // Obtiene el CUI de la URL
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre_completo: "",
    grado_guia: "",
    email: "",
    telefono: "",
    estado_id: "1",
    username: "",
    password: "", // Contraseña vacía por defecto
  });
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        // Cargar los grados para el <select>
        const gradosRes = await axios.get('http://localhost:4000/api/grades', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setGrados(gradosRes.data);

        // Cargar los datos del docente a editar
        const docenteRes = await axios.get(`http://localhost:4000/api/teachers/${cui}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setForm({
            ...docenteRes.data,
            grado_guia: docenteRes.data.grado_guia || "",
            password: "" // Dejar la contraseña vacía en el formulario
        });

      } catch (error) {
        alert("Error al cargar los datos del docente.");
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cui]);

  const onChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    
    // Quitamos la contraseña del objeto si está vacía
    const dataToSubmit = { ...form };
    if (!dataToSubmit.password) {
      delete dataToSubmit.password;
    }

    try {
      await axios.put(`http://localhost:4000/api/teachers/${cui}`, dataToSubmit, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('¡Docente actualizado con éxito!');
      navigate('/docentes');
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Ocurrió un error inesperado.";
      alert('Error al guardar: ' + errorMessage);
    }
  };
  
  if (loading) return <div>Cargando...</div>;

  return (
    <div className="tedit-container">
      <div className="tedit-card">
        <header className="tedit-header">
          <h1>Editar Docente</h1>
        </header>
        <form className="tedit-form" onSubmit={onSubmit}>
          <label className="tedit-label">CUI del Docente (no editable)</label>
          <input className="tedit-input" value={form.cui_docente} disabled />
          
          <label className="tedit-label" htmlFor="nombre_completo">Nombre Completo</label>
          <input id="nombre_completo" name="nombre_completo" className="tedit-input" value={form.nombre_completo} onChange={onChange} maxLength={100} required />
          
          <label className="tedit-label" htmlFor="username">Nombre de Usuario</label>
          <input id="username" name="username" className="tedit-input" value={form.username} onChange={onChange} required />
          
          <label className="tedit-label" htmlFor="password">Nueva Contraseña</label>
          <input id="password" name="password" type="password" className="tedit-input" value={form.password} onChange={onChange} placeholder="Dejar en blanco para no cambiar" />
          
          <label className="tedit-label" htmlFor="grado_guia">Grado Guía (opcional)</label>
          <select id="grado_guia" name="grado_guia" className="tedit-input" value={form.grado_guia} onChange={onChange}>
            <option value="">-- No Asignado --</option>
            {grados.map((grado) => (<option key={grado.id_grado} value={grado.id_grado}>{grado.nombre_grado}</option>))}
          </select>

          <label className="tedit-label" htmlFor="email">Correo (opcional)</label>
          <input id="email" name="email" type="email" className="tedit-input" value={form.email} onChange={onChange} maxLength={50} />
          
          <label className="tedit-label" htmlFor="telefono">Teléfono (opcional)</label>
          <input id="telefono" name="telefono" className="tedit-input" value={form.telefono} onChange={onChange} maxLength={20} />
          
          <fieldset className="tedit-fieldset">
            <legend className="tedit-legend">Estado del Docente</legend>
            <div className="tedit-radio-row">
              <label className="tedit-radio">
                <input type="radio" name="estado_id" value="1" checked={form.estado_id.toString() === "1"} onChange={onChange} required />
                <span>Activo</span>
              </label>
              <label className="tedit-radio">
                <input type="radio" name="estado_id" value="2" checked={form.estado_id.toString() === "2"} onChange={onChange} />
                <span>Inactivo</span>
              </label>
            </div>
          </fieldset>
          <div className="tedit-actions">
            <button className="tedit-save" type="submit">Guardar Cambios</button>
          </div>
        </form>
        <footer className="tedit-footer">
          <Link to="/docentes" className="tedit-back">Cancelar y Volver</Link>
        </footer>
      </div>
    </div>
  );
}