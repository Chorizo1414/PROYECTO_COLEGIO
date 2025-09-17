const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  } else if (req.query?.token) {
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ msg: 'No hay token, autorización denegada' });

  // >>> AQUI AGREGA ESTO <<<
  if (token && (token.startsWith('"') || token.endsWith('"'))) {
    token = token.replace(/^"|"$/g, '');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token no es válido', error: err.message });
  }
};
