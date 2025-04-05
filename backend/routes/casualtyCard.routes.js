// routes/casualtyCard.routes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Потрібен для перевірки ObjectId
const CasualtyCard = require('../models/CasualtyCard.model'); // Імпортуємо модель

// --- Middleware для перевірки валідності MongoDB ObjectId ---
// (Опціонально, але рекомендується для чистоти коду)
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Недійсний ID картки' });
    }
    next();
};

// --- Функція для об'єднання дати та часу з фронтенду ---
const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) {
        // Якщо дата або час відсутні, не можемо створити повну дату
        // Повертаємо null або можна повернути тільки дату, якщо вона є: new Date(dateStr)
        // Для eventDateTime це може бути прийнятно, але для arrivalDateTime - ні (бо воно required)
        return dateStr ? new Date(dateStr) : null; // Або повертати помилку, якщо потрібно
    }
    // 'Z' вказує, що час надано в UTC. Якщо фронтенд надсилає локальний час,
    // може знадобитись інша логіка або використання бібліотек типу moment-timezone.
    // Формат HH:MM очікується для timeStr.
    try {
      return new Date(`${dateStr}T${timeStr}:00Z`);
    } catch(e) {
      // Помилка парсингу дати/часу
      console.error("Помилка парсингу дати/часу:", dateStr, timeStr, e);
      return null; // або кидати помилку
    }
};


// --- Маршрути ---

// POST /api/casualty-cards - Створити нову картку постраждалого
router.post('/', async (req, res) => {
    const { patientData, status, /* інші поля картки */ } = req.body;

    // Перевірка наявності обов'язкових даних patientData
    if (!patientData) {
        return res.status(400).json({ message: "Дані пацієнта (patientData) є обов'язковими" });
    }

    // Об'єднуємо дату/час з patientData
    const eventDateTime = combineDateTime(patientData.eventDate, patientData.eventTime);
    const arrivalDateTime = combineDateTime(patientData.arrivalDate, patientData.arrivalTime);

    // Перевірка, чи вдалося створити обов'язкову дату прибуття
    if (!arrivalDateTime) {
         return res.status(400).json({ message: "Некоректна або неповна дата/час прибуття" });
    }
     // Перевірка, чи вдалося створити дату події (якщо вона була передана)
    if ((patientData.eventDate || patientData.eventTime) && !eventDateTime) {
        return res.status(400).json({ message: "Некоректна або неповна дата/час події" });
    }

    // Створюємо об'єкт patientData для збереження, видаляючи розділені поля
    const patientDataToSave = {
        ...patientData,
        eventDateTime: eventDateTime, // Зберегти об'єднану дату/час події
        arrivalDateTime: arrivalDateTime, // Зберегти об'єднану дату/час прибуття
    };
    // Видаляємо тимчасові поля, які використовувались лише для передачі
    delete patientDataToSave.eventDate;
    delete patientDataToSave.eventTime;
    delete patientDataToSave.arrivalDate;
    delete patientDataToSave.arrivalTime;


    try {
        const newCasualtyCard = new CasualtyCard({
            patientData: patientDataToSave,
            status: status || 'active', // Статус за замовчуванням, якщо не передано
            // createdBy: req.user._id, // Якщо у вас є автентифікація і req.user
            // ... інші поля, які передаються з req.body
        });

        const savedCard = await newCasualtyCard.save();

        // Важливо: Mongoose автоматично заповнить віртуальні поля при перетворенні в JSON
        res.status(201).json(savedCard);
    } catch (error) {
        if (error.name === 'ValidationError') {
            // Обробка помилок валідації Mongoose
             console.error('Помилка валідації:', error.errors);
            return res.status(400).json({ message: 'Помилка валідації даних', errors: error.errors });
        }
        console.error('Помилка створення картки:', error);
        res.status(500).json({ message: 'Помилка сервера при створенні картки' });
    }
});

// GET /api/casualty-cards - Отримати список всіх карток
router.get('/', async (req, res) => {
    try {
        // Додайте .populate(), якщо потрібно отримати дані з пов'язаних колекцій (напр. користувача)
        // const cards = await CasualtyCard.find().populate('createdBy', 'username email');
        const cards = await CasualtyCard.find();
        res.status(200).json(cards);
    } catch (error) {
        console.error('Помилка отримання списку карток:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні списку карток' });
    }
});

