// models/PriorAidSection.schema.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Sub-schema for limb tourniquet details (Накл, Зняття, Конв, Перем) ---
const limbTourniquetSchema = new Schema({
    appliedTime: { type: String, default: null }, // HH:MM or null
    removedTime: { type: String, default: null },
    convertedTime: { type: String, default: null }, // <-- Є тут
    relocatedTime: { type: String, default: null }, // <-- Є тут
}, { _id: false });

// --- Sub-schema for time tracking (applied/removed only) - для AT/BT ---
const simpleTimeTrackingSchema = new Schema({
    appliedTime: { type: String, default: null }, // HH:MM or null
    removedTime: { type: String, default: null },
}, { _id: false });

// --- Sub-schema for medication administration details ---
const medicationAdministrationSchema = new Schema({
    dose: { type: String, default: null, trim: true },
    route: { type: String, default: null, trim: true },
    time: { type: String, default: null },
}, { _id: false });

// --- Main Schema for the Prior Aid Section ---
const priorAidSchema = new Schema({
    // 2.1 & 2.2: Time, Date, Provider
    aidTime: { type: String, default: null },
    aidDate: { type: String, default: null },
    aidProvider: {
        type: String,
        enum: ['ОСД', 'НП', 'МедП', 'Невідомо', 'Не надавалась', null],
        default: null,
    },

    // 2.3: Vital Signs
    vitalSigns: {
        _id: false,
        type: {
            respiratoryRate: { type: String, default: null, trim: true },
            spo2: { type: String, default: null, trim: true },
            pulse: { type: String, default: null, trim: true },
            bloodPressure: { type: String, default: null, trim: true },
            avpu: { type: String, default: null, trim: true },
            painScale: { type: String, default: null, trim: true },
        },
        default: () => ({}),
    },

    // 2.4: Interventions
    interventions: {
        _id: false,
        type: {
            bandage: { type: Boolean, default: false },
            tamponade: { type: Boolean, default: false },
            o2: { type: Boolean, default: false },
            oropharyngealAirway: { type: Boolean, default: false },
            nasopharyngealAirway: { type: Boolean, default: false },
            supraglotticAirway: { type: Boolean, default: false },
            endotrachealTube: { type: Boolean, default: false },
            cricothyrotomy: { type: Boolean, default: false },
            bagValveMask: { type: Boolean, default: false },
            needleDecompression: { type: Boolean, default: false },
            occlusiveDressing: { type: Boolean, default: false },
            ivAccess: { type: Boolean, default: false },
            ioAccess: { type: Boolean, default: false },
            hypothermiaPrevention: { type: Boolean, default: false },
            immobilization: { type: Boolean, default: false },
            eyeShield: { type: Boolean, default: false },
            otherIntervention: { type: Boolean, default: false },
            otherInterventionDetails: { type: String, trim: true, default: null },
        },
        default: () => ({}),
    },

    // 2.5: Tourniquets (Структура відповідає фронтенду з інтегрованими AT/BT)
    tourniquets: {
        _id: false,
        type: {
            // Кінцівки (використовують limbTourniquetSchema з 4 полями часу)
            rightUpperLimb: { type: limbTourniquetSchema, default: () => ({}) },
            leftUpperLimb:  { type: limbTourniquetSchema, default: () => ({}) },
            rightLowerLimb: { type: limbTourniquetSchema, default: () => ({}) },
            leftLowerLimb:  { type: limbTourniquetSchema, default: () => ({}) },
            // AT / BT (використовують simpleTimeTrackingSchema з 2 полями часу)
            abdominalTourniquet: { type: simpleTimeTrackingSchema, default: () => ({}) }, // AT
            junctionalTourniquet: { type: simpleTimeTrackingSchema, default: () => ({}) }, // BT
        },
        default: () => ({}),
    },

    // 2.6: Medications
    medications: {
        _id: false,
        type: {
            pillPack: { _id: false, type: { given: { type: Boolean, default: false }, details: { type: medicationAdministrationSchema, default: () => ({}) }, }, default: () => ({}), },
            tranexamicAcid: { _id: false, type: { given: { type: Boolean, default: false }, details: { type: medicationAdministrationSchema, default: () => ({}) }, }, default: () => ({}), },
            analgesic: { _id: false, type: { given: { type: Boolean, default: false }, details: { type: medicationAdministrationSchema, default: () => ({}) }, }, default: () => ({}), },
            antibiotic: { _id: false, type: { given: { type: Boolean, default: false }, details: { type: medicationAdministrationSchema, default: () => ({}) }, }, default: () => ({}), },
        },
        default: () => ({}),
    },

    // Загальні нотатки до медикаментів
    medicationNotes: {
         type: String,
         default: null,
         trim: true
    },

}, { _id: false });

module.exports = priorAidSchema;