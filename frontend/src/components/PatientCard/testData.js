// frontend/src/utils/testData.js
import {
    INITIAL_PRE_HOSPITAL_FORM_DATA,
    SCENE_TYPE_OPTIONS, GENDER_OPTIONS, CONSCIOUSNESS_LEVELS_AVPU, AIRWAY_STATUS_OPTIONS,
    BREATHING_RATE_OPTIONS, OXYGEN_SATURATION_OPTIONS, BREATHING_QUALITY_OPTIONS,
    CHEST_EXCURSION_OPTIONS, AUSCULTATION_LUNGS_OPTIONS, PULSE_RATE_OPTIONS,
    PULSE_QUALITY_OPTIONS, PULSE_LOCATION_OPTIONS, CAPILLARY_REFILL_TIME_OPTIONS,
    SKIN_STATUS_OPTIONS, EXTERNAL_BLEEDING_OPTIONS, GCS_EYE_OPTIONS, GCS_VERBAL_OPTIONS,
    GCS_MOTOR_OPTIONS, PUPIL_REACTION_OPTIONS, MOTOR_SENSORY_STATUS_OPTIONS,
    BODY_TEMPERATURE_OPTIONS, TRANSPORTATION_METHOD_OPTIONS, TRIAGE_CATEGORIES_OPTIONS,
    EFFECTIVENESS_OPTIONS, MEDICATION_ROUTE_OPTIONS, COMMON_PREHOSPITAL_MEDICATIONS,
    COMMON_PREHOSPITAL_PROCEDURES, TRAUMA_TYPE_OPTIONS
} from './patientCardConstants'; // Переконайтеся, що шлях правильний!

const generateShortId = (prefix = 'TRM-') => {
  let result = prefix;
  const alphanumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
};

const getRandomElement = (arr, filterFn = () => true) => {
    const filteredArr = arr.filter(filterFn);
    if (filteredArr.length === 0) {
        if (arr.length > 0) return arr[0];
        return undefined;
    }
    return filteredArr[Math.floor(Math.random() * filteredArr.length)];
};

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomDateWithinPastHours = (hours) => {
    const now = new Date();
    const randomMillis = Math.random() * hours * 60 * 60 * 1000;
    return new Date(now.getTime() - randomMillis);
};

const formatDateTimeLocal = (date) => {
    if (!date) return '';
    try {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting date for datetime-local:", date, e);
        return '';
    }
};

const formatDateLocal = (date) => {
    if (!date) return '';
     try {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error formatting date for date input:", date, e);
        return '';
    }
};

