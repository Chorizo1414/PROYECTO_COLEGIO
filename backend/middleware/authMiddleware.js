const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  // 1. Obtener el token del header
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // Si no hay token, denegar acceso
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, autorización denegada' });
  }
  
  // Limpiar comillas si existen
  if (token && (token.startsWith('"') || token.endsWith('"'))) {
    token = token.replace(/^"|"$/g, '');
  }

  try {
    // 2. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. CORRECCIÓN CLAVE: Asignar el objeto `user` del payload a `req.user`
    // Antes, asignaba el token completo (`decoded`), ahora solo la información del usuario.
    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no es válido' });
  }
};
