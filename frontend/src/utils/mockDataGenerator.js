// frontend/src/utils/generateCasualtyCardData.js
import { faker } from '@faker-js/faker/locale/uk'; // Використовуємо українську локаль
import constants from '../constants/constants.json'; // Імпортуємо константи

// Допоміжна функція для отримання випадкового підмасиву
const getRandomSubarray = (arr, min = 0, max = arr.length) => {
    if (!arr || arr.length === 0) return [];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    const count = faker.number.int({ min, max: Math.min(max, arr.length) });
    return shuffled.slice(0, count);
};

// Допоміжна функція для генерації часу HH:MM
const generateRandomTime = () => {
    const date = faker.date.recent({ days: 1 }); // Використовуємо recent для реалістичності
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};


export const generateCasualtyCardData = () => {
    // --- Генеруємо базові дані ---
    const injuryDateObj = faker.date.recent({ days: 30 }); // Дата поранення як об'єкт Date
    const injuryDateStr = injuryDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const injuryTimeStr = generateRandomTime(); // HH:MM

    const generatedBranch = faker.helpers.arrayElement(constants.branchesOfService);
    const generatedAllergies = generateAllergies();
    const generatedTourniquets = generateTourniquets();
    const generatedVitals = generateVitalSigns(injuryTimeStr); // Передаємо час поранення для бази
    const generatedFluids = generateFluidsGiven();
    const generatedMeds = generateMedicationsGiven();
    const generatedAid = generateAidCheckboxes();

    // --- Формуємо об'єкт даних ---
    const mockData = {
        // Section 1: Patient Data
        patientFullName: faker.person.fullName(),
        last4SSN: faker.string.numeric(4),
        gender: faker.helpers.arrayElement(['Ч', 'Ж', '']),
        injuryDate: injuryDateStr,
        injuryTime: injuryTimeStr,
        branchOfService: generatedBranch,
        branchOfServiceOther: generatedBranch === 'Інше' ? faker.company.name().substring(0, 30) : '', // Генеруємо "Інше", якщо треба
        unit: faker.helpers.arrayElement(['1 Бат.', '2 Рота', 'Медпункт', 'Взвод Альфа', '']),
        allergies: generatedAllergies,
        evacuationPriority: faker.helpers.arrayElement(constants.evacuationPriorities),

        // Section 2: Injury Info
        mechanismOfInjury: getRandomSubarray(constants.mechanismOfInjuryOptions || ['Вибух', 'Вогнепальне', 'Падіння', 'ДТП', 'Інше'], 1, 2), // Потрібно визначити constants.mechanismOfInjuryOptions
        mechanismOfInjuryOther: '', // Залишимо порожнім або додамо логіку, якщо 'Інше' вибрано вище
        injuryDescription: faker.lorem.paragraph({ min: 1, max: 3 }),

        // Section 3: Tourniquets
        tourniquets: generatedTourniquets,

        // Section 4: Vital Signs
        vitalSigns: generatedVitals,

        // Section 5: Provided Aid
        aidCirculation: generatedAid.aidCirculation,
        aidAirway: generatedAid.aidAirway,
        aidBreathing: generatedAid.aidBreathing,
        fluidsGiven: generatedFluids,

        // Section 6: Medications & Other Aid
        medicationsGiven: generatedMeds,
        aidHypothermiaOther: generatedAid.aidHypothermiaOther,

        // Section 7: Notes
        notes: faker.datatype.boolean(0.7) ? faker.lorem.paragraph({ min: 1, max: 4 }) : '', // 70% шанс мати нотатки

        // Section 8: Provider Data
        providerFullName: faker.person.fullName(),
        providerLast4SSN: faker.string.numeric(4),

        // Системні поля - залишаємо порожніми, вони заповнюються/оброблюються інакше
        individualNumber: '',
        recordedBy: '',
        injuryDateTime: null, // Це поле обчислюється при збереженні
    };

     // Додаткова логіка для "Інше" в механізмі травми
     if (mockData.mechanismOfInjury.includes('Інше')) {
        mockData.mechanismOfInjuryOther = faker.lorem.words(3);
     }

     // Додаткова логіка для "Інше" в типі гіпотермії
     if (mockData.aidHypothermiaOther.hypothermiaPreventionType === 'Інше...') {
         mockData.aidHypothermiaOther.hypothermiaPreventionTypeOther = faker.lorem.words(2);
     }


    console.log("Generated Mock Data:", mockData);
    return mockData;
};


// --- Допоміжні генератори для складних структур ---

function generateAllergies() {
    const isNka = faker.datatype.boolean(0.6); // 60% шанс не мати алергій
    if (isNka) {
        return {
            nka: true,
            known: Object.fromEntries(constants.commonAllergens.map(a => [a, false])),
            other: '',
        };
    } else {
        const knownAllergies = {};
        constants.commonAllergens.forEach(allergen => {
            knownAllergies[allergen] = faker.datatype.boolean(0.15); // 15% шанс на кожну відому алергію
        });
        const hasOther = faker.datatype.boolean(0.2); // 20% шанс мати щось в "other"
        return {
            nka: false,
            known: knownAllergies,
            other: hasOther ? `${faker.lorem.words(2)} - ${faker.helpers.arrayElement(['висип', 'набряк', 'анафілаксія'])}` : '',
        };
    }
}

