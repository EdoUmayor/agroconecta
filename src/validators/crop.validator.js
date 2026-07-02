const { z } = require('zod');

const cropStatusEnum = z.enum(['PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED']);

const createCropSchema = z.object({
  name: z.string().min(2, 'El nombre del cultivo es requerido'),
  farmId: z.number().int().positive('farmId debe ser un entero positivo'),
  plantedDate: z.string().datetime().or(z.string().min(1)),
  expectedHarvestDate: z.string().datetime().or(z.string().min(1)),
  status: cropStatusEnum.optional(),
});

const updateCropSchema = z.object({
  name: z.string().min(2).optional(),
  plantedDate: z.string().min(1).optional(),
  expectedHarvestDate: z.string().min(1).optional(),
  status: cropStatusEnum.optional(),
});

module.exports = { createCropSchema, updateCropSchema };
