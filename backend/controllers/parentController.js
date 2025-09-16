const pool = require('../config/db'); // Importa la conexión

// --- Crear un nuevo Padre/Encargado ---
const createParent = async (req, res) => {
  const { cui_padre, nombre_completo, direccion, telefono, usuario_agrego } = req.body;

  try {
    const newParent = await pool.query(
      "INSERT INTO padres (cui_padre, nombre_completo, direccion, telefono, usuario_agrego) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [cui_padre, nombre_completo, direccion, telefono, usuario_agrego]
    );
    res.status(201).json(newParent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Obtener todos los Padres/Encargados ---
const getAllParents = async (req, res) => {
    try {
        const allParents = await pool.query("SELECT * FROM padres ORDER BY nombre_completo");
        res.json(allParents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

module.exports = {
  createParent,
  getAllParents,
};