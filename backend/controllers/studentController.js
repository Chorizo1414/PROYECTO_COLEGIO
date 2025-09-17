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

// --- Obtener todos los Estudiantes con detalles para Secretaría (VERSIÓN MEJORADA) ---
const getStudentsWithDetails = async (req, res) => {
  try {
    // Obtenemos el período actual en formato 'YYYY-MM', ej: '2025-09'
    const currentPeriod = new Date().toISOString().slice(0, 7);

    const query = `
      SELECT
        e.cui_estudiante,
        e.nombres || ' ' || e.apellidos AS nombre_completo,
        p.nombre_completo AS nombre_padre,
        p.telefono,
        g.nombre_grado,
        -- Ahora el estado es dinámico:
        -- Si existe un registro 'Solvente' para el mes actual, se muestra 'AL_DIA'.
        -- Si no, se muestra 'PENDIENTE'.
        CASE 
          WHEN ef.estado = 'Solvente' THEN 'AL_DIA'
          ELSE 'PENDIENTE'
        END AS estado_pago
      FROM estudiantes e
      LEFT JOIN grados g ON e.id_grado = g.id_grado
      LEFT JOIN alumno_responsable ar ON e.cui_estudiante = ar.cui_estudiante AND ar.principal = TRUE
      LEFT JOIN padres p ON ar.cui_padre = p.cui_padre
      -- Hacemos un LEFT JOIN con el estado financiero SOLO para el período actual
      LEFT JOIN estado_financiero ef ON e.cui_estudiante = ef.cui_estudiante AND ef.periodo = $1
      ORDER BY e.apellidos, e.nombres;
    `;
    const { rows } = await pool.query(query, [currentPeriod]); // Pasamos el período actual como parámetro
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// --- Marcar un estudiante como solvente para un período ---
const updateFinancialStatus = async (req, res) => {
  const { cui_estudiante, periodo } = req.body; // ej. periodo: '2025-09'

  try {
    // Usamos INSERT ... ON CONFLICT para crear o actualizar el registro.
    const query = `
      INSERT INTO estado_financiero (cui_estudiante, periodo, estado, cuotas_pendientes)
      VALUES ($1, $2, 'Solvente', 0)
      ON CONFLICT (cui_estudiante, periodo) 
      DO UPDATE SET 
        estado = EXCLUDED.estado,
        cuotas_pendientes = EXCLUDED.cuotas_pendientes,
        actualizado_en = NOW();
    `;
    await pool.query(query, [cui_estudiante, periodo]);
    res.json({ msg: 'Estado financiero actualizado a Solvente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar el estado financiero');
  }
};


// No olvides exportar las nuevas funciones al final del archivo
module.exports = {
  createStudent,
  getAllStudents,
  linkParentToStudent,
  getStudentsWithDetails, // <--- AÑADE ESTA LÍNEA
  updateFinancialStatus,  // <--- Y ESTA LÍNEA
};