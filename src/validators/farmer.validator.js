const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'La contrasena es requerida'),
});

const updateFarmerSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().optional(),
});

module.exports = { registerSchema, loginSchema, updateFarmerSchema };
