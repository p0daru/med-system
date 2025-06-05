// Дані пацієнтів (додамо ID для зручності)
const patient1 = {
  id: 'P1',
  patientFullName: 'Петренко Іван Васильович', patientGender: 'male', patientApproximateAge: '35', sceneTypeValue: 'dtp_driver_passenger',
  airwayStatus: 'partially_obstructed_tongue', consciousnessLevel: 'P',
  breathingRate: '>30', breathingSaturation: '<85', breathingQuality: 'shallow_rapid', chestExcursion: 'asymmetric', auscultationLungs: 'absent_left',
  pulseRate: '>150', pulseQuality: 'weak_regular', pulseLocation: 'carotid', capillaryRefillTime: '>3', skinStatus: 'pale_cool_clammy', externalBleeding: 'moderate_venous',
  glasgowComaScaleEye: '2', glasgowComaScaleVerbal: '2', glasgowComaScaleMotor: '3', pupilReaction: 'unequal_anisocoria', motorSensoryStatus: "deficit_lower_left",
  bodyTemperature: '35.0-36.0',
  medicationsAdministered: [ { name: "Розчин NaCl 0.9%", route: "iv", dose: "500ml" }, { name: "Кеторолак", route: "im", dose: "30mg" } ],
  proceduresPerformed: [ { name: "В/в доступ" }, { name: "Зупинка кровотечі (пов'язка)" }, { name: "Декомпресія напруженого пневмотораксу (голкова)" } ],
  triageCategory: 'red',
};
const patient2 = {
  id: 'P2',
  patientFullName: 'Сидоренко Марія Петрівна', patientGender: 'female', patientApproximateAge: '68', sceneTypeValue: 'other', sceneTypeOther: 'Гострий стан вдома',
  airwayStatus: 'clear_open_spontaneous', consciousnessLevel: 'V',
  breathingRate: '25-30', breathingSaturation: '85-89', breathingQuality: 'noisy_gurgling_crackles', chestExcursion: 'symmetric_reduced', auscultationLungs: 'crackles_rales',
  pulseRate: '121-150', pulseQuality: 'weak_irregular', pulseLocation: 'radial', bloodPressureSystolic: '80', bloodPressureDiastolic: '50', capillaryRefillTime: '>3', skinStatus: 'pale_cool_clammy', externalBleeding: 'none_visible',
  glasgowComaScaleEye: '3', glasgowComaScaleVerbal: '4', glasgowComaScaleMotor: '5', pupilReaction: 'equal_reactive', motorSensoryStatus: "intact_all_extremities",
  bodyTemperature: '36.1-37.2',
  medicationsAdministered: [ { name: "Аспірин", route: "po", dose: "300mg" }, { name: "Нітрогліцерин", route: "sl", dose: "1 таб" }, { name: "Морфін", route: "iv", dose: "2mg" } ],
  proceduresPerformed: [ { name: "Оксигенотерапія (маска)" }, { name: "В/в доступ" }, { name: "ЕКГ моніторинг" } ],
  triageCategory: 'red',
};
const patient3 = {
  id: 'P3',
  patientFullName: 'Коваленко Артем Сергійович', patientGender: 'male', patientApproximateAge: '5', sceneTypeValue: 'other', sceneTypeOther: 'Алергічна реакція на укус комахи',
  airwayStatus: 'partially_obstructed_foreign_body', consciousnessLevel: 'V',
  breathingRate: '>30', breathingSaturation: '90-93', breathingQuality: 'noisy_stridor', chestExcursion: 'symmetric_adequate', auscultationLungs: 'wheezes_rhonchi',
  pulseRate: '>150', pulseQuality: 'weak_regular', pulseLocation: 'brachial', capillaryRefillTime: '2-3', skinStatus: 'flushed_hot_moist', externalBleeding: 'none_visible',
  glasgowComaScaleEye: '3', glasgowComaScaleVerbal: '2', glasgowComaScaleMotor: '4', pupilReaction: 'equal_reactive', motorSensoryStatus: "intact_all_extremities",
  bodyTemperature: '37.3-38.0',
  medicationsAdministered: [ { name: "Адреналін (Епінефрин)", route: "im", dose: "0.15mg" } ],
  proceduresPerformed: [ { name: "Оксигенотерапія" } ],
  triageCategory: 'red',
};
const patient4 = {
  id: 'P4',
  patientFullName: 'Шевченко Олег Ігорович', patientGender: 'male', patientApproximateAge: '28', sceneTypeValue: 'assault_penetrating',
  airwayStatus: 'clear_open_spontaneous', consciousnessLevel: 'A',
  breathingRate: '25-30', breathingSaturation: '85-89', breathingQuality: 'deep_labored_accessory_muscles', chestExcursion: 'asymmetric', auscultationLungs: 'reduced_right',
  pulseRate: '121-150', pulseQuality: 'strong_regular', pulseLocation: 'radial', capillaryRefillTime: '<2', skinStatus: 'pale_warm_dry', externalBleeding: 'moderate_venous',
  glasgowComaScaleEye: '4', glasgowComaScaleVerbal: '5', glasgowComaScaleMotor: '6', pupilReaction: 'PERRLA', motorSensoryStatus: "intact_all_extremities",
  bodyTemperature: '36.1-37.2',
  medicationsAdministered: [ { name: "Кеторолак", route: "im", dose: "30mg" } ],
  proceduresPerformed: [ { name: "Оклюзійна пов'язка (при пневмотораксі)" }, { name: "Оксигенотерапія" } ],
  triageCategory: 'red',
};
const patient5 = {
  id: 'P5',
  patientFullName: 'Мельник Тетяна Олегівна', patientGender: 'female', patientApproximateAge: '42', sceneTypeValue: 'fall_height',
  airwayStatus: 'secured_advanced_device', consciousnessLevel: 'U',
  breathingRate: '10-12', breathingSaturation: '>=94', breathingQuality: 'apneic_no_effort', chestExcursion: 'symmetric_adequate', auscultationLungs: 'clear_bilaterally',
  pulseRate: '<40', pulseQuality: 'strong_regular', pulseLocation: 'carotid', bloodPressureSystolic: '170', bloodPressureDiastolic: '100', capillaryRefillTime: '2-3', skinStatus: 'pink_warm_dry', externalBleeding: 'minor_capillary',
  glasgowComaScaleEye: '1', glasgowComaScaleVerbal: 'NV', glasgowComaScaleMotor: '2', pupilReaction: 'dilated_fixed', motorSensoryStatus: "tetraplegia",
  bodyTemperature: '>38.0',
  medicationsAdministered: [ { name: "Манітол (якщо є набряк мозку)", route: "iv", dose: "1г/кг" }, { name: "Дексаметазон", route: "iv", dose: "8мг" } ],
  proceduresPerformed: [ { name: "Інтубація трахеї" }, { name: "ШВЛ" }, { name: "Іммобілізація шийна" }, { name: "В/в доступ" } ],
  triageCategory: 'red',
};
const patient6 = {
  id: 'P6',
  patientFullName: 'Бондаренко Галина Іванівна', patientGender: 'female', patientApproximateAge: '78', sceneTypeValue: 'other', sceneTypeOther: 'Загострення хронічного захворювання / Інфекція вдома',
  airwayStatus: 'clear_open_spontaneous', consciousnessLevel: 'V',
  breathingRate: '>30', breathingSaturation: '<85', breathingQuality: 'shallow_rapid', chestExcursion: 'symmetric_reduced', auscultationLungs: 'crackles_rales',
  pulseRate: '121-150', pulseQuality: 'weak_regular', pulseLocation: 'radial', bloodPressureSystolic: '70', bloodPressureDiastolic: '40', capillaryRefillTime: '>3', skinStatus: 'mottled', externalBleeding: 'none_visible',
  glasgowComaScaleEye: '3', glasgowComaScaleVerbal: '3', glasgowComaScaleMotor: '5', pupilReaction: 'equal_sluggish', motorSensoryStatus: "unable_to_assess",
  bodyTemperature: '>38.0',
  medicationsAdministered: [ { name: "Розчин Рінгера лактат", route: "iv", dose: "1000ml" }, { name: "Цефтріаксон", route: "iv", dose: "2g" } ],
  proceduresPerformed: [ { name: "Оксигенотерапія (високий потік)" }, { name: "В/в доступ (2 катетери для інфузії)" }, { name: "Катетеризація сечового міхура (контроль діурезу)" } ],
  triageCategory: 'red',
};

