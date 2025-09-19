import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import PanelRoles from "./PanelRoles";
import ProtectedRoute from "./ProtectedRoute";
import ParentRegister from "./ParentRegister";
import SecretaryPayments from "./SecretaryPayments";
import TeacherDashboard from "./TeacherDashboard";
import Docentes from "./Docentes";
import CoordinatorDashboard from "./CoordinatorDashboard";
import Alumnos from "./Alumnos";
import AsignarCursos from "./AsignarCursos";
import Cursos from "./Cursos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/panel" element={<ProtectedRoute><PanelRoles/></ProtectedRoute>} />
        <Route path="/coordinator/dashboard" element={<ProtectedRoute><CoordinatorDashboard/></ProtectedRoute>} />
        
        {/* --- MÓDULOS --- */}
        <Route path="/docentes/*" element={<ProtectedRoute><Docentes/></ProtectedRoute>} />
        <Route path="/alumnos/*" element={<ProtectedRoute><Alumnos/></ProtectedRoute>} />
        <Route path="/asignar-cursos" element={<ProtectedRoute><AsignarCursos/></ProtectedRoute>} />
        
        {/* RUTA CORREGIDA PARA GESTIONAR CURSOS */}
        <Route path="/gestionar-cursos/*" element={<ProtectedRoute><Cursos/></ProtectedRoute>} />

        {/* --- RUTAS INDIVIDUALES --- */}
        <Route path="/parent-register" element={<ProtectedRoute><ParentRegister/></ProtectedRoute>} />
        <Route path="/panel/secretaria" element={<ProtectedRoute><SecretaryPayments/></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard/></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}