// // backend/server.js
// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Припустимо, у вас є файл для підключення БД
const injuredRoutes = require('./routes/injured'); // Переконайтесь, що шлях імпорту правильний

// Підключення до MongoDB
connectDB();

const app = express();

// Middleware для CORS - ДУЖЕ ВАЖЛИВО!
// Переконайтесь, що він є ДО визначення роутів
app.use(cors({
    origin: 'https://p0daru.github.io', // Дозволити запити ТІЛЬКИ з вашого фронтенду
    // або для тестування можна тимчасово поставити: origin: '*'
    methods: 'GET,POST,PUT,DELETE', // Дозволити потрібні методи
    allowedHeaders: 'Content-Type,Authorization' // Дозволити потрібні заголовки
}));

// Middleware для розбору JSON
app.use(express.json());

// --- Ось КЛЮЧОВИЙ рядок підключення роутера ---
// Всі запити, що починаються з /api/injured, будуть передані в injuredRoutes
app.use('/api/injured', injuredRoutes);
// ----------------------------------------------

// Базовий роут для перевірки, чи сервер працює
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));






// require('dotenv').config(); // Завантажуємо змінні з .env на самому початку
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 5001; // Використовуємо порт з .env або 5001

// // Middleware (Проміжне ПЗ)
// app.use(cors()); // Дозволяємо запити з інших джерел (наш фронт-енд)
// app.use(express.json()); // Дозволяємо серверу розуміти JSON у тілі запитів

// // Підключення до MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB Connected successfully!'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Простий тестовий маршрут
// app.get('/', (req, res) => {
//     res.send('Injury Tracker API is running!');
// });

// // ---- Тут будуть маршрути для роботи з даними про поранених ----
// const injuredRoutes = require('./routes/injured'); // Імпортуємо маршрути
// app.use('/api/injured', injuredRoutes); // Підключаємо маршрути за префіксом /api/injured

// // Запуск сервера
// app.listen(PORT, () => {
//     console.log(`Server is running on port: ${PORT}`);
// });