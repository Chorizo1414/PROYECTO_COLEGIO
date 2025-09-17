const pool = require('../config/db'); // Importamos la conexión a la BD

// --- Crear un nuevo estudiante ---
const createStudent = async (req, res) => {
  // Obtenemos los datos del cuerpo de la petición
  const { cui_estudiante, nombres, apellidos, fecha_nacimiento, genero_id, id_grado, usuario_agrego } = req.body;
  // La sección es opcional: si no viene, será null.
  const id_seccion = req.body.id_seccion || null;

  try {
    const newStudent = await pool.query(
      "INSERT INTO estudiantes (cui_estudiante, nombres, apellidos, fecha_nacimiento, genero_id, id_grado, id_seccion, usuario_agrego, estado_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1) RETURNING *",
      // Pasamos la variable id_seccion que puede ser null
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

// --- Vincular un Padre a un Estudiante ---
const linkParentToStudent = async (req, res) => {
  const { cui_estudiante, cui_padre } = req.body;
  try {
    await pool.query(
      "INSERT INTO alumno_responsable (cui_estudiante, cui_padre, principal) VALUES ($1, $2, TRUE)",
      [cui_estudiante, cui_padre]
    );
    res.status(201).json({ msg: 'Padre vinculado correctamente al estudiante.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor al vincular.');
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  linkParentToStudent
};