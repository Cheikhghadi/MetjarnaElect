const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendOTP,
  updateProfile,
  getProfile
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify', verifyEmail);
router.post('/resend-otp', resendOTP);
router.put('/profile', protect, updateProfile);
router.get('/profile/:id', getProfile);

module.exports = router;
