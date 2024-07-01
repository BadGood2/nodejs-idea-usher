const express = require('express');
const { createTag } = require('../controllers/tagController');
const router = express.Router();

router.post('/tags', createTag);

module.exports = router;
