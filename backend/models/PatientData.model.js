const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Schema for Section 1: Patient Data ---
export default patientDataSchema = new Schema({
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

