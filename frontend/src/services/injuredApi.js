import axios from 'axios';

// 1. Отримуємо базову URL бекенду з змінної середовища,
//    яка встановлюється під час 'npm run build' у GitHub Actions.
//    Якщо змінна не визначена (наприклад, при локальному запуску без .env файлу),
//    можна додати запасний варіант для локальної розробки, АЛЕ краще
//    використовувати .env файли.
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 2. Визначаємо конкретний шлях для "injured"
const INJURED_API_PATH = '/api/injured';

// 3. Створюємо повну URL-адресу для запитів до "injured"
const API_ENDPOINT_URL = `${BACKEND_BASE_URL}${INJURED_API_PATH}`;

// Тепер використовуємо API_ENDPOINT_URL у всіх запитах

export const getAllInjured = async () => {
    // Запит іде на повну адресу: https://med-system-backend-cbju.onrender.com/api/injured
    const response = await axios.get(API_ENDPOINT_URL);
    return response.data;
};

export const getInjuredById = async (id) => {
    const response = await axios.get(`${API_ENDPOINT_URL}/${id}`);
    return response.data;
};

export const createInjured = async (submissionData) => {
    const response = await axios.post(API_ENDPOINT_URL, submissionData);
    return response.data;
};

export const updateInjured = async (id, submissionData) => {
    const response = await axios.put(`${API_ENDPOINT_URL}/${id}`, submissionData);
    return response.data;
};

export const deleteInjured = async (id) => {
    const response = await axios.delete(`${API_ENDPOINT_URL}/${id}`);
    return response.data;
};