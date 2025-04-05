// src/components/CasualtyCard/CasualtyCard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
    Box, Heading, VStack, Divider, Button, useToast, Spinner, Text, Alert,
    AlertIcon, AlertTitle, AlertDescription, HStack,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
} from '@chakra-ui/react';
import { QuestionOutlineIcon, RepeatIcon } from '@chakra-ui/icons';

// Child Components (PatientDataSection тепер включає Allergies)
import PatientDataSection from './PatientDataSection/PatientDataSection'; // Цей компонент тепер містить алергії
import InjuryMechanismSection from './InjuryMechanismSection';
import TourniquetSection from './TourniquetSection/TourniquetSection';
import VitalSignsSection from './VitalSignsSection/VitalSignsSection';
import ProvidedAidSection from './ProvidedAidSection/ProvidedAidSection';
import MedicationsSection from './MedicationSection/MedicationsSection';
import AdministrativeDataSection from './AdministrativeDataSection';
// --- НЕ імпортуємо AllergiesSubSection тут ---

// API & Utils
import { createInjured, getInjuredById, updateInjured } from '../../services/injuredApi';
import constants from '../../constants/constants.json';
import { generateCasualtyCardData } from '../../utils/mockDataGenerator';
import {
    getISOFromDateTime,
    getDateAndTimeFromISO,
    generateIndividualNumber,
    getInitialStateCopy,
    generateAllergyKey // Потрібно для initialDataState
} from '../../utils/helpers';
import { casualtyCardStyles } from './casualtyCardStyles';

// --- Початковий стан (без змін, алергії тут потрібні для defaultValues) ---
const defaultKnownAllergies = Object.fromEntries(
    (constants.commonAllergens || [])
        .map(allergen => generateAllergyKey(allergen))
        .filter(Boolean)
        .map(key => [key, false])
);

