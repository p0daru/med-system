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
    COMMON_PREHOSPITAL_PROCEDURES
} from './patientCardConstants'; // Переконайтеся, що шлях правильний

const generateShortId = (prefix = 'TRM-') => {
  let result = prefix;
  const alphanumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDateWithinPastHours = (hours) => {
    const now = new Date();
    const randomMillis = Math.random() * hours * 60 * 60 * 1000;
    return new Date(now.getTime() - randomMillis);
};
const formatDateTimeLocal = (date) => {
    // Helper to format date for <input type="datetime-local">
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
const formatTimeLocal = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


export const generatePreHospitalTestData = () => {
  const cardId = generateShortId();
  const incidentTime = getRandomDateWithinPastHours(3); // Подія за останні 3 години
  const arrivalTime = new Date(incidentTime.getTime() + getRandomNumber(5, 20) * 60000); // Прибуття через 5-20 хв після події

  const randomMaleName = ["Іван", "Петро", "Олександр", "Сергій", "Андрій", "Микола", "Василь"];
  const randomFemaleName = ["Марія", "Олена", "Анна", "Тетяна", "Наталія", "Ірина", "Світлана"];
  const randomLastName = ["Шевченко", "Мельник", "Ковальчук", "Бондаренко", "Ткаченко", "Кравченко", "Олійник"];
  const randomPatronymicMale = ["Іванович", "Петрович", "Олександрович", "Сергійович", "Андрійович"];
  const randomPatronymicFemale = ["Іванівна", "Петрівна", "Олександрівна", "Сергіївна", "Андріївна"];

  const gender = getRandomElement(GENDER_OPTIONS.filter(opt => opt.value !== 'unknown' && opt.value !== 'other')).value;
  let fullName;
  if (gender === 'male') {
    fullName = `${getRandomElement(randomLastName)} ${getRandomElement(randomMaleName)} ${getRandomElement(randomPatronymicMale)}`;
  } else {
    fullName = `${getRandomElement(randomLastName)} ${getRandomElement(randomFemaleName)} ${getRandomElement(randomPatronymicFemale)}`;
  }
  if (Math.random() < 0.1) fullName = "Невідомий Чоловік"; // 10% шанс невідомого
  if (Math.random() < 0.05 && gender === 'female') fullName = "Невідома Жінка";


  const patientApproximateAge = getRandomNumber(18, 80);
  const patientDateOfBirth = new Date();
  patientDateOfBirth.setFullYear(patientDateOfBirth.getFullYear() - patientApproximateAge);
  patientDateOfBirth.setDate(getRandomNumber(1,28));
  patientDateOfBirth.setMonth(getRandomNumber(0,11));


  const hasCatastrophicBleeding = Math.random() < 0.3; // 30% шанс

  // Випадковий вибір кількох опцій для GCS
  const gcsEye = getRandomElement(GCS_EYE_OPTIONS.filter(o => o.value !== 'NV')).value;
  const gcsVerbal = getRandomElement(GCS_VERBAL_OPTIONS.filter(o => o.value !== 'NV')).value;
  const gcsMotor = getRandomElement(GCS_MOTOR_OPTIONS.filter(o => o.value !== 'NV')).value;
  
  const numMedications = getRandomNumber(0, 3);
  const medicationsAdministered = [];
  const usedMedNames = new Set();
  for (let i = 0; i < numMedications; i++) {
      let medName;
      do {
          medName = getRandomElement(COMMON_PREHOSPITAL_MEDICATIONS);
      } while (usedMedNames.has(medName));
      usedMedNames.add(medName);

      medicationsAdministered.push({
          name: medName,
          customName: '',
          dosage: `${getRandomNumber(1, 10)}${getRandomElement(['мг', 'мл', 'таб.'])}`,
          route: getRandomElement(MEDICATION_ROUTE_OPTIONS.filter(o => o.value !== 'custom_entry' && o.value !== 'other')).value,
          customRoute: '',
          time: formatTimeLocal(new Date(arrivalTime.getTime() + getRandomNumber(1,10) * 60000)),
          effectiveness: getRandomElement(EFFECTIVENESS_OPTIONS).value
      });
  }
  // Додамо один "інший" медикамент з 20% шансом
  if (Math.random() < 0.2 && numMedications < 3) {
      medicationsAdministered.push({
          name: 'custom_entry',
          customName: `Тестовий Препарат ${getRandomNumber(100,200)}`,
          dosage: '100 од.',
          route: 'custom_entry',
          customRoute: 'Під язик краплі',
          time: formatTimeLocal(new Date(arrivalTime.getTime() + getRandomNumber(1,10) * 60000)),
          effectiveness: 'partially_effective'
      });
  }
  // Якщо масив порожній після генерації, додаємо дефолтний порожній елемент
  if (medicationsAdministered.length === 0) {
    medicationsAdministered.push({ name: '', customName: '', dosage: '', route: '', customRoute: '', time: '', effectiveness: '' });
  }


  const numProcedures = getRandomNumber(0, 2);
  const proceduresPerformed = [];
  const usedProcNames = new Set();
  for (let i = 0; i < numProcedures; i++) {
    let procName;
    do {
        procName = getRandomElement(COMMON_PREHOSPITAL_PROCEDURES);
    } while (usedProcNames.has(procName));
    usedProcNames.add(procName);

    proceduresPerformed.push({
        name: procName,
        customName: '',
        time: formatTimeLocal(new Date(arrivalTime.getTime() + getRandomNumber(1,15) * 60000)),
        details: `Процедура виконана стандартно, реакція: ${getRandomElement(['стабільна', 'покращення', 'без змін'])}`,
        effectiveness: getRandomElement(EFFECTIVENESS_OPTIONS).value
    });
  }
  if (proceduresPerformed.length === 0) {
    proceduresPerformed.push({ name: '', customName: '', time: '', details: '', effectiveness: '' });
  }


  return {
    ...JSON.parse(JSON.stringify(INITIAL_PRE_HOSPITAL_FORM_DATA)), // Починаємо з чистого INITIAL_PRE_HOSPITAL_FORM_DATA
    cardId: cardId,
    _id: cardId, // Для імітації ID з бази даних при "редагуванні" тестових даних

    incidentDateTime: formatDateTimeLocal(incidentTime),
    arrivalDateTime: formatDateTimeLocal(arrivalTime),
    sceneTypeValue: getRandomElement(SCENE_TYPE_OPTIONS.filter(o => o.value !== 'other' && o.value !== 'unknown')).value,
    sceneTypeOther: '',
    patientFullName: fullName,
    patientGender: gender,
    patientDateOfBirth: Math.random() < 0.8 ? formatDateLocal(patientDateOfBirth) : '', // 80% шанс вказати дату
    patientApproximateAge: Math.random() < 0.8 && !patientDateOfBirth ? patientApproximateAge.toString() : '',

    catastrophicHemorrhageControlled: hasCatastrophicBleeding,
    catastrophicHemorrhageDetails: hasCatastrophicBleeding ? `Масивна кровотеча з ${getRandomElement(['стегна', 'плеча', 'передпліччя'])}. Накладено турнікет CAT G7 о ${formatTimeLocal(new Date(arrivalTime.getTime() - 2 * 60000))}. Кровотеча зупинена.` : '',

    consciousnessLevel: getRandomElement(CONSCIOUSNESS_LEVELS_AVPU).value, 
    airwayStatus: getRandomElement(AIRWAY_STATUS_OPTIONS).value, 
    
    breathingRate: getRandomElement(BREATHING_RATE_OPTIONS.filter(o => o.value !== 'custom')).value, 
    breathingSaturation: getRandomElement(OXYGEN_SATURATION_OPTIONS.filter(o => o.value !== 'custom')).value, 
    breathingQuality: getRandomElement(BREATHING_QUALITY_OPTIONS).value,
    chestExcursion: getRandomElement(CHEST_EXCURSION_OPTIONS).value, 
    auscultationLungs: getRandomElement(AUSCULTATION_LUNGS_OPTIONS).value, 
    
    pulseRate: getRandomElement(PULSE_RATE_OPTIONS.filter(o => o.value !== 'custom')).value, 
    pulseQuality: getRandomElement(PULSE_QUALITY_OPTIONS).value,
    pulseLocation: getRandomElement(PULSE_LOCATION_OPTIONS).value, 
    bloodPressureSystolic: getRandomNumber(70, 180).toString(), 
    bloodPressureDiastolic: getRandomNumber(40, 110).toString(), 
    capillaryRefillTime: getRandomElement(CAPILLARY_REFILL_TIME_OPTIONS).value, 
    skinStatus: getRandomElement(SKIN_STATUS_OPTIONS).value,
    externalBleeding: getRandomElement(EXTERNAL_BLEEDING_OPTIONS).value, 

    glasgowComaScaleEye: gcsEye, 
    glasgowComaScaleVerbal: gcsVerbal, 
    glasgowComaScaleMotor: gcsMotor, 
    pupilReaction: getRandomElement(PUPIL_REACTION_OPTIONS).value,
    motorSensoryStatus: getRandomElement(MOTOR_SENSORY_STATUS_OPTIONS).value, 
    neurologicalStatusDetails: Math.random() < 0.2 ? `Спостерігався короткочасний епізод ${getRandomElement(['тремору', 'судом', 'сплутаності'])}.` : '',

    bodyTemperature: getRandomElement(BODY_TEMPERATURE_OPTIONS.filter(o => o.value !== 'custom')).value, 
    exposureDetails: `Пацієнт знайдений ${getRandomElement(['на вулиці', 'в приміщенні', 'в автомобілі'])}. ${getRandomElement(['Одяг відповідний погоді.', 'Одяг мокрий.', 'Ознаки переохолодження/перегріву.'])} Виявлено: ${getRandomElement(['забій голови', 'рвана рана передпліччя', 'підозра на перелом гомілки', 'множинні садна'])}.`,

    complaints: Math.random() < 0.7 ? `Біль в ${getRandomElement(['голові', 'грудях', 'животі', 'нозі', 'руці'])}, ${getRandomElement(['нудота', 'запаморочення', 'слабкість'])}` : 'Скарг активно не пред\'являє (стан важкий).',
    allergies: Math.random() < 0.15 ? `Алергія на ${getRandomElement(['пеніцилін', 'йод', 'цитрусові'])}` : 'Алергоанамнез не обтяжений.',
    medicationsTaken: Math.random() < 0.2 ? `${getRandomElement(['Еналаприл', 'Бісопролол', 'Метформін'])} ${getRandomNumber(5,10)}мг ${getRandomElement(['вранці', 'двічі на день'])}` : 'Постійно ліків не приймає.',
    pastMedicalHistory: Math.random() < 0.25 ? `${getRandomElement(['Гіпертонічна хвороба', 'ІХС', 'Цукровий діабет 2 типу', 'Бронхіальна астма'])}` : 'Хронічні захворювання заперечує.',
    lastOralIntakeMeal: Math.random() < 0.6 ? `${getRandomElement(['Суп', 'Каша', 'Бутерброд'])}` : 'Не їв сьогодні.',
    lastOralIntakeTime: Math.random() < 0.6 ? formatTimeLocal(new Date(incidentTime.getTime() - getRandomNumber(1,4)*60*60000)) : '',
    eventsLeadingToInjury: `Зі слів ${getRandomElement(['самого пацієнта', 'свідків', 'родичів'])}: ${getRandomElement(['впав', 'потрапив у ДТП', 'отримав удар'])}`,
    mechanismOfInjuryDetailed: `Механізм: ${getRandomElement(SCENE_TYPE_OPTIONS.filter(o => o.value !== 'other' && o.value !== 'unknown')).label}. Деталі: ... (потрібно додати більш специфічну генерацію)`,

    medicationsAdministered: medicationsAdministered,
    proceduresPerformed: proceduresPerformed,
    ivAccessDetails: numMedications > 0 && medicationsAdministered.some(m => m.route === 'iv' || m.route === 'io') ? `Катетер G${getRandomElement([18,20,22])} у ${getRandomElement(['ліктьовій вені справа', 'ліктьовій вені зліва', 'кисті'])}. Інфузія ${getRandomElement(['NaCl 0.9%', 'Р-н Рінгера'])} ${getRandomElement([200,400,500])} мл.` : (Math.random() < 0.3 ? 'Спроба в/в доступу невдала.' : ''),

    transportationMethod: getRandomElement(TRANSPORTATION_METHOD_OPTIONS.filter(o => o.value !== 'other' && o.value !== 'not_transported')).value,
    transportationOtherDetails: '',
    destinationFacility: `Міська лікарня №${getRandomNumber(1,5)}, ${getRandomElement(['Приймальне відділення', 'Відділення політравми', 'Реанімація'])}`,

    triageCategory: getRandomElement(TRIAGE_CATEGORIES_OPTIONS.filter(o => o.value !== 'unknown')).value,
    // rtsScore - розрахується автоматично у формі
    additionalNotes: Math.random() < 0.3 ? `Пацієнт ${getRandomElement(['збуджений', 'заторможений', 'агресивний'])}. ${getRandomElement(['Запах алкоголю з рота.', ''])}` : '',
    medicalTeamResponsible: `${getRandomElement(['Лікар', 'Фельдшер'])} ${getRandomElement(randomLastName)} ${getRandomElement(randomMaleName).charAt(0)}.${getRandomElement(randomPatronymicMale).charAt(0)}.`,
  };
};