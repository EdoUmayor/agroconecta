const express = require('express');
const farmerRoutes = require('./farmer.routes');
const farmRoutes = require('./farm.routes');
const cropRoutes = require('./crop.routes');
const harvestRoutes = require('./harvest.routes');

const router = express.Router();

router.use('/farmers', farmerRoutes);
router.use('/farms', farmRoutes);
router.use('/crops', cropRoutes);
router.use('/harvests', harvestRoutes);

module.exports = router;
