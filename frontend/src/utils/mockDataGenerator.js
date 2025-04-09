// frontend/src/utils/generateCasualtyCardData.js
import { faker } from '@faker-js/faker/locale/uk'; // Ukrainian locale
import constants from '../constants/constants.json'; // Import constants

// --- Helper Functions ---

// Get a random sub-array
const getRandomSubarray = (arr = [], min = 0, max = arr.length) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const validArr = arr.filter(item => item); // Remove empty/null items from constants
    const shuffled = [...validArr].sort(() => 0.5 - Math.random());
    const count = faker.number.int({ min: Math.max(0, min), max: Math.min(max, validArr.length) });
    return shuffled.slice(0, count);
};

// Generate HH:MM time
const generateRandomTime = () => {
    const date = faker.date.recent({ days: 1 });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// Convert HH:MM to total minutes since midnight
function timeToMinutes(timeStr = "00:00") {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const [hours, minutes] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return (hours * 60) + minutes;
}

// Convert total minutes since midnight back to HH:MM
function minutesToTime(totalMinutes = 0) {
    const safeTotalMinutes = Math.max(0, totalMinutes); // Ensure non-negative
    const mins = safeTotalMinutes % 60;
    const hrs = Math.floor(safeTotalMinutes / 60) % 24; // Wrap around 24 hours
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// --- Sub-Generators for Complex Sections ---

function generateAllergies() {
    const isNka = faker.datatype.boolean(0.6); // 60% chance of NKA
    const knownAllergies = {};
    (constants.commonAllergens || []).forEach(allergen => {
        // Use a helper to generate a consistent key if needed, or assume direct use
        // const key = generateAllergyKey(allergen); // If you use this helper
        const key = allergen; // Assuming direct use for simplicity here
        knownAllergies[key] = !isNka && faker.datatype.boolean(0.15); // 15% chance for each known if not NKA
    });

    const hasOther = !isNka && faker.datatype.boolean(0.2); // 20% chance for 'other' if not NKA
    const otherText = hasOther ? `${faker.lorem.words(2)} (${faker.helpers.arrayElement(['висип', 'набряк'])})` : '';

    // Ensure at least one allergy is specified if NKA is false (to pass validation)
    const anyKnownSelected = Object.values(knownAllergies).some(v => v);
    if (!isNka && !anyKnownSelected && !hasOther) {
        // Force at least one known allergy if nothing else selected and not NKA
        const randomAllergenKey = faker.helpers.arrayElement(Object.keys(knownAllergies));
        if (randomAllergenKey) {
            knownAllergies[randomAllergenKey] = true;
        }
    }


    return {
        nka: isNka,
        known: isNka ? {} : knownAllergies, // Clear known if NKA
        other: isNka ? '' : otherText,      // Clear other if NKA
    };
}


function generateTourniquets() {
    const limbs = ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'];
    const tourniquets = {};
    limbs.forEach(limb => {
        const hasTourniquet = faker.datatype.boolean(0.2); // 20% chance per limb
        if (hasTourniquet) {
            const type = faker.helpers.arrayElement(constants.tourniquetTypes.filter(t => t && t !== 'Інше') || ['CAT', 'SOFTT-W', 'SICH']);
            const isOtherType = faker.datatype.boolean(0.1); // 10% chance the selected type is actually 'Other'
            const finalType = isOtherType ? 'Інше' : type;

            tourniquets[limb] = {
                time: generateRandomTime(),
                type: finalType,
                typeOther: finalType === 'Інше' ? faker.lorem.word().toUpperCase() : '',
            };
        } else {
            tourniquets[limb] = { time: '', type: '', typeOther: '' }; // Match initial state structure
        }
    });
    return tourniquets;
}

function generateVitalSigns(baseInjuryTimeStr) {
    const signsCount = faker.number.int({ min: 1, max: 3 }); // Generate 1-3 vital sign entries
    const signs = [];
    let lastTimeMinutes = timeToMinutes(baseInjuryTimeStr) + faker.number.int({ min: 5, max: 15 }); // First entry 5-15 min after injury

    for (let i = 0; i < signsCount; i++) {
         const time = minutesToTime(lastTimeMinutes);
         // Generate BP respecting format validation
         const systolic = faker.number.int({ min: 70, max: 180 });
         const diastolic = faker.number.int({ min: 40, max: 110 });

        signs.push({
            id: crypto.randomUUID(), // Required for useFieldArray
            time: time,
            pulse: faker.number.int({ min: 60, max: 160 }).toString(), // Within vitalSignSchema range
            bp: `${systolic}/${diastolic}`, // Correct format
            rr: faker.number.int({ min: 8, max: 40 }).toString(), // Within vitalSignSchema range
            spO2: faker.number.int({ min: 75, max: 100 }).toString(), // Within vitalSignSchema range
            avpu: faker.helpers.arrayElement(['A', 'V', 'P', 'U', '']), // Include empty option
            pain: faker.number.int({ min: 0, max: 10 }).toString(),
        });
        lastTimeMinutes += faker.number.int({ min: 10, max: 45 }); // Next entry 10-45 min later
    }
    return signs;
}

function generateFluidsGiven() {
    const fluidsCount = faker.number.int({ min: 0, max: 2 });
    if (fluidsCount === 0) return [];

    const fluids = [];
    for (let i = 0; i < fluidsCount; i++) {
        const name = faker.helpers.arrayElement((constants.commonFluids || []).filter(f => f) || ['Фізрозчин 0.9%', 'Кров цільна', 'Плазма', 'Інше...']);
        const time = generateRandomTime(); // Required by schema
        const route = faker.helpers.arrayElement((constants.fluidRoutes || []).filter(r => r) || ['В/В', 'В/К']); // Required by schema

        fluids.push({
            id: crypto.randomUUID(),
            time: time,
            name: name,
            // Generate 'amount' more reliably as a number string
            amount: faker.helpers.arrayElement(['250', '500', '1000', '400']),
            route: route,
            nameOther: name === 'Інше...' ? faker.science.chemicalElement().name : '',
        });
    }
    return fluids;
}

function generateMedicationsGiven() {
    const medsCount = faker.number.int({ min: 0, max: 4 });
    if (medsCount === 0) return [];

    const meds = [];
    const dosageUnits = (constants.dosageUnits || ['мг', 'мкг', 'мл', 'г', 'таб']);

    // --- 1. ПЕРЕВІРКА МАСИВУ ШЛЯХІВ ---
    // Отримуємо масив, фільтруємо порожні значення, і МАЄМО ЗАПАСНИЙ ВАРІАНТ
    const validMedRoutes = (Array.isArray(constants.medRoutes) ? constants.medRoutes.filter(r => !!r) : []).length > 0
                         ? constants.medRoutes.filter(r => !!r) // Використовуємо відфільтрований масив з констант
                         : ['PO (Перорально)', 'IV (Внутрішньовенно)', 'IM (Внутрішньом\'язово)', 'IN (Інтраназально)']; // Або запасний, ЯКЩО константи порожні

    // Логування для перевірки, який масив використовується
    // console.log("Using medRoutes:", validMedRoutes);

    for (let i = 0; i < medsCount; i++) {
        const name = faker.helpers.arrayElement((constants.commonMedications || []).filter(m => m && m !== 'Інше...') || ['TXA', 'Антибіотик', 'Знеболююче']);
        const isOtherName = faker.datatype.boolean(0.1); // Спрощено: 'Інше...' генерується окремо
        const finalName = isOtherName ? 'Інше...' : name;

        // --- 2. ГЕНЕРАЦІЯ ШЛЯХУ ---
        // Беремо випадковий елемент з ГАРАНТОВАНО не порожнього масиву validMedRoutes
        const route = faker.helpers.arrayElement(validMedRoutes);
        // Логування згенерованого шляху
        // console.log(`Generated route for med ${i}:`, route);

        const dosageValueGenerated = faker.number.int({ min: 1, max: 1000 });
        const dosageUnitGenerated = faker.helpers.arrayElement(dosageUnits);

        meds.push({
            time: generateRandomTime(),
            name: finalName,
            dosageValue: dosageValueGenerated.toString(),
            dosageUnit: dosageUnitGenerated,
            route: route, // <- Значення 'route' має бути тут
            nameOther: finalName === 'Інше...' ? `${faker.lorem.word()} ${faker.number.int({ min: 5, max: 50 })}${dosageUnitGenerated}` : '',
        });
    }
    // Логування фінального масиву ліків
    // console.log("Generated medications:", meds);
    return meds;
}

function generateAidCheckboxes() {
    // Generate boolean flags for each checkbox with varying probabilities
    const aidCirculation = {
        tourniquetJunctional: faker.datatype.boolean(0.1),
        tourniquetTruncal: faker.datatype.boolean(0.05),
        dressingHemostatic: faker.datatype.boolean(0.4),
        dressingPressure: faker.datatype.boolean(0.3),
        dressingOther: faker.datatype.boolean(0.1),
    };
    const aidAirway = {
        npa: faker.datatype.boolean(0.2),
        cric: faker.datatype.boolean(0.05),
        etTube: faker.datatype.boolean(0.05),
        supraglottic: faker.datatype.boolean(0.1),
    };
    const aidBreathing = {
        o2: faker.datatype.boolean(0.3),
        needleDecompression: faker.datatype.boolean(0.15),
        chestTube: faker.datatype.boolean(0.05),
        occlusiveDressing: faker.datatype.boolean(0.25),
    };
    const aidHypothermiaOther = {
        combatPillPack: faker.datatype.boolean(0.4),
        eyeShieldRight: faker.datatype.boolean(0.15),
        eyeShieldLeft: faker.datatype.boolean(0.15),
        splinting: faker.datatype.boolean(0.25),
        hypothermiaPrevention: faker.datatype.boolean(0.5), // 50% chance some prevention used
        hypothermiaPreventionType: '', // Will be set below
        hypothermiaPreventionTypeOther: '', // Will be set later if type is 'Інше...'
    };

    // Determine hypothermia prevention type only if prevention checkbox is true
    if (aidHypothermiaOther.hypothermiaPrevention) {
        aidHypothermiaOther.hypothermiaPreventionType = faker.helpers.arrayElement(
            (constants.hypothermiaPreventionTypes || []).filter(t => t) || ['Ковдра', 'Термопокривало', 'Інше...']
        );
    } else {
        aidHypothermiaOther.hypothermiaPreventionType = ''; // Ensure empty if checkbox is false
    }

    return { aidCirculation, aidAirway, aidBreathing, aidHypothermiaOther };
}

// --- Main Generator Function ---
export const generateCasualtyCardData = () => {
    // --- Generate Base Data (respecting required fields) ---
    const injuryDateObj = faker.date.recent({ days: 10 });
    const injuryDateStr = injuryDateObj.toISOString().split('T')[0]; // YYYY-MM-DD (Required)
    const injuryTimeStr = generateRandomTime(); // HH:MM (Required)
    const patientFullName = faker.person.fullName(); // Required

    const generatedBranch = faker.helpers.arrayElement((constants.branchesOfService || []).filter(b => b) || ['Армія', 'Флот', 'Повітряні сили', 'Інше']);
    const mechanism = getRandomSubarray(constants.mechanismOfInjuryOptions || ['Вибух', 'Вогнепальне', 'Опік', 'Інше'], 1, 2); // Ensure at least one is selected

    // --- Call Sub-Generators ---
    const generatedAllergies = generateAllergies(); // Ensures valid state (NKA or specified)
    const generatedTourniquets = generateTourniquets();
    const generatedVitals = generateVitalSigns(injuryTimeStr); // Ensure at least one entry
    const generatedFluids = generateFluidsGiven();
    const generatedMeds = generateMedicationsGiven();
    const generatedAid = generateAidCheckboxes();


    // --- Assemble the Mock Data Object ---
    const mockData = {
        // Section 1: Patient Data
        patientFullName: patientFullName,
        last4SSN: faker.datatype.boolean(0.8) ? faker.string.numeric(4) : '', // Optional, allow empty matching schema format
        gender: faker.helpers.arrayElement(['Ч', 'Ж', '']), // Allow empty
        injuryDate: injuryDateStr,
        injuryTime: injuryTimeStr,
        branchOfService: generatedBranch,
        branchOfServiceOther: generatedBranch === 'Інше' ? faker.company.name().substring(0, 25) : '',
        unit: faker.helpers.arrayElement(['1 БТГр', 'Медрота', '3 ШБ', '', 'Пункт евак.']), // Allow empty
        allergies: generatedAllergies,
        evacuationPriority: faker.helpers.arrayElement(constants.evacuationPriorities || ['Пріоритетна', 'Невідкладна', 'Звичайна']), // Should have a value

        // Section 2: Injury Info
        mechanismOfInjury: mechanism, // Required, at least one item
        mechanismOfInjuryOther: mechanism.includes('Інше') ? faker.lorem.words(3) : '', // Required if 'Інше' selected
        injuryDescription: faker.datatype.boolean(0.7) ? faker.lorem.paragraph({ min: 1, max: 2 }) : '', // Optional

        // Section 3: Tourniquets
        tourniquets: generatedTourniquets,

        // Section 4: Vital Signs
        vitalSigns: generatedVitals, // Should have at least one entry based on generator logic

        // Section 5: Provided Aid
        aidCirculation: generatedAid.aidCirculation,
        aidAirway: generatedAid.aidAirway,
        aidBreathing: generatedAid.aidBreathing,
        fluidsGiven: generatedFluids, // Array can be empty

        // Section 6: Medications & Other Aid
        medicationsGiven: generatedMeds, // Array can be empty
        aidHypothermiaOther: { // Needs careful handling for 'Інше...'
            ...generatedAid.aidHypothermiaOther,
            // Set 'Other' text only if type is 'Інше...'
            hypothermiaPreventionTypeOther: generatedAid.aidHypothermiaOther.hypothermiaPreventionType === 'Інше...'
                ? faker.lorem.words(2)
                : '',
        },

        // Section 7: Notes
        notes: faker.datatype.boolean(0.6) ? faker.lorem.sentences({ min: 1, max: 3 }) : '', // Optional

        // Section 8: Provider Data
        providerFullName: faker.person.fullName(), // Often required in practice, but schema might not enforce
        providerLast4SSN: faker.datatype.boolean(0.7) ? faker.string.numeric(4) : '', // Optional

        // System fields - left blank/null as intended
        individualNumber: '',
        recordedBy: '',
        injuryDateTime: null, // Calculated on save
    };

    // Final check/cleanup if necessary (e.g., ensure consistency)
    // Example: If NKA is true, ensure known/other are actually empty (already handled in generateAllergies)

    console.log("Generated Mock Casualty Card Data:", mockData);
    return mockData;
};