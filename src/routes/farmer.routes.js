const express = require('express');
const farmerController = require('../controllers/farmer.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, updateFarmerSchema } = require('../validators/farmer.validator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Farmers
 *   description: Registro, autenticacion y gestion de agricultores
 */

/**
 * @swagger
 * /api/farmers/register:
 *   post:
 *     summary: Registrar un nuevo agricultor
 *     tags: [Farmers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Maria Gonzalez" }
 *               email: { type: string, example: "maria.gonzalez@agroconecta.cl" }
 *               password: { type: string, example: "123456" }
 *               phone: { type: string, example: "+56912345678" }
 *     responses:
 *       201: { description: Agricultor registrado con exito }
 *       409: { description: El email ya esta registrado }
 */
router.post('/register', validate(registerSchema), farmerController.register);

/**
 * @swagger
 * /api/farmers/login:
 *   post:
 *     summary: Iniciar sesion y obtener un token JWT
 *     tags: [Farmers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "maria.gonzalez@agroconecta.cl" }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Inicio de sesion exitoso }
 *       401: { description: Credenciales invalidas }
 */
router.post('/login', validate(loginSchema), farmerController.login);

/**
 * @swagger
 * /api/farmers/me:
 *   get:
 *     summary: Obtener el perfil del agricultor autenticado
 *     tags: [Farmers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Perfil del agricultor }
 *       401: { description: No autorizado }
 */
router.get('/me', authMiddleware, farmerController.getProfile);

/**
 * @swagger
 * /api/farmers:
 *   get:
 *     summary: Listar todos los agricultores registrados
 *     tags: [Farmers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de agricultores }
 */
router.get('/', authMiddleware, farmerController.getAll);

/**
 * @swagger
 * /api/farmers/me:
 *   put:
 *     summary: Actualizar el perfil del agricultor autenticado
 *     tags: [Farmers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200: { description: Perfil actualizado }
 */
router.put('/me', authMiddleware, validate(updateFarmerSchema), farmerController.update);

/**
 * @swagger
 * /api/farmers/me:
 *   delete:
 *     summary: Eliminar la cuenta del agricultor autenticado
 *     tags: [Farmers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Cuenta eliminada }
 */
router.delete('/me', authMiddleware, farmerController.delete);

module.exports = router;
