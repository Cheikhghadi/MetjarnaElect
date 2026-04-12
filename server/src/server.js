require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const socketHandler = require('./socketHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const followRoutes = require('./routes/followRoutes');
const messageRoutes = require('./routes/messageRoutes');
const likeRoutes = require('./routes/likeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { apiLimiter } = require('./middleware/securityMiddleware');

function assertProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') return;
  const issues = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
    issues.push('JWT_SECRET doit faire au moins 24 caracteres');
  }
  if (!process.env.CRYPTO_SECRET || process.env.CRYPTO_SECRET.length < 16) {
    issues.push('CRYPTO_SECRET doit faire au moins 16 caracteres');
  }
  if (!process.env.MONGO_URI) {
    issues.push('MONGO_URI est requis');
  }
  if (issues.length) {
    console.error('Configuration production invalide:', issues.join('; '));
    process.exit(1);
  }
}

assertProductionSecrets();

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://matjarnaelektroni.onrender.com', // Public production URL
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, t: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('ZenShop API is running...');
});

const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

socketHandler(io);

const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zenshop')
  .then(() => {
    console.log('✅ MongoDB Connected Ready for ZenShop');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });
