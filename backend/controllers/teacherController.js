const pool = require("../config/db");
const bcrypt = require('bcryptjs');

// --- REGISTRO COMPLETO DE DOCENTE Y USUARIO ---
const registerTeacherAndUser = async (req, res) => {
  const {
    cui_docente, nombre_completo, grado_guia, email, telefono, estado_id,
    username, password 
  } = req.body;
  
  // CORRECCIÓN: Obtenemos el usuario que agrega desde el token decodificado
  const usuario_agrego = req.user.username;

  if (!cui_docente || !nombre_completo || !estado_id || !username || !password) {
    return res.status(400).json({ msg: 'Faltan campos obligatorios.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const teacherQuery = `
      INSERT INTO docentes (cui_docente, nombre_completo, grado_guia, email, telefono, estado_id, usuario_agrego) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cui_docente`;
    
    await client.query(teacherQuery, [
      cui_docente, nombre_completo, grado_guia || null, email || null, telefono || null, estado_id, usuario_agrego
    ]);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userQuery = `
      INSERT INTO usuarios (username, password, rol_id, cui_docente, estado_id, usuario_agrego) 
      VALUES ($1, $2, $3, $4, $5, $6)`;

    await client.query(userQuery, [
      username, hashedPassword, 3, cui_docente, estado_id, usuario_agrego
    ]);
    
    await client.query('COMMIT');

    res.status(201).json({ msg: 'Docente y usuario creados con éxito.' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error en el registro de docente:", err.message);
    
    if (err.code === '23505') {
        return res.status(400).json({ msg: 'El CUI o el nombre de usuario ya existen.' });
    }
    res.status(500).send("Error en el servidor");
  } finally {
    client.release();
  }
};

// --- OBTENER ASIGNACIONES (Función existente) ---
const getTeacherAssignments = async (req, res) => {
  try {
    const cui_docente = req.user.cui_docente;
    if (!cui_docente) {
      return res.status(403).json({ msg: "Acceso denegado. Usuario no es un docente." });
    }
    const query = `
      SELECT ac.id_asignacion, c.nombre_curso, g.nombre_grado, s.nombre_seccion
      FROM asignacion_curso ac
      JOIN cursos c ON ac.id_curso = c.id_curso
      JOIN grados g ON ac.id_grado = g.id_grado
      JOIN secciones s ON ac.id_seccion = s.id_seccion
      WHERE ac.cui_docente = $1 ORDER BY g.nombre_grado, c.nombre_curso;
    `;
    const { rows } = await pool.query(query, [cui_docente]);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// --- OBTENER DATOS DE LA ASIGNACIÓN (Función existente) ---
const getAssignmentData = async (req, res) => {
  const { assignmentId } = req.params;
  try {
    const asignacionQuery = await pool.query("SELECT id_grado, id_seccion FROM asignacion_curso WHERE id_asignacion = $1", [assignmentId]);
    if (asignacionQuery.rows.length === 0) return res.status(404).json({ msg: "Asignación no encontrada" });
    const { id_grado, id_seccion } = asignacionQuery.rows[0];
    const studentsQuery = await pool.query("SELECT cui_estudiante, nombres, apellidos FROM estudiantes WHERE id_grado = $1 AND id_seccion = $2 ORDER BY apellidos, nombres", [id_grado, id_seccion]);
    const tasksQuery = await pool.query("SELECT id_tarea, titulo, fecha_entrega FROM tareas WHERE id_asignacion = $1 ORDER BY fecha_entrega DESC", [assignmentId]);
    const deliveriesQuery = await pool.query(`SELECT e.cui_estudiante, e.id_tarea, e.entregado FROM entregas e JOIN tareas t ON e.id_tarea = t.id_tarea WHERE t.id_asignacion = $1`, [assignmentId]);
    const deliveriesMap = deliveriesQuery.rows.reduce((acc, delivery) => {
      if (!acc[delivery.cui_estudiante]) acc[delivery.cui_estudiante] = {};
      acc[delivery.cui_estudiante][delivery.id_tarea] = delivery.entregado;
      return acc;
    }, {});
    res.json({ students: studentsQuery.rows, tasks: tasksQuery.rows, deliveries: deliveriesMap });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// --- CREAR TAREA (Función existente) ---
const createTask = async (req, res) => {
    const { id_asignacion, titulo, fecha_entrega } = req.body;
    try {
        const result = await pool.query("INSERT INTO tareas (id_asignacion, titulo, fecha_entrega) VALUES ($1, $2, $3) RETURNING *", [id_asignacion, titulo, fecha_entrega]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
}

// --- GUARDAR ENTREGAS (Función existente) ---
const saveDeliveries = async (req, res) => {
    const { deliveries } = req.body;
    if (!Array.isArray(deliveries) || deliveries.length === 0) return res.status(400).json({ msg: 'No se proporcionaron datos.' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = `INSERT INTO entregas (cui_estudiante, id_tarea, entregado, actualizado_en) VALUES ($1, $2, $3, NOW()) ON CONFLICT (cui_estudiante, id_tarea) DO UPDATE SET entregado = EXCLUDED.entregado, actualizado_en = NOW();`;
        for (const delivery of deliveries) await client.query(query, [delivery.cui_estudiante, delivery.id_tarea, delivery.entregado]);
        await client.query('COMMIT');
        res.status(200).json({ msg: 'Entregas guardadas.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    } finally {
        client.release();
    }
}

module.exports = {
  registerTeacherAndUser,
  getTeacherAssignments,
  getAssignmentData,
  createTask,
  saveDeliveries,
};

