const harvestRepository = require('../repositories/harvest.repository');
const cropRepository = require('../repositories/crop.repository');
const ApiError = require('../utils/ApiError');

class HarvestService {
  async create(farmerId, data) {
    const crop = await cropRepository.findById(data.cropId);
    if (!crop) throw ApiError.notFound('El cultivo indicado no existe');
    if (crop.farm.farmerId !== farmerId) throw ApiError.forbidden('No tiene acceso a este cultivo');

    const harvest = await harvestRepository.create({
      cropId: data.cropId,
      harvestDate: new Date(data.harvestDate),
      quantityKg: data.quantityKg,
      qualityGrade: data.qualityGrade,
      notes: data.notes,
    });

    // Al registrar una cosecha, actualizamos el estado del cultivo
    await cropRepository.update(data.cropId, { status: 'HARVESTED' });

    return harvest;
  }

  async getById(id, farmerId) {
    const harvest = await harvestRepository.findById(id);
    if (!harvest) throw ApiError.notFound('Registro de cosecha no encontrado');

    const crop = await cropRepository.findById(harvest.cropId);
    if (crop.farm.farmerId !== farmerId) throw ApiError.forbidden('No tiene acceso a este registro');

    return harvest;
  }

  async getAllByFarmer(farmerId, cropId) {
    const harvests = await harvestRepository.findAll(cropId ? { cropId: Number(cropId) } : {});
    const owned = [];
    for (const h of harvests) {
      const crop = await cropRepository.findById(h.cropId);
      if (crop.farm.farmerId === farmerId) owned.push(h);
    }
    return owned;
  }

  async update(id, farmerId, data) {
    await this.getById(id, farmerId);
    const payload = { ...data };
    if (payload.harvestDate) payload.harvestDate = new Date(payload.harvestDate);
    return harvestRepository.update(id, payload);
  }

  async delete(id, farmerId) {
    await this.getById(id, farmerId);
    await harvestRepository.delete(id);
  }
}

module.exports = new HarvestService();
