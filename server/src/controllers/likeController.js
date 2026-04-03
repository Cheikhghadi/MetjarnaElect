const Like = require('../models/Like');

// @desc    Toggle like status for a product
// @route   POST /api/likes/:productId
const toggleLike = async (req, res, next) => {
  const productId = req.params.productId;

  try {
    const existingLike = await Like.findOne({ product: productId, user: req.user._id });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      res.json({ liked: false, message: 'Produit retiré des favoris' });
    } else {
      await Like.create({ product: productId, user: req.user._id });
      res.json({ liked: true, message: 'Produit ajouté aux favoris' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check like status
// @route   GET /api/likes/status/:productId
const getLikeStatus = async (req, res, next) => {
  try {
    const liked = await Like.findOne({ product: req.params.productId, user: req.user._id });
    res.json({ liked: !!liked });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleLike,
  getLikeStatus
};
