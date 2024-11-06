// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connexion à MongoDB réussie!');
})
.catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
});

// Schéma d'utilisateur
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Route d'inscription
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    }

    try {
        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ success: true, message: 'Compte créé avec succès.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la création du compte. Peut-être que le nom d’utilisateur ou l’email existe déjà.' });
    }
});

// Route de connexion
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    }

    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ success: true, message: `Bienvenue, ${username}!` });
        } else {
            res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la connexion.' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});