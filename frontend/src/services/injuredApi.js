// frontend/src/services/injuredApi.js
import axios from 'axios';

const API_BASE_URL = '/api/injured'; // Використовуємо відносний шлях завдяки проксі

export const getAllInjured = async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data; // Повертаємо тільки дані
};

export const getInjuredById = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
};

export const createInjured = async (submissionData) => {
    const response = await axios.post(API_BASE_URL, submissionData);
    return response.data;
};

export const updateInjured = async (id, submissionData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, submissionData);
    return response.data;
};

export const deleteInjured = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data; // Зазвичай повертає { msg: '...' } або статус 200/204
};