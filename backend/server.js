// backend/server.js
require('dotenv').config(); // Завантажуємо змінні з .env на самому початку!

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const casualtyCardRoutes = require('./routes/casualtyCard.routes'); // Імпорт маршрутів

// Ініціалізація Express додатку
const app = express();

const PORT = process.env.PORT || 5001; // Використовуємо порт з .env або 5001 як запасний
const FRONTEND_DEV_URL = 'http://localhost:5173'; // Правильна URL фронтенду для розробки
const FRONTEND_PROD_URL = 'https://p0daru.github.io'; // URL для деплою

// Middleware (Проміжне ПЗ)

// Налаштовуємо CORS правильно
app.use(cors({
    origin: [FRONTEND_DEV_URL, FRONTEND_PROD_URL], // Дозволяємо тільки ці джерела
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json()); // Дозволяємо серверу розуміти JSON

// Підключення до MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in .env file.');
    process.exit(1); // Зупиняємо сервер, якщо немає URI
}

mongoose.connect(mongoUri) // Опції useNewUrlParser та useUnifiedTopology більше не потрібні у Mongoose 6+
.then(() => console.log('MongoDB Connected successfully!'))
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Зупиняємо сервер при помилці підключення
});

// Простий тестовий маршрут
app.get('/', (req, res) => {
    res.send('Injury Tracker API is running!');
});

// Підключаємо маршрути для роботи з даними про поранених
app.use('/api/casualty-cards', casualtyCardRoutes); // Підключаємо маршрути за префіксом /api/injured


// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});