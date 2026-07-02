const cropRepository = require('../repositories/crop.repository');
const farmRepository = require('../repositories/farm.repository');
const ApiError = require('../utils/ApiError');

class CropService {
  async create(farmerId, data) {
    const farm = await farmRepository.findById(data.farmId);
    if (!farm) throw ApiError.notFound('La finca indicada no existe');
    if (farm.farmerId !== farmerId) throw ApiError.forbidden('No tiene acceso a esta finca');

    return cropRepository.create({
      name: data.name,
      farmId: data.farmId,
      plantedDate: new Date(data.plantedDate),
      expectedHarvestDate: new Date(data.expectedHarvestDate),
      status: data.status || 'PLANTED',
    });
  }

  async getById(id, farmerId) {
    const crop = await cropRepository.findById(id);
    if (!crop) throw ApiError.notFound('Cultivo no encontrado');
    if (crop.farm.farmerId !== farmerId) throw ApiError.forbidden('No tiene acceso a este cultivo');
    return crop;
  }

  async getAllByFarmer(farmerId, farmId) {
    const crops = await cropRepository.findAll(farmId ? { farmId: Number(farmId) } : {});
    return crops.filter((c) => c.farm.farmerId === farmerId);
  }

  async update(id, farmerId, data) {
    await this.getById(id, farmerId);
    const payload = { ...data };
    if (payload.plantedDate) payload.plantedDate = new Date(payload.plantedDate);
    if (payload.expectedHarvestDate) payload.expectedHarvestDate = new Date(payload.expectedHarvestDate);
    return cropRepository.update(id, payload);
  }

  async delete(id, farmerId) {
    await this.getById(id, farmerId);
    await cropRepository.delete(id);
  }
}

module.exports = new CropService();
