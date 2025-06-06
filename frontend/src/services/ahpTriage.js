// frontend/src/services/ahpTriage.js
import { differenceInYears, parseISO } from 'date-fns';

/**
 * Сервіс для проведення медичного тріажу за Методом Аналізу Ієрархії (AHP).
 * 
 * ВАЖЛИВІ ПРИПУЩЕННЯ:
 * 1. Матриці попарних порівнянь для критеріїв та субкритеріїв є заздалегідь визначеними
 *    на основі загальних медичних знань (пріоритет ABCDE). В реальній системі ці ваги
 *    мали б бути налаштовуваними або валідованими медичними експертами.
 * 2. Конвертація текстових/числових даних з картки пацієнта в уніфіковані бали
 *    (чим вищий бал, тим гірший стан) є ключовим етапом і базується на визначених правилах.
 * 3. Для порівняння пацієнтів використовується шкала Сааті (1-9), де різниця їхніх балів
 *    визначає ступінь переваги одного над іншим.
 */

// --- КОНСТАНТИ ТА ДОВІДКОВІ ДАНІ ---

// Випадковий індекс узгодженості (RI) для матриць різного розміру (k)
const RANDOM_INDEX = {
    1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
};

// --- ЕКСПЕРТНІ ОЦІНКИ: МАТРИЦІ ПОПАРНИХ ПОРІВНЯНЬ ---

// Крок 2: Побудова матриці попарних порівнянь для 6 основних критеріїв.
// Критерії: [Дихальні шляхи, Дихання, Кровообіг, Неврологія, Загальний стан, Фізіологічні резерви]
// Логіка: Дихальні шляхи (A) > Дихання (B) > Кровообіг (C) > Неврологія (D) > ...
const criteriaComparisonMatrix = [
    [1, 3, 5, 7, 9, 9],
    [1/3, 1, 3, 5, 7, 7],
    [1/5, 1/3, 1, 3, 5, 5],
    [1/7, 1/5, 1/3, 1, 3, 3],
    [1/9, 1/7, 1/5, 1/3, 1, 1],
    [1/9, 1/7, 1/5, 1/3, 1, 1],
];

// Крок 3: Матриці попарних порівнянь для субкритеріїв
const subCriteriaComparisonMatrices = {
    airway: { // Дихальні шляхи: [прохідність, наявність інтубації]
        names: ['Прохідність', 'Наявність інтубації'],
        matrix: [
            [1, 3], // Прохідність важливіша за факт інтубації
            [1/3, 1],
        ],
    },
    breathing: { // Дихання: [ЧД, SpO2, якість, екскурсія, аускультація]
        names: ['Частота дихання', 'Сатурація', 'Якість дихання', 'Екскурсія грудної клітки', 'Аускультація легень'],
        matrix: [
            [1, 1, 3, 5, 5],   // ЧД
            [1, 1, 3, 5, 5],   // SpO2
            [1/3, 1/3, 1, 3, 3], // Якість
            [1/5, 1/5, 1/3, 1, 1], // Екскурсія
            [1/5, 1/5, 1/3, 1, 1], // Аускультація
        ],
    },
    circulation: { // Кровообіг: [ЧСС, якість пульсу, локалізація, капіляри, шкіра, кровотеча, кінцівки]
        names: ['Зовнішня кровотеча', 'Локалізація пульсу', 'ЧСС', 'Якість пульсу', 'Капілярний тест', 'Стан шкіри', 'Рух/чутливість кінцівок'],
        matrix: [
            [1, 3, 5, 5, 7, 7, 9],   // Кровотеча
            [1/3, 1, 3, 3, 5, 5, 7], // Локалізація
            [1/5, 1/3, 1, 1, 3, 3, 5], // ЧСС
            [1/5, 1/3, 1, 1, 3, 3, 5], // Якість
            [1/7, 1/5, 1/3, 1/3, 1, 1, 3], // Капіляри
            [1/7, 1/5, 1/3, 1/3, 1, 1, 3], // Шкіра
            [1/9, 1/7, 1/5, 1/5, 1/3, 1/3, 1], // Кінцівки
        ],
    },
    disability: { // Неврологія: [ШКГ, реакція зіниць]
        names: ['Шкала коми Глазго', 'Реакція зіниць'],
        matrix: [
            [1, 2], // ШКГ трохи важливіша
            [1/2, 1],
        ],
    },
    exposure: { // Загальний стан: [температура, медикаменти, маніпуляції]
        names: ['Температура тіла', 'К-ть медикаментів', 'К-ть маніпуляцій'],
        matrix: [
            [1, 3, 3],   // Температура
            [1/3, 1, 1], // Медикаменти
            [1/3, 1, 1], // Маніпуляції
        ],
    },
    reserves: { // Фізіологічні резерви: [вік]
        names: ['Вік'],
        matrix: [[1]], // Тільки один субкритерій, вага буде 1
    },
};

