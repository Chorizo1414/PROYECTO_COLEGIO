const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Por favor ingrese usuario y contraseña' });
  }

  try {
    const userQuery = await pool.query(
      'SELECT id_usuario, username, password, rol_id, cui_docente FROM usuarios WHERE username = $1',
      [username]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const user = userQuery.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // CORRECCIÓN CLAVE: Se añade `username` al payload del token.
    // Esto hace que req.user.username esté disponible en las rutas protegidas.
    const payload = {
      user: {
        id: user.id_usuario,
        role: user.rol_id,
        username: user.username, // <-- ESTA LÍNEA ES LA SOLUCIÓN
        cui_docente: user.cui_docente,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
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

