const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFollowedProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/products
router.get('/', getProducts);

// @route   GET /api/products/followed
router.get('/followed', protect, getFollowedProducts);

// @route   GET /api/products/:id
router.get('/:id', getProductById);

// @route   POST /api/products
router.post('/', protect, addProduct);

// @route   PUT /api/products/:id
router.put('/:id', protect, updateProduct);

// @route   DELETE /api/products/:id
router.delete('/:id', protect, deleteProduct);

module.exports = router;
