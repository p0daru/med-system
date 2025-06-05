// backend/models/TraumaRecord.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- Вкладені схеми для PreHospital ---

// Інформація про пацієнта (узгоджено з INITIAL_PRE_HOSPITAL_FORM_DATA)
const PatientInfoSchemaPreHospital = new Schema({
    patientFullName: { type: String }, // Може бути "Невідомо..."
    patientGender: { type: String, enum: ['male', 'female', 'unknown', ''] },
    patientDateOfBirth: { type: Date }, // Фронтенд надсилає 'YYYY-MM-DD' або порожній рядок
    patientApproximateAge: { type: String }, // Зберігаємо як рядок (напр. "25", "близько 40")
}, { _id: false });

// Введені медикаменти (узгоджено з INITIAL_PRE_HOSPITAL_FORM_DATA)
const MedicationAdministeredSchema = new Schema({
    name: { type: String }, 
    dosage: { type: String },
    route: { type: String }, 
    time: { type: String }, // HH:mm
    effectiveness: { type: String, enum: ['effective', 'partially_effective', 'not_effective', 'not_assessed', ''] },
}, { _id: false });

// Виконані процедури (узгоджено з INITIAL_PRE_HOSPITAL_FORM_DATA)
const ProcedurePerformedSchema = new Schema({
    name: { type: String }, 
    time: { type: String }, // HH:mm
    details: { type: String },
    effectiveness: { type: String, enum: ['effective', 'partially_effective', 'not_effective', 'not_assessed', ''] },
}, { _id: false });


// --- Основна схема TraumaRecord ---
const TraumaRecordSchema = new Schema({
    // Ідентифікація
    cardId: { type: String, unique: true, required: true, index: true },

    // 1. Загальна інформація, пацієнт, місце події
    incidentDateTime: { type: Date, required: true },
    arrivalDateTime: { type: Date, required: true },
    sceneTypeValue: { type: String }, 
    patientInfo: PatientInfoSchemaPreHospital, 
    
    catastrophicHemorrhageControlled: { type: Boolean, default: false },
    catastrophicHemorrhageDetails: { type: String },

    // 2. Оцінка стану (ABCDE)
    // A
    airwayStatus: { type: String },
    // B
    breathingRate: { type: String }, 
    breathingSaturation: { type: String }, 
    breathingQuality: { type: String },
    chestExcursion: { type: String },
    auscultationLungs: { type: String },
    // C
    pulseLocation: { type: String },
    pulseRate: { type: String }, 
    pulseQuality: { type: String },
    bloodPressureSystolic: { type: String },
    bloodPressureDiastolic: { type: String },
    capillaryRefillTime: { type: String },
    skinStatus: { type: String },
    externalBleeding: { type: String },
    // D
    // consciousnessLevel: { type: String }, // Якщо це поле не використовується, його можна видалити
    glasgowComaScaleEye: { type: String },
    glasgowComaScaleVerbal: { type: String },
    glasgowComaScaleMotor: { type: String },
    gcsTotal: { type: String }, 
    pupilReaction: { type: String },
    motorSensoryStatus: { type: String },
    neurologicalStatusDetails: { type: String },
    // E
    bodyTemperature: { type: String }, 
    exposureDetails: { type: String },

    // 3. Скарги, Анамнез (SAMPLE), Обставини - ВИДАЛЕНО
    // complaints: { type: String },
    // allergies: { type: String },
    // medicationsTaken: { type: String },
    // pastMedicalHistory: { type: String },
    // lastOralIntakeMeal: { type: String },
    // lastOralIntakeTime: { type: String }, 
    // eventsLeadingToInjury: { type: String },
    // mechanismOfInjuryDetailed: { type: String },

    // 4. Надана допомога
    medicationsAdministered: [MedicationAdministeredSchema],
    proceduresPerformed: [ProcedurePerformedSchema],
    ivAccessDetails: { type: String },

    // 5. Транспортування
    transportationMethod: { type: String },
    transportationOtherDetails: { type: String }, 
    destinationFacility: { type: String },

    // 6. Тріаж та додаткова інформація
    triageCategory: { type: String }, 
    rtsScore: { type: String }, 
    // additionalNotes: { type: String },
    medicalTeamResponsible: { type: String, required: true }, 
    
    status: { 
        type: String, 
        default: 'PreHospitalActive', 
        enum: ['PreHospitalActive', 'PreHospitalFinalized', 'HospitalCareActive', 'HospitalCareFinalized', 'Closed', 'Archived'] 
    },
    hospitalCareData: { 
        type: Schema.Types.Mixed,
        default: {},
    },

}, { timestamps: true });

// Хук для конвертації дат перед збереженням
TraumaRecordSchema.pre('save', function(next) {
    const fieldsToConvert = [
        'incidentDateTime', 
        'arrivalDateTime',
    ];

    fieldsToConvert.forEach(path => {
        let value = this[path];
        if (value && typeof value === 'string') {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime())) {
                this[path] = dateValue;
            } else {
                console.warn(`Could not convert string "${value}" to Date for path "${path}". Setting to null.`);
                this[path] = null; 
            }
        } else if (value === '') {
            this[path] = null;
        }
    });

    if (this.patientInfo && this.patientInfo.patientDateOfBirth) {
        if (typeof this.patientInfo.patientDateOfBirth === 'string') {
            const dobStr = this.patientInfo.patientDateOfBirth;
            if (dobStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const parts = dobStr.split('-');
                this.patientInfo.patientDateOfBirth = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
            } else if (dobStr === '') {
                this.patientInfo.patientDateOfBirth = null;
            } else {
                console.warn(`Invalid date format for patientDateOfBirth: "${dobStr}". Setting to null.`);
                this.patientInfo.patientDateOfBirth = null;
            }
        } else if (this.patientInfo.patientDateOfBirth === null) {
            // Вже null, нічого не робимо
        } else if (!(this.patientInfo.patientDateOfBirth instanceof Date)){
             console.warn(`Unexpected type for patientDateOfBirth: "${typeof this.patientInfo.patientDateOfBirth}". Setting to null.`);
             this.patientInfo.patientDateOfBirth = null;
        }
    } else if (this.patientInfo) { // Якщо patientInfo існує, але patientDateOfBirth немає або undefined
        this.patientInfo.patientDateOfBirth = null;
    }

    // Очищення порожніх масивів
    if (this.medicationsAdministered && this.medicationsAdministered.length === 1 && 
        (!this.medicationsAdministered[0].name || this.medicationsAdministered[0].name.trim() === '') &&
        (!this.medicationsAdministered[0].dosage || this.medicationsAdministered[0].dosage.trim() === '') &&
        (!this.medicationsAdministered[0].route || this.medicationsAdministered[0].route.trim() === '')
    ) {
        this.medicationsAdministered = [];
    }
    if (this.proceduresPerformed && this.proceduresPerformed.length === 1 && 
        (!this.proceduresPerformed[0].name || this.proceduresPerformed[0].name.trim() === '') &&
        (!this.proceduresPerformed[0].details || this.proceduresPerformed[0].details.trim() === '')
    ) {
        this.proceduresPerformed = [];
    }

    next();
});

module.exports = mongoose.model('TraumaRecord', TraumaRecordSchema);