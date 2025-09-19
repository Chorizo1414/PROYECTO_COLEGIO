const pool = require('../config/db');

// OBTENER TODAS LAS ASIGNACIONES ACTUALES
const getAsignaciones = async (req, res) => {
  try {
    const query = `
      SELECT 
        ac.id_asignacion,
        d.nombre_completo AS docente,
        c.nombre_curso AS curso,
        g.nombre_grado AS grado,
        s.nombre_seccion AS seccion,
        ac.anio
      FROM asignacion_curso ac
      JOIN docentes d ON ac.cui_docente = d.cui_docente
      JOIN cursos c ON ac.id_curso = c.id_curso
      JOIN grados g ON ac.id_grado = g.id_grado
      JOIN secciones s ON ac.id_seccion = s.id_seccion
      WHERE d.estado_id = 1
      ORDER BY d.nombre_completo, ac.anio DESC, g.nombre_grado, c.nombre_curso;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener asignaciones:', err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// CREAR UNA NUEVA ASIGNACIÓN
const createAsignacion = async (req, res) => {
  const { cui_docente, id_curso, id_grado, id_seccion, anio } = req.body;
  const usuario_agrego = req.user.username;

  try {
    const query = `
      INSERT INTO asignacion_curso (cui_docente, id_curso, id_grado, id_seccion, anio, estado_id, usuario_agrego)
      VALUES ($1, $2, $3, $4, $5, 1, $6)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [cui_docente, id_curso, id_grado, id_seccion, anio, usuario_agrego]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al crear asignación:', err.message);
    if (err.code === '23505') { // unique_violation
      return res.status(400).json({ msg: 'Esta asignación ya existe.' });
    }
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// ELIMINAR UNA ASIGNACIÓN
const deleteAsignacion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM asignacion_curso WHERE id_asignacion = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ msg: 'Asignación no encontrada.' });
    }
    res.json({ msg: 'Asignación eliminada con éxito.' });
  } catch (err) {
    console.error('Error al eliminar asignación:', err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// OBTENER CURSOS POR GRADO
const getCursosByGrado = async (req, res) => {
    const { gradeId } = req.params;
    try {
        const query = 'SELECT id_curso, nombre_curso FROM cursos WHERE id_grado = $1 OR id_grado IS NULL ORDER BY nombre_curso';
        const { rows } = await pool.query(query, [gradeId]);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener cursos por grado:', err.message);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

module.exports = {
  getAsignaciones,
  createAsignacion,
  deleteAsignacion,
  getCursosByGrado,
};