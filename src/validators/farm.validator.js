const { z } = require('zod');

const createFarmSchema = z.object({
  name: z.string().min(2, 'El nombre de la finca es requerido'),
  location: z.string().min(2, 'La ubicacion es requerida'),
  sizeHa: z.number().positive('El tamano en hectareas debe ser positivo'),
});

const updateFarmSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  sizeHa: z.number().positive().optional(),
});

module.exports = { createFarmSchema, updateFarmSchema };
