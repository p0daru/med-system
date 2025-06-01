// backend/routes/traumaRecord.routes.js (або як він у вас називається)
const express = require('express');
const router = express.Router();
const traumaRecordController = require('../controllers/traumaRecord.controller');

// Створити догоспітальний запис
router.post('/prehospital', traumaRecordController.createPreHospitalRecord);

// Отримати всі записи
router.get('/', traumaRecordController.getAllTraumaRecords);

// Отримати один запис за ID
router.get('/:id', traumaRecordController.getTraumaRecordById);

// Оновити запис госпітальними даними
router.put('/:recordId/hospital', traumaRecordController.updateWithHospitalCareData); // Зверніть увагу, що тут параметр називається recordId

// Видалити запис
router.delete('/:id', traumaRecordController.deleteTraumaRecord);

// ДОДАЙТЕ ЦЕЙ МАРШРУТ ДЛЯ ЗАГАЛЬНОГО ОНОВЛЕННЯ:
// Важливо, щоб параметр називався так само, як очікує контролер (req.params.id)
// і щоб метод був PUT (або PATCH, якщо ви так вирішили)
router.put('/:id', traumaRecordController.updateTraumaRecord);

module.exports = router;