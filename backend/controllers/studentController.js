const pool = require('../config/db'); // Importamos la conexión a la BD

// --- Crear un nuevo estudiante ---
const createStudent = async (req, res) => {
  // Obtenemos los datos del cuerpo de la petición (que enviará React)
  const { cui_estudiante, nombres, apellidos, fecha_nacimiento, genero_id, id_grado, id_seccion, usuario_agrego } = req.body;

  try {
    const newStudent = await pool.query(
      "INSERT INTO estudiantes (cui_estudiante, nombres, apellidos, fecha_nacimiento, genero_id, id_grado, id_seccion, usuario_agrego, estado_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1) RETURNING *",
      [cui_estudiante, nombres, apellidos, fecha_nacimiento, genero_id, id_grado, id_seccion, usuario_agrego]
    );
    res.status(201).json(newStudent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Obtener todos los estudiantes ---
const getAllStudents = async (req, res) => {
  try {
    const allStudents = await pool.query("SELECT * FROM estudiantes ORDER BY apellidos, nombres");
    res.json(allStudents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = {
  createStudent,
  getAllStudents
};