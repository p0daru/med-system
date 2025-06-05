// backend/controllers/auth.controller.js
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

// Функція для створення токену
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Реєстрація нового користувача (POST /api/auth/register)
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Ім\'я користувача та пароль є обов\'язковими' });
        }

        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'Користувач з таким іменем вже існує' });
        }

        const user = await User.create({
            username,
            password
        });

        res.status(201).json({
            message: 'Користувач успішно зареєстрований',
            user: {
                _id: user._id,
                username: user.username,
            }
        });

    } catch (error) {
        console.error("Server error during registration:", error);
        res.status(500).json({ message: 'Помилка сервера при реєстрації', error: error.message });
    }
};

// Вхід користувача (POST /api/auth/login)
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Ім\'я користувача та пароль є обов\'язковими' });
        }

        const user = await User.findOne({ username });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Невірне ім`я користувача або пароль' });
        }
    } catch (error) {
        console.error("Server error during login:", error);
        res.status(500).json({ message: 'Помилка сервера при вході', error: error.message });
    }
};