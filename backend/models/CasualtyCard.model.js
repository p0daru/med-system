// models/CasualtyCard.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Sub-Schemas for Nested Data ---

// Схема для одного запису про турнікет на кінцівці
const tourniquetLimbSchema = new Schema({
    time: { type: String, trim: true, default: '' }, // ГГ:ХХ
    type: { type: String, trim: true, default: '' }  // CAT, SOFTT-W, SICH, Інше (значення) etc.
}, { _id: false });

// Схема для одного запису життєвих показників
const vitalSignEntrySchema = new Schema({
    time: { type: String, trim: true, required: true }, // ГГ:ХХ - обов'язковий
    pulse: { type: String, trim: true, default: '' },
    bp: { type: String, trim: true, default: '' },      // Systolic/Diastolic
    rr: { type: String, trim: true, default: '' },       // Respiratory Rate
    spO2: { type: String, trim: true, default: '' },     // SaO2 %
    avpu: { type: String, enum: ['A', 'V', 'P', 'U', '', null], default: null }, // Додано ''
    pain: { type: String, trim: true, default: '' }      // 0-10
}, { _id: false });

// Схема для одного запису про введену рідину/кров
const fluidEntrySchema = new Schema({
    time: { type: String, trim: true, default: '' },
    name: { type: String, trim: true, default: '' },   // Включаючи значення "Інше..."
    volume: { type: String, trim: true, default: '' }, // Об'єм (мл)
    route: { type: String, trim: true, default: '' }   // Шлях введення
}, { _id: false });

// Схема для одного запису про введені ліки
const medicationEntrySchema = new Schema({
    time: { type: String, trim: true, default: '' },
    name: { type: String, trim: true, default: '' },   // Включаючи значення "Інше..."
    dosage: { type: String, trim: true, default: '' }, // Доза (з одницями)
    route: { type: String, trim: true, default: '' }   // Шлях введення
}, { _id: false });


// --- Основна Схема Картки Пораненого ---
const casualtyCardSchema = new Schema({
    // Розділ 1: Дані Постраждалого
    individualNumber: { // Часто генерується сервером або має бути унікальним
        type: String,
        trim: true,
        index: true,
        // unique: true, // Розкоментуйте, якщо номер має бути строго унікальним
        // sparse: true // Дозволяє null/відсутнім значенням не порушувати unique constraint
    },
    patientFullName: { type: String, trim: true, default: '' },
    last4SSN: { type: String, trim: true, default: '' }, // Валідація на фронтенді
    gender: { type: String, enum: ['Ч', 'Ж', '', null], default: null },
    injuryDateTime: { type: Date }, // Об'єднана Дата + Час поранення
    branchOfService: { type: String, trim: true, default: '' }, // Включаючи значення "Інше"
    unit: { type: String, trim: true, default: '' },
    allergies: { // Структура для алергій
        nka: { type: Boolean, default: false },
        known: { // Об'єкт з відомими алергіями (ключ: назва, значення: true)
            type: Map,
            of: Boolean, // Значення завжди буде true, якщо ключ існує
            default: {}
        },
        other: { type: String, trim: true, default: '' } // Поле для деталей або інших алергій
    },
    evacuationPriority: {
        type: String,
        // required: [true, 'Пріоритет евакуації обов\'язковий'], // Якщо потрібно
        enum: ['Невідкладна', 'Пріоритетна', 'Звичайна', '', null], // Додано ''
        default: 'Пріоритетна'
    },

    // Розділ 2: Інформація про Поранення
    mechanismOfInjury: { type: [String], default: [] }, // Масив рядків
    mechanismOfInjuryOther: { type: String, trim: true, default: '' },
    injuryDescription: { type: String, trim: true, default: '' },

    // Розділ 3: Турнікети
    tourniquets: { // Об'єкт з ключами за кінцівками
        rightArm: { type: tourniquetLimbSchema, default: () => ({}) }, // Важливо мати дефолт
        leftArm:  { type: tourniquetLimbSchema, default: () => ({}) },
        rightLeg: { type: tourniquetLimbSchema, default: () => ({}) },
        leftLeg:  { type: tourniquetLimbSchema, default: () => ({}) }
    },

    // Розділ 4: Життєві показники (масив записів)
    vitalSigns: {
        type: [vitalSignEntrySchema],
        default: []
    },

    // Розділ 5: Надана Допомога (MARCH)
    aidCirculation: { // C - Circulation Checkboxes
        tourniquetJunctional: { type: Boolean, default: false },
        tourniquetTruncal:    { type: Boolean, default: false },
        dressingHemostatic:   { type: Boolean, default: false },
        dressingPressure:     { type: Boolean, default: false },
        dressingOther:        { type: Boolean, default: false }
    },
    aidAirway: { // A - Airway Checkboxes
        // intact: { type: Boolean, default: false }, // Часто не зберігається, якщо інші позначені
        npa:          { type: Boolean, default: false },
        cric:         { type: Boolean, default: false },
        etTube:       { type: Boolean, default: false },
        supraglottic: { type: Boolean, default: false }
    },
    aidBreathing: { // B - Breathing Checkboxes
        o2:                  { type: Boolean, default: false },
        needleDecompression: { type: Boolean, default: false },
        chestTube:           { type: Boolean, default: false },
        occlusiveDressing:   { type: Boolean, default: false }
    },
    fluidsGiven: { // C - Fluids/Blood (масив записів)
        type: [fluidEntrySchema],
        default: []
    },

    // Розділ 6: Ліки та Інша Допомога (H+E)
    medicationsGiven: { // Ліки (масив записів)
        type: [medicationEntrySchema],
        default: []
    },
    aidHypothermiaOther: { // H+E - Hypothermia/Other Checkboxes + Type
        combatPillPack:         { type: Boolean, default: false },
        eyeShieldRight:         { type: Boolean, default: false },
        eyeShieldLeft:          { type: Boolean, default: false },
        splinting:              { type: Boolean, default: false },
        hypothermiaPrevention:  { type: Boolean, default: false },
        hypothermiaPreventionType: { type: String, trim: true, default: '' } // Включаючи значення "Інше"
    },

    // Розділ 7: Нотатки
    notes: { type: String, trim: true, default: '' },

    // Розділ 8: Дані Медика / Особи, яка надала допомогу
    providerFullName: { type: String, trim: true, default: '' },
    providerLast4SSN: { type: String, trim: true, default: '' }, // Валідація на фронтенді

    // Системні поля
    recordedBy: { type: String, trim: true, default: '' } // Може бути ID користувача або ім'я

}, {
    timestamps: true, // Додає createdAt та updatedAt автоматично
    minimize: false // Важливо: зберігати порожні об'єкти (напр., tourniquets), якщо вони мають default
});

// Створення індексу для пошуку за ПІБ (text index для гнучкого пошуку)
casualtyCardSchema.index({ patientFullName: 'text', individualNumber: 'text', last4SSN: 'text' });

const CasualtyCard = mongoose.model('CasualtyCard', casualtyCardSchema);

module.exports = CasualtyCard;