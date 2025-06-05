const patient1 = {
  patientFullName: 'Петренко Іван Васильович',
  patientGender: 'male',
  patientApproximateAge: '35',
  sceneTypeValue: 'dtp_driver_passenger',
  // A - Дихальні шляхи
  airwayStatus: 'partially_obstructed_tongue', // Западіння язика через зниження свідомості
  consciousnessLevel: 'P', // Реагує на біль
  // B - Дихання
  breathingRate: '>30', // Виражене тахипное
  breathingSaturation: '<85', // Важка гіпоксемія
  breathingQuality: 'shallow_rapid', // Поверхневе, часте
  chestExcursion: 'asymmetric', // Асиметрична (підозра на пневмоторакс)
  auscultationLungs: 'absent_left', // Відсутнє дихання зліва
  // C - Кровообіг
  pulseRate: '>150', // Виражена тахікардія (компенсаторна)
  pulseQuality: 'weak_regular', // Слабкий (ниткоподібний)
  pulseLocation: 'carotid', // На сонній пальпується, на променевій може бути відсутній
  capillaryRefillTime: '>3', // Значно сповільнене / шок
  skinStatus: 'pale_cool_clammy', // Шок
  externalBleeding: 'moderate_venous', // Кровотеча з рани на голові, контрольована пов'язкою
  // D - Неврологія
  glasgowComaScaleEye: '2', // На біль
  glasgowComaScaleVerbal: '2', // Незрозумілі звуки
  glasgowComaScaleMotor: '3', // Декортикація (патологічне згинання)
  pupilReaction: 'unequal_anisocoria', // Нерівні (анізокорія) - ознака ЧМТ
  motorSensoryStatus: "deficit_lower_left", // Можлива травма хребта або тазу
  // E - Загальний стан / Оточення
  bodyTemperature: '35.0-36.0', // Знижена (втрата тепла, шок)
  // Кількість медикаментів/маніпуляцій (умовно)
  medicationsAdministered: [ { name: "Розчин NaCl 0.9%", route: "iv", dose: "500ml" }, { name: "Кеторолак", route: "im", dose: "30mg" } ], // 2 медикаменти
  proceduresPerformed: [ { name: "В/в доступ" }, { name: "Зупинка кровотечі (пов'язка)" }, { name: "Декомпресія напруженого пневмотораксу (голкова)" } ], // 3 маніпуляції
  triageCategory: 'red',
};

const patient2 = {
  patientFullName: 'Сидоренко Марія Петрівна',
  patientGender: 'female',
  patientApproximateAge: '68',
  sceneTypeValue: 'other', // Раптове погіршення стану вдома
  sceneTypeOther: 'Гострий стан вдома',
  // A - Дихальні шляхи
  airwayStatus: 'clear_open_spontaneous', // Прохідні, дихає самостійно (але дихання утруднене)
  consciousnessLevel: 'V', // Реагує на голос, але сплутана
  // B - Дихання
  breathingRate: '25-30', // Тахипное
  breathingSaturation: '85-89', // Помірна гіпоксемія
  breathingQuality: 'noisy_gurgling_crackles', // Гучне (булькаюче, вологі хрипи - набряк легень)
  chestExcursion: 'symmetric_reduced', // Симетрична, знижена
  auscultationLungs: 'crackles_rales', // Вологі хрипи (крепітація) білатерально
  // C - Кровообіг
  pulseRate: '121-150', // Тахікардія
  pulseQuality: 'weak_irregular', // Слабкий, нерегулярний (аритмія)
  pulseLocation: 'radial', // Ще пальпується на променевій, але слабкий
  bloodPressureSystolic: '80', // Гіпотензія
  bloodPressureDiastolic: '50',
  capillaryRefillTime: '>3', // Значно сповільнене
  skinStatus: 'pale_cool_clammy', // Шок
  externalBleeding: 'none_visible',
  // D - Неврологія
  glasgowComaScaleEye: '3', // На голос
  glasgowComaScaleVerbal: '4', // Сплутана мова
  glasgowComaScaleMotor: '5', // Локалізує біль (наприклад, при пальпації)
  pupilReaction: 'equal_reactive', // Рівні, реактивні (поки що без вираженої гіпоксії мозку)
  motorSensoryStatus: "intact_all_extremities",
  // E - Загальний стан / Оточення
  bodyTemperature: '36.1-37.2', // Нормотермія
  medicationsAdministered: [ { name: "Аспірин", route: "po", dose: "300mg" }, { name: "Нітрогліцерин", route: "sl", dose: "1 таб" }, { name: "Морфін", route: "iv", dose: "2mg" } ], // 3 медикаменти
  proceduresPerformed: [ { name: "Оксигенотерапія (маска)" }, { name: "В/в доступ" }, { name: "ЕКГ моніторинг" } ], // 3 маніпуляції
  triageCategory: 'red',
};

