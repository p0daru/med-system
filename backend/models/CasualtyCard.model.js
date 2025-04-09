// models/CasualtyCard.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientDataSchema = require('./PatientData.schema.js');
const priorAidSchema = require('./PriorAid.schema.js');

// // --- Main Casualty Card Schema ---
const casualtyCardSchema = new Schema(
  {
    // Включаємо patientDataSchema як вкладений об'єкт
    patientData: {
        type: patientDataSchema,
        // required: true 
    },

    priorAid: {
      type: priorAidSchema,
      // required: true 
    },
    // --- Інші секції картки  ---

    // --- Метадані картки ---
    // Хто створив, статус картки тощо
    status: {
        type: String,
        enum: ['active', 'closed', 'archived'],
        default: 'active'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Посилається на модель користувача (якщо вона є)
        // required: true // Зазвичай потрібно знати, хто створив запис
    },
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
  },
  {
    // Додає поля createdAt та updatedAt автоматично до основної картки
    timestamps: true,
  }
);

// --- Віртуальні поля для зручності роботи з датою/часом на фронтенді ---
// НЕ зберігаються в базі даних, а обчислюються при отриманні документа
// Для eventDateTime
casualtyCardSchema.virtual('patientData.eventDate').get(function() {
  // Перевіряємо наявність patientData та eventDateTime
  if (!this.patientData || !this.patientData.eventDateTime) return '';
  // Повертаємо дату у форматі YYYY-MM-DD
  return this.patientData.eventDateTime.toISOString().split('T')[0];
});
casualtyCardSchema.virtual('patientData.eventTime').get(function() {
  if (!this.patientData || !this.patientData.eventDateTime) return '';
  // Повертаємо час у форматі HH:MM (за UTC, якщо час зберігався в UTC)
  // Якщо час зберігався з урахуванням таймзони, можливо, знадобиться інша логіка
  const hours = this.patientData.eventDateTime.getUTCHours().toString().padStart(2, '0');
  const minutes = this.patientData.eventDateTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
});

// Для arrivalDateTime
casualtyCardSchema.virtual('patientData.arrivalDate').get(function() {
  if (!this.patientData || !this.patientData.arrivalDateTime) return '';
  return this.patientData.arrivalDateTime.toISOString().split('T')[0];
});
casualtyCardSchema.virtual('patientData.arrivalTime').get(function() {
  if (!this.patientData || !this.patientData.arrivalDateTime) return '';
  const hours = this.patientData.arrivalDateTime.getUTCHours().toString().padStart(2, '0');
  const minutes = this.patientData.arrivalDateTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
});

// Вказуємо Mongoose включати віртуальні поля при перетворенні документа на JSON або об'єкт
casualtyCardSchema.set('toJSON', { virtuals: true });
casualtyCardSchema.set('toObject', { virtuals: true });

// Створення та експорт моделі
const CasualtyCard = mongoose.model('CasualtyCard', casualtyCardSchema);

module.exports = CasualtyCard;