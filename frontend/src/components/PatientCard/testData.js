// frontend/src/utils/testData.js
import { INITIAL_PRE_HOSPITAL_FORM_DATA } from './patientCardConstants';

// --- Допоміжні утиліти ---
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatTimeLocal = (date) => date.toTimeString().slice(0, 5);
const formatDateTimeLocal = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const getRandomDateWithinPastHours = (hours) => {
    const now = new Date();
    const randomMillis = Math.random() * hours * 60 * 60 * 1000;
    return new Date(now.getTime() - randomMillis);
};

// --- Базові дані для генерації ---
const maleNames = ["Іван", "Петро", "Олександр", "Сергій", "Андрій"];
const femaleNames = ["Марія", "Олена", "Анна", "Тетяна", "Наталія"];
const lastNames = ["Шевченко", "Мельник", "Ковальчук", "Бондаренко", "Ткаченко"];
const malePatronymics = ["Іванович", "Петрович", "Олександрович", "Сергійович", "Андрійович"];
const femalePatronymics = ["Іванівна", "Петрівна", "Олександрівна", "Сергіївна", "Андріївна"];

/**
 * Створює ОДИН логічно узгоджений об'єкт пацієнта для заповнення форми.
 */
const createPatientScenario = (config) => {
    // 1. ДЕМОГРАФІЯ
    const gender = config.gender || (Math.random() > 0.5 ? 'male' : 'female');
    const age = (() => {
        if (config.age === 'child') return getRandomNumber(3, 12);
        if (config.age === 'elderly') return getRandomNumber(70, 90);
        return getRandomNumber(18, 69);
    })();
    const birthYear = new Date().getFullYear() - age;
    const patientDateOfBirth = new Date(birthYear, getRandomNumber(0, 11), getRandomNumber(1, 28));
    const fullName = gender === 'male'
        ? `${getRandomElement(lastNames)} ${getRandomElement(maleNames)} ${getRandomElement(malePatronymics)}`
        : `${getRandomElement(lastNames)} ${getRandomElement(femaleNames)} ${getRandomElement(femalePatronymics)}`;

    // 2. ЖИТТЄВІ ПОКАЗНИКИ (ABCDE) - базові значення для стабільного пацієнта
    let gcsEye = '4', gcsVerbal = '5', gcsMotor = '6', pupilReaction = 'PERRLA', motorSensoryStatus = 'intact_all_extremities';
    let airwayStatus = 'clear_open_spontaneous', breathingRate = '13-20', breathingSaturation = '>=94',
        breathingQuality = 'normal_effortless_symmetric', chestExcursion = 'symmetric_adequate', auscultationLungs = 'clear_bilaterally',
        pulseRate = '60-100', pulseQuality = 'strong_regular', pulseLocation = 'radial',
        bloodPressureSystolic = getRandomNumber(110, 130), bloodPressureDiastolic = getRandomNumber(70, 85),
        capillaryRefillTime = '<2', skinStatus = 'pink_warm_dry', externalBleeding = 'none_visible',
        bodyTemperature = '36.1-37.2', sceneTypeValue = 'dtp_driver_passenger', transportationMethod = 'emd_b',
        destinationFacility = 'Міська лікарня №1, Приймальне відділення';

    // Застосування профілів стану
    if (config.profile === 'critical') {
        gcsEye = '1'; gcsVerbal = '2'; gcsMotor = '3'; pupilReaction = 'dilated_fixed'; motorSensoryStatus = 'unable_to_assess';
        airwayStatus = config.intubated ? 'secured_advanced_device' : 'partially_obstructed_tongue';
        breathingRate = '>30'; breathingSaturation = '<85';
        breathingQuality = 'agonal_gasping'; chestExcursion = 'asymmetric'; auscultationLungs = 'absent_left';
        
        // Додаємо варіативність
        pulseRate = getRandomElement(['>150', '<40']); 
        pulseQuality = getRandomElement(['weak_irregular', 'absent_peripheral']); 
        
        pulseLocation = 'carotid';
        bloodPressureSystolic = 70; bloodPressureDiastolic = 40;
        capillaryRefillTime = '>3'; skinStatus = 'pale_cool_clammy'; externalBleeding = 'severe_arterial_pulsating';
        bodyTemperature = '<35';
        sceneTypeValue = 'explosion'; transportationMethod = 'emd_c'; destinationFacility = 'Обласна лікарня, Реанімація';
    } else if (config.profile === 'unstable') {
        gcsEye = '3'; gcsVerbal = '4'; gcsMotor = '5'; pupilReaction = 'equal_sluggish'; motorSensoryStatus = 'deficit_lower_left';
        airwayStatus = 'clear_maintained_manual'; breathingRate = '25-30'; breathingSaturation = '90-93';
        breathingQuality = 'deep_labored_accessory_muscles'; chestExcursion = 'symmetric_reduced';
        auscultationLungs = 'reduced_right';
        
        // Додаємо варіативність
        pulseRate = getRandomElement(['121-150', '40-59']); 
        pulseQuality = getRandomElement(['weak_regular', 'strong_irregular']);

        bloodPressureSystolic = 90; bloodPressureDiastolic = 50;
        capillaryRefillTime = '2-3'; skinStatus = 'pale_warm_dry'; externalBleeding = 'moderate_venous';
        bodyTemperature = '35.0-36.0';
    }

    // Застосування логіки для категорії "Загиблий"
    if (config.triageCategory === 'black') {
        gcsEye = '1'; gcsVerbal = '1'; gcsMotor = '1'; pupilReaction = 'dilated_fixed'; motorSensoryStatus = 'unable_to_assess';
        airwayStatus = 'fully_obstructed'; breathingRate = '0'; breathingQuality = 'apneic_no_effort';
        breathingSaturation = 'unable'; chestExcursion = 'absent'; auscultationLungs = 'absent_right';
        pulseRate = '0'; pulseQuality = 'absent_central'; pulseLocation = 'other';
        bloodPressureSystolic = 0; bloodPressureDiastolic = 0; capillaryRefillTime = 'unable';
        skinStatus = 'cyanotic_central'; bodyTemperature = 'unable'; transportationMethod = 'not_transported';
    }
    
    // 3. МЕДИЧНА ДОПОМОГА
    const medicationsAdministered = [];
    const proceduresPerformed = [];
    if (config.triageCategory !== 'black' && config.triageCategory !== 'green') {
        proceduresPerformed.push({ name: 'В/в доступ (периферичний катетер)', time: formatTimeLocal(new Date()), details: 'G18 в ліктьовій вені', effectiveness: 'effective' });
        medicationsAdministered.push({ name: 'Розчин NaCl 0.9%', dosage: '500 мл', route: 'iv', time: formatTimeLocal(new Date()), effectiveness: 'partially_effective' });
    }
    if (config.intubated) {
        proceduresPerformed.push({ name: 'Інтубація трахеї', time: formatTimeLocal(new Date()), details: 'ЕТТ №7.5', effectiveness: 'effective' });
    }
    
    const incidentTime = getRandomDateWithinPastHours(4);

    // 4. ФОРМУВАННЯ ФІНАЛЬНОГО ОБ'ЄКТУ
    return {
        ...INITIAL_PRE_HOSPITAL_FORM_DATA, // Починаємо з чистого об'єкта, щоб гарантувати наявність всіх полів
        patientFullName: fullName,
        patientGender: gender,
        patientDateOfBirth: patientDateOfBirth.toISOString().split('T')[0], // YYYY-MM-DD
        patientApproximateAge: age.toString(),
        triageCategory: config.triageCategory,
        incidentDateTime: formatDateTimeLocal(incidentTime),
        arrivalDateTime: formatDateTimeLocal(new Date(incidentTime.getTime() + 15 * 60000)),
        sceneTypeValue, transportationMethod, destinationFacility,
        airwayStatus, breathingRate, breathingSaturation, breathingQuality, chestExcursion, auscultationLungs,
        pulseRate, pulseQuality, pulseLocation, capillaryRefillTime, skinStatus, externalBleeding, bodyTemperature,
        bloodPressureSystolic: bloodPressureSystolic.toString(),
        bloodPressureDiastolic: bloodPressureDiastolic.toString(),
        gcsTotal: (parseInt(gcsEye) + parseInt(gcsVerbal) + parseInt(gcsMotor)).toString(),
        glasgowComaScaleEye: gcsEye,
        glasgowComaScaleVerbal: gcsVerbal,
        glasgowComaScaleMotor: gcsMotor,
        pupilReaction,
        motorSensoryStatus,
        medicationsAdministered,
        proceduresPerformed,
        exposureDetails: `${config.scenarioName}. Пацієнт ${age} років.`,
        medicalTeamResponsible: `Бригада №${getRandomNumber(10, 99)}`,
    };
};

