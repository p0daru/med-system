// frontend/src/components/PreHospitalCare/PreHospitalCareSection.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Додано useRef
import {
  Box, Heading, FormControl, FormLabel, Input, Select, Textarea, Button,
  Grid, GridItem, VStack, HStack, Text, IconButton, Checkbox,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, Divider, Flex, Spacer, SimpleGrid, Spinner
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons'; // Додано ArrowBackIcon
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Додано useNavigate
import { format, parseISO } from 'date-fns';

// ... (інші імпорти: константи, тестові дані, стилі, API)
import {
  GENDER_OPTIONS, AIRWAY_STATUS_OPTIONS, BREATHING_RATE_OPTIONS, OXYGEN_SATURATION_OPTIONS,
  BREATHING_QUALITY_OPTIONS, CHEST_EXCURSION_OPTIONS, AUSCULTATION_LUNGS_OPTIONS,
  PULSE_RATE_OPTIONS, PULSE_QUALITY_OPTIONS, PULSE_LOCATION_OPTIONS,
  CAPILLARY_REFILL_TIME_OPTIONS, SKIN_STATUS_OPTIONS, EXTERNAL_BLEEDING_OPTIONS,
  GCS_EYE_OPTIONS, GCS_VERBAL_OPTIONS, GCS_MOTOR_OPTIONS, PUPIL_REACTION_OPTIONS,
  MOTOR_SENSORY_STATUS_OPTIONS, BODY_TEMPERATURE_OPTIONS, TRANSPORTATION_METHOD_OPTIONS,
  TRIAGE_CATEGORIES_OPTIONS, EFFECTIVENESS_OPTIONS, SCENE_TYPE_OPTIONS,
  MEDICATION_ROUTE_OPTIONS, COMMON_PREHOSPITAL_MEDICATIONS,
  COMMON_PREHOSPITAL_PROCEDURES, INITIAL_PRE_HOSPITAL_FORM_DATA,
} from './patientCardConstants';
import { generatePreHospitalTestData } from './testData';
import {
  mainBoxStyles, headerFlexStyles, headerTitleStyles, cardIdTextStyles,
  accordionItemStyles, accordionButtonStyles, accordionButtonTextStyles, accordionPanelStyles,
  formControlLabelStyles, inputStyles, nestedListBoxStyles, actionButtonsHStackStyles,
  primaryButtonStyles, secondaryButtonStyles
} from './preHospitalCareStyles'; 
import { 
    createPreHospitalRecord, 
    updateTraumaRecord, 
    getTraumaRecordById 
} from '../../services/traumaRecord.api';


// --- Допоміжні компоненти та функції ---
const generateClientSideId = () => {
  let result = 'TRM-';
  const alphanumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
};

const CustomEntrySelect = React.memo(({ /* ... ваш код CustomEntrySelect ... */ 
  value, onChange, options, customValue, onCustomChange,
  placeholder, customPlaceholder, namePrefix, selectProps = {}, inputProps = {}
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    const isCustomCurrentlySelected = value === 'custom_entry';
    const hasCustomValue = customValue && customValue.trim() !== '';
    const valueNotInOptions = value && !options.some(opt => (typeof opt === 'object' ? opt.value === value : opt === value));

    if (isCustomCurrentlySelected || (hasCustomValue && (valueNotInOptions || !value))) {
        setShowCustomInput(true);
    } else {
        setShowCustomInput(false);
    }
  }, [value, customValue, options]);

  const handleSelectChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    if (newValue === 'custom_entry') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      if (onCustomChange) onCustomChange({ target: { name: e.target.name.replace('Value', 'Other'), value: '' } });
    }
  };
  
  const handleInputChange = (e) => {
    if (onCustomChange) onCustomChange(e);
  };

  return (
    <VStack align="stretch" spacing={2} w="100%">
      <Select size="sm" value={value || ''} onChange={handleSelectChange} placeholder={placeholder || "Оберіть..."} {...inputStyles} {...selectProps}>
        <option value="custom_entry">Інше (ввести вручну)</option>
        {options.map((opt, idx) => (
          typeof opt === 'object' ?
            <option key={`${namePrefix}-opt-${idx}`} value={opt.value}>{opt.label}</option> :
            <option key={`${namePrefix}-opt-${idx}`} value={opt}>{opt}</option>
        ))}
      </Select>
      {showCustomInput && (
        <Input 
            mt={1} 
            size="sm" 
            placeholder={customPlaceholder || "Введіть власне значення"} 
            value={customValue || ''} 
            onChange={handleInputChange} 
            {...inputStyles} 
            {...inputProps} 
        />
      )}
    </VStack>
  );
});


