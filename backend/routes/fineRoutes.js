const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, fineController.getFines);
router.get('/my', protect, fineController.getMyFines);
router.put('/pay/:id', protect, adminOnly, fineController.payFine);
router.put('/waive/:id', protect, adminOnly, fineController.waiveFine);

module.exports = router;