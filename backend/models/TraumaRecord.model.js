// backend/models/TraumaRecord.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- Вкладені схеми для PreHospital ---

// Інформація про пацієнта (узгоджено з INITIAL_PRE_HOSPITAL_FORM_DATA)
const PatientInfoSchemaPreHospital = new Schema({
    patientFullName: { type: String }, // Може бути "Невідомо..."
    patientGender: { type: String, enum: ['male', 'female', 'other', 'unknown', ''] },
    patientDateOfBirth: { type: Date }, // Фронтенд надсилає 'YYYY-MM-DD' або порожній рядок
    patientApproximateAge: { type: String }, // Зберігаємо як рядок (напр. "25", "близько 40")
}, { _id: false });

// Введені медикаменти (узгоджено з INITIAL_PRE_HOSPITAL_FORM_DATA)
const MedicationAdministeredSchema = new Schema({
    name: { type: String }, // Може бути кастомним значенням
    dosage: { type: String },
    route: { type: String }, // Може бути кастомним значенням
    time: { type: String }, // HH:mm
    effectiveness: { type: String, enum: ['effective', 'partially_effective', 'not_effective', 'not_assessed', ''] },
}, { _id: false });

// Виконані процедури (узгоджено з INITIAL_PRE_HOSPITAL_FORM_DATA)
const ProcedurePerformedSchema = new Schema({
    name: { type: String }, // Може бути кастомним значенням
    time: { type: String }, // HH:mm
    details: { type: String },
    effectiveness: { type: String, enum: ['effective', 'partially_effective', 'not_effective', 'not_assessed', ''] },
}, { _id: false });


// --- Основна схема TraumaRecord ---
// Ця схема тепер буде більш плоскою, відображаючи структуру formData з фронтенду
const TraumaRecordSchema = new Schema({
    // Ідентифікація
    cardId: { type: String, unique: true, required: true, index: true }, // Раніше internalCardId, тепер cardId з фронтенду

    // 1. Загальна інформація, пацієнт, місце події
    incidentDateTime: { type: Date, required: true },
    arrivalDateTime: { type: Date, required: true },
    sceneTypeValue: { type: String }, // Значення з Select або кастомне значення
    // sceneTypeOther: { type: String }, // Це поле більше не потрібне, якщо фронт надсилає фінальне в sceneTypeValue
    patientInfo: PatientInfoSchemaPreHospital, // Використовуємо оновлену схему
    
    catastrophicHemorrhageControlled: { type: Boolean, default: false },
    catastrophicHemorrhageDetails: { type: String },

    // 2. Оцінка стану (ABCDE)
    // A
    airwayStatus: { type: String },
    // B
    breathingRate: { type: String }, // Може бути діапазоном або кастомним числом
    breathingSaturation: { type: String }, // Може бути діапазоном або кастомним числом
    breathingQuality: { type: String },
    chestExcursion: { type: String },
    auscultationLungs: { type: String },
    // C
    pulseLocation: { type: String },
    pulseRate: { type: String }, // Може бути діапазоном або кастомним числом
    pulseQuality: { type: String },
    bloodPressureSystolic: { type: String },
    bloodPressureDiastolic: { type: String },
    capillaryRefillTime: { type: String },
    skinStatus: { type: String },
    externalBleeding: { type: String },
    // D
    consciousnessLevel: { type: String }, // З INITIAL_PRE_HOSPITAL_FORM_DATA, якщо використовується (AVPU)
    glasgowComaScaleEye: { type: String },
    glasgowComaScaleVerbal: { type: String },
    glasgowComaScaleMotor: { type: String },
    gcsTotal: { type: String }, // Розраховується на фронтенді
    pupilReaction: { type: String },
    motorSensoryStatus: { type: String },
    neurologicalStatusDetails: { type: String },
    // E
    bodyTemperature: { type: String }, // Може бути діапазоном або кастомним числом
    exposureDetails: { type: String },

    // 3. Скарги, Анамнез (SAMPLE), Обставини
    complaints: { type: String },
    allergies: { type: String },
    medicationsTaken: { type: String },
    pastMedicalHistory: { type: String },
    lastOralIntakeMeal: { type: String },
    lastOralIntakeTime: { type: String }, // HH:mm
    eventsLeadingToInjury: { type: String },
    mechanismOfInjuryDetailed: { type: String },

    // 4. Надана допомога
    medicationsAdministered: [MedicationAdministeredSchema],
    proceduresPerformed: [ProcedurePerformedSchema],
    ivAccessDetails: { type: String },

    // 5. Транспортування
    transportationMethod: { type: String },
    transportationOtherDetails: { type: String }, // Для кастомного способу транспортування
    // transportationPosition - ПРИБРАНО
    destinationFacility: { type: String },
    // departureTimeFromScene, arrivalTimeAtFacility, handoverToWhom - ПРИБРАНО

    // 6. Тріаж та додаткова інформація
    triageCategory: { type: String }, // Не required, бо може бути не застосовано
    rtsScore: { type: String }, // Розраховується на фронтенді
    additionalNotes: { type: String },
    // medicalTeamMembers - ПРИБРАНО
    medicalTeamResponsible: { type: String, required: true }, // Залишено як обов'язкове
    
    // Статус картки (може бути корисно для подальшої логіки)
    status: { 
        type: String, 
        default: 'PreHospitalActive', 
        enum: ['PreHospitalActive', 'PreHospitalFinalized', 'HospitalCareActive', 'HospitalCareFinalized', 'Closed', 'Archived'] 
    },
    // Поля для госпітального етапу (залишаємо для майбутнього)
    hospitalCareData: { // Перейменовано з hospitalCare для ясності
        type: Schema.Types.Mixed,
        default: {},
    },

}, { timestamps: true }); // Автоматично додає createdAt, updatedAt

