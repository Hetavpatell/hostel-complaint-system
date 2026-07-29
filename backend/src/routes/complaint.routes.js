const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createComplaintSchema,
  assignWorkerSchema,
  updateStatusSchema,
} = require('../validators/complaint.validator');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  assignWorker,
  updateStatus,
  getAssignedComplaints,
  completeComplaint,
} = require('../controllers/complaint.controller');

router.post('/', verifyToken, allowRoles('STUDENT'), upload.single('photo'), validate(createComplaintSchema), createComplaint);
router.get('/mine', verifyToken, allowRoles('STUDENT'), getMyComplaints);
router.get('/assigned', verifyToken, allowRoles('WORKER'), getAssignedComplaints);
router.get('/', verifyToken, allowRoles('ADMIN'), getAllComplaints);
router.patch('/:id/assign', verifyToken, allowRoles('ADMIN'), validate(assignWorkerSchema), assignWorker);
router.patch('/:id/status', verifyToken, allowRoles('ADMIN'), validate(updateStatusSchema), updateStatus);
router.patch('/:id/complete', verifyToken, allowRoles('WORKER'), completeComplaint);
router.get('/:id', verifyToken, getComplaintById);

module.exports = router;