// models/CasualtyCard.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Sub-Schemas for Nested Data ---

// Schema for a single tourniquet entry on a limb
const tourniquetLimbSchema = new Schema({
    time: { type: String, trim: true, default: '' }, // HH:MM format expected from frontend
    type: { type: String, trim: true, default: '' }  // e.g., CAT, SOFTT-W, SICH, or custom value from "Інше"
}, { _id: false }); // No separate _id for each limb entry

// Schema for a single vital signs entry
const vitalSignEntrySchema = new Schema({
    time: { type: String, trim: true, required: [true, 'Час є обов\'язковим для запису життєвих показників'] }, // HH:MM - Required if the entry exists
    pulse: { type: String, trim: true, default: '' },
    bp: { type: String, trim: true, default: '' },      // Systolic/Diastolic
    rr: { type: String, trim: true, default: '' },       // Respiratory Rate
    spO2: { type: String, trim: true, default: '' },     // SaO2 %
    avpu: { type: String, enum: ['A', 'V', 'P', 'U', '', null], default: null }, // Allow empty string or null for not selected
    pain: { type: String, trim: true, default: '' }      // 0-10 scale expected
}, { _id: false }); // No separate _id for each vital sign log entry

// Schema for a single fluid/blood entry
const fluidEntrySchema = new Schema({
    time: { type: String, trim: true, default: '' },    // HH:MM
    name: { type: String, trim: true, default: '' },   // Includes custom values from "Інше..."
    amount: { type: String, trim: true, default: '' }, // Renamed from 'volume' to match frontend (amount in ml)
    route: { type: String, trim: true, default: '' }   // Route of administration
}, { _id: false }); // No separate _id for each fluid entry

// Schema for a single medication entry
const medicationEntrySchema = new Schema({
    time: { type: String, trim: true, default: '' },   // HH:MM
    name: { type: String, trim: true, default: '' },   // Includes custom values from "Інше..."
    dose: { type: String, trim: true, default: '' },   // Renamed from 'dosage' to match frontend (dose with units)
    route: { type: String, trim: true, default: '' }   // Route of administration
}, { _id: false }); // No separate _id for each medication entry