const allPatients = [patient1, patient2, patient3, patient4, patient5, patient6];

// Функція для отримання індексу випадковості (RI)
function getRI(n) {
  const riValues = {
    1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
  };
  return riValues[n] || 1.49; // Default for n > 10, adjust if needed
}

// Функція для розрахунку власного вектора, lambda_max, CI, CR
function calculateAhpDetails(matrix) {
  const n = matrix.length;
  if (n === 0) return { priorityVector: [], lambda_max: 0, CI: 0, CR: 0, consistent: true };

  // 1. Нормалізація стовпців
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }

  const normalizedMatrix = matrix.map(row => row.slice()); // Create a copy
  for (let j = 0; j < n; j++) {
    if (colSums[j] === 0) continue; // Avoid division by zero
    for (let i = 0; i < n; i++) {
      normalizedMatrix[i][j] /= colSums[j];
    }
  }

  // 2. Розрахунок власного вектора (локальні пріоритети ω_j) - середнє по рядках нормалізованої матриці
  const priorityVector = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      priorityVector[i] += normalizedMatrix[i][j];
    }
    priorityVector[i] /= n;
  }

  // 3. Розрахунок λ_max
  // Ax = matrix * priorityVector
  const Ax = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      Ax[i] += matrix[i][j] * priorityVector[j];
    }
  }

  let lambda_max = 0;
  for (let i = 0; i < n; i++) {
    if (priorityVector[i] === 0) continue; // Avoid division by zero if a priority is 0
    lambda_max += Ax[i] / priorityVector[i];
  }
  lambda_max /= n;

  // 4. Розрахунок Індексу Узгодженості (CI)
  const CI = (n > 1) ? (lambda_max - n) / (n - 1) : 0;

  // 5. Розрахунок Відношення Узгодженості (CR)
  const RI = getRI(n);
  const CR = (RI === 0) ? 0 : CI / RI;
  const consistent = CR < 0.1;

  return { priorityVector, lambda_max, CI, CR, consistent };
}


