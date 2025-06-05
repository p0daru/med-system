// frontend/src/services/traumaRecord.api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Інтерсептор для токену, якщо потрібен
apiClient.interceptors.request.use(config => {
  // Дістаємо дані про користувача з localStorage (ми їх туди збережемо після логіну)
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  if (userInfo && userInfo.token) {
    // Якщо токен є, додаємо його в заголовок Authorization
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// === НОВІ ФУНКЦІЇ ДЛЯ АВТЕНТИФІКАЦІЇ ===
/**
 * Реєструє нового користувача.
 * @param {object} userData - { username, password }.
 */
export const register = (userData) => {
    return apiClient.post('/api/auth/register', userData);
};

/**
 * Авторизує користувача.
 * @param {object} credentials - { username, password }.
 */
export const login = (credentials) => {
    return apiClient.post('/api/auth/login', credentials);
};

/**
 * Створює новий запис про травму.
 * @param {object} traumaData - Повний об'єкт з даними картки.
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const createTraumaRecord = (traumaData) => {
    return apiClient.post('/api/trauma-records', traumaData);
};

// Зберігаємо старий експорт для сумісності, якщо десь ще використовується
// Або просто видаліть його, якщо ви оновили всі виклики на createTraumaRecord
export { createTraumaRecord as createPreHospitalRecord };


/**
 * Оновлює існуючий запис про травму.
 * @param {string} recordMongoId - ID запису в MongoDB (_id) для оновлення.
 * @param {object} dataToUpdate - Об'єкт з даними для оновлення.
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const updateTraumaRecord = async (recordMongoId, dataToUpdate) => {
    if (!recordMongoId) {
        return Promise.reject(new Error("ID запису MongoDB не надано для оновлення"));
    }
    // Використовуємо :id в URL, як очікує бекенд
    return apiClient.put(`/api/trauma-records/${recordMongoId}`, dataToUpdate);
};


/**
 * Оновлює існуючий запис даними з госпітального етапу.
 * @param {string} recordMongoId - ID запису в MongoDB (_id) для оновлення.
 * @param {object} hospitalUpdateData - Об'єкт, що містить { hospitalCareData, updatedPatientInfo?, status? }.
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const updateWithHospitalCareData = (recordMongoId, hospitalUpdateData) => {
    if (!recordMongoId) {
        return Promise.reject(new Error("ID запису MongoDB не надано для оновлення госпітальними даними"));
    }
    // Використовуємо :id в URL, як очікує бекенд
    return apiClient.put(`/api/trauma-records/${recordMongoId}/hospital`, hospitalUpdateData);
};

/**
 * Отримує всі записи про травми.
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const getAllTraumaRecords = () => {
    return apiClient.get('/api/trauma-records');
};

/**
 * Отримує один запис про травму за його ID (MongoDB _id).
 * @param {string} recordMongoId - ID запису в MongoDB (_id).
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const getTraumaRecordById = (recordMongoId) => {
    if (!recordMongoId) {
        return Promise.reject(new Error("ID запису не надано для getTraumaRecordById"));
    }
    // Використовуємо :id в URL, як очікує бекенд
    return apiClient.get(`/api/trauma-records/${recordMongoId}`);
};

/**
 * Видаляє запис про травму за його ID (MongoDB _id).
 * @param {string} recordMongoId - ID запису в MongoDB (_id).
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const deleteTraumaRecord = (recordMongoId) => {
    if (!recordMongoId) {
        return Promise.reject(new Error("ID запису не надано для deleteTraumaRecord"));
    }
    // Використовуємо :id в URL, як очікує бекенд
    return apiClient.delete(`/api/trauma-records/${recordMongoId}`);
};