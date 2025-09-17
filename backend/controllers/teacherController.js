const pool = require('../config/db');

// --- Crear un nuevo Docente ---
const createTeacher = async (req, res) => {
  const { cui_docente, nombre_completo, grado_guia, email, telefono, estado_id, usuario_agrego } = req.body;

  try {
    const newTeacher = await pool.query(
      "INSERT INTO docentes (cui_docente, nombre_completo, grado_guia, email, telefono, estado_id, usuario_agrego) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [cui_docente, nombre_completo, grado_guia, email, telefono, estado_id, usuario_agrego]
    );
    res.status(201).json(newTeacher.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = {
  createTeacher,
};