const ApiError = require('../utils/ApiError');

/**
 * Middleware final de manejo de errores.
 * Toma cualquier error lanzado en controladores/servicios y
 * lo transforma en una respuesta HTTP consistente.
 */
function errorMiddleware(err, req, res, next) {
  // Errores conocidos de Prisma (ej: registro no encontrado, constraint unico)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese valor unico (${err.meta?.target})`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined,
    });
  }

  console.error('Error no controlado:', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorMiddleware, notFoundMiddleware };
