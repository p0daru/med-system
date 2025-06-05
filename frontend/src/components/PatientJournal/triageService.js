// frontend/src/components/PatientJournal/triageService.js

export const AHP_CRITERIA_NAMES_PLACEHOLDER = [ // Це буде замінено даними з беку
    "Стан ABC (Дихання/Кровообіг)",
    "Неврологічний статус (GCS)",
    "Тяжкість/Множинність травм",
    "Вік пацієнта"
];


const RANDOM_INDEX = {
    1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
};

// --- Допоміжні функції AHP (залишаються схожими) ---
function calculateWeightsFromMatrix(matrix) {
    const n = matrix.length;
    if (n === 0) return [];
    const weights = new Array(n).fill(0);
    const columnSums = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            columnSums[j] += matrix[i][j];
        }
    }
    const normalizedMatrix = matrix.map(row => row.slice());
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (columnSums[j] === 0) { // Запобігання діленню на нуль, якщо стовпець нульовий
                normalizedMatrix[i][j] = 0;
            } else {
                normalizedMatrix[i][j] = matrix[i][j] / columnSums[j];
            }
        }
    }
    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        for (let j = 0; j < n; j++) {
            rowSum += normalizedMatrix[i][j];
        }
        weights[i] = rowSum / n;
    }
    return weights;
}

function checkMatrixConsistency(matrix, weights) {
    const n = matrix.length;
    if (n === 0 || weights.length !== n) {
        if (n < 3) return { lambdaMax: n, ci: 0, cr: 0, consistencyOk: true };
        return { lambdaMax: 0, ci: 0, cr: 0, consistencyOk: true };
    }
    if (n < 3) return { lambdaMax: n, ci: 0, cr: 0, consistencyOk: true };

    const weightedSumVector = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            weightedSumVector[i] += matrix[i][j] * weights[j];
        }
    }
    let lambdaMax = 0;
    for (let i = 0; i < n; i++) {
        if (weights[i] > 0) {
            lambdaMax += weightedSumVector[i] / weights[i];
        } else if (weightedSumVector[i] === 0) {
            // lambdaMax contribution is 0, handled by initialization
        } else {
            // Potential issue: weight is 0 but weighted sum is not. For now, skip.
        }
    }
    if (n > 0) lambdaMax /= n; else lambdaMax = 0;

    const ci = (n <= 1) ? 0 : (lambdaMax - n) / (n - 1);
    const ri = RANDOM_INDEX[n] || (n > 10 ? 1.49 : 0);
    let cr = 0;
    if (n < 3) cr = 0;
    else if (ri === 0) cr = (ci === 0) ? 0 : Infinity;
    else cr = ci / ri;

    return { lambdaMax, ci, cr, consistencyOk: cr <= 0.1 || n < 3 };
}


// --- Функції нормалізації даних пацієнта (ПРИПУСКЛАДАЮТЬСЯ, ЩО НАДАЮТЬСЯ З БЕКЕНДУ АБО ДЕТАЛЬНО ВИЗНАЧЕНІ) ---
// Ці функції тепер будуть для НАЙНИЖЧИХ рівнів ієрархії (підкритеріїв або критеріїв без підкритеріїв)

/**
 * @param {object} patientRecord - Запис пацієнта.
 * @param {string} subCriterionId - ID підкритерію (наприклад, "SC1.1_Airway").
 * @param {object} ahpConfig - Конфігурація AHP з бекенду, може містити специфічні правила.
 * @returns {number} - Нормалізована оцінка (0-1, де 1 - найгірший).
 */