// --- Main Casualty Card Schema ---
const casualtyCardSchema = new Schema({
    // Section 1: Patient Data
    individualNumber: { // Often generated server-side or needs uniqueness validation depending on workflow
        type: String,
        trim: true,
        index: true, // Index for faster lookups
        // unique: true, // Uncomment if this number MUST be strictly unique across all cards
        // sparse: true // Allows multiple null/absent values if unique constraint is enabled
    },
    patientFullName: { type: String, trim: true, default: '' },
    last4SSN: { type: String, trim: true, default: '' }, // Frontend validates format/length
    gender: { type: String, enum: ['Ч', 'Ж', '', null], default: null }, // Matches frontend options
    injuryDateTime: { type: Date }, // Combined Date + Time stored as ISO Date in DB
    branchOfService: { type: String, trim: true, default: '' }, // Stores the final value (e.g., "Армія" or custom value)
    unit: { type: String, trim: true, default: '' },
    allergies: { // Structure for allergies
        nka: { type: Boolean, default: false }, // No Known Allergies flag
        known: { // Object storing known allergies (key: allergen name, value: true)
            type: Map, // Using Map to store dynamic key-value pairs
            of: Boolean, // Value will always be true if the key exists
            default: {}
        },
        other: { type: String, trim: true, default: '' } // Field for details or non-standard allergies
    },
    evacuationPriority: {
        type: String,
        enum: ['Невідкладна', 'Пріоритетна', 'Звичайна', '', null], // Matches frontend options
        default: 'Пріоритетна' // Default value as set in frontend
    },

    // Section 2: Injury Information
    mechanismOfInjury: { type: [String], default: [] }, // Array of selected mechanism strings
    mechanismOfInjuryOther: { type: String, trim: true, default: '' }, // Details for "Other" mechanism
    injuryDescription: { type: String, trim: true, default: '' }, // Free text description

    // Section 3: Tourniquets (as handled in frontend Section 2 Panel)
    tourniquets: { // Object keyed by limb name
        rightArm: { type: tourniquetLimbSchema, default: () => ({}) }, // Default to empty object
        leftArm:  { type: tourniquetLimbSchema, default: () => ({}) },
        rightLeg: { type: tourniquetLimbSchema, default: () => ({}) },
        leftLeg:  { type: tourniquetLimbSchema, default: () => ({}) }
    },

    // Section 4: Vital Signs (Array of entries)
    vitalSigns: {
        type: [vitalSignEntrySchema],
        default: [] // Default to empty array
    },

    // Section 5: Provided Aid (MARCH protocol checkboxes & fluids)
    aidCirculation: { // C - Circulation Checkboxes
        tourniquetJunctional: { type: Boolean, default: false },
        tourniquetTruncal:    { type: Boolean, default: false },
        dressingHemostatic:   { type: Boolean, default: false },
        dressingPressure:     { type: Boolean, default: false },
        dressingOther:        { type: Boolean, default: false }
    },
    aidAirway: { // A - Airway Checkboxes
        // 'intact' checkbox usually not stored if other interventions are marked
        npa:          { type: Boolean, default: false }, // Nasopharyngeal Airway
        cric:         { type: Boolean, default: false }, // Cricothyroidotomy
        etTube:       { type: Boolean, default: false }, // Endotracheal Tube
        supraglottic: { type: Boolean, default: false } // Supraglottic Airway
    },
    aidBreathing: { // B - Breathing Checkboxes
        o2:                  { type: Boolean, default: false }, // Oxygen given
        needleDecompression: { type: Boolean, default: false }, // Needle Decompression performed
        chestTube:           { type: Boolean, default: false }, // Chest Tube inserted
        occlusiveDressing:   { type: Boolean, default: false } // Occlusive Dressing applied
    },
    fluidsGiven: { // C - Fluids/Blood (Array of entries)
        type: [fluidEntrySchema],
        default: []
    },

    // Section 6: Medications & Other Aid (H+E protocol elements)
    medicationsGiven: { // Medications (Array of entries)
        type: [medicationEntrySchema],
        default: []
    },
    aidHypothermiaOther: { // H+E - Hypothermia Prevention / Head Injury / Other
        combatPillPack:         { type: Boolean, default: false },
        eyeShieldRight:         { type: Boolean, default: false },
        eyeShieldLeft:          { type: Boolean, default: false },
        splinting:              { type: Boolean, default: false },
        hypothermiaPrevention:  { type: Boolean, default: false }, // Checkbox if any prevention used
        hypothermiaPreventionType: { type: String, trim: true, default: '' } // Stores type (e.g., "Blanket", "Custom Value")
    },

    // Section 7: Notes (as handled in frontend Section 6 Panel)
    notes: { type: String, trim: true, default: '' },

    // Section 8: Provider Data (as handled in frontend Section 6 Panel)
    providerFullName: { type: String, trim: true, default: '' },
    providerLast4SSN: { type: String, trim: true, default: '' }, // Frontend validates format/length

    // System Fields
    recordedBy: { type: String, trim: true, default: '' } // Could be User ID or name from auth context

}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    minimize: false   // Crucial: Ensures that empty objects (like tourniquets with default empty schemas) are saved to DB
});

// Create indexes for efficient searching based on frontend list view filters/search
casualtyCardSchema.index({ patientFullName: 'text', individualNumber: 'text', last4SSN: 'text' }); // Text index for search bar
casualtyCardSchema.index({ createdAt: -1 }); // Index for default sorting

const CasualtyCard = mongoose.model('CasualtyCard', casualtyCardSchema);

module.exports = CasualtyCard;