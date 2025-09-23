// Estilos globales y de layout principal
import './css/index.css';

// Estilos de componentes de autenticación y navegación
import './css/Login.css';
import './css/PanelRoles.css';

// Estilos de los Dashboards o Paneles principales
import './css/AlumnosDashboard.css';
import './css/DocentesDashboard.css';
import './css/ParentDashboard.css';
import './css/SecretaryDashboard.css';
import './css/SecretaryPayments.css';
import './css/TeacherDashboard.css';

// Estilos para formularios de Registro y Edición
import './css/StudentRegister.css';
import './css/ParentRegister.css';
import './css/RegistroDocente.css';
import './css/EditarAlumno.css';
import './css/EditarDocente.css';

// Estilos para componentes de Gestión (Cursos, Asignaciones)
import './css/AsignarCursos.css';
import './css/GestionCursos.css';
import './css/SeleccionarDocente.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
