const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando base de datos...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  const farmer = await prisma.farmer.upsert({
    where: { email: 'maria.gonzalez@agroconecta.cl' },
    update: {},
    create: {
      name: 'Maria Gonzalez',
      email: 'maria.gonzalez@agroconecta.cl',
      password: hashedPassword,
      phone: '+56912345678',
    },
  });

  const farm = await prisma.farm.create({
    data: {
      name: 'Finca El Rosal',
      location: 'Curico, Region del Maule, Chile',
      sizeHa: 12.5,
      farmerId: farmer.id,
    },
  });

  const crop = await prisma.crop.create({
    data: {
      name: 'Tomate',
      farmId: farm.id,
      plantedDate: new Date('2026-03-01'),
      expectedHarvestDate: new Date('2026-06-15'),
      status: 'GROWING',
    },
  });

  await prisma.harvestRecord.create({
    data: {
      cropId: crop.id,
      harvestDate: new Date('2026-06-20'),
      quantityKg: 340.5,
      qualityGrade: 'A',
      notes: 'Cosecha de prueba inicial, buen rendimiento.',
    },
  });

  console.log('Seed completado con exito.');
  console.log('Usuario de prueba -> email: maria.gonzalez@agroconecta.cl | password: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
