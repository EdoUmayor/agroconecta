const farmRepository = require('../repositories/farm.repository');
const ApiError = require('../utils/ApiError');

class FarmService {
  async create(farmerId, data) {
    return farmRepository.create({ ...data, farmerId });
  }

  async getById(id, farmerId) {
    const farm = await farmRepository.findById(id);
    if (!farm) throw ApiError.notFound('Finca no encontrada');
    if (farm.farmerId !== farmerId) throw ApiError.forbidden('No tiene acceso a esta finca');
    return farm;
  }

  async getAllByFarmer(farmerId) {
    return farmRepository.findAllByFarmer(farmerId);
  }

  async update(id, farmerId, data) {
    await this.getById(id, farmerId);
    return farmRepository.update(id, data);
  }

  async delete(id, farmerId) {
    await this.getById(id, farmerId);
    await farmRepository.delete(id);
  }
}

module.exports = new FarmService();
