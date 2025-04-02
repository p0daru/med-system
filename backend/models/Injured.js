// backend/models/Injured.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VitalSignsSchema = new Schema({
    timestamp: { type: Date, default: Date.now }, // Час вимірювання
    pulse: { type: String, trim: true },          // Пульс (залишаємо String для гнучкості - "90", "ниткоподібний")
    bp: { type: String, trim: true },             // Blood Pressure (Тиск, напр. "120/80", "не визначається")
    respiration: { type: String, trim: true },    // Дихання (частота, характер - залишаємо String)
    spo2: { type: Number },                       // Сатурація кисню (%)
    temperature: { type: Number },                // Температура
    consciousness: {                              // Рівень свідомості (напр. AVPU)
        type: String,
        enum: ['Alert', 'Voice', 'Pain', 'Unresponsive', 'Unknown'],
        default: 'Unknown'
    }
}, { _id: false }); // Не створюємо окремий ID для піддокументів у масивах

const InjurySchema = new Schema({
    type: {                                       // Тип поранення
        type: String,
        enum: ['Gunshot', 'Shrapnel', 'Blast', 'Burn', 'Crush', 'Fall', 'Medical', 'Other', 'Unknown'],
        default: 'Unknown'
    },
    // Зробимо location НЕ обов'язковим на рівні схеми,
    // оскільки форма додає об'єкт, якщо хоча б одне поле заповнене.
    // Валідацію на наявність хоча б чогось можна робити на рівні сервісу/контролера, якщо потрібно.
    location: { type: String, trim: true },       // Локалізація (напр. "Ліве передпліччя")
    severity: {                                   // Тяжкість
        type: String,
        enum: ['Minor', 'Moderate', 'Serious', 'Critical', 'Expectant', 'Unknown'],
        default: 'Unknown'
    },
    notes: { type: String, trim: true }           // Деталі поранення
}, { _id: false });

const TreatmentSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    // Зробимо action НЕ обов'язковим на рівні схеми,
    // аналогічно до InjurySchema.location
    action: { type: String, trim: true },         // Напр. "Накладено турнікет", "Знеболення (Промедол 1мл)"
    provider: { type: String, trim: true }        // Хто надав допомогу (позивний, ім'я)
}, { _id: false });

const InjuredSchema = new Schema({
    // --- Ідентифікація ---
    trackingId: {
        type: String,
        unique: true,
        required: true,
        // Генерується автоматично, якщо не надано
        default: () => `INJ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    },
    name: { // Поле 'name' з форми
        type: String,
        required: [true, 'Ім\'я / Позивний є обов\'язковим полем.'], // Додаємо повідомлення про помилку
        trim: true
    },
    callSign: { // Поле 'callSign' з форми
        type: String,
        trim: true
    },
    unit: { // Поле 'unit' з форми
        type: String,
        trim: true
    },
    bloodType: { // Поле 'bloodType' з форми
        type: String,
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'],
        default: 'Unknown'
    },
    allergies: { // Поле 'allergies' з форми
        type: String,
        trim: true,
        default: 'None known' // 'None known' краще ніж пустий рядок за замовчуванням
    },

    // --- Обставини ---
    incidentTimestamp: { // Поле 'incidentTimestamp' з форми
        type: Date,
        default: Date.now
    },
    incidentLocation: { // Поле 'incidentLocation' з форми
        type: String,
        trim: true
    },
    mechanismOfInjury: { // Поле 'mechanismOfInjury' з форми
        type: String,
        trim: true
    },

    // --- Стан та Поранення ---
    medicalStatus: { // Поле 'medicalStatus' з форми
        type: String,
        required: [true, 'Медичний статус є обов\'язковим полем.'],
        enum: ['Stable', 'Serious', 'Critical', 'Treated', 'Evacuated', 'Deceased (KIA)', 'Missing (MIA)', 'Unknown'],
        default: 'Unknown'
    },
    // Масив поранень. Форма зараз додає/редагує лише ОДИН запис сюди.
    injuries: [InjurySchema],
    initialAssessmentNotes: { // Поле 'initialAssessmentNotes' з форми
        type: String,
        trim: true
    },
    // Історія вітальних показників. Форма зараз додає/редагує лише ОДИН запис сюди.
    vitalSignsHistory: [VitalSignsSchema],

    // --- Надана допомога ---
    // Масив наданих втручань. Форма зараз додає/редагує лише ОДИН запис сюди.
    treatments: [TreatmentSchema],

    // --- Евакуація ---
    evacuationStatus: { // Поле 'evacuationStatus' з форми
        type: String,
        enum: ['Not Required', 'Requested', 'In Progress', 'Completed', 'Delayed', 'Unknown'],
        default: 'Unknown'
    },
    evacuationPriority: { // Поле 'evacuationPriority' з форми
        type: String,
        enum: ['T1-Urgent', 'T2-Priority', 'T3-Routine', 'T4-Expectant/Deceased', 'Unknown'],
        default: 'Unknown'
    },
    evacuationDestination: { // Поле 'evacuationDestination' з форми
        type: String,
        trim: true
    },

    // --- Метадані ---
    recordEnteredBy: { // Поле 'recordEnteredBy' з форми
        type: String,
        trim: true
    },
    entryTimestamp: {
        type: Date,
        default: Date.now,
        immutable: true // Не можна змінити після створення
    },
    lastUpdatedTimestamp: {
        type: Date,
        default: Date.now
    },
    notes: { // Поле 'notes' з форми
        type: String,
        trim: true
    }
}, {
    timestamps: { createdAt: 'entryTimestamp', updatedAt: 'lastUpdatedTimestamp' } // Можна використовувати вбудовані timestamps
});

/*
// Middleware тепер можна замінити на опцію timestamps:
InjuredSchema.pre('save', function(next) {
    // this.lastUpdatedTimestamp = Date.now(); // Вже обробляється timestamps: true
    // Якщо trackingId не встановлено явно, він згенерується default функцією
    next();
});

InjuredSchema.pre('findOneAndUpdate', function(next) {
    // this.set({ lastUpdatedTimestamp: Date.now() }); // Вже обробляється timestamps: true
    next();
});
*/


module.exports = mongoose.model('Injured', InjuredSchema);