const patient3 = {
  patientFullName: 'Коваленко Артем Сергійович',
  patientGender: 'male',
  patientApproximateAge: '5', // Вік важливий (фізіологічні резерви)
  sceneTypeValue: 'other',
  sceneTypeOther: 'Алергічна реакція на укус комахи',
  // A - Дихальні шляхи
  airwayStatus: 'partially_obstructed_foreign_body', // Умовно "стороннє тіло" - набряк гортані, язика
  consciousnessLevel: 'V', // Реагує на голос, плаче, неспокійний
  // B - Дихання
  breathingRate: '>30', // Виражене тахипное (компенсаторне)
  breathingSaturation: '90-93', // Легка гіпоксемія (поки що)
  breathingQuality: 'noisy_stridor', // Гучне (стридор - вдих)
  chestExcursion: 'symmetric_adequate', // Ще достатня, але з зусиллям
  auscultationLungs: 'wheezes_rhonchi', // Сухі свистячі хрипи (бронхоспазм)
  // C - Кровообіг
  pulseRate: '>150', // Виражена тахікардія (у дітей норма ЧСС вища)
  pulseQuality: 'weak_regular', // Слабкий
  pulseLocation: 'brachial', // Плечова (у дітей часто)
  capillaryRefillTime: '2-3', // Сповільнене
  skinStatus: 'flushed_hot_moist', // Гіперемована, волога (початково), може бути кропив'янка
  externalBleeding: 'none_visible',
  // D - Неврологія
  glasgowComaScaleEye: '3', // На голос
  glasgowComaScaleVerbal: '2', // Дитина плаче, незрозумілі звуки (складно оцінити мову)
  glasgowComaScaleMotor: '4', // Відсмикування на біль/огляд
  pupilReaction: 'equal_reactive',
  motorSensoryStatus: "intact_all_extremities",
  // E - Загальний стан / Оточення
  bodyTemperature: '37.3-38.0', // Субфебрильна (реакція)
  medicationsAdministered: [ { name: "Адреналін (Епінефрин)", route: "im", dose: "0.15mg" } ], // 1 медикамент (ключовий)
  proceduresPerformed: [ { name: "Оксигенотерапія" } ], // 1 маніпуляція
  triageCategory: 'red',
};

const patient4 = {
  patientFullName: 'Шевченко Олег Ігорович',
  patientGender: 'male',
  patientApproximateAge: '28',
  sceneTypeValue: 'assault_penetrating',
  // A - Дихальні шляхи
  airwayStatus: 'clear_open_spontaneous', // Прохідні, але дихання різко утруднене
  consciousnessLevel: 'A', // Притомний, орієнтований, але виражений неспокій, страх
  // B - Дихання
  breathingRate: '25-30', // Тахипное
  breathingSaturation: '85-89', // Помірна гіпоксемія
  breathingQuality: 'deep_labored_accessory_muscles', // Глибоке, утруднене, "смокчуча" рана на грудях
  chestExcursion: 'asymmetric', // Асиметрична, ослаблення рухів на стороні поранення
  auscultationLungs: 'reduced_right', // Ослаблене дихання справа
  // C - Кровообіг
  pulseRate: '121-150', // Тахікардія
  pulseQuality: 'strong_regular', // Поки що сильний, але частий
  pulseLocation: 'radial',
  capillaryRefillTime: '<2', // Поки норма (немає ознак масивної крововтрати)
  skinStatus: 'pale_warm_dry', // Блідий через біль і стрес, але теплий
  externalBleeding: 'moderate_venous', // Кровотеча з рани, накладено тимчасову пов'язку
  // D - Неврологія
  glasgowComaScaleEye: '4',
  glasgowComaScaleVerbal: '5',
  glasgowComaScaleMotor: '6', // GCS 15, але стан невідкладний через дихання
  pupilReaction: 'PERRLA',
  motorSensoryStatus: "intact_all_extremities",
  // E - Загальний стан / Оточення
  bodyTemperature: '36.1-37.2',
  medicationsAdministered: [ { name: "Кеторолак", route: "im", dose: "30mg" } ], // 1 медикамент
  proceduresPerformed: [ { name: "Оклюзійна пов'язка (при пневмотораксі)" }, { name: "Оксигенотерапія" } ], // 2 маніпуляції
  triageCategory: 'red',
};