// --- МАТЕМАТИЧНІ ТА ДОПОМІЖНІ ФУНКЦІЇ ---

/**
 * **ВИПРАВЛЕНО**
 * Основна функція для розрахунку ваг та індексів узгодженості для матриці AHP.
 * @param {number[][]} matrix - Квадратна матриця попарних порівнянь.
 * @returns {{weights: number[], lambdaMax: number, CI: number, CR: number, isConsistent: boolean}}
 */
function calculateAhp(matrix) {
    const k = matrix.length;
    if (k === 0) return { weights: [], lambdaMax: 0, CI: 0, CR: 0, isConsistent: true };
    if (k === 1) return { weights: [1], lambdaMax: 1, CI: 0, CR: 0, isConsistent: true };

    // 1. Нормалізація матриці та обчислення ваг (власного вектора)
    
    // --- ПОМИЛКА БУЛА ТУТ ---
    // const columnSums = matrix[0].map((_, colIndex) => matrix.reduce((sum, row) => sum + row[colIndex], 0));
    // --- ВИПРАВЛЕНИЙ ВАРІАНТ ---
    const columnSums = matrix.reduce((sums, row) => {
        row.forEach((item, colIndex) => {
            sums[colIndex] = (sums[colIndex] || 0) + item;
        });
        return sums;
    }, new Array(k).fill(0));
    // -------------------------

    // Перевірка на нульові суми стовпців, щоб уникнути ділення на нуль
    if (columnSums.some(sum => sum === 0)) {
        console.error("Помилка AHP: сума одного зі стовпців матриці дорівнює нулю.", matrix);
        // Повертаємо рівні ваги, щоб уникнути падіння програми
        const equalWeight = 1 / k;
        return {
            weights: new Array(k).fill(equalWeight),
            lambdaMax: k,
            CI: 0,
            CR: 0,
            isConsistent: true
        };
    }

    const normalizedMatrix = matrix.map(row => row.map((val, colIndex) => val / columnSums[colIndex]));
    const weights = normalizedMatrix.map(row => row.reduce((sum, val) => sum + val, 0) / k);

    // 2. Обчислення максимального власного числа (λ_max)
    if (weights.some(w => w === 0)) {
         // Якщо якась вага нульова, це може призвести до ділення на нуль
         // Це трапляється, якщо матриця дуже неузгоджена або має специфічну структуру.
         // Повертаємо приблизний результат, щоб не ламати весь процес.
         console.warn("Попередження AHP: нульова вага критерію. Можлива сильна неузгодженість.", weights);
         const lambdaMaxApprox = columnSums.reduce((sum, colSum, index) => sum + colSum * weights[index], 0);
          const CI = (lambdaMaxApprox - k) / (k > 1 ? k - 1 : 1);
          const RI = RANDOM_INDEX[k] || 1.98;
          const CR = RI === 0 ? 0 : CI / RI;
          return { weights, lambdaMax: lambdaMaxApprox, CI, CR, isConsistent: CR < 0.1 };
    }

    const weightedSumVector = matrix.map(row => row.reduce((sum, val, colIndex) => sum + val * weights[colIndex], 0));
    const lambdaMax = weightedSumVector.reduce((sum, val, index) => sum + val / weights[index], 0) / k;

    // 3. Перевірка на узгодженість
    const CI = (k > 1) ? (lambdaMax - k) / (k - 1) : 0;
    const RI = RANDOM_INDEX[k] || 1.98; 
    const CR = RI === 0 ? 0 : CI / RI;

    return {
        weights,
        lambdaMax,
        CI,
        CR,
        isConsistent: CR < 0.1,
    };
}


