// backend/routes/injured.js
const express = require('express');
const router = express.Router();
const Injured = require('../models/Injured'); // Імпортуємо оновлену модель

// @route   GET /api/injured
// @desc    Отримати список всіх поранених (ключові поля для списку)
// @access  Public (потрібна аутентифікація в реальному додатку)
router.get('/', async (req, res) => {
    try {
        // Обираємо тільки ключові поля для списку, щоб не передавати забагато даних
        const injuredList = await Injured.find()
            .select('trackingId name callSign unit medicalStatus evacuationStatus evacuationPriority entryTimestamp lastUpdatedTimestamp')
            .sort({ lastUpdatedTimestamp: -1 }); // Сортуємо за останнім оновленням
        res.json(injuredList);
    } catch (err) {
        console.error("GET /api/injured error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/injured/:id
// @desc    Отримати повну інформацію про одного пораненого за ID
// @access  Public (потрібна аутентифікація)
router.get('/:id', async (req, res) => {
    try {
        const injured = await Injured.findById(req.params.id);
        if (!injured) {
            return res.status(404).json({ msg: 'Record not found' });
        }
        res.json(injured);
    } catch (err) {
        console.error(`GET /api/injured/${req.params.id} error:`, err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Record not found (Invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/injured
// @desc    Додати новий запис про пораненого
// @access  Public (потрібна аутентифікація)
router.post('/', async (req, res) => {
    // Отримуємо дані з тіла запиту (додаємо всі нові поля)
    const {
        name, callSign, unit, bloodType, allergies,
        incidentTimestamp, incidentLocation, mechanismOfInjury,
        medicalStatus, injuries, initialAssessmentNotes, vitalSignsHistory, // vitalSigns надсилатимемо як масив з одним об'єктом
        treatments,
        evacuationStatus, evacuationPriority, evacuationDestination,
        recordEnteredBy, notes
    } = req.body;

    // Проста валідація (мінімум - ім'я та статус)
    if (!name || !medicalStatus) {
        return res.status(400).json({ msg: 'Please provide at least Name and Medical Status' });
    }

    try {
        // Створюємо новий екземпляр моделі з отриманими даними
        const newInjured = new Injured({
            // Генеруємо trackingId автоматично (за замовчуванням у схемі)
            name, callSign, unit, bloodType, allergies,
            incidentTimestamp, incidentLocation, mechanismOfInjury,
            medicalStatus,
            // Переконуємось що injuries, vitalSignsHistory, treatments - це масиви
            injuries: Array.isArray(injuries) ? injuries : [],
            initialAssessmentNotes,
            vitalSignsHistory: Array.isArray(vitalSignsHistory) ? vitalSignsHistory : [],
            treatments: Array.isArray(treatments) ? treatments : [],
            evacuationStatus, evacuationPriority, evacuationDestination,
            recordEnteredBy, notes
            // entryTimestamp та lastUpdatedTimestamp встановлюються автоматично
        });

        const savedInjured = await newInjured.save(); // Зберігаємо в БД
        res.status(201).json(savedInjured); // Відповідаємо створеним об'єктом

    } catch (err) {
        console.error("POST /api/injured error:", err.message);
        if (err.code === 11000) { // Помилка дублювання унікального ключа (якщо trackingId згенерувався однаковим)
             return res.status(400).json({ msg: 'Duplicate tracking ID conflict, please try again.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/injured/:id
// @desc    Оновити існуючий запис про пораненого
// @access  Public (потрібна аутентифікація)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    // Отримуємо поля, які можна оновлювати
     const {
        name, callSign, unit, bloodType, allergies,
        incidentTimestamp, incidentLocation, mechanismOfInjury,
        medicalStatus, injuries, initialAssessmentNotes, vitalSignsHistory, // Дозволяємо оновлювати всю історію чи додавати до неї? Для простоти - перезаписуємо
        treatments, // Аналогічно
        evacuationStatus, evacuationPriority, evacuationDestination,
        recordEnteredBy, notes // Можливо, recordEnteredBy не треба оновлювати?
    } = req.body;

    // Створюємо об'єкт з полями для оновлення
    const updateFields = {};
    // Додаємо поля в об'єкт, тільки якщо вони були передані в запиті
    if (name !== undefined) updateFields.name = name;
    if (callSign !== undefined) updateFields.callSign = callSign;
    if (unit !== undefined) updateFields.unit = unit;
    if (bloodType !== undefined) updateFields.bloodType = bloodType;
    if (allergies !== undefined) updateFields.allergies = allergies;
    if (incidentTimestamp !== undefined) updateFields.incidentTimestamp = incidentTimestamp;
    if (incidentLocation !== undefined) updateFields.incidentLocation = incidentLocation;
    if (mechanismOfInjury !== undefined) updateFields.mechanismOfInjury = mechanismOfInjury;
    if (medicalStatus !== undefined) updateFields.medicalStatus = medicalStatus;
    if (injuries !== undefined) updateFields.injuries = injuries; // Перезапис масиву
    if (initialAssessmentNotes !== undefined) updateFields.initialAssessmentNotes = initialAssessmentNotes;
    if (vitalSignsHistory !== undefined) updateFields.vitalSignsHistory = vitalSignsHistory; // Перезапис масиву
    if (treatments !== undefined) updateFields.treatments = treatments; // Перезапис масиву
    if (evacuationStatus !== undefined) updateFields.evacuationStatus = evacuationStatus;
    if (evacuationPriority !== undefined) updateFields.evacuationPriority = evacuationPriority;
    if (evacuationDestination !== undefined) updateFields.evacuationDestination = evacuationDestination;
    // Не оновлюємо recordEnteredBy тут, можливо?
    if (notes !== undefined) updateFields.notes = notes;

    // Додаємо оновлення lastUpdatedTimestamp (хоча middleware pre-findOneAndUpdate теж це робить)
    // updateFields.lastUpdatedTimestamp = Date.now(); // Не обов'язково через middleware

     try {
        let injured = await Injured.findById(id);

        if (!injured) {
            return res.status(404).json({ msg: 'Record not found' });
        }

        // Оновлюємо запис, { new: true } повертає оновлений документ
        injured = await Injured.findByIdAndUpdate(
            id,
            { $set: updateFields }, // Використовуємо $set для оновлення тільки переданих полів
            { new: true, runValidators: true } // runValidators - щоб перевірялись enum і required при оновленні
        );

        res.json(injured);

    } catch (err) {
        console.error(`PUT /api/injured/${id} error:`, err.message);
         if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Record not found (Invalid ID format)' });
        }
        // Можливі помилки валідації при оновленні
        if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});


// @route   DELETE /api/injured/:id
// @desc    Видалити запис (використовувати обережно!)
// @access  Private (обов'язково потрібна аутентифікація та авторизація)
router.delete('/:id', async (req, res) => {
    try {
        const injured = await Injured.findById(req.params.id);

        if (!injured) {
            return res.status(404).json({ msg: 'Record not found' });
        }

        // Потрібна перевірка прав доступу перед видаленням!

        await injured.deleteOne(); // Використовуємо deleteOne() для Mongoose v6+

        res.json({ msg: 'Record removed successfully' });

    } catch (err) {
        console.error(`DELETE /api/injured/${req.params.id} error:`, err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Record not found (Invalid ID format)' });
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;