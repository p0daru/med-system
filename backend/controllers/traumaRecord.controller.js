// backend/controllers/traumaRecord.controller.js
const TraumaRecord = require('../models/TraumaRecord.model');

// Створити новий запис про травму (первинна картка з догоспітального етапу)
exports.createPreHospitalRecord = async (req, res) => {
    try {
        const preHospitalFormData = req.body; // Очікуємо весь об'єкт з фронтенду

        // Мінімальна валідація наявності ключових полів (можна розширити)
        if (!preHospitalFormData.internalCardId || 
            !preHospitalFormData.incidentDateTime || 
            !preHospitalFormData.reasonForCall || 
            !preHospitalFormData.teamArrivalTimeScene ||
            !preHospitalFormData.triageCategory) {
            return res.status(400).json({ 
                message: 'Missing required fields: internalCardId, incidentDateTime, reasonForCall, teamArrivalTimeScene, triageCategory are required.' 
            });
        }
        
        // Перевірка, чи не існує вже запис з таким internalCardId
        const existingRecord = await TraumaRecord.findOne({ internalCardId: preHospitalFormData.internalCardId });
        if (existingRecord) {
            return res.status(409).json({ message: `Record with internalCardId ${preHospitalFormData.internalCardId} already exists.` });
        }

        // Створюємо новий запис, передаючи весь об'єкт з фронтенду
        const newRecord = new TraumaRecord(preHospitalFormData);
        
        // Mongoose хук pre('save') в моделі подбає про конвертацію дат
        await newRecord.save();
        
        res.status(201).json({
            message: 'Pre-hospital trauma record created successfully',
            record: newRecord
        });

    } catch (error) {
        console.error('Error creating pre-hospital trauma record:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        res.status(500).json({
            message: 'Error creating pre-hospital trauma record',
            error: error.message
        });
    }
};

// Оновити запис, додавши госпітальні дані (поки не змінюємо, але майте на увазі, що структура може змінитися)
exports.updateWithHospitalCareData = async (req, res) => {
    try {
        const { recordId } = req.params; // Це буде _id з MongoDB
        const { hospitalCareData, updatedPatientInfo } = req.body; 

        if (!hospitalCareData) {
            return res.status(400).json({ message: 'Missing hospitalCareData section' });
        }

        const record = await TraumaRecord.findById(recordId);
        if (!record) {
            return res.status(404).json({ message: 'Trauma record not found' });
        }

        record.hospitalCare = { ...(record.hospitalCare || {}), ...hospitalCareData };

        if (updatedPatientInfo) {
            // Уважно оновлюємо patientInfo, зберігаючи те, що вже є
            record.patientInfo = { ...(record.patientInfo || {}), ...updatedPatientInfo };
        }
        
        record.status = 'HospitalCare'; 

        const updatedRecord = await record.save();
        res.status(200).json({
            message: 'Trauma record updated with hospital care data successfully',
            record: updatedRecord
        });
    } catch (error) {
        console.error('Error updating trauma record with hospital data:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        res.status(500).json({
            message: 'Error updating trauma record',
            error: error.message
        });
    }
};


// Отримати всі записи (можна залишити без змін, але селект полів може потребувати оновлення)
exports.getAllTraumaRecords = async (req, res) => {
    try {
        const records = await TraumaRecord.find()
            .sort({ incidentDateTime: -1 }) 
            // Приклад вибірки лише кількох полів для списку
            .select('internalCardId incidentDateTime reasonForCall patientInfo.lastName patientInfo.firstName triageCategory status createdAt') 
            .lean(); // .lean() для швидкості, якщо не потрібні методи Mongoose
        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching all trauma records:', error);
        res.status(500).json({ message: 'Error fetching trauma records', error: error.message });
    }
};

// Отримати один запис за ID (ID з MongoDB, а не internalCardId)
exports.getTraumaRecordById = async (req, res) => {
    try {
        const record = await TraumaRecord.findById(req.params.id); // req.params.id - це _id
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json(record);
    } catch (error) {
        console.error('Error fetching trauma record by ID:', error);
        res.status(500).json({ message: 'Error fetching record', error: error.message });
    }
};

// Видалити запис за ID (ID з MongoDB)
exports.deleteTraumaRecord = async (req, res) => {
    try {
        const deletedRecord = await TraumaRecord.findByIdAndDelete(req.params.id); // req.params.id - це _id
        if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting trauma record:', error);
        res.status(500).json({ message: 'Error deleting trauma record', error: error.message });
    }
};

exports.updateTraumaRecord = async (req, res) => {
    try {
        const recordId = req.params.id; // Отримуємо _id з URL
        const dataToUpdate = req.body; // Отримуємо весь об'єкт з даними для оновлення

        // Опціонально: валідація dataToUpdate, якщо потрібно
        // Наприклад, перевірка наявності ключових полів, які не повинні бути порожніми

        // Знаходимо і оновлюємо запис в базі даних
        // { new: true } - повертає оновлений документ
        // { runValidators: true } - запускає валідацію Mongoose схеми перед оновленням
        const updatedRecord = await TraumaRecord.findByIdAndUpdate(
            recordId,
            dataToUpdate,
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Trauma record not found for update' });
        }

        console.log('Trauma record updated successfully (general update):', updatedRecord._id); // Логування для відладки

        res.status(200).json({
            message: 'Trauma record updated successfully',
            record: updatedRecord
        });

    } catch (error) {
        console.error('Error updating trauma record (general update):', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        // Якщо це помилка CastError (наприклад, неправильний формат ID)
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Invalid Record ID format" });
        }
        res.status(500).json({
            message: 'Error updating trauma record',
            error: error.message
        });
    }
};