// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Отримуємо токен з заголовка "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // Перевіряємо токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Знаходимо користувача за ID з токена і додаємо його до запиту (req)
            // Тепер у всіх захищених роутах ми будемо мати доступ до req.user
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Не авторизовано, користувача не знайдено' });
            }

            next(); // Все добре, йдемо далі

        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Не авторизовано, токен недійсний' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Не авторизовано, немає токена' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user додається попереднім middleware 'protect'
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Доступ заборонено (недостатньо прав)' });
        }
        next();
    };
};

// Експортуємо обидві функції
module.exports = { protect, authorize };