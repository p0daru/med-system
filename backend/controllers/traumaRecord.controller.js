const TraumaRecord = require('../models/TraumaRecord.model');
const mongoose = require('mongoose');

// Створити новий запис про травму (POST /api/trauma-records)
exports.createPreHospitalRecord = async (req, res) => {
    try {
        const {
            // Деструктуризуємо поля, що стосуються patientInfo
            patientFullName,
            patientGender,
            patientDateOfBirth,
            patientApproximateAge,
            // Решта полів збираємо в otherDataFromFrontend
            ...otherDataFromFrontend
        } = req.body;

        // Формуємо об'єкт patientInfo
        const patientInfo = {
            patientFullName,
            patientGender,
            patientDateOfBirth: patientDateOfBirth || null, // Переконуємось, що порожній рядок стане null
            patientApproximateAge,
        };

        // Формуємо фінальний об'єкт для збереження, комбінуючи інші дані та patientInfo
        const recordDataToSave = {
            ...otherDataFromFrontend,
            patientInfo, // Додаємо структурований об'єкт patientInfo
        };
        
        // Базова валідація обов'язкових полів (перевіряємо вже структуровані дані)
        if (!recordDataToSave.cardId ||
            !recordDataToSave.incidentDateTime ||
            !recordDataToSave.arrivalDateTime ||
            !recordDataToSave.medicalTeamResponsible) {
            return res.status(400).json({
                message: "Обов'язкові поля: cardId, incidentDateTime, arrivalDateTime, medicalTeamResponsible."
            });
        }

        const existingRecord = await TraumaRecord.findOne({ cardId: recordDataToSave.cardId });
        if (existingRecord) {
            return res.status(409).json({ message: `Запис з ID картки ${recordDataToSave.cardId} вже існує.` });
        }

        const newRecord = new TraumaRecord(recordDataToSave);
        await newRecord.save(); // Хук pre-save в моделі обробить дати (включаючи patientInfo.patientDateOfBirth) та порожні масиви

        res.status(201).json({
            message: 'Запис про травму успішно створено',
            record: newRecord
        });

    } catch (error) {
        console.error('Помилка створення запису про травму:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => `${err.path}: ${err.message}`);
            return res.status(400).json({ message: "Помилка валідації", errors });
        }
        res.status(500).json({
            message: 'Помилка на сервері при створенні запису',
            error: error.message
        });
    }
};

