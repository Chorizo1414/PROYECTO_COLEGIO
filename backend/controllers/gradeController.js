// backend/controllers/gradeController.js
const pool = require('../config/db');

const getAllGrades = async (req, res) => {
  try {
    const sql = `
      SELECT g.id_grado, g.nombre_grado
      FROM mat_jardin.grados g
      ORDER BY g.id_grado;
    `;
    const { rows } = await pool.query(sql);
    return res.json(rows);
  } catch (err) {
    console.error('Error listando grados:', err);
    return res.status(500).send('Error en el servidor');
  }
};

module.exports = { getAllGrades };
