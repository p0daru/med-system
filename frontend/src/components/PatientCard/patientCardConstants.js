// frontend/src/utils/patientCardConstants.js

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Чоловіча' },
  { value: 'female', label: 'Жіноча' },
  { value: 'other', label: 'Інша' },
  { value: 'unknown', label: 'Невідомо / Не вказано' },
];

// A - Airway & C - Consciousness
export const CONSCIOUSNESS_LEVELS_AVPU = [
  { value: 'A', label: 'A - Alert (Притомний, орієнтований)' },
  { value: 'V', label: 'V - Voice (Реагує на голос)' },
  { value: 'P', label: 'P - Pain (Реагує на біль)' },
  { value: 'U', label: 'U - Unresponsive (Непритомний)' },
  { value: 'Unknown', label: 'Невідомо' },
];

export const AIRWAY_STATUS_OPTIONS = [
  { value: 'clear_open_spontaneous', label: 'Прохідні, дихає самостійно' },
  { value: 'clear_maintained_manual', label: 'Прохідні, підтримуються мануально (потрійний прийом)' },
  { value: 'clear_maintained_device', label: 'Прохідні, підтримуються пристроєм (назо/орофарингеальний повітропровід)' },
  { value: 'partially_obstructed_tongue', label: 'Частково обтуровані (западіння язика)' },
  { value: 'partially_obstructed_foreign_body', label: 'Частково обтуровані (стороннє тіло, блювотні маси)' },
  { value: 'fully_obstructed', label: 'Повністю обтуровані' },
  { value: 'secured_advanced_device', label: 'Забезпечені інвазивним пристроєм (ЕТТ, ЛМА, Комбітьюб, коніко/трахеостома)' },
  { value: 'unknown', label: 'Невідомо / Не оцінено' },
];

// B - Breathing
export const BREATHING_RATE_OPTIONS = [
  { value: '0', label: '0 (Апное)' },
  { value: '1-5', label: '1-5 (Агональне/Дуже рідкісне)' },
  { value: '6-9', label: '6-9 (Виражене брадипное)' },
  { value: '10-12', label: '10-12 (Брадипное/Нижня межа норми)' },
  { value: '13-20', label: '13-20 (Нормопное)' },
  { value: '21-24', label: '21-24 (Помірне тахипное)' },
  { value: '25-30', label: '25-30 (Тахипное)' },
  { value: '>30', label: '>30 (Виражене тахипное)' },
  { value: 'custom', label: 'Інше (ввести вручну)' },
];

export const OXYGEN_SATURATION_OPTIONS = [
  { value: '<85', label: '<85% (Важка гіпоксемія)' },
  { value: '85-89', label: '85-89% (Помірна гіпоксемія)' },
  { value: '90-93', label: '90-93% (Легка гіпоксемія)' },
  { value: '>=94', label: '>=94% (Норма)' },
  { value: 'unable', label: 'Неможливо виміряти' },
  { value: 'custom', label: 'Інше (ввести вручну)' },
];

export const BREATHING_QUALITY_OPTIONS = [
  { value: 'normal_effortless_symmetric', label: 'Нормальне, без зусиль, симетричне, достатньої глибини' },
  { value: 'shallow_rapid', label: 'Поверхневе, часте' },
  { value: 'shallow_slow', label: 'Поверхневе, рідкісне' },
  { value: 'deep_labored_accessory_muscles', label: 'Глибоке, утруднене (з участю допоміжних м\'язів)' },
  { value: 'noisy_stridor', label: 'Гучне (стридор - вдих)' },
  { value: 'noisy_wheezing', label: 'Гучне (свистяче, хрипи - видих)' },
  { value: 'noisy_gurgling_crackles', label: 'Гучне (булькаюче, клекочуче, вологі хрипи)' },
  { value: 'paradoxical_chest_movement', label: 'Парадоксальні рухи грудної клітки' },
  { value: 'apneic_no_effort', label: 'Апное (дихальні рухи відсутні)' },
  { value: 'agonal_gasping', label: 'Агональне (поодинокі, неефективні вдихи)' },
  { value: 'unknown', label: 'Невідомо / Не оцінено' },
];
export const CHEST_EXCURSION_OPTIONS = [
    { value: 'symmetric_adequate', label: 'Симетрична, достатня' },
    { value: 'symmetric_reduced', label: 'Симетрична, знижена' },
    { value: 'asymmetric', label: 'Асиметрична' },
    { value: 'absent', label: 'Відсутня' },
];
export const AUSCULTATION_LUNGS_OPTIONS = [
    { value: 'clear_bilaterally', label: 'Везикулярне, проводиться з обох сторін' },
    { value: 'reduced_left', label: 'Ослаблене зліва' },
    { value: 'reduced_right', label: 'Ослаблене справа' },
    { value: 'absent_left', label: 'Відсутнє зліва' },
    { value: 'absent_right', label: 'Відсутнє справа' },
    { value: 'crackles_rales', label: 'Вологі хрипи (крепітація)' },
    { value: 'wheezes_rhonchi', label: 'Сухі свистячі хрипи (ронхи)' },
    { value: 'unable', label: 'Неможливо провести аускультацію' },
];