function normalizePatientDataForLeafCriterion(patientRecord, subCriterionId, ahpConfig) {
    // Ця функція мала б детальну логіку, потенційно керовану ahpConfig з бекенду
    // Наприклад, ahpConfig.normalizationRules[subCriterionId] міг би містити параметри
    const pi = patientRecord.patientInfo || {};
    const pr = patientRecord;

    // Приклад для підкритеріїв ABC
    if (subCriterionId === "SC1.1_Airway") {
        if (['fully_obstructed', 'partially_obstructed_foreign_body'].includes(pr.airwayStatus)) return 1.0;
        if (['partially_obstructed_tongue', 'clear_maintained_manual', 'clear_maintained_device'].includes(pr.airwayStatus)) return 0.5;
        return 0; // clear_spontaneous
    }
    if (subCriterionId === "SC1.2_Breathing") { // SpO2
        const saturation = pr.breathingSaturation || pr.oxygenSaturation;
        if (saturation === null || saturation === undefined) return 0.2; // Невідомо - середній ризик
        const satVal = parseFloat(saturation);
        if (satVal < 85) return 1.0;
        if (satVal < 90) return 0.7;
        if (satVal < 94) return 0.3;
        return 0;
    }
    if (subCriterionId === "SC1.3_Circulation") { // SBP
        if (!pr.bloodPressureSystolic) return 0.2; // Невідомо
        const sbp = parseFloat(pr.bloodPressureSystolic);
        if (sbp < 70) return 1.0;
        if (sbp < 90) return 0.7;
        if (sbp < 100) return 0.3;
        return 0;
    }

    // Приклад для підкритеріїв GCS (GCS компоненти 1-4/5/6, перетворюємо на 0-1, де 1 найгірше)
    // Максимальні бали: Eye=4, Verbal=5, Motor=6
    if (subCriterionId === "SC2.1_GCSEye") {
        const eye = parseInt(pr.glasgowComaScaleEye);
        if (isNaN(eye) || eye < 1 || eye > 4) return 0.5; // Невідомо або невалідні дані - середній
        return (4 - eye) / (4 - 1); // (max - current) / (max - min_meaningful)
    }
    if (subCriterionId === "SC2.2_GCSVerbal") {
        const verbal = parseInt(pr.glasgowComaScaleVerbal);
        if (isNaN(verbal) || verbal < 1 || verbal > 5) return 0.5;
        return (5 - verbal) / (5 - 1);
    }
    if (subCriterionId === "SC2.3_GCSMotor") {
        const motor = parseInt(pr.glasgowComaScaleMotor);
        if (isNaN(motor) || motor < 1 || motor > 6) return 0.5;
        return (6 - motor) / (6 - 1);
    }
    
    // Критерії без підкритеріїв (оцінюються безпосередньо)
    if (subCriterionId === "C3_Injury") { // "Тяжкість/Множинність травм"
        let injuryScore = 0;
        const details = (pr.exposureDetails || "").toLowerCase();
        if (details.includes("проникаюча") || details.includes("вогнепальне") || details.includes("ампутац")) injuryScore += 0.5;
        if (details.includes("чмт") || details.includes("хребта")) injuryScore += 0.3;
        if (details.includes("опік") && (details.includes("великий") || details.includes("глибокий"))) injuryScore += 0.2;
        return Math.min(1, injuryScore);
    }
    if (subCriterionId === "C4_Age") { // "Вік пацієнта"
        let age = pi.patientApproximateAge ? parseInt(pi.patientApproximateAge) : null;
        if (pi.patientDateOfBirth) {
            try {
                const birthYear = new Date(pi.patientDateOfBirth).getFullYear();
                const currentYear = new Date().getFullYear();
                if (!isNaN(birthYear) && !isNaN(currentYear)) age = currentYear - birthYear;
            } catch (e) { /* ignore */ }
        }
        if (age === null) return 0.2;
        if (age < 5 || age > 75) return 1.0;
        if (age < 15 || age > 65) return 0.6;
        return 0.1;
    }

    console.warn(`Немає логіки нормалізації для leaf criterion ID: ${subCriterionId}`);
    return 0; // За замовчуванням, якщо логіка не визначена
}


// --- Основна функція Тріажу МАІ ---
/**
 * @param {object[]} patientsInCategory - Масив пацієнтів.
 * @param {object} ahpConfiguration - Об'єкт конфігурації AHP, отриманий з бекенду.
 *   ahpConfiguration: {
 *     goal: "...",
 *     criteria: [
 *       {
 *         id: "C1_ABC", name: "Стан ABC", weight: null, // weight буде розраховано
 *         pairwiseComparisonMatrix: [[1, 3, 5], [1/3, 1, 2], [1/5, 1/2, 1]], // (якщо є підкритерії)
 *         subCriteria: [
 *           { id: "SC1.1_Airway", name: "Прохідність ДШ", weight: null },
 *           { id: "SC1.2_Breathing", name: "Дихання (SpO2)", weight: null },
 *           { id: "SC1.3_Circulation", name: "Кровообіг (АТс)", weight: null }
 *         ],
 *         // Або, якщо немає підкритеріїв, цей критерій є "leaf"
 *         isLeaf: false // true, якщо немає subCriteria
 *       },
 *       // ... інші критерії
 *     ],
 *     mainCriteriaPairwiseComparisonMatrix: [[1,3,5,7], [1/3,1,3,5], ...] // Матриця для C1, C2, C3, C4
 *   }
 * @returns {object} - Результати тріажу.
 */
