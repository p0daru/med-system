// frontend/src/components/PreHospitalCare/PreHospitalCareSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, FormControl, FormLabel, Input, Select, Textarea, Button,
  Grid, GridItem, VStack, HStack, Text, IconButton, Checkbox,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useToast, Divider, Flex, Spacer, SimpleGrid, Spinner
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  GENDER_OPTIONS, CONSCIOUSNESS_LEVELS_AVPU, AIRWAY_STATUS_OPTIONS,
  BREATHING_RATE_OPTIONS, OXYGEN_SATURATION_OPTIONS, BREATHING_QUALITY_OPTIONS,
  CHEST_EXCURSION_OPTIONS, AUSCULTATION_LUNGS_OPTIONS,
  PULSE_RATE_OPTIONS, PULSE_QUALITY_OPTIONS, PULSE_LOCATION_OPTIONS,
  CAPILLARY_REFILL_TIME_OPTIONS, SKIN_STATUS_OPTIONS, EXTERNAL_BLEEDING_OPTIONS,
  GCS_EYE_OPTIONS, GCS_VERBAL_OPTIONS, GCS_MOTOR_OPTIONS, PUPIL_REACTION_OPTIONS,
  MOTOR_SENSORY_STATUS_OPTIONS, BODY_TEMPERATURE_OPTIONS,
  TRANSPORTATION_METHOD_OPTIONS, TRIAGE_CATEGORIES_OPTIONS, EFFECTIVENESS_OPTIONS,
  SCENE_TYPE_OPTIONS, MEDICATION_ROUTE_OPTIONS,
  COMMON_PREHOSPITAL_MEDICATIONS, COMMON_PREHOSPITAL_PROCEDURES,
  INITIAL_PRE_HOSPITAL_FORM_DATA,
} from './patientCardConstants';
import { generatePreHospitalTestData } from './testData';

// Імпорт стилів
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

const generateClientSideId = () => {
  let result = 'TRM-';
  const alphanumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
};

const CustomEntrySelect = ({
  value, onChange, options, customValue, onCustomChange,
  placeholder, customPlaceholder, namePrefix, selectProps = {}, inputProps = {}
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  useEffect(() => {
    if (value === 'custom_entry' || (customValue && (!value || value === 'custom_entry' || (value && !options.some(opt => (typeof opt === 'object' ? opt.value === value : opt === value)))))) {
        setShowCustomInput(true);
    } else {
        setShowCustomInput(false);
    }
  }, [value, customValue, options]);

  const handleSelectChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    if (newValue === 'custom_entry') setShowCustomInput(true);
    else { setShowCustomInput(false); if (onCustomChange) onCustomChange(''); }
  };
  const handleInputChange = (e) => { if (onCustomChange) onCustomChange(e.target.value); };

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
        <Input mt={1} size="sm" placeholder={customPlaceholder || "Введіть власне значення"} value={customValue || ''} onChange={handleInputChange} {...inputStyles} {...inputProps} />
      )}
    </VStack>
  );
};

