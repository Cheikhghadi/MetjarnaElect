const fs = require('fs');
const path = require('path');

const MOCK_FILE = path.join(__dirname, '../../mockData.json');

const defaultData = {
  users: [
    {
      _id: 'mock-seller-1',
      name: 'Cheikh S.',
      email: 'cheikh@zenshop.com',
      avatar: '👨‍💻',
      bio: 'Passionné de tech et de gadgets.',
      followersCount: 128,
      whatsapp: '22212345678',
      isVerified: true
    },
    {
      _id: 'mock-seller-2',
      name: 'Awa Diallo',
      email: 'awa@zenshop.com',
      avatar: '👩‍🎨',
      bio: 'Artiste numérique cherchant à renouveler son matériel.',
      followersCount: 45,
      whatsapp: '22287654321',
      isVerified: true
    }
  ],
  products: [
    {
      _id: 'mock-p1',
      name: 'iPhone 15 Pro',
      description: 'État neuf, 256GB. Utilisé seulement 1 mois. Vendu avec boîte et accessoires.',
      price: 1200,
      delivery: 0,
      sellerId: 'mock-seller-1',
      avgRating: 4.8,
      category: 'Électronique',
      images: [],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'mock-p2',
      name: 'MacBook Air M2',
      description: 'Vends mon MacBook car je passe au Pro. Très bon état, batterie à 98%.',
      price: 950,
      delivery: 15,
      sellerId: 'mock-seller-2',
      avgRating: 4.5,
      category: 'Électronique',
      images: [],
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  ratings: []
};

const getMockData = () => {
  if (!fs.existsSync(MOCK_FILE)) {
    fs.writeFileSync(MOCK_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8'));
  } catch (e) {
    return defaultData;
  }
};

const saveMockData = (data) => {
  fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2));
};

module.exports = { getMockData, saveMockData };
