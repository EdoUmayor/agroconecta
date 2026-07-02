const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgroConecta API',
      version: '1.0.0',
      description:
        'API REST para AgroConecta, plataforma Agrotech que permite a pequenos agricultores ' +
        'gestionar sus fincas, cultivos y registros de cosecha. Proyecto universitario ' +
        'desarrollado con arquitectura monolitica, patron MVC y Repository Pattern.',
      contact: { name: 'Equipo AgroConecta' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
