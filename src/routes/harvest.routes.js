const express = require('express');
const harvestController = require('../controllers/harvest.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createHarvestSchema, updateHarvestSchema } = require('../validators/harvest.validator');

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Harvests
 *   description: CRUD de registros de cosecha
 */

/**
 * @swagger
 * /api/harvests:
 *   post:
 *     summary: Registrar una nueva cosecha
 *     tags: [Harvests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cropId, harvestDate, quantityKg, qualityGrade]
 *             properties:
 *               cropId: { type: integer, example: 1 }
 *               harvestDate: { type: string, example: "2026-06-20" }
 *               quantityKg: { type: number, example: 340.5 }
 *               qualityGrade: { type: string, example: "A" }
 *               notes: { type: string, example: "Buen rendimiento" }
 *     responses:
 *       201: { description: Cosecha registrada con exito }
 */
router.post('/', validate(createHarvestSchema), harvestController.create);

/**
 * @swagger
 * /api/harvests:
 *   get:
 *     summary: Listar registros de cosecha (opcionalmente filtrado por cultivo)
 *     tags: [Harvests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: cropId
 *         schema: { type: integer }
 *         required: false
 *     responses:
 *       200: { description: Lista de cosechas }
 */
router.get('/', harvestController.getAll);

/**
 * @swagger
 * /api/harvests/{id}:
 *   get:
 *     summary: Obtener un registro de cosecha por ID
 *     tags: [Harvests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Registro encontrado }
 *       404: { description: Registro no encontrado }
 */
router.get('/:id', harvestController.getById);

/**
 * @swagger
 * /api/harvests/{id}:
 *   put:
 *     summary: Actualizar un registro de cosecha
 *     tags: [Harvests]
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
 *               quantityKg: { type: number }
 *               qualityGrade: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200: { description: Registro actualizado }
 */
router.put('/:id', validate(updateHarvestSchema), harvestController.update);

/**
 * @swagger
 * /api/harvests/{id}:
 *   delete:
 *     summary: Eliminar un registro de cosecha
 *     tags: [Harvests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Registro eliminado }
 */
router.delete('/:id', harvestController.delete);

module.exports = router;
