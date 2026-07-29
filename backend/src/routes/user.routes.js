const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const { getUsers, getMe, updateMe, createUser } = require('../controllers/user.controller');

router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);
router.get('/', verifyToken, allowRoles('ADMIN'), getUsers);
router.post('/', verifyToken, allowRoles('ADMIN'), createUser);

module.exports = router;