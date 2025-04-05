// models/CasualtyCard.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// import patientDataSchema from "./PatientDataSchema.model"

// --- Schema for Section 1: Patient Data ---
const patientDataSchema = new Schema({
  // --- 1.1 Ідентифікація та основні дані ---
  isUnknown: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    // enum: ['Ж', 'ч', null],
    default: null,
  },
  category: {
    type: String,
    // required: [true, "Категорія є обов'язковою"],
    // enum: ['Цивільний', 'Військовослужбовець', 'Полонений'],
  },
  lastName: {
    type: String,
    trim: true,
    // Необов'язкове, якщо isUnknown=true
    // required: function() { return !this.isUnknown; } // Валідацію краще робити на рівні API або додатка
  },
  firstName: {
    type: String,
    trim: true,
    // required: function() { return !this.isUnknown; }
  },
  patronymic: {
    type: String,
    trim: true,
  },
  militaryId: {
    type: String,
    trim: true,
    // required: function() { return !this.isUnknown && this.category === 'military'; }
  },
  dob: { // Date of birth
    type: Date,
    // required: function() { return !this.isUnknown; }
  },

  // --- 1.2 Додаткова інформація ---
  militaryRank: {
    type: String,
    trim: true,
    // required: function() { return this.category === 'military'; }
  },
  militaryUnit: {
    type: String,
    trim: true,
    // required: function() { return this.category === 'military'; }
  },
  allergyPresence: {
    type: String,
    // required: [true, "Інформація про алергію є обов'язковою"],
    // enum: ['Ні', 'Невідомо', 'Так'],
  },
  allergyDetails: {
    type: String,
    trim: true,
    // Потрібно лише якщо allergyPresence = 'yes'
    required: function() { return this.allergyPresence === 'yes'; }
  },

  // --- 1.3 Обставини та прибуття ---
  // Зберігаємо дату і час разом
  eventDateTime: {
      type: Date, // Буде зберігати і дату, і час події
      default: null,
  },
  arrivalDateTime: {
      type: Date, // Буде зберігати і дату, і час прибуття
    //   required: [true, "Дата та час прибуття є обов'язковими"]
  },
  transportType: {
    type: String,
    // enum: ['Casevac', 'MMPM', 'Medevac', 'other', null],
    default: null,
  },
  arrivalSource: {
    type: String,
    // required: [true, "Джерело прибуття є обов'язковим"],
    // enum: ['event_location', 'collection_point', 'role_1', 'role_2', 'role_3', 'role_4'],
  },
  // Поля, що залежать від arrivalSource (якщо це медичний підрозділ)
  arrivedFromMedicalRole: {
    type: String,
    // enum: ['Роль 1', 'Роль 2', 'Роль 3', 'Роль 4', null],
    default: null,
    // Потрібно лише якщо arrivalSource є однією з ролей
    // required: function() {
    //   return ['Роль 1', 'Роль 2', 'Роль 3', 'Роль 4'].includes(this.arrivalSource);
    // }
  },
  arrivedFromMedicalUnitName: {
    type: String,
    trim: true,
    // Потрібно лише якщо arrivalSource є однією з ролей
    // required: function() {
    //   return ['Роль 1', 'Роль 2', 'Роль 3', 'Роль 4'].includes(this.arrivalSource);
    // }
  },

  // --- 1.4 Медичне сортування ---
  triageCategory: {
    type: String,
    // required: [true, "Сортувальна категорія є обов'язковою"],
    // enum: ['t1_immediate', 't2_delayed', 't3_minimal', 't4_expectant', 'deceased'],
    // TODO: Перевірити відповідність enum стандартам START/jumpSTART
  },
}, { _id: false }); // _id: false - не створювати окремий ID для цього піддокумента


// // --- Main Casualty Card Schema ---
const casualtyCardSchema = new Schema(
  {
    // Включаємо patientDataSchema як вкладений об'єкт
    patientData: {
        type: patientDataSchema,
        required: true // Секція 1 є обов'язковою для картки
    },

    // --- Інші секції картки  ---

    // --- Метадані картки ---
    // Хто створив, статус картки тощо
    status: {
        type: String,
        // enum: ['active', 'closed', 'archived'],
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