// Хук для конвертації дат перед збереженням
TraumaRecordSchema.pre('save', function(next) {
    const fieldsToConvert = [
        'incidentDateTime', 
        'arrivalDateTime',
        // 'patientInfo.patientDateOfBirth', // Обробляється окремо, бо формат YYYY-MM-DD
        // Дати транспортування прибрані, але якщо повернуться, додати сюди
    ];

    fieldsToConvert.forEach(path => {
        let value = this[path];
        if (value && typeof value === 'string') {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) { // Перевірка на валідність дати
                this[path] = dateValue;
            } else {
                console.warn(`Could not convert string "${value}" to Date for path "${path}". Leaving as is or setting to null.`);
                this[path] = null; // Або залишити як є, або обробити помилку
            }
        } else if (value === '') {
            this[path] = null;
        }
    });

    // Окрема обробка для patientInfo.patientDateOfBirth, якщо воно існує
    if (this.patientInfo && this.patientInfo.patientDateOfBirth) {
        if (typeof this.patientInfo.patientDateOfBirth === 'string') {
            const dobStr = this.patientInfo.patientDateOfBirth;
            if (dobStr.match(/^\d{4}-\d{2}-\d{2}$/)) { // Перевірка формату YYYY-MM-DD
                const dateValue = new Date(dobStr);
                const parts = dobStr.split('-');
                this.patientInfo.patientDateOfBirth = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
            } else if (dobStr === '') {
                this.patientInfo.patientDateOfBirth = null;
            } else {
                console.warn(`Invalid date format for patientDateOfBirth: "${dobStr}". Setting to null.`);
                this.patientInfo.patientDateOfBirth = null;
            }
        }
    } else if (this.patientInfo) {
        this.patientInfo.patientDateOfBirth = null; // Якщо поле є, але порожнє
    }


    // Очищення порожніх масивів (якщо фронтенд надсилає масив з одним порожнім об'єктом за замовчуванням)
    if (this.medicationsAdministered && this.medicationsAdministered.length === 1 && !this.medicationsAdministered[0].name) {
        this.medicationsAdministered = [];
    }
    if (this.proceduresPerformed && this.proceduresPerformed.length === 1 && !this.proceduresPerformed[0].name) {
        this.proceduresPerformed = [];
    }

    next();
});

module.exports = mongoose.model('TraumaRecord', TraumaRecordSchema);