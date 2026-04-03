const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// @desc    Toggle follow status for a seller
// @route   POST /api/follow/:sellerId
const toggleFollow = async (req, res, next) => {
  const sellerId = req.params.sellerId;
  const followerId = req.user._id;

  if (sellerId === followerId.toString()) {
    res.status(400);
    throw new Error('Vous ne pouvez pas vous suivre vous-même');
  }

  try {
    const existing = await Follow.findOne({ follower: followerId, following: sellerId });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      return res.json({ following: false, message: 'Désabonné avec succès' });
    } else {
      await Follow.create({ follower: followerId, following: sellerId });
      
      // Create Notification
      await Notification.create({
        user: sellerId,
        type: 'follow',
        message: `${req.user.name || 'Un utilisateur'} a commencé à vous suivre.`
      });

      return res.json({ following: true, message: 'Abonné avec succès' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check follow status
// @route   GET /api/follow/status/:sellerId
const getFollowStatus = async (req, res, next) => {
  try {
    const exists = await Follow.exists({ follower: req.user._id, following: req.params.sellerId });
    res.json({ following: !!exists });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFollow,
  getFollowStatus
};
