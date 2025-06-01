// // backend/server.js
// require('dotenv').config(); // Завантажуємо змінні з .env на самому початку!

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// // маршрути 
// const traumaRecordApiRoutes = require('./routes/traumaRecord.api.routes'); // Імпортуємо нові маршрути

// // Ініціалізація Express додатку
// const app = express();

// const PORT = process.env.PORT || 5001; // Використовуємо порт з .env або 5001 як запасний

// // Важливо: URL фронтенду можуть бути однаковими для обох систем, якщо вони доступні через один фронтенд-додаток
// const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173';
// const FRONTEND_PROD_URL = process.env.FRONTEND_PROD_URL || 'https://p0daru.github.io';

// // Middleware (Проміжне ПЗ)

// // Налаштовуємо CORS правильно
// // app.use(cors({
// //     origin: (origin, callback) => {
// //         // Дозволяємо запити без origin (наприклад, Postman, мобільні додатки) у розробці
// //         // або якщо це запити з того ж домену (якщо бекенд та фронтенд на одному домені в продакшені)
// //         if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
// //         // Перевіряємо, чи origin є в списку дозволених
// //         if ([FRONTEND_DEV_URL, FRONTEND_PROD_URL].includes(origin)) {
// //             callback(null, true);
// //         } else {
// //             callback(new Error('Not allowed by CORS'));
// //         }
// //     },
// //     methods: 'GET,POST,PUT,DELETE,OPTIONS', // Додайте OPTIONS для preflight запитів
// //     allowedHeaders: 'Content-Type,Authorization'
// // }));

// app.use(cors({
//     origin: (origin, callback) => {
//         console.log("Incoming Origin: ", origin); // ДОДАЙТЕ ЦЕЙ РЯДОК ДЛЯ ДІАГНОСТИКИ

//         const allowedOrigins = [FRONTEND_DEV_URL, FRONTEND_PROD_URL];

//         // Дозволяємо запити без origin (наприклад, Postman, мобільні додатки) у розробці
//         if (!origin && process.env.NODE_ENV !== 'production') {
//             console.log("CORS: Allowed (no origin, dev mode)");
//             return callback(null, true);
//         }

//         // Перевіряємо, чи origin є в списку дозволених, можливо, з урахуванням слеша
//         let isAllowed = false;
//         if (origin) {
//             for (const allowed of allowedOrigins) {
//                 // Порівнюємо без кінцевого слеша, якщо він є
//                 const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
//                 const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
//                 if (normalizedOrigin === normalizedAllowed) {
//                     isAllowed = true;
//                     break;
//                 }
//             }
//         }
        
//         if (isAllowed) {
//             console.log(`CORS: Allowed for origin: ${origin}`);
//             callback(null, true);
//         } else {
//             console.log(`CORS: Not allowed for origin: ${origin}. Allowed are: ${allowedOrigins.join(', ')}`);
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: 'GET,POST,PUT,DELETE,OPTIONS',
//     allowedHeaders: 'Content-Type,Authorization',
//     credentials: true // Додайте, якщо ви використовуєте кукі або авторизацію
// }));

// app.use(express.json()); // Дозволяємо серверу розуміти JSON

// // Підключення до MongoDB
// const mongoUri = process.env.MONGODB_URI; // Назва змінної MONGODB_URI більш стандартна
// if (!mongoUri) {
//     console.error('FATAL ERROR: MONGODB_URI is not defined in .env file.');
//     process.exit(1); // Зупиняємо сервер, якщо немає URI
// }

// mongoose.connect(mongoUri)
// .then(() => console.log('MongoDB Connected successfully! Database for MED-SYSTEM.'))
// .catch(err => {
//     console.error('MongoDB connection error:', err.message);
//     process.exit(1); // Зупиняємо сервер при помилці підключення
// });

// // Простий тестовий маршрут
// app.get('/', (req, res) => {
//     res.send('MED-SYSTEM API is running! (Includes Casualty Cards and Trauma Records)');
// });

