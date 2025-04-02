// backend/routes/injured.js
const express = require('express');
const router = express.Router();
const Injured = require('../models/Injured'); // Імпортуємо оновлену модель

// @route   GET /api/injured
// @desc    Отримати список всіх поранених (ключові поля для списку)
// @access  Public (потрібна аутентифікація в реальному додатку)
router.get('/', async (req, res) => {
    try {
        // Обираємо поля, необхідні для InjuredList.jsx + ID
        const injuredList = await Injured.find()
            .select('_id trackingId name callSign unit medicalStatus evacuationPriority incidentTimestamp entryTimestamp lastUpdatedTimestamp') // Додано incidentTimestamp
            .sort({ lastUpdatedTimestamp: -1 }); // Сортуємо за останнім оновленням
        res.json(injuredList);
    } catch (err) {
        console.error("GET /api/injured error:", err.message);
        res.status(500).json({ msg: 'Server Error while fetching injured list' });
    }
});

// @route   GET /api/injured/:id
// @desc    Отримати повну інформацію про одного пораненого за ID
// @access  Public (потрібна аутентифікація)
router.get('/:id', async (req, res) => {
    try {
        const injured = await Injured.findById(req.params.id);
        if (!injured) {
            // Використовуємо 404 для не знайденого запису
            return res.status(404).json({ msg: 'Record not found' });
        }
        res.json(injured); // Повертаємо повний об'єкт для форми редагування
    } catch (err) {
        console.error(`GET /api/injured/${req.params.id} error:`, err.message);
        // Перевірка на невалідний формат ID
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Record not found (Invalid ID format)' });
        }
        // Загальна помилка сервера
        res.status(500).json({ msg: 'Server Error while fetching injured details' });
    }
});


// @route   POST /api/injured
// @desc    Додати новий запис про пораненого
// @access  Public (потрібна аутентифікація)
router.post('/', async (req, res) => {
    // Отримуємо дані з тіла запиту, як їх надсилає форма
    const {
        name, callSign, unit, bloodType, allergies,
        incidentTimestamp, incidentLocation, mechanismOfInjury,
        medicalStatus, injuries, initialAssessmentNotes, vitalSignsHistory,
        treatments,
        evacuationStatus, evacuationPriority, evacuationDestination,
        recordEnteredBy, notes
    } = req.body;

    // Валідація `name` та `medicalStatus` тепер виконується схемою Mongoose

    try {
        // Створюємо новий екземпляр моделі
        // Поля, не передані в req.body, отримають свої default значення зі схеми
        const newInjured = new Injured({
            name, // required
            callSign: callSign || undefined, // Передаємо undefined, якщо пусто, щоб не зберігати null без потреби
            unit: unit || undefined,
            bloodType, // має default 'Unknown'
            allergies: allergies || undefined, // 'None known' default
            incidentTimestamp: incidentTimestamp || undefined, // Має default Date.now
            incidentLocation: incidentLocation || undefined,
            mechanismOfInjury: mechanismOfInjury || undefined,
            medicalStatus, // required
            // Переконуємось, що це масиви. Фронтенд має надсилати їх як масиви.
            injuries: Array.isArray(injuries) ? injuries : [],
            initialAssessmentNotes: initialAssessmentNotes || undefined,
            vitalSignsHistory: Array.isArray(vitalSignsHistory) ? vitalSignsHistory : [],
            treatments: Array.isArray(treatments) ? treatments : [],
            evacuationStatus, // має default 'Unknown'
            evacuationPriority, // має default 'Unknown'
            evacuationDestination: evacuationDestination || undefined,
            recordEnteredBy: recordEnteredBy || undefined,
            notes: notes || undefined
            // trackingId, entryTimestamp, lastUpdatedTimestamp генеруються/встановлюються автоматично
        });

        const savedInjured = await newInjured.save(); // Зберігаємо в БД, тут спрацює валідація Mongoose
        res.status(201).json(savedInjured); // Відповідаємо створеним об'єктом

    } catch (err) {
        console.error("POST /api/injured error:", err.message, err.stack);
        // Обробка помилок валідації Mongoose
        if (err.name === 'ValidationError') {
             // Збираємо повідомлення про помилки валідації
             const errors = Object.values(err.errors).map(el => el.message);
             return res.status(400).json({ msg: `Validation Error: ${errors.join(', ')}` });
        }
        // Обробка помилки дублювання унікального ключа (малоймовірно для trackingId, але можливо)
        if (err.code === 11000) {
             return res.status(400).json({ msg: 'Duplicate key error. A record with this identifier might already exist.' });
        }
        // Загальна помилка сервера
        res.status(500).json({ msg: 'Server Error while creating injured record' });
    }
});