function generateTourniquets() {
    const limbs = ['rightArm', 'leftArm', 'rightLeg', 'leftLeg'];
    const tourniquets = {};
    limbs.forEach(limb => {
        const hasTourniquet = faker.datatype.boolean(0.2); // 20% шанс мати турнікет на кінцівці
        if (hasTourniquet) {
            const type = faker.helpers.arrayElement(constants.tourniquetTypes.filter(t => t)); // Виключаємо порожній рядок
            tourniquets[limb] = {
                time: generateRandomTime(),
                type: type,
                typeOther: type === 'Інше' ? faker.lorem.word().toUpperCase() : '',
            };
        } else {
             // Залишаємо порожній об'єкт або об'єкт з порожніми полями, відповідно до initialDataState
             tourniquets[limb] = { time: '', type: '', typeOther: '' };
        }
    });
    return tourniquets;
}

function generateVitalSigns(injuryTimeStr) {
    const signsCount = faker.number.int({ min: 0, max: 3 }); // 0-3 записи вітальних знаків
    if (signsCount === 0) return [];

    const signs = [];
    let lastTimeMinutes = timeToMinutes(injuryTimeStr) + faker.number.int({ min: 5, max: 15 }); // Перший запис через 5-15 хв

    for (let i = 0; i < signsCount; i++) {
        signs.push({
            id: crypto.randomUUID(),
            time: minutesToTime(lastTimeMinutes),
            pulse: faker.number.int({ min: 70, max: 150 }).toString(),
            bp: `${faker.number.int({ min: 80, max: 160 })}/${faker.number.int({ min: 45, max: 100 })}`,
            rr: faker.number.int({ min: 10, max: 32 }).toString(),
            spO2: faker.number.int({ min: 80, max: 100 }).toString(),
            avpu: faker.helpers.arrayElement(['A', 'V', 'P', 'U']),
            pain: faker.number.int({ min: 0, max: 10 }).toString(),
        });
        lastTimeMinutes += faker.number.int({ min: 10, max: 30 }); // Наступний запис через 10-30 хв
    }
    return signs;
}

// Допоміжні функції для часу вітальних знаків
function timeToMinutes(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
}
function minutesToTime(totalMinutes) {
    const mins = totalMinutes % 60;
    const hrs = Math.floor(totalMinutes / 60) % 24; // Обмежуємо 24 годинами
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}


function generateFluidsGiven() {
    const fluidsCount = faker.number.int({ min: 0, max: 2 });
    if (fluidsCount === 0) return [];

    const fluids = [];
    for (let i = 0; i < fluidsCount; i++) {
        const name = faker.helpers.arrayElement(constants.commonFluids.filter(f => f));
        fluids.push({
            id: crypto.randomUUID(),
            time: generateRandomTime(),
            name: name,
            volume: faker.helpers.arrayElement(['250', '500', '1000', '400']), // Додав '400' (цільна кров)
            route: faker.helpers.arrayElement(constants.fluidRoutes.filter(r => r)),
            nameOther: name === 'Інше...' ? faker.science.chemicalElement().name : '',
        });
    }
    return fluids;
}

function generateMedicationsGiven() {
    const medsCount = faker.number.int({ min: 0, max: 4 });
    if (medsCount === 0) return [];

    const meds = [];
    for (let i = 0; i < medsCount; i++) {
        const name = faker.helpers.arrayElement(constants.commonMedications.filter(m => m));
        meds.push({
            id: crypto.randomUUID(),
            time: generateRandomTime(),
            name: name,
            dosage: `${faker.number.int({ min: 1, max: 1000 })} ${faker.helpers.arrayElement(['мг', 'мкг', 'мл', 'таб'])}`,
            route: faker.helpers.arrayElement(constants.medRoutes.filter(r => r)),
            nameOther: name === 'Інше...' ? faker.lorem.word() : '',
        });
    }
    return meds;
}

function generateAidCheckboxes() {
    const aidCirculation = {};
    const aidCircKeys = ['tourniquetJunctional', 'tourniquetTruncal', 'dressingHemostatic', 'dressingPressure', 'dressingOther'];
    aidCircKeys.forEach(key => aidCirculation[key] = faker.datatype.boolean(0.2)); // 20% шанс

    const aidAirway = {};
    const aidAirKeys = ['npa', 'cric', 'etTube', 'supraglottic'];
    aidAirKeys.forEach(key => aidAirway[key] = faker.datatype.boolean(0.15)); // 15% шанс

    const aidBreathing = {};
    const aidBreathKeys = ['o2', 'needleDecompression', 'chestTube', 'occlusiveDressing'];
    aidBreathKeys.forEach(key => aidBreathing[key] = faker.datatype.boolean(0.25)); // 25% шанс

    const aidHypothermiaOther = {};
    const aidHypoKeys = ['combatPillPack', 'eyeShieldRight', 'eyeShieldLeft', 'splinting', 'hypothermiaPrevention'];
    aidHypoKeys.forEach(key => aidHypothermiaOther[key] = faker.datatype.boolean(0.3)); // 30% шанс
    // Генеруємо тип, тільки якщо основний чекбокс активний
    aidHypothermiaOther.hypothermiaPreventionType = aidHypothermiaOther.hypothermiaPrevention
        ? faker.helpers.arrayElement(constants.hypothermiaPreventionTypes)
        : '';
    aidHypothermiaOther.hypothermiaPreventionTypeOther = ''; // Заповниться в основній функції, якщо треба

    return { aidCirculation, aidAirway, aidBreathing, aidHypothermiaOther };
}