// src/components/CasualtyCard/validationSchema.js
import * as yup from 'yup';
// Імпортуємо трансформер з хелперів
import { transformEmptyStringToUndefined, generateAllergyKey, transformEmptyStringToNull } from '../../utils/helpers'; // Перевірте правильність шляху
import { COMMON_ALLERGENS } from '../../constants/constants.json';

///// ==== VitalSignsSection ==== /////
export const vitalSignSchema = yup.object().shape({
    id: yup.string().required("ID є обов'язковим полем"),
    time: yup.mixed().nullable(),
    avpu: yup.mixed().nullable(),
    pain: yup.mixed().nullable(),
    pulse: yup.number()
              // Використовуємо імпортований трансформер
              .transform(transformEmptyStringToUndefined)
              .nullable()
              .typeError('Пульс: має бути числом')
              .positive('Пульс має бути > 0')
              .integer('Пульс має бути цілим числом')
              .max(400, 'Пульс: надто високе значення (< 400)'),
    bp: yup.string()
           .nullable()
           .transform((value) => (typeof value === 'string' ? value.trim() : value)) // Trim залишаємо тут специфічно для BP перед matches
           .matches(/^$|^\d{1,3}\/\d{1,3}$/, 'АТ: невірний формат (ЧЧЧ/ЧЧЧ або порожньо)')
           .test(
             'bp-range',
             'АТ: значення поза межами норми',
             (value) => {
               if (!value) return true;
               const parts = value.split('/');
               if (parts.length !== 2) return true;
               const systolic = parseInt(parts[0], 10);
               const diastolic = parseInt(parts[1], 10);
               return !isNaN(systolic) && !isNaN(diastolic) && systolic > 0 && diastolic > 0 && systolic < 350 && diastolic < 250;
             }
           ),
    rr: yup.number()
            // Використовуємо імпортований трансформер
           .transform(transformEmptyStringToUndefined)
           .nullable()
           .typeError('ЧД: має бути числом')
           .positive('ЧД має бути > 0')
           .integer('ЧД має бути цілим числом')
           .max(100, 'ЧД: надто високе значення (< 100)'),
    spO2: yup.number()
            // Використовуємо імпортований трансформер
            .transform(transformEmptyStringToUndefined)
            .nullable()
            .typeError('SpO2: має бути числом')
            .min(0, 'SpO2 не може бути < 0')
            .max(100, 'SpO2 не може бути > 100')
            .integer('SpO2 має бути цілим числом'),
});


///// ==== ProvidedAidSection ==== /////
export const fluidRowSchema = yup.object().shape({
    id: yup.string().required(), // ID потрібен для useFieldArray
    time: yup.string()
             .required("Час введення рідини є обов'язковим")
             .matches(/^[0-2]\d:[0-5]\d$/, 'Невірний формат часу (ГГ:ХХ)'),
    name: yup.string()
             .required("Назва рідини/крові є обов'язковою"),
    // Поле "Інша назва" стає обов'язковим, тільки якщо в полі "Назва" вибрано "Інше..."
    nameOther: yup.string()
                   .when('name', {
                       is: (name) => name === 'Інше...',
                       then: (schema) => schema.required("Вкажіть іншу назву рідини/крові").trim(),
                       otherwise: (schema) => schema.nullable(), // Не обов'язкове в інших випадках
                   }),
    volume: yup.number()
               .transform(transformEmptyStringToUndefined) // Дозволяє порожній рядок
               .nullable() // Робимо необов'язковим, але якщо введено, то валідуємо
               .typeError('Об\'єм має бути числом')
               .positive('Об\'єм має бути > 0')
               .integer('Об\'єм має бути цілим числом')
               .max(5000, 'Об\'єм: надто велике значення (< 5000 мл)'), // Прикладне обмеження
    route: yup.string()
              .required("Шлях введення є обов'язковим"),
});


export const providedAidSchema = yup.object({
    // Розділи MARCH є об'єктами з булевими значеннями,
    // вони не обов'язкові для заповнення, тому не додаємо .required()
    aidCirculation: yup.object({
        tourniquetJunctional: yup.boolean(),
        tourniquetTruncal: yup.boolean(),
        dressingHemostatic: yup.boolean(),
        dressingPressure: yup.boolean(),
        dressingOther: yup.boolean(),
    }).default(undefined), // default(undefined) щоб не створювався порожній об'єкт, якщо дані не прийшли
    aidAirway: yup.object({
        npa: yup.boolean(),
        supraglottic: yup.boolean(),
        etTube: yup.boolean(),
        cric: yup.boolean(),
    }).default(undefined),
    aidBreathing: yup.object({
        o2: yup.boolean(),
        needleDecompression: yup.boolean(),
        chestTube: yup.boolean(),
        occlusiveDressing: yup.boolean(),
    }).default(undefined),

    // Масив введених рідин
    fluidsGiven: yup.array()
                     .of(fluidRowSchema) // Кожен елемент валідується за схемою fluidRowSchema
                     .nullable(), // Дозволяємо порожній масив або null
});