// C - Circulation
export const PULSE_RATE_OPTIONS = [ // ... (без змін)
  { value: '0', label: '0 (Асистолія/Відсутній)' },
  { value: '<40', label: '<40 (Виражена брадикардія)' },
  { value: '40-59', label: '40-59 (Брадикардія)' },
  { value: '60-100', label: '60-100 (Нормокардія)' },
  { value: '101-120', label: '101-120 (Помірна тахікардія)' },
  { value: '121-150', label: '121-150 (Тахікардія)' },
  { value: '>150', label: '>150 (Виражена тахікардія/Пароксизм)' },
  { value: 'custom', label: 'Інше (ввести вручну)' },
];

export const PULSE_QUALITY_OPTIONS = [ // ... (без змін)
  { value: 'strong_regular', label: 'Сильний, регулярний' },
  { value: 'weak_regular', label: 'Слабкий (ниткоподібний), регулярний' },
  { value: 'strong_irregular', label: 'Сильний, нерегулярний (аритмія)' },
  { value: 'weak_irregular', label: 'Слабкий, нерегулярний' },
  { value: 'absent_peripheral', label: 'Відсутній на периферичних артеріях' },
  { value: 'absent_central', label: 'Відсутній на центральних артеріях' },
  { value: 'unknown', label: 'Невідомо / Не пальпується' },
];
export const PULSE_LOCATION_OPTIONS = [
    { value: 'radial', label: 'Променева (Radial)' },
    { value: 'carotid', label: 'Сонна (Carotid)' },
    { value: 'femoral', label: 'Стегнова (Femoral)' },
    { value: 'brachial', label: 'Плечова (Brachial)' },
    { value: 'pedal', label: 'Стопи (Pedal)' },
    { value: 'other', label: 'Інша / Не пальпується' },
];


export const CAPILLARY_REFILL_TIME_OPTIONS = [ // ... (без змін)
  { value: '<2', label: '< 2 секунд (норма)' },
  { value: '2-3', label: '2-3 секунди (сповільнене)' },
  { value: '>3', label: '> 3 секунд (значно сповільнене / шок)' },
  { value: 'unable', label: 'Неможливо визначити (холод, темрява)' },
];

export const SKIN_STATUS_OPTIONS = [ // ... (без змін)
  { value: 'pink_warm_dry', label: 'Рожева, тепла, суха (норма)' },
  { value: 'pale_cool_clammy', label: 'Бліда, холодна, волога (шок)' },
  { value: 'pale_warm_dry', label: 'Бліда, тепла, суха' },
  { value: 'cyanotic_central', label: 'Ціанотична (центральний ціаноз)' },
  { value: 'cyanotic_peripheral', label: 'Ціанотична (периферичний ціаноз)' },
  { value: 'flushed_hot_dry', label: 'Гіперемована (червона), гаряча, суха (гіпертермія, запалення)' },
  { value: 'flushed_hot_moist', label: 'Гіперемована, гаряча, волога' },
  { value: 'jaundiced', label: 'Жовтянична' },
  { value: 'mottled', label: 'Мармурова' },
  { value: 'unknown', label: 'Невідомо / Не оцінено' },
];
export const EXTERNAL_BLEEDING_OPTIONS = [
    { value: 'none_visible', label: 'Видима відсутня' },
    { value: 'minor_capillary', label: 'Незначна, капілярна/венозна, контрольована' },
    { value: 'moderate_venous', label: 'Помірна, венозна, потребує контролю' },
    { value: 'severe_arterial_pulsating', label: 'Масивна, артеріальна, пульсуюча' },
    { value: 'internal_suspected', label: 'Підозра на внутрішню кровотечу' },
];


