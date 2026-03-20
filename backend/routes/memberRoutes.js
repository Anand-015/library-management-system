const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, memberController.getMembers);
router.get('/:id', protect, adminOnly, memberController.getMember);
router.put('/:id', protect, adminOnly, memberController.updateMember);
router.put('/:id/toggle', protect, adminOnly, memberController.toggleMemberStatus);

module.exports = router;