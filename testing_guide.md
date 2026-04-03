# Guide de Test Local - ZenShop

Ce guide explique comment lancer et tester le projet ZenShop sur votre machine.

## 1. Installation des dépendances

Ouvrez deux terminaux différents ou utilisez des onglets séparés.

### Backend (Server)
```bash
cd /home/cheikh/.gemini/antigravity/scratch/zenshop/server
npm install
```

### Frontend (Client)
```bash
cd /home/cheikh/.gemini/antigravity/scratch/zenshop/client
npm install
```

## 2. Configuration de la base de données

Assurez-vous que **MongoDB** est lancé sur votre machine. Par défaut, le projet se connecte à :
`mongodb://localhost:27017/zenshop`

Vous pouvez vérifier le fichier `.env` dans le dossier `server` pour modifier les paramètres si besoin.

## 3. Lancement de l'application

### Lancer le Backend
Dans le terminal du dossier `server` :
```bash
npm run dev
```
Vous devriez voir :
- `MongoDB Connected...`
- `Server running on port 5000`

### Lancer le Frontend
Dans le terminal du dossier `client` :
```bash
npm run dev
```
Vite vous donnera une URL locale (généralement `http://localhost:5173`).

## 4. Test des fonctionnalités

1. Accédez à l'URL du frontend.
2. Allez sur la page **Register** pour créer un compte.
3. Connectez-vous et vérifiez que le **Dashboard** s'affiche correctement.
4. Essayez d'ajouter un produit via l'onglet dédié.
