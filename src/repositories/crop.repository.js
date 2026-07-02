const prisma = require('../config/db');

class CropRepository {
  async create(data) {
    return prisma.crop.create({ data });
  }

  async findById(id) {
    return prisma.crop.findUnique({
      where: { id },
      include: { harvests: true, farm: true },
    });
  }

  async findAll(filters = {}) {
    return prisma.crop.findMany({
      where: filters,
      include: { farm: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.crop.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.crop.delete({ where: { id } });
  }
}

module.exports = new CropRepository();
