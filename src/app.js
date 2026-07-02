const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/error.middleware');

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Documentacion Swagger en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck (util para Docker / Kubernetes liveness probe)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'agroconecta-backend', timestamp: new Date().toISOString() });
});

// Ruta raiz informativa
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenido a la API de AgroConecta',
    docs: '/api-docs',
    health: '/health',
  });
});

// Rutas de la API (MVC: capa de enrutamiento -> controladores)
app.use('/api', routes);

// 404 y manejo centralizado de errores
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
