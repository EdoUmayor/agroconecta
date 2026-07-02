const express = require('express');
const farmController = require('../controllers/farm.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createFarmSchema, updateFarmSchema } = require('../validators/farm.validator');

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Farms
 *   description: CRUD de fincas del agricultor autenticado
 */

/**
 * @swagger
 * /api/farms:
 *   post:
 *     summary: Crear una nueva finca
 *     tags: [Farms]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, sizeHa]
 *             properties:
 *               name: { type: string, example: "Finca El Rosal" }
 *               location: { type: string, example: "Curico, Chile" }
 *               sizeHa: { type: number, example: 12.5 }
 *     responses:
 *       201: { description: Finca creada con exito }
 */
router.post('/', validate(createFarmSchema), farmController.create);

/**
 * @swagger
 * /api/farms:
 *   get:
 *     summary: Listar las fincas del agricultor autenticado
 *     tags: [Farms]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de fincas }
 */
router.get('/', farmController.getAll);

/**
 * @swagger
 * /api/farms/{id}:
 *   get:
 *     summary: Obtener una finca por ID
 *     tags: [Farms]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Finca encontrada }
 *       404: { description: Finca no encontrada }
 */
router.get('/:id', farmController.getById);

/**
 * @swagger
 * /api/farms/{id}:
 *   put:
 *     summary: Actualizar una finca
 *     tags: [Farms]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               location: { type: string }
 *               sizeHa: { type: number }
 *     responses:
 *       200: { description: Finca actualizada }
 */
router.put('/:id', validate(updateFarmSchema), farmController.update);

/**
 * @swagger
 * /api/farms/{id}:
 *   delete:
 *     summary: Eliminar una finca
 *     tags: [Farms]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Finca eliminada }
 */
router.delete('/:id', farmController.delete);

module.exports = router;