// D - Disability (Neurological status)
export const GCS_EYE_OPTIONS = [ // ... (без змін)
    { value: '4', label: '4 - Спонтанне відкриття' },
    { value: '3', label: '3 - На голос' },
    { value: '2', label: '2 - На біль' },
    { value: '1', label: '1 - Не відкриває' },
    { value: 'NV', label: 'T - Травма/Набряк (неможливо оцінити)' },
];
export const GCS_VERBAL_OPTIONS = [ // ... (без змін)
    { value: '5', label: '5 - Орієнтована мова' },
    { value: '4', label: '4 - Сплутана мова' },
    { value: '3', label: '3 - Невідповідні слова' },
    { value: '2', label: '2 - Незрозумілі звуки' },
    { value: '1', label: '1 - Мова відсутня' },
    { value: 'NV', label: 'E - Ендотрахеальна трубка (неможливо оцінити)' },
];
export const GCS_MOTOR_OPTIONS = [ // ... (без змін)
    { value: '6', label: '6 - Виконує команди' },
    { value: '5', label: '5 - Локалізує біль' },
    { value: '4', label: '4 - Відсмикування на біль' },
    { value: '3', label: '3 - Декортикація (патологічне згинання)' },
    { value: '2', label: '2 - Децеребрація (патологічне розгинання)' },
    { value: '1', label: '1 - Рухи відсутні' },
    { value: 'NV', label: 'P - Параліч/Травма (неможливо оцінити)' },
];

export const PUPIL_REACTION_OPTIONS = [ // ... (без змін)
  { value: 'PERRLA', label: 'PERRLA (рівні, круглі, реактивні на світло та акомодацію)' },
  { value: 'equal_reactive', label: 'Рівні, реактивні на світло' },
  { value: 'equal_sluggish', label: 'Рівні, реакція млява' },
  { value: 'equal_nonreactive', label: 'Рівні, нереактивні (фіксовані)' },
  { value: 'unequal_anisocoria', label: 'Нерівні (анізокорія)' },
  { value: 'pinpoint', label: 'Точкові (міоз)' },
  { value: 'dilated_fixed', label: 'Розширені, фіксовані (мідріаз)' },
  { value: 'constricted', label: 'Звужені (міоз)' },
  { value: 'unable', label: 'Неможливо оцінити (травма ока)' },
];
export const MOTOR_SENSORY_STATUS_OPTIONS = [
    {value: "intact_all_extremities", label: "Збережені в усіх кінцівках"},
    {value: "deficit_upper_left", label: "Дефіцит - верхня ліва"},
    {value: "deficit_upper_right", label: "Дефіцит - верхня права"},
    {value: "deficit_lower_left", label: "Дефіцит - нижня ліва"},
    {value: "deficit_lower_right", label: "Дефіцит - нижня права"},
    {value: "paraplegia", label: "Параплегія"},
    {value: "tetraplegia", label: "Тетраплегія"},
    {value: "unable_to_assess", label: "Неможливо оцінити"},
];

// E - Exposure / Environment
export const BODY_TEMPERATURE_OPTIONS = [ // ... (без змін)
    { value: '<35', label: '< 35.0°C (Гіпотермія)' },
    { value: '35.0-36.0', label: '35.0 - 36.0°C (Знижена)' },
    { value: '36.1-37.2', label: '36.1 - 37.2°C (Нормотермія)' },
    { value: '37.3-38.0', label: '37.3 - 38.0°C (Субфебрильна)' },
    { value: '>38.0', label: '> 38.0°C (Гіпертермія/Гарячка)' },
    { value: 'custom', label: 'Інше (ввести вручну)' },
];
export const TRAUMA_TYPE_OPTIONS = [ // Для поля "Тип травми" в описі ушкоджень
    { value: 'abrasion', label: 'Садно/Подряпина' },
    { value: 'laceration', label: 'Рвана рана' },
    { value: 'incision', label: 'Різана рана' },
    { value: 'puncture', label: 'Колота рана' },
    { value: 'avulsion', label: 'Авульсія/Скальпована рана' },
    { value: 'amputation', label: 'Ампутація' },
    { value: 'contusion', label: 'Забій/Гематома' },
    { value: 'fracture_closed', label: 'Перелом (закритий)' },
    { value: 'fracture_open', label: 'Перелом (відкритий)' },
    { value: 'dislocation', label: 'Вивих' },
    { value: 'sprain_strain', label: 'Розтягнення/Надрив зв\'язок/м\'язів' },
    { value: 'burn_thermal', label: 'Опік (термічний)' },
    { value: 'burn_chemical', label: 'Опік (хімічний)' },
    { value: 'burn_electrical', label: 'Опік (електричний)' },
    { value: 'gunshot_wound', label: 'Вогнепальне поранення' },
    { value: 'stab_wound', label: 'Ножове поранення' },
    { value: 'crush_injury', label: 'Синдром тривалого стиснення / Краш-травма' },
    { value: 'head_injury_closed', label: 'ЧМТ (закрита)' },
    { value: 'head_injury_open', label: 'ЧМТ (відкрита)' },
    { value: 'spinal_injury', label: 'Травма хребта' },
    { value: 'chest_injury_blunt', label: 'Травма грудної клітки (тупа)' },
    { value: 'chest_injury_penetrating', label: 'Травма грудної клітки (проникаюча)' },
    { value: 'abdominal_injury_blunt', label: 'Травма живота (тупа)' },
    { value: 'abdominal_injury_penetrating', label: 'Травма живота (проникаюча)' },
    { value: 'other', label: 'Інше' },
];

