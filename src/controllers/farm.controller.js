const farmService = require('../services/farm.service');

class FarmController {
  async create(req, res, next) {
    try {
      const farm = await farmService.create(req.farmer.id, req.body);
      res.status(201).json({ success: true, message: 'Finca creada con exito', data: farm });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const farms = await farmService.getAllByFarmer(req.farmer.id);
      res.status(200).json({ success: true, data: farms });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const farm = await farmService.getById(Number(req.params.id), req.farmer.id);
      res.status(200).json({ success: true, data: farm });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const farm = await farmService.update(Number(req.params.id), req.farmer.id, req.body);
      res.status(200).json({ success: true, message: 'Finca actualizada', data: farm });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await farmService.delete(Number(req.params.id), req.farmer.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FarmController();
