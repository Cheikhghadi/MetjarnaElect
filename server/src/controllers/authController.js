const SimpleStorage = require('../utils/simpleStorage');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: champs publics du user
const publicUserFields = ['_id', 'name', 'email', 'avatar', 'whatsapp', 'bio', 'role', 'isVerified', 'createdAt'];

// ============================================================
// @desc    Register user
// @route   POST /api/auth/register
// ============================================================
const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Nom, email et mot de passe requis');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Le mot de passe doit contenir au moins 6 caracteres');
    }

    const users = SimpleStorage.readUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      res.status(400);
      throw new Error("L'utilisateur existe deja");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: SimpleStorage.generateId(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    SimpleStorage.writeUsers(users);

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

    const userResponse = {};
    publicUserFields.forEach(field => {
      if (newUser[field] !== undefined) {
        userResponse[field] = newUser[field];
      }
    });

    res.status(201).json({
      ...userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// @desc    Login user
// @route   POST /api/auth/login
// ============================================================
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Email et mot de passe requis');
    }

    const users = SimpleStorage.readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      res.status(401);
      throw new Error('Identifiants invalides');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Identifiants invalides');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

    const userResponse = {};
    publicUserFields.forEach(field => {
      if (user[field] !== undefined) {
        userResponse[field] = user[field];
      }
    });

    res.json({
      ...userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser
};
