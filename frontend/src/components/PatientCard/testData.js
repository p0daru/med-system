// frontend/src/components/PatientCard/testData.js
import constants from './patientCardConstants'; // Нам потрібні константи для деяких значень

// Допоміжні функції для генерації часу/дати (якщо вони не експортуються з PreHospitalCareSection)
const getCurrentTime = () => new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

export const getPreHospitalTestData = (existingInternalCardId = null, existingTempPatientId = null) => {
    const isEditMode = !!existingInternalCardId; // Якщо передано ID, припускаємо режим редагування для ID
    const internalCardId = existingInternalCardId || `TEST-CARD-${Date.now().toString(36).toUpperCase()}`;
    const tempPatientId = existingTempPatientId || `TEST-PAT-${Date.now().toString(36).toUpperCase()}`;

    return {
        // Беремо за основу структуру з констант, щоб не пропустити поля
        ...JSON.parse(JSON.stringify(constants.initialPreHospitalFormData)), 
        internalCardId: internalCardId,
        incidentDateTime: getCurrentDateTimeLocal(),
        reasonForCall: "ДТП, лобове зіткнення, затиснутий водій",
        patientInfo: {
            isUnknown: false,
            tempPatientId: tempPatientId,
            lastName: "Шевченко",
            firstName: "Тарас",
            middleName: "Григорович",
            dateOfBirth: "1990-03-09",
            ageYears: "", // Розрахується або залишиться порожнім, якщо є ДН
            gender: constants.genders[0], // Чоловіча
            contactPhone: "0509876543",
            addressRough: "м. Київ, просп. Перемоги, 15, кв. 3",
            allergiesShort: "Аспірин - кропив'янка",
            medicationsShort: "Лізиноприл 10 мг щоденно (гіпертонія)",
            medicalHistoryShort: "Гіпертонічна хвороба II ст. Виразкова хвороба 12-палої кишки в анамнезі.",
        },
        teamArrivalTimeScene: getCurrentDateTimeLocal(),
        patientContactTime: getCurrentDateTimeLocal(),
        complaints: "Сильний біль у грудній клітці зліва, задишка, біль у лівому стегні. Запаморочення.",
        triageCategory: constants.triageCategories[0], // Червоний
        triageTimestamp: getCurrentTime(),
        marchSurvey: {
            massiveHemorrhageControl: "Видимих зовнішніх масивних кровотеч немає. Підозра на внутрішню кровотечу.",
            airwayManagement: constants.airwayManagementOptions[0], // "Дихальні шляхи вільні, прохідні"
            breathingAssessment: "ЧД 30/хв, поверхневе. SpO2 88% на повітрі. Аускультативно - ослаблене дихання зліва. Крепітація 5-7 ребер зліва. Напружені шийні вени.",
            circulationAssessment: "Пульс 130 уд/хв, ниткоподібний. АТ 80/50 мм рт.ст. Шкіра бліда, волога, холодна на дотик. Капілярне наповнення >3 сек.",
            hypothermiaPreventionHeadInjury: "ШКГ E2V3M4=9. Зіниці D=S, фотореакція в'яла. Накладено термоковдру. Шийний комірець.",
        },
        vitalSignsLog: [
            { ...constants.vitalSignTemplate, timestamp: getCurrentTime(), sbp: '80', dbp: '50', hr: '130', rr: '30', spo2: '88', gcsE: '2', gcsV: '3', gcsM: '4', gcsTotal: '9', painScore: '9' },
            { ...constants.vitalSignTemplate, timestamp: (() => {const d=new Date(); d.setMinutes(d.getMinutes()+5); return d.toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'})})(), sbp: '85', dbp: '55', hr: '125', rr: '28', spo2: '90', gcsE: '2', gcsV: '3', gcsM: '4', gcsTotal: '9', painScore: '8' }, // Через 5 хв
        ],
        suspectedInjuries: [
            { ...constants.injuryTemplate, bodyPart: constants.bodyParts[4], typeOfInjury: constants.injuryTypes[4], description: "Закритий перелом 5,6,7 ребер зліва. Напружений пневмоторакс зліва (підозра)." },
            { ...constants.injuryTemplate, bodyPart: constants.bodyParts[20], typeOfInjury: constants.injuryTypes[3], description: "Закритий перелом лівої стегнової кістки в середній третині, деформація, патологічна рухливість." },
            { ...constants.injuryTemplate, bodyPart: constants.bodyParts[0], typeOfInjury: "ЧМТ (струс/забій?)", description: "Втрата свідомості на місці події на кілька хвилин (зі слів свідків)." },
        ],
        interventionsPerformed: [
            { ...constants.interventionTemplate, type: "Голкова декомпресія плевральної порожнини", timestamp: getCurrentTime(), details: "Торакоцентез зліва у II міжребер'ї по середньоключичній лінії. Отримано повітря під тиском. Покращення SpO2 до 92%." },
            { ...constants.interventionTemplate, type: "Внутрішньовенний доступ (периферичний)", timestamp: (() => {const d=new Date(); d.setMinutes(d.getMinutes()+2); return d.toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'})})(), details: "Катетер G18 в праву ліктьову вену. Почато інфузію." },
            { ...constants.interventionTemplate, type: "Іммобілізація (шини/комір/дошка)", timestamp: (() => {const d=new Date(); d.setMinutes(d.getMinutes()+3); return d.toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'})})(), details: "Шийний комірець. Шина Дітеріхса на ліве стегно." },
        ],
        medicationsAdministered: [
            { ...constants.medicationTemplate, name: "Розчин Рінгера лактат", dose: "500", unit: "мл", route: "в/в", timestamp: (() => {const d=new Date(); d.setMinutes(d.getMinutes()+2); return d.toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'})})() },
            { ...constants.medicationTemplate, name: "Морфін", dose: "5", unit: "мг", route: "в/в", timestamp: (() => {const d=new Date(); d.setMinutes(d.getMinutes()+7); return d.toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'})})() },
        ],
        transportation: {
            destinationFacilityName: "Обласна клінічна лікарня, Травматологічний центр",
            transportMode: constants.transportModes[0], // ЕМД (Автомобіль)
            departureTimeFromScene: getCurrentDateTimeLocal(), // Припустимо, виїзд через 20 хв після прибуття
            patientConditionDuringTransport: "Стан важкий, стабільний. АТ 90/60, ЧСС 120, SpO2 94% на кисні 5л/хв. Свідомість ШКГ 10 (E3V3M4).",
        },
        outcomePreHospital: constants.patientOutcomePreHospital[0], // Госпіталізовано
        notes: "Пацієнт був затиснутий в авто, деблокований рятувальниками ДСНС. Подушки безпеки спрацювали. Запах алкоголю від пацієнта відсутній.",
    };
};