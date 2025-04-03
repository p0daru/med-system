// frontend/src/utils/helpers.js (створіть цей файл, якщо його немає)

/**
 * Генерує індивідуальний номер у форматі #Ініціали-НСС.
 * @param {string} fullName - Повне ім'я (Прізвище Ім'я).
 * @param {string} last4SSN - Останні 4 цифри НСС.
 * @returns {string} - Згенерований індивідуальний номер або порожній рядок.
 */
export const generateIndividualNumber = (fullName = '', last4SSN = '') => {
    if (!fullName && !last4SSN) {
        return ''; // Не генерувати, якщо немає жодних даних
    }

    const nameParts = fullName.trim().split(/\s+/); // Розділяємо на частини за пробілами
    let initials = '';

    if (nameParts.length > 0 && nameParts[0]) {
        initials += nameParts[0][0].toUpperCase(); // Перша літера першого слова (прізвище)
    }
    if (nameParts.length > 1 && nameParts[1]) {
        initials += nameParts[1][0].toUpperCase(); // Перша літера другого слова (ім'я)
    }

    // Якщо ініціали порожні (немає імені), використовуємо 'X' або інший плейсхолдер
    if (!initials) {
        initials = 'X'; // Або можна залишити порожнім ''
    }

    // Формуємо рядок
    return `#${initials}-${last4SSN || '????'}`; // Додаємо '????' якщо НСС немає
};