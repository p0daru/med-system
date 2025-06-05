// backend/controllers/auth.controller.js
console.log('--- Importing User model in auth.controller.js ---');
const User = require('../models/User.model');
console.log('Imported User in controller:', User); // Подивіться, що тут буде виведено
if (User) {
    console.log('Is imported User a constructor?', typeof User === 'function'); // МАЄ БУТИ TRUE
}


const jwt = require('jsonwebtoken');

// Функція для створення токену
const generateToken = (id) => {
    // Ключ береться з .env файлу
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Реєстрація нового користувача (POST /api/auth/register)
exports.registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'Користувач з таким іменем вже існує' });
        }

        const user = await User.create({
            username,
            password
        });

        // Не відправляємо пароль назад, навіть хешований
        res.status(201).json({
            message: 'Користувач успішно зареєстрований',
            user: {
                _id: user._id,
                username: user.username,
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера при реєстрації', error: error.message });
    }
};

// Вхід користувача (POST /api/auth/login)
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        // Перевіряємо чи є користувач, і чи правильний пароль
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id) // Віддаємо наш "пропуск"
            });
        } else {
            res.status(401).json({ message: 'Невірне ім`я користувача або пароль' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера при вході', error: error.message });
    }
};