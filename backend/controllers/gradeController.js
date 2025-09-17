const pool = require('../config/db');

// --- Obtener todos los Grados ---
const getAllGrades = async (req, res) => {
  try {
    // Obtenemos solo los grados activos, ordenados por su ID
    const result = await pool.query("SELECT id_grado, nombre_grado FROM grados WHERE estado_id = 1 ORDER BY id_grado");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

module.exports = {
  getAllGrades,
};