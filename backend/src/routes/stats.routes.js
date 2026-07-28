const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const { getStats } = require('../controllers/stats.controller');

router.get('/', verifyToken, allowRoles('ADMIN'), getStats);

module.exports = router;