import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import PanelRoles from "./PanelRoles";
import ProtectedRoute from "./ProtectedRoute";
import StudentRegister from "./StudentRegister";
import ParentRegister from "./ParentRegister";
import SecretaryPayments from "./SecretaryPayments";
import TeacherDashboard from "./TeacherDashboard";
import Docentes from "./Docentes";
import CoordinatorDashboard from "./CoordinatorDashboard"; // <-- 1. IMPORTAR

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* PanelRoles ahora es solo un intermediario */}
        <Route path="/panel" element={<ProtectedRoute><PanelRoles /></ProtectedRoute>} />

        {/* 2. AÑADIR LA NUEVA RUTA PARA EL PANEL DE COORDINACIÓN */}
        <Route path="/coordinator/dashboard" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />

        <Route path="/docentes/*" element={<ProtectedRoute><Docentes /></ProtectedRoute>} />
        <Route path="/student-register" element={<ProtectedRoute><StudentRegister /></ProtectedRoute>} />
        <Route path="/parent-register" element={<ProtectedRoute><ParentRegister /></ProtectedRoute>} />
        <Route path="/panel/secretaria" element={<ProtectedRoute><SecretaryPayments /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

