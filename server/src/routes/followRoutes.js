const express = require('express');
const router = express.Router();
const { toggleFollow, getFollowStatus } = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/follow/:sellerId
router.post('/:sellerId', protect, toggleFollow);

// @route   GET /api/follow/status/:sellerId
router.get('/status/:sellerId', protect, getFollowStatus);

module.exports = router;