// app.use('/api/trauma-records', traumaRecordApiRoutes); // Префікс для нових маршрутів

// // Централізований обробник помилок (приклад, можна розширити)
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     // Якщо це помилка CORS, вона вже матиме статус
//     const statusCode = err.statusCode || 500;
//     const message = err.message || 'Internal Server Error';
//     res.status(statusCode).json({ message });
// });


// // Запуск сервера
// app.listen(PORT, () => {
//     console.log(`MED-SYSTEM Server is running on port: ${PORT}`);
//     console.log(`Allowed frontend origins: ${FRONTEND_DEV_URL}, ${FRONTEND_PROD_URL}`);
// });

// backend/server.js
require('dotenv').config(); // Завантажуємо змінні з .env на самому початку!

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// маршрути 
const traumaRecordApiRoutes = require('./routes/traumaRecord.api.routes');

// Ініціалізація Express додатку
const app = express();

const PORT = process.env.PORT || 5001; // Використовуємо порт з .env або 5001 як запасний

// URL фронтенду для розробки
const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173';
const FRONTEND_PROD_URL_FROM_ENV = process.env.FRONTEND_PROD_URL;

// Middleware (Проміжне ПЗ)

app.use(cors({
    origin: (origin, callback) => {
        console.log(`CORS Check - Incoming Origin: ${origin}`);

        const allowedOriginsConfig = [];
        if (FRONTEND_DEV_URL) {
            allowedOriginsConfig.push({ url: FRONTEND_DEV_URL, exactMatch: false }); // Для dev можна startsWith
        }
        if (FRONTEND_PROD_URL_FROM_ENV) {
            allowedOriginsConfig.push({ url: FRONTEND_PROD_URL_FROM_ENV, exactMatch: true }); // Для prod потрібне точне співпадіння
        }
        
        const allowedUrlsForLogging = allowedOriginsConfig.map(c => c.url);
        console.log(`CORS Check - Configured Allowed Origins: ${allowedUrlsForLogging.join(', ')}`);

        if (!origin && process.env.NODE_ENV !== 'production') {
            console.log("CORS Check: Allowed (no origin, development mode)");
            return callback(null, true);
        }

        let isAllowed = false;
        if (origin) {
            for (const config of allowedOriginsConfig) {
                if (config.exactMatch) {
                    if (origin === config.url) {
                        isAllowed = true;
                        break;
                    }
                } else { // startsWith для dev
                    if (origin.startsWith(config.url)) {
                        isAllowed = true;
                        break;
                    }
                }
            }
        }
        
        if (isAllowed) {
            console.log(`CORS Check: Allowed for origin: ${origin}`);
            callback(null, true);
        } else {
            console.log(`CORS Check: NOT Allowed for origin: ${origin}. Review exact string matching for production URLs.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}));

app.use(express.json()); // Дозволяємо серверу розуміти JSON

// Підключення до MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in .env file or environment variables.');
    process.exit(1);
}

mongoose.connect(mongoUri)
.then(() => console.log('MongoDB Connected successfully! Database for MED-SYSTEM.'))
.catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

// Простий тестовий маршрут
app.get('/', (req, res) => {
    res.send('MED-SYSTEM API is running! (Includes Casualty Cards and Trauma Records)');
});

// Основні маршрути API
app.use('/api/trauma-records', traumaRecordApiRoutes);

// Централізований обробник помилок
app.use((err, req, res, next) => {
    console.error("Error Handler: ", err.stack);
    const statusCode = err.statusCode || (err.message === 'Not allowed by CORS' ? 403 : 500);
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ message });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`MED-SYSTEM Server is running on port: ${PORT}`);
    if (FRONTEND_PROD_URL_FROM_ENV) {
        console.log(`Production frontend origin configured: ${FRONTEND_PROD_URL_FROM_ENV}`);
    } else {
        console.log('Production frontend origin (FRONTEND_PROD_URL) is NOT configured via environment variable.');
    }
    console.log(`Development frontend origin configured: ${FRONTEND_DEV_URL}`);
});