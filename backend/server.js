// backend/server.js
require('dotenv').config(); // Завантажуємо змінні з .env на самому початку
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001; // Використовуємо порт з .env або 5001

// Middleware (Проміжне ПЗ)
app.use(cors()); // Дозволяємо запити з інших джерел (наш фронт-енд)
app.use(express.json()); // Дозволяємо серверу розуміти JSON у тілі запитів

// Підключення до MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected successfully!'))
.catch(err => console.error('MongoDB connection error:', err));

// Простий тестовий маршрут
app.get('/', (req, res) => {
    res.send('Injury Tracker API is running!');
});

// ---- Тут будуть маршрути для роботи з даними про поранених ----
const injuredRoutes = require('./routes/injured'); // Імпортуємо маршрути
app.use('/api/injured', injuredRoutes); // Підключаємо маршрути за префіксом /api/injured

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});