/**
 * **ФІНАЛЬНА ВЕРСІЯ**
 * Конвертує дані з картки пацієнта в об'єкт з числовими балами.
 * Чим вищий бал, тим гірший стан. Використовує більш гранульовану шкалу.
 * @param {object} patient - Об'єкт пацієнта.
 * @returns {object} - Об'єкт з балами.
 */
function mapPatientDataToScores(patient) {
    const p = patient;
    const pInfo = p.patientInfo || {};

    // --- ЦІЛЬОВЕ ЛОГУВАННЯ ВХІДНИХ ДАНИХ ---
    console.group(`---> Перевірка даних для ${p.cardId}`);
    console.log({
        airwayStatus: p.airwayStatus, breathingRate: p.breathingRate,
        breathingSaturation: p.breathingSaturation, breathingQuality: p.breathingQuality,
        chestExcursion: p.chestExcursion, auscultationLungs: p.auscultationLungs,
        externalBleeding: p.externalBleeding, pulseLocation: p.pulseLocation,
        pulseRate: p.pulseRate, pulseQuality: p.pulseQuality,
        capillaryRefillTime: p.capillaryRefillTime, skinStatus: p.skinStatus,
        motorSensoryStatus: p.motorSensoryStatus, gcsTotal: p.gcsTotal,
        pupilReaction: p.pupilReaction, bodyTemperature: p.bodyTemperature,
        medicationsAdministered: p.medicationsAdministered, proceduresPerformed: p.proceduresPerformed,
        patientApproximateAge: pInfo.patientApproximateAge, patientDateOfBirth: pInfo.patientDateOfBirth,
    });
    console.groupEnd();
    // ===============================================

    const scores = { airway: {}, breathing: {}, circulation: {}, disability: {}, exposure: {}, reserves: {} };

   /**
     * Конвертує значення з select-опцій (може бути числом, діапазоном ">X" або "<X") в уніфікований бал.
     * Чим гірший показник, тим вищий бал.
     * @param {string | number | undefined} value - Значення з картки пацієнта.
     * @param {number[]} normalRange - Масив з двох чисел [min, max] для норми.
     * @param {number} maxScore - Максимальний бал за цим показником.
     * @returns {number} - Розрахований бал від 1 до maxScore.
     */
    const getScoreFromRange = (value, normalRange, maxScore = 10) => {
        if (value === undefined || value === null || value === '') return maxScore / 2; // Середній ризик для невідомих даних

        const strValue = String(value);

        // Обробка спеціальних значень типу ">30" або "<10"
        if (strValue.includes('>')) {
            const num = parseFloat(strValue.replace('>', ''));
            return (num > normalRange[1]) ? maxScore : maxScore / 2;
        }
        if (strValue.includes('<')) {
            const num = parseFloat(strValue.replace('<', ''));
            return (num < normalRange[0]) ? maxScore : maxScore / 2;
        }

        // Обробка діапазонів типу "10-12"
        if (strValue.includes('-')) {
            const parts = strValue.split('-').map(parseFloat);
            const avgValue = (parts[0] + parts[1]) / 2;
            if (avgValue >= normalRange[0] && avgValue <= normalRange[1]) return 1; // Норма
            const deviation = Math.min(Math.abs(avgValue - normalRange[0]), Math.abs(avgValue - normalRange[1]));
            return Math.min(maxScore, 1 + deviation);
        }

        // Обробка одного числа
        const num = parseFloat(strValue);
        if (isNaN(num)) return maxScore / 2; // Якщо не змогли розпарсити
        if (num >= normalRange[0] && num <= normalRange[1]) return 1; // Норма
        
        const deviation = Math.min(Math.abs(num - normalRange[0]), Math.abs(num - normalRange[1]));
        return Math.min(maxScore, 1 + deviation * 1.5);
    };

    // --- 1. Дихальні шляхи (Airway) ---
    const airwayStatus = p.airwayStatus || 'unknown';
    scores.airway.patency = {
        'fully_obstructed': 10, 'partially_obstructed_tongue': 7,
        'partially_obstructed_foreign_body': 8, 'secured_advanced_device': 4,
        'clear_maintained_manual': 3, 'clear_maintained_device': 2,
        'clear_open_spontaneous': 1, 'unknown': 5
    }[airwayStatus] || 5;
    scores.airway.intubation = airwayStatus === 'secured_advanced_device' ? 5 : 1;

    // --- 2. Дихання (Breathing) ---
    scores.breathing.rate = getScoreFromRange(p.breathingRate, [12, 20]);
    scores.breathing.saturation = getScoreFromRange(p.breathingSaturation, [94, 100]);
    const breathingQuality = p.breathingQuality || '';
    scores.breathing.quality = breathingQuality.includes('agonal') || breathingQuality.includes('apneic') ? 10
        : (breathingQuality.includes('paradoxical') || breathingQuality.includes('labored')) ? 8
        : breathingQuality.includes('shallow') ? 5 : breathingQuality.includes('noisy') ? 4 : 1;
    scores.breathing.excursion = (p.chestExcursion === 'asymmetric' || p.chestExcursion === 'absent') ? 10 : 1;
    const auscultation = p.auscultationLungs || '';
    scores.breathing.auscultation = auscultation.startsWith('absent') ? 10
        : auscultation.startsWith('reduced') ? 6
        : auscultation.includes('crackles') || auscultation.includes('wheezes') ? 4 : 1;

    // --- 3. Кровообіг (Circulation) ---
    const bleeding = p.externalBleeding || '';
    scores.circulation.external_bleeding = bleeding.includes('severe') || bleeding.includes('pulsating') ? 10
        : bleeding.includes('internal_suspected') ? 9 : bleeding.includes('moderate') ? 6
        : bleeding.includes('minor') ? 3 : 1;
     scores.circulation.pulse_location = { 'carotid': 8, 'femoral': 8, 'brachial': 5, 'radial': 1, 'pedal': 1, 'other': 10 }[p.pulseLocation] || 10;
    
    // Покращена логіка для ЧСС
    scores.circulation.pulse_rate = (() => {
        const value = p.pulseRate;
        if (!value) return 5;
        const strValue = String(value);
        if (strValue.includes('>150') || strValue.includes('<40') || strValue === '0') return 10;
        if (strValue.includes('121-150') || strValue.includes('40-59')) return 7;
        if (strValue.includes('101-120') || strValue.includes('50-59')) return 4;
        return 1; // Норма '60-100'
    })();
    
    const pulseQuality = p.pulseQuality || '';
    scores.circulation.pulse_quality = pulseQuality.includes('absent') ? 10
        : pulseQuality.includes('weak') ? 7 : pulseQuality.includes('irregular') ? 4 : 1;
    scores.circulation.capillary_refill = getScoreFromRange(p.capillaryRefillTime, [0, 2]);
    const skin = p.skinStatus || '';
    scores.circulation.skin_status = skin.includes('cyanotic') || skin.includes('mottled') ? 10
        : skin.includes('pale_cool_clammy') ? 8 : skin.includes('jaundiced') ? 5 : 1;
    const motorSensory = p.motorSensoryStatus || '';
    scores.circulation.motor_sensory_status = motorSensory.includes('plegia') ? 10
        : motorSensory.startsWith('deficit') ? 5 : motorSensory === 'unable_to_assess' ? 6 : 1;

    // --- 4. Неврологія (Disability) ---
    let gcsTotal = parseInt(p.gcsTotal, 10);
    if (isNaN(gcsTotal)) {
        const gcsE = parseInt(p.glasgowComaScaleEye, 10) || 0;
        const gcsV = parseInt(p.glasgowComaScaleVerbal, 10) || 0;
        const gcsM = parseInt(p.glasgowComaScaleMotor, 10) || 0;
        gcsTotal = (gcsE > 0 || gcsV > 0 || gcsM > 0) ? gcsE + gcsV + gcsM : NaN;
    }
    scores.disability.gcs = isNaN(gcsTotal) ? 8 : Math.max(1, (15 - gcsTotal) * (10 / 12) + 1);
    const pupils = p.pupilReaction || '';
    scores.disability.pupils = pupils.includes('unequal') || pupils.includes('dilated_fixed') || pupils.includes('nonreactive') ? 10
        : pupils.includes('sluggish') ? 5 : pupils.includes('pinpoint') || pupils.includes('constricted') ? 4 : 1;

    // --- 5. Загальний стан (Exposure) ---
    scores.exposure.temperature = getScoreFromRange(p.bodyTemperature, [36.1, 37.2]);
    scores.exposure.meds_count = 1 + (p.medicationsAdministered?.length || 0);
    scores.exposure.procedures_count = 1 + (p.proceduresPerformed?.length || 0);

    // --- 6. Фізіологічні резерви (Reserves) ---
    let age = parseInt(pInfo.patientApproximateAge, 10);
    if (isNaN(age) && pInfo.patientDateOfBirth) {
        try {
            age = differenceInYears(new Date(), parseISO(pInfo.patientDateOfBirth));
        } catch (e) {
            console.error(`Помилка парсингу дати народження "${pInfo.patientDateOfBirth}" для ${p.cardId}:`, e);
            age = 35; // Середній вік для невідомих
        }
    } else if (isNaN(age)) {
        age = 35; // Середній вік для невідомих
    }
    scores.reserves.age = (age < 2 || age > 75) ? 10
        : (age < 10 || age > 60) ? 5
        : 1;
    
    console.log(`Бали для пацієнта ${p.cardId}:`, JSON.parse(JSON.stringify(scores)));
    return scores;
}