export async function runAhpTriageWithHierarchy(patientsInCategory, ahpConfiguration) {
    console.groupCollapsed("--- Детальний розрахунок Тріажу МАІ (AHP з Ієрархією) ---");

    if (!ahpConfiguration || !ahpConfiguration.criteria || !ahpConfiguration.mainCriteriaPairwiseComparisonMatrix) {
        console.error("Неповна або відсутня конфігурація AHP з бекенду!");
        console.groupEnd();
        return { rankedPatients: [], error: "Missing AHP configuration." };
    }

    // --- ЕТАП 1: Ваги основних критеріїв ---
    console.group("ЕТАП 1: Розрахунок ваг основних критеріїв");
    const mainCriteria = ahpConfiguration.criteria.map(c => c.name); // Для логування імен
    console.log("Матриця попарних порівнянь для основних критеріїв:", ahpConfiguration.mainCriteriaPairwiseComparisonMatrix);
    const mainCriteriaWeights = calculateWeightsFromMatrix(ahpConfiguration.mainCriteriaPairwiseComparisonMatrix);
    const mainConsistency = checkMatrixConsistency(ahpConfiguration.mainCriteriaPairwiseComparisonMatrix, mainCriteriaWeights);
    console.log("Розраховані ваги основних критеріїв (ω_main):", mainCriteriaWeights.map((w, i) => ({ name: mainCriteria[i], weight: w.toFixed(4) })));
    console.log(`Узгодженість матриці основних критеріїв: CR = ${mainConsistency.cr.toFixed(4)}, Ok: ${mainConsistency.consistencyOk}`);
    if (!mainConsistency.consistencyOk) {
        console.warn("УВАГА: Матриця попарних порівнянь основних критеріїв НЕ є узгодженою!");
    }
    // Присвоюємо розраховані ваги об'єкту конфігурації
    ahpConfiguration.criteria.forEach((crit, index) => {
        crit.weight = mainCriteriaWeights[index];
    });
    console.groupEnd(); // ЕТАП 1

    // --- ЕТАП 2: Ваги підкритеріїв (де є) ---
    console.group("ЕТАП 2: Розрахунок ваг підкритеріїв");
    for (const criterion of ahpConfiguration.criteria) {
        if (criterion.subCriteria && criterion.subCriteria.length > 0 && criterion.pairwiseComparisonMatrix) {
            console.group(`Підкритерії для "${criterion.name}"`);
            const subNames = criterion.subCriteria.map(sc => sc.name);
            console.log("Матриця попарних порівнянь для підкритеріїв:", criterion.pairwiseComparisonMatrix);
            const subWeights = calculateWeightsFromMatrix(criterion.pairwiseComparisonMatrix);
            const subConsistency = checkMatrixConsistency(criterion.pairwiseComparisonMatrix, subWeights);
            console.log("Розраховані ваги підкритеріїв (ω_sub):", subWeights.map((w,i) => ({ name: subNames[i], weight: w.toFixed(4) })));
            console.log(`Узгодженість матриці підкритеріїв: CR = ${subConsistency.cr.toFixed(4)}, Ok: ${subConsistency.consistencyOk}`);
             if (!subConsistency.consistencyOk) {
                console.warn(`УВАГА: Матриця попарних порівнянь підкритеріїв для "${criterion.name}" НЕ є узгодженою!`);
            }
            criterion.subCriteria.forEach((sc, index) => {
                sc.weight = subWeights[index];
            });
            console.groupEnd();
        } else {
            criterion.isLeaf = true; // Позначаємо, що цей критерій не має підкритеріїв
        }
    }
    console.groupEnd(); // ЕТАП 2


    // --- ЕТАП 3: Оцінка пацієнтів та агрегація ---
    console.group("ЕТАП 3: Оцінка пацієнтів та агрегація пріоритетів");
    const patientsWithScores = patientsInCategory.map((patient, patientIdx) => {
        const patientLogId = `Пацієнт ${patientIdx + 1} (ID: ${patient.cardId || patient._id || 'N/A'})`;
        console.group(patientLogId);

        const patientCriterionScores = {}; // Зберігатиме фінальні оцінки за ОСНОВНИМИ критеріями { C1_ABC: 0.7, C2_Neuro: 0.3, ... }
        const patientSubCriterionRawScores = {}; // Зберігатиме оцінки за ЛИСТОВИМИ (під)критеріями

        for (const criterion of ahpConfiguration.criteria) {
            if (criterion.isLeaf) {
                // Критерій без підкритеріїв - оцінюємо напряму
                const score = normalizePatientDataForLeafCriterion(patient, criterion.id, ahpConfiguration);
                patientCriterionScores[criterion.id] = score;
                patientSubCriterionRawScores[criterion.id] = score; // Також зберігаємо як "raw"
                console.log(`Оцінка за критерієм "${criterion.name}" (ID: ${criterion.id}, листовий): ${score.toFixed(4)}`);
            } else if (criterion.subCriteria && criterion.subCriteria.length > 0) {
                // Критерій з підкритеріями
                let aggregatedScoreForMainCriterion = 0;
                console.group(`Обробка підкритеріїв для "${criterion.name}"`);
                for (const subCriterion of criterion.subCriteria) {
                    const subScore = normalizePatientDataForLeafCriterion(patient, subCriterion.id, ahpConfiguration);
                    patientSubCriterionRawScores[subCriterion.id] = subScore;
                    const weightedSubScore = subScore * (subCriterion.weight || 0); // (subCriterion.weight повинен бути вже розрахований)
                    aggregatedScoreForMainCriterion += weightedSubScore;
                    console.log(`  Підкритерій "${subCriterion.name}" (ID: ${subCriterion.id}): raw_score=${subScore.toFixed(4)}, weight=${(subCriterion.weight || 0).toFixed(4)}, weighted_score=${weightedSubScore.toFixed(4)}`);
                }
                console.groupEnd();
                patientCriterionScores[criterion.id] = aggregatedScoreForMainCriterion;
                console.log(`Агрегована оцінка за основним критерієм "${criterion.name}": ${aggregatedScoreForMainCriterion.toFixed(4)}`);
            }
        }
        
        // Розрахунок глобального пріоритету
        let globalPriority = 0;
        let globalPriorityCalcString = [];
        for (const criterion of ahpConfiguration.criteria) {
            const scoreForMain = patientCriterionScores[criterion.id] || 0;
            const weightOfMain = criterion.weight || 0;
            globalPriority += scoreForMain * weightOfMain;
            globalPriorityCalcString.push(`(${scoreForMain.toFixed(4)} [${criterion.name}] * ${weightOfMain.toFixed(4)} [вага])`);
        }
        console.log(`Розрахунок глобального пріоритету: P_i = ${globalPriorityCalcString.join(' + ')} = ${globalPriority.toFixed(4)}`);
        
        console.groupEnd(); // patientLogId
        return {
            ...patient,
            ahpPatientIdForLog: patientLogId,
            ahpPatientCriterionScores: patientCriterionScores, // Оцінки за основними критеріями
            ahpPatientSubCriterionRawScores: patientSubCriterionRawScores, // Оцінки за листовими (під)критеріями
            ahpGlobalPriority: globalPriority,
        };
    });
    console.groupEnd(); // ЕТАП 3

    // --- ЕТАП 4: Ранжування ---
    console.group("ЕТАП 4: Ранжування пацієнтів");
    const rankedPatients = patientsWithScores.sort((a, b) => b.ahpGlobalPriority - a.ahpGlobalPriority);
    rankedPatients.forEach((p, index) => {
        p.ahpRank = index + 1;
    });
    const finalRankingData = rankedPatients.map(p => ({
        Rank: p.ahpRank,
        Patient: p.ahpPatientIdForLog,
        GlobalPriority_P: p.ahpGlobalPriority.toFixed(4),
        ScoresByMainCriteria: Object.fromEntries(
            Object.entries(p.ahpPatientCriterionScores).map(([key, val]) => [
                (ahpConfiguration.criteria.find(c=>c.id === key) || {name: key}).name, // get name by id
                val.toFixed(4)
            ])
        )
    }));
    console.log("Остаточне ранжування:");
    console.table(finalRankingData);
    console.groupEnd(); // ЕТАП 4

    console.groupEnd(); // --- Детальний розрахунок Тріажу МАІ (AHP з Ієрархією) ---

    return {
        rankedPatients,
        // Можна повернути деталі конфігурації та ваг, якщо потрібно для відображення
        ahpExecutionDetails: {
            mainCriteriaWeights: ahpConfiguration.criteria.map(c => ({id: c.id, name: c.name, weight: c.weight})),
            // ... інші деталі, якщо потрібні
        },
        // Повертаємо першу помилку узгодженості, якщо є
        consistencyWarning: !mainConsistency.consistencyOk ? "Низька узгодженість матриці основних критеріїв." :
                             ahpConfiguration.criteria.some(c => c.subCriteria && !checkMatrixConsistency(c.pairwiseComparisonMatrix, c.subCriteria.map(sc => sc.weight)).consistencyOk) ? "Низька узгодженість в одній з матриць підкритеріїв." : null,
        
    };
}


