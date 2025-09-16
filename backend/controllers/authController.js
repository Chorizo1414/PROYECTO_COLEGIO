// backend/controllers/authController.js

const pool = require('../config/db'); // Importa la conexión a la BD
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para el login de un usuario
const login = async (req, res) => {
  const { username, password } = req.body;

  // Validar que se recibieron los datos
  if (!username || !password) {
    return res.status(400).json({ msg: 'Por favor ingrese usuario y contraseña' });
  }

  try {
    // 1. Buscar al usuario en la base de datos
    const userQuery = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas' }); // Usuario no encontrado
    }

    const user = userQuery.rows[0];

    // 2. Comparar la contraseña ingresada con la de la BD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' }); // Contraseña incorrecta
    }

    // 3. Si todo es correcto, crear el token (JWT)
    const payload = {
      user: {
        id: user.id_usuario,
        role: user.rol_id, // Puedes añadir más datos si quieres
      },
    };

    jwt.sign(
      payload,
      'tu_secreto_jwt', // ¡Cambia esto por una clave secreta más segura en tu .env!
      { expiresIn: '1h' }, // El token expira en 1 hora
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // 4. Enviar el token al cliente
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

module.exports = {
  login,
};