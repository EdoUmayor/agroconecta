require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await prisma.$connect();
    console.log('Conexion a PostgreSQL establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`AgroConecta backend corriendo en http://localhost:${PORT}`);
      console.log(`Documentacion Swagger disponible en http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando conexiones...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
