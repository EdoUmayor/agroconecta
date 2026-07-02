const harvestService = require('../services/harvest.service');

class HarvestController {
  async create(req, res, next) {
    try {
      const harvest = await harvestService.create(req.farmer.id, req.body);
      res.status(201).json({ success: true, message: 'Cosecha registrada con exito', data: harvest });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const harvests = await harvestService.getAllByFarmer(req.farmer.id, req.query.cropId);
      res.status(200).json({ success: true, data: harvests });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const harvest = await harvestService.getById(Number(req.params.id), req.farmer.id);
      res.status(200).json({ success: true, data: harvest });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const harvest = await harvestService.update(Number(req.params.id), req.farmer.id, req.body);
      res.status(200).json({ success: true, message: 'Registro de cosecha actualizado', data: harvest });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await harvestService.delete(Number(req.params.id), req.farmer.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HarvestController();
