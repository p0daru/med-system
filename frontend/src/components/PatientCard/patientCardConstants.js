// frontend/src/components/PatientCard/patientCardConstants.js

const constants = {
    marchSurveyFields: {
    massiveHemorrhageControl: "M - Massive Hemorrhage (Контроль)",
    airwayManagement: "A - Airway (Забезпечення ДШ)",
    breathingAssessment: "R - Respiration (Оцінка дихання)",
    circulationAssessment: "C - Circulation (Оцінка кровообігу)",
    hypothermiaPreventionHeadInjury: "H - Hypothermia / Head Injury (Гіпотермія, ЧМТ)",
},
marchPlaceholders: {
    massiveHemorrhageControl: "Джерела та методи контролю масивної кровотечі...",
    // ... інші плейсхолдери
},
marchRequiredFields: [ // Масив ключів, які є обов'язковими
    'massiveHemorrhageControl',
    'airwayManagement',
    'breathingAssessment',
    'circulationAssessment',
    'hypothermiaPreventionHeadInjury',
],
    // --- ОПЦІЇ ДЛЯ ВИПАДАЮЧИХ СПИСКІВ ТА РАДІО-КНОПОК ---
    genders: ['Чоловіча', 'Жіноча', 'Невідомо'], // Додано
    triageCategories: [
        'Червоний (I - Невідкладний)',
        'Жовтий (II - Терміновий)',
        'Зелений (III - Нетерміновий/Відкладений)',
        'Чорний (IV - Померлий/Агонуючий)',
    ],
    airwayManagementOptions: [
        'Дихальні шляхи вільні, прохідні',
        'Потрійний прийом Сафара',
        'Аспірація вмісту ротоглотки',
        'Орофарингеальний повітровід (OPA)',
        'Назофарингеальний повітровід (NPA)',
        'Надгортанний повітровід (LMA/iGel/Комбітюб)',
        'Ендотрахеальна інтубація (ETT)',
        'Конікотомія / Крікотиреотомія',
        'Видалення стороннього тіла',
    ],
    bodyParts: [
        'Голова', 'Обличчя', 'Шия',
        'Грудна клітка (Права сторона)', 'Грудна клітка (Ліва сторона)', 'Грудна клітка (Середина)',
        'Живіт (Верхній правий квадрант)', 'Живіт (Верхній лівий квадрант)',
        'Живіт (Нижній правий квадрант)', 'Живіт (Нижній лівий квадрант)',
        'Спина (Верхня частина)', 'Спина (Нижня частина)', 'Таз',
        'Права верхня кінцівка (Плече)', 'Права верхня кінцівка (Передпліччя)', 'Права верхня кінцівка (Кисть)',
        'Ліва верхня кінцівка (Плече)', 'Ліва верхня кінцівка (Передпліччя)', 'Ліва верхня кінцівка (Кисть)',
        'Права нижня кінцівка (Стегно)', 'Права нижня кінцівка (Гомілка)', 'Права нижня кінцівка (Стопа)',
        'Ліва нижня кінцівка (Стегно)', 'Ліва нижня кінцівка (Гомілка)', 'Ліва нижня кінцівка (Стопа)',
        'Множинні ділянки',
    ],
    injuryTypes: [
        'Рана (рвана/різана/колота)', 'Забій/Гематома', 'Опік (термічний/хімічний)',
        'Перелом (закритий)', 'Перелом (відкритий)', 'Вивих/Розтягнення',
        'Ампутація (травматична)', 'Стороннє тіло', 'Вогнепальне поранення', 'Вибухова травма (осколки)',
        'Інше',
    ],
    interventionTypes: [
        'Огляд та оцінка стану',
        'Контроль масивної кровотечі (джгут/турнікет)',
        'Контроль масивної кровотечі (тиснуча пов\'язка)',
        'Контроль масивної кровотечі (тампонада)',
        'Забезпечення прохідності дихальних шляхів (ручне)',
        'Забезпечення прохідності дихальних шляхів (повітровід OPA/NPA)',
        'Інтубація трахеї / Надгортанний повітровід',
        'Голкова декомпресія (пневмоторакс)',
        'Оклюзійна пов\'язка (відкритий пневмоторакс)',
        'Внутрішньовенний доступ (периферичний)',
        'Внутрішньокістковий доступ',
        'Інфузійна терапія (розчин, об\'єм)',
        'Знеболення (медикаментозне)',
        'Іммобілізація (шини/комір/дошка)',
        'Протишокові заходи (запобігання гіпотермії)',
        'Серцево-легенева реанімація (СЛР)',
    ],
    medicationUnits: ['мг', 'мл', 'мкг', 'од'],
    medicationRoutes: ['в/в', 'в/м', 'п/ш', 'ІН (інтраназально)', 'в/к', 'п/о (перорально)'],
    transportModes: ['ЕМД (Автомобіль)', 'ДСНС (Автомобіль)', 'Авіа (Гелікоптер)', 'Інше'],
    patientOutcomePreHospital: [
        'Госпіталізовано', 'Передано іншій бригаді', 'Відмова від госпіталізації', 'Смерть на місці', 'Смерть під час транспортування'
    ],

    // --- ШАБЛОНИ ДЛЯ ДИНАМІЧНИХ МАСИВІВ ---
    vitalSignTemplate: {
        timestamp: '', sbp: '', dbp: '', hr: '', rr: '', spo2: '',
        gcsE: '', gcsV: '', gcsM: '', gcsTotal: '', tempC: '', painScore: '',
    },
    injuryTemplate: { bodyPart: '', typeOfInjury: '', description: '' },
    interventionTemplate: { type: '', timestamp: '', details: '' },
    medicationTemplate: { name: '', dose: '', unit: '', route: '', timestamp: '' },

    // --- ПОЧАТКОВА СТРУКТУРА ДАНИХ ДЛЯ ФОРМИ ДОГОСПІТАЛЬНОГО ЕТАПУ ---
    initialPreHospitalFormData: {
        internalCardId: `PH-${Date.now().toString(36).toUpperCase()}`, // Внутрішній ID картки, не пацієнта
        incidentDateTime: '',
        reasonForCall: '',
        
        // Дані пацієнта (мінімум для ДЕ)
        patientInfo: {
            isUnknown: false,
            tempPatientId: '', // Якщо невідомий, або для зв'язку
            lastName: '',
            firstName: '',
            middleName: '', // По-батькові (опціонально)
            dateOfBirth: '', // YYYY-MM-DD (якщо відомо)
            ageYears: '', // Орієнтовний вік (якщо ДН невідома)
            gender: '', // З constants.genders
            contactPhone: '', // Телефон пацієнта або контактної особи
            addressRough: '', // Орієнтовна адреса або звідки (якщо не місце інциденту)
            allergiesShort: '', // Коротко про відомі критичні алергії
            medicationsShort: '', // Коротко про важливі прийомні ліки
            medicalHistoryShort: '', // Коротко про значущі захворювання (діабет, серцеві тощо)
        },

        teamArrivalTimeScene: '',
        patientContactTime: '',
        complaints: '', // Скарги зі слів пацієнта/свідків (перенесено сюди для логіки)

        triageCategory: '',
        triageTimestamp: '',

        marchSurvey: {
            massiveHemorrhageControl: '', airwayManagement: '', breathingAssessment: '',
            circulationAssessment: '', hypothermiaPreventionHeadInjury: '',
        },
        vitalSignsLog: [],
        suspectedInjuries: [],
        interventionsPerformed: [],
        medicationsAdministered: [],
        transportation: {
            destinationFacilityName: '', transportMode: '',
            departureTimeFromScene: '', patientConditionDuringTransport: '',
        },
        outcomePreHospital: '',
        notes: '',
    }
};

export default constants;