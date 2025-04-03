// import axios from 'axios';

// // 1. Отримуємо базову URL бекенду з змінної середовища,
// //    яка встановлюється під час 'npm run build' у GitHub Actions.
// //    Якщо змінна не визначена (наприклад, при локальному запуску без .env файлу),
// //    можна додати запасний варіант для локальної розробки, АЛЕ краще
// //    використовувати .env файли.
// const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // 2. Визначаємо конкретний шлях для "injured"
// const INJURED_API_PATH = '/api/casualty-card';

// // 3. Створюємо повну URL-адресу для запитів до "injured"
// const API_ENDPOINT_URL = `${BACKEND_BASE_URL}${INJURED_API_PATH}`;

// src/services/injuredApi.js
import axios from 'axios';

// 1. Отримуємо базову URL бекенду з змінної середовища
//    (Припускаємо, що вона налаштована, напр., VITE_API_BASE_URL для Vite)
//    ЗАПАСНИЙ ВАРІАНТ ДЛЯ ЛОКАЛЬНОЇ РОЗРОБКИ (якщо VITE_API_BASE_URL не задано):
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'; // Або ваш локальний порт

// 2. Визначаємо конкретний шлях для API карток поранених
const CASUALTY_CARD_API_PATH = '/api/casualty-card'; // Змінено шлях

// 3. Створюємо повну URL-адресу для запитів
const API_ENDPOINT_URL = `${BACKEND_BASE_URL}${CASUALTY_CARD_API_PATH}`;

console.log(`API Endpoint URL configured: ${API_ENDPOINT_URL}`); // Для дебагу

/**
 * Отримує список карток поранених з можливістю пошуку.
 * @param {string} [searchQuery=''] - Рядок для пошуку (необов'язковий).
 * @returns {Promise<Array>} - Проміс, що повертає масив карток.
 */
export const getInjuredList = async (searchQuery = '') => {
    console.log(`Fetching injured list with search: "${searchQuery}"`);
    try {
        const params = {};
        if (searchQuery) {
            params.search = searchQuery; // Додаємо параметр пошуку, якщо він є
        }
        // Запит іде на API_ENDPOINT_URL з параметрами пошуку
        const response = await axios.get(API_ENDPOINT_URL, { params });
        console.log(`Fetched ${response.data?.length || 0} cards.`);
        return response.data || []; // Повертаємо дані або порожній масив
    } catch (error) {
        console.error("Error fetching injured list:", error.response?.data || error.message);
        // Прокидуємо помилку далі, щоб компонент міг її обробити
        throw error.response?.data || new Error("Не вдалося завантажити список поранених");
    }
};

/**
 * Отримує одну картку пораненого за її ID.
 * @param {string} id - ID картки.
 * @returns {Promise<Object>} - Проміс, що повертає об'єкт картки.
 */
export const getInjuredById = async (id) => {
    console.log(`Fetching injured card by ID: ${id}`);
    if (!id) {
         console.error("getInjuredById called without ID.");
         throw new Error("ID картки не вказано");
    }
    try {
        const response = await axios.get(`${API_ENDPOINT_URL}/${id}`);
        console.log(`Fetched card data for ID: ${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching injured card with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Не вдалося завантажити картку з ID ${id}`);
    }
};

/**
 * Створює нову картку пораненого.
 * @param {Object} submissionData - Дані картки для створення.
 * @returns {Promise<Object>} - Проміс, що повертає створений об'єкт картки.
 */
export const createInjured = async (submissionData) => {
    console.log('Attempting to create new injured card...');
    try {
        const response = await axios.post(API_ENDPOINT_URL, submissionData);
        console.log('Injured card created successfully:', response.data?._id);
        return response.data;
    } catch (error) {
        console.error("Error creating injured card:", error.response?.data || error.message);
        // Прокидуємо помилку валідації/сервера
        throw error.response?.data || new Error("Не вдалося створити картку");
    }
};

/**
 * Оновлює існуючу картку пораненого за її ID.
 * @param {string} id - ID картки для оновлення.
 * @param {Object} submissionData - Дані для оновлення картки.
 * @returns {Promise<Object>} - Проміс, що повертає оновлений об'єкт картки.
 */
export const updateInjured = async (id, submissionData) => {
    console.log(`Attempting to update injured card with ID: ${id}`);
     if (!id) {
         console.error("updateInjured called without ID.");
         throw new Error("ID картки для оновлення не вказано");
     }
    try {
        const response = await axios.put(`${API_ENDPOINT_URL}/${id}`, submissionData);
        console.log('Injured card updated successfully:', response.data?._id);
        return response.data;
    } catch (error) {
        console.error(`Error updating injured card with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Не вдалося оновити картку з ID ${id}`);
    }
};

/**
 * Видаляє картку пораненого за її ID.
 * @param {string} id - ID картки для видалення.
 * @returns {Promise<Object>} - Проміс, що повертає об'єкт з повідомленням про успіх.
 */
export const deleteInjured = async (id) => {
    console.log(`Attempting to delete injured card with ID: ${id}`);
     if (!id) {
         console.error("deleteInjured called without ID.");
         throw new Error("ID картки для видалення не вказано");
     }
    try {
        const response = await axios.delete(`${API_ENDPOINT_URL}/${id}`);
        console.log('Injured card deleted successfully:', id);
        return response.data; // Зазвичай повертає { message: "...", id: "..." }
    } catch (error) {
        console.error(`Error deleting injured card with ID ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Не вдалося видалити картку з ID ${id}`);
    }
};

// Залишаємо `getAllInjured` як синонім для зворотної сумісності, якщо потрібно,
// але рекомендуємо використовувати `getInjuredList`
export const getAllInjured = getInjuredList;

// Тепер використовуємо API_ENDPOINT_URL у всіх запитах

// export const getAllInjured = async () => {
//     // Запит іде на повну адресу: https://med-system-backend-cbju.onrender.com/api/injured
//     const response = await axios.get(API_ENDPOINT_URL);
//     return response.data;
// };

// export const getInjuredById = async (id) => {
//     const response = await axios.get(`${API_ENDPOINT_URL}/${id}`);
//     return response.data;
// };

// export const createInjured = async (submissionData) => {
//     const response = await axios.post(API_ENDPOINT_URL, submissionData);
//     return response.data;
// };

// export const updateInjured = async (id, submissionData) => {
//     const response = await axios.put(`${API_ENDPOINT_URL}/${id}`, submissionData);
//     return response.data;
// };

// export const deleteInjured = async (id) => {
//     const response = await axios.delete(`${API_ENDPOINT_URL}/${id}`);
//     return response.data;
// };

