// frontend/src/utils/mockDataGenerator.js
import { faker } from '@faker-js/faker/locale/uk';

// --- Допоміжна функція для вибору випадкового елемента з масиву ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Функція для генерації тестових даних ---
export const generateMockInjuredData = () => {
    const medicalStatuses = ['Stable', 'Serious', 'Critical', 'Treated', 'Evacuated', 'Unknown'];
    const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'];
    const injuryTypes = ['Gunshot', 'Shrapnel', 'Blast', 'Burn', 'Crush', 'Fall', 'Medical', 'Other', 'Unknown'];
    const injuryLocations = ['Праве плече', 'Ліве передпліччя', 'Грудна клітка', 'Живіт', 'Праве стегно', 'Ліва гомілка', 'Голова', 'Спина'];
    const injurySeverities = ['Minor', 'Moderate', 'Serious', 'Critical', 'Unknown'];
    const consciousnessLevels = ['Alert', 'Voice', 'Pain', 'Unresponsive', 'Unknown'];
    const evacuationStatuses = ['Not Required', 'Requested', 'In Progress', 'Completed', 'Delayed', 'Unknown'];
    const evacuationPriorities = ['T1-Urgent', 'T2-Priority', 'T3-Routine', 'T4-Expectant/Deceased', 'Unknown'];
    const treatmentActions = ['Накладено турнікет', 'Знеболення (Промедол)', 'Тампонада рани', 'Оклюзійна пов\'язка', 'Іммобілізація шиною', 'В/в інфузія'];
    const units = ['1й Бат', 'Медрота', 'Розвідка', 'Альфа', 'Омега'];
    const locations = ['Точка 101', 'Перехрестя доріг', 'Посадка біля річки', 'Будівля N', 'Поле'];
    const mechanisms = ['Осколкове', 'Кульове', 'Вибух міни', 'Вибух гранати', 'ДТП', 'Падіння з висоти'];
    const destinations = ['Стабпункт "Зоря"', 'Госпіталь м. Київ', 'Польовий шпиталь', 'Не визначено'];

    const name = faker.person.fullName();
    const hasCallSign = faker.datatype.boolean();
    const hasInjury = faker.datatype.boolean({ probability: 0.9 }); // 90% мають поранення
    const hasVitals = faker.datatype.boolean({ probability: 0.8 });
    const hasTreatment = faker.datatype.boolean({ probability: 0.7 });

    return {
        name: name,
        callSign: hasCallSign ? faker.lorem.word() : '',
        unit: getRandomElement(units),
        bloodType: getRandomElement(bloodTypes),
        allergies: faker.datatype.boolean({ probability: 0.1 }) ? faker.lorem.words(3) : 'Немає', // 10% мають алергії
        incidentTimestamp: faker.date.recent({ days: 5 }).toISOString().substring(0, 16),
        incidentLocation: getRandomElement(locations),
        mechanismOfInjury: getRandomElement(mechanisms),
        medicalStatus: getRandomElement(medicalStatuses),
        initialAssessmentNotes: faker.lorem.sentence(),
        evacuationStatus: getRandomElement(evacuationStatuses),
        evacuationPriority: getRandomElement(evacuationPriorities),
        evacuationDestination: getRandomElement(destinations),
        recordEnteredBy: faker.person.firstName(), // Хто вніс запис
        notes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.paragraph(1) : '', // 30% мають примітки

        // Поранення (якщо є)
        injuryType: hasInjury ? getRandomElement(injuryTypes) : 'Unknown',
        injuryLocation: hasInjury ? getRandomElement(injuryLocations) : '',
        injurySeverity: hasInjury ? getRandomElement(injurySeverities) : 'Unknown',
        injuryNotes: hasInjury ? faker.lorem.sentence(3) : '',

        // Вітальні показники (якщо є)
        vitalTimestamp: hasVitals ? faker.date.recent({ days: 1 }).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16),
        vitalPulse: hasVitals ? faker.number.int({ min: 50, max: 150 }).toString() : '',
        vitalBp: hasVitals ? `${faker.number.int({ min: 80, max: 160 })}/${faker.number.int({ min: 50, max: 100 })}` : '',
        vitalRespiration: hasVitals ? faker.number.int({ min: 10, max: 35 }).toString() : '',
        vitalSpo2: hasVitals ? faker.number.int({ min: 80, max: 100 }).toString() : '',
        vitalTemperature: hasVitals ? faker.number.float({ min: 35.0, max: 40.0, precision: 0.1 }).toString() : '',
        vitalConsciousness: hasVitals ? getRandomElement(consciousnessLevels) : 'Unknown',

        // Лікування (якщо є)
        treatmentTimestamp: hasTreatment ? faker.date.recent({ days: 1 }).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16),
        treatmentAction: hasTreatment ? getRandomElement(treatmentActions) : '',
        treatmentProvider: hasTreatment ? faker.person.firstName() : '',
    };
};