const ApiError = require('../utils/ApiError');

/**
 * Middleware factory: recibe un schema de Zod y valida req.body.
 * Si la validacion falla, responde 400 con el detalle de los errores.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Error de validacion', details));
    }

    req.body = result.data;
    next();
  };
}

module.exports = validate;
