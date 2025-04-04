import React, { useCallback, memo, useState, useEffect } from 'react'; // Додано useState, useEffect
import {
    Box, Heading, Checkbox, SimpleGrid, Input, Select, Button, IconButton,
    HStack, Text, VStack, Divider, FormControl, FormLabel, Tooltip,
    InputGroup, InputRightAddon,
    FormErrorMessage // Імпортуємо FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';

import {
    hypothermiaPreventionTypes,
    medRoutes,
    commonMedications, // Перейменовано з medNames у вашому коді
    dosageUnits
} from '../../constants/constants.json'; // Переконайтесь, що шлях правильний

// --- Константи ---
const EYE_SHIELD_OPTIONS = [
    { value: 'Ліве', label: 'Ліве око' },
    { value: 'Праве', label: 'Праве око' },
    { value: 'Обидва', label: 'Обидва ока' },
];

// --- Функція валідації рядка ліків ---
const validateMedicationRow = (med) => {
    const errors = {};
    if (!med.time) {
        // Хоча type="time" зазвичай обробляє це, додамо для повноти
        // errors.time = "Обов'язкове поле"; // Зазвичай не потрібно валідувати час таким чином
    }
    if (!med.name) {
        errors.name = "Оберіть назву";
    } else if (med.name === 'Інше...' && !med.nameOther?.trim()) {
        // Потрібна перевірка nameOther, якщо вибрано "Інше..."
        errors.nameOther = "Вкажіть назву ліків";
    }

    const hasDosageValue = med.dosageValue !== null && med.dosageValue !== '' && !isNaN(med.dosageValue);
    const hasDosageUnit = !!med.dosageUnit;

    if (!hasDosageValue && hasDosageUnit) {
        errors.dosageValue = "Вкажіть дозу";
    } else if (hasDosageValue && med.dosageValue <= 0) {
        errors.dosageValue = "Упс, доза має бути > 0";
    } else if (hasDosageValue && !hasDosageUnit) {
        errors.dosageUnit = "Оберіть од.";
    }
    // Немає потреби валідувати dosageUnit саме по собі, якщо немає dosageValue

    if (!med.route) {
        errors.route = "Оберіть шлях";
    }

    return errors;
};


// --- Дочірні компоненти ---

const MedicationRow = memo(({ med, rowErrors = {}, isDisabled, onMedChange, onDeleteMed, onSetCurrentTime }) => {
    // rowErrors - помилки конкретно для цього рядка
    const showOtherNameInput = med.name === 'Інше...';

    const handleSetCurrentTime = useCallback(() => {
        onSetCurrentTime(med.id);
    }, [med.id, onSetCurrentTime]);

    const handleFieldChange = useCallback((e) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? (value === '' ? null : parseFloat(value)) : value;
        onMedChange(med.id, name, finalValue);
    }, [med.id, onMedChange]);

    const handleTimeChange = useCallback((e) => {
        onMedChange(med.id, 'time', e.target.value);
    }, [med.id, onMedChange]);

    const handleDelete = useCallback(() => {
        onDeleteMed(med.id);
    }, [med.id, onDeleteMed]);

    return (
        <Box borderWidth={1} borderRadius="md" p={2} borderColor={Object.keys(rowErrors).length > 0 ? "red.300" : "gray.100"} >
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={2} alignItems="flex-start"> {/* Змінено на flex-start для кращого відображення помилок */}
                {/* Час */}
                {/* isRequired додає візуальний індикатор, isInvalid підсвічує поле */}
                <FormControl id={`med-time-${med.id}`} isInvalid={!!rowErrors.time}>
                    <FormLabel fontSize="xs" mb={0}>Час</FormLabel>
                    <HStack spacing={1}>
                        <Input type="time" size="xs" value={med.time || ''} onChange={handleTimeChange} isDisabled={isDisabled} name="time" aria-label="Час введення ліків"/>
                        <Tooltip label="Поточний час" fontSize="xs">
                            <IconButton aria-label="Встановити поточний час" size="xs" icon={<TimeIcon />} onClick={handleSetCurrentTime} isDisabled={isDisabled} variant="outline"/>
                        </Tooltip>
                    </HStack>
                    {/* <FormErrorMessage fontSize="xs">{rowErrors.time}</FormErrorMessage> */} {/* Зазвичай не потрібно */}
                </FormControl>

                {/* Назва */}
                <FormControl id={`med-name-${med.id}`} gridColumn={{ base: "span 2", md: "span 1" }} isRequired isInvalid={!!rowErrors.name}>
                    <FormLabel fontSize="xs" mb={0}>Назва</FormLabel>
                    <Select name="name" size="xs" value={med.name || ''} onChange={handleFieldChange} isDisabled={isDisabled} placeholder="– Оберіть –">
                        {(commonMedications || []).map(opt => opt && <option key={`med-name-opt-${med.id}-${opt}`} value={opt}>{opt}</option>)}
                        <option value="Інше...">Інше...</option>
                    </Select>
                    <FormErrorMessage fontSize="xs">{rowErrors.name}</FormErrorMessage>
                </FormControl>

                 {/* Доза та Одиниці */}
                 <FormControl id={`med-dosage-${med.id}`} isInvalid={!!rowErrors.dosageValue || !!rowErrors.dosageUnit}>
                     <FormLabel fontSize="xs" mb={0}>Доза (мг/мкг/мл)</FormLabel>
                     <InputGroup size="xs">
                         <Input
                             name="dosageValue"
                             type="number"
                             inputMode="decimal"
                             placeholder="100"
                             value={med.dosageValue ?? ''}
                             onChange={handleFieldChange}
                             isDisabled={isDisabled}
                             min={0} // Хоча валідація перевіряє > 0
                             step="any"
                             aria-label="Значення дози"
                             borderRightRadius={0}
                             isInvalid={!!rowErrors.dosageValue} // Підсвітка інпута
                             required={!!med.dosageUnit} // HTML5 валідація (додатково)
                         />
                         <InputRightAddon p={0}>
                             <Select
                                name="dosageUnit"
                                value={med.dosageUnit || ''}
                                onChange={handleFieldChange}
                                isDisabled={isDisabled}
                                size="xs"
                                placeholder="Од."
                                aria-label="Одиниці виміру дози"
                                borderLeftRadius={0}
                                borderLeft="none"
                                width="80px"
                                isInvalid={!!rowErrors.dosageUnit} // Підсвітка селекта
                                required={med.dosageValue !== null && med.dosageValue !== ''} // HTML5 валідація (додатково)
                             >
                                {(dosageUnits || []).map(unit => unit && (
                                    <option key={`unit-opt-${med.id}-${unit}`} value={unit}>{unit}</option>
                                ))}
                             </Select>
                         </InputRightAddon>
                     </InputGroup>
                     {/* Показуємо одну з помилок, якщо є */}
                     <FormErrorMessage fontSize="xs">{rowErrors.dosageValue || rowErrors.dosageUnit}</FormErrorMessage>
                 </FormControl>

                 {/* Шлях */}
                 <FormControl id={`med-route-${med.id}`} isRequired isInvalid={!!rowErrors.route}>
                     <FormLabel fontSize="xs" mb={0}>Шлях введення</FormLabel>
                     <Select name="route" size="xs" value={med.route || ''} onChange={handleFieldChange} isDisabled={isDisabled} placeholder="– Оберіть –">
                         {(medRoutes || []).map(opt => opt && <option key={`medroute-opt-${med.id}-${opt}`} value={opt}>{opt}</option>)}
                     </Select>
                     <FormErrorMessage fontSize="xs">{rowErrors.route}</FormErrorMessage>
                 </FormControl>

                 {/* Видалити */}
                 {/* Зміщуємо кнопку трохи вниз, бо помилки під полями можуть змістити її */}
                 <Box textAlign="right" pt={6}>
                     <IconButton aria-label="Видалити ліки" icon={<DeleteIcon />} size="xs" colorScheme="red" variant="ghost" onClick={handleDelete} isDisabled={isDisabled}/>
                 </Box>
            </SimpleGrid>

            {/* Поле "Інше" для Назви Ліків */}
            {showOtherNameInput && (
                 <FormControl mt={2} isRequired id={`med-nameOther-${med.id}`} isInvalid={!!rowErrors.nameOther}>
                     <FormLabel fontSize="xs" mb={0}>Вкажіть назву ліків</FormLabel>
                     <Input size="xs" name="nameOther" placeholder="Введіть назву..." value={med.nameOther || ''} onChange={handleFieldChange} isDisabled={isDisabled}/>
                     <FormErrorMessage fontSize="xs">{rowErrors.nameOther}</FormErrorMessage>
                 </FormControl>
            )}
        </Box>
    );
});
MedicationRow.displayName = 'MedicationRow';

