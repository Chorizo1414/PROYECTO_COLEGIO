import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './auth'; // 1. Importa nuestro manejador de auth
import logoColegio from './assets/logo-colegio.png';
import './css/Login.css';

function Login() {
  const [formData, setFormData] = useState({
    username: 'secretaria', // Valor por defecto para pruebas
    password: 'password123', // Valor por defecto para pruebas
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { username, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = 'http://localhost:4000/api/auth/login';
      const body = { username, password };
      const res = await axios.post(url, body);

      // 2. Usamos auth.login() para guardar el token
      auth.login(res.data.token);

      // Redirigimos al panel
      navigate('/panel');

    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Error al iniciar sesión';
      setError(errorMessage);
      console.error('Error de login:', err.response || err);
    }
  };

  // ... El resto de tu componente JSX se queda igual ...
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
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;