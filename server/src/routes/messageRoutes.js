const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getInbox } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { messageWriteLimiter } = require('../middleware/securityMiddleware');

router.get('/inbox/all', protect, getInbox);
router.get('/:userId', protect, getMessages);
router.post('/:userId', protect, messageWriteLimiter, sendMessage);

module.exports = router;
