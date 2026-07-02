const bcrypt = require('bcryptjs');
const farmerRepository = require('../repositories/farmer.repository');
const { generateToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

class FarmerService {
  async register({ name, email, password, phone }) {
    const existing = await farmerRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('Ya existe un agricultor registrado con ese email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const farmer = await farmerRepository.create({ name, email, password: hashedPassword, phone });

    const token = generateToken({ id: farmer.id, email: farmer.email });

    return {
      farmer: { id: farmer.id, name: farmer.name, email: farmer.email, phone: farmer.phone },
      token,
    };
  }

  async login({ email, password }) {
    const farmer = await farmerRepository.findByEmail(email);
    if (!farmer) {
      throw ApiError.unauthorized('Credenciales invalidas');
    }

    const isValid = await bcrypt.compare(password, farmer.password);
    if (!isValid) {
      throw ApiError.unauthorized('Credenciales invalidas');
    }

    const token = generateToken({ id: farmer.id, email: farmer.email });

    return {
      farmer: { id: farmer.id, name: farmer.name, email: farmer.email, phone: farmer.phone },
      token,
    };
  }

  async getProfile(id) {
    const farmer = await farmerRepository.findById(id);
    if (!farmer) throw ApiError.notFound('Agricultor no encontrado');
    return farmer;
  }

  async getAll() {
    return farmerRepository.findAll();
  }

  async update(id, data) {
    await this.getProfile(id);
    return farmerRepository.update(id, data);
  }

  async delete(id) {
    await this.getProfile(id);
    await farmerRepository.delete(id);
  }
}

module.exports = new FarmerService();
