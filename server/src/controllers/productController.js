const Product = require('../models/Product');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const jwt = require('jsonwebtoken');

// @desc    Get all products (with filters and pagination)
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  const { name, minPrice, maxPrice, delivery, page: pageQuery, category } = req.query;
  
  const page = parseInt(pageQuery) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build Filter Object
  const filter = {};
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (delivery === 'free') {
    filter.delivery = 0;
  } else if (delivery === 'paid') {
    filter.delivery = { $gt: 0 };
  }
  
  if (category && category !== 'Tous') {
    filter.category = category;
  }

  try {
    const products = await Product.find(filter)
      .populate('seller', 'name whatsapp avatar followersCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    // Enrich with isLiked and isFollowing if user is logged in
    let enrichedProducts = products.map(p => p.toObject());
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        const [likes, follows] = await Promise.all([
          Like.find({ user: userId, product: { $in: products.map(p => p._id) } }).select('product'),
          Follow.find({ follower: userId, following: { $in: products.map(p => p.seller?._id).filter(id => !!id) } }).select('following')
        ]);
        
        const likedIds = new Set(likes.map(l => l.product.toString()));
        const followedIds = new Set(follows.map(f => f.following.toString()));
        
        enrichedProducts = enrichedProducts.map(p => ({
          ...p,
          isLiked: likedIds.has(p._id.toString()),
          isFollowing: p.seller ? followedIds.has(p.seller._id.toString()) : false
        }));
      } catch (err) {
        // Token invalid or other error, return products without enrichment
      }
    }

    res.json({ products: enrichedProducts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products from followed sellers
// @route   GET /api/products/followed
const getFollowedProducts = async (req, res, next) => {
  try {
    const followed = await Follow.find({ follower: req.user._id }).select('following');
    const followingIds = followed.map(f => f.following);

    const products = await Product.find({ seller: { $in: followingIds } })
      .populate('seller', 'name whatsapp avatar followersCount')
      .sort({ createdAt: -1 });

    const [likes, follows] = await Promise.all([
      Like.find({ user: req.user._id, product: { $in: products.map(p => p._id) } }).select('product'),
      Follow.find({ follower: req.user._id, following: { $in: products.map(p => p.seller?._id).filter(id => !!id) } }).select('following')
    ]);

    const likedIds = new Set(likes.map(l => l.product.toString()));
    const followedIds = new Set(follows.map(f => f.following.toString()));

    const enrichedProducts = products.map(p => ({
      ...p.toObject(),
      isLiked: likedIds.has(p._id.toString()),
      isFollowing: p.seller ? followedIds.has(p.seller._id.toString()) : false
    }));

    res.json(enrichedProducts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name whatsapp avatar followersCount bio');
    if (!product) {
      res.status(404);
      throw new Error('Produit non trouvé');
    }

    let enrichedProduct = product.toObject();
    
    // Enrich with isLiked and isFollowing if user is logged in
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        const [like, follow] = await Promise.all([
          Like.findOne({ user: userId, product: product._id }),
          Follow.findOne({ follower: userId, following: product.seller?._id })
        ]);
        
        enrichedProduct.isLiked = !!like;
        enrichedProduct.isFollowing = !!follow;
      } catch (err) {
        // Token invalid
      }
    }

    res.json(enrichedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product
// @route   POST /api/products
const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, delivery, image, images, category } = req.body;
    
    let productImages = images || [];
    if (image && productImages.length === 0) {
      productImages.push(image);
    } 

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      delivery: Number(delivery || 0),
      image: productImages[0] || '', 
      images: productImages,
      category: category || 'Autres',
      seller: req.user._id,
      status: req.body.status || 'active'
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Produit non trouvé');
    }
    
    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Non autorisé');
    }

    const { name, description, price, delivery, image, images, category } = req.body;
    
    let productImages = images || product.images;
    if (image && (!images || images.length === 0)) {
       productImages = [image];
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.delivery = delivery !== undefined ? Number(delivery) : product.delivery;
    product.image = productImages[0] || product.image;
    product.images = productImages;
    product.category = category || product.category;
    if (req.body.status) product.status = req.body.status;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Produit non trouvé');
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Non autorisé');
    }

    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getFollowedProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
