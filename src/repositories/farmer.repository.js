const prisma = require('../config/db');

/**
 * Repository Pattern: encapsula toda la interaccion con la base de datos
 * para la entidad Farmer. Las capas superiores (services/controllers)
 * nunca acceden a Prisma directamente, solo a este repositorio.
 */
class FarmerRepository {
  async create(data) {
    return prisma.farmer.create({ data });
  }

  async findByEmail(email) {
    return prisma.farmer.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.farmer.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true, updatedAt: true },
    });
  }

  async findAll() {
    return prisma.farmer.findMany({
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.farmer.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.farmer.delete({ where: { id } });
  }
}

module.exports = new FarmerRepository();
