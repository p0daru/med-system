// backend/models/TraumaRecord.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- Вкладені схеми для PreHospital ---

const PatientInfoSchemaPreHospital = new Schema({
    isUnknown: { type: Boolean, default: false },
    tempPatientId: { type: String },
    lastName: { type: String },
    firstName: { type: String },
    middleName: { type: String },
    dateOfBirth: { type: Date }, // Буде зберігатися як дата, якщо передано 'YYYY-MM-DD'
    ageYears: { type: String }, // Зберігаємо як рядок, бо може бути "орієнтовний"
    gender: { type: String, enum: ['Чоловіча', 'Жіноча', 'Невідомо', ''] }, // Додано порожній рядок для можливості "не обрано"
    contactPhone: { type: String },
    addressRough: { type: String },
    allergiesShort: { type: String },
    medicationsShort: { type: String },
    medicalHistoryShort: { type: String },
}, { _id: false });

const MarchSurveySchema = new Schema({
    massiveHemorrhageControl: { type: String },
    airwayManagement: { type: String },
    breathingAssessment: { type: String },
    circulationAssessment: { type: String },
    hypothermiaPreventionHeadInjury: { type: String },
}, { _id: false });

const VitalSignSchemaPreHospital = new Schema({
    timestamp: { type: String }, // Зберігаємо час як HH:mm рядок
    sbp: { type: String }, // Зберігаємо як рядки, щоб дозволити порожні значення
    dbp: { type: String },
    hr: { type: String },
    rr: { type: String },
    spo2: { type: String },
    gcsE: { type: String },
    gcsV: { type: String },
    gcsM: { type: String },
    gcsTotal: { type: String }, // Може бути розрахований на фронті або тут
    tempC: { type: String },
    painScore: { type: String },
}, { _id: false });

const InjurySchemaPreHospital = new Schema({
    bodyPart: { type: String },
    typeOfInjury: { type: String },
    description: { type: String },
}, { _id: false });

const InterventionSchemaPreHospital = new Schema({
    type: { type: String },
    timestamp: { type: String }, // Зберігаємо час як HH:mm рядок
    details: { type: String },
}, { _id: false });

const MedicationSchemaPreHospital = new Schema({
    name: { type: String },
    dose: { type: String },
    unit: { type: String },
    route: { type: String },
    timestamp: { type: String }, // Зберігаємо час як HH:mm рядок
}, { _id: false });

const TransportationSchemaPreHospital = new Schema({
    destinationFacilityName: { type: String },
    transportMode: { type: String },
    departureTimeFromScene: { type: Date }, // Дата і час
    patientConditionDuringTransport: { type: String },
}, { _id: false });


// --- Основна схема TraumaRecord ---
const TraumaRecordSchema = new Schema({
    internalCardId: { type: String, unique: true, required: true, index: true }, // З фронтенду
    incidentDateTime: { type: Date, required: true },
    reasonForCall: { type: String, required: true },
    
    patientInfo: PatientInfoSchemaPreHospital, // Вкладена схема для інформації про пацієнта

    teamArrivalTimeScene: { type: Date, required: true },
    patientContactTime: { type: Date },
    complaints: { type: String },

    triageCategory: { type: String, required: true },
    triageTimestamp: { type: String }, // Зберігаємо час як HH:mm рядок

    marchSurvey: MarchSurveySchema, // Вкладена схема для MARCH

    vitalSignsLog: [VitalSignSchemaPreHospital],
    suspectedInjuries: [InjurySchemaPreHospital],
    interventionsPerformed: [InterventionSchemaPreHospital],
    medicationsAdministered: [MedicationSchemaPreHospital],
    
    transportation: TransportationSchemaPreHospital, // Вкладена схема для транспортування
    
    outcomePreHospital: { type: String },
    notes: { type: String },

    // Поля для госпітального етапу (залишимо їх, але вони не будуть заповнюватися на ДЕ)
    hospitalCare: {
        type: Schema.Types.Mixed, // Можна зробити більш детальною схемою пізніше
        default: {},
    },
    status: { type: String, default: 'PreHospital', enum: ['PreHospital', 'HospitalCare', 'Closed'] },

}, { timestamps: true }); // Автоматично додає createdAt, updatedAt

// Перетворення дат для полів типу Date перед збереженням
// Це важливо, якщо з фронтенду приходить рядок
TraumaRecordSchema.pre('save', function(next) {
    const fieldsToConvert = [
        'incidentDateTime', 
        'patientInfo.dateOfBirth',
        'teamArrivalTimeScene', 
        'patientContactTime', 
        'transportation.departureTimeFromScene'
    ];
    fieldsToConvert.forEach(path => {
        const keys = path.split('.');
        let value;
        if (keys.length === 1) {
            value = this[keys[0]];
        } else if (keys.length === 2 && this[keys[0]]) {
            value = this[keys[0]][keys[1]];
        }

        if (value && typeof value === 'string') {
            const dateValue = new Date(value);
            if (!isNaN(dateValue)) {
                if (keys.length === 1) {
                    this[keys[0]] = dateValue;
                } else if (keys.length === 2 && this[keys[0]]) {
                    this[keys[0]][keys[1]] = dateValue;
                }
            } else {
                // Якщо не вдалося перетворити, можна або видалити, або залишити як є, або викликати помилку
                // Для dateOfBirth, якщо формат не YYYY-MM-DD, може бути проблема
                if (path === 'patientInfo.dateOfBirth' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                   // вже в правильному форматі для new Date()
                } else if (path === 'patientInfo.dateOfBirth') {
                    this.patientInfo.dateOfBirth = null; // або undefined, або не змінювати
                }
            }
        } else if (value === '') { // Якщо прийшов порожній рядок, встановлюємо null
             if (keys.length === 1) {
                this[keys[0]] = null;
            } else if (keys.length === 2 && this[keys[0]]) {
                this[keys[0]][keys[1]] = null;
            }
        }
    });
    next();
});


module.exports = mongoose.model('TraumaRecord', TraumaRecordSchema);