// ==== PATIENT_AID_SECTION
const knownAllergiesSchema = yup.object(
    COMMON_ALLERGENS
        .filter(a => a && a !== 'Інше...')
        .reduce((acc, allergen) => {
            const key = generateAllergyKey(allergen);
            if (key) acc[key] = yup.boolean().default(false);
            return acc;
        }, {})
).default({});

export const allergiesSchema = yup.object({
    nka: yup.boolean().default(false),
    known: knownAllergiesSchema,
    other: yup.string().trim().ensure().default(''),
    // Допоміжне поле для помилки тесту
    _selection: yup.mixed().optional()
})
.default({})
.test(
    'allergy-selection-required',
    'Будь ласка, позначте "Немає відомих алергій" або вкажіть хоча б одну алергію.',
    (value, context) => {
        if (!value) return false; // Малоймовірно через default
        const { nka, known, other } = value;
        if (nka) return true;
        const isAnyKnownSelected = known ? Object.values(known).some(isSelected => !!isSelected) : false;
        const isOtherFilled = other && other.length > 0;
        if (isAnyKnownSelected || isOtherFilled) return true;

        // Повертаємо помилку, прив'язану до _selection
        return context.createError({
            path: `${context.path}._selection`, // <<<--- Важливо!
            message: context.originalError?.message || 'Будь ласка, позначте "Немає відомих алергій" або вкажіть хоча б одну алергію.',
        });
    }
);

// --- Schema for Patient Data Section (ЗАЛИШАЄТЬСЯ ТАКОЮ Ж) ---
export const patientDataSchema = yup.object({
    // ... інші поля patientDataSchema ...
    patientFullName: yup.string().required("ПІБ є обов'язковим").trim(),
    last4SSN: yup.string()
                 .matches(/^$|^[0-9]{4}$/, 'Має бути 4 цифри або порожньо')
                 .nullable()
                 .transform((value, originalValue) => String(originalValue).trim() === '' ? null : value),
    gender: yup.string().oneOf(['Ч', 'Ж', '', null], 'Невірне значення статі').nullable(),
    branchOfService: yup.string().nullable(),
    branchOfServiceOther: yup.string()
                             .when('branchOfService', {
                                 is: 'Інше',
                                 then: (schema) => schema.required("Вкажіть інший рід військ").trim(),
                                 otherwise: (schema) => schema.nullable(),
                             }),
    unit: yup.string().trim().nullable(),
    injuryDate: yup.string()
                    .required("Дата поранення є обов'язковою")
                    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Невірний формат дати'),
    injuryTime: yup.string()
                    .required("Час поранення є обов'язковим")
                    .matches(/^[0-2]\d:[0-5]\d$/, 'Невірний формат часу (ГГ:ХХ)'),
    evacuationPriority: yup.string().nullable(),
    // Включаємо оновлену підсхему алергій
    allergies: allergiesSchema,
});


//// MECHANISM_SECTION
export const injuryMechanismSchema = yup.object({
    mechanismOfInjury: yup.array()
                         .of(yup.string())
                         .min(1, 'Оберіть хоча б один механізм поранення') // Вимагаємо хоча б один вибір
                         .required(), // Масив сам по собі обов'язковий
    mechanismOfInjuryOther: yup.string()
                             .when('mechanismOfInjury', { // Обов'язкове, якщо вибрано "Інше"
                                 is: (mechanisms) => Array.isArray(mechanisms) && mechanisms.includes('Інше'),
                                 then: (schema) => schema.required('Будь ласка, уточніть інший механізм').trim(),
                                 // В іншому випадку - не обов'язкове і його значення видаляється, якщо воно є
                                 otherwise: (schema) => schema.nullable().strip(true),
                             }),
    // Поле опису робимо необов'язковим
    injuryDescription: yup.string().nullable(),
});


export const combinedCasualtyCardSchema = yup.object({
    patientFullName: yup.string().required('ПІБ є обов\'язковим').min(5, 'Мінімум 5 символів'),
    evacuationPriority: yup.string()
                          .required('Будь ласка, оберіть пріоритет')
                          .notOneOf(['Оберіть...', ''], 'Необхідно обрати конкретний пріоритет'), // Якщо використовуєте такий плейсхолдер
    // ... інші поля ...
    allergies: allergiesSchema, 
}).required(); 