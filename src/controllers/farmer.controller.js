const farmerService = require('../services/farmer.service');

class FarmerController {
  async register(req, res, next) {
    try {
      const result = await farmerService.register(req.body);
      res.status(201).json({ success: true, message: 'Agricultor registrado con exito', data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await farmerService.login(req.body);
      res.status(200).json({ success: true, message: 'Inicio de sesion exitoso', data: result });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const farmer = await farmerService.getProfile(req.farmer.id);
      res.status(200).json({ success: true, data: farmer });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const farmers = await farmerService.getAll();
      res.status(200).json({ success: true, data: farmers });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const farmer = await farmerService.update(req.farmer.id, req.body);
      res.status(200).json({ success: true, message: 'Perfil actualizado', data: farmer });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await farmerService.delete(req.farmer.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FarmerController();
