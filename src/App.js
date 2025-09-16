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
// importa tus otras pantallas si faltan...

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <PanelRoles />
            </ProtectedRoute>
          }
        />

        {/* Módulo Docentes con subrutas (ej. /docentes/registro) */}
        <Route
          path="/docentes/*"
          element={
            <ProtectedRoute>
              <Docentes />
            </ProtectedRoute>
          }
        />

        {/* Rutas de registro */}
        <Route
          path="/student-register"
          element={
            <ProtectedRoute>
              <StudentRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent-register"
          element={
            <ProtectedRoute>
              <ParentRegister />
            </ProtectedRoute>
          }
        />

        {/* Ejemplos de rutas por rol */}
        <Route
          path="/panel/secretaria"
          element={
            <ProtectedRoute>
              <SecretaryPayments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel/maestros"
          element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}