// --- Рівень 1: Критерії ---
const criteriaDefinition = [
  { id: 'C1', name: 'Дихальні шляхи' },
  { id: 'C2', name: 'Дихання' },
  { id: 'C3', name: 'Кровообіг' },
  { id: 'C4', name: 'Неврологія' },
  { id: 'C5', name: 'Загальний стан' },
  { id: 'C6', name: 'Фізіологічні резерви' },
];

const criteriaComparisonMatrix = [
  // C1,  C2,  C3,  C4,  C5,  C6
  [1,   2,   3,   5,   7,   9  ], // C1
  [1/2, 1,   2,   4,   6,   8  ], // C2
  [1/3, 1/2, 1,   3,   5,   7  ], // C3
  [1/5, 1/4, 1/3, 1,   3,   5  ], // C4
  [1/7, 1/6, 1/5, 1/3, 1,   3  ], // C5
  [1/9, 1/8, 1/7, 1/5, 1/3, 1  ], // C6
];

const criteriaAhp = calculateAhpDetails(criteriaComparisonMatrix);
const criteriaWeights = {};
criteriaDefinition.forEach((crit, idx) => criteriaWeights[crit.id] = criteriaAhp.priorityVector[idx]);

console.log("--- Критерії Оцінки ---");
console.log("Матриця порівняння критеріїв:", criteriaComparisonMatrix);
console.log("Ваги критеріїв (ω_j):");
criteriaDefinition.forEach((crit, idx) => {
  console.log(`${crit.name} (${crit.id}): ${criteriaAhp.priorityVector[idx].toFixed(4)}`);
});
console.log(`λ_max: ${criteriaAhp.lambda_max.toFixed(4)}`);
console.log(`CI: ${criteriaAhp.CI.toFixed(4)}`);
console.log(`CR: ${criteriaAhp.CR.toFixed(4)} (Узгоджено: ${criteriaAhp.consistent})`);
console.log("\n");


// --- Рівень 2: Субкритерії ---
// Використовуємо ваги, надані у текстовому описі, для спрощення
// У реальному сценарії тут також були б матриці попарних порівнянь для субкритеріїв всередині кожного критерію

