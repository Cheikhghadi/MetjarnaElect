const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
router.get('/', protect, getNotifications);

// @route   PUT /api/notifications/read
router.put('/read', protect, markNotificationsAsRead);

module.exports = router;
