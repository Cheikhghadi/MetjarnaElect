const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const usersFile = path.join(dataDir, 'users.json');
const productsFile = path.join(dataDir, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}
if (!fs.existsSync(productsFile)) {
  fs.writeFileSync(productsFile, JSON.stringify([]));
}

class SimpleStorage {
  static readUsers() {
    try {
      const data = fs.readFileSync(usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static writeUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  }

  static readProducts() {
    try {
      const data = fs.readFileSync(productsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static writeProducts(products) {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  }

  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = SimpleStorage;
