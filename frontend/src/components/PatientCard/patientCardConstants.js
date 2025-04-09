// src/constants/formConstants.js

// Об'єкт, що містить всі константи форми
export const constants = {

    // --- Списки Опцій ---

    // Для PatientDataSection
    genders: ['Чоловіча', 'Жіноча'],
    categories: ['Цивільний', 'Військовослужбовець', 'Полонений', 'Інше'],
    militaryRanks: ["", "Солдат", "Старший солдат", "Молодший сержант", /* ... інші ... */ "Генерал"], // Додано "" для плейсхолдера Select
    allergyOptions: ['Ні', 'Невідомо', 'Так'],
    commonAllergens: [ // Для підказки або вибору
      "",
      "Пеніцилін",
      "Сульфаніламіди",
      "Аспірин (НПЗЗ)",
      "Опіоїди (напр., Морфін)",
      "Йод (контраст)",
      "Латекс",
      "Продукти харчування (вкажіть)",
      "Укуси комах",
      "Пилок",
      "Інше (вкажіть)",
    ],
    transportTypes: ["", 'Casevac', 'MMPM', 'Medevac'], // Додано "" для плейсхолдера Select
    medicalRoles: ["", 'Роль 1', 'Роль 2', 'Роль 3', 'Роль 4'], // Додано "" для плейсхолдера Select
    triageCategories: [
        "", // Для плейсхолдера Select
        'T1 / Негайна (Червоний)',
        'T2 / Відстрочена (Жовтий)',
        'T3 / Мінімальна (Зелений)',
        'T4 / Очікувальна (Синій)',
    ],
    branchesOfService: [ // Роди військ/Сили
      "",
      "Сухопутні війська",
      "Повітряні Сили",
      "Військово-Морські Сили",
      "Десантно-штурмові війська",
      "Сили спеціальних операцій",
      "Сили територіальної оборони",
      "Війська зв'язку та кібербезпеки",
      "Сили логістики",
      "Сили підтримки",
      "Медичні сили",
      "Військова служба правопорядку",
      "Державна спеціальна служба транспорту",
      "Національна гвардія України",
      "Державна прикордонна служба України",
      "Служба безпеки України (ЦСО 'А')",
      "Головне управління розвідки МОУ",
      "Інше",
    ],

    // Для PriorAidSection
    priorAid: { // Групуємо константи PriorAid для кращої організації
        aidProviders: ['ОСД', 'НП', 'МедП', 'Невідомо', 'Не надавалась'],
        medicationRoutes: [
          "",
          "PO (Перорально)",
          "IV (Внутрішньовенно)",
          "IM (Внутрішньом'язово)",
          "IN (Інтраназально)",
          "IO (Внутрішньокістково)",
          "PR (Ректально)",
          "SC/SubQ (Підшкірно)", // Об'єднано
          "Transbucal (Трансбукально)",
          "Sublingual (Сублінгвально)",
          "Інший"
        ],
        tourniquetLimbKeys: [
            { key: 'rightUpperLimb', label: 'ПВК' },
            { key: 'leftUpperLimb', label: 'ЛВК' },
            { key: 'rightLowerLimb', label: 'ПНК' },
            { key: 'leftLowerLimb', label: 'ЛНК' },
        ],
        // Ключі медикаментів для циклів та логіки
        medicationKeys: ['pillPack', 'tranexamicAcid', 'analgesic', 'antibiotic'],
    },

    // Інші списки (можуть знадобитися для майбутніх секцій або розширень)
    mechanismsOfInjury: [
        "",
        "Артобстріл",
        "Тупа травма",
        "Опік",
        "Падіння з висоти",
        "Граната",
        "Вогнепальна рана",
        "СВП (Саморобний вибуховий пристрій)",
        "Протипіхотна міна",
        "ДТП",
        "РПГ",
        "Інше",
    ],
    hypothermiaPreventionTypes: [
        "",
        "Пасивне (Ковдра/Термо/Рятувальна)", // Об'єднано
        "Активне (Зовнішнє тепло)",
        "Активне + Пасивне",
        "Інше...",
    ],
    dosageUnits: ["", "мг", "мкг", "мл", "г", "од", "таб"],
    commonFluids: [
        "",
        "Фіз. розчин (NaCl 0.9%)",
        "Розчин Рінгера Лактат", // Уточнено
        "ГЕК (Гідроксиетилкрохмаль)",
        "Плазма",
        "Еритроцитарна маса",
        "Цільна кров",
        "Інше...",
    ],
    fluidRoutes: [
        "",
        "IV (Внутрішньовенно)",
        "IO (Внутрішньокістково)",
        // "PO (Перорально)", // Прибрано як менш релевантне для інфузій
        // "PR (Ректально)",  // Прибрано як менш релевантне
    ],
    evacuationPriorities: ["", "Невідкладна", "Пріоритетна", "Звичайна"],
    tourniquetTypes: [
        "", "CAT", "SOFTT-W", "SAM XT", "TMT", "SICH",
        "Джгут Есмарха", "Імпровізований", "Невідомо", "Інше"
    ],
    commonMedications: [ // Список для підказок
        "", "TXA (Транексамова к-та)", "Meloxicam", "Moxifloxacin", "Ertapenem",
        "Ketamine", "Fentanyl", "Nalbuphine", "Ondansetron", "Цефтріаксон",
        "Парацетамол", "Морфін", "Налоксон", "Антибіотик (загальний)", "Інше..."
    ],


    // --- Початковий Стан Форми ---
    initialPriorAidState: {
        aidTime: '',
        aidDate: '',
        aidProvider: '',
        vitalSigns: { respiratoryRate: '', spo2: '', pulse: '', bloodPressure: '', avpu: '', painScale: '' },
        interventions: { bandage: false, tamponade: false, o2: false, oropharyngealAirway: false, nasopharyngealAirway: false, supraglotticAirway: false, endotrachealTube: false, cricothyrotomy: false, bagValveMask: false, needleDecompression: false, occlusiveDressing: false, ivAccess: false, ioAccess: false, hypothermiaPrevention: false, immobilization: false, eyeShield: false, otherIntervention: false, otherInterventionDetails: '' },
        tourniquets: {
            rightUpperLimb: { appliedTime: '', removedTime: '', convertedTime: '', relocatedTime: '' },
            leftUpperLimb:  { appliedTime: '', removedTime: '', convertedTime: '', relocatedTime: '' },
            rightLowerLimb: { appliedTime: '', removedTime: '', convertedTime: '', relocatedTime: '' },
            leftLowerLimb:  { appliedTime: '', removedTime: '', convertedTime: '', relocatedTime: '' },
            abdominalTourniquet: { appliedTime: '', removedTime: '' },
            junctionalTourniquet: { appliedTime: '', removedTime: '' },
        },
        medications: {
            pillPack:       { given: false, details: { dose: '', route: '', time: '' } },
            tranexamicAcid: { given: false, details: { dose: '', route: '', time: '' } },
            analgesic:      { given: false, details: { dose: '', route: '', time: '' } },
            antibiotic:     { given: false, details: { dose: '', route: '', time: '' } },
        },
        medicationNotes: '',
    },

    get initialFormData() { // Використовуємо getter для доступу до initialPriorAidState
      return {
        // Розділ 1
        isUnknown: false,
        gender: '',
        category: '',
        fullName: '',
        dob: '',
        militaryId: '',
        militaryRank: '',
        militaryUnit: '',
        allergyPresence: '',
        allergyDetails: '',
        eventDate: '',
        eventTime: '',
        arrivalDate: '',
        arrivalTime: '',
        transportType: '',
        originType: 'location',
        arrivalLocationName: '',
        medicalUnitName: '',
        medicalRole: '',
        triageCategory: '',
        // Розділ 2
        priorAid: this.priorAid.initialState, // Посилання на початковий стан priorAid
      };
    },

    // --- Інші Константи ---
    API_ENDPOINT: '/api/casualty-cards', // Замініть на ваш реальний ендпоінт
}

// Експортуємо весь об'єкт constants за замовчуванням
export default constants;