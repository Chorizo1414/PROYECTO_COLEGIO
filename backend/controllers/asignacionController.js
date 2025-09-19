const pool = require('../config/db');

// OBTENER TODAS LAS ASIGNACIONES ACTUALES
const getAsignaciones = async (req, res) => {
  try {
    const query = `
      SELECT 
        ad.id_asignacion,
        d.nombre_completo AS docente,
        g.nombre_grado AS grado,
        s.nombre_seccion AS seccion,
        ad.anio,
        ARRAY_AGG(c.nombre_curso) as cursos -- Agrupamos los nombres de los cursos en un array
      FROM asignacion_docente ad
      JOIN docentes d ON ad.cui_docente = d.cui_docente
      JOIN grados g ON ad.id_grado = g.id_grado
      JOIN secciones s ON ad.id_seccion = s.id_seccion
      LEFT JOIN asignacion_cursos_detalle acd ON ad.id_asignacion = acd.id_asignacion
      LEFT JOIN cursos c ON acd.id_curso = c.id_curso
      WHERE d.estado_id = 1
      GROUP BY ad.id_asignacion, d.nombre_completo, g.nombre_grado, s.nombre_seccion, ad.anio
      ORDER BY d.nombre_completo, ad.anio DESC, g.nombre_grado;
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
  // Ahora recibimos un array 'cursos_ids' en lugar de un solo 'id_curso'
  const { cui_docente, id_grado, id_seccion, anio, cursos_ids } = req.body;
  const usuario_agrego = req.user.username;

  if (!cursos_ids || !Array.isArray(cursos_ids) || cursos_ids.length === 0) {
    return res.status(400).json({ msg: 'Debe seleccionar al menos un curso.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar en la tabla principal (ahora sin el curso)
    const asignacionQuery = `
      INSERT INTO asignacion_docente (cui_docente, id_grado, id_seccion, anio, estado_id, usuario_agrego)
      VALUES ($1, $2, $3, $4, 1, $5) -- <-- CAMBIO: Corregido a $5
      RETURNING id_asignacion;
    `;

    // La llamada a la consulta también debe coincidir con 5 parámetros
    const result = await client.query(asignacionQuery, [cui_docente, id_grado, id_seccion, anio, usuario_agrego]);
    const newAsignacionId = result.rows[0].id_asignacion;

    // 2. Insertar cada curso en la tabla detalle
    const detalleQuery = `
      INSERT INTO asignacion_cursos_detalle (id_asignacion, id_curso) VALUES ($1, $2);
    `;
    for (const id_curso of cursos_ids) {
      await client.query(detalleQuery, [newAsignacionId, id_curso]);
    }

    await client.query('COMMIT');
    res.status(201).json({ msg: 'Asignación creada con éxito.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear asignación:', err.message);
    if (err.code === '23505') { // unique_violation
      return res.status(400).json({ msg: 'Esta asignación ya existe o contiene cursos duplicados.' });
    }
    res.status(500).json({ msg: 'Error en el servidor' });
  } finally {
    client.release();
  }
};

// ELIMINAR UNA ASIGNACIÓN
const deleteAsignacion = async (req, res) => {
  const { id } = req.params;
  try {
    // <-- CAMBIO: Usa el nuevo nombre de la tabla 'asignacion_docente'
    const result = await pool.query('DELETE FROM asignacion_docente WHERE id_asignacion = $1', [id]);
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

// ACTUALIZAR UNA ASIGNACIÓN EXISTENTE
const updateAsignacion = async (req, res) => {
  const { id } = req.params;
  const { cui_docente, id_curso, id_grado, id_seccion, anio } = req.body;
  const usuario_modifico = req.user.username;

  try {
    const query = `
      UPDATE asignacion_curso 
      SET 
        cui_docente = $1, 
        id_curso = $2, 
        id_grado = $3, 
        id_seccion = $4, 
        anio = $5,
        usuario_modifico = $6,
        fecha_modifico = NOW()
      WHERE id_asignacion = $7
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [cui_docente, id_curso, id_grado, id_seccion, anio, usuario_modifico, id]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Asignación no encontrada para actualizar.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar asignación:', err.message);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  getAsignaciones,
  createAsignacion,
  deleteAsignacion,
  getCursosByGrado,
  updateAsignacion
};