/**
 * **ФІНАЛЬНА ВЕРСІЯ**
 * Порівнює двох пацієнтів, використовуючи пряме відношення їхніх балів.
 * Це більш чутливо до невеликих відмінностей, ніж груба шкала Сааті.
 * @param {number} scoreA - Бал пацієнта A.
 * @param {number} scoreB - Бал пацієнта B.
 * @returns {number} - Значення відношення.
 */
function compareScores(scoreA, scoreB) {
    // Щоб уникнути ділення на нуль і отримати стабільні результати
    const sA = scoreA || 1;
    const sB = scoreB || 1;

    if (sA === sB) return 1;

    // Пряме порівняння. Якщо в одного пацієнта бал 8, а в іншого 4,
    // то перший вдвічі пріоритетніший за цим субкритерієм.
    // Обмежуємо максимальне значення, щоб уникнути екстремальних переваг.
    let ratio = sA / sB;
    if (ratio > 9) ratio = 9;
    if (ratio < 1/9) ratio = 1/9;

    return ratio;
}



// --- ОСНОВНА ЕКСПОРТОВАНА ФУНКЦІЯ З РОЗШИРЕНИМ ЛОГУВАННЯМ ---
export function performAhpTriage(patients) {
    if (!patients || patients.length === 0) {
        console.warn("Немає пацієнтів для тріажу.");
        return { rankedPatients: [] };
    }

    const ahpStructure = {
        criteria: {
            names: ['Дихальні шляхи', 'Дихання', 'Кровообіг', 'Неврологія', 'Загальний стан', 'Фізіологічні резерви'],
            keys: ['airway', 'breathing', 'circulation', 'disability', 'exposure', 'reserves'],
            matrix: criteriaComparisonMatrix
        },
        subcriteria: {
            airway: { names: ['Прохідність', 'Наявність інтубації'], keys: ['patency', 'intubation'], matrix: subCriteriaComparisonMatrices.airway.matrix },
            breathing: { names: ['Частота дихання', 'Сатурація', 'Якість дихання', 'Екскурсія грудної клітки', 'Аускультація легень'], keys: ['rate', 'saturation', 'quality', 'excursion', 'auscultation'], matrix: subCriteriaComparisonMatrices.breathing.matrix },
            circulation: { names: ['Зовнішня кровотеча', 'Локалізація пульсу', 'ЧСС', 'Якість пульсу', 'Капілярний тест', 'Стан шкіри', 'Рух/чутливість кінцівок'], keys: ['external_bleeding', 'pulse_location', 'pulse_rate', 'pulse_quality', 'capillary_refill', 'skin_status', 'motor_sensory_status'], matrix: subCriteriaComparisonMatrices.circulation.matrix },
            disability: { names: ['Шкала коми Глазго', 'Реакція зіниць'], keys: ['gcs', 'pupils'], matrix: subCriteriaComparisonMatrices.disability.matrix },
            exposure: { names: ['Температура тіла', 'К-ть медикаментів', 'К-ть маніпуляцій'], keys: ['temperature', 'meds_count', 'procedures_count'], matrix: subCriteriaComparisonMatrices.exposure.matrix },
            reserves: { names: ['Вік'], keys: ['age'], matrix: subCriteriaComparisonMatrices.reserves.matrix }
        }
    };

   // --- ДОПОМІЖНА ФУНКЦІЯ ДЛЯ ФОРМАТУВАННЯ МАТРИЦІ ---
    const formatMatrixForTable = (matrix, prefix = 'Col') => {
        const formattedMatrix = matrix.map(row =>
            row.map(cell => (typeof cell === 'number' ? cell.toFixed(3) : cell))
        );

        // Перетворюємо масив масивів у масив об'єктів для кастомних заголовків
        return formattedMatrix.map((row, rowIndex) => {
            const rowObject = { [`${prefix}`]: `${prefix}${rowIndex + 1}` }; // Назва першого стовпця
            row.forEach((cell, colIndex) => {
                rowObject[`${prefix}${colIndex + 1}`] = cell; // Назви інших стовпців
            });
            return rowObject;
        });
    };
    
    // --- ДОПОМІЖНА ФУНКЦІЯ ДЛЯ ФОРМАТУВАННЯ ВЕКТОРІВ ВАГ ---
    const formatWeightsForTable = (weights, labels, labelHeader = "Елемент", valueHeader = "Вага") => {
        return weights.map((w, i) => ({
            [labelHeader]: labels[i],
            [valueHeader]: w.toFixed(3)
        }));
    };

    console.clear();
    console.log("%cЗапуск процесу тріажу за Методом Аналізу Ієрархії (AHP)", "color: blue; font-size: 16px; font-weight: bold;");
    console.log(`Кількість пацієнтів для аналізу: ${patients.length}`);

    // --- Крок 2: Аналіз матриці критеріїв ---
    console.group("Крок 2: Аналіз основних критеріїв");
    console.log("Матриця попарних порівнянь критеріїв (C):");
    console.table(formatMatrixForTable(ahpStructure.criteria.matrix, 'C')); // <-- ФОРМАТУВАННЯ
    const criteriaAhp = calculateAhp(ahpStructure.criteria.matrix);
    console.log(`Максимальне власне число (λ_max): ${criteriaAhp.lambdaMax.toFixed(3)}`);
    console.table(formatWeightsForTable(criteriaAhp.weights, ahpStructure.criteria.names, "Критерій", "Вага (ω_j)"));
    console.log(`CR = ${criteriaAhp.CR.toFixed(3)}, Узгоджено: ${criteriaAhp.isConsistent}`);
    console.groupEnd();
    
    if (!criteriaAhp.isConsistent) console.error("УВАГА: Матриця порівняння критеріїв неузгоджена!");
    const criteriaWeights = criteriaAhp.weights;

    // --- Крок 3: Аналіз матриць субкритеріїв ---
    const subCriteriaWeights = {};
    console.group("Крок 3: Аналіз субкритеріїв");
    ahpStructure.criteria.keys.forEach((criterionKey, j) => {
        const sub = ahpStructure.subcriteria[criterionKey];
        console.group(`Субкритерії для "${ahpStructure.criteria.names[j]}"`);
        console.log("Матриця попарних порівнянь (SC):");
        console.table(formatMatrixForTable(sub.matrix, 'SC')); // <-- ФОРМАТУВАННЯ
        const subCriteriaAhp = calculateAhp(sub.matrix);
        console.log(`Максимальне власне число (λ_max): ${subCriteriaAhp.lambdaMax.toFixed(3)}`);
        console.table(formatWeightsForTable(subCriteriaAhp.weights, sub.names, "Субкритерій", "Локальна вага (ω_jl)"));
        console.log(`CR = ${subCriteriaAhp.CR.toFixed(3)}, Узгоджено: ${subCriteriaAhp.isConsistent}`);
        subCriteriaWeights[criterionKey] = subCriteriaAhp.weights;
        console.groupEnd();
    });
    console.groupEnd();

    console.group("Підготовчий етап: Конвертація даних пацієнтів у бали");
    const patientScores = patients.map(p => mapPatientDataToScores(p));
    console.groupEnd();

    // --- Крок 4 & 5: Обчислення пріоритетів пацієнтів ---
    const patientPriorities = patients.map(() => ({}));
    console.group("Кроки 4 та 5: Розрахунок пріоритетів пацієнтів");
    
    ahpStructure.criteria.keys.forEach((criterionKey, j) => {
        const criterionName = ahpStructure.criteria.names[j];
        console.group(`Аналіз за критерієм: "${criterionName}"`);
        
        const subCriterionInfo = ahpStructure.subcriteria[criterionKey];
        const patientScoresForCriterion = new Array(patients.length).fill(0);

        subCriterionInfo.keys.forEach((subCriterionKey, l) => {
            console.group(`Порівняння за субкритерієм: "${subCriterionInfo.names[l]}"`);
            
            const patientComparisonMatrix = patients.map((_, i) => 
                patients.map((_, k) => 
                    compareScores(
                        patientScores[i][criterionKey][subCriterionKey], 
                        patientScores[k][criterionKey][subCriterionKey]
                    )
                )
            );
            console.log(`Матриця порівнянь пацієнтів (A):`);
            console.table(formatMatrixForTable(patientComparisonMatrix, 'A'));
            
            const patientAhp = calculateAhp(patientComparisonMatrix);
            const patientPrioritiesForSubcriterion = patientAhp.weights;

            // === ДОДАЙТЕ ЦЕЙ БЛОК ЛОГУВАННЯ ===
            console.log(`Максимальне власне число (λ_max): ${patientAhp.lambdaMax.toFixed(3)}`);
            console.log(`Індекс узгодженості (CI): ${patientAhp.CI.toFixed(3)}`);
            console.log(`Ступінь узгодженості (CR): ${patientAhp.CR.toFixed(3)}, Узгоджено: ${patientAhp.isConsistent}`);
            // ===================================
            
            console.log(`Пріоритети пацієнтів (локальні вектори p_ijl) для "${subCriterionInfo.names[l]}":`);
            console.table(formatWeightsForTable(patientPrioritiesForSubcriterion, patients.map(p => p.cardId), "Пацієнт", "Пріоритет"));
            
            for (let i = 0; i < patients.length; i++) {
                patientScoresForCriterion[i] += patientPrioritiesForSubcriterion[i] * subCriteriaWeights[criterionKey][l];
            }
            console.groupEnd();
        });
        
        console.log(`%cЗважені оцінки (p_ij) за критерієм "${criterionName}":`, 'font-weight: bold;');
        console.table(formatWeightsForTable(patientScoresForCriterion, patients.map(p => p.cardId), "Пацієнт", "Зважена оцінка"));
        for (let i = 0; i < patients.length; i++) {
            patientPriorities[i][criterionKey] = patientScoresForCriterion[i];
        }
        console.groupEnd();
    });
    console.groupEnd();

    // --- Крок 6: Обчислення загального пріоритету та ранжування ---
    console.group("Крок 6: Фінальний розрахунок та ранжування");
    const finalPriorities = patients.map((patient, i) => {
        const totalPriority = ahpStructure.criteria.keys.reduce((sum, key, j) => {
            return sum + (patientPriorities[i][key] || 0) * criteriaWeights[j];
        }, 0);

        return {
            patientId: patient._id,
            cardId: patient.cardId,
            patientName: patient.patientInfo?.patientFullName || 'Невідомо',
            finalPriority: totalPriority,
        };
    });

    finalPriorities.sort((a, b) => b.finalPriority - a.finalPriority);

    console.log("%cЗагальні пріоритети пацієнтів (P_i):", 'font-weight: bold;');
    console.table(finalPriorities.map(p => ({ 'ID': p.cardId, 'Ім\'я': p.patientName, 'Фінальний пріоритет': p.finalPriority.toFixed(3) })));
    console.log("%cФІНАЛЬНИЙ ВІДСОРТОВАНИЙ СПИСОК", "color: green; font-weight: bold;");
    console.table(finalPriorities.map((p, index) => ({ 'Ранг': index + 1, 'Ім\'я': p.patientName, 'ID': p.cardId, 'Пріоритет': p.finalPriority.toFixed(3) })));
    console.groupEnd();

    return { rankedPatients: finalPriorities };
}