// backend/seed.js
const mongoose = require('mongoose');
const User = require('./models/User.model');
require('dotenv').config(); // Щоб отримати доступ до MONGODB_URI

// Дані наших тестових користувачів
const users = [
    {
        username: 'admin',
        password: 'password123', // Пароль буде захешовано автоматично
        role: 'admin'
    },
    {
        username: 'doctor',
        password: 'password123',
        role: 'doctor'
    },
    {
        username: 'medic',
        password: 'password123',
        role: 'medic'
    }
];

const seedDB = async () => {
    // Підключення до бази даних
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('FATAL ERROR: MONGODB_URI is not defined.');
        process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding...');

    try {
        // Очищуємо колекцію користувачів, щоб уникнути дублікатів
        await User.deleteMany({});
        console.log('Previous users deleted.');

        // Створюємо нових користувачів.
        // Хук pre('save') у моделі User автоматично захешує паролі.
        await User.create(users);
        console.log('Database has been seeded with new users!');

    } catch (error) {
        console.error('Error while seeding database:', error);
    } finally {
        // Завжди закриваємо з'єднання
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Запускаємо функцію
seedDB();