const cropService = require('../services/crop.service');

class CropController {
  async create(req, res, next) {
    try {
      const crop = await cropService.create(req.farmer.id, req.body);
      res.status(201).json({ success: true, message: 'Cultivo creado con exito', data: crop });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const crops = await cropService.getAllByFarmer(req.farmer.id, req.query.farmId);
      res.status(200).json({ success: true, data: crops });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const crop = await cropService.getById(Number(req.params.id), req.farmer.id);
      res.status(200).json({ success: true, data: crop });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const crop = await cropService.update(Number(req.params.id), req.farmer.id, req.body);
      res.status(200).json({ success: true, message: 'Cultivo actualizado', data: crop });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await cropService.delete(Number(req.params.id), req.farmer.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CropController();