// Інші константи
export const TRANSPORTATION_METHOD_OPTIONS = [ // ... (без змін)
  { value: 'emd_c', label: 'Автомобіль ЕМД (клас C)' },
  { value: 'emd_b', label: 'Автомобіль ЕМД (клас B)' },
  { value: 'emd_other', label: 'Автомобіль ЕМД (інший)' },
  { value: 'military_transport', label: 'Санітарний транспорт ЗСУ / ін. силових відомств' },
  { value: 'associated_specialized', label: 'Попутний спеціалізований транспорт' },
  { value: 'associated_nonspecialized', label: 'Попутний неспеціалізований транспорт' },
  { value: 'air_helicopter', label: 'Авіаційний транспорт (гелікоптер)' },
  { value: 'air_plane', label: 'Авіаційний транспорт (літак)' },
  { value: 'on_foot', label: 'Пішки (якщо можливо)' },
  { value: 'other', label: 'Інше (вказати)' },
  { value: 'not_transported', label: 'Не транспортувався / Відмова від транспортування' },
];

export const TRIAGE_CATEGORIES_OPTIONS = [ // ... (без змін)
  { value: 'green', label: 'I (Незначні / Зелений)', color: 'green.500' },
  { value: 'yellow', label: 'II (Відстрочені / Жовтий)', color: 'yellow.500' },
  { value: 'red', label: 'III (Невідкладні / Червоний)', color: 'red.500' },
  { value: 'black', label: 'IV (Померлі / Чорний)', color: 'black' },
  { value: 'unknown', label: 'Не визначено', color: 'gray.500' },
];

export const EFFECTIVENESS_OPTIONS = [ // ... (без змін)
    { value: 'effective', label: 'Ефективно' },
    { value: 'partially_effective', label: 'Частково ефективно' },
    { value: 'not_effective', label: 'Не ефективно' },
    { value: 'not_assessed', label: 'Не оцінювалась / Не застосовно' },
];

export const SCENE_TYPE_OPTIONS = [
    { value: 'dtp_pedestrian', label: 'ДТП (пішохід)' },
    { value: 'dtp_driver_passenger', label: 'ДТП (водій/пасажир)' },
    { value: 'dtp_cyclist_motorcyclist', label: 'ДТП (велосипедист/мотоцикліст)' },
    { value: 'fall_height', label: 'Падіння з висоти' },
    { value: 'fall_same_level', label: 'Падіння на рівній поверхні' },
    { value: 'assault_blunt', label: 'Напад/Бійка (тупа травма)' },
    { value: 'assault_penetrating', label: 'Напад/Бійка (проникаюча травма)' },
    { value: 'gunshot', label: 'Вогнепальне поранення' },
    { value: 'explosion', label: 'Вибухова травма' },
    { value: 'burn', label: 'Опік' },
    { value: 'drowning', label: 'Утоплення' },
    { value: 'industrial_accident', label: 'Виробнича травма' },
    { value: 'domestic_accident', label: 'Побутова травма' },
    { value: 'natural_disaster', label: 'Природне лихо (землетрус, повінь тощо)' },
    { value: 'building_collapse', label: 'Обвал будівлі' },
    { value: 'sports_injury', label: 'Спортивна травма' },
    { value: 'other', label: 'Інше (вказати)' },
    { value: 'unknown', label: 'Невідомо' },
];

export const MEDICATION_ROUTE_OPTIONS = [
    { value: 'iv', label: 'В/в (внутрішньовенно)' },
    { value: 'im', label: 'В/м (внутрішньом\'язово)' },
    { value: 'sc', label: 'П/ш (підшкірно)' },
    { value: 'po', label: 'Per os (перорально)' },
    { value: 'sl', label: 'Sublingual (сублінгвально)' },
    { value: 'in', label: 'ІN (інтраназально)' },
    { value: 'io', label: 'В/к (внутрішньокістково)' },
    { value: 'inh', label: 'Інгал. (інгаляційно)' },
    { value: 'rectal', label: 'Ректально' },
    { value: 'topical', label: 'Місцево (нашкірно)' },
    { value: 'other', label: 'Інший' },
];

