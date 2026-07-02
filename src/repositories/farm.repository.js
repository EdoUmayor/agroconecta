const prisma = require('../config/db');

class FarmRepository {
  async create(data) {
    return prisma.farm.create({ data });
  }

  async findById(id) {
    return prisma.farm.findUnique({
      where: { id },
      include: { crops: true },
    });
  }

  async findAllByFarmer(farmerId) {
    return prisma.farm.findMany({
      where: { farmerId },
      include: { crops: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return prisma.farm.findMany({
      include: { crops: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.farm.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.farm.delete({ where: { id } });
  }
}

module.exports = new FarmRepository();