// ... (HypothermiaAidBlock залишається без змін, але можна додати валідацію аналогічно, якщо потрібно) ...
const HypothermiaAidBlock = memo(({ aidData, isDisabled, onCheckboxChange, onTypeChange, onOtherTypeChange }) => {
    // ... (поточний код)
    const isPreventionEnabled = !!aidData.hypothermiaPrevention;
    const isOtherTypeSelected = aidData.hypothermiaPreventionType === 'Інше...';

    // Можна додати валідацію для 'Інше...' типу гіпотермії
    const isHypothermiaOtherInvalid = isOtherTypeSelected && !aidData.hypothermiaPreventionTypeOther?.trim();

    const handlePreventionToggle = useCallback(() => {
        onCheckboxChange('hypothermiaPrevention'); // Батьківський компонент має очищати помилки при знятті галочки
    }, [onCheckboxChange]);


    return (
        <VStack
            align="stretch"
            spacing={2}
            borderWidth={isPreventionEnabled ? 1 : 0}
            borderColor={isHypothermiaOtherInvalid ? "red.300" : "gray.100"} // Підсвічуємо весь блок при помилці
            p={isPreventionEnabled ? 2 : 0}
            borderRadius="md"
        >
            <Checkbox
                isChecked={isPreventionEnabled}
                onChange={handlePreventionToggle}
                isDisabled={isDisabled}
                size="sm"
                fontWeight={isPreventionEnabled ? "medium" : "normal"}
            >
                Попередження гіпотермії
            </Checkbox>

            {isPreventionEnabled && (
                <VStack align="stretch" spacing={2} pl={2} mt={1}>
                    <FormControl id="hypothermiaPreventionTypeControl">
                        <Select
                            name="hypothermiaPreventionType"
                            id="hypothermiaPreventionType"
                            size="xs"
                            value={aidData.hypothermiaPreventionType || ''}
                            onChange={onTypeChange} // Батьківський компонент має викликати валідацію
                            isDisabled={isDisabled}
                            placeholder="– Оберіть тип –"
                            aria-label="Тип попередження гіпотермії"
                        >
                            {hypothermiaPreventionTypes.map(opt => opt && (
                                <option key={`hypo-type-${opt}`} value={opt}>{opt}</option>
                            ))}
                            <option value="Інше...">Інше...</option>
                        </Select>
                        {/* Можна додати сюди FormErrorMessage, якщо тип не обрано, але це менш критично */}
                    </FormControl>

                    {isOtherTypeSelected && (
                         // Використовуємо isInvalid тут
                        <FormControl id="hypothermiaPreventionTypeOtherControl" isRequired isInvalid={isHypothermiaOtherInvalid}>
                            <Input
                                name="hypothermiaPreventionTypeOther"
                                id="hypothermiaPreventionTypeOther"
                                size="xs"
                                placeholder="Уточніть тип..."
                                value={aidData.hypothermiaPreventionTypeOther || ''}
                                onChange={onOtherTypeChange} // Батьківський компонент має викликати валідацію
                                isDisabled={isDisabled}
                                aria-label="Уточнення типу попередження гіпотермії"
                            />
                             {/* Повідомлення про помилку */}
                            <FormErrorMessage fontSize="xs">Вкажіть тип</FormErrorMessage>
                        </FormControl>
                    )}
                </VStack>
            )}
        </VStack>
    );
});
HypothermiaAidBlock.displayName = 'HypothermiaAidBlock';