// --- Основний компонент ---
const PreHospitalCareSection = ({ recordIdToEdit, onSave, onCancel }) => {
  const isEditing = Boolean(recordIdToEdit);
  const toast = useToast();
  const navigate = useNavigate(); // Для кнопки "Повернутись до журналу"

  // Зберігаємо початковий cardId для режиму створення, щоб він не змінювався
  const initialCreateCardIdRef = useRef(null);
  if (!isEditing && !initialCreateCardIdRef.current) {
    initialCreateCardIdRef.current = generateClientSideId();
  }

  const getInitialFormState = useCallback(() => {
    let baseState = JSON.parse(JSON.stringify(INITIAL_PRE_HOSPITAL_FORM_DATA));
    if (isEditing && recordIdToEdit) {
      baseState._id = recordIdToEdit;
      baseState.cardId = ''; // Буде завантажено з сервера
    } else {
      // Використовуємо збережений ID для режиму створення
      baseState.cardId = initialCreateCardIdRef.current || generateClientSideId(); 
      delete baseState._id;
    }
    return baseState;
  }, [isEditing, recordIdToEdit]); 

  const [formData, setFormData] = useState(getInitialFormState);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // cardDisplayId тепер бере cardId з formData
  const cardDisplayId = formData?.cardId || (isEditing ? 'Завантаження ID...' : (initialCreateCardIdRef.current || 'Генерація ID...'));

  // ... (стани для кастомних значень: breathingRateCustom, etc.)
  const [breathingRateCustom, setBreathingRateCustom] = useState('');
  const [breathingSaturationCustom, setBreathingSaturationCustom] = useState('');
  const [pulseRateCustom, setPulseRateCustom] = useState('');
  const [bodyTemperatureCustom, setBodyTemperatureCustom] = useState('');

  const isPatientFullNameUnknown = formData.patientFullName?.toLowerCase().includes('невідом') || false;

  // ... (useEffect для patientFullName, DateOfBirth, ApproximateAge) ...
  useEffect(() => {
    if (isPatientFullNameUnknown) {
      if (formData.patientDateOfBirth) {
        setFormData(prev => ({ ...prev, patientDateOfBirth: '' }));
      }
    } else {
      if (formData.patientDateOfBirth && formData.patientApproximateAge) {
         setFormData(prev => ({ ...prev, patientApproximateAge: '' }));
      }
    }
  }, [isPatientFullNameUnknown, formData.patientDateOfBirth, formData.patientApproximateAge]);

  // ... (calculateGCS, calculateRTS, formatDateTimeForInput) ...
  const calculateGCS = useCallback(() => { /* ... */ 
    const eye = formData.glasgowComaScaleEye === 'NV' ? 0 : parseInt(formData.glasgowComaScaleEye, 10) || 0;
    const verbal = formData.glasgowComaScaleVerbal === 'NV' ? 0 : parseInt(formData.glasgowComaScaleVerbal, 10) || 0;
    const motor = formData.glasgowComaScaleMotor === 'NV' ? 0 : parseInt(formData.glasgowComaScaleMotor, 10) || 0;
    const isNV = formData.glasgowComaScaleEye === 'NV' || formData.glasgowComaScaleVerbal === 'NV' || formData.glasgowComaScaleMotor === 'NV';
    const total = eye + verbal + motor;
    return isNV ? `(${total})T` : total.toString();
  }, [formData.glasgowComaScaleEye, formData.glasgowComaScaleVerbal, formData.glasgowComaScaleMotor]);

  const calculateRTS = useCallback((gcsTotalString, systolicBPString, respRateValue) => { /* ... */ 
    if (gcsTotalString === null || gcsTotalString === undefined || systolicBPString === null || systolicBPString === undefined || respRateValue === null || respRateValue === undefined) return 'Н/Д';
    let gcsScore = 0;
    const gcsMatch = gcsTotalString.toString().match(/\d+/);
    const gcsNum = gcsMatch ? parseInt(gcsMatch[0], 10) : 0;
    if (gcsNum >= 13) gcsScore = 4; else if (gcsNum >= 9) gcsScore = 3; else if (gcsNum >= 6) gcsScore = 2; else if (gcsNum >= 4) gcsScore = 1; else gcsScore = 0;
    let bpScore = 0;
    const bpNum = parseInt(systolicBPString, 10);
    if (isNaN(bpNum) && systolicBPString !== '') return 'Н/Д'; if (isNaN(bpNum) && systolicBPString === '') { bpScore = 0; }
    else { if (bpNum > 89) bpScore = 4; else if (bpNum >= 76) bpScore = 3; else if (bpNum >= 50) bpScore = 2; else if (bpNum >= 1) bpScore = 1; else bpScore = 0; }
    let rrScore = 0; let rrNum = NaN;
    if (typeof respRateValue === 'string') {
      if (respRateValue.includes('>30') || respRateValue.includes('25-30')) rrNum = 29;
      else if (respRateValue.includes('10-12') || respRateValue.includes('13-20') || respRateValue.includes('21-24')) rrNum = 15;
      else if (respRateValue.includes('6-9')) rrNum = 8;
      else if (respRateValue.includes('1-5') || respRateValue === '0' || respRateValue === 'apneic_no_effort' || respRateValue === 'agonal_gasping') rrNum = 0;
      else { const parsedRR = parseInt(respRateValue, 10); if (!isNaN(parsedRR)) rrNum = parsedRR; }
    } else if (typeof respRateValue === 'number') rrNum = respRateValue;
    if (isNaN(rrNum) && respRateValue !== '') return 'Н/Д'; if (isNaN(rrNum) && respRateValue === '') { rrScore = 0; }
    else { if (rrNum >= 10 && rrNum <= 29) rrScore = 4; else if (rrNum > 29) rrScore = 3; else if (rrNum >= 6 && rrNum <= 9) rrScore = 2; else if (rrNum >= 1 && rrNum <= 5) rrScore = 1; else rrScore = 0; }
    if ((isNaN(bpNum) && systolicBPString !== '') || (isNaN(rrNum) && respRateValue !== '')) return 'Н/Д';
    return (gcsScore + bpScore + rrScore).toString();
  }, []);

  const formatDateTimeForInput = useCallback((dateTimeString) => { /* ... */ 
    if (!dateTimeString) return '';
    try {
      return format(parseISO(dateTimeString), "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
      console.warn("Error formatting dateTimeString for input:", dateTimeString, e);
      if (typeof dateTimeString === 'string' && dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return dateTimeString;
      }
      return '';
    }
  }, []);

  // --- Завантаження та ініціалізація даних ---
  useEffect(() => {
    const loadRecordData = async (idToLoad) => {
      // ... (ваш код loadRecordData залишається тут, як в попередньому прикладі)
      // Головне, щоб він встановлював formData.cardId з сервера
      setIsLoading(true);
      try {
        const response = await getTraumaRecordById(idToLoad);
        if (response.data) {
          const loadedServerData = response.data;
          let baseFormData = JSON.parse(JSON.stringify(INITIAL_PRE_HOSPITAL_FORM_DATA));

          let mergedData = {
            ...baseFormData,
            ...loadedServerData,
            ...(loadedServerData.patientInfo && {
                patientFullName: loadedServerData.patientInfo.patientFullName || '',
                patientGender: loadedServerData.patientInfo.patientGender || '',
                patientDateOfBirth: loadedServerData.patientInfo.patientDateOfBirth 
                      ? format(parseISO(loadedServerData.patientInfo.patientDateOfBirth), 'yyyy-MM-dd') 
                      : '',
                patientApproximateAge: loadedServerData.patientInfo.patientApproximateAge || '',
            }),
            incidentDateTime: formatDateTimeForInput(loadedServerData.incidentDateTime),
            arrivalDateTime: formatDateTimeForInput(loadedServerData.arrivalDateTime),
            cardId: loadedServerData.cardId || '', // Важливо: cardId з сервера
            _id: loadedServerData._id || idToLoad
          };
          delete mergedData.patientInfo;
          
          if (mergedData.breathingRate && !BREATHING_RATE_OPTIONS.find(o=>o.value===mergedData.breathingRate)) { setBreathingRateCustom(mergedData.breathingRate); mergedData.breathingRate='custom'; } else { setBreathingRateCustom(''); }
          if (mergedData.breathingSaturation && !OXYGEN_SATURATION_OPTIONS.find(o=>o.value===mergedData.breathingSaturation)) { setBreathingSaturationCustom(mergedData.breathingSaturation); mergedData.breathingSaturation='custom'; } else { setBreathingSaturationCustom(''); }
          if (mergedData.pulseRate && !PULSE_RATE_OPTIONS.find(o=>o.value===mergedData.pulseRate)) { setPulseRateCustom(mergedData.pulseRate); mergedData.pulseRate='custom'; } else { setPulseRateCustom(''); }
          if (mergedData.bodyTemperature && !BODY_TEMPERATURE_OPTIONS.find(o=>o.value===mergedData.bodyTemperature)) { setBodyTemperatureCustom(mergedData.bodyTemperature); mergedData.bodyTemperature='custom'; } else { setBodyTemperatureCustom(''); }
          if (mergedData.sceneTypeValue && !SCENE_TYPE_OPTIONS.find(o=>o.value===mergedData.sceneTypeValue)) { mergedData.sceneTypeOther = mergedData.sceneTypeValue; mergedData.sceneTypeValue = 'other'; } else if (mergedData.sceneTypeValue !== 'other') { mergedData.sceneTypeOther = ''; }

          mergedData.medicationsAdministered = (mergedData.medicationsAdministered || []).map(med => ({ ...med, customName: (!COMMON_PREHOSPITAL_MEDICATIONS.includes(med.name) && med.name !== 'custom_entry' && med.name) ? med.name : (med.customName || ''), name: (!COMMON_PREHOSPITAL_MEDICATIONS.includes(med.name) && med.name !== 'custom_entry' && med.name) ? 'custom_entry' : (med.name || ''), customRoute: (!MEDICATION_ROUTE_OPTIONS.some(o=>o.value===med.route) && med.route !== 'custom_entry' && med.route) ? med.route : (med.customRoute || ''), route: (!MEDICATION_ROUTE_OPTIONS.some(o=>o.value===med.route) && med.route !== 'custom_entry' && med.route) ? 'custom_entry' : (med.route || ''), }));
          mergedData.proceduresPerformed = (mergedData.proceduresPerformed || []).map(proc => ({ ...proc, customName: (!COMMON_PREHOSPITAL_PROCEDURES.includes(proc.name) && proc.name !== 'custom_entry' && proc.name) ? proc.name : (proc.customName || ''), name: (!COMMON_PREHOSPITAL_PROCEDURES.includes(proc.name) && proc.name !== 'custom_entry' && proc.name) ? 'custom_entry' : (proc.name || ''), }));
          
          console.log("[PreHospitalCareSection] Merged data for form (EDIT):", JSON.stringify(mergedData, null, 2));
          setFormData(mergedData);
          toast({ title: "Дані картки завантажено", status: "success", duration: 2000, isClosable: true, position: "top-right" });
        } else {
            toast({ title: "Не вдалося завантажити дані картки", description: "Сервер повернув порожню відповідь.", status: "warning", duration: 3000, isClosable: true, position: "top-right" });
            setFormData(getInitialFormState()); 
        }
      } catch (error) {
        console.error("Помилка завантаження даних картки для редагування:", error);
        toast({ title: "Помилка завантаження картки", description: error.response?.data?.message || error.message || "Невідома помилка", status: "error", duration: 5000, isClosable: true, position: "top-right" });
        setFormData(getInitialFormState());
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing && recordIdToEdit) {
      loadRecordData(recordIdToEdit);
    } else {
      // Для режиму створення, переконуємося, що formData має cardId з initialCreateCardIdRef
      setFormData(prev => ({
        ...getInitialFormState(), // Отримуємо базовий стан
        cardId: initialCreateCardIdRef.current || generateClientSideId() // Встановлюємо/оновлюємо cardId
      }));
      setBreathingRateCustom(''); setBreathingSaturationCustom('');
      setPulseRateCustom(''); setBodyTemperatureCustom('');
    }
  }, [recordIdToEdit, isEditing, getInitialFormState, toast, formatDateTimeForInput]); // Додано getInitialFormState, бо він useCallback і залежить від isEditing, recordIdToEdit
  
  // ... (useEffect для автоматичних розрахунків) ...
  useEffect(() => {
    let updates = {};
    let needsUpdate = false;
    const gcs = calculateGCS();
    const currentRespRateForRTS = formData.breathingRate === 'custom' ? breathingRateCustom : formData.breathingRate;
    const rts = calculateRTS(gcs, formData.bloodPressureSystolic || '', currentRespRateForRTS);
    if (formData.rtsScore !== rts) { updates.rtsScore = rts; needsUpdate = true; }
    if (needsUpdate) setFormData(prev => ({ ...prev, ...updates }));
  }, [ formData.breathingQuality, formData.pulseQuality, formData.breathingRate, formData.breathingSaturation, formData.bloodPressureSystolic, formData.bloodPressureDiastolic, formData.capillaryRefillTime, formData.glasgowComaScaleEye, formData.glasgowComaScaleVerbal, formData.glasgowComaScaleMotor, breathingRateCustom, calculateGCS, calculateRTS ]);

  // --- Обробники змін полів форми ---
  const handleChange = useCallback((e) => { /* ... ваш код handleChange ... */ 
    const { name, value, type, checked } = e.target;
    if (name === 'breathingRate' && value !== 'custom') setBreathingRateCustom('');
    if (name === 'breathingSaturation' && value !== 'custom') setBreathingSaturationCustom('');
    if (name === 'pulseRate' && value !== 'custom') setPulseRateCustom('');
    if (name === 'bodyTemperature' && value !== 'custom') setBodyTemperatureCustom('');
    if (name === 'sceneTypeValue' && value !== 'other') {
      setFormData(prev => ({ ...prev, sceneTypeOther: '', [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  }, []);
  const handleNumericChange = useCallback((name, valueAsString, valueAsNumber) => { /* ... */ 
    setFormData(prev => ({ ...prev, [name]: valueAsString === '' ? '' : valueAsNumber }));
  }, []);
  const handleNestedListChange = useCallback((listName, index, field, value) => { /* ... */ 
    setFormData(prev => {
      const updatedList = prev[listName] ? JSON.parse(JSON.stringify(prev[listName])) : [];
      if (!updatedList[index]) updatedList[index] = {};
      updatedList[index][field] = value;
      if (field === 'name' && value !== 'custom_entry') updatedList[index].customName = '';
      if (field === 'route' && value !== 'custom_entry') updatedList[index].customRoute = '';
      return { ...prev, [listName]: updatedList };
    });
  }, []);
  const handleNestedListCustomChange = useCallback((listName, index, field, value) => { /* ... */ 
    setFormData(prev => {
      const updatedList = prev[listName] ? JSON.parse(JSON.stringify(prev[listName])) : [];
      if (!updatedList[index]) updatedList[index] = {};
      updatedList[index][field] = value;
      if (field === 'customName' && value) updatedList[index].name = 'custom_entry';
      if (field === 'customRoute' && value) updatedList[index].route = 'custom_entry';
      if (field === 'customName' && !value && updatedList[index].name === 'custom_entry') updatedList[index].name = '';
      if (field === 'customRoute' && !value && updatedList[index].route === 'custom_entry') updatedList[index].route = '';
      return { ...prev, [listName]: updatedList };
    });
  }, []);
  const addNestedListItem = useCallback((listName) => { /* ... */ 
    let newItem;
    if (listName === 'medicationsAdministered') { newItem = { name: '', customName: '', dosage: '', route: '', customRoute: '', time: '', effectiveness: '' }; } 
    else if (listName === 'proceduresPerformed') { newItem = { name: '', customName: '', time: '', details: '', effectiveness: '' }; }
    if (newItem) { setFormData(prev => ({ ...prev, [listName]: [...(Array.isArray(prev[listName]) ? prev[listName] : []), newItem] })); }
  }, []);
  const removeNestedListItem = useCallback((listName, index) => { /* ... */ 
    setFormData(prev => ({ ...prev, [listName]: (Array.isArray(prev[listName]) ? prev[listName] : []).filter((_, i) => i !== index), }));
  }, []);
  
  // --- Обробники кнопок дій ---
  const handleLoadTestData = useCallback(() => {
    // Генеруємо один випадковий, але повний об'єкт даних
    const testData = generatePreHospitalTestData();
    
    // Зберігаємо поточний ID картки, щоб не перезаписувати його
    const currentCardId = isEditing ? formData.cardId : initialCreateCardIdRef.current;

    // Формуємо новий стан, поєднуючи тестові дані зі збереженим ID
    const newFormData = {
      ...testData, // Розгортаємо згенеровані дані
      cardId: currentCardId,
      _id: isEditing ? recordIdToEdit : undefined,
    };

    // Оновлюємо стан форми
    setFormData(newFormData);

    toast({
        title: "Тестові дані завантажено!",
        description: `Сценарій: "${testData.exposureDetails}"`,
        status: "info",
        duration: 4000,
        isClosable: true,
        position: "top-right"
    });
}, [isEditing, recordIdToEdit, formData.cardId, toast]);

  const handleClearForm = useCallback(() => {
    const currentCardId = isEditing ? formData.cardId : initialCreateCardIdRef.current;
    setFormData({
        ...getInitialFormState(), // Отримуємо базовий стан
        cardId: currentCardId || generateClientSideId(), // Зберігаємо cardId
        _id: isEditing ? recordIdToEdit : undefined // Зберігаємо _id якщо редагування
    });
    setBreathingRateCustom(''); setBreathingSaturationCustom(''); 
    setPulseRateCustom(''); setBodyTemperatureCustom('');
    toast({ title: "Форму очищено", status: "info", duration: 2000, isClosable: true, position: "top-right" });
  }, [getInitialFormState, isEditing, recordIdToEdit, formData.cardId, toast]); // Додано formData.cardId

  const handleSubmit = async (e) => {
    // ... (ваш код handleSubmit, як у попередньому прикладі)
    e.preventDefault();
    setIsSubmitting(true);
    let finalFormData = JSON.parse(JSON.stringify(formData));
    if (finalFormData.breathingRate === 'custom') finalFormData.breathingRate = breathingRateCustom || '';
    if (finalFormData.breathingSaturation === 'custom') finalFormData.breathingSaturation = breathingSaturationCustom || '';
    if (finalFormData.pulseRate === 'custom') finalFormData.pulseRate = pulseRateCustom || '';
    if (finalFormData.bodyTemperature === 'custom') finalFormData.bodyTemperature = bodyTemperatureCustom || '';
    if (finalFormData.sceneTypeValue === 'other') { finalFormData.sceneTypeValue = finalFormData.sceneTypeOther || 'Інше (не вказано)'; }
    finalFormData.medicationsAdministered = (finalFormData.medicationsAdministered || []).map(med => ({ name: med.name === 'custom_entry' ? (med.customName || '') : med.name, dosage: med.dosage || '', route: med.route === 'custom_entry' ? (med.customRoute || '') : med.route, time: med.time || '', effectiveness: med.effectiveness || '', })).filter(med => med.name && med.name.trim() !== '');
    finalFormData.proceduresPerformed = (finalFormData.proceduresPerformed || []).map(proc => ({ name: proc.name === 'custom_entry' ? (proc.customName || '') : proc.name, time: proc.time || '', details: proc.details || '', effectiveness: proc.effectiveness || '', })).filter(proc => proc.name && proc.name.trim() !== '');
    finalFormData.medicationsAdministered = finalFormData.medicationsAdministered.length > 0 ? finalFormData.medicationsAdministered : [];
    finalFormData.proceduresPerformed = finalFormData.proceduresPerformed.length > 0 ? finalFormData.proceduresPerformed : [];

    const dataToSave = { ...finalFormData, cardId: cardDisplayId, gcsTotal: calculateGCS(), rtsScore: finalFormData.rtsScore || 'Н/Д' };
    
    if (!isEditing) { delete dataToSave._id; }
    
    console.log(`[${isEditing ? "UPDATE" : "CREATE"}] Дані для відправки:`, JSON.stringify(dataToSave, null, 2));
    if(isEditing) console.log(`[UPDATE] ID для оновлення (recordIdToEdit): ${recordIdToEdit}`);

    try {
      let response;
      if (isEditing) {
        const payload = { ...dataToSave };
        delete payload._id; 
        response = await updateTraumaRecord(recordIdToEdit, payload);
        toast({ title: "Картку успішно оновлено!", description: `ID картки: ${response.data?.record?.cardId || cardDisplayId}`, status: "success", duration: 4000, isClosable: true, position: "top-right" });
      } else {
        response = await createPreHospitalRecord(dataToSave);
        toast({ title: "Картку успішно створено!", description: `ID картки: ${response.data?.record?.cardId || dataToSave.cardId}`, status: "success", duration: 4000, isClosable: true, position: "top-right" });
      }
      if (onSave) { onSave(response.data.record); }
    } catch (error) {
      console.error("Помилка збереження/оновлення картки:", error.response?.data || error.message || error);
      const errorMsg = error.response?.data?.message || (error.response?.data?.errors ? error.response.data.errors.join(', ') : null) || error.message || "Невідома помилка сервера.";
      toast({ title: "Помилка збереження картки", description: errorMsg, status: "error", duration: 7000, isClosable: true, position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ... (gcsTotalLocal, isNotTransported, showCustomSubInput) ...
  const gcsTotalLocal = calculateGCS();
  const isNotTransported = formData.transportationMethod === 'not_transported';
  const showCustomSubInput = (listName, index, fieldType) => {
    if (!formData || !formData[listName] || !formData[listName][index]) return false;
    if (fieldType === 'name') return formData[listName][index].name === 'custom_entry';
    if (fieldType === 'route') return formData[listName][index].route === 'custom_entry';
    return false;
  };

  if (isLoading && isEditing) { /* ... Спінер ... */ 
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
        <Text ml={4} fontSize="lg">Завантаження даних картки...</Text>
      </Flex>
    );
  }

  return (
     <Box {...mainBoxStyles}>
      <Flex {...headerFlexStyles} mb={4}> {/* Додано mb={4} для відступу */}
        <Button 
          leftIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/trauma-journal')} 
          variant="outline"
          colorScheme="gray"
          mr={4}
          size="sm" // Можна зробити меншою
        >
          До Журналу
        </Button>
        <Heading {...headerTitleStyles} size="lg">{isEditing ? "Редагування Картки" : "Створення Картки"}</Heading>
        <Text {...cardIdTextStyles} ml={3} alignSelf="center">#{cardDisplayId}</Text>
        <Spacer />
        {!isEditing && (
          <HStack spacing={3}> {/* HStack для кнопок */}
            <Button 
              colorScheme="gray" 
              variant="outline" 
              onClick={handleClearForm} 
              {...secondaryButtonStyles} 
              _hover={{bg: "gray.100", borderColor: "gray.400"}} 
              isDisabled={isSubmitting}
              size="sm"
            >
              Очистити
            </Button>
            <Button 
              colorScheme="yellow" 
              variant="solid" 
              onClick={handleLoadTestData} 
              {...secondaryButtonStyles} 
              _hover={{bg: "yellow.500"}} 
              isDisabled={isSubmitting}
              size="sm"
            >
              Тестові Дані
            </Button>
          </HStack>
        )}
      </Flex>

      <form onSubmit={handleSubmit}>
        {/* ... (решта форми, як у попередньому прикладі) ... */}
        <VStack spacing={5} align="stretch">
          <Accordion allowMultiple defaultIndex={[0]} borderWidth="0px"> 
            {/* Секція 1: Загальна інформація */}
            <AccordionItem {...accordionItemStyles}>
              <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}> Дані пацієнта та місце події</Box><AccordionIcon /></AccordionButton></h2>
              <AccordionPanel {...accordionPanelStyles}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={5}>
                  <FormControl isRequired><FormLabel {...formControlLabelStyles}>Дата та час події/виявлення</FormLabel>
                  <Input 
                      type="datetime-local" 
                      name="incidentDateTime" 
                      value={formData.incidentDateTime || ''} 
                      onChange={handleChange}
                      sx={{
                        ...inputStyles, // Ваші базові стилі для інпутів
                        color: formData.incidentDateTime ? undefined : 'gray.400', 
                      }}
                      // Щоб приховати іконку календаря, коли поле порожнє (опціонально, залежить від браузера)
                    />
                  </FormControl>
                  <FormControl isRequired><FormLabel {...formControlLabelStyles}>Дата та час прибуття на місце</FormLabel>
                  <Input 
                      type="datetime-local" 
                      name="arrivalDateTime" 
                      value={formData.arrivalDateTime || ''} 
                      onChange={handleChange} 
                      sx={{
                        ...inputStyles,
                        color: formData.arrivalDateTime ? undefined : 'gray.400',
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel {...formControlLabelStyles}>Тип місця події</FormLabel>
                    <CustomEntrySelect namePrefix="sceneType" value={formData.sceneTypeValue || ''} onChange={(e) => handleChange({ target: { name: 'sceneTypeValue', value: e.target.value } })} options={SCENE_TYPE_OPTIONS} customValue={formData.sceneTypeOther || ''} onCustomChange={(e) => handleChange({ target: { name: 'sceneTypeOther', value: e.target.value }})} placeholder="Оберіть тип" customPlaceholder="Вкажіть інший тип"/>
                  </FormControl>
                  <GridItem colSpan={{ base: 1, md: 2, lg: 1 }}><FormControl><FormLabel {...formControlLabelStyles}>ПІБ Пацієнта</FormLabel><Input placeholder="Прізвище Ім'я По-батькові або 'Невідомо(а)'" name="patientFullName" value={formData.patientFullName || ''} onChange={handleChange} {...inputStyles}/></FormControl></GridItem>
                  <FormControl><FormLabel {...formControlLabelStyles}>Стать</FormLabel><Select placeholder="Оберіть стать" name="patientGender" value={formData.patientGender || ''} onChange={handleChange} {...inputStyles}>{GENDER_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></FormControl>
                  <FormControl><FormLabel {...formControlLabelStyles}>Дата народження</FormLabel>
                  <Input 
                      type="date"
                      name="patientDateOfBirth" 
                      value={formData.patientDateOfBirth || ''} 
                      onChange={handleChange} 
                      isDisabled={isPatientFullNameUnknown} 
                      sx={{
                        ...inputStyles,
                        color: formData.patientDateOfBirth ? undefined : 'gray.400',
                      }}
                    />
                  </FormControl>
                  <FormControl><FormLabel {...formControlLabelStyles}>Орієнтовний вік</FormLabel><NumberInput min={0} max={130} name="patientApproximateAge" value={formData.patientApproximateAge || ''} isDisabled={!isPatientFullNameUnknown && !!formData.patientDateOfBirth} onChange={(valStr, valNum) => handleNumericChange('patientApproximateAge', valStr, valNum )} precision={0}><NumberInputField placeholder={isPatientFullNameUnknown ? "Введіть вік" : (formData.patientDateOfBirth ? "Вказано дату" : "Років")} {...inputStyles}/><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput></FormControl>
                  <GridItem colSpan={{base:1, md:2, lg:3}}><FormControl><FormLabel fontWeight="bold" color="red.500" mb="0.5">Контроль катастрофічної кровотечі (C)</FormLabel><Checkbox name="catastrophicHemorrhageControlled" isChecked={!!formData.catastrophicHemorrhageControlled} onChange={handleChange} colorScheme="red" size="lg">Критичну кровотечу виявлено та контрольовано (або відсутня)</Checkbox>{(formData.catastrophicHemorrhageControlled) && (<Textarea mt={2} name="catastrophicHemorrhageDetails" value={formData.catastrophicHemorrhageDetails || ''} onChange={handleChange} placeholder="Деталі: локалізація, метод контролю..." {...inputStyles}/>)}</FormControl></GridItem>
                </Grid>
              </AccordionPanel>
            </AccordionItem>
            {/* ... інші AccordionItem ... */}
             <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}> Оцінка стану (ABCDE)</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <VStack spacing={5} align="stretch">
                        <Box><Heading size="md" color="gray.700" mb={2}>A: Дихальні шляхи</Heading><FormControl><FormLabel {...formControlLabelStyles}>Стан</FormLabel><Select placeholder="Оберіть статус" name="airwayStatus" value={formData.airwayStatus||''} onChange={handleChange} {...inputStyles}>{AIRWAY_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></FormControl></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>B: Дихання</Heading><SimpleGrid columns={{ base: 1, md: 2, lg:3 }} spacing={4}><FormControl><FormLabel {...formControlLabelStyles}>ЧД (в хв.)</FormLabel><CustomEntrySelect namePrefix="breathingRate" value={formData.breathingRate || ''} onChange={(e) => handleChange({ target: { name: 'breathingRate', value: e.target.value }})} options={BREATHING_RATE_OPTIONS} customValue={breathingRateCustom || ''} onCustomChange={(e) => setBreathingRateCustom(e.target.value)} placeholder="Оберіть або введіть ЧД" customPlaceholder="Введіть ЧД (число)" inputProps={{type: "number"}}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>SpO2 (%)</FormLabel><CustomEntrySelect namePrefix="breathingSaturation" value={formData.breathingSaturation || ''} onChange={(e) => handleChange({ target: { name: 'breathingSaturation', value: e.target.value }})} options={OXYGEN_SATURATION_OPTIONS} customValue={breathingSaturationCustom || ''} onCustomChange={(e) => setBreathingSaturationCustom(e.target.value)} placeholder="Оберіть або введіть SpO2" customPlaceholder="Введіть SpO2 (число)" inputProps={{type: "number"}}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Характер</FormLabel><Select placeholder="Оберіть" name="breathingQuality" value={formData.breathingQuality||''} onChange={handleChange} {...inputStyles}>{BREATHING_QUALITY_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Екскурсія ГК</FormLabel><Select placeholder="Оберіть" name="chestExcursion" value={formData.chestExcursion||''} onChange={handleChange} {...inputStyles}>{CHEST_EXCURSION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Аускультація</FormLabel><Select placeholder="Оберіть" name="auscultationLungs" value={formData.auscultationLungs||''} onChange={handleChange} {...inputStyles}>{AUSCULTATION_LUNGS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl></SimpleGrid></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>C: Кровообіг</Heading><SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}><FormControl><FormLabel {...formControlLabelStyles}>Пульс: Локалізація</FormLabel><Select placeholder="Оберіть" name="pulseLocation" value={formData.pulseLocation||''} onChange={handleChange} {...inputStyles}>{PULSE_LOCATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Пульс: Частота</FormLabel><CustomEntrySelect namePrefix="pulseRate" value={formData.pulseRate || ''} onChange={(e) => handleChange({ target: { name: 'pulseRate', value: e.target.value }})} options={PULSE_RATE_OPTIONS} customValue={pulseRateCustom || ''} onCustomChange={(e) => setPulseRateCustom(e.target.value)} placeholder="Оберіть або введіть ЧСС" customPlaceholder="Введіть ЧСС (число)" inputProps={{type: "number"}}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Пульс: Якість</FormLabel><Select placeholder="Оберіть" name="pulseQuality" value={formData.pulseQuality||''} onChange={handleChange} {...inputStyles}>{PULSE_QUALITY_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>АТ сист.</FormLabel><NumberInput min={0} name="bloodPressureSystolic" value={formData.bloodPressureSystolic || ''} onChange={(valStr, valNum) => handleNumericChange('bloodPressureSystolic', valStr, valNum)}><NumberInputField placeholder="мм рт.ст." {...inputStyles}/><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput></FormControl><FormControl><FormLabel {...formControlLabelStyles}>АТ діаст.</FormLabel><NumberInput min={0} name="bloodPressureDiastolic" value={formData.bloodPressureDiastolic || ''} onChange={(valStr, valNum) => handleNumericChange('bloodPressureDiastolic', valStr, valNum)}><NumberInputField placeholder="мм рт.ст." {...inputStyles}/><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Капілярне наповн.</FormLabel><Select placeholder="Оберіть" name="capillaryRefillTime" value={formData.capillaryRefillTime||''} onChange={handleChange} {...inputStyles}>{CAPILLARY_REFILL_TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Шкірні покриви</FormLabel><Select placeholder="Оберіть" name="skinStatus" value={formData.skinStatus||''} onChange={handleChange} {...inputStyles}>{SKIN_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Зовнішня кровотеча</FormLabel><Select placeholder="Оберіть" name="externalBleeding" value={formData.externalBleeding||''} onChange={handleChange} {...inputStyles}>{EXTERNAL_BLEEDING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl></SimpleGrid></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>D: Неврологічний статус</Heading><HStack spacing={4} alignItems="baseline" wrap="wrap" mb={3}><Text fontWeight="bold" fontSize="md">ШКГ (GCS):</Text><Text fontSize="lg" fontWeight="bold" color="teal.500">{gcsTotalLocal} / 15</Text></HStack><SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}><FormControl><FormLabel {...formControlLabelStyles}>Очі (E)</FormLabel><Select placeholder="E" name="glasgowComaScaleEye" value={formData.glasgowComaScaleEye||''} onChange={handleChange} {...inputStyles}>{GCS_EYE_OPTIONS.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Мова (V)</FormLabel><Select placeholder="V" name="glasgowComaScaleVerbal" value={formData.glasgowComaScaleVerbal||''} onChange={handleChange} {...inputStyles}>{GCS_VERBAL_OPTIONS.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Рухи (M)</FormLabel><Select placeholder="M" name="glasgowComaScaleMotor" value={formData.glasgowComaScaleMotor||''} onChange={handleChange} {...inputStyles}>{GCS_MOTOR_OPTIONS.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl></SimpleGrid><SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}><FormControl><FormLabel {...formControlLabelStyles}>Зіниці</FormLabel><Select placeholder="Оберіть" name="pupilReaction" value={formData.pupilReaction||''} onChange={handleChange} {...inputStyles}>{PUPIL_REACTION_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Рух./Чутл. статус</FormLabel><Select placeholder="Оберіть" name="motorSensoryStatus" value={formData.motorSensoryStatus||''} onChange={handleChange} {...inputStyles}>{MOTOR_SENSORY_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl><GridItem colSpan={{base: 1, md: 2}}><FormControl><FormLabel {...formControlLabelStyles}>Додаткові неврол. знахідки</FormLabel><Textarea name="neurologicalStatusDetails" value={formData.neurologicalStatusDetails||''} onChange={handleChange} placeholder="Судоми, парези, паралічі..." {...inputStyles}/></FormControl></GridItem></SimpleGrid></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>E: Огляд / Середовище</Heading><SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl><FormLabel {...formControlLabelStyles}>t°C тіла</FormLabel><CustomEntrySelect namePrefix="bodyTemperature" value={formData.bodyTemperature || ''} onChange={(e) => handleChange({ target: { name: 'bodyTemperature', value: e.target.value }})} options={BODY_TEMPERATURE_OPTIONS} customValue={bodyTemperatureCustom || ''} onCustomChange={(e) => setBodyTemperatureCustom(e.target.value)} placeholder="Оберіть або введіть t°C" customPlaceholder="Введіть t°C (число)" inputProps={{type: "number", step: "0.1"}}/></FormControl><GridItem colSpan={{base: 1, md: 2}}>
                                {/* <FormControl isRequired><FormLabel {...formControlLabelStyles}>Виявлені ушкодження / Огляд</FormLabel><Textarea name="exposureDetails" value={formData.exposureDetails||''} onChange={handleChange} rows={4} placeholder="Детальний опис всіх виявлених травм..." {...inputStyles}/></FormControl> */}
                                </GridItem></SimpleGrid></Box>
                    </VStack>
                </AccordionPanel>
            </AccordionItem>
            {/* <AccordionItem {...accordionItemStyles}>
                 <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>3. Скарги, Анамнез (SAMPLE), Обставини</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <VStack spacing={4} align="stretch"><FormControl><FormLabel {...formControlLabelStyles}>Скарги пацієнта (S)</FormLabel><Textarea name="complaints" value={formData.complaints||''} onChange={handleChange} placeholder="Основні скарги..." {...inputStyles}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Алергії (A)</FormLabel><Textarea name="allergies" value={formData.allergies||''} onChange={handleChange} placeholder="Відомі алергії..." {...inputStyles}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Медикаменти (M)</FormLabel><Textarea name="medicationsTaken" value={formData.medicationsTaken||''} onChange={handleChange} placeholder="Медикаменти, які пацієнт приймає..." {...inputStyles}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Перенесені захворювання/травми (P)</FormLabel><Textarea name="pastMedicalHistory" value={formData.pastMedicalHistory||''} onChange={handleChange} placeholder="Важливі хронічні захворювання..." {...inputStyles}/></FormControl><SimpleGrid columns={{base:1, md:2}} spacing={4}><FormControl><FormLabel {...formControlLabelStyles}>Останній прийом їжі/рідини (L)</FormLabel><Input name="lastOralIntakeMeal" value={formData.lastOralIntakeMeal||''} onChange={handleChange} placeholder="Що саме?" {...inputStyles}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Час останнього прийому</FormLabel><Input type="time" name="lastOralIntakeTime" value={formData.lastOralIntakeTime||''} onChange={handleChange} {...inputStyles}/></FormControl></SimpleGrid><FormControl><FormLabel {...formControlLabelStyles}>Події, що передували (E)</FormLabel><Textarea name="eventsLeadingToInjury" value={formData.eventsLeadingToInjury||''} onChange={handleChange} placeholder="Що робив пацієнт..." {...inputStyles}/></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Механізм травми / Обставини події (Детально)</FormLabel><Textarea name="mechanismOfInjuryDetailed" value={formData.mechanismOfInjuryDetailed||''} onChange={handleChange} rows={3} placeholder="ДТП, падіння, удар..." {...inputStyles}/></FormControl></VStack>
                </AccordionPanel>
            </AccordionItem> */}
            <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>Надана допомога</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <Heading size="md" mb={3} color="gray.700">Введені медикаменти</Heading><VStack spacing={4} align="stretch">{(formData.medicationsAdministered || []).map((med, index) => (<Box key={`med-${index}`} {...nestedListBoxStyles}><Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "2.5fr 1fr 1.5fr 1fr 1.5fr auto" }} gap={3} alignItems="flex-end"><FormControl gridColumn={{ base: "1 / -1", md: "1 / -1", xl: "1 / 2" }}><FormLabel {...formControlLabelStyles} fontSize="sm">Назва препарату</FormLabel><CustomEntrySelect namePrefix={`med-name-${index}`} value={med.name || ''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'name', e.target.value)} options={COMMON_PREHOSPITAL_MEDICATIONS} customValue={med.customName || ''} onCustomChange={(e) => handleNestedListCustomChange('medicationsAdministered', index, 'customName', e.target.value)} placeholder="Оберіть препарат" customPlaceholder="Введіть назву"/></FormControl><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Доза</FormLabel><Input size="sm" value={med.dosage||''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'dosage', e.target.value)} placeholder="Напр. 10мг" {...inputStyles}/></FormControl><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Шлях введення</FormLabel><CustomEntrySelect namePrefix={`med-route-${index}`} value={med.route || ''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'route', e.target.value)} options={MEDICATION_ROUTE_OPTIONS} customValue={med.customRoute || ''} onCustomChange={(e) => handleNestedListCustomChange('medicationsAdministered', index, 'customRoute', e.target.value)} placeholder="Оберіть шлях" customPlaceholder="Введіть шлях"/></FormControl><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Час</FormLabel><Input size="sm" type="time" value={med.time||''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'time', e.target.value)} {...inputStyles}/></FormControl><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Ефективність</FormLabel><Select size="sm" placeholder="Оцініть" value={med.effectiveness||''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'effectiveness', e.target.value)} {...inputStyles}>{EFFECTIVENESS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl><IconButton aria-label="Видалити медикамент" icon={<DeleteIcon />} colorScheme="red" variant="ghost" size="sm" onClick={() => removeNestedListItem('medicationsAdministered', index)} alignSelf="flex-end" mb={showCustomSubInput('medicationsAdministered', index, 'name') || showCustomSubInput('medicationsAdministered', index, 'route') ? 10 : 1} /></Grid></Box>))}<Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" variant="outline" onClick={() => addNestedListItem('medicationsAdministered')} borderRadius="lg" alignSelf="flex-start">Додати медикамент</Button></VStack>
                    <Divider my={6} borderColor="gray.300"/>
                    <Heading size="md" mb={3} color="gray.700">Виконані процедури/маніпуляції</Heading><VStack spacing={4} align="stretch">{(formData.proceduresPerformed || []).map((proc, index) => (<Box key={`proc-${index}`} {...nestedListBoxStyles}><Grid templateColumns={{ base: "1fr", md: "2fr 1fr auto" }} gap={3} alignItems="flex-start"><GridItem colSpan={{base:1, md:1}}><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Назва процедури</FormLabel><CustomEntrySelect namePrefix={`proc-name-${index}`} value={proc.name || ''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'name', e.target.value)} options={COMMON_PREHOSPITAL_PROCEDURES} customValue={proc.customName || ''} onCustomChange={(e) => handleNestedListCustomChange('proceduresPerformed', index, 'customName', e.target.value)} placeholder="Оберіть процедуру" customPlaceholder="Введіть назву"/></FormControl></GridItem><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Час виконання</FormLabel><Input size="sm" type="time" value={proc.time||''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'time', e.target.value)} {...inputStyles}/></FormControl><IconButton aria-label="Видалити процедуру" icon={<DeleteIcon />} colorScheme="red" variant="ghost" size="sm" onClick={() => removeNestedListItem('proceduresPerformed', index)} alignSelf="center" mt={showCustomSubInput('proceduresPerformed', index, 'name') ? 7 : 2}/><GridItem colSpan={{ base: 1, md: 3 }}><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Деталі процедури</FormLabel><Textarea size="sm" value={proc.details||''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'details', e.target.value)} placeholder="Опишіть деталі..." {...inputStyles}/></FormControl></GridItem><GridItem colSpan={{ base: 1, md: 3 }}><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Ефективність</FormLabel><Select size="sm" placeholder="Оцініть" value={proc.effectiveness||''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'effectiveness', e.target.value)} {...inputStyles}>{EFFECTIVENESS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl></GridItem></Grid></Box>))}<Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" variant="outline" onClick={() => addNestedListItem('proceduresPerformed')} borderRadius="lg" alignSelf="flex-start">Додати процедуру</Button></VStack>
                    <Divider my={6} borderColor="gray.300"/><FormControl><FormLabel {...formControlLabelStyles}>В/В доступ (деталі)</FormLabel><Textarea name="ivAccessDetails" value={formData.ivAccessDetails||''} onChange={handleChange} placeholder="Місце, катетер G, спроби, інфузія..." {...inputStyles}/></FormControl>
                </AccordionPanel>
            </AccordionItem>
            <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}> Транспортування</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}><Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}><FormControl><FormLabel {...formControlLabelStyles}>Спосіб транспортування</FormLabel><Select placeholder="Оберіть спосіб" name="transportationMethod" value={formData.transportationMethod||''} onChange={handleChange} {...inputStyles}>{TRANSPORTATION_METHOD_OPTIONS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</Select></FormControl>{formData.transportationMethod === 'other' && (<FormControl isRequired={!isNotTransported}><FormLabel {...formControlLabelStyles}>Деталі іншого способу</FormLabel><Textarea name="transportationOtherDetails" value={formData.transportationOtherDetails||''} onChange={handleChange} placeholder="Вкажіть деталі..." isDisabled={isNotTransported} {...inputStyles}/></FormControl>)}<FormControl><FormLabel {...formControlLabelStyles}>Лікувальний заклад (куди транспортується)</FormLabel><Input name="destinationFacility" value={formData.destinationFacility||''} onChange={handleChange} placeholder="Назва закладу та відділення" isDisabled={isNotTransported} {...inputStyles}/></FormControl></Grid></AccordionPanel>
            </AccordionItem>
            <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}> Тріаж та додаткова інформація</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}><VStack spacing={4} align="stretch">
                    <FormControl><FormLabel {...formControlLabelStyles}>Тріажна категорія</FormLabel><Select placeholder="Оберіть категорію" name="triageCategory" value={formData.triageCategory||''} onChange={handleChange} {...inputStyles}>{TRIAGE_CATEGORIES_OPTIONS.map(cat => <option key={cat.value} value={cat.value} style={{color: cat.value !== 'unknown' ? cat.color : undefined }}>{cat.label}</option>)}</Select></FormControl><FormControl><FormLabel {...formControlLabelStyles}>Revised Trauma Score (RTS)</FormLabel><Input name="rtsScore" value={formData.rtsScore || 'Н/Д'} isReadOnly placeholder="Розраховується" _placeholder={{ color: 'gray.500' }} bg={formData.rtsScore && formData.rtsScore !== 'Н/Д' ? "gray.200" : "gray.100"} {...inputStyles}/></FormControl>
                    {/* <FormControl><FormLabel {...formControlLabelStyles}>Додаткові примітки / Ускладнення</FormLabel>
                <Textarea name="additionalNotes" value={formData.additionalNotes||''} onChange={handleChange} placeholder="Будь-яка інша важлива інформація..." {...inputStyles}/></FormControl> */}
                <FormControl isRequired><FormLabel {...formControlLabelStyles}>Відповідальний мед. працівник (ПІБ, посада)</FormLabel><Input name="medicalTeamResponsible" value={formData.medicalTeamResponsible||''} onChange={handleChange} placeholder="Напр. Лікар ЕМД Іванов І.І." {...inputStyles}/></FormControl></VStack></AccordionPanel>
            </AccordionItem>
          </Accordion>

          <HStack {...actionButtonsHStackStyles}>
            {onCancel && <Button variant="ghost" colorScheme="gray" onClick={onCancel} size="lg" minW="120px" borderRadius="lg" isDisabled={isSubmitting}>Скасувати</Button>}
            <Button type="submit" {...primaryButtonStyles} isLoading={isSubmitting} isDisabled={isSubmitting}>
              {isEditing ? "Оновити Картку" : "Зберегти Картку"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default PreHospitalCareSection;