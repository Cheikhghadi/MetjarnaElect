const Rating = require('../models/Rating');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Upsert a rating for a product
// @route   POST /api/ratings/:productId
const upsertRating = async (req, res, next) => {
  const { stars } = req.body;
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Produit non trouvé');
    }

    if (product.seller.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Vous ne pouvez pas évaluer votre propre produit');
    }

    // Upsert rating
    const rating = await Rating.findOneAndUpdate(
      { product: productId, user: req.user._id },
      { stars },
      { upsert: true, new: true }
    );

    // Update product average rating
    const ratings = await Rating.find({ product: productId });
    const avg = ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length;

    await Product.findByIdAndUpdate(productId, { avgRating: avg });
    
    // Create Notification for the seller
    if (product.seller.toString() !== req.user._id.toString()) {
       await Notification.create({
          user: product.seller,
          type: 'rating',
          message: `${req.user.name || 'Un utilisateur'} a évalué votre produit "${product.name}" avec ${stars} étoiles.`
       });
    }

    res.json({ rating, avgRating: avg });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertRating
};