// --- МАСИВ ГОТОВИХ СЦЕНАРІЇВ ---
const realisticPatientScenarios = [
    // RED (Критичні)
    { config: { triageCategory: 'red', age: 40, profile: 'critical', intubated: true, scenarioName: "Вибухова травма, ЧМТ, заінтубований" }},
    { config: { triageCategory: 'red', age: 'elderly', profile: 'unstable', scenarioName: "Падіння, перелом стегна" }},
    
    // YELLOW (Відстрочені)
    { config: { triageCategory: 'yellow', age: 30, profile: 'unstable', scenarioName: "Напад астми" }},
    { config: { triageCategory: 'yellow', age: 'teen', profile: 'stable', scenarioName: "Закритий перелом" }},

    // GREEN (Легкі)
    { config: { triageCategory: 'green', age: 25, profile: 'stable', scenarioName: "Поріз руки" }},
    
    // BLACK (Померлі)
    { config: { triageCategory: 'black', age: 50, profile: 'critical', scenarioName: "Травми несумісні з життям" }},
];

/**
 * Головна експортована функція. Генерує ОДИН випадковий сценарій для заповнення форми.
 */
export const generatePreHospitalTestData = () => {
    const randomScenario = getRandomElement(realisticPatientScenarios);
    return createPatientScenario(randomScenario.config);
};