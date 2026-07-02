const express = require('express');
const cropController = require('../controllers/crop.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCropSchema, updateCropSchema } = require('../validators/crop.validator');

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Crops
 *   description: CRUD de cultivos asociados a una finca
 */

/**
 * @swagger
 * /api/crops:
 *   post:
 *     summary: Crear un nuevo cultivo
 *     tags: [Crops]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, farmId, plantedDate, expectedHarvestDate]
 *             properties:
 *               name: { type: string, example: "Tomate" }
 *               farmId: { type: integer, example: 1 }
 *               plantedDate: { type: string, example: "2026-03-01" }
 *               expectedHarvestDate: { type: string, example: "2026-06-15" }
 *               status: { type: string, enum: [PLANTED, GROWING, READY_TO_HARVEST, HARVESTED] }
 *     responses:
 *       201: { description: Cultivo creado con exito }
 */
router.post('/', validate(createCropSchema), cropController.create);

/**
 * @swagger
 * /api/crops:
 *   get:
 *     summary: Listar cultivos del agricultor autenticado (opcionalmente filtrado por finca)
 *     tags: [Crops]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: farmId
 *         schema: { type: integer }
 *         required: false
 *     responses:
 *       200: { description: Lista de cultivos }
 */
router.get('/', cropController.getAll);

/**
 * @swagger
 * /api/crops/{id}:
 *   get:
 *     summary: Obtener un cultivo por ID
 *     tags: [Crops]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Cultivo encontrado }
 *       404: { description: Cultivo no encontrado }
 */
router.get('/:id', cropController.getById);

/**
 * @swagger
 * /api/crops/{id}:
 *   put:
 *     summary: Actualizar un cultivo
 *     tags: [Crops]
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
 *               status: { type: string, enum: [PLANTED, GROWING, READY_TO_HARVEST, HARVESTED] }
 *     responses:
 *       200: { description: Cultivo actualizado }
 */
router.put('/:id', validate(updateCropSchema), cropController.update);

/**
 * @swagger
 * /api/crops/{id}:
 *   delete:
 *     summary: Eliminar un cultivo
 *     tags: [Crops]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Cultivo eliminado }
 */
router.delete('/:id', cropController.delete);

module.exports = router;