const initialDataState = {
    individualNumber: '', patientFullName: '', last4SSN: '', gender: '',
    injuryDate: '', injuryTime: '', branchOfService: '', branchOfServiceOther: '', unit: '',
    allergies: { known: { ...defaultKnownAllergies }, other: '', nka: false }, // Залишається тут
    evacuationPriority: '',
    mechanismOfInjury: [], mechanismOfInjuryOther: '', injuryDescription: '',
    tourniquets: { /* ... */ },
    vitalSigns: [],
    aidCirculation: { /* ... */ }, aidAirway: { /* ... */ }, aidBreathing: { /* ... */ },
    fluidsGiven: [], medicationsGiven: [],
    aidHypothermiaOther: { /* ... */ },
    notes: '', providerFullName: '', providerLast4SSN: '',
    injuryDateTime: null, recordedBy: '',
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

    const { handleSubmit, reset, getValues, formState } = methods;
    const { isSubmitting, isDirty, errors, isValid } = formState;

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
    const [fetchError, setFetchError] = useState(null);
    const [displayIndividualNumber, setDisplayIndividualNumber] = useState('');

    const isDisabled = isSubmitting || isLoadingData;

    // --- populateForm (Без суттєвих змін, логіка обробки алергій залишається) ---
    const populateForm = useCallback((apiData) => {
         setIsLoadingData(true);
         try {
             if (!apiData) {
                 reset(getInitialStateCopy(initialDataState));
                 setDisplayIndividualNumber('');
                 setFetchError(null);
                 return;
             }
             const freshInitialState = getInitialStateCopy(initialDataState);
             const { date: injDate, time: injTime } = getDateAndTimeFromISO(apiData.injuryDateTime);

             // Обробка алергій (використовуємо generateAllergyKey для зіставлення)
             const apiAllergies = apiData.allergies || {};
             const populatedKnownAllergies = { ...freshInitialState.allergies.known };
             if (typeof apiAllergies.known === 'object' && apiAllergies.known !== null) {
                  Object.keys(apiAllergies.known).forEach(apiKey => {
                     const standardKey = Object.keys(populatedKnownAllergies).find(stdKey =>
                         stdKey.toLowerCase() === apiKey.toLowerCase() || generateAllergyKey(apiKey) === stdKey
                      );
                     if (standardKey) { populatedKnownAllergies[standardKey] = !!apiAllergies.known[apiKey]; }
                  });
             } else if (Array.isArray(apiAllergies.known)) {
                  apiAllergies.known.forEach(allergenName => {
                      const key = generateAllergyKey(allergenName);
                      if (key && key in populatedKnownAllergies) { populatedKnownAllergies[key] = true; }
                  });
             }
             const populatedAllergies = {
                  known: populatedKnownAllergies, other: apiAllergies.other ?? '', nka: apiAllergies.nka ?? false,
             };

             // Обробка branchOfService... (решта логіки як була)
             let populatedBranchOfService = apiData.branchOfService || '';
             let populatedBranchOfServiceOther = '';
             const knownBranches = constants.branchesOfService || [];
             if (populatedBranchOfService && !knownBranches.includes(populatedBranchOfService)) {
                 populatedBranchOfServiceOther = populatedBranchOfService; populatedBranchOfService = 'Інше';
             }
              // Обробка турнікетів...
              const populatedTourniquets = { ...freshInitialState.tourniquets }; /* ... як було ... */
              const knownTourniquetTypes = constants.tourniquetTypes || [];
              for (const limb of Object.keys(populatedTourniquets)) {
                 const limbData = apiData.tourniquets?.[limb] || {};
                 let populatedType = limbData.type || ''; let populatedTypeOther = '';
                 if (populatedType && !knownTourniquetTypes.includes(populatedType)) {
                    populatedTypeOther = populatedType; populatedType = 'Інше';
                 }
                 populatedTourniquets[limb] = { time: limbData.time || '', type: populatedType, typeOther: populatedTypeOther };
             }

             const mapArrayWithId = (apiArray, initialItem = {}) => (Array.isArray(apiArray) ? apiArray : []).map(item => ({ ...initialItem, ...item, id: item.id || crypto.randomUUID() }));

             const dataForReset = {
                 ...freshInitialState, ...apiData,
                 injuryDate: injDate, injuryTime: injTime, allergies: populatedAllergies, // Алергії тут для reset
                 branchOfService: populatedBranchOfService, branchOfServiceOther: populatedBranchOfServiceOther,
                 tourniquets: populatedTourniquets,
                 vitalSigns: mapArrayWithId(apiData.vitalSigns, freshInitialState.vitalSigns?.[0]),
                 fluidsGiven: mapArrayWithId(apiData.fluidsGiven, freshInitialState.fluidsGiven?.[0]),
                 medicationsGiven: mapArrayWithId(apiData.medicationsGiven, freshInitialState.medicationsGiven?.[0]),
                 _id: undefined, __v: undefined, createdAt: undefined, updatedAt: undefined, injuryDateTime: undefined,
             };

            reset(dataForReset, { keepDefaultValues: false, keepDirty: false });
            setDisplayIndividualNumber(apiData.individualNumber || '');
            setFetchError(null);

         } catch (error) {
            console.error("Error during populateForm:", error);
            setFetchError("Помилка обробки отриманих даних.");
            reset(getInitialStateCopy(initialDataState));
            setDisplayIndividualNumber('');
         } finally {
             setIsLoadingData(false);
         }
    }, [reset]);

    // --- Effect: Завантаження даних (без змін) ---
    useEffect(() => {
        if (isEditMode && id) {
            setIsLoadingData(true); setFetchError(null);
            getInjuredById(id)
                .then(data => { if (!data) throw new Error(`Не знайдено ID ${id}.`); populateForm(data); })
                .catch(err => { console.error("Error loading:", err); setFetchError(err.message); populateForm(null); });
        } else {
            populateForm(null); setIsLoadingData(false);
        }
    }, [id, isEditMode, populateForm]);

    // --- onSave (Без змін у логіці обробки алергій) ---
    const onSave = useCallback(async (formDataFromRHF) => {
        console.log("--- onSave triggered ---");
        // Логіка підготовки finalPayload залишається такою ж,
        // оскільки formDataFromRHF міститиме дані з усіх полів, включаючи алергії
        let finalPayload;
        try {
            // Підготовка injuryDateTimeISO...
             const injuryDateTimeISO = getISOFromDateTime(formDataFromRHF.injuryDate, formDataFromRHF.injuryTime);
             /* ... перевірка дати ... */

            // Підготовка allergiesToSubmit... (без змін)
            const allergiesToSubmit = { known: {}, other: '', nka: false };
            allergiesToSubmit.nka = !!formDataFromRHF.allergies?.nka;
            allergiesToSubmit.other = formDataFromRHF.allergies?.other?.trim() ?? '';
            if (!allergiesToSubmit.nka && formDataFromRHF.allergies?.known) {
                Object.entries(formDataFromRHF.allergies.known).forEach(([key, value]) => {
                    if (value === true) allergiesToSubmit.known[key] = true;
                });
            }

            // Підготовка finalBranchOfService... (без змін)
             const finalBranchOfService = formDataFromRHF.branchOfService === 'Інше' ? (formDataFromRHF.branchOfServiceOther?.trim() || 'Інше') : formDataFromRHF.branchOfService;

            // Підготовка tourniquetsToSubmit... (без змін)
             const tourniquetsToSubmit = {}; /* ... як було ... */
             if (formDataFromRHF.tourniquets) {
                 for (const limb in formDataFromRHF.tourniquets) {
                     const { type, typeOther, time } = formDataFromRHF.tourniquets[limb] || {};
                     if (time || type) {
                         tourniquetsToSubmit[limb] = { time: time || '', type: type === 'Інше' ? (typeOther?.trim() || 'Інше') : (type || '') };
                     }
                 }
             }

            // Підготовка medications/fluids/hypothermia... (без змін)
             const processOtherOptionArray = (itemsArray = [], nameField = 'name', otherField = 'nameOther', otherValue = 'Інше...') => {/* ... як було ... */
                return itemsArray.map(item => {const { [otherField]: otherText, ...rest } = item; const finalName = rest[nameField] === otherValue? (otherText?.trim() || otherValue): rest[nameField];return { ...rest, [nameField]: finalName };}).filter(item => Object.values(item).some(val => val && val !== item.id));};
             const medicationsToSubmit = processOtherOptionArray(formDataFromRHF.medicationsGiven, 'name', 'nameOther', 'Інше...');
             const fluidsToSubmit = processOtherOptionArray(formDataFromRHF.fluidsGiven, 'name', 'nameOther', 'Інше...');
             const hypothermiaPreventionType = formDataFromRHF.aidHypothermiaOther?.hypothermiaPreventionType;
             const hypothermiaPreventionTypeOther = formDataFromRHF.aidHypothermiaOther?.hypothermiaPreventionTypeOther;
             const finalHypothermiaType = hypothermiaPreventionType === 'Інше...'? (hypothermiaPreventionTypeOther?.trim() || 'Інше...'): hypothermiaPreventionType;


             // Формування finalPayload... (без змін)
             finalPayload = {
                 ...formDataFromRHF,
                 injuryDateTime: injuryDateTimeISO, allergies: allergiesToSubmit,
                 branchOfService: finalBranchOfService, tourniquets: tourniquetsToSubmit,
                 medicationsGiven: medicationsToSubmit, fluidsGiven: fluidsToSubmit,
                 aidHypothermiaOther: { ...(formDataFromRHF.aidHypothermiaOther || {}), hypothermiaPreventionType: finalHypothermiaType, hypothermiaPreventionTypeOther: undefined },
                 vitalSigns: (formDataFromRHF.vitalSigns || []).filter(vs => vs && vs.time).map(({ id, ...rest }) => rest),
             };

            // Очищення... (без змін)
             finalPayload.injuryDate = undefined; finalPayload.injuryTime = undefined;
             finalPayload.branchOfServiceOther = undefined; /* ... інші undefined ... */
             Object.keys(finalPayload).forEach(key => { if (finalPayload[key] === undefined) delete finalPayload[key]; });

             // Номер... (без змін)
             if (!isEditMode) { if (!finalPayload.individualNumber) finalPayload.individualNumber = generateIndividualNumber(finalPayload.patientFullName, finalPayload.last4SSN); }

            console.log("--- onSave: Final Payload ---", finalPayload);

        } catch (prepError) {
             console.error("--- onSave: Prep Error ---", prepError);
             toast({ title: "Помилка підготовки даних", description: prepError.message, status: "error" }); return;
        }

        // API виклик... (без змін)
        try {
            let responseData;
            if (isEditMode && id) { responseData = await updateInjured(id, finalPayload); }
            else { responseData = await createInjured(finalPayload); }
            toast({ title: `Картку ${isEditMode ? 'оновлено' : 'створено'}`, status: 'success' });

            if (!isEditMode && responseData?._id) { navigate(`/casualty/${responseData._id}`, { replace: true }); }
            else if (isEditMode && responseData) { populateForm(responseData); } // Скидаємо з отриманими даними
            else { console.warn("API response incomplete."); if(!isEditMode) { reset(getInitialStateCopy(initialDataState)); navigate('/'); } }

        } catch (error) {
             console.error(`--- onSave: API Error ---`, error);
             const errorDesc = error.response?.data?.message || error.message || 'Помилка сервера.';
             toast({ title: `Помилка ${isEditMode ? 'оновлення' : 'створення'}`, description: errorDesc, status: 'error' });
        }
    }, [isEditMode, id, toast, navigate, populateForm, reset, getValues]); // Залежності

    // handleFillWithTestData, handleClearForm (Без змін)
    const handleFillWithTestData = useCallback(() => { /* ... як було ... */ if (isDisabled || isEditMode) return; try {const rawMockData = generateCasualtyCardData(); if (!rawMockData) throw new Error("Генератор даних повернув null."); const mapArrayWithId = (a,i={})=> (Array.isArray(a)?a:[]).map(item=>({...i,...item,id:item.id||crypto.randomUUID()})); const mockDataForReset = {...getInitialStateCopy(initialDataState),...rawMockData, vitalSigns: mapArrayWithId(rawMockData.vitalSigns), fluidsGiven: mapArrayWithId(rawMockData.fluidsGiven), medicationsGiven: mapArrayWithId(rawMockData.medicationsGiven), allergies: {...getInitialStateCopy(initialDataState).allergies,...(rawMockData.allergies||{}), known: {...getInitialStateCopy(initialDataState).allergies.known,...(rawMockData.allergies?.known||{})}}, tourniquets: {...getInitialStateCopy(initialDataState).tourniquets,...(rawMockData.tourniquets||{})}, /* ... інші aid* ... */}; mockDataForReset._id=undefined; /*...*/ reset(mockDataForReset, {keepDefaultValues: false}); setDisplayIndividualNumber(''); toast({title: "Тест дані заповнено", status: "info"});} catch(e) {console.error(e); toast({title: "Помилка тест даних", description: e.message, status: "error"});}}, [isDisabled, isEditMode, reset, toast]);
    const handleClearForm = useCallback(() => { /* ... як було ... */ if (isDisabled) return; try { reset(getInitialStateCopy(initialDataState)); if (!isEditMode) setDisplayIndividualNumber(''); toast({title: "Форму очищено", status: "info"});} catch(e){console.error(e); toast({title: "Помилка очищення", description: e.message, status:"error"});}}, [isDisabled, reset, isEditMode, toast]);


    // --- Рендер ---
    if (isLoadingData) return ( <Box {...casualtyCardStyles.loadingBox}><Spinner /><Text>Завантаження...</Text></Box> );
    if (fetchError && isEditMode && !isLoadingData && !getValues("patientFullName")) return ( <VStack><Alert status="error"><AlertIcon />{fetchError}</Alert><Button onClick={()=>navigate('/')}>До списку</Button></VStack> );

    const formTitle = isEditMode ? `Редагування картки ${displayIndividualNumber ? `#${displayIndividualNumber}` : ''}` : 'Створення нової картки';

    return (
        <FormProvider {...methods}>
            <Box as="form" onSubmit={handleSubmit(onSave, (formErrors) => {
                console.error("--- Validation Errors ---", formErrors);
                toast({ title: "Помилка валідації", description: "Перевірте заповнені дані.", status: "error" });
            })} {...casualtyCardStyles.formContainer}>
                <Heading size="lg" mb={6} textAlign="center">{formTitle}</Heading>
                {fetchError && isEditMode && !isLoadingData && getValues("patientFullName") && ( <Alert status="warning"><AlertIcon />{fetchError}</Alert> )}

                {/* --- Акордеон --- */}
                 {/* Переконайтесь, що defaultIndex враховує правильну кількість секцій */}
                <Accordion allowMultiple defaultIndex={[0, 1, 2, 3, 4, 5]} width="100%">
                    {/* Секція 1: PatientDataSection (містить алергії) */}
                    <AccordionItem {...casualtyCardStyles.accordionItem}>
                        <h2><AccordionButton {...casualtyCardStyles.accordionButton}><Box flex='1' textAlign='left'><Heading {...casualtyCardStyles.accordionButtonHeading}> Дані Пораненого</Heading></Box><AccordionIcon /></AccordionButton></h2>
                        <AccordionPanel {...casualtyCardStyles.accordionPanel}>
                            {/* PatientDataSection тепер рендерить AllergiesSubSection всередині */}
                            <PatientDataSection isDisabled={isDisabled} constants={constants} />
                        </AccordionPanel>
                    </AccordionItem>

                     {/* --- ВИДАЛЕНО ОКРЕМУ СЕКЦІЮ ДЛЯ АЛЕРГІЙ --- */}

                    {/* Секція 2: Поранення та Турнікети (оновлений номер) */}
                    <AccordionItem {...casualtyCardStyles.accordionItem}>
                        <h2><AccordionButton {...casualtyCardStyles.accordionButton}><Box flex='1' textAlign='left'><Heading {...casualtyCardStyles.accordionButtonHeading}>2. Інформація про Поранення та Турнікети</Heading></Box><AccordionIcon /></AccordionButton></h2>
                        <AccordionPanel {...casualtyCardStyles.accordionPanel}>
                            <InjuryMechanismSection isDisabled={isDisabled} constants={constants}/>
                            <Divider {...casualtyCardStyles.sectionDivider}/>
                            <Heading {...casualtyCardStyles.sectionSubHeading}>Турнікети</Heading>
                            <TourniquetSection isDisabled={isDisabled} constants={constants} />
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Секція 3: Життєві Показники (оновлений номер) */}
                     <AccordionItem {...casualtyCardStyles.accordionItem}>
                        <h2><AccordionButton {...casualtyCardStyles.accordionButton}><Box flex='1' textAlign='left'><Heading {...casualtyCardStyles.accordionButtonHeading}>3. Симптоми та Ознаки (Життєві Показники)</Heading></Box><AccordionIcon /></AccordionButton></h2>
                        <AccordionPanel {...casualtyCardStyles.accordionPanel}>
                            <VitalSignsSection isDisabled={isDisabled} constants={constants} />
                        </AccordionPanel>
                    </AccordionItem>

                    {/* Секція 4: Надана Допомога (оновлений номер) */}
                     <AccordionItem {...casualtyCardStyles.accordionItem}>
                        <h2><AccordionButton {...casualtyCardStyles.accordionButton}><Box flex='1' textAlign='left'><Heading {...casualtyCardStyles.accordionButtonHeading}>4. Надана Допомога / Терапія</Heading></Box><AccordionIcon /></AccordionButton></h2>
                        <AccordionPanel {...casualtyCardStyles.accordionPanel}>
                            <ProvidedAidSection isDisabled={isDisabled} constants={constants} />
                        </AccordionPanel>
                    </AccordionItem>

                     {/* Секція 5: Ліки та Інша Допомога (оновлений номер) */}
                     <AccordionItem {...casualtyCardStyles.accordionItem}>
                        <h2><AccordionButton {...casualtyCardStyles.accordionButton}><Box flex='1' textAlign='left'><Heading {...casualtyCardStyles.accordionButtonHeading}>5. Ліки та Інша Допомога</Heading></Box><AccordionIcon /></AccordionButton></h2>
                        <AccordionPanel {...casualtyCardStyles.accordionPanel}>
                            <MedicationsSection isDisabled={isDisabled} constants={constants} />
                        </AccordionPanel>
                    </AccordionItem>

                     {/* Секція 6: Адмін дані (оновлений номер) */}
                     <AccordionItem {...casualtyCardStyles.accordionItem} mb={0}>
                         <h2><AccordionButton {...casualtyCardStyles.accordionButton}><Box flex='1' textAlign='left'><Heading {...casualtyCardStyles.accordionButtonHeading}>6. Адміністративні Дані та Нотатки</Heading></Box><AccordionIcon /></AccordionButton></h2>
                        <AccordionPanel {...casualtyCardStyles.accordionPanel}>
                            <AdministrativeDataSection isDisabled={isDisabled} />
                        </AccordionPanel>
                    </AccordionItem>

                </Accordion>

                {/* Кнопки дій (Без змін) */}
                <HStack {...casualtyCardStyles.actionButtonsHStack}>
                    <HStack> {/* Left */}
                        <Button type="button" leftIcon={<QuestionOutlineIcon />} onClick={handleFillWithTestData} isDisabled={isDisabled || isEditMode} {...casualtyCardStyles.testDataButton} title={isEditMode ? "Тест дані недоступні" : "Заповнити тестовими даними"}> Тест. дані </Button>
                        <Button type="button" leftIcon={<RepeatIcon />} onClick={handleClearForm} isDisabled={isDisabled} {...casualtyCardStyles.clearFormButton} title="Очистити форму"> Очистити </Button>
                    </HStack>
                    <HStack> {/* Right */}
                        <Button type="button" onClick={() => navigate('/')} isDisabled={isSubmitting} {...casualtyCardStyles.backToListButton}> До списку </Button>
                        <Button type="submit" isLoading={isSubmitting} loadingText={isEditMode ? 'Оновлення...' : 'Збереження...'} isDisabled={isLoadingData || isSubmitting || (!isDirty && isEditMode)} {...casualtyCardStyles.submitButton} title={ isLoadingData ? "Завантаження..." : isSubmitting ? (isEditMode ? 'Оновлення...' : 'Збереження...') : (!isDirty && isEditMode) ? "Немає змін" : (isEditMode ? 'Оновити' : 'Зберегти')}> {isEditMode ? 'Оновити Картку' : 'Зберегти Картку'} </Button>
                    </HStack>
                </HStack>
            </Box>
        </FormProvider>
    );
}

export default CasualtyCard;