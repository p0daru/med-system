// backend/server.js
require('dotenv').config(); // Завантажуємо змінні з .env на самому початку!

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// маршрути 
const traumaRecordApiRoutes = require('./routes/traumaRecord.api.routes'); // Імпортуємо нові маршрути

// Ініціалізація Express додатку
const app = express();

const PORT = process.env.PORT || 5001; // Використовуємо порт з .env або 5001 як запасний

// Важливо: URL фронтенду можуть бути однаковими для обох систем, якщо вони доступні через один фронтенд-додаток
const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173';
const FRONTEND_PROD_URL = process.env.FRONTEND_PROD_URL || 'https://p0daru.github.io';

// Middleware (Проміжне ПЗ)

// Налаштовуємо CORS правильно
app.use(cors({
    origin: (origin, callback) => {
        // Дозволяємо запити без origin (наприклад, Postman, мобільні додатки) у розробці
        // або якщо це запити з того ж домену (якщо бекенд та фронтенд на одному домені в продакшені)
        if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
        // Перевіряємо, чи origin є в списку дозволених
        if ([FRONTEND_DEV_URL, FRONTEND_PROD_URL].includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST,PUT,DELETE,OPTIONS', // Додайте OPTIONS для preflight запитів
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json()); // Дозволяємо серверу розуміти JSON

// Підключення до MongoDB
const mongoUri = process.env.MONGODB_URI; // Назва змінної MONGODB_URI більш стандартна
if (!mongoUri) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in .env file.');
    process.exit(1); // Зупиняємо сервер, якщо немає URI
}

mongoose.connect(mongoUri)
.then(() => console.log('MongoDB Connected successfully! Database for MED-SYSTEM.'))
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Зупиняємо сервер при помилці підключення
});

// Простий тестовий маршрут
app.get('/', (req, res) => {
    res.send('MED-SYSTEM API is running! (Includes Casualty Cards and Trauma Records)');
});

app.use('/api/trauma-records', traumaRecordApiRoutes); // Префікс для нових маршрутів

// Централізований обробник помилок (приклад, можна розширити)
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Якщо це помилка CORS, вона вже матиме статус
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ message });
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`MED-SYSTEM Server is running on port: ${PORT}`);
    console.log(`Allowed frontend origins: ${FRONTEND_DEV_URL}, ${FRONTEND_PROD_URL}`);
});