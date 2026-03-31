const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, requestController.createRequest);
router.get('/', protect, requestController.getRequests);
router.put('/:id', protect, adminOnly, requestController.updateRequest);

module.exports = router;
