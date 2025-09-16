// src/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importamos axios
import logoColegio from './assets/logo-colegio.png';
import './css/Login.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(''); // Estado para manejar errores
  const navigate = useNavigate();

  const { username, password } = formData;

  // Esta función actualiza el estado cada vez que escribes en un input
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Esta función se ejecuta cuando envías el formulario
  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos

    try {
      // La URL completa de tu API de login en el backend
      const url = 'http://localhost:4000/api/auth/login';

      const body = { username, password };

      // Hacemos la petición POST al backend
      const res = await axios.post(url, body);

      // Si el login es exitoso, el backend nos devuelve un token
      const { token } = res.data;

      // Guardamos el token en el almacenamiento local del navegador
      localStorage.setItem('token', token);

      // Redirigimos al usuario al panel de roles
      navigate('/panel');

    } catch (err) {
      // Si hay un error (ej. credenciales incorrectas), lo mostramos
      const errorMessage = err.response?.data?.msg || 'Error al iniciar sesión';
      setError(errorMessage);
      console.error('Error de login:', err.response || err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logoColegio} alt="Logo del Colegio" className="logo" />
        <h2>Iniciar Sesión</h2>
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          {/* Mostramos el mensaje de error si existe */}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;