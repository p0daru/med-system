// backend/routes/traumaRecord.api.routes.js (або traumaRecord.routes.js)
const express = require('express');
const router = express.Router();
// Переконайтесь, що шлях до контролера правильний
const traumaRecordController = require('../controllers/traumaRecord.controller');

// POST /api/trauma-records - Створити новий запис про травму
router.post('/', traumaRecordController.createPreHospitalRecord);

// GET /api/trauma-records - Отримати всі записи
router.get('/', traumaRecordController.getAllTraumaRecords);

// GET /api/trauma-records/:id - Отримати один запис за MongoDB _id
router.get('/:id', traumaRecordController.getTraumaRecordById);

// PUT /api/trauma-records/:id - Оновити існуючий запис (загальне оновлення)
router.put('/:id', traumaRecordController.updateTraumaRecord);

// PUT /api/trauma-records/:id/hospital - Оновити запис госпітальними даними
router.put('/:id/hospital', traumaRecordController.updateWithHospitalCareData);

// DELETE /api/trauma-records/:id - Видалити запис
router.delete('/:id', traumaRecordController.deleteTraumaRecord);

module.exports = router;