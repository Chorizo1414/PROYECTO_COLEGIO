const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtener token del encabezado
  const token = req.header('Authorization');

  // Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso no válido' });
  }

  // El token usualmente viene como "Bearer <token>", lo limpiamos
  const actualToken = token.split(' ')[1];

  // Verificar el token
  try {
    const decoded = jwt.verify(actualToken, 'tu_secreto_jwt'); // Usa la misma clave secreta
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no es válido' });
  }
};