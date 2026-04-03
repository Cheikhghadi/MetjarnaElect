const express = require('express');
const router = express.Router();
const { upsertRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/ratings/:productId
router.post('/:productId', protect, upsertRating);

module.exports = router;