// @route   PUT /api/injured/:id
// @desc    Оновити існуючий запис про пораненого
// @access  Public (потрібна аутентифікація)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    // Отримуємо поля, які можна оновлювати, з тіла запиту
     const {
        name, callSign, unit, bloodType, allergies,
        incidentTimestamp, incidentLocation, mechanismOfInjury,
        medicalStatus, injuries, initialAssessmentNotes, vitalSignsHistory,
        treatments,
        evacuationStatus, evacuationPriority, evacuationDestination,
        recordEnteredBy, // Зазвичай не оновлюється, але форма може надсилати
        notes
    } = req.body;

    // Створюємо об'єкт з полями для оновлення ($set)
    // Додаємо тільки ті поля, які дійсно прийшли в запиті
    const updateFields = {};
    if (name !== undefined) updateFields.name = name; // Оновлюємо, навіть якщо пустий рядок, валідація спрацює
    if (callSign !== undefined) updateFields.callSign = callSign;
    if (unit !== undefined) updateFields.unit = unit;
    if (bloodType !== undefined) updateFields.bloodType = bloodType;
    if (allergies !== undefined) updateFields.allergies = allergies;
    if (incidentTimestamp !== undefined) updateFields.incidentTimestamp = incidentTimestamp;
    if (incidentLocation !== undefined) updateFields.incidentLocation = incidentLocation;
    if (mechanismOfInjury !== undefined) updateFields.mechanismOfInjury = mechanismOfInjury;
    if (medicalStatus !== undefined) updateFields.medicalStatus = medicalStatus;
    // Повністю перезаписуємо масиви даними з форми.
    // Це відповідає логіці форми, яка показує/редагує один (останній/основний) запис.
    if (injuries !== undefined && Array.isArray(injuries)) updateFields.injuries = injuries;
    if (initialAssessmentNotes !== undefined) updateFields.initialAssessmentNotes = initialAssessmentNotes;
    if (vitalSignsHistory !== undefined && Array.isArray(vitalSignsHistory)) updateFields.vitalSignsHistory = vitalSignsHistory;
    if (treatments !== undefined && Array.isArray(treatments)) updateFields.treatments = treatments;
    if (evacuationStatus !== undefined) updateFields.evacuationStatus = evacuationStatus;
    if (evacuationPriority !== undefined) updateFields.evacuationPriority = evacuationPriority;
    if (evacuationDestination !== undefined) updateFields.evacuationDestination = evacuationDestination;
    if (recordEnteredBy !== undefined) updateFields.recordEnteredBy = recordEnteredBy; // Дозволяємо оновлення, якщо прийшло
    if (notes !== undefined) updateFields.notes = notes;

    // Перевіряємо, чи є взагалі що оновлювати
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ msg: 'No fields provided for update' });
    }

    // lastUpdatedTimestamp оновиться автоматично завдяки {timestamps: true} у схемі

     try {
        // Спочатку перевіримо, чи існує запис
        const existingInjured = await Injured.findById(id);
        if (!existingInjured) {
            return res.status(404).json({ msg: 'Record not found' });
        }

        // Оновлюємо запис, { new: true } повертає оновлений документ
        // runValidators: true - перевіряє правила схеми (enum, required) при оновленні
        const updatedInjured = await Injured.findByIdAndUpdate(
            id,
            { $set: updateFields }, // Використовуємо $set для оновлення тільки переданих полів
            { new: true, runValidators: true, context: 'query' } // context: 'query' іноді потрібен для деяких валідаторів
        );

        // findByIdAndUpdate не поверне null, якщо ми вже перевірили існування вище
        res.json(updatedInjured);

    } catch (err) {
        console.error(`PUT /api/injured/${id} error:`, err.message, err.stack);
        // Перевірка на невалідний формат ID
         if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Record not found (Invalid ID format)' });
        }
        // Обробка помилок валідації Mongoose при оновленні
        if (err.name === 'ValidationError') {
             const errors = Object.values(err.errors).map(el => el.message);
             return res.status(400).json({ msg: `Validation Error: ${errors.join(', ')}` });
        }
         // Обробка помилки дублювання унікального ключа при оновленні (малоймовірно)
        if (err.code === 11000) {
             return res.status(400).json({ msg: 'Duplicate key error during update.' });
        }
        // Загальна помилка сервера
        res.status(500).json({ msg: 'Server Error while updating injured record' });
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

        // !!! ВАЖЛИВО: Додати перевірку прав доступу користувача перед видаленням !!!
        // Наприклад: if (req.user.role !== 'admin' && injured.recordEnteredBy !== req.user.callSign) {
        //              return res.status(403).json({ msg: 'Authorization denied' });
        //          }

        const result = await Injured.deleteOne({ _id: req.params.id }); // Використовуємо deleteOne

        if (result.deletedCount === 0) {
             // Це може статись, якщо запис видалили між findById і deleteOne (race condition)
             return res.status(404).json({ msg: 'Record not found or already deleted' });
        }

        res.json({ msg: 'Record removed successfully' });

    } catch (err) {
        console.error(`DELETE /api/injured/${req.params.id} error:`, err.message);
        // Перевірка на невалідний формат ID
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Record not found (Invalid ID format)' });
        }
        // Загальна помилка сервера
        res.status(500).json({ msg: 'Server Error while deleting injured record' });
    }
});


module.exports = router;