// backend/routes/traumaRecord.api.routes.js (або traumaRecord.routes.js)
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const traumaRecordController = require('../controllers/traumaRecord.controller');

// Роут для /api/trauma-records
router.route('/')
    // Доступ до всіх записів мають всі, хто залогінився
    .get(
        protect, 
        traumaRecordController.getAllTraumaRecords // <-- ВИПРАВЛЕНО
    )
    // Створювати картку можуть медики та адміни
    .post(
        protect, 
        authorize('medic', 'admin'), 
        traumaRecordController.createPreHospitalRecord // <-- ВИПРАВЛЕНО
    );

// Роут для пакетного отримання деталей
router.post(
    '/batch-details', // Шлях буде /api/trauma-records/batch-details
    protect, // Всі залогінені користувачі можуть запитувати деталі
    traumaRecordController.getTraumaRecordsByIds
);

// Роут для /api/trauma-records/:id
router.route('/:id')
    // Отримати конкретний запис можуть всі залогінені
    .get(
        protect, 
        traumaRecordController.getTraumaRecordById // <-- ВИПРАВЛЕНО
    )
    // Оновлювати догоспітальний етап можуть медики та адміни
    .put(
        protect, 
        authorize('medic', 'admin'), 
        traumaRecordController.updateTraumaRecord // <-- ВИПРАВЛЕНО
    )
    // А видаляти - тільки адмін
    .delete(
        protect, 
        authorize('admin'), 
        traumaRecordController.deleteTraumaRecord // <-- ВИПРАВЛЕНО
    );

// Роут для /api/trauma-records/:id/hospital
router.route('/:id/hospital')
    // Оновлювати госпітальними даними можуть лікарі та адміни
    .put(
        protect, 
        authorize('doctor', 'admin'), 
        traumaRecordController.updateWithHospitalCareData // <-- ВИПРАВЛЕНО
    );

module.exports = router;

// // POST /api/trauma-records - Створити новий запис про травму
// router.post('/', traumaRecordController.createPreHospitalRecord);

// // GET /api/trauma-records - Отримати всі записи
// router.get('/', traumaRecordController.getAllTraumaRecords);

// // GET /api/trauma-records/:id - Отримати один запис за MongoDB _id
// router.get('/:id', traumaRecordController.getTraumaRecordById);

// // PUT /api/trauma-records/:id - Оновити існуючий запис (загальне оновлення)
// router.put('/:id', traumaRecordController.updateTraumaRecord);

// // PUT /api/trauma-records/:id/hospital - Оновити запис госпітальними даними
// router.put('/:id/hospital', traumaRecordController.updateWithHospitalCareData);

// // DELETE /api/trauma-records/:id - Видалити запис
// router.delete('/:id', traumaRecordController.deleteTraumaRecord);