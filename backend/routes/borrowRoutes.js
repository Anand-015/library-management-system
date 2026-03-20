const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/issue', protect, adminOnly, borrowController.issueBook);
router.put('/return/:id', protect, adminOnly, borrowController.returnBook);
router.get('/all', protect, adminOnly, borrowController.getAllBorrows);
router.get('/my', protect, borrowController.getMyBorrows);
router.get('/overdue', protect, adminOnly, borrowController.getOverdue);

module.exports = router;