const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  fullName: {
    type: String,
    trim: true,
    // Не обов'язкове, якщо isUnknown=true (фронтенд це контролює)
  },
  dob: { // Date of birth
    type: String, // Змінено на String для прямої відповідності input type="date" (YYYY-MM-DD)
    // Не обов'язкове, якщо isUnknown=true
  },
  militaryId: {
    type: String,
    trim: true,
    // required: function() { return !this.isUnknown && this.category === 'military'; }
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
    // required: function() { return this.allergyPresence === 'yes'; }
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
    default: null,
  },
  transportType: {
    type: String,
    // enum: ['Casevac', 'MMPM', 'Medevac', 'other', null],
    default: null,
  },
  // --- Нова структура для місця прибуття ---
  originType: {
    type: String,
    // required: [true, "Тип джерела прибуття є обов'язковим"],
    // enum: ['location', 'medical_unit'], // Відповідає RadioGroup на фронтенді
},
arrivalLocationName: { // Назва місця події / пункту збору
    type: String,
    trim: true,
    // Це поле заповнюється лише якщо originType === 'location' (контроль на фронтенді)
},
medicalUnitName: { // Назва мед. підрозділу
    type: String,
    trim: true,
    // Це поле заповнюється лише якщо originType === 'medical_unit' (контроль на фронтенді)
},
medicalRole: { // Роль мед. підрозділу
    type: String,
    // enum: ['Роль 1', 'Роль 2', 'Роль 3', 'Роль 4', '', null], // Синхронізувати з constants.medicalRoles
    // Це поле заповнюється лише якщо originType === 'medical_unit' (контроль на фронтенді)
},

  // --- 1.4 Медичне сортування ---
  triageCategory: {
    type: String,
    // required: [true, "Сортувальна категорія є обов'язковою"],
    // enum: ['t1_immediate', 't2_delayed', 't3_minimal', 't4_expectant', 'deceased'],
    // TODO: Перевірити відповідність enum стандартам START/jumpSTART
  },
}, { _id: false }); // _id: false - не створювати окремий ID для цього піддокумента

// Експортуємо саму схему
module.exports = patientDataSchema;