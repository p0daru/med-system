// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();

// Імпортуємо функції з нашого чистого контролера
const { registerUser, loginUser } = require('../controllers/auth.controller');

// Призначаємо функції відповідним маршрутам
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;