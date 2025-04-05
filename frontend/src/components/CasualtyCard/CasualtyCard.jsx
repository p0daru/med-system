// src/components/CasualtyCard/CasualtyCard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
    Box, Heading, VStack, Divider, Button, useToast, Spinner, Text, Alert,
    AlertIcon, HStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
} from '@chakra-ui/react';
import { QuestionOutlineIcon, RepeatIcon } from '@chakra-ui/icons';

// Child Components
import PatientDataSection from './PatientDataSection/PatientDataSection'; // <--- ВИКОРИСТОВУЄМО ОНОВЛЕНИЙ КОМПОНЕНТ
import InjuryMechanismSection from './InjuryMechanismSection';
import TourniquetSection from './TourniquetSection/TourniquetSection';
import VitalSignsSection from './VitalSignsSection/VitalSignsSection';
import ProvidedAidSection from './ProvidedAidSection/ProvidedAidSection';
import MedicationsSection from './MedicationSection/MedicationsSection';
import AdministrativeDataSection from './AdministrativeDataSection';

// API & Utils
import { createInjured, getInjuredById, updateInjured } from '../../services/injuredApi';
import constants from './casualtyCardConstants.json'; // <--- Переконайтесь, що тут є ВСІ НОВІ константи
import { generateCasualtyCardData } from '../../utils/mockDataGenerator'; // Потребує оновлення або тимчасового відключення
import {
    getISOFromDateTime,
    getDateAndTimeFromISO,
    // generateIndividualNumber, // Чи потрібен ще цей номер? Можливо, militaryId його замінює?
    getInitialStateCopy,
    // generateAllergyKey // Більше не потрібен
} from '../../utils/helpers';
import { casualtyCardStyles } from './casualtyCardStyles';

// --- ОНОВЛЕНИЙ Початковий стан ---
const initialDataState = {
    // Секція 1 (PatientDataSection) - Нова структура
    isUnknown: false,
    category: '', // цивільний, військовослужбовець, полонений
    patientFullName: '',
    militaryId: '', // Замість last4SSN
    dateOfBirth: '',
    gender: '',
    militaryRank: '', // Залежить від category
    militaryUnit: '', // Замість unit, залежить від category
    allergyStatus: '', // ні, невідомо, так
    allergyDetails: '', // Залежить від allergyStatus
    injuryDate: '', // Дата події
    injuryTime: '', // Час події
    arrivalDate: '', // Дата прибуття
    arrivalTime: '', // Час прибуття
    transportType: '',
    arrivalSource: '',
    arrivalMedicalFacilityName: '',
    triageCategory: '', // Замість evacuationPriority

    // Системні/допоміжні поля, що не входять в пп 1.1-1.4, але можуть бути потрібні
    individualNumber: '', // Чи потрібне це поле?
    recordedBy: '',

    // Решта секцій (2-8) - залишаємо як було, якщо їх структура не змінилася
    mechanismOfInjury: [], mechanismOfInjuryOther: '', injuryDescription: '',
    tourniquets: { rightArm: {}, leftArm: {}, rightLeg: {}, leftLeg: {} },
    vitalSigns: [],
    aidCirculation: { tourniquetJunctional: false, tourniquetTruncal: false, dressingHemostatic: false, dressingPressure: false, dressingOther: false },
    aidAirway: { npa: false, cric: false, etTube: false, supraglottic: false },
    aidBreathing: { o2: false, needleDecompression: false, chestTube: false, occlusiveDressing: false },
    fluidsGiven: [], medicationsGiven: [],
    aidHypothermiaOther: { combatPillPack: false, eyeShieldRight: false, eyeShieldLeft: false, splinting: false, hypothermiaPrevention: false, hypothermiaPreventionType: '', hypothermiaPreventionTypeOther: '' }, // Переглянути структуру, чи відповідає поточним вимогам
    notes: '',
    providerFullName: '',
    providerLast4SSN: '', // Це поле теж переглянути

    // Поля, що використовуються для комбінації на бекенді
    injuryDateTime: null,
    arrivalDateTime: null,
};


