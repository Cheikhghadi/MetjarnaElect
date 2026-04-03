const express = require('express');
const router = express.Router();
const { toggleLike, getLikeStatus } = require('../controllers/likeController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/likes/status/:productId
router.get('/status/:productId', protect, getLikeStatus);

// @route   POST /api/likes/:productId
router.post('/:productId', protect, toggleLike);

module.exports = router;
