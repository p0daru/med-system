// frontend/src/hooks/useAuth.js
import { useMemo } from 'react';

// Правильний іменований експорт функції-хука
export const useAuth = () => {
    // useMemo для оптимізації, щоб не парсити localStorage при кожному рендері
    const userInfo = useMemo(() => {
        try {
            const info = localStorage.getItem('userInfo');
            return info ? JSON.parse(info) : null;
        } catch (error) {
            console.error("Failed to parse userInfo from localStorage", error);
            // У разі помилки повертаємо null, щоб уникнути падіння додатку
            localStorage.removeItem('userInfo'); // Очищуємо пошкоджені дані
            return null;
        }
    }, []); // Порожній масив залежностей означає, що функція виконається лише один раз

    // Повертаємо об'єкт з даними аутентифікації
    return {
        isLoggedIn: !!userInfo?.token,
        user: userInfo,
        isAdmin: userInfo?.role === 'admin',
        isDoctor: userInfo?.role === 'doctor',
        isMedic: userInfo?.role === 'medic'
    };
};