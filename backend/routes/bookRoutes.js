const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, bookController.getBooks);
router.post('/', protect, adminOnly, bookController.addBook);
router.get('/:id', protect, bookController.getBook);
router.put('/:id', protect, adminOnly, bookController.updateBook);
router.delete('/:id', protect, adminOnly, bookController.deleteBook);
router.post('/:id/reserve', protect, bookController.reserveBook);

module.exports = router;