const formatTimeLocal = (date) => {
    if (!date) return '';
    try {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch (e) {
        console.error("Error formatting date for time input:", date, e);
        return '';
    }
};

const randomMaleName = ["Іван", "Петро", "Олександр", "Сергій", "Андрій", "Микола", "Василь", "Артем", "Максим", "Юрій"];
const randomFemaleName = ["Марія", "Олена", "Анна", "Тетяна", "Наталія", "Ірина", "Світлана", "Катерина", "Юлія", "Ольга"];
const randomLastName = ["Шевченко", "Мельник", "Ковальчук", "Бондаренко", "Ткаченко", "Кравченко", "Олійник", "Поліщук", "Іванов", "Петренко"];
const randomPatronymicMale = ["Іванович", "Петрович", "Олександрович", "Сергійович", "Андрійович", "Миколайович", "Васильович", "Артемович", "Максимович", "Юрійович"];
const randomPatronymicFemale = ["Іванівна", "Петрівна", "Олександрівна", "Сергіївна", "Андріївна", "Миколаївна", "Василівна", "Артемівна", "Максимівна", "Юріївна"];


const createPatientScenario = (config, patientIndex = 0) => {
    const cardId = generateShortId(`${config.triageCategory.toUpperCase().slice(0,3)}-`);
    const incidentTime = getRandomDateWithinPastHours(config.triageCategory === 'black' ? 24 : 3);
    const arrivalTime = new Date(incidentTime.getTime() + getRandomNumber(10, 45) * 60000);

    const genderOption = getRandomElement(GENDER_OPTIONS, opt => opt.value !== 'unknown');
    const gender = genderOption.value;
    let fullName;
    if (gender === 'male') {
        fullName = `${randomLastName[patientIndex % randomLastName.length]} ${randomMaleName[patientIndex % randomMaleName.length]} ${randomPatronymicMale[patientIndex % randomPatronymicMale.length]}`;
    } else {
        fullName = `${randomLastName[patientIndex % randomLastName.length]} ${randomFemaleName[patientIndex % randomFemaleName.length]} ${randomPatronymicFemale[patientIndex % randomPatronymicFemale.length]}`;
    }

    let patientApproximateAge;
    if (typeof config.age === 'number') {
        patientApproximateAge = config.age;
    } else {
        switch (config.age) {
            case 'child': patientApproximateAge = getRandomNumber(3, 12); break;
            case 'teen': patientApproximateAge = getRandomNumber(13, 17); break;
            case 'elderly': patientApproximateAge = getRandomNumber(70, 90); break;
            default: patientApproximateAge = getRandomNumber(18, 69);
        }
    }
    const patientDateOfBirthDate = new Date();
    patientDateOfBirthDate.setFullYear(new Date().getFullYear() - patientApproximateAge);
    patientDateOfBirthDate.setMonth(getRandomNumber(0,11));
    patientDateOfBirthDate.setDate(getRandomNumber(1,28));
    const patientDateOfBirth = formatDateLocal(patientDateOfBirthDate);

    let scenarioName = config.scenarioName || "";
    if (scenarioName.toLowerCase().includes("невідом")) {
        fullName = gender === 'male' ? `Невідомий Чоловік, ${patientApproximateAge}р.` : `Невідома Жінка, ${patientApproximateAge}р.`;
        scenarioName = scenarioName.replace(/чоловік|жінка|пацієнт \d+ років/gi, '').trim();
        scenarioName = `${gender === 'male' ? 'Невідомий чоловік' : 'Невідома жінка'} ${patientApproximateAge}р., ${scenarioName}`;
    } else if (config.age === 'child') {
        scenarioName = `Дитина ${patientApproximateAge}р., ${scenarioName}`;
    } else if (config.age === 'teen') {
        const teenTerm = gender === 'male' ? 'Хлопець' : 'Дівчина';
        scenarioName = `${teenTerm} ${patientApproximateAge}р., ${scenarioName}`;
    } else if (config.age === 'elderly') {
        scenarioName = `${gender === 'male' ? 'Літній чоловік' : 'Літня жінка'} ${patientApproximateAge}р., ${scenarioName}`;
    } else {
         scenarioName = `${gender === 'male' ? 'Чоловік' : 'Жінка'} ${patientApproximateAge}р., ${scenarioName}`;
    }


    let gcsEye = '4', gcsVerbal = '5', gcsMotor = '6';
    let pupilReactionValue = 'PERRLA';

    switch (config.gcsProfile) {
        case 'low':
            gcsEye = getRandomElement(GCS_EYE_OPTIONS, o => ['1', '2'].includes(o.value) && o.value !== 'NV').value;
            gcsVerbal = getRandomElement(GCS_VERBAL_OPTIONS, o => ['1', '2', '3'].includes(o.value) && o.value !== 'NV').value;
            gcsMotor = getRandomElement(GCS_MOTOR_OPTIONS, o => ['1', '2', '3', '4'].includes(o.value) && o.value !== 'NV').value;
            pupilReactionValue = getRandomElement(PUPIL_REACTION_OPTIONS, o => ['equal_sluggish', 'unequal_anisocoria', 'dilated_fixed', 'pinpoint'].includes(o.value)).value;
            break;
        case 'medium':
            gcsEye = getRandomElement(GCS_EYE_OPTIONS, o => ['2', '3'].includes(o.value) && o.value !== 'NV').value;
            gcsVerbal = getRandomElement(GCS_VERBAL_OPTIONS, o => ['3', '4'].includes(o.value) && o.value !== 'NV').value;
            gcsMotor = getRandomElement(GCS_MOTOR_OPTIONS, o => ['4', '5'].includes(o.value) && o.value !== 'NV').value;
            pupilReactionValue = getRandomElement(PUPIL_REACTION_OPTIONS, o => ['equal_sluggish', 'equal_reactive', 'unequal_anisocoria'].includes(o.value)).value;
            break;
        case 'unresponsive':
             gcsEye = '1'; gcsVerbal = '1'; gcsMotor = '1';
             pupilReactionValue = 'dilated_fixed';
            break;
    }
    const gcsTotal = parseInt(gcsEye) + parseInt(gcsVerbal) + parseInt(gcsMotor);

    let airwayStatus = 'clear_open_spontaneous', breathingRate = '13-20', oxygenSaturation = '>=94',
        breathingQuality = 'normal_effortless_symmetric', chestExcursion = 'symmetric_adequate', auscultationLungs = 'clear_bilaterally',
        pulseRate = '60-100', pulseQuality = 'strong_regular', pulseLocation = 'radial',
        bloodPressureSystolic = getRandomNumber(110, 140).toString(), bloodPressureDiastolic = getRandomNumber(70, 90).toString(),
        capillaryRefillTime = '<2', skinStatus = 'pink_warm_dry', externalBleeding = 'none_visible',
        catastrophicHemorrhageControlled = false, catastrophicHemorrhageDetails = '';

    switch (config.abcProfile) {
        case 'critical':
            airwayStatus = getRandomElement(AIRWAY_STATUS_OPTIONS, o => ['fully_obstructed', 'partially_obstructed_foreign_body', 'secured_advanced_device'].includes(o.value)).value;
            breathingRate = getRandomElement(BREATHING_RATE_OPTIONS, o => ['0', '1-5', '>30'].includes(o.value)).value;
            breathingQuality = getRandomElement(BREATHING_QUALITY_OPTIONS, o => ['agonal_gasping', 'apneic_no_effort', 'paradoxical_chest_movement'].includes(o.value)).value;
            oxygenSaturation = getRandomElement(OXYGEN_SATURATION_OPTIONS, o => ['<85', '85-89', 'unable'].includes(o.value)).value;
            chestExcursion = getRandomElement(CHEST_EXCURSION_OPTIONS, o => ['asymmetric', 'absent', 'paradoxical_chest_movement'].includes(o.value)).value;
            auscultationLungs = getRandomElement(AUSCULTATION_LUNGS_OPTIONS, o => o.value.includes('absent_') || o.value === 'crackles_rales').value;
            pulseRate = getRandomElement(PULSE_RATE_OPTIONS, o => ['0', '<40', '>150'].includes(o.value)).value;
            pulseQuality = getRandomElement(PULSE_QUALITY_OPTIONS, o => ['absent_peripheral', 'absent_central', 'weak_irregular'].includes(o.value)).value;
            pulseLocation = pulseQuality.includes('absent_peripheral') || pulseQuality.includes('absent_central') ? 'carotid' : 'femoral';
            bloodPressureSystolic = getRandomNumber(40, 70).toString();
            bloodPressureDiastolic = getRandomNumber(20, 50).toString();
            capillaryRefillTime = '>3';
            skinStatus = 'pale_cool_clammy';
            externalBleeding = getRandomElement(EXTERNAL_BLEEDING_OPTIONS, o => ['severe_arterial_pulsating', 'internal_suspected'].includes(o.value)).value;
            if (externalBleeding === 'severe_arterial_pulsating') {
                catastrophicHemorrhageControlled = Math.random() < 0.7;
                catastrophicHemorrhageDetails = `Масивна артеріальна кровотеча з ${getRandomElement(['стегна', 'плеча'])}. ${catastrophicHemorrhageControlled ? 'Накладено турнікет, кровотеча зупинена.' : 'Спроба зупинки кровотечі джгутом, неефективно.'}`;
            }
            if (gcsTotal < 9) {
                 pupilReactionValue = getRandomElement(PUPIL_REACTION_OPTIONS, o => ['dilated_fixed', 'equal_nonreactive', 'pinpoint', 'unequal_anisocoria'].includes(o.value)).value;
            }
            break;
        case 'unstable':
            airwayStatus = getRandomElement(AIRWAY_STATUS_OPTIONS, o => ['partially_obstructed_tongue', 'clear_maintained_manual', 'clear_maintained_device'].includes(o.value)).value;
            breathingRate = getRandomElement(BREATHING_RATE_OPTIONS, o => ['6-9', '25-30'].includes(o.value)).value;
            breathingQuality = getRandomElement(BREATHING_QUALITY_OPTIONS, o => ['shallow_rapid', 'deep_labored_accessory_muscles'].includes(o.value)).value;
            oxygenSaturation = getRandomElement(OXYGEN_SATURATION_OPTIONS, o => ['85-89', '90-93'].includes(o.value)).value;
            chestExcursion = getRandomElement(CHEST_EXCURSION_OPTIONS, o => ['symmetric_reduced', 'asymmetric'].includes(o.value)).value;
            auscultationLungs = getRandomElement(AUSCULTATION_LUNGS_OPTIONS, o => o.value.includes('reduced_') || o.value === 'wheezes_rhonchi').value;
            pulseRate = getRandomElement(PULSE_RATE_OPTIONS, o => ['40-59', '101-120', '121-150'].includes(o.value)).value;
            pulseQuality = 'weak_regular';
            bloodPressureSystolic = getRandomNumber(70, 90).toString();
            bloodPressureDiastolic = getRandomNumber(40, 60).toString();
            capillaryRefillTime = '2-3';
            skinStatus = getRandomElement(SKIN_STATUS_OPTIONS, o => ['pale_cool_clammy', 'pale_warm_dry'].includes(o.value)).value;
            externalBleeding = getRandomElement(EXTERNAL_BLEEDING_OPTIONS, o => ['moderate_venous', 'internal_suspected'].includes(o.value)).value;
            if (gcsTotal < 12) {
                 pupilReactionValue = getRandomElement(PUPIL_REACTION_OPTIONS, o => ['equal_sluggish', 'unequal_anisocoria'].includes(o.value)).value;
            }
            break;
        case 'compromised':
            if (Math.random() < 0.5) {
                airwayStatus = getRandomElement(AIRWAY_STATUS_OPTIONS, o => o.value === 'partially_obstructed_tongue' || o.value === 'clear_maintained_device').value;
                breathingRate = '21-24';
                breathingQuality = 'deep_labored_accessory_muscles';
                oxygenSaturation = '90-93';
            } else {
                pulseRate = '101-120';
                bloodPressureSystolic = getRandomNumber(90, 105).toString();
                capillaryRefillTime = '2-3';
                skinStatus = 'pale_warm_dry';
                externalBleeding = 'minor_capillary';
            }
            break;
    }

    if (config.triageCategory === 'black') {
        airwayStatus = 'fully_obstructed'; breathingRate = '0'; oxygenSaturation = 'unable';
        pulseRate = '0'; pulseQuality = 'absent_central'; bloodPressureSystolic = '0'; bloodPressureDiastolic = '0';
        gcsEye = '1'; gcsVerbal = '1'; gcsMotor = '1';
        skinStatus = getRandomElement(SKIN_STATUS_OPTIONS, o => ['cyanotic_central', 'mottled', 'pale_cool_clammy'].includes(o.value)).value;
        pupilReactionValue = 'dilated_fixed';
        externalBleeding = 'none_visible';
        catastrophicHemorrhageControlled = false;
    }

    let currentExposureDetails = scenarioName; // Використовуємо адаптований scenarioName для побудови деталей огляду
    let mechanismOfInjuryDetailed = "";

    switch (config.injuryProfile) {
        case 'severe_penetrating':
            currentExposureDetails += ` Виявлено множинні проникаюче поранення тулуба та кінцівок. ${getRandomElement([
                'Вогнепальне поранення грудної клітки зліва, виражена підшкірна емфізема, ослаблене дихання зліва. ',
                'Ножове поранення живота в епігастрії, евентрація петель кишківника. ',
            ])}`;
            mechanismOfInjuryDetailed = "Напад із застосуванням вогнепальної/холодної зброї.";
            break;
        case 'severe_blunt_polytrauma':
            currentExposureDetails += ` Пацієнт після ДТП (водій, не пристебнутий) / падіння з висоти (>5м). ${getRandomElement([
                'Деформація лівого стегна та тазу, крепітація. Нестабільність тазу при пальпації. Гематома в поперековій ділянці. ',
                'Забій голови, рана тім\'яної ділянки. Деформація грудної клітки справа, парадоксальне дихання. Живіт напружений, болючий. ',
            ])}`;
            mechanismOfInjuryDetailed = "Високоенергетична тупа травма (ДТП, падіння з висоти).";
            break;
        case 'moderate_fracture':
            currentExposureDetails += ` Виявлено ${getRandomElement([
                'закритий перелом кісток лівого передпліччя в середній третині зі зміщенням, набряк, деформація. ',
                'відкритий перелом правої гомілки в нижній третині, рана ~3см, помірна кровотеча. ',
                'закритий перелом ключиці справа, деформація, обмеження рухів в плечовому суглобі. '
            ])}`;
            mechanismOfInjuryDetailed = "Падіння на витягнуту руку / прямий удар.";
            break;
        case 'minor_soft_tissue':
            currentExposureDetails += ` Незначні ушкодження: ${getRandomElement([
                'множинні садна та подряпини верхніх та нижніх кінцівок. ',
                'забій м\'яких тканин правого плеча, невелика гематома. ',
                'неглибока різана рана долоні лівої кисті ~2см, капілярна кровотеча. '
            ])}`;
            mechanismOfInjuryDetailed = "Побутова травма / падіння на рівній поверхні.";
            break;
        case 'fatal':
            currentExposureDetails += ` Травми, несумісні з життям: ${getRandomElement([
                'відкрита ЧМТ з випадінням мозкової речовини. ',
                'декапітація / масивне руйнування тулуба. ',
                'обвуглення тіла >90% поверхні. '
            ])}`;
            mechanismOfInjuryDetailed = "Надзвичайна подія з масивними руйнуваннями.";
            break;
        default:
            currentExposureDetails += " Типові ушкодження для даної категорії.";
    }

    if (config.exposureDetailsOverride) {
        let overrideText = config.exposureDetailsOverride;

        // Заміна плейсхолдерів на актуальні дані
        overrideText = overrideText.replace(/{AGE}/gi, patientApproximateAge.toString());

        const genderNominativeCapitalized = gender === 'male' ? 'Чоловік' : 'Жінка';
        const genderNominativeLower = gender === 'male' ? 'чоловік' : 'жінка';
        const teenTermCapitalized = gender === 'male' ? 'Хлопець' : 'Дівчина';
        // Додайте інші форми гендерних плейсхолдерів за потреби

        overrideText = overrideText.replace(/{GENDER_NOMINATIVE_CAPITALIZED}/g, genderNominativeCapitalized);
        overrideText = overrideText.replace(/{GENDER_NOMINATIVE_LOWER}/g, genderNominativeLower);
        overrideText = overrideText.replace(/{GENDER_TEEN_CAPITALIZED}/g, teenTermCapitalized);
        
        currentExposureDetails = overrideText;
    }


    const medicationsAdministered = [];
    const proceduresPerformed = [];
    const ivAccessTime = new Date(arrivalTime.getTime() + getRandomNumber(3, 8) * 60000);

    if (config.triageCategory === 'red' || (config.triageCategory === 'yellow' && config.abcProfile !== 'stable')) {
        if (config.triageCategory !== 'black') {
            proceduresPerformed.push({ name: 'В/в доступ (периферичний катетер)',customName: '', time: formatTimeLocal(ivAccessTime), details: `Катетер G${getRandomElement([18,20])} у ${getRandomElement(['ліктьовій вені справа', 'зовнішній яремній вені'])}.`, effectiveness: 'effective', customRoute: '' });
            medicationsAdministered.push({ name: getRandomElement(['Розчин NaCl 0.9%', 'Розчин Рінгера лактат']),customName: '', dosage: `${getRandomElement([250,500])} мл`, route: 'iv', customRoute: '', time: formatTimeLocal(new Date(ivAccessTime.getTime() + 1*60000)), effectiveness: 'partially_effective'});

            if (gcsTotal < 13 || parseInt(bloodPressureSystolic) < 90 || config.injuryProfile?.includes('severe')) {
                medicationsAdministered.push({ name: 'Кислота транексамова',customName: '', dosage: '1 г', route: 'iv', customRoute: '', time: formatTimeLocal(new Date(ivAccessTime.getTime() + 2*60000)), effectiveness: 'not_assessed' });
            }
            if (currentExposureDetails.toLowerCase().includes('біль') || (gcsTotal > 8 && gcsTotal < 15 && config.injuryProfile !== 'minor_soft_tissue')) {
                const analgetic = getRandomElement(['Кеторолак (Кетанов)', 'Морфін', 'Фентаніл'], med => config.abcProfile !== 'critical' || med !== 'Морфін');
                const dosage = analgetic === 'Кеторолак (Кетанов)' ? '30мг' : (analgetic === 'Морфін' ? '5мг' : '50мкг');
                medicationsAdministered.push({ name: analgetic,customName: '', dosage: dosage, route: 'iv', customRoute: '', time: formatTimeLocal(new Date(ivAccessTime.getTime() + 3*60000)), effectiveness: 'effective' });
            }
        }
    }
    if (airwayStatus !== 'clear_open_spontaneous' && airwayStatus !== 'unknown' && config.triageCategory !== 'black') {
        proceduresPerformed.push({ name: 'Аспірація вмісту з дихальних шляхів',customName: '', time: formatTimeLocal(new Date(arrivalTime.getTime() + 1 * 60000)), details: 'Аспіровано невелику кількість секрету.', effectiveness: 'effective' });
        if (airwayStatus === 'secured_advanced_device') {
            proceduresPerformed.push({ name: 'Інтубація трахеї',customName: '', time: formatTimeLocal(new Date(arrivalTime.getTime() + 5 * 60000)), details: 'ЕТТ №7.5, фіксована на 22см.', effectiveness: 'effective' });
        }
    }
    const oxygenSaturationValue = parseFloat(String(oxygenSaturation).replace(/[<>=%]/g, ''));
    if ((!isNaN(oxygenSaturationValue) && oxygenSaturationValue < 94 || oxygenSaturation === 'unable') && config.triageCategory !== 'black') {
        proceduresPerformed.push({ name: 'Оксигенотерапія (маска, канюлі)',customName: '', time: formatTimeLocal(new Date(arrivalTime.getTime() + 1 * 60000)), details: `Маска з резервуаром, O2 ${getRandomElement([10,12,15])} л/хв.`, effectiveness: 'partially_effective' });
    }
     if (catastrophicHemorrhageControlled && externalBleeding === 'severe_arterial_pulsating') {
         proceduresPerformed.unshift({
            name: 'Зупинка зовнішньої кровотечі (джгут, тиснуча пов\'язка)',customName: '',
            time: formatTimeLocal(new Date(arrivalTime.getTime() - getRandomNumber(1,5) * 60000)),
            details: catastrophicHemorrhageDetails,
            effectiveness: 'effective'
        });
    }
    if ((config.injuryProfile === 'moderate_fracture' || config.injuryProfile === 'severe_blunt_polytrauma') && config.triageCategory !== 'black') {
        proceduresPerformed.push({name: 'Іммобілізація шийна/кінцівок',customName: '', time: formatTimeLocal(new Date(arrivalTime.getTime() + 10 * 60000)), details: `Іммобілізовано ${currentExposureDetails.toLowerCase().includes('стегна') || currentExposureDetails.toLowerCase().includes('гомілки') ? 'нижню кінцівку' : (currentExposureDetails.toLowerCase().includes('передпліччя') || currentExposureDetails.toLowerCase().includes('плеча') ? 'верхню кінцівку' : 'шию')} шиною.`, effectiveness: 'effective'});
    }

    const finalGcsTotal = (config.triageCategory === 'black') ? 3 : parseInt(gcsEye) + parseInt(gcsVerbal) + parseInt(gcsMotor);

    return {
        ...JSON.parse(JSON.stringify(INITIAL_PRE_HOSPITAL_FORM_DATA)),
        _id: cardId,
        cardId: cardId,
        status: config.triageCategory === 'black' ? 'Closed' : 'PreHospitalActive',

        incidentDateTime: formatDateTimeLocal(incidentTime),
        arrivalDateTime: formatDateTimeLocal(arrivalTime),
        sceneTypeValue: getRandomElement(SCENE_TYPE_OPTIONS, o => o.value !== 'other' && o.value !== 'unknown').value,
        sceneTypeOther: '',
        patientFullName: fullName,
        patientGender: gender,
        patientDateOfBirth: patientDateOfBirth,
        patientApproximateAge: patientApproximateAge.toString(),
        catastrophicHemorrhageControlled: catastrophicHemorrhageControlled,
        catastrophicHemorrhageDetails: catastrophicHemorrhageDetails,

        airwayStatus: airwayStatus,
        breathingRate: breathingRate,
        oxygenSaturation: oxygenSaturation,
        breathingQuality: breathingQuality,
        chestExcursion: chestExcursion,
        auscultationLungs: auscultationLungs,
        pulseRate: pulseRate,
        pulseQuality: pulseQuality,
        pulseLocation: pulseLocation,
        bloodPressureSystolic: bloodPressureSystolic,
        bloodPressureDiastolic: bloodPressureDiastolic,
        capillaryRefillTime: capillaryRefillTime,
        skinStatus: skinStatus,
        externalBleeding: externalBleeding,
        glasgowComaScaleEye: gcsEye,
        glasgowComaScaleVerbal: gcsVerbal,
        glasgowComaScaleMotor: gcsMotor,
        gcsTotal: finalGcsTotal,
        pupilReaction: pupilReactionValue,
        motorSensoryStatus: finalGcsTotal < 13 || config.injuryProfile?.includes('severe') && config.triageCategory !== 'black' ? getRandomElement(MOTOR_SENSORY_STATUS_OPTIONS, o => o.value !== 'intact_all_extremities').value : (config.triageCategory === 'black' ? 'unable_to_assess' : 'intact_all_extremities'),
        neurologicalStatusDetails: finalGcsTotal < 10 && config.triageCategory !== 'black' ? 'Виражений неврологічний дефіцит.' : (finalGcsTotal < 15 && config.triageCategory !== 'black' ? 'Легке пригнічення свідомості.' : ''),
        bodyTemperature: config.triageCategory === 'black' ? 'unable' : (config.abcProfile === 'critical' || parseFloat(bloodPressureSystolic) < 80 ? '<35' : (parseFloat(bloodPressureSystolic) < 100 ? '35.0-36.0' : '36.1-37.2')),
        exposureDetails: currentExposureDetails,

        complaints: finalGcsTotal > 12 && config.triageCategory !== 'green' && config.triageCategory !== 'black' ? `Сильний біль в ділянці травми, запаморочення, слабкість.` : (finalGcsTotal > 8 && config.triageCategory !== 'black' ? 'Скарги невиразні / сплутані.' : (config.triageCategory !== 'black' ? 'Без свідомості.' : '')),
        mechanismOfInjuryDetailed: mechanismOfInjuryDetailed,

        medicationsAdministered: medicationsAdministered,
        proceduresPerformed: proceduresPerformed,
        ivAccessDetails: proceduresPerformed.some(p => p.name.toLowerCase().includes('в/в доступ')) ? proceduresPerformed.find(p => p.name.toLowerCase().includes('в/в доступ')).details : '',

        transportationMethod: config.triageCategory === 'black' ? 'not_transported' : 'emd_c',
        transportationOtherDetails: '',
        destinationFacility: config.triageCategory === 'black' ? '' : `Обласна клінічна лікарня, ${config.triageCategory === 'red' ? 'Відділення політравми/Реанімація' : 'Приймальне відділення'}`,

        triageCategory: config.triageCategory,
        // additionalNotes: scenarioName, 
        medicalTeamResponsible: `Бригада №${getRandomNumber(10, 99)} (Лікар ${randomLastName[(patientIndex + 2) % randomLastName.length]})`,
        patientInfo: { 
            patientFullName: fullName,
            patientGender: gender,
            patientDateOfBirth: patientDateOfBirth,
            patientApproximateAge: patientApproximateAge.toString(),
        }
    };
};

export const realisticPatientScenarios = [
    // --- RED CATEGORY ---
    createPatientScenario({
        triageCategory: 'red', age: 35, gcsProfile: 'low', abcProfile: 'critical', injuryProfile: 'severe_penetrating',
        scenarioName: "Вогнепальне поранення грудей та живота, шок III ст."
    }, 0),
    createPatientScenario({
        triageCategory: 'red', age: 'elderly', gcsProfile: 'medium', abcProfile: 'unstable', injuryProfile: 'severe_blunt_polytrauma',
        scenarioName: "ДТП, політравма (ЧМТ, перелом тазу), геморагічний шок"
    }, 1),
    createPatientScenario({
        triageCategory: 'red', age: 'child', gcsProfile: 'medium', abcProfile: 'critical', injuryProfile: 'severe_blunt_polytrauma',
        scenarioName: "Падіння з висоти, ЧМТ, травма живота, напружений пневмоторакс"
    }, 2),
    createPatientScenario({
        triageCategory: 'red', age: 28, gcsProfile: 'high', abcProfile: 'stable', injuryProfile: 'severe_penetrating',
        scenarioName: "Ножове поранення стегна з пошкодженням артерії (тимчасово компенсований)",
        exposureDetailsOverride: "{GENDER_NOMINATIVE_CAPITALIZED} {AGE} років. Ножове поранення верхньої третини правого стегна. На місці події значна калюжа крові. При огляді - рана ~4см, пульсуюча кровотеча зупинена тиском руки та імпровізованим джгутом з ременя. Пульс на стопі справа слабкий. Шкіра бліда. Свідомість ясна, GCS 15. АТ 100/60, ЧСС 110. SpO2 96% на повітрі. Очікується швидка декомпенсація."
    }, 3),
     createPatientScenario({
        triageCategory: 'red', age: 68, gcsProfile: 'medium', abcProfile: 'unstable', injuryProfile: 'moderate_fracture',
        scenarioName: "Падіння, перелом стегна, декомпенсація кардіального статусу",
        exposureDetailsOverride: "{GENDER_NOMINATIVE_CAPITALIZED} {AGE} років, впала вдома. Скарги на сильний біль в правому кульшовому суглобі, неможливість стати на ногу. Права нога ротована назовні, вкорочена. Набряк, гематома. АТ 80/50, ЧСС 120, аритмія. Шкіра бліда, холодна. SpO2 91%. GCS 13 (E3V4M6). Супутньо: ІХС, Фібриляція передсердь, Гіпертонічна хвороба."
    }, 4),

    // --- YELLOW CATEGORY ---
    createPatientScenario({
        triageCategory: 'yellow', age: 45, gcsProfile: 'high', abcProfile: 'stable', injuryProfile: 'moderate_fracture',
        scenarioName: "Закритий перелом променевої кістки типовому місці зі зміщенням"
    }, 5),
    createPatientScenario({
        triageCategory: 'yellow', age: 'teen', gcsProfile: 'high', abcProfile: 'compromised',
        injuryProfile: 'minor_soft_tissue', scenarioName: "Забій, напад астми середньої тяжкості",
        exposureDetailsOverride: "{GENDER_TEEN_CAPITALIZED} {AGE} років, впав з велосипеда, забій правого коліна. Скарги на біль в коліні та утруднене дихання, що з'явилось через 5 хв після падіння. Відомо, що хворіє на бронхіальну астму. Дихання шумне, свистяче, подовжений видих. ЧД 26/хв. SpO2 92%. АТ 130/80, ЧСС 90. GCS 15. Введено Сальбутамол інгаляційно - частковий ефект."
    }, 6),
    createPatientScenario({
        triageCategory: 'yellow', age: 50, gcsProfile: 'medium', abcProfile: 'stable', injuryProfile: 'moderate_fracture',
        scenarioName: "Струс головного мозку, перелом 1-2 ребер без зміщення, алкогольне сп'яніння"
    }, 7),

    // --- GREEN CATEGORY ---
    createPatientScenario({
        triageCategory: 'green', age: 22, gcsProfile: 'high', abcProfile: 'stable', injuryProfile: 'minor_soft_tissue',
        scenarioName: "Неглибока різана рана передпліччя ~3см, кровотеча зупинена"
    }, 8),
    createPatientScenario({
        triageCategory: 'green', age: 60, gcsProfile: 'high', abcProfile: 'stable', injuryProfile: 'minor_soft_tissue',
        scenarioName: "Забій гомілковостопного суглоба, може ходити з кульгавістю"
    }, 9),

    // --- BLACK CATEGORY ---
    createPatientScenario({
        triageCategory: 'black', age: 'adult', gcsProfile: 'unresponsive', abcProfile: 'critical',
        injuryProfile: 'fatal', scenarioName: "Масивна ЧМТ, несумісна з життям (ДТП, видиме руйнування черепа)"
    }, 10),
    createPatientScenario({
        triageCategory: 'black', age: 40, gcsProfile: 'unresponsive', abcProfile: 'critical',
        injuryProfile: 'fatal', scenarioName: "Вибухова травма, травматична ампутація обох нижніх кінцівок на рівні стегон, агональне дихання при прибутті, потім апное, асистолія."
    }, 11),
];

export const testDataSet = realisticPatientScenarios;

export const generatePreHospitalTestData = () => {
    if (realisticPatientScenarios && realisticPatientScenarios.length > 0) {
        const randomScenario = getRandomElement(realisticPatientScenarios);
        // Глибоке копіювання, щоб уникнути модифікації оригінальних сценаріїв
        let scenarioData = JSON.parse(JSON.stringify(randomScenario)); 

        // Всі заміни плейсхолдерів тепер відбуваються всередині createPatientScenario,
        // тому тут додаткова обробка scenarioData.exposureDetails або additionalNotes не потрібна.
        // scenarioName (і, відповідно, additionalNotes) вже адаптований.
        // exposureDetails також адаптований або замінений через override.

        return scenarioData;
    }
    console.warn("Fallback: generating a very basic scenario for test data.");
    // Fallback scenario на випадок, якщо realisticPatientScenarios порожній
    return createPatientScenario({
        triageCategory: 'yellow', age: 30, gcsProfile: 'high',
        abcProfile: 'stable', injuryProfile: 'minor_soft_tissue',
        scenarioName: "Випадковий базовий сценарій (fallback)"
    });
};