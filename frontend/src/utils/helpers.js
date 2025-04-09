// frontend/src/utils/helpers.js 

/**
 * Generates a unique individual number based on patient name and SSN digits.
 * (This is a placeholder implementation, replace with actual logic if needed)
 */
export const generateIndividualNumber = (fullName = '', last4SSN = '') => {
    const namePart = fullName.slice(0, 1).toUpperCase().padEnd(1, 'X');
    const ssnPart = last4SSN.padStart(4, '0');
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 random chars
    // Example format: LLL-DDDD-RRRRR (L=Letter from name, D=Digit from SSN, R=Random)
    return `${namePart}-${ssnPart}-${randomPart}`;
};


/**
 * Повертає поточний час у форматі HH:MM.
 */
export const getCurrentTime = () => {
    return new Date().toTimeString().slice(0, 5);
};

/**
//  * Фільтрує введення, дозволяючи тільки цифри або порожній рядок.
//  */
export const handleNumericInputChange = (e, fieldOnChange) => {
    const { value } = e.target;
    if (value === '' || /^\d+$/.test(value)) {
        fieldOnChange(value);
    }
};

/**
 * Фільтрує введення для формату АТ (ЧЧЧ/ЧЧЧ), дозволяючи тільки цифри та один '/'.
 */
export const handleBpInputChange = (e, fieldOnChange) => {
    let value = e.target.value;
    // 1. Дозволяємо тільки цифри і /
    value = value.replace(/[^0-9/]/g, '');
    // 2. Дозволяємо тільки один /
    const slashCount = (value.match(/\//g) || []).length;
    if (slashCount > 1) {
        const firstSlashIndex = value.indexOf('/');
        value = value.substring(0, firstSlashIndex + 1) + value.substring(firstSlashIndex + 1).replace(/\//g, '');
    }
    // 3. Обмежуємо довжину до і після / (макс 3 символи)
    const parts = value.split('/');
    if (parts[0] && parts[0].length > 3) parts[0] = parts[0].slice(0, 3);
    if (parts[1] && parts[1].length > 3) parts[1] = parts[1].slice(0, 3);
    value = parts.join('/');

    fieldOnChange(value);
};

/**
 * Допоміжна функція для перетворення порожніх рядків та пробілів у undefined для числових полів у схемах Yup.
 */
export const transformEmptyStringToUndefined = (value, originalValue) => {
    const trimmedValue = typeof originalValue === 'string' ? originalValue.trim() : originalValue;
    return trimmedValue === '' ? undefined : value;
};

/**
 * Форматує дату/час ISO рядка у читабельний український формат.
 */
export const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const dateObj = new Date(isoString);
        // Перевірка на валідність дати
        if (isNaN(dateObj.getTime())) return 'Недійсна дата';
        // Формат: 27.10.2023, 15:30
        return dateObj.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24-годинний формат
        });
    } catch (e) {
        console.error("Помилка форматування дати:", isoString, e);
        return 'Помилка';
    }
};
/**
 * Генерує безпечний ключ для алергенів.
 */
export const generateAllergyKey = (allergen) => {
    if (typeof allergen !== 'string') return '';
    return allergen.toLowerCase().replace(/[^a-zа-яіїєґ0-9_]+/gi, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
};

/**
 * Converts separate date and time strings into an ISO 8601 string.
 */
export const getISOFromDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    try {
        // Ensure time has seconds for Date constructor consistency, pad if needed
        const timeParts = timeStr.split(':');
        const hours = timeParts[0]?.padStart(2, '0') || '00';
        const minutes = timeParts[1]?.padStart(2, '0') || '00';
        const seconds = '00'; // Assume 00 seconds
        const paddedTime = `${hours}:${minutes}:${seconds}`;

        const d = new Date(`${dateStr}T${paddedTime}`);
        // Check if the date is valid
        if (isNaN(d.getTime())) {
            console.error("Invalid date created:", `${dateStr}T${paddedTime}`);
            return null;
        }
        return d.toISOString();
    } catch (e) {
        console.error("Error creating ISO date from:", dateStr, timeStr, e);
        return null;
    }
};

/**
 * Converts an ISO 8601 string back into separate date and time strings.
 */
export const getDateAndTimeFromISO = (isoString) => {
    if (!isoString) return { date: '', time: '' };
    try {
        const dateObj = new Date(isoString);
        if (isNaN(dateObj.getTime())) throw new Error('Invalid Date object from ISO string');
        const date = dateObj.toISOString().split('T')[0];
        // Format time as HH:MM
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return { date, time };
    } catch (e) {
        console.error("Error parsing ISO date:", isoString, e);
        return { date: '', time: '' };
    }
};
/**
 * Трансформер для Yup: порожній рядок -> null (для рядкових полів, де null краще)
 */
export const transformEmptyStringToNull = (value, originalValue) => {
    const trimmed = typeof originalValue === 'string' ? originalValue.trim() : originalValue;
    return trimmed === '' ? null : value;
};


/**
 * Creates a deep copy of the initial state object.
 * Necessary because the initial state contains nested objects and arrays.
 * @param {object} initialState - The initial state object template.
 * @returns {object} A deep copy of the initial state.
 */
export const getInitialStateCopy = (initialState) => {
    // Basic deep copy using JSON methods (sufficient for this structure)
    // For more complex cases with Dates, Functions, etc., a library like lodash.cloneDeep might be needed.
    return JSON.parse(JSON.stringify(initialState));
};