const subCriteriaWeights = {
  C1: { // Дихальні шляхи
    SC1_1_Prokhidnist: 0.75, // Прохідність
    SC1_2_Intubatsiya: 0.25, // Наявність інтубації
  },
  C2: { // Дихання
    SC2_1_Chastota: 0.15,
    SC2_2_Saturatsiya: 0.40,
    SC2_3_Yakist: 0.25,
    SC2_4_Exkursiya: 0.12,
    SC2_5_Auskultatsiya: 0.08,
  },
  C3: { // Кровообіг
    SC3_1_CHSS: 0.10,
    SC3_2_YakistPulsu: 0.25,
    SC3_3_LokalizatsiyaPulsu: 0.08,
    SC3_4_KapilyarniyTest: 0.20,
    SC3_5_StanShkiry: 0.15,
    SC3_6_Krovotecha: 0.18, // В оригіналі було 0.18, але 6 субкритеріїв мають суму 1.0
                            // Переглянемо: 0.10+0.25+0.08+0.20+0.15+0.18 = 0.96. Помилка в оригінальних вагах
                            // SC3.7 (Кінцівки) - 0.04. Разом = 1.00
    SC3_7_KintsivkyMS: 0.04, // Рухова та чутлива функція кінцівок (з опису)
  },
  C4: { // Неврологія
    SC4_1_GCS: 0.67,
    SC4_2_Zinitsi: 0.33,
  },
  C5: { // Загальний стан
    SC5_1_Temperatura: 0.50,
    SC5_2_Medykamenty: 0.20, // К-сть медикаментів
    SC5_3_Manipulyatsiyi: 0.30, // К-сть маніпуляцій
  },
  C6: { // Фізіологічні резерви
    SC6_1_Vik: 1.00, // Вік
  }
};

console.log("--- Ваги Субкритеріїв (локальні, відносно їх критерію) ---");
console.log(JSON.stringify(subCriteriaWeights, null, 2));
console.log("\n");

// --- Рівень 3: Оцінка пацієнтів відносно кожного субкритерію ---
// Знову ж таки, для спрощення, використовуємо надані ваги пацієнтів з текстового опису.
// В реальності, тут були б матриці попарних порівнянь пацієнтів для КОЖНОГО субкритерію.

const patientScoresPerSubCriterion = {
  // C1: Дихальні шляхи
  SC1_1_Prokhidnist:      { P1: 0.3, P2: 0.067, P3: 0.3,   P4: 0.067, P5: 0.2,   P6: 0.067 },
  SC1_2_Intubatsiya:      { P1: 0.15,P2: 0.033, P3: 0.15,  P4: 0.033, P5: 0.6,   P6: 0.033 },
  // C2: Дихання
  SC2_1_Chastota:         { P1: 0.3, P2: 0.05,  P3: 0.3,   P4: 0.05,  P5: 0.0,   P6: 0.3 }, // P5 контрольоване, тому низький пріоритет небезпеки
  SC2_2_Saturatsiya:      { P1: 0.301,P2:0.148,P3: 0.071, P4: 0.148, P5: 0.035, P6: 0.301 },
  SC2_3_Yakist:           { P1: 0.2, P2: 0.25,  P3: 0.25,  P4: 0.1,   P5: 0.15,  P6: 0.05 },
  SC2_4_Exkursiya:        { P1: 0.4, P2: 0.08,  P3: 0.02,  P4: 0.4,   P5: 0.02,  P6: 0.08 },
  SC2_5_Auskultatsiya:    { P1: 0.3, P2: 0.25,  P3: 0.2,   P4: 0.15,  P5: 0.02,  P6: 0.08 },
  // C3: Кровообіг
  SC3_1_CHSS:             { P1: 0.35,P2: 0.1,   P3: 0.35,  P4: 0.1,   P5: 0.0,   P6: 0.1 }, // P5 брадикардія, специфічна
  SC3_2_YakistPulsu:      { P1: 0.3, P2: 0.3,   P3: 0.2,   P4: 0.025, P5: 0.025, P6: 0.15 },
  SC3_3_LokalizatsiyaPulsu:{ P1: 0.4, P2: 0.05,  P3: 0.05,  P4: 0.05,  P5: 0.4,   P6: 0.05 },
  SC3_4_KapilyarniyTest:  { P1: 0.3, P2: 0.3,   P3: 0.05,  P4: 0.0,   P5: 0.05,  P6: 0.3 },
  SC3_5_StanShkiry:       { P1: 0.25,P2: 0.25,  P3: 0.05,  P4: 0.1,   P5: 0.05,  P6: 0.3 },
  SC3_6_Krovotecha:       { P1: 0.5, P2: 0.0,   P3: 0.0,   P4: 0.5,   P5: 0.0,   P6: 0.0 },
  SC3_7_KintsivkyMS:      { P1: 0.3, P2: 0.033, P3: 0.033, P4: 0.033, P5: 0.5,   P6: 0.1 }, // P5 тетраплегія
  // C4: Неврологія
  SC4_1_GCS:              { P1: 0.185,P2:0.065,P3: 0.115, P4: 0.032, P5: 0.488, P6: 0.115 },
  SC4_2_Zinitsi:          { P1: 0.4, P2: 0.006, P3: 0.006, P4: 0.006, P5: 0.5,   P6: 0.08 },
  // C5: Загальний стан
  SC5_1_Temperatura:      { P1: 0.2, P2: 0.05,  P3: 0.1,   P4: 0.05,  P5: 0.3,   P6: 0.3 },
  SC5_2_Medykamenty:      { P1: 0.2, P2: 0.3,   P3: 0.05,  P4: 0.05,  P5: 0.2,   P6: 0.2 },
  SC5_3_Manipulyatsiyi:   { P1: 0.25,P2: 0.25,  P3: 0.02,  P4: 0.03,  P5: 0.4,   P6: 0.25 },
  // C6: Фізіологічні резерви
  SC6_1_Vik:              { P1: 0.08,P2: 0.25,  P3: 0.22,  P4: 0.05,  P5: 0.1,   P6: 0.3 },
};
// Перевірка суми ваг для кожного субкритерію (має бути ~1)
/*
for (const scKey in patientScoresPerSubCriterion) {
    let sum = 0;
    for (const pKey in patientScoresPerSubCriterion[scKey]) {
        sum += patientScoresPerSubCriterion[scKey][pKey];
    }
    if (Math.abs(sum - 1.0) > 0.01) { // Допуск на заокруглення
        console.warn(`Sum of patient weights for ${scKey} is ${sum.toFixed(3)}, not 1.0`);
    }
}
*/