// --- Головний Компонент ---
function CasualtyCard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const toast = useToast();

    const methods = useForm({
        defaultValues: useMemo(() => getInitialStateCopy(initialDataState), []),
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });

    const { handleSubmit, reset, getValues, watch, formState } = methods;
    const { isSubmitting, isDirty, errors } = formState;

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
    const [fetchError, setFetchError] = useState(null);
    // const [displayIndividualNumber, setDisplayIndividualNumber] = useState(''); // Чи потрібен?

    const isDisabled = isSubmitting || isLoadingData;

    // --- populateForm (Переписано для нової структури) ---
    const populateForm = useCallback((apiData) => {
         setIsLoadingData(true);
         try {
             const freshInitialState = getInitialStateCopy(initialDataState);
             if (!apiData) {
                 reset(freshInitialState);
                 // setDisplayIndividualNumber('');
                 setFetchError(null);
                 setIsLoadingData(false);
                 return;
             }

             // Розбираємо дати з ISO рядків
             const { date: injDate, time: injTime } = getDateAndTimeFromISO(apiData.injuryDateTime);
             const { date: arrDate, time: arrTime } = getDateAndTimeFromISO(apiData.arrivalDateTime);

            // Маппінг масивів (якщо є)
             const mapArrayWithId = (apiArray = [], initialItem = {}) =>
                (Array.isArray(apiArray) ? apiArray : []).map((item, index) => ({
                    ...initialItem, ...item, id: item.id || item._id || crypto.randomUUID() + '-' + index
                 }));

             // Формуємо дані для reset, беручи за основу свіжий стан і перезаписуючи даними з API
             const dataForReset = {
                 ...freshInitialState, // Починаємо з чистого стану
                 ...apiData, // Перезаписуємо всіма полями з API (якщо імена співпадають)

                 // Явно перезаписуємо поля, що потребують обробки або мають інші імена в формі
                 isUnknown: apiData.isUnknown ?? false,
                 category: apiData.category || '',
                 patientFullName: apiData.patientFullName || '',
                 militaryId: apiData.militaryId || '',
                 dateOfBirth: apiData.dateOfBirth ? apiData.dateOfBirth.split('T')[0] : '', // Беремо тільки дату
                 gender: apiData.gender || '',
                 militaryRank: apiData.militaryRank || '',
                 militaryUnit: apiData.militaryUnit || '',
                 allergyStatus: apiData.allergyStatus || '',
                 allergyDetails: apiData.allergyDetails || '',
                 injuryDate: injDate, // Дата події
                 injuryTime: injTime, // Час події
                 arrivalDate: arrDate, // Дата прибуття
                 arrivalTime: arrTime, // Час прибуття
                 transportType: apiData.transportType || '',
                 arrivalSource: apiData.arrivalSource || '',
                 arrivalMedicalFacilityName: apiData.arrivalMedicalFacilityName || '',
                 triageCategory: apiData.triageCategory || '',

                 // Обробляємо масиви (якщо структура решти секцій не змінилася)
                  tourniquets: { // Переконуємось, що структура турнікетів коректна
                      rightArm: { ...(freshInitialState.tourniquets.rightArm || {}), ...(apiData.tourniquets?.rightArm || {}) },
                      leftArm:  { ...(freshInitialState.tourniquets.leftArm || {}), ...(apiData.tourniquets?.leftArm || {}) },
                      rightLeg: { ...(freshInitialState.tourniquets.rightLeg || {}), ...(apiData.tourniquets?.rightLeg || {}) },
                      leftLeg:  { ...(freshInitialState.tourniquets.leftLeg || {}), ...(apiData.tourniquets?.leftLeg || {}) },
                  },
                 vitalSigns: mapArrayWithId(apiData.vitalSigns, freshInitialState.vitalSigns?.[0]),
                 fluidsGiven: mapArrayWithId(apiData.fluidsGiven, freshInitialState.fluidsGiven?.[0]),
                 medicationsGiven: mapArrayWithId(apiData.medicationsGiven, freshInitialState.medicationsGiven?.[0]),
                 // Перевірити структуру aid* та aidHypothermiaOther
                 aidCirculation: { ...freshInitialState.aidCirculation, ...(apiData.aidCirculation || {}) },
                 aidAirway: { ...freshInitialState.aidAirway, ...(apiData.aidAirway || {}) },
                 aidBreathing: { ...freshInitialState.aidBreathing, ...(apiData.aidBreathing || {}) },
                 aidHypothermiaOther: { ...freshInitialState.aidHypothermiaOther, ...(apiData.aidHypothermiaOther || {}) },


                 // Видаляємо системні/комбіновані поля, що не потрібні у формі
                 _id: undefined, __v: undefined, createdAt: undefined, updatedAt: undefined,
                 injuryDateTime: undefined, arrivalDateTime: undefined,
             };

            reset(dataForReset, { keepDefaultValues: false, keepDirty: false, keepErrors: false, keepTouched: false });
            // setDisplayIndividualNumber(apiData.individualNumber || ''); // Якщо individualNumber ще використовується
            setFetchError(null);

         } catch (error) {
            console.error("Error during populateForm:", error);
            setFetchError("Помилка обробки отриманих даних.");
            reset(getInitialStateCopy(initialDataState)); // Скидаємо до чистого стану
            // setDisplayIndividualNumber('');
         } finally {
             setIsLoadingData(false);
         }
    }, [reset]);

    // --- Effect: Завантаження даних (залишається без змін логіки, але використовує новий populateForm) ---
    useEffect(() => {
        if (isEditMode && id) {
            setIsLoadingData(true); setFetchError(null);
            getInjuredById(id)
                .then(data => { if (!data) throw new Error(`Не знайдено ID ${id}.`); populateForm(data); })
                .catch(err => { console.error("Error loading:", err); setFetchError(err.message); populateForm(null); setIsLoadingData(false); });
        } else {
            populateForm(null); setIsLoadingData(false);
        }
    }, [id, isEditMode, populateForm]);

    // --- onSave (Переписано для нової структури) ---
    const onSave = useCallback(async (formDataFromRHF) => {
        console.log("--- onSave triggered ---");
        console.log("Raw form data:", formDataFromRHF);

        let finalPayload;
        try {
            // 1. Комбінуємо дати та час
             const injuryDateTimeISO = getISOFromDateTime(formDataFromRHF.injuryDate, formDataFromRHF.injuryTime);
             const arrivalDateTimeISO = getISOFromDateTime(formDataFromRHF.arrivalDate, formDataFromRHF.arrivalTime);

             if (!injuryDateTimeISO || !arrivalDateTimeISO) {
                 throw new Error("Некоректна дата або час події/прибуття.");
             }
            // Додаткові перевірки дат
            if (new Date(injuryDateTimeISO) > new Date() || new Date(arrivalDateTimeISO) > new Date()) {
                 toast({ title: "Помилка даних", description: "Дата/час події або прибуття не можуть бути в майбутньому.", status: "warning" });
                 // return; // Можна зупинити тут або дозволити бекенду валідувати
             }
             if (new Date(arrivalDateTimeISO) < new Date(injuryDateTimeISO)) {
                 toast({ title: "Помилка даних", description: "Дата/час прибуття не може бути раніше дати/часу події.", status: "warning" });
                 // return;
             }

             // 2. Готуємо payload, починаючи з даних форми
             finalPayload = { ...formDataFromRHF };

             // 3. Застосовуємо логіку очищення на основі умов (дублює pre-save hook на бекенді для надійності)
             if (finalPayload.isUnknown) {
                 finalPayload.patientFullName = '';
                 finalPayload.militaryId = '';
                 finalPayload.dateOfBirth = null; // Надсилаємо null
             }
             if (finalPayload.category !== 'військовослужбовець') {
                 finalPayload.militaryRank = '';
                 finalPayload.militaryUnit = '';
             }
             if (finalPayload.allergyStatus !== 'так') {
                 finalPayload.allergyDetails = '';
             }

             // 4. Замінюємо окремі дати/час на комбіновані ISO рядки
             finalPayload.injuryDateTime = injuryDateTimeISO;
             finalPayload.arrivalDateTime = arrivalDateTimeISO;
             delete finalPayload.injuryDate;
             delete finalPayload.injuryTime;
             delete finalPayload.arrivalDate;
             delete finalPayload.arrivalTime;

             // 5. Обробка масивів (ліки, рідини, життєві показники) - Логіка залишається та сама, ЯКЩО їх структура не змінилась
             const processOtherOptionArray = (itemsArray = [], nameField = 'name', otherField = 'nameOther', otherValue = 'Інше...') => { /* ... стара логіка ... */ return itemsArray?.map(item => { const { [otherField]: otherText, id, ...rest } = item || {}; const finalName = rest[nameField] === otherValue ? (otherText?.trim() || otherValue) : rest[nameField]; return { ...rest, [nameField]: finalName }; }).filter(item => item && Object.values(item).some(val => val)) || []; };
             const cleanVitalSigns = (itemsArray = []) => itemsArray?.map(({ id, ...rest }) => rest).filter(vs => vs && Object.values(vs).some(val => val && String(val).trim() !== '')) || [];

             finalPayload.medicationsGiven = processOtherOptionArray(formDataFromRHF.medicationsGiven, 'name', 'nameOther', 'Інше...');
             finalPayload.fluidsGiven = processOtherOptionArray(formDataFromRHF.fluidsGiven, 'name', 'nameOther', 'Інше...');
             finalPayload.vitalSigns = cleanVitalSigns(formDataFromRHF.vitalSigns);
              // Обробка турнікетів (якщо логіка "Інше" там є)
              const tourniquetsToSubmit = {}; /* ... стара логіка обробки 'Інше' ... */
              if (formDataFromRHF.tourniquets) {
                  for (const limb in formDataFromRHF.tourniquets) {
                      const { type, typeOther, time } = formDataFromRHF.tourniquets[limb] || {};
                      if (time || type) {
                          const finalType = type === 'Інше' ? (typeOther?.trim() || 'Інше') : (type || '');
                          tourniquetsToSubmit[limb] = { time: time || '', type: finalType };
                      } else {
                          tourniquetsToSubmit[limb] = { time: '', type: '' }; // Надсилаємо порожні, якщо треба зберігати структуру
                      }
                  }
              }
             finalPayload.tourniquets = tourniquetsToSubmit;


             // 6. Очищення системних полів та undefined
             delete finalPayload._id; delete finalPayload.__v; delete finalPayload.createdAt; delete finalPayload.updatedAt;
             Object.keys(finalPayload).forEach(key => { if (finalPayload[key] === undefined) delete finalPayload[key]; });

             // 7. Генерація individualNumber (якщо все ще використовується)
             // if (!isEditMode && !finalPayload.individualNumber && finalPayload.militaryId) {
             //    finalPayload.individualNumber = generateIndividualNumber(finalPayload.patientFullName, finalPayload.militaryId);
             // }

            console.log("--- onSave: Final Payload to API ---", JSON.stringify(finalPayload, null, 2));

        } catch (prepError) {
             console.error("--- onSave: Data Preparation Error ---", prepError);
             toast({ title: "Помилка підготовки даних", description: prepError.message, status: "error", isClosable: true });
             return;
        }

        // 8. Виклик API (Логіка залишається та сама)
        try {
            let responseData;
            if (isEditMode && id) {
                responseData = await updateInjured(id, finalPayload);
                toast({ title: `Картку оновлено`, status: 'success' });
            } else {
                responseData = await createInjured(finalPayload);
                toast({ title: `Картку створено`, status: 'success' });
            }

            if (!isEditMode && responseData?._id) {
                navigate(`/casualty/${responseData._id}`, { replace: true });
            } else if (isEditMode && responseData) {
                 populateForm(responseData); // Скидаємо форму з отриманими даними, щоб оновити стан і isDirty
            } else {
                console.warn("API response incomplete.");
                if(!isEditMode) { /* Можливо, перейти до списку */ navigate('/'); }
            }

        } catch (error) {
             console.error(`--- onSave: API Error ---`, error);
             const errorDesc = error.response?.data?.message || error.message || 'Помилка сервера.';
             // Додати деталі валідації, якщо є
              const validationErrors = error.response?.data?.errors;
              let details = '';
              if (validationErrors) {
                  if (Array.isArray(validationErrors)) details = validationErrors.join(', ');
                  else if (typeof validationErrors === 'object') details = Object.values(validationErrors).map(e => e.message || e).join('; ');
              }
             toast({ title: `Помилка ${isEditMode ? 'оновлення' : 'створення'}`, description: `${errorDesc} ${details ? `(${details})` : ''}`, status: 'error', duration: 7000, isClosable: true });
        }
    }, [isEditMode, id, toast, navigate, populateForm, reset]); // Залежності

    // handleFillWithTestData - ПОТРЕБУЄ ПОВНОЇ ПЕРЕРОБКИ або тимчасового відключення,
    // оскільки mockDataGenerator має генерувати дані за НОВОЮ структурою.
    const handleFillWithTestData = useCallback(() => {
        if (isDisabled || isEditMode) return;
        toast({ title: "Функція тимчасово недоступна", description: "Генератор тестових даних потребує оновлення.", status: "warning" });
        // TODO: Оновити generateCasualtyCardData та логіку тут для відповідності новій структурі initialDataState
        // try {const rawMockData = generateCasualtyCardData(); ... reset(mockDataForReset); ... } catch ...
    }, [isDisabled, isEditMode, reset, toast]);

    // handleClearForm (має працювати, бо використовує оновлений initialDataState)
    const handleClearForm = useCallback(() => {
        if (isDisabled) return;
        try {
            reset(getInitialStateCopy(initialDataState));
            // if (!isEditMode) setDisplayIndividualNumber('');
            toast({title: "Форму очищено", status: "info"});
        } catch(e){
            console.error(e); toast({title: "Помилка очищення", description: e.message, status:"error"});
        }
    }, [isDisabled, reset, isEditMode, toast]);


    // --- Рендер (структура акордеону залишається, назви секцій оновлено) ---
    if (isLoadingData) return ( <Box {...casualtyCardStyles.loadingBox}><Spinner size="xl"/><Text mt={4}>Завантаження...</Text></Box> );
    if (fetchError && isEditMode && !getValues("patientFullName") && !getValues("isUnknown")) return ( <VStack><Alert status="error"><AlertIcon />{fetchError}</Alert><Button onClick={()=>navigate('/')}>До списку</Button></VStack> );

    const formTitle = isEditMode ? `Редагування картки` : 'Створення нової картки'; // Можливо, додати ID, якщо є

    return (
        <FormProvider {...methods}>
            <Box as="form" onSubmit={handleSubmit(onSave, (formErrors) => {
                console.error("--- Validation Errors ---", formErrors);
                toast({ title: "Помилка валідації", description: "Перевірте заповнені дані.", status: "error", duration: 5000, isClosable: true });
            })} {...casualtyCardStyles.formContainer}>
                <Heading size="lg" mb={6} textAlign="center">{formTitle} {isEditMode && id ? `(ID: ${id.slice(-6)})` : ''}</Heading>
                {fetchError && isEditMode && (getValues("patientFullName") || getValues("isUnknown")) && ( <Alert status="warning" mb={4}><AlertIcon />{fetchError}</Alert> )}

                <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4, 5]} width="100%">
                    {/* Секція 1: Дані Пораненого (оновлена) */}
                    <AccordionItem {...casualtyCardStyles.accordionItem}>
                        <h2><AccordionButton {...casualtyCardStyles.accordionButton}><Box flex='1' textAlign='left'><Heading {...casualtyCardStyles.accordionButtonHeading}>1. Загальна Інформація та Обставини</Heading></Box><AccordionIcon /></AccordionButton></h2>
                        <AccordionPanel {...casualtyCardStyles.accordionPanel}>
                            <PatientDataSection isDisabled={isDisabled} constants={constants} />
                        </AccordionPanel>
                    </AccordionItem>

                    
                </Accordion>

                {/* Кнопки дій (Логіка isDisabled оновлена) */}
                <HStack {...casualtyCardStyles.actionButtonsHStack}>
                    <HStack>
                        <Button type="button" leftIcon={<QuestionOutlineIcon />} onClick={handleFillWithTestData} isDisabled={isDisabled || isEditMode} {...casualtyCardStyles.testDataButton} title={isEditMode ? "Тест дані недоступні" : "Заповнити тестовими даними (потребує оновлення)"}> Тест. дані </Button>
                        <Button type="button" leftIcon={<RepeatIcon />} onClick={handleClearForm} isDisabled={isDisabled} {...casualtyCardStyles.clearFormButton} title="Очистити форму"> Очистити </Button>
                    </HStack>
                    <HStack>
                        <Button type="button" onClick={() => navigate('/')} isDisabled={isSubmitting} {...casualtyCardStyles.backToListButton}> До списку </Button>
                        <Button type="submit" isLoading={isSubmitting} loadingText={isEditMode ? 'Оновлення...' : 'Збереження...'} isDisabled={isLoadingData || isSubmitting || (!isDirty && isEditMode)} {...casualtyCardStyles.submitButton} title={ isLoadingData ? "Завантаження..." : isSubmitting ? (isEditMode ? 'Оновлення...' : 'Збереження...') : (!isDirty && isEditMode) ? "Немає змін для збереження" : (isEditMode ? 'Оновити' : 'Зберегти')}> {isEditMode ? 'Оновити Картку' : 'Зберегти Картку'} </Button>
                    </HStack>
                </HStack>
            </Box>
        </FormProvider>
    );
}

export default CasualtyCard;