// Оновити існуючий запис про травму (PUT /api/trauma-records/:id)
exports.updateTraumaRecord = async (req, res) => {
    try {
        const recordMongoId = req.params.id;
        const incomingData = req.body;

        if (!mongoose.Types.ObjectId.isValid(recordMongoId)) {
            return res.status(400).json({ message: 'Невірний формат ID запису' });
        }

        // Не дозволяємо змінювати _id або cardId
        if (incomingData.hasOwnProperty('_id')) delete incomingData._id;
        if (incomingData.hasOwnProperty('cardId')) delete incomingData.cardId;

        if (incomingData.hasOwnProperty('medicalTeamResponsible') && !incomingData.medicalTeamResponsible) {
             return res.status(400).json({ message: 'Поле "Відповідальний мед. працівник" не може бути порожнім при оновленні.' });
        }

        const updateOperations = {}; // Об'єкт для оператора $set

        for (const key in incomingData) {
            if (incomingData.hasOwnProperty(key)) {
                const value = incomingData[key];
                // Оновлюємо тільки якщо значення було передано (не undefined)
                // undefined означає, що поле не було надіслано для оновлення
                if (value !== undefined) {
                    if (['patientFullName', 'patientGender', 'patientDateOfBirth', 'patientApproximateAge'].includes(key)) {
                        // Для полів patientInfo використовуємо крапкову нотацію
                        // Якщо значення порожній рядок, для деяких полів це може означати null
                        // `patientGender` може бути `''` (валідний enum)
                        // `patientDateOfBirth` порожній рядок перетвориться на null нижче
                        // `patientFullName` та `patientApproximateAge` можуть бути `''`
                        updateOperations[`patientInfo.${key}`] = value;
                    } else {
                        updateOperations[key] = value;
                    }
                }
            }
        }
        
        // Обробка patientInfo.patientDateOfBirth для $set
        // Хук pre('save') не спрацює для findByIdAndUpdate, тому дати треба готувати тут
        if (updateOperations.hasOwnProperty('patientInfo.patientDateOfBirth')) {
            const dobStr = updateOperations['patientInfo.patientDateOfBirth'];
            if (typeof dobStr === 'string') {
                if (dobStr.match(/^\d{4}-\d{2}-\d{2}$/)) { // Валідний формат YYYY-MM-DD
                    const parts = dobStr.split('-');
                    updateOperations['patientInfo.patientDateOfBirth'] = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                } else if (dobStr === '') { // Порожній рядок означає очищення дати
                    updateOperations['patientInfo.patientDateOfBirth'] = null;
                } else { // Невалідний формат рядка дати
                    console.warn(`Invalid date format for patientInfo.patientDateOfBirth in update: "${dobStr}". Field will not be updated.`);
                    delete updateOperations['patientInfo.patientDateOfBirth']; // Не оновлюємо поле, якщо формат невірний
                }
            } else if (dobStr === null) {
                updateOperations['patientInfo.patientDateOfBirth'] = null; // Вже null, все гаразд
            } else if (!(dobStr instanceof Date)) { // Якщо це не рядок, не null і не Date
                 console.warn(`Unexpected type for patientInfo.patientDateOfBirth in update: "${typeof dobStr}". Field will not be updated.`);
                 delete updateOperations['patientInfo.patientDateOfBirth'];
            }
        }

        // Обробка інших полів типу Date (incidentDateTime, arrivalDateTime)
        const dateFieldsToProcessForUpdate = ['incidentDateTime', 'arrivalDateTime'];
        dateFieldsToProcessForUpdate.forEach(field => {
            if (updateOperations.hasOwnProperty(field)) {
                const dateStr = updateOperations[field];
                if (typeof dateStr === 'string') {
                    if (dateStr === '') { // Порожній рядок для очищення
                        updateOperations[field] = null;
                    } else {
                        const dateValue = new Date(dateStr); // Спроба конвертації
                        if (!isNaN(dateValue.getTime())) { // Перевірка на валідність дати
                            updateOperations[field] = dateValue;
                        } else {
                            console.warn(`Invalid date string for ${field} in update: "${dateStr}". Field will not be updated.`);
                            delete updateOperations[field];
                        }
                    }
                } else if (dateStr === null) {
                    updateOperations[field] = null; // Вже null
                } else if (!(dateStr instanceof Date)) { // Не рядок, не null, не Date
                    console.warn(`Unexpected type for ${field} in update: "${typeof dateStr}". Field will not be updated.`);
                    delete updateOperations[field];
                }
            }
        });

        if (Object.keys(updateOperations).length === 0) {
             // Якщо після всіх перевірок нічого оновлювати, завантажуємо актуальний запис
            const record = await TraumaRecord.findById(recordMongoId);
            return res.status(200).json({ 
                message: 'Дані для оновлення не змінили запис або були недійсними.', 
                record: record 
            });
        }
        
        const updatedRecord = await TraumaRecord.findByIdAndUpdate(
            recordMongoId,
            { $set: updateOperations },
            { new: true, runValidators: true, context: 'query' } // context: 'query' для валідаторів при $set
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Запис про травму не знайдено для оновлення' });
        }

        res.status(200).json({
            message: 'Запис про травму успішно оновлено',
            record: updatedRecord
        });

    } catch (error) {
        console.error('Помилка оновлення запису про травму:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => `${err.path}: ${err.message}`);
            return res.status(400).json({ message: "Помилка валідації", errors });
        }
        res.status(500).json({ message: 'Помилка на сервері при оновленні запису', error: error.message });
    }
};

// Оновити запис, додавши госпітальні дані (PUT /api/trauma-records/:id/hospital)
// Цей контролер вже мав правильну логіку для оновлення patientInfo і використовує record.save(),
// тому хук pre('save') для patientInfo.patientDateOfBirth там спрацює.
exports.updateWithHospitalCareData = async (req, res) => {
    try {
        const recordMongoId = req.params.id;
        const { hospitalCareData, updatedPatientInfo, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(recordMongoId)) {
            return res.status(400).json({ message: 'Невірний формат ID запису' });
        }

        if (!hospitalCareData && !updatedPatientInfo && !status) {
            return res.status(400).json({ message: 'Немає даних для оновлення госпітального етапу' });
        }

        const record = await TraumaRecord.findById(recordMongoId);
        if (!record) {
            return res.status(404).json({ message: 'Запис про травму не знайдено' });
        }

        let hasChanges = false;

        if (hospitalCareData && Object.keys(hospitalCareData).length > 0) {
            record.hospitalCareData = { ...(record.hospitalCareData || {}), ...hospitalCareData };
            record.markModified('hospitalCareData');
            hasChanges = true;
        }

        if (updatedPatientInfo && Object.keys(updatedPatientInfo).length > 0) {
            if (!record.patientInfo) record.patientInfo = {}; // Ініціалізуємо, якщо немає
            for (const key in updatedPatientInfo) {
                if (updatedPatientInfo.hasOwnProperty(key)) {
                     // Оновлюємо тільки якщо значення дійсно надано (не undefined)
                     // Порожній рядок для patientFullName, patientApproximateAge, patientGender є допустимим оновленням
                     // Порожній рядок для patientDateOfBirth буде оброблено хуком pre-save
                    if (updatedPatientInfo[key] !== undefined) {
                        record.patientInfo[key] = updatedPatientInfo[key];
                    }
                }
            }
            record.markModified('patientInfo'); // Важливо для вкладених схем
            hasChanges = true;
        }

        const validStatuses = ['HospitalCareActive', 'HospitalCareFinalized', 'Closed', 'Archived'];
        if (status && validStatuses.includes(status)) {
            record.status = status;
            hasChanges = true;
        } else if (hospitalCareData && record.status === 'PreHospitalFinalized' && status !== record.status) {
             record.status = 'HospitalCareActive';
             hasChanges = true;
        }

        if (!hasChanges) {
             return res.status(200).json({
                message: 'Дані для оновлення не змінили запис.',
                record: record
            });
        }

        const updatedRecordResult = await record.save(); // Хук pre-save обробить patientInfo.patientDateOfBirth
        res.status(200).json({
            message: 'Запис про травму успішно оновлено госпітальними даними',
            record: updatedRecordResult
        });
    } catch (error) {
        console.error('Помилка оновлення госпітальними даними:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => `${err.path}: ${err.message}`);
            return res.status(400).json({ message: "Помилка валідації", errors });
        }
        res.status(500).json({ message: 'Помилка на сервері при оновленні госпітальними даними', error: error.message });
    }
};