export const COMMON_PREHOSPITAL_MEDICATIONS = [ // Приклад автодоповнення
    "Адреналін (Епінефрин)", "Аміодарон", "Атропін", "Ацетилсаліцилова кислота (Аспірин)",
    "Гепарин", "Глюкоза 40%", "Дексаметазон", "Діазепам (Сибазон)", "Димедрол",
    "Допамін", "Ібупрофен", "Кеторолак (Кетанов)", "Кислота транексамова", "Клопідогрель",
    "Кордарон (Аміодарон)", "Лідокаїн", "Магнію сульфат", "Метоклопрамід (Церукал)",
    "Морфін", "Налоксон", "Нітрогліцерин (спрей/табл.)", "Но-шпа (Дротаверин)",
    "Парацетамол", "Преднізолон", "Сальбутамол (Вентолін)", "Розчин NaCl 0.9%", "Розчин Рінгера лактат",
    "Фентаніл", "Фуросемід (Лазикс)", "Цефтріаксон", "Анальгін (Метамізол натрію)",
];

export const COMMON_PREHOSPITAL_PROCEDURES = [ // Приклад автодоповнення
    "Зупинка зовнішньої кровотечі (джгут, тиснуча пов'язка)", "Іммобілізація шийна/кінцівок",
    "В/в доступ (периферичний катетер)", "В/к доступ", "Інфузійна терапія",
    "Оксигенотерапія (маска, канюлі)", "Небулайзерна терапія", "Промивання шлунка",
    "Катетеризація сечового міхура", "Інтубація трахеї", "Конікотомія/Трахеостомія",
    "Ларингеальна маска/Комбітьюб", "Серцево-легенева реанімація (СЛР)", "Дефібриляція/Кардіоверсія",
    "ЕКГ моніторинг", "Пульсоксиметрія", "Капнографія", "Глюкометрія", "Термометрія",
    "Обробка ран/опіків", "Асептична пов'язка", "Оклюзійна пов'язка (при пневмотораксі)",
    "Декомпресія напруженого пневмотораксу (голкова торакоцентез)",
    "Аспірація вмісту з дихальних шляхів", "Зігрівання/Охолодження пацієнта",
];


export const INITIAL_PRE_HOSPITAL_FORM_DATA = {
  cardId: '',
  incidentDateTime: '', 
  arrivalDateTime: '', 
  sceneType: '', 
  sceneTypeOther: '', // Для "Інше" в типі місця події
  patientFullName: '', 
  patientGender: '', 
  patientDateOfBirth: '', 
  patientApproximateAge: '', 
  
  catastrophicHemorrhageControlled: false, 
  catastrophicHemorrhageDetails: '', 

  consciousnessLevel: '', 
  airwayStatus: '', 
  
  breathingRate: '', 
  breathingSaturation: '', 
  breathingQuality: '',
  chestExcursion: '', 
  auscultationLungs: '', 
  
  pulseRate: '', 
  pulseQuality: '',
  pulseLocation: '', 
  bloodPressureSystolic: '', 
  bloodPressureDiastolic: '', 
  capillaryRefillTime: '', 
  skinStatus: '',
  externalBleeding: '', 

  glasgowComaScaleEye: '', 
  glasgowComaScaleVerbal: '', 
  glasgowComaScaleMotor: '', 
  pupilReaction: '',
  motorSensoryStatus: '', 

  bodyTemperature: '', 
  exposureDetails: '', 

  complaints: '', 
  allergies: '', 
  medicationsTaken: '', 
  pastMedicalHistory: '', 
  lastOralIntakeMeal: '', 
  lastOralIntakeTime: '', 
  eventsLeadingToInjury: '', 
  mechanismOfInjuryDetailed: '', 

  medicationsAdministered: [{ name: '', customName: '', dosage: '', route: '', customRoute: '', time: '', effectiveness: '' }],
  proceduresPerformed: [{ name: '', customName: '', time: '', details: '', effectiveness: '' }],
  ivAccessDetails: '', 

  transportationMethod: '', 
  transportationOtherDetails: '', 
  destinationFacility: '', 
  // Поля часу транспортування та передачі прибрані

  triageCategory: '', 
  // rtsScore: '', // Прибрано
  additionalNotes: '', 
  // medicalTeamMembers: '', // Прибрано
  medicalTeamResponsible: '', 
};