const patient5 = {
  patientFullName: 'Мельник Тетяна Олегівна',
  patientGender: 'female',
  patientApproximateAge: '42',
  sceneTypeValue: 'fall_height',
  // A - Дихальні шляхи
  airwayStatus: 'secured_advanced_device', // Заінтубований на місці події бригадою ЕМД
  consciousnessLevel: 'U', // Непритомний (до інтубації був P)
  // B - Дихання
  breathingRate: '10-12', // Контрольоване дихання через мішок Амбу/апарат ШВЛ, якщо підключено (до інтубації - нерегулярне, типу Чейна-Стокса)
  breathingSaturation: '>=94', // На фоні ШВЛ з киснем
  breathingQuality: 'apneic_no_effort', // Без інтубації/ШВЛ - апное або патологічні типи
  chestExcursion: 'symmetric_adequate', // На фоні ШВЛ
  auscultationLungs: 'clear_bilaterally', // На фоні ШВЛ, якщо немає ускладнень
  // C - Кровообіг
  pulseRate: '<40', // Виражена брадикардія (може бути ознакою підвищеного ВЧТ)
  pulseQuality: 'strong_regular', // "Напружений" пульс
  pulseLocation: 'carotid',
  bloodPressureSystolic: '170', // Гіпертензія (частина рефлексу Кушинга)
  bloodPressureDiastolic: '100',
  capillaryRefillTime: '2-3', // Може бути сповільнене
  skinStatus: 'pink_warm_dry', // Може бути нормальною або навіть гіперемованою
  externalBleeding: 'minor_capillary', // Садна, подряпини на голові
  // D - Неврологія
  glasgowComaScaleEye: '1', // (до інтубації міг бути 2)
  glasgowComaScaleVerbal: 'NV', // Ендотрахеальна трубка (до інтубації міг бути 1-2)
  glasgowComaScaleMotor: '2', // Децеребрація (патологічне розгинання)
  pupilReaction: 'dilated_fixed', // Розширені, фіксовані (дуже поганий прогноз)
  motorSensoryStatus: "tetraplegia", // Підозра на високе ураження спинного мозку
  // E - Загальний стан / Оточення
  bodyTemperature: '>38.0', // Гіпертермія (може бути центрального генезу при ЧМТ)
  medicationsAdministered: [ { name: "Манітол (якщо є набряк мозку)", route: "iv", dose: "1г/кг" }, { name: "Дексаметазон", route: "iv", dose: "8мг" } ], // 2 медикаменти (умовно)
  proceduresPerformed: [ { name: "Інтубація трахеї" }, { name: "ШВЛ" }, { name: "Іммобілізація шийна" }, { name: "В/в доступ" } ], // 4 маніпуляції
  triageCategory: 'red',
};

const patient6 = {
  patientFullName: 'Бондаренко Галина Іванівна',
  patientGender: 'female',
  patientApproximateAge: '78', // Похилий вік, знижені фізіологічні резерви
  sceneTypeValue: 'other',
  sceneTypeOther: 'Загострення хронічного захворювання / Інфекція вдома',
  // A - Дихальні шляхи
  airwayStatus: 'clear_open_spontaneous', // Прохідні
  consciousnessLevel: 'V', // Реагує на голос, але дезорієнтована, млява
  // B - Дихання
  breathingRate: '>30', // Виражене тахипное
  breathingSaturation: '<85', // Важка гіпоксемія
  breathingQuality: 'shallow_rapid', // Поверхневе, часте
  chestExcursion: 'symmetric_reduced',
  auscultationLungs: 'crackles_rales', // Вологі хрипи, ослаблене дихання (пневмонія)
  // C - Кровообіг
  pulseRate: '121-150', // Тахікардія
  pulseQuality: 'weak_regular', // Слабкий, ниткоподібний
  pulseLocation: 'radial',
  bloodPressureSystolic: '70', // Важка гіпотензія
  bloodPressureDiastolic: '40',
  capillaryRefillTime: '>3', // Значно сповільнене
  skinStatus: 'mottled', // Мармурова шкіра, холодна на дотик (ознаки гіпоперфузії)
  externalBleeding: 'none_visible',
  // D - Неврологія
  glasgowComaScaleEye: '3',
  glasgowComaScaleVerbal: '3', // Невідповідні слова
  glasgowComaScaleMotor: '5', // Локалізує біль
  pupilReaction: 'equal_sluggish', // Рівні, реакція млява (через гіпоксію/токсемію)
  motorSensoryStatus: "unable_to_assess", // Важко оцінити через загальний стан
  // E - Загальний стан / Оточення
  bodyTemperature: '>38.0', // Гіпертермія (ознака інфекції) або може бути <35 (гіпотермія при сепсисі у літніх)
  medicationsAdministered: [ { name: "Розчин Рінгера лактат", route: "iv", dose: "1000ml" }, { name: "Цефтріаксон", route: "iv", dose: "2g" } ], // 2 медикаменти
  proceduresPerformed: [ { name: "Оксигенотерапія (високий потік)" }, { name: "В/в доступ (2 катетери для інфузії)" }, { name: "Катетеризація сечового міхура (контроль діурезу)" } ], // 3 маніпуляції
  triageCategory: 'red',
};