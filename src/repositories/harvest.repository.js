const prisma = require('../config/db');

class HarvestRepository {
  async create(data) {
    return prisma.harvestRecord.create({ data });
  }

  async findById(id) {
    return prisma.harvestRecord.findUnique({
      where: { id },
      include: { crop: true },
    });
  }

  async findAll(filters = {}) {
    return prisma.harvestRecord.findMany({
      where: filters,
      include: { crop: true },
      orderBy: { harvestDate: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.harvestRecord.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.harvestRecord.delete({ where: { id } });
  }
}

module.exports = new HarvestRepository();
