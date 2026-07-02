const { z } = require('zod');

const createHarvestSchema = z.object({
  cropId: z.number().int().positive('cropId debe ser un entero positivo'),
  harvestDate: z.string().min(1, 'La fecha de cosecha es requerida'),
  quantityKg: z.number().positive('La cantidad en kg debe ser positiva'),
  qualityGrade: z.string().min(1, 'El grado de calidad es requerido'),
  notes: z.string().optional(),
});

const updateHarvestSchema = z.object({
  harvestDate: z.string().min(1).optional(),
  quantityKg: z.number().positive().optional(),
  qualityGrade: z.string().min(1).optional(),
  notes: z.string().optional(),
});

module.exports = { createHarvestSchema, updateHarvestSchema };
