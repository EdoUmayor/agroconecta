const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/**
 * Middleware que protege rutas privadas.
 * Espera un header: Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Token no proporcionado. Use el header Authorization: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Adjuntamos el usuario autenticado a la request
    req.farmer = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token invalido o expirado'));
    }
    next(err);
  }
}

module.exports = authMiddleware;