// --- Приклад того, як це можна було б викликати з компонента ---
/*
async function handleRunAhpTriage(selectedCategory) {
    setIsAhpLoading(true);
    setAhpResults(null);

    // 1. Отримати конфігурацію AHP з бекенду
    // ПРИПУСКАЄМО, ЩО Є ФУНКЦІЯ getAhpConfigurationFromServer()
    let ahpConfigFromServer;
    try {
        // ahpConfigFromServer = await getAhpConfigurationFromServer(); // Реальний виклик API
        
        // ЗАГЛУШКА ДАНИХ З БЕКЕНДУ для демонстрації:
        ahpConfigFromServer = {
            goal: "Пріоритезація пацієнтів",
            criteria: [
                {
                    id: "C1_ABC", name: "Стан ABC",
                    pairwiseComparisonMatrix: [ // Матриця для підкритеріїв SC1.1, SC1.2, SC1.3
                        [1, 2, 3],  // Airway vs Breathing, Airway vs Circulation
                        [1/2, 1, 2], // Breathing vs Circulation
                        [1/3, 1/2, 1]
                    ],
                    subCriteria: [
                        { id: "SC1.1_Airway", name: "Прохідність ДШ" },
                        { id: "SC1.2_Breathing", name: "Дихання (SpO2)" },
                        { id: "SC1.3_Circulation", name: "Кровообіг (АТс)" }
                    ],
                },
                {
                    id: "C2_Neuro", name: "Неврологічний статус (GCS)",
                    pairwiseComparisonMatrix: [ // Матриця для GCS Eye, Verbal, Motor
                        [1, 1, 2],  // Eye vs Verbal, Eye vs Motor
                        [1, 1, 2],  // Verbal vs Motor
                        [1/2, 1/2, 1]
                    ],
                    subCriteria: [
                        { id: "SC2.1_GCSEye", name: "GCS Очі" },
                        { id: "SC2.2_GCSVerbal", name: "GCS Вербальна" },
                        { id: "SC2.3_GCSMotor", name: "GCS Рухова" }
                    ]
                },
                { id: "C3_Injury", name: "Тяжкість/Множинність травм" }, // isLeaf = true (автоматично)
                { id: "C4_Age", name: "Вік пацієнта" }                 // isLeaf = true (автоматично)
            ],
            mainCriteriaPairwiseComparisonMatrix: [ // Матриця для C1_ABC, C2_Neuro, C3_Injury, C4_Age
                [1,    3,     5,      7],
                [1/3,  1,     3,      5],
                [1/5,  1/3,   1,      3],
                [1/7,  1/5,   1/3,    1],
            ]
        };

    } catch (error) {
        console.error("Помилка завантаження конфігурації AHP:", error);
        // Показати помилку користувачу
        setIsAhpLoading(false);
        return;
    }


    const patientsToTriage = records.filter(r => r.triageCategory?.toLowerCase() === selectedCategory.toLowerCase());
    if (patientsToTriage.length === 0) {
        // ... обробка відсутності пацієнтів
        setIsAhpLoading(false);
        // Відкрити модалку з повідомленням
        disclosureAhpModal.onOpen();
        return;
    }

    const results = await runAhpTriageWithHierarchy(patientsToTriage, ahpConfigFromServer);
    
    // Встановлюємо результати, які будуть передані в AhpTriageControls
    // AhpTriageControls потрібно буде адаптувати для відображення цих нових даних,
    // зокрема, попередження про узгодженість та, можливо, ваги критеріїв/підкритеріїв.
    setAhpResults({
        rankedPatients: results.rankedPatients,
        criteriaWeights: results.ahpExecutionDetails?.mainCriteriaWeights.map(cw => cw.weight) || [], // Для сумісності з поточним модальним вікном
        // Тут потрібно вирішити, як передавати інформацію про узгодженість.
        // Наприклад, можна передати results.consistencyWarning
        consistencyOk: !results.consistencyWarning, // Спрощено
        consistencyRatio: null, // CR для основної матриці можна було б витягнути, якщо потрібно
        // Можна додати сюди більше деталей з results.ahpExecutionDetails
        ahpExecutionDetails: results.ahpExecutionDetails,
        consistencyWarningText: results.consistencyWarning
    });

    setIsAhpLoading(false);
    disclosureAhpModal.onOpen();
}
*/