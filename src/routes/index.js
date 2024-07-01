const express = require('express');
const postRoutes = require('./postRoutes');
const tagRoutes = require('./tagRoutes');
const router = express.Router();

router.use(postRoutes);
router.use(tagRoutes);

module.exports = router;
