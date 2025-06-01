// frontend/src/services/traumaRecord.api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// apiClient.interceptors.request.use(...); // Ваш інтерсептор для токена, якщо є

/**
 * Створює новий первинний запис про травму (догоспітальний етап).
 * Надсилає POST запит на /api/trauma-records/prehospital.
 * @param {object} preHospitalFormData - Повний об'єкт з даними догоспітального етапу.
 * @returns {Promise<import('axios').AxiosResponse<any>>} Проміс з відповіддю сервера.
 */
export const createPreHospitalRecord = (preHospitalFormData) => {
    // Бекенд очікує весь об'єкт formData напряму
    return apiClient.post('/api/trauma-records/prehospital', preHospitalFormData);
};

/**
 * Оновлює існуючий запис про травму (загальне оновлення).
 * Передбачається, що є ендпоінт PUT /api/trauma-records/:id для оновлення всього запису.
 * Якщо такого ендпоінту немає, цю функцію потрібно буде адаптувати або створити відповідний ендпоінт на бекенді.
 * @param {string} recordMongoId - ID запису в MongoDB (_id) для оновлення.
 * @param {object} dataToUpdate - Об'єкт з даними для оновлення (зазвичай це весь об'єкт formData).
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const updateTraumaRecord = async (recordMongoId, dataToUpdate) => {
    if (!recordMongoId) {
        return Promise.reject(new Error("ID запису MongoDB не надано для оновлення"));
    }
    // Цей URL є припущенням. Уточніть його з вашою архітектурою API.
    return apiClient.put(`/api/trauma-records/${recordMongoId}`, dataToUpdate);
};


/**
 * Оновлює існуючий запис даними з госпітального етапу.
 * Надсилає PUT запит на /api/trauma-records/:recordId/hospital.
 * @param {string} recordMongoId - ID запису в MongoDB (_id) для оновлення.
 * @param {object} hospitalUpdateData - Об'єкт, що містить { hospitalCareData, updatedPatientInfo? }.
 * @returns {Promise<import('axios').AxiosResponse<any>>} Проміс з відповіддю сервера.
 */
export const updateWithHospitalCareData = (recordMongoId, hospitalUpdateData) => {
    return apiClient.put(`/api/trauma-records/${recordMongoId}/hospital`, hospitalUpdateData);
};

/**
 * Отримує всі записи про травми.
 * Надсилає GET запит на /api/trauma-records.
 * @returns {Promise<import('axios').AxiosResponse<any>>} Проміс з масивом записів.
 */
export const getAllTraumaRecords = () => {
    return apiClient.get('/api/trauma-records');
};

/**
 * Отримує один запис про травму за його ID (MongoDB _id).
 * Надсилає GET запит на /api/trauma-records/:id.
 * @param {string} recordMongoId - ID запису в MongoDB (_id).
 * @returns {Promise<import('axios').AxiosResponse<any>>} Проміс з об'єктом запису.
 */
export const getTraumaRecordById = (recordMongoId) => {
    if (!recordMongoId) {
        return Promise.reject(new Error("ID запису не надано для getTraumaRecordById"));
    }
    return apiClient.get(`/api/trauma-records/${recordMongoId}`);
};

/**
 * Видаляє запис про травму за його ID (MongoDB _id).
 * Надсилає DELETE запит на /api/trauma-records/:id.
 * @param {string} recordMongoId - ID запису в MongoDB (_id).
 * @returns {Promise<import('axios').AxiosResponse<any>>} Проміс з відповіддю сервера.
 */
export const deleteTraumaRecord = (recordMongoId) => {
    if (!recordMongoId) {
        return Promise.reject(new Error("ID запису не надано для deleteTraumaRecord"));
    }
    return apiClient.delete(`/api/trauma-records/${recordMongoId}`);
};