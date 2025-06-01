// backend/controllers/traumaRecord.controller.js
const TraumaRecord = require('../models/TraumaRecord.model');
const mongoose = require('mongoose'); // Додано для перевірки ObjectId

// Створити новий запис про травму (POST /api/trauma-records)
exports.createPreHospitalRecord = async (req, res) => {
    try {
        const recordDataFromFrontend = req.body;

        // Базова валідація обов'язкових полів
        if (!recordDataFromFrontend.cardId ||
            !recordDataFromFrontend.incidentDateTime ||
            !recordDataFromFrontend.arrivalDateTime || // Залишено, якщо це дійсно обов'язкове поле з точки зору бізнес-логіки
            !recordDataFromFrontend.medicalTeamResponsible) {
            return res.status(400).json({
                message: "Обов'язкові поля: cardId, incidentDateTime, arrivalDateTime, medicalTeamResponsible."
            });
        }

        const existingRecord = await TraumaRecord.findOne({ cardId: recordDataFromFrontend.cardId });
        if (existingRecord) {
            return res.status(409).json({ message: `Запис з ID картки ${recordDataFromFrontend.cardId} вже існує.` });
        }

        const newRecord = new TraumaRecord(recordDataFromFrontend);
        await newRecord.save(); // Хук pre-save в моделі обробить дати та порожні масиви

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
        const recordMongoId = req.params.id; // Отримуємо _id з URL
        const dataToUpdate = req.body;

        if (!mongoose.Types.ObjectId.isValid(recordMongoId)) {
            return res.status(400).json({ message: 'Невірний формат ID запису' });
        }

        // Не дозволяємо змінювати _id або cardId через цей ендпоінт
        if (dataToUpdate._id) delete dataToUpdate._id;
        if (dataToUpdate.cardId) delete dataToUpdate.cardId;

        // Приклад валідації на рівні контролера (можна розширити)
        if (dataToUpdate.hasOwnProperty('medicalTeamResponsible') && !dataToUpdate.medicalTeamResponsible) {
             return res.status(400).json({ message: 'Поле "Відповідальний мед. працівник" не може бути порожнім при оновленні.' });
        }

        const updatedRecord = await TraumaRecord.findByIdAndUpdate(
            recordMongoId,
            { $set: dataToUpdate },
            { new: true, runValidators: true, context: 'query' } // context: 'query' потрібен для валідаторів Mongoose при $set
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
            // Глибоке злиття об'єктів, щоб не перезатирати існуючі дані в hospitalCareData, якщо передається лише частина
            record.hospitalCareData = { ...(record.hospitalCareData || {}), ...hospitalCareData };
            record.markModified('hospitalCareData'); // Важливо для Schema.Types.Mixed
            hasChanges = true;
        }

        if (updatedPatientInfo && Object.keys(updatedPatientInfo).length > 0) {
            if (!record.patientInfo) record.patientInfo = {};
            for (const key in updatedPatientInfo) {
                // Оновлюємо тільки якщо значення дійсно надано (не undefined)
                if (updatedPatientInfo.hasOwnProperty(key) && updatedPatientInfo[key] !== undefined) {
                    record.patientInfo[key] = updatedPatientInfo[key];
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
             record.status = 'HospitalCareActive'; // Автоматична зміна статусу
             hasChanges = true;
        }

        if (!hasChanges) {
             return res.status(200).json({
                message: 'Дані для оновлення не змінили запис.', // Або 304 Not Modified
                record: record
            });
        }

        const updatedRecord = await record.save(); // Хук pre-save обробить patientInfo.patientDateOfBirth, якщо воно є в updatedPatientInfo
        res.status(200).json({
            message: 'Запис про травму успішно оновлено госпітальними даними',
            record: updatedRecord
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
exports.getAllTraumaRecords = async (req, res) => {
    try {
        // Обираємо поля, необхідні для журналу пацієнтів
        const records = await TraumaRecord.find()
            .sort({ incidentDateTime: -1 })
            .select('cardId incidentDateTime patientInfo.patientFullName patientInfo.patientDateOfBirth patientInfo.patientApproximateAge triageCategory complaints mechanismOfInjuryDetailed exposureDetails status createdAt')
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
exports.getTraumaRecordById = async (req, res) => {
    try {
        const recordMongoId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(recordMongoId)) {
           return res.status(400).json({ message: 'Невірний формат ID запису' });
        }

        const record = await TraumaRecord.findById(recordMongoId); // .lean() тут не потрібен, якщо потрібні методи Mongoose

        if (!record) {
            return res.status(404).json({ message: 'Запис про травму не знайдено' });
        }

        res.status(200).json(record);
    } catch (error) {
        console.error(`Помилка отримання запису про травму за ID (${req.params.id}):`, error);
        // CastError вже обробляється перевіркою isValid
        res.status(500).json({
            message: 'Помилка на сервері при отриманні запису',
            error: error.message
        });
    }
};

// Видалити запис за MongoDB _id (DELETE /api/trauma-records/:id)
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