const PreHospitalCareSection = ({ recordIdToEdit, onSave, onCancel }) => {
  // Функція для отримання початкового стану
  const getInitialFormState = useCallback((idToEdit) => {
    let baseState = JSON.parse(JSON.stringify(INITIAL_PRE_HOSPITAL_FORM_DATA));
    if (idToEdit) {
      baseState.cardId = idToEdit;
      baseState._id = idToEdit;
    } else {
      baseState.cardId = generateClientSideId();
      delete baseState._id;
    }
    return baseState;
  }, []); // recordIdToEdit прибрано з залежностей, бо передається як аргумент

  const [formData, setFormData] = useState(() => getInitialFormState(recordIdToEdit));
  const [isLoading, setIsLoading] = useState(false); // Стан для індикатора завантаження
  const [isSubmitting, setIsSubmitting] = useState(false); // Стан для індикатора відправки
  
  const cardDisplayId = formData?.cardId || '';
  const toast = useToast();

  const [breathingRateCustom, setBreathingRateCustom] = useState('');
  const [breathingSaturationCustom, setBreathingSaturationCustom] = useState('');
  const [pulseRateCustom, setPulseRateCustom] = useState('');
  const [bodyTemperatureCustom, setBodyTemperatureCustom] = useState('');

  const isPatientFullNameUnknown = formData.patientFullName?.toLowerCase().includes('невідом') || false;

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
  }, [isPatientFullNameUnknown, formData.patientDateOfBirth, formData.patientApproximateAge]); // Додано formData.patientApproximateAge

  const calculateGCS = useCallback(() => {
    const eye = formData.glasgowComaScaleEye === 'NV' ? 0 : parseInt(formData.glasgowComaScaleEye, 10) || 0;
    const verbal = formData.glasgowComaScaleVerbal === 'NV' ? 0 : parseInt(formData.glasgowComaScaleVerbal, 10) || 0;
    const motor = formData.glasgowComaScaleMotor === 'NV' ? 0 : parseInt(formData.glasgowComaScaleMotor, 10) || 0;
    const isNV = formData.glasgowComaScaleEye === 'NV' || formData.glasgowComaScaleVerbal === 'NV' || formData.glasgowComaScaleMotor === 'NV';
    const total = eye + verbal + motor;
    return isNV ? `(${total})T` : total.toString();
  }, [formData.glasgowComaScaleEye, formData.glasgowComaScaleVerbal, formData.glasgowComaScaleMotor]);

  const calculateRTS = useCallback((gcsTotalString, systolicBPString, respRateValue) => {
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

   // useEffect для завантаження даних при редагуванні
  useEffect(() => {
    const loadRecordData = async (id) => {
      setIsLoading(true);
      try {
        const response = await getTraumaRecordById(id); // ВИКЛИК API
        if (response.data) {
          const loadedServerData = response.data; // Припускаємо, що API повертає весь об'єкт картки
          
          let baseFormData = JSON.parse(JSON.stringify(INITIAL_PRE_HOSPITAL_FORM_DATA));
          // Важливо: cardId з сервера має пріоритет, якщо він є, інакше беремо переданий recordIdToEdit
          const currentCardId = loadedServerData.cardId || id; 
          
          let mergedData = { 
            ...baseFormData, 
            ...loadedServerData, 
            cardId: currentCardId, // Встановлюємо cardId
            _id: loadedServerData._id || id // Встановлюємо MongoDB _id
          };
          
          // Ініціалізація кастомних станів та полів "Інше"
          let tempBRC = ''; if (mergedData.breathingRate && !BREATHING_RATE_OPTIONS.find(o=>o.value===mergedData.breathingRate)) {tempBRC=mergedData.breathingRate; mergedData.breathingRate='custom';} setBreathingRateCustom(tempBRC);
          let tempBSC = ''; if (mergedData.breathingSaturation && !OXYGEN_SATURATION_OPTIONS.find(o=>o.value===mergedData.breathingSaturation)) {tempBSC=mergedData.breathingSaturation; mergedData.breathingSaturation='custom';} setBreathingSaturationCustom(tempBSC);
          let tempPRC = ''; if (mergedData.pulseRate && !PULSE_RATE_OPTIONS.find(o=>o.value===mergedData.pulseRate)) {tempPRC=mergedData.pulseRate; mergedData.pulseRate='custom';} setPulseRateCustom(tempPRC);
          let tempBTC = ''; if (mergedData.bodyTemperature && !BODY_TEMPERATURE_OPTIONS.find(o=>o.value===mergedData.bodyTemperature)) {tempBTC=mergedData.bodyTemperature; mergedData.bodyTemperature='custom';} setBodyTemperatureCustom(tempBTC);
          if (mergedData.sceneTypeValue && !SCENE_TYPE_OPTIONS.find(o=>o.value===mergedData.sceneTypeValue)) {mergedData.sceneTypeOther = mergedData.sceneTypeValue; mergedData.sceneTypeValue = 'other';} else if (mergedData.sceneTypeValue !== 'other') {mergedData.sceneTypeOther = '';}

          mergedData.medicationsAdministered = (mergedData.medicationsAdministered || []).map(med => {
              let fm = {...med};
              if(med.name && !COMMON_PREHOSPITAL_MEDICATIONS.includes(med.name) && med.name!=='custom_entry'){fm.customName=med.name;fm.name='custom_entry';}else{fm.customName=med.customName||'';}
              if(med.route && !MEDICATION_ROUTE_OPTIONS.find(o=>o.value===med.route) && med.route!=='custom_entry'){fm.customRoute=med.route;fm.route='custom_entry';}else{fm.customRoute=med.customRoute||'';}
              return fm;
          });
          mergedData.proceduresPerformed = (mergedData.proceduresPerformed || []).map(proc => {
              let fp = {...proc};
              if(proc.name && !COMMON_PREHOSPITAL_PROCEDURES.includes(proc.name) && proc.name!=='custom_entry'){fp.customName=proc.name;fp.name='custom_entry';}else{fp.customName=proc.customName||'';}
              return fp;
          });

          setFormData(mergedData);
          toast({ title: "Дані картки завантажено", status: "success", duration: 2000, isClosable: true, position: "top-right" });
        } else {
            // Якщо API не повернув дані, але не було помилки (малоймовірно з axios)
            toast({ title: "Не вдалося завантажити дані картки", description: "Сервер повернув порожню відповідь.", status: "warning", duration: 3000, isClosable: true, position: "top-right" });
            setFormData(getInitialFormState(id)); // Скидаємо до початкового з ID
        }
      } catch (error) {
        console.error("Помилка завантаження даних картки для редагування:", error);
        toast({
          title: "Помилка завантаження картки",
          description: error.response?.data?.message || error.message || "Невідома помилка",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
        // Якщо не вдалося завантажити, скидаємо до початкового стану з поточним ID
        setFormData(getInitialFormState(id));
      } finally {
        setIsLoading(false);
      }
    };

    if (recordIdToEdit) {
      // Завантажуємо дані тільки якщо formData.cardId ще не відповідає recordIdToEdit (уникнення повторного завантаження)
      // Або якщо _id порожній (означає, що дані ще не завантажені для цього ID)
      if (formData.cardId !== recordIdToEdit || !formData._id) {
          loadRecordData(recordIdToEdit);
      }
    } else {
      // Якщо ми перейшли з редагування на створення
      if (formData._id || !formData.cardId) { // Якщо є _id (залишився від редагування) або немає cardId
        setFormData(getInitialFormState(null));
        setBreathingRateCustom(''); setBreathingSaturationCustom(''); setPulseRateCustom(''); setBodyTemperatureCustom('');
      }
    }
  }, [recordIdToEdit, getInitialFormState, toast, formData.cardId, formData._id]); // Додано formData.cardId та formData._id для більш точного контролю
  
  
  useEffect(() => {
    let updates = {};
    let needsUpdate = false;
    if (formData.breathingQuality === 'apneic_no_effort' || formData.breathingQuality === 'agonal_gasping') {
      if (formData.breathingRate !== '0') { updates.breathingRate = '0'; needsUpdate = true; if(formData.breathingRate === 'custom') setBreathingRateCustom(''); }
      if (formData.breathingSaturation !== 'unable') { updates.breathingSaturation = 'unable'; needsUpdate = true; if(formData.breathingSaturation === 'custom') setBreathingSaturationCustom('');}
    }
    if (formData.pulseQuality === 'absent_central') {
      if (formData.bloodPressureSystolic || formData.bloodPressureDiastolic) {
        updates.bloodPressureSystolic = ''; updates.bloodPressureDiastolic = ''; needsUpdate = true;
      }
      if (formData.capillaryRefillTime !== 'unable') { updates.capillaryRefillTime = 'unable'; needsUpdate = true; }
    }
    const gcs = calculateGCS();
    const currentRespRateForRTS = formData.breathingRate === 'custom' ? breathingRateCustom : formData.breathingRate;
    const rts = calculateRTS(gcs, formData.bloodPressureSystolic || '', currentRespRateForRTS);
    if (formData.rtsScore !== rts) { updates.rtsScore = rts; needsUpdate = true; }
    if (needsUpdate) setFormData(prev => ({ ...prev, ...updates }));
  }, [
      formData.breathingQuality, formData.pulseQuality, formData.breathingRate, formData.breathingSaturation, 
      formData.bloodPressureSystolic, formData.bloodPressureDiastolic, formData.capillaryRefillTime,
      formData.glasgowComaScaleEye, formData.glasgowComaScaleVerbal, formData.glasgowComaScaleMotor,
      breathingRateCustom, calculateGCS, calculateRTS
    ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'breathingRate' && value !== 'custom') setBreathingRateCustom('');
    if (name === 'breathingSaturation' && value !== 'custom') setBreathingSaturationCustom('');
    if (name === 'pulseRate' && value !== 'custom') setPulseRateCustom('');
    if (name === 'bodyTemperature' && value !== 'custom') setBodyTemperatureCustom('');
    if (name === 'sceneTypeValue' && value !== 'other') {
      setFormData(prev => ({ ...prev, sceneTypeOther: '' }));
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleNumericChange = (name, valueAsString, valueAsNumber) => {
    setFormData(prev => ({ ...prev, [name]: valueAsString === '' ? '' : valueAsNumber }));
  };

  const handleNestedListChange = (listName, index, field, value) => {
    setFormData(prev => {
      const updatedList = JSON.parse(JSON.stringify(prev[listName] || []));
      if (!updatedList[index]) updatedList[index] = {};
      updatedList[index][field] = value;
      if (field === 'name' && value !== 'custom_entry') updatedList[index].customName = '';
      if (field === 'route' && value !== 'custom_entry') updatedList[index].customRoute = '';
      return { ...prev, [listName]: updatedList };
    });
  };

   const handleNestedListCustomChange = (listName, index, field, value) => {
    setFormData(prev => {
      const updatedList = JSON.parse(JSON.stringify(prev[listName] || []));
      if (!updatedList[index]) updatedList[index] = {};
      updatedList[index][field] = value;
      if (field === 'customName' && value) updatedList[index].name = 'custom_entry';
      if (field === 'customRoute' && value) updatedList[index].route = 'custom_entry';
      if (field === 'customName' && !value && updatedList[index].name === 'custom_entry') updatedList[index].name = '';
      if (field === 'customRoute' && !value && updatedList[index].route === 'custom_entry') updatedList[index].route = '';
      return { ...prev, [listName]: updatedList };
    });
  };

  const addNestedListItem = (listName) => {
    let newItem;
    if (listName === 'medicationsAdministered') {
      newItem = { name: '', customName: '', dosage: '', route: '', customRoute: '', time: '', effectiveness: '' };
    } else if (listName === 'proceduresPerformed') {
      newItem = { name: '', customName: '', time: '', details: '', effectiveness: '' };
    }
    // Гарантуємо, що існуючий список є масивом перед додаванням
    const currentList = Array.isArray(formData[listName]) ? formData[listName] : [];
    if (newItem) {
      setFormData(prev => ({ ...prev, [listName]: [...currentList, newItem] }));
    }
  };

  const removeNestedListItem = (listName, index) => {
    setFormData(prev => ({
      ...prev,
      [listName]: (Array.isArray(prev[listName]) ? prev[listName] : []).filter((_, i) => i !== index),
    }));
  };
  
  const handleLoadTestData = () => {
    const testData = generatePreHospitalTestData();
    const currentCardIdToUse = recordIdToEdit || formData?.cardId || generateClientSideId();

    let newFormData = {
      ...JSON.parse(JSON.stringify(INITIAL_PRE_HOSPITAL_FORM_DATA)),
      ...testData,
      cardId: currentCardIdToUse,
    };
    if (recordIdToEdit) newFormData._id = recordIdToEdit; else delete newFormData._id;
    
    // Ініціалізація кастомних станів
    let tempBRC = ''; if (newFormData.breathingRate && !BREATHING_RATE_OPTIONS.find(o=>o.value===newFormData.breathingRate)) {tempBRC=newFormData.breathingRate; newFormData.breathingRate='custom';} setBreathingRateCustom(tempBRC);
    let tempBSC = ''; if (newFormData.breathingSaturation && !OXYGEN_SATURATION_OPTIONS.find(o=>o.value===newFormData.breathingSaturation)) {tempBSC=newFormData.breathingSaturation; newFormData.breathingSaturation='custom';} setBreathingSaturationCustom(tempBSC);
    let tempPRC = ''; if (newFormData.pulseRate && !PULSE_RATE_OPTIONS.find(o=>o.value===newFormData.pulseRate)) {tempPRC=newFormData.pulseRate; newFormData.pulseRate='custom';} setPulseRateCustom(tempPRC);
    let tempBTC = ''; if (newFormData.bodyTemperature && !BODY_TEMPERATURE_OPTIONS.find(o=>o.value===newFormData.bodyTemperature)) {tempBTC=newFormData.bodyTemperature; newFormData.bodyTemperature='custom';} setBodyTemperatureCustom(tempBTC);
    if (newFormData.sceneTypeValue && !SCENE_TYPE_OPTIONS.find(o=>o.value===newFormData.sceneTypeValue)) {newFormData.sceneTypeOther = newFormData.sceneTypeValue; newFormData.sceneTypeValue = 'other';} else if (newFormData.sceneTypeValue !== 'other') {newFormData.sceneTypeOther = '';}

    newFormData.medicationsAdministered = (newFormData.medicationsAdministered || []).map(med => {
        let fm = {...med};
        if(med.name && !COMMON_PREHOSPITAL_MEDICATIONS.includes(med.name) && med.name!=='custom_entry'){fm.customName=med.name;fm.name='custom_entry';}else{fm.customName=med.customName||'';}
        if(med.route && !MEDICATION_ROUTE_OPTIONS.find(o=>o.value===med.route) && med.route!=='custom_entry'){fm.customRoute=med.route;fm.route='custom_entry';}else{fm.customRoute=med.customRoute||'';}
        return fm;
    });
    newFormData.proceduresPerformed = (newFormData.proceduresPerformed || []).map(proc => {
        let fp = {...proc};
        if(proc.name && !COMMON_PREHOSPITAL_PROCEDURES.includes(proc.name) && proc.name!=='custom_entry'){fp.customName=proc.name;fp.name='custom_entry';}else{fp.customName=proc.customName||'';}
        return fp;
    });
    setFormData(newFormData);
    toast({ title: "Тестові дані завантажено", status: "info", duration: 3000, isClosable: true, position: "top-right" });
  };

  const handleClearForm = () => {
    setFormData(getInitialFormState(recordIdToEdit)); // Передаємо recordIdToEdit для коректного скидання ID
    setBreathingRateCustom(''); setBreathingSaturationCustom(''); setPulseRateCustom(''); setBodyTemperatureCustom('');
    toast({ title: "Форму очищено", status: "info", duration: 2000, isClosable: true, position: "top-right" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Початок відправки

    const gcsValue = calculateGCS();
    let finalFormData = JSON.parse(JSON.stringify(formData));

    // Обробка кастомних значень
    if (finalFormData.breathingRate === 'custom') finalFormData.breathingRate = breathingRateCustom || '';
    if (finalFormData.breathingSaturation === 'custom') finalFormData.breathingSaturation = breathingSaturationCustom || '';
    if (finalFormData.pulseRate === 'custom') finalFormData.pulseRate = pulseRateCustom || '';
    if (finalFormData.bodyTemperature === 'custom') finalFormData.bodyTemperature = bodyTemperatureCustom || '';
    
    if (finalFormData.sceneTypeValue === 'other') {
        finalFormData.sceneTypeValue = finalFormData.sceneTypeOther || 'Інше (не вказано)';
    }
    delete finalFormData.sceneTypeOther; // Видаляємо допоміжне поле

    finalFormData.medicationsAdministered = (finalFormData.medicationsAdministered || [])
      .map(med => ({
        name: med.name === 'custom_entry' ? (med.customName || '') : med.name,
        dosage: med.dosage || '',
        route: med.route === 'custom_entry' ? (med.customRoute || '') : med.route,
        time: med.time || '',
        effectiveness: med.effectiveness || '',
      })).filter(med => med.name && med.name.trim() !== ''); // Фільтруємо, якщо назва порожня

    finalFormData.proceduresPerformed = (finalFormData.proceduresPerformed || [])
      .map(proc => ({
        name: proc.name === 'custom_entry' ? (proc.customName || '') : proc.name,
        time: proc.time || '',
        details: proc.details || '',
        effectiveness: proc.effectiveness || '',
      })).filter(proc => proc.name && proc.name.trim() !== '');
    
    if (finalFormData.medicationsAdministered.length === 0) finalFormData.medicationsAdministered = [];
    if (finalFormData.proceduresPerformed.length === 0) finalFormData.proceduresPerformed = [];

    const dataToSave = { 
        ...finalFormData, 
        cardId: cardDisplayId, // Використовуємо cardDisplayId, який є formData.cardId
        gcsTotal: gcsValue,
        rtsScore: finalFormData.rtsScore || 'Н/Д'
    };

    // Якщо це створення нової картки, _id не має бути в dataToSave
    // recordIdToEdit - це _id існуючого запису
    if (!recordIdToEdit && dataToSave.hasOwnProperty('_id')) {
        delete dataToSave._id;
    }
    
    console.log("Дані для відправки на сервер:", JSON.stringify(dataToSave, null, 2));

    try {
      let response;
      if (recordIdToEdit) { // Якщо є recordIdToEdit, значить ми оновлюємо існуючу картку
        // Переконуємося, що dataToSave._id відповідає recordIdToEdit, якщо воно є
        if (!dataToSave._id && recordIdToEdit) dataToSave._id = recordIdToEdit; 
        response = await updateTraumaRecord(recordIdToEdit, dataToSave); // Передаємо MongoDB _id
        toast({ 
            title: "Картку успішно оновлено!", 
            description: `ID картки: ${response.data?.record?.cardId || cardDisplayId}`,
            status: "success", 
            duration: 4000, 
            isClosable: true,
            position: "top-right"
        });
      } else { // Інакше створюємо нову картку
        // Переконуємося, що cardId є, а _id немає
        if (!dataToSave.cardId) dataToSave.cardId = generateClientSideId(); // На випадок, якщо cardDisplayId був порожній
        delete dataToSave._id;

        response = await createPreHospitalRecord(dataToSave);
        toast({ 
            title: "Картку успішно створено!", 
            description: `ID картки: ${response.data?.record?.cardId || dataToSave.cardId}`,
            status: "success", 
            duration: 4000, 
            isClosable: true,
            position: "top-right"
        });
      }
      
      if (onSave) {
        onSave(response.data.record); // Передаємо збережений/оновлений запис (з _id від сервера)
      }

    } catch (error) {
      console.error("Помилка збереження/оновлення картки:", error.response?.data || error.message || error);
      const errorMsg = error.response?.data?.message || 
                       (error.response?.data?.errors ? error.response.data.errors.join(', ') : null) || 
                       error.message || 
                       "Невідома помилка сервера при збереженні картки.";
      toast({ 
        title: "Помилка збереження картки", 
        description: errorMsg, 
        status: "error", 
        duration: 7000, 
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setIsSubmitting(false); // Завершення відправки
    }
  };
  
  const gcsTotalLocal = calculateGCS();
  const isNotTransported = formData.transportationMethod === 'not_transported';
  
  const showCustomSubInput = (listName, index, fieldType) => {
    if (!formData || !formData[listName] || !formData[listName][index]) return false;
    if (fieldType === 'name') return formData[listName][index].name === 'custom_entry';
    if (fieldType === 'route') return formData[listName][index].route === 'custom_entry';
    return false;
  };

  if (isLoading && recordIdToEdit) { // Показуємо Spinner тільки при завантаженні для редагування
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
        <Text ml={4} fontSize="lg">Завантаження даних картки...</Text>
      </Flex>
    );
  }

  // JSX рендеринг
  return (
     <Box {...mainBoxStyles}>
      <Flex {...headerFlexStyles}>
        <Heading {...headerTitleStyles}>Первинна Картка (Травма)</Heading>
        <Text {...cardIdTextStyles}>#{cardDisplayId}</Text>
        <Spacer />
        <Button colorScheme="gray" variant="outline" onClick={handleClearForm} mr={3} {...secondaryButtonStyles} _hover={{bg: "gray.100", borderColor: "gray.400"}} isDisabled={isSubmitting}>
          Очистити
        </Button>
        <Button colorScheme="yellow" variant="solid" onClick={handleLoadTestData} {...secondaryButtonStyles} _hover={{bg: "yellow.500"}} isDisabled={isSubmitting}>
          Тестові Дані
        </Button>
      </Flex>

      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          
          <Accordion allowMultiple defaultIndex={[0]} borderWidth="0px"> {/* defaultIndex тепер масив */}
            <AccordionItem {...accordionItemStyles}>
              <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>1. Загальна інформація, пацієнт, місце події</Box><AccordionIcon /></AccordionButton></h2>
              <AccordionPanel {...accordionPanelStyles}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={5}>
                  <FormControl isRequired><FormLabel {...formControlLabelStyles}>Дата та час події/виявлення</FormLabel><Input type="datetime-local" name="incidentDateTime" value={formData.incidentDateTime || ''} onChange={handleChange} {...inputStyles}/></FormControl>
                  <FormControl isRequired><FormLabel {...formControlLabelStyles}>Дата та час прибуття на місце</FormLabel><Input type="datetime-local" name="arrivalDateTime" value={formData.arrivalDateTime || ''} onChange={handleChange} {...inputStyles}/></FormControl>
                  <FormControl><FormLabel {...formControlLabelStyles}>Тип місця події</FormLabel><Select placeholder="Оберіть тип" name="sceneTypeValue" value={formData.sceneTypeValue || ''} onChange={handleChange} {...inputStyles}>{SCENE_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>{formData.sceneTypeValue === 'other' && (<Input mt={2} name="sceneTypeOther" value={formData.sceneTypeOther || ''} onChange={handleChange} placeholder="Вкажіть інший тип" {...inputStyles}/>)}</FormControl>
                  <GridItem colSpan={{ base: 1, md: 2, lg: 1 }}><FormControl><FormLabel {...formControlLabelStyles}>ПІБ Пацієнта</FormLabel><Input placeholder="Прізвище Ім'я По-батькові або 'Невідомо(а)'" name="patientFullName" value={formData.patientFullName || ''} onChange={handleChange} {...inputStyles}/></FormControl></GridItem>
                  <FormControl><FormLabel {...formControlLabelStyles}>Стать</FormLabel><Select placeholder="Оберіть стать" name="patientGender" value={formData.patientGender || ''} onChange={handleChange} {...inputStyles}>{GENDER_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></FormControl>
                  <FormControl><FormLabel {...formControlLabelStyles}>Дата народження</FormLabel><Input type="date" name="patientDateOfBirth" value={formData.patientDateOfBirth || ''} onChange={handleChange} isDisabled={isPatientFullNameUnknown} {...inputStyles}/></FormControl>
                  <FormControl><FormLabel {...formControlLabelStyles}>Орієнтовний вік</FormLabel><NumberInput min={0} max={130} name="patientApproximateAge" value={formData.patientApproximateAge || ''} isDisabled={!isPatientFullNameUnknown && !!formData.patientDateOfBirth} onChange={(valStr, valNum) => handleNumericChange('patientApproximateAge', valStr, valNum )} precision={0}><NumberInputField placeholder={isPatientFullNameUnknown ? "Введіть вік" : (formData.patientDateOfBirth ? "Вказано дату" : "Років")} {...inputStyles}/><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput></FormControl>
                  <GridItem colSpan={{base:1, md:2, lg:3}}><FormControl><FormLabel fontWeight="bold" color="red.500" mb="0.5">Контроль катастрофічної кровотечі (C)</FormLabel><Checkbox name="catastrophicHemorrhageControlled" isChecked={!!formData.catastrophicHemorrhageControlled} onChange={handleChange} colorScheme="red" size="lg">Критичну кровотечу виявлено та контрольовано (або відсутня)</Checkbox>{(formData.catastrophicHemorrhageControlled) && (<Textarea mt={2} name="catastrophicHemorrhageDetails" value={formData.catastrophicHemorrhageDetails || ''} onChange={handleChange} placeholder="Деталі: локалізація, метод контролю..." {...inputStyles}/>)}</FormControl></GridItem>
                </Grid>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>2. Оцінка стану (ABCDE)</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <VStack spacing={5} align="stretch">
                        <Box><Heading size="md" color="gray.700" mb={2}>A: Дихальні шляхи</Heading><FormControl><FormLabel {...formControlLabelStyles}>Стан</FormLabel><Select placeholder="Оберіть статус" name="airwayStatus" value={formData.airwayStatus||''} onChange={handleChange} {...inputStyles}>{AIRWAY_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></FormControl></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>B: Дихання</Heading><SimpleGrid columns={{ base: 1, md: 2, lg:3 }} spacing={4}>
                            <FormControl><FormLabel {...formControlLabelStyles}>ЧД (в хв.)</FormLabel><Select name="breathingRate" value={formData.breathingRate||''} onChange={handleChange} {...inputStyles}><option value="">Оберіть</option>{BREATHING_RATE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>{formData.breathingRate === 'custom' && <Input mt={2} type="number" value={breathingRateCustom||''} placeholder="Введіть ЧД" onChange={(e) => setBreathingRateCustom(e.target.value)} {...inputStyles}/>}</FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>SpO2 (%)</FormLabel><Select name="breathingSaturation" value={formData.breathingSaturation||''} onChange={handleChange} {...inputStyles}><option value="">Оберіть</option>{OXYGEN_SATURATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>{formData.breathingSaturation === 'custom' && <Input mt={2} type="number" value={breathingSaturationCustom||''} placeholder="Введіть SpO2" onChange={(e) => setBreathingSaturationCustom(e.target.value)} {...inputStyles}/>}</FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Характер</FormLabel><Select placeholder="Оберіть" name="breathingQuality" value={formData.breathingQuality||''} onChange={handleChange} {...inputStyles}>{BREATHING_QUALITY_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Екскурсія ГК</FormLabel><Select placeholder="Оберіть" name="chestExcursion" value={formData.chestExcursion||''} onChange={handleChange} {...inputStyles}>{CHEST_EXCURSION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Аускультація</FormLabel><Select placeholder="Оберіть" name="auscultationLungs" value={formData.auscultationLungs||''} onChange={handleChange} {...inputStyles}>{AUSCULTATION_LUNGS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                        </SimpleGrid></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>C: Кровообіг</Heading><SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                             <FormControl><FormLabel {...formControlLabelStyles}>Пульс: Локалізація</FormLabel><Select placeholder="Оберіть" name="pulseLocation" value={formData.pulseLocation||''} onChange={handleChange} {...inputStyles}>{PULSE_LOCATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                             <FormControl><FormLabel {...formControlLabelStyles}>Пульс: Частота</FormLabel><Select name="pulseRate" value={formData.pulseRate||''} onChange={handleChange} {...inputStyles}><option value="">Оберіть</option>{PULSE_RATE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>{formData.pulseRate === 'custom' && <Input mt={2} type="number" value={pulseRateCustom||''} placeholder="Введіть ЧСС" onChange={(e) => setPulseRateCustom(e.target.value)} {...inputStyles}/>}</FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Пульс: Якість</FormLabel><Select placeholder="Оберіть" name="pulseQuality" value={formData.pulseQuality||''} onChange={handleChange} {...inputStyles}>{PULSE_QUALITY_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>АТ сист.</FormLabel><NumberInput min={0} name="bloodPressureSystolic" value={formData.bloodPressureSystolic || ''} onChange={(valStr, valNum) => handleNumericChange('bloodPressureSystolic', valStr, valNum)}><NumberInputField placeholder="мм рт.ст." {...inputStyles}/><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>АТ діаст.</FormLabel><NumberInput min={0} name="bloodPressureDiastolic" value={formData.bloodPressureDiastolic || ''} onChange={(valStr, valNum) => handleNumericChange('bloodPressureDiastolic', valStr, valNum)}><NumberInputField placeholder="мм рт.ст." {...inputStyles}/><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Капілярне наповн.</FormLabel><Select placeholder="Оберіть" name="capillaryRefillTime" value={formData.capillaryRefillTime||''} onChange={handleChange} {...inputStyles}>{CAPILLARY_REFILL_TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Шкірні покриви</FormLabel><Select placeholder="Оберіть" name="skinStatus" value={formData.skinStatus||''} onChange={handleChange} {...inputStyles}>{SKIN_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Зовнішня кровотеча</FormLabel><Select placeholder="Оберіть" name="externalBleeding" value={formData.externalBleeding||''} onChange={handleChange} {...inputStyles}>{EXTERNAL_BLEEDING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                        </SimpleGrid></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>D: Неврологічний статус</Heading>
                        <HStack spacing={4} alignItems="baseline" wrap="wrap" mb={3}><Text fontWeight="bold" fontSize="md">ШКГ (GCS):</Text><Text fontSize="lg" fontWeight="bold" color="teal.500">{gcsTotalLocal} / 15</Text></HStack>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl><FormLabel {...formControlLabelStyles}>Очі (E)</FormLabel><Select placeholder="E" name="glasgowComaScaleEye" value={formData.glasgowComaScaleEye||''} onChange={handleChange} {...inputStyles}>{GCS_EYE_OPTIONS.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Мова (V)</FormLabel><Select placeholder="V" name="glasgowComaScaleVerbal" value={formData.glasgowComaScaleVerbal||''} onChange={handleChange} {...inputStyles}>{GCS_VERBAL_OPTIONS.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Рухи (M)</FormLabel><Select placeholder="M" name="glasgowComaScaleMotor" value={formData.glasgowComaScaleMotor||''} onChange={handleChange} {...inputStyles}>{GCS_MOTOR_OPTIONS.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                        </SimpleGrid>
                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                            <FormControl><FormLabel {...formControlLabelStyles}>Зіниці</FormLabel><Select placeholder="Оберіть" name="pupilReaction" value={formData.pupilReaction||''} onChange={handleChange} {...inputStyles}>{PUPIL_REACTION_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Рух./Чутл. статус</FormLabel><Select placeholder="Оберіть" name="motorSensoryStatus" value={formData.motorSensoryStatus||''} onChange={handleChange} {...inputStyles}>{MOTOR_SENSORY_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                            <GridItem colSpan={{base: 1, md: 2}}><FormControl><FormLabel {...formControlLabelStyles}>Додаткові неврол. знахідки</FormLabel><Textarea name="neurologicalStatusDetails" value={formData.neurologicalStatusDetails||''} onChange={handleChange} placeholder="Судоми, парези, паралічі..." {...inputStyles}/></FormControl></GridItem>
                        </SimpleGrid></Box>
                        <Divider borderColor="gray.300"/>
                        <Box><Heading size="md" color="gray.700" mb={2}>E: Огляд / Середовище</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl><FormLabel {...formControlLabelStyles}>t°C тіла</FormLabel><Select name="bodyTemperature" value={formData.bodyTemperature||''} onChange={handleChange} {...inputStyles}><option value="">Оберіть</option>{BODY_TEMPERATURE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select>{formData.bodyTemperature === 'custom' && <Input mt={2} type="number" step="0.1" value={bodyTemperatureCustom||''} placeholder="Введіть t°C" onChange={(e) => setBodyTemperatureCustom(e.target.value)} {...inputStyles}/>}</FormControl>
                            <GridItem colSpan={{base: 1, md: 2}}><FormControl isRequired><FormLabel {...formControlLabelStyles}>Виявлені ушкодження / Огляд</FormLabel><Textarea name="exposureDetails" value={formData.exposureDetails||''} onChange={handleChange} rows={4} placeholder="Детальний опис всіх виявлених травм..." {...inputStyles}/></FormControl></GridItem>
                        </SimpleGrid></Box>
                    </VStack>
                </AccordionPanel>
            </AccordionItem>

            <AccordionItem {...accordionItemStyles}>
                 <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>3. Скарги, Анамнез (SAMPLE), Обставини</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <VStack spacing={4} align="stretch">
                        <FormControl><FormLabel {...formControlLabelStyles}>Скарги пацієнта (S)</FormLabel><Textarea name="complaints" value={formData.complaints||''} onChange={handleChange} placeholder="Основні скарги..." {...inputStyles}/></FormControl>
                         <FormControl><FormLabel {...formControlLabelStyles}>Алергії (A)</FormLabel><Textarea name="allergies" value={formData.allergies||''} onChange={handleChange} placeholder="Відомі алергії..." {...inputStyles}/></FormControl>
                         <FormControl><FormLabel {...formControlLabelStyles}>Медикаменти (M)</FormLabel><Textarea name="medicationsTaken" value={formData.medicationsTaken||''} onChange={handleChange} placeholder="Медикаменти, які пацієнт приймає..." {...inputStyles}/></FormControl>
                        <FormControl><FormLabel {...formControlLabelStyles}>Перенесені захворювання/травми (P)</FormLabel><Textarea name="pastMedicalHistory" value={formData.pastMedicalHistory||''} onChange={handleChange} placeholder="Важливі хронічні захворювання..." {...inputStyles}/></FormControl>
                        <SimpleGrid columns={{base:1, md:2}} spacing={4}>
                            <FormControl><FormLabel {...formControlLabelStyles}>Останній прийом їжі/рідини (L)</FormLabel><Input name="lastOralIntakeMeal" value={formData.lastOralIntakeMeal||''} onChange={handleChange} placeholder="Що саме?" {...inputStyles}/></FormControl>
                            <FormControl><FormLabel {...formControlLabelStyles}>Час останнього прийому</FormLabel><Input type="time" name="lastOralIntakeTime" value={formData.lastOralIntakeTime||''} onChange={handleChange} {...inputStyles}/></FormControl>
                        </SimpleGrid>
                        <FormControl><FormLabel {...formControlLabelStyles}>Події, що передували (E)</FormLabel><Textarea name="eventsLeadingToInjury" value={formData.eventsLeadingToInjury||''} onChange={handleChange} placeholder="Що робив пацієнт..." {...inputStyles}/></FormControl>
                        <FormControl> {/* НЕОБОВ'ЯЗКОВЕ */}
                            <FormLabel {...formControlLabelStyles}>Механізм травми / Обставини події (Детально)</FormLabel>
                            <Textarea name="mechanismOfInjuryDetailed" value={formData.mechanismOfInjuryDetailed||''} onChange={handleChange} rows={3} placeholder="ДТП, падіння, удар..." {...inputStyles}/>
                        </FormControl>
                    </VStack>
                </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>4. Надана допомога</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <Heading size="md" mb={3} color="gray.700">Введені медикаменти</Heading>
                    <VStack spacing={4} align="stretch">
                        {(formData.medicationsAdministered || []).map((med, index) => (
                            <Box key={`med-${index}`} {...nestedListBoxStyles}>
                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "2.5fr 1fr 1.5fr 1fr 1.5fr auto" }} gap={3} alignItems="flex-end">
                                    <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1", xl: "1 / 2" }}><FormLabel {...formControlLabelStyles} fontSize="sm">Назва препарату</FormLabel>
                                        <CustomEntrySelect namePrefix={`med-name-${index}`} value={med.name || ''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'name', e.target.value)} options={COMMON_PREHOSPITAL_MEDICATIONS} customValue={med.customName || ''} onCustomChange={(val) => handleNestedListCustomChange('medicationsAdministered', index, 'customName', val)} placeholder="Оберіть препарат" customPlaceholder="Введіть назву"/>
                                    </FormControl>
                                    <FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Доза</FormLabel><Input size="sm" value={med.dosage||''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'dosage', e.target.value)} placeholder="Напр. 10мг" {...inputStyles}/></FormControl>
                                    <FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Шлях введення</FormLabel>
                                        <CustomEntrySelect namePrefix={`med-route-${index}`} value={med.route || ''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'route', e.target.value)} options={MEDICATION_ROUTE_OPTIONS} customValue={med.customRoute || ''} onCustomChange={(val) => handleNestedListCustomChange('medicationsAdministered', index, 'customRoute', val)} placeholder="Оберіть шлях" customPlaceholder="Введіть шлях"/>
                                    </FormControl>
                                    <FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Час</FormLabel><Input size="sm" type="time" value={med.time||''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'time', e.target.value)} {...inputStyles}/></FormControl>
                                    <FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Ефективність</FormLabel><Select size="sm" placeholder="Оцініть" value={med.effectiveness||''} onChange={(e) => handleNestedListChange('medicationsAdministered', index, 'effectiveness', e.target.value)} {...inputStyles}>{EFFECTIVENESS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl>
                                    <IconButton aria-label="Видалити медикамент" icon={<DeleteIcon />} colorScheme="red" variant="ghost" size="sm" onClick={() => removeNestedListItem('medicationsAdministered', index)} alignSelf="flex-end" mb={showCustomSubInput(med.name, 'medicationsAdministered', index, 'name') || showCustomSubInput(med.route, 'medicationsAdministered', index, 'route') ? 10 : 1} />
                                </Grid>
                            </Box>
                        ))}
                        <Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" variant="outline" onClick={() => addNestedListItem('medicationsAdministered')} borderRadius="lg" alignSelf="flex-start">Додати медикамент</Button>
                    </VStack>
                    <Divider my={6} borderColor="gray.300"/>
                    <Heading size="md" mb={3} color="gray.700">Виконані процедури/маніпуляції</Heading>
                    <VStack spacing={4} align="stretch">
                        {(formData.proceduresPerformed || []).map((proc, index) => (
                            <Box key={`proc-${index}`} {...nestedListBoxStyles}>
                                <Grid templateColumns={{ base: "1fr", md: "2fr 1fr auto" }} gap={3} alignItems="flex-start">
                                    <GridItem colSpan={{base:1, md:1}}><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Назва процедури</FormLabel>
                                        <CustomEntrySelect namePrefix={`proc-name-${index}`} value={proc.name || ''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'name', e.target.value)} options={COMMON_PREHOSPITAL_PROCEDURES} customValue={proc.customName || ''} onCustomChange={(val) => handleNestedListCustomChange('proceduresPerformed', index, 'customName', val)} placeholder="Оберіть процедуру" customPlaceholder="Введіть назву"/>
                                    </FormControl></GridItem>
                                    <FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Час виконання</FormLabel><Input size="sm" type="time" value={proc.time||''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'time', e.target.value)} {...inputStyles}/></FormControl>
                                    <IconButton aria-label="Видалити процедуру" icon={<DeleteIcon />} colorScheme="red" variant="ghost" size="sm" onClick={() => removeNestedListItem('proceduresPerformed', index)} alignSelf="center" mt={showCustomSubInput(proc.name, 'proceduresPerformed', index, 'name') ? 7 : 2}/>
                                    <GridItem colSpan={{ base: 1, md: 3 }}><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Деталі процедури</FormLabel><Textarea size="sm" value={proc.details||''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'details', e.target.value)} placeholder="Опишіть деталі..." {...inputStyles}/></FormControl></GridItem>
                                    <GridItem colSpan={{ base: 1, md: 3 }}><FormControl><FormLabel {...formControlLabelStyles} fontSize="sm">Ефективність</FormLabel><Select size="sm" placeholder="Оцініть" value={proc.effectiveness||''} onChange={(e) => handleNestedListChange('proceduresPerformed', index, 'effectiveness', e.target.value)} {...inputStyles}>{EFFECTIVENESS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FormControl></GridItem>
                                </Grid>
                            </Box>
                        ))}
                        <Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" variant="outline" onClick={() => addNestedListItem('proceduresPerformed')} borderRadius="lg" alignSelf="flex-start">Додати процедуру</Button>
                    </VStack>
                    <Divider my={6} borderColor="gray.300"/>
                    <FormControl><FormLabel {...formControlLabelStyles}>В/В доступ (деталі)</FormLabel><Textarea name="ivAccessDetails" value={formData.ivAccessDetails||''} onChange={handleChange} placeholder="Місце, катетер G, спроби, інфузія..." {...inputStyles}/></FormControl>
                </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>5. Транспортування</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                        <FormControl><FormLabel {...formControlLabelStyles}>Спосіб транспортування</FormLabel><Select placeholder="Оберіть спосіб" name="transportationMethod" value={formData.transportationMethod||''} onChange={handleChange} {...inputStyles}>{TRANSPORTATION_METHOD_OPTIONS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</Select></FormControl>
                        {formData.transportationMethod === 'other' && (<FormControl isRequired={!isNotTransported}><FormLabel {...formControlLabelStyles}>Деталі іншого способу</FormLabel><Textarea name="transportationOtherDetails" value={formData.transportationOtherDetails||''} onChange={handleChange} placeholder="Вкажіть деталі..." isDisabled={isNotTransported} {...inputStyles}/></FormControl>)}
                        <FormControl><FormLabel {...formControlLabelStyles}>Лікувальний заклад (куди транспортується)</FormLabel><Input name="destinationFacility" value={formData.destinationFacility||''} onChange={handleChange} placeholder="Назва закладу та відділення" isDisabled={isNotTransported} {...inputStyles}/></FormControl>
                    </Grid>
                </AccordionPanel>
            </AccordionItem>

            <AccordionItem {...accordionItemStyles}>
                <h2><AccordionButton {...accordionButtonStyles}><Box {...accordionButtonTextStyles}>6. Тріаж та додаткова інформація</Box><AccordionIcon /></AccordionButton></h2>
                <AccordionPanel {...accordionPanelStyles}>
                    <VStack spacing={4} align="stretch">
                        <FormControl><FormLabel {...formControlLabelStyles}>Тріажна категорія</FormLabel><Select placeholder="Оберіть категорію" name="triageCategory" value={formData.triageCategory||''} onChange={handleChange} {...inputStyles}>{TRIAGE_CATEGORIES_OPTIONS.map(cat => <option key={cat.value} value={cat.value} style={{color: cat.value !== 'unknown' ? cat.color : undefined }}>{cat.label}</option>)}</Select></FormControl>
                        <FormControl><FormLabel {...formControlLabelStyles}>Revised Trauma Score (RTS)</FormLabel><Input name="rtsScore" value={formData.rtsScore || 'Н/Д'} isReadOnly placeholder="Розраховується" _placeholder={{ color: 'gray.500' }} bg={formData.rtsScore && formData.rtsScore !== 'Н/Д' ? "gray.200" : "gray.100"} {...inputStyles}/></FormControl>
                        <FormControl><FormLabel {...formControlLabelStyles}>Додаткові примітки / Ускладнення</FormLabel><Textarea name="additionalNotes" value={formData.additionalNotes||''} onChange={handleChange} placeholder="Будь-яка інша важлива інформація..." {...inputStyles}/></FormControl>
                        <FormControl isRequired><FormLabel {...formControlLabelStyles}>Відповідальний мед. працівник (ПІБ, посада)</FormLabel><Input name="medicalTeamResponsible" value={formData.medicalTeamResponsible||''} onChange={handleChange} placeholder="Напр. Лікар ЕМД Іванов І.І." {...inputStyles}/></FormControl>
                    </VStack>
                </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <HStack {...actionButtonsHStackStyles}>
            {onCancel && <Button variant="ghost" colorScheme="gray" onClick={onCancel} size="lg" minW="120px" borderRadius="lg">Скасувати</Button>}
            <Button type="submit" {...primaryButtonStyles}>Зберегти Картку</Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default PreHospitalCareSection;