// GET /api/casualty-cards/:id - Отримати одну картку за ID
router.get('/:id', validateObjectId, async (req, res) => { // Використовуємо middleware
    try {
        const card = await CasualtyCard.findById(req.params.id);
        // .populate('createdBy lastUpdatedBy'); // Якщо потрібно

        if (!card) {
            return res.status(404).json({ message: 'Картку постраждалого не знайдено' });
        }
        // Віртуальні поля будуть автоматично додані при відправці JSON
        res.status(200).json(card);
    } catch (error) {
        console.error(`Помилка отримання картки ${req.params.id}:`, error);
        res.status(500).json({ message: 'Помилка сервера при отриманні картки' });
    }
});

// PUT /api/casualty-cards/:id - Оновити існуючу картку за ID
router.put('/:id', validateObjectId, async (req, res) => {
    const { patientData, status, /* інші поля */ } = req.body;

    if (!patientData) {
        return res.status(400).json({ message: "Дані пацієнта (patientData) є обов'язковими для оновлення" });
    }

    // Об'єднуємо дату/час з patientData, якщо вони передані для оновлення
    let eventDateTime = patientData.eventDateTime; // Зберігаємо існуюче значення за замовчуванням
    if (patientData.eventDate || patientData.eventTime) {
        eventDateTime = combineDateTime(patientData.eventDate, patientData.eventTime);
         if ((patientData.eventDate || patientData.eventTime) && !eventDateTime) {
             return res.status(400).json({ message: "Некоректна або неповна дата/час події для оновлення" });
         }
    }

    let arrivalDateTime = patientData.arrivalDateTime; // Зберігаємо існуюче значення за замовчуванням
    if (patientData.arrivalDate || patientData.arrivalTime) {
        arrivalDateTime = combineDateTime(patientData.arrivalDate, patientData.arrivalTime);
         if (!arrivalDateTime) { // Дата прибуття - обов'язкова
             return res.status(400).json({ message: "Некоректна або неповна дата/час прибуття для оновлення" });
         }
    }


    // Створюємо об'єкт для оновлення
     const updateData = {
         patientData: {
             ...patientData, // Беремо всі інші дані з patientData
             eventDateTime: eventDateTime,
             arrivalDateTime: arrivalDateTime,
         },
         status: status, // Оновлюємо статус, якщо передано
         // lastUpdatedBy: req.user._id, // Якщо є автентифікація
         // ... інші поля для оновлення
     };

     // Видаляємо тимчасові поля з об'єкту оновлення
     delete updateData.patientData.eventDate;
     delete updateData.patientData.eventTime;
     delete updateData.patientData.arrivalDate;
     delete updateData.patientData.arrivalTime;

     // Очищаємо null/undefined поля з updateData, щоб не перезаписувати існуючі значення
     // (Опціонально, залежить від бажаної поведінки PUT - повна заміна чи часткове оновлення)
     // Наприклад, якщо status не передано, не оновлювати його:
     if (updateData.status === undefined) {
        delete updateData.status;
     }
     // Можна зробити подібне і для полів всередині patientData, якщо потрібно


    try {
        const updatedCard = await CasualtyCard.findByIdAndUpdate(
            req.params.id,
            { $set: updateData }, // Використовуємо $set для оновлення конкретних полів
            {
                new: true, // Повернути оновлений документ
                runValidators: true, // Запустити валідатори Mongoose при оновленні
                context: 'query' // Потрібно для деяких валідаторів, особливо умовних
            }
        );

        if (!updatedCard) {
            return res.status(404).json({ message: 'Картку постраждалого не знайдено для оновлення' });
        }

        res.status(200).json(updatedCard); // Відправляємо оновлену картку з віртуальними полями
    } catch (error) {
         if (error.name === 'ValidationError') {
            console.error('Помилка валідації при оновленні:', error.errors);
            return res.status(400).json({ message: 'Помилка валідації даних при оновленні', errors: error.errors });
        }
        console.error(`Помилка оновлення картки ${req.params.id}:`, error);
        res.status(500).json({ message: 'Помилка сервера при оновленні картки' });
    }
});

// DELETE /api/casualty-cards/:id - Видалити картку за ID
router.delete('/:id', validateObjectId, async (req, res) => {
    try {
        const deletedCard = await CasualtyCard.findByIdAndDelete(req.params.id);

        if (!deletedCard) {
            return res.status(404).json({ message: 'Картку постраждалого не знайдено для видалення' });
        }

        // Успішне видалення, можна повернути 204 No Content або 200 з повідомленням
        res.status(200).json({ message: 'Картку постраждалого успішно видалено', cardId: req.params.id });
        // або res.status(204).send();

    } catch (error) {
        console.error(`Помилка видалення картки ${req.params.id}:`, error);
        res.status(500).json({ message: 'Помилка сервера при видаленні картки' });
    }
});


module.exports = router;