console.log("--- Ваги Пацієнтів відносно Субкритеріїв (з текстового прикладу) ---");
// console.log(JSON.stringify(patientScoresPerSubCriterion, null, 2)); // Дуже багато виводу
console.log("Приклад для SC2_2_Saturatsiya:", patientScoresPerSubCriterion.SC2_2_Saturatsiya);
console.log("\n");


// --- Розрахунок Глобальних Пріоритетів Пацієнтів ---
const globalPatientScores = {};
allPatients.forEach(patient => {
  globalPatientScores[patient.id] = 0;
});

criteriaDefinition.forEach(criterion => {
  const criterionWeight = criteriaWeights[criterion.id];
  const subCriteriaForThisCriterion = subCriteriaWeights[criterion.id];

  for (const scKey in subCriteriaForThisCriterion) {
    const subCriterionWeight = subCriteriaForThisCriterion[scKey];
    const patientScoresForThisSC = patientScoresPerSubCriterion[scKey];

    if (patientScoresForThisSC) {
      allPatients.forEach(patient => {
        const patientScore = patientScoresForThisSC[patient.id] || 0; // Якщо пацієнта немає, його вага 0
        globalPatientScores[patient.id] += criterionWeight * subCriterionWeight * patientScore;
      });
    } else {
      console.warn(`No patient scores found for sub-criterion: ${scKey}`);
    }
  }
});

console.log("--- Глобальні Пріоритети Пацієнтів (ω_global) ---");
const sortedPatients = allPatients
  .map(p => ({ ...p, globalScore: globalPatientScores[p.id] }))
  .sort((a, b) => b.globalScore - a.globalScore);

sortedPatients.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.patientFullName} (${p.id}): ${p.globalScore.toFixed(4)}`);
});

// Виведемо внески по кожному критерію, як у вашому прикладі
console.log("\n--- Деталізація внесків у глобальний пріоритет (як у прикладі) ---");
allPatients.forEach(patient => {
    let logString = `${patient.id} (${patient.patientFullName}): `;
    let totalPatientScore = 0;
    criteriaDefinition.forEach(criterion => {
        const criterionWeight = criteriaWeights[criterion.id];
        const subCriteriaForThisCriterion = subCriteriaWeights[criterion.id];
        let contributionFromThisCriterion = 0;

        for (const scKey in subCriteriaForThisCriterion) {
            const subCriterionWeight = subCriteriaForThisCriterion[scKey];
            const patientScoresForThisSC = patientScoresPerSubCriterion[scKey];
            if (patientScoresForThisSC && patientScoresForThisSC[patient.id] !== undefined) {
                const patientScore = patientScoresForThisSC[patient.id];
                contributionFromThisCriterion += subCriterionWeight * patientScore;
            }
        }
        const weightedContribution = contributionFromThisCriterion * criterionWeight;
        totalPatientScore += weightedContribution;
        logString += `${criterion.id}: ${weightedContribution.toFixed(4)} | `;
    });
    logString += `TOTAL: ${totalPatientScore.toFixed(4)}`;
    console.log(logString);
});