// Отримати всі записи (GET /api/trauma-records)
// Залишається без змін, оскільки select вже використовує patientInfo.patientFullName і т.д.
exports.getAllTraumaRecords = async (req, res) => {
    try {
        const records = await TraumaRecord.find()
            .sort({ incidentDateTime: -1 })
            .select(
                'cardId incidentDateTime patientInfo.patientFullName patientInfo.patientDateOfBirth patientInfo.patientApproximateAge ' +
                'triageCategory complaints mechanismOfInjuryDetailed exposureDetails status createdAt medicalTeamResponsible'
            )
            .lean();

        res.status(200).json(records);
    } catch (error) {
        console.error('Помилка отримання всіх записів про травми:', error);
        res.status(500).json({
            message: 'Помилка на сервері при отриманні списку записів',
            error: error.message
        });
    }
};


// Отримати один запис за MongoDB _id (GET /api/trauma-records/:id)
// Залишається без змін
exports.getTraumaRecordById = async (req, res) => {
    try {
        const recordMongoId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(recordMongoId)) {
           return res.status(400).json({ message: 'Невірний формат ID запису' });
        }

        const record = await TraumaRecord.findById(recordMongoId);

        if (!record) {
            return res.status(404).json({ message: 'Запис про травму не знайдено' });
        }

        res.status(200).json(record);
    } catch (error) {
        console.error(`Помилка отримання запису про травму за ID (${req.params.id}):`, error);
        res.status(500).json({
            message: 'Помилка на сервері при отриманні запису',
            error: error.message
        });
    }
};

// Отримати деталі кількох записів за їхніми ID (POST /api/trauma-records/batch-details)
exports.getTraumaRecordsByIds = async (req, res) => {
    try {
        const { ids } = req.body; // Очікуємо масив ID в тілі запиту

        // Валідація вхідних даних
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Масив "ids" є обов\'язковим і не може бути порожнім.' });
        }
        
        // Перевірка, чи всі ID валідні
        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ message: `Наступні ID мають невірний формат: ${invalidIds.join(', ')}` });
        }

        // Запит до бази даних за допомогою оператора $in
        const records = await TraumaRecord.find({
            '_id': { $in: ids }
        });

        // Повертаємо знайдені записи (навіть якщо деякі не знайдено, повернемо порожній масив або частковий результат)
        res.status(200).json(records);

    } catch (error) {
        console.error('Помилка отримання записів за масивом ID:', error);
        res.status(500).json({
            message: 'Помилка на сервері при отриманні деталей записів',
            error: error.message
        });
    }
};

// Видалити запис за MongoDB _id (DELETE /api/trauma-records/:id)
// Залишається без змін
exports.deleteTraumaRecord = async (req, res) => {
    try {
        const recordMongoId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(recordMongoId)) {
           return res.status(400).json({ message: 'Невірний формат ID запису' });
        }

        const deletedRecord = await TraumaRecord.findByIdAndDelete(recordMongoId);

        if (!deletedRecord) {
            return res.status(404).json({ message: 'Запис про травму не знайдено для видалення' });
        }

        res.status(200).json({
            message: 'Запис про травму успішно видалено',
            recordId: deletedRecord._id
        });
    } catch (error) {
        console.error(`Помилка видалення запису про травму (${req.params.id}):`, error);
        res.status(500).json({
            message: 'Помилка на сервері при видаленні запису',
            error: error.message
        });
    }
};