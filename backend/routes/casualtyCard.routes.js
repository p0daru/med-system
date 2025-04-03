// routes/casualtyCard.routes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CasualtyCard = require('../models/CasualtyCard.model'); // Імпортуємо оновлену модель

// --- Middleware для перевірки ID (опціонально, але корисно) ---
const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`Invalid ObjectId received: ${id}`);
        return res.status(400).json({ message: "Невалідний формат ID запису" });
    }
    next();
};

// --- POST /api/casualty-cards/ --- Створення нової картки
router.post('/', async (req, res) => {
    console.log('Received POST request body:', JSON.stringify(req.body, null, 2)); // Логування для дебагу

    try {
        // Створюємо новий документ, передаючи тіло запиту напряму
        // Mongoose автоматично візьме поля, що відповідають схемі
        // Важливо, щоб імена полів у req.body точно відповідали схемі
        const newCard = new CasualtyCard(req.body);

        // Явна валідація (Mongoose зробить це при .save(), але можна додати і тут)
        // Наприклад:
        if (!req.body.evacuationPriority) {
            console.warn('Validation failed: Evacuation Priority is required.');
            // return res.status(400).json({ message: 'Пріоритет евакуації є обов\'язковим' });
            // Можна не робити обов'язковим, якщо є default
        }

        const savedCard = await newCard.save(); // Валідація схеми відбувається тут
        console.log('Casualty Card saved successfully:', savedCard._id);
        res.status(201).json(savedCard); // Повертаємо збережений документ

    } catch (error) {
        console.error('Error creating casualty card:', error);
        if (error.name === 'ValidationError') {
            // Формуємо повідомлення з помилок валідації Mongoose
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Помилка валідації даних", errors: messages });
        }
        res.status(500).json({ message: "Помилка сервера при створенні картки", error: error.message });
    }
});

// --- GET /api/casualty-cards/ --- Отримання списку карток
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            // Використовуємо $regex для пошуку за початком рядка (case-insensitive)
            // '^' - початок рядка, 'i' - нечутливий до регістру
            const searchRegex = new RegExp('^' + search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'); // Екрануємо спецсимволи

            query = {
                $or: [
                    { patientFullName: searchRegex },
                    { individualNumber: searchRegex },
                    { last4SSN: searchRegex }
                    // Можна додати інші поля для пошуку, якщо потрібно
                    // { unit: searchRegex },
                ]
            };
            console.log('Search query:', query);
        }

        const cards = await CasualtyCard.find(query)
            .sort({ createdAt: -1 })
            .select('-__v')
            .lean();

        res.status(200).json(cards);
    } catch (error) {
        console.error('Error fetching casualty cards:', error);
        res.status(500).json({ message: "Помилка сервера при отриманні списку карток", error: error.message });
    }
});

// --- GET /api/casualty-cards/:id --- Отримання однієї картки за ID
router.get('/:id', validateObjectId, async (req, res) => { // Використовуємо middleware
    const { id } = req.params;
    try {
        const card = await CasualtyCard.findById(id)
            .select('-__v') // Не повертаємо поле __v
            .lean();

        if (!card) {
            console.log(`Casualty Card not found for ID: ${id}`);
            return res.status(404).json({ message: "Картку з таким ID не знайдено" });
        }
        res.status(200).json(card);

    } catch (error) {
        console.error(`Error fetching casualty card with ID ${id}:`, error);
        res.status(500).json({ message: "Помилка сервера при отриманні картки", error: error.message });
    }
});

 // --- PUT /api/casualty-cards/:id --- Оновлення картки за ID
 router.put('/:id', validateObjectId, async (req, res) => { // Використовуємо middleware
     const { id } = req.params;
     const updateData = req.body;

     console.log(`Received PUT request for ID: ${id}`);
     // console.log('Update data:', JSON.stringify(updateData, null, 2)); // Обережно з логуванням PII

     // Видаляємо поля, які не можна оновлювати напряму або є метаданими
     delete updateData._id;
     delete updateData.createdAt;
     delete updateData.updatedAt;
     delete updateData.__v;
     delete updateData.individualNumber; // Часто номер картки не змінюється після створення

     try {
         // Опція { new: true } повертає оновлений документ
         // Опція { runValidators: true } запускає валідацію схеми при оновленні
         // Опція { omitUndefined: true } запобігає $unset для полів, які відсутні в updateData
         const updatedCard = await CasualtyCard.findByIdAndUpdate(
             id,
             updateData, // Передаємо всі дані, Mongoose оновить відповідні поля
             { new: true, runValidators: true, context: 'query', omitUndefined: true }
         ).select('-__v').lean();

         if (!updatedCard) {
             console.log(`Casualty Card not found for update ID: ${id}`);
             return res.status(404).json({ message: "Картку з таким ID не знайдено для оновлення" });
         }

         console.log('Casualty Card updated successfully:', updatedCard._id);
         res.status(200).json(updatedCard); // Повертаємо оновлений документ

     } catch (error) {
         console.error(`Error updating casualty card with ID ${id}:`, error);
         if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: "Помилка валідації даних при оновленні", errors: messages });
         }
         // Обробити інші можливі помилки, наприклад, CastError
         if (error.name === 'CastError') {
             return res.status(400).json({ message: `Некоректне значення для поля: ${error.path}`, error: error.message });
         }
         res.status(500).json({ message: "Помилка сервера при оновленні картки", error: error.message });
     }
 });

// --- DELETE /api/casualty-cards/:id --- Видалення картки за ID
router.delete('/:id', validateObjectId, async (req, res) => { // Використовуємо middleware
    const { id } = req.params;
    try {
        const deletedCard = await CasualtyCard.findByIdAndDelete(id);

        if (!deletedCard) {
            console.log(`Casualty Card not found for delete ID: ${id}`);
            return res.status(404).json({ message: "Картку з таким ID не знайдено для видалення" });
        }

        console.log('Casualty Card deleted successfully:', id);
        res.status(200).json({ message: "Картку успішно видалено", id: id }); // Повертаємо підтвердження

    } catch (error) {
        console.error(`Error deleting casualty card with ID ${id}:`, error);
        res.status(500).json({ message: "Помилка сервера при видаленні картки", error: error.message });
    }
});

module.exports = router;