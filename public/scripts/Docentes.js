// src/modules/docentes/Docentes.js
import React from "react";
import {  Routes, Route } from "react-router-dom";
import RegistroDocente from "./RegistroDocente";

export default function Docentes() {
  return (
   
      <Routes>
        <Route path="registro" element={<RegistroDocente />} />
        <Route index element={<div>Selecciona “Registro de docentes”.</div>} />
      </Routes>

  );
}