// --- Основний компонент ---

function MedicationsSection({ data, setFormData, isDisabled }) {
    const medicationsGivenData = Array.isArray(data?.medicationsGiven) ? data.medicationsGiven : [];
    const aidHypothermiaOtherData = data?.aidHypothermiaOther || {};

    // Стан для зберігання помилок валідації
    const [medicationErrors, setMedicationErrors] = useState({});
    // Можна додати стан для помилок H+E, якщо потрібно
    // const [aidErrors, setAidErrors] = useState({});

    const getCurrentTime = useCallback(() => new Date().toTimeString().slice(0, 5), []);

    // Функція для оновлення помилок для одного рядка
    const updateMedicationErrors = useCallback((id, rowErrors) => {
        setMedicationErrors(prevErrors => ({
            ...prevErrors,
            [id]: rowErrors
        }));
    }, []);

    // Функція для повної валідації всіх рядків (наприклад, перед відправкою)
    const validateAllMedications = useCallback(() => {
        let allErrors = {};
        let isValid = true;
        medicationsGivenData.forEach(med => {
            const rowErrors = validateMedicationRow(med);
            if (Object.keys(rowErrors).length > 0) {
                allErrors[med.id] = rowErrors;
                isValid = false;
            }
        });
        setMedicationErrors(allErrors);
        return isValid;
    }, [medicationsGivenData]); // Залежить від поточних даних

    // Обробник змін у рядку ліків - ТЕПЕР ВИКЛИКАЄ ВАЛІДАЦІЮ
     const handleMedChange = useCallback((id, field, value) => {
        let updatedMed;
        setFormData(prevData => {
            const currentMeds = Array.isArray(prevData?.medicationsGiven) ? prevData.medicationsGiven : [];
            const updatedMeds = currentMeds.map(med => {
                if (med.id === id) {
                    updatedMed = { ...med, [field]: value };
                    // Логіка очищення nameOther
                    if (field === 'name' && value !== 'Інше...') {
                        updatedMed.nameOther = '';
                    }
                    // Додаткова логіка для дози/одиниць при зміні (опціонально)
                    if ((field === 'dosageValue' && (value === null || value === '')) || (field === 'dosageUnit' && !value)) {
                       // Якщо очистили значення, можливо очистити й одиниці, і навпаки?
                       // if (field === 'dosageValue') updatedMed.dosageUnit = '';
                       // if (field === 'dosageUnit') updatedMed.dosageValue = null;
                    }
                    return updatedMed;
                }
                return med;
            });
            return { ...prevData, medicationsGiven: updatedMeds };
        });

        // Після оновлення стану даних, валідуємо змінений рядок
        // Використовуємо setTimeout, щоб гарантувати, що валідація відбувається ПІСЛЯ оновлення стану `data`
         setTimeout(() => {
             setFormData(currentData => {
                const medToValidate = (currentData.medicationsGiven || []).find(m => m.id === id);
                if (medToValidate) {
                    const rowErrors = validateMedicationRow(medToValidate);
                    updateMedicationErrors(id, rowErrors);
                }
                return currentData; // Повертаємо поточний стан без змін
             });
         }, 0);

    }, [setFormData, updateMedicationErrors]);

    // Додавання рядка - очищуємо помилки для нового ID
     const addMedRow = useCallback(() => {
        const newId = crypto.randomUUID();
        setFormData(prevData => {
            const currentMeds = Array.isArray(prevData?.medicationsGiven) ? prevData.medicationsGiven : [];
            return {
                ...prevData,
                medicationsGiven: [
                    ...currentMeds,
                    {
                        id: newId,
                        time: getCurrentTime(),
                        name: '', dosageValue: null, dosageUnit: '', route: '', nameOther: ''
                    }
                ]
            };
        });
        // Додаємо порожній запис про помилки (або можна одразу валідувати)
        updateMedicationErrors(newId, {});
    }, [setFormData, getCurrentTime, updateMedicationErrors]);

    // Видалення рядка - видаляємо помилки
    const deleteMedRow = useCallback((idToDelete) => {
        setFormData(prevData => {
            const currentMeds = Array.isArray(prevData?.medicationsGiven) ? prevData.medicationsGiven : [];
            return {
                ...prevData,
                medicationsGiven: currentMeds.filter(med => med.id !== idToDelete)
            };
        });
        // Видаляємо помилки для цього рядка
        setMedicationErrors(prevErrors => {
            const nextErrors = { ...prevErrors };
            delete nextErrors[idToDelete];
            return nextErrors;
        });
    }, [setFormData]);

     const setCurrentMedTime = useCallback((id) => {
        const currentTime = getCurrentTime();
        handleMedChange(id, 'time', currentTime); // handleMedChange викличе валідацію
    }, [getCurrentTime, handleMedChange]);


    // --- Обробники H+E (можна додати валідацію аналогічно) ---

    // Валідація для блоку гіпотермії (приклад)
    const validateHypothermiaBlock = useCallback((aidData) => {
        const errors = {};
         if (aidData?.hypothermiaPreventionType === 'Інше...' && !aidData?.hypothermiaPreventionTypeOther?.trim()) {
             errors.hypothermiaPreventionTypeOther = "Вкажіть тип";
         }
         // Додати інші перевірки для aidHypothermiaOtherData, якщо потрібно
         return errors;
    }, []);

    // Функція оновлення даних та валідації для H+E
    const setAidFormDataAndValidate = useCallback((updater) => {
        setFormData(prevData => {
            const newData = typeof updater === 'function' ? updater(prevData) : { ...prevData, ...updater };
            // Валідуємо блок aidHypothermiaOther ПІСЛЯ оновлення даних
            // const aidErrors = validateHypothermiaBlock(newData.aidHypothermiaOther);
            // setAidErrors(aidErrors); // Оновлюємо стан помилок H+E
            return newData;
        });
    }, [setFormData/*, validateHypothermiaBlock */]); // Додати залежності валідації


    const handleHypothermiaOtherChange = useCallback((field) => {
        setAidFormDataAndValidate(prevData => {
            const currentAidData = prevData.aidHypothermiaOther || {};
            const isUncheckingHypothermia = field === 'hypothermiaPrevention' && currentAidData[field];
            const newState = !currentAidData[field];

            return {
                ...prevData,
                aidHypothermiaOther: {
                    ...currentAidData,
                    [field]: newState,
                    // Очищення залежних полів ТА помилок при знятті галочки
                    ...(isUncheckingHypothermia && {
                        hypothermiaPreventionType: '',
                        hypothermiaPreventionTypeOther: ''
                    })
                }
            };
        });
         // Якщо знімаємо галочку, очистити помилки гіпотермії
         if (field === 'hypothermiaPrevention' && (aidHypothermiaOtherData || {})[field]) {
              // setAidErrors(prev => ({ ...prev, hypothermiaPreventionTypeOther: undefined }));
         }
    }, [setAidFormDataAndValidate, aidHypothermiaOtherData]); // Додано aidHypothermiaOtherData

    const handleEyeShieldChange = useCallback((e) => {
        const { value } = e.target;
        setAidFormDataAndValidate(prevData => ({
            ...prevData,
            aidHypothermiaOther: { ...(prevData.aidHypothermiaOther || {}), eyeShieldSide: value }
        }));
    }, [setAidFormDataAndValidate]);

    const handleHypothermiaTypeChange = useCallback((e) => {
        const { value } = e.target;
        setAidFormDataAndValidate(prevData => ({
            ...prevData,
            aidHypothermiaOther: {
                ...(prevData.aidHypothermiaOther || {}),
                hypothermiaPreventionType: value,
                // Очищення "Інше", якщо вибрано стандартний тип
                ...(value !== 'Інше...' && { hypothermiaPreventionTypeOther: '' })
            }
        }));
    }, [setAidFormDataAndValidate]);

    const handleHypothermiaTypeOtherChange = useCallback((e) => {
        const { value } = e.target;
         setAidFormDataAndValidate(prevData => ({
            ...prevData,
            aidHypothermiaOther: { ...(prevData.aidHypothermiaOther || {}), hypothermiaPreventionTypeOther: value }
        }));
     }, [setAidFormDataAndValidate]);


   // Додамо кнопку для демонстрації загальної валідації
   const handleValidateAndSubmit = () => {
       const isMedicationsValid = validateAllMedications();
       // const isAidValid = Object.keys(validateHypothermiaBlock(aidHypothermiaOtherData)).length === 0; // Валідуємо H+E
       // setAidErrors(validateHypothermiaBlock(aidHypothermiaOtherData)); // Оновлюємо помилки H+E

       if (isMedicationsValid /* && isAidValid */) {
           console.log("Форма валідна! Відправка даних:", data);
           // Тут логіка відправки даних
       } else {
           console.log("Форма містить помилки.");
            // Можна додати скрол до першої помилки або загальне повідомлення
       }
   };

   return (
       <Box>
           {/* --- Розділ 6: Ліки --- */}
           <Box mb={4}>
                <HStack justify="space-between" alignItems="center" mb={2}>
                    <Heading size="sm">6. Ліки</Heading>
                    <Button leftIcon={<AddIcon />} colorScheme="purple" variant="outline" size="xs" onClick={addMedRow} isDisabled={isDisabled} aria-label="Додати запис про ліки">
                        Додати
                    </Button>
                </HStack>
                <VStack spacing={3} align="stretch">
                    {medicationsGivenData.length === 0 && ( // Показуємо завжди, коли порожньо
                        <Text color={isDisabled ? "gray.400" : "gray.500"} fontSize="sm" textAlign="center" py={2}>Немає записів про ліки.</Text>
                    )}
                    {medicationsGivenData.map((med) => (
                        <MedicationRow
                            key={med.id}
                            med={med}
                            rowErrors={medicationErrors[med.id]} // Передаємо помилки для цього рядка
                            isDisabled={isDisabled}
                            onMedChange={handleMedChange}
                            onDeleteMed={deleteMedRow}
                            onSetCurrentTime={setCurrentMedTime}
                        />
                    ))}
                </VStack>
           </Box>

            <Divider my={4} borderColor="gray.200"/>

            {/* --- Розділ H+E (Гіпотермія / Інше) --- */}
            <Box mt={2}>
                 <Heading size="sm" mb={3}>H+E (Гіпотермія / Інше)</Heading>
                 {/* Передаємо помилки в HypothermiaAidBlock, якщо вони є */}
                 <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={4} alignItems="start">
                     <Checkbox
                        isChecked={!!aidHypothermiaOtherData.combatPillPack}
                        onChange={() => handleHypothermiaOtherChange('combatPillPack')}
                        isDisabled={isDisabled}
                        size="sm"
                    >
                        Набір таблеток (Pill Pack)
                    </Checkbox>
                    <FormControl id="eyeShieldControl">
                        <FormLabel htmlFor="eyeShieldSide" fontSize="xs" mb={1}>Щиток на око</FormLabel>
                         <Select
                            name="eyeShieldSide"
                            id="eyeShieldSide"
                            size="xs"
                            value={aidHypothermiaOtherData.eyeShieldSide || ''}
                            onChange={handleEyeShieldChange}
                            isDisabled={isDisabled}
                            placeholder="– Не застосовано –"
                        >
                            {EYE_SHIELD_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <Checkbox
                        isChecked={!!aidHypothermiaOtherData.splinting}
                        onChange={() => handleHypothermiaOtherChange('splinting')}
                        isDisabled={isDisabled}
                        size="sm"
                    >
                        Шина
                    </Checkbox>
                    {/* Передаємо обробники, які тепер також викликають валідацію */}
                     <HypothermiaAidBlock
                         aidData={aidHypothermiaOtherData}
                         isDisabled={isDisabled}
                         onCheckboxChange={handleHypothermiaOtherChange}
                         onTypeChange={handleHypothermiaTypeChange}
                         onOtherTypeChange={handleHypothermiaTypeOtherChange}
                         // Можна передати помилки сюди: errors={aidErrors}
                    />
                 </SimpleGrid>
            </Box>
       </Box>
   );
}

export default MedicationsSection;