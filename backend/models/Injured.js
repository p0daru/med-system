// backend/models/Injured.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VitalSignsSchema = new Schema({
    timestamp: { type: Date, default: Date.now }, // Час вимірювання
    pulse: { type: String, trim: true }, // Пульс (може бути число або "ниткоподібний")
    bp: { type: String, trim: true }, // Blood Pressure (Тиск, напр. "120/80", "не визначається")
    respiration: { type: String, trim: true }, // Дихання (частота, характер)
    spo2: { type: Number }, // Сатурація кисню (%)
    temperature: { type: Number }, // Температура
    consciousness: { // Рівень свідомості (напр. AVPU)
        type: String,
        enum: ['Alert', 'Voice', 'Pain', 'Unresponsive', 'Unknown'],
        default: 'Unknown'
    }
}, { _id: false }); // Не створюємо окремий ID для вітальних показників у цьому простому прикладі

const InjurySchema = new Schema({
    type: { // Тип поранення
        type: String,
        enum: ['Gunshot', 'Shrapnel', 'Blast', 'Burn', 'Crush', 'Fall', 'Medical', 'Other', 'Unknown'],
        default: 'Unknown'
    },
    location: { type: String, trim: true, required: true }, // Локалізація (напр. "Ліве передпліччя", "Грудна клітка")
    severity: { // Тяжкість (можна використовувати TCCC категорії)
        type: String,
        enum: ['Minor', 'Moderate', 'Serious', 'Critical', 'Expectant', 'Unknown'], // Спрощено
        default: 'Unknown'
    },
    notes: { type: String, trim: true } // Деталі поранення
}, { _id: false });

const TreatmentSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true, trim: true }, // Напр. "Накладено турнікет", "Знеболення (Промедол 1мл)"
    provider: { type: String, trim: true } // Хто надав допомогу (позивний, ім'я)
}, { _id: false });

const InjuredSchema = new Schema({
    // --- Ідентифікація ---
    trackingId: { // Унікальний ID для відстеження (можна генерувати)
        type: String,
        unique: true,
        required: true,
        default: () => `INJ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}` // Простий генератор
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    callSign: { // Позивний
        type: String,
        trim: true
    },
    unit: { // Підрозділ
        type: String,
        trim: true
    },
    bloodType: { // Група крові (якщо відома)
        type: String,
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'],
        default: 'Unknown'
    },
    allergies: { // Алергії
        type: String,
        trim: true,
        default: 'None known'
    },

    // --- Обставини ---
    incidentTimestamp: { // Приблизний час події/поранення
        type: Date,
        default: Date.now
    },
    incidentLocation: { // Місце події (координати або опис)
        type: String,
        trim: true
    },
    mechanismOfInjury: { // Механізм травми
        type: String,
        trim: true
    },

    // --- Стан та Поранення ---
    medicalStatus: { // Загальний поточний статус
        type: String,
        required: true,
        enum: ['Stable', 'Serious', 'Critical', 'Treated', 'Evacuated', 'Deceased (KIA)', 'Missing (MIA)', 'Unknown'],
        default: 'Unknown'
    },
    injuries: [InjurySchema], // Масив поранень
    initialAssessmentNotes: { // Первинний огляд (MIST/MARCH)
        type: String,
        trim: true
    },
    vitalSignsHistory: [VitalSignsSchema], // Історія вітальних показників (додаватимемо сюди нові виміри)

    // --- Надана допомога ---
    treatments: [TreatmentSchema], // Масив наданих втручань/ліків

    // --- Евакуація ---
    evacuationStatus: {
        type: String,
        enum: ['Not Required', 'Requested', 'In Progress', 'Completed', 'Delayed', 'Unknown'],
        default: 'Unknown'
    },
    evacuationPriority: { // Пріоритет (Triage Category)
        type: String,
        enum: ['T1-Urgent', 'T2-Priority', 'T3-Routine', 'T4-Expectant/Deceased', 'Unknown'],
        default: 'Unknown'
    },
    evacuationDestination: { // Куди евакуйовано/планується
        type: String,
        trim: true
    },

    // --- Метадані ---
    recordEnteredBy: { // Хто вніс запис
        type: String,
        trim: true
    },
    entryTimestamp: { // Час створення запису в системі
        type: Date,
        default: Date.now
    },
    lastUpdatedTimestamp: { // Час останнього оновлення запису
        type: Date,
        default: Date.now
    },
    notes: { // Загальні примітки
        type: String,
        trim: true
    }
});

// Middleware для автоматичного оновлення lastUpdatedTimestamp перед збереженням
InjuredSchema.pre('save', function(next) {
    this.lastUpdatedTimestamp = Date.now();
    next();
});

// Middleware для оновлення lastUpdatedTimestamp при використанні findByIdAndUpdate
InjuredSchema.pre('findOneAndUpdate', function(next) {
    this.set({ lastUpdatedTimestamp: Date.now() });
    next();
});


module.exports = mongoose.model('Injured', InjuredSchema);