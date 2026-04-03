const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getInbox } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/messages/inbox/all
router.get('/inbox/all', protect, getInbox);

// @route   GET /api/messages/:userId
router.get('/:userId', protect, getMessages);

// @route   POST /api/messages/:userId
router.post('/:userId', protect, sendMessage);

module.exports = router;
