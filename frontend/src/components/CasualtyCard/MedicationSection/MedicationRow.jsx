// src/components/CasualtyCard/MedicationsSection/MedicationRow.jsx
import React from 'react'; // Важливо: імпортуємо React
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import {
    Box, SimpleGrid, FormControl, FormLabel, Input, Select, Tooltip,
    FormErrorMessage, HStack, IconButton, InputGroup, InputRightAddon, Text // Додано Text
} from '@chakra-ui/react';
import { DeleteIcon, TimeIcon } from '@chakra-ui/icons';

// Імпортуємо стилі
import { medicationRowStyles as styles } from '../styles'; // Перевірте шлях!
import { getCurrentTime } from '../../../utils/helpers'; // Перевірте шлях!

// --- Компонент ---
// Використовуємо React.memo
const MedicationRow = React.memo(({ index, remove, isDisabled, commonMedications, dosageUnits, medRoutes }) => {
    // Отримуємо методи з контексту
    const { control, register, watch, setValue, formState: { errors } } = useFormContext();

    // Генеруємо імена полів
    const baseName = `medicationsGiven.${index}`;
    const timeName = `${baseName}.time`;
    const nameName = `${baseName}.name`;
    const nameOtherName = `${baseName}.nameOther`;
    const dosageValueName = `${baseName}.dosageValue`;
    const dosageUnitName = `${baseName}.dosageUnit`;
    const routeName = `${baseName}.route`;

    // Слідкуємо за полем "Назва"
    // Використовуємо useWatch для кращої оптимізації підписок
    const nameValue = useWatch({ control, name: nameName });
    const showOtherNameInput = nameValue === 'Інше...';

    // Функція для отримання помилки (використовується напряму)
    const getError = (fieldSuffix) => errors?.medicationsGiven?.[index]?.[fieldSuffix];

    // Обробники
    const handleSetCurrentTime = React.useCallback(() => {
        setValue(timeName, getCurrentTime(), { shouldDirty: true });
    }, [setValue, timeName]);

    const handleDelete = React.useCallback(() => {
        remove(index);
    }, [remove, index]);

    const handleNameChange = React.useCallback((e, fieldOnChange) => {
        const newValue = e.target.value;
        fieldOnChange(newValue); // Оновлюємо через Controller
        if (newValue !== 'Інше...') {
            setValue(nameOtherName, '', { shouldDirty: true, shouldValidate: !!getError('nameOther') });
        }
    }, [setValue, nameOtherName, getError]); // Додано getError до залежностей

    // Отримуємо помилки
    const timeError = getError('time');
    const nameError = getError('name');
    const nameOtherError = getError('nameOther');
    const dosageValueError = getError('dosageValue');
    const dosageUnitError = getError('dosageUnit');
    const routeError = getError('route');
    const hasErrors = !!(timeError || nameError || nameOtherError || dosageValueError || dosageUnitError || routeError);

    //// styles
    const containerStyles = {
        ...styles.containerBoxBase,
        borderColor: hasErrors ? "red.500" : "gray.200",
        borderWidth: "1px",
        p: 2,
        mb: 2,
        w: "100%", 
    };

    return (
        <Box {...containerStyles}>
            <SimpleGrid {...styles.grid}>
                {/* Час */}
                <FormControl id={timeName} isInvalid={!!timeError} {...styles.formControl}>
                    <FormLabel {...styles.formLabel}>Час</FormLabel>
                    <HStack>
                        <Input type="time" isDisabled={isDisabled} {...register(timeName)} {...styles.inputSize} aria-label="Час введення ліків"/>
                        <Tooltip label="Поточний час" {...styles.tooltip}>
                            <IconButton aria-label="Встановити поточний час" icon={<TimeIcon />} onClick={handleSetCurrentTime} isDisabled={isDisabled} {...styles.timeButton} size="sm"/>
                        </Tooltip>
                    </HStack>
                    <FormErrorMessage {...styles.errorMessage}>{String(timeError?.message || '')}</FormErrorMessage>
                </FormControl>

                {/* Назва (Controller) */}
                <FormControl id={nameName} gridColumn={{ base: "span 2", md: "span 1" }} isInvalid={!!nameError} {...styles.formControl}>
                    <FormLabel {...styles.formLabel}>Назва</FormLabel>
                    <Controller
                        name={nameName}
                        control={control}
                        render={({ field: { onChange: fieldOnChange, value, ref, ...restField } }) => (
                            <Select
                                {...restField}
                                ref={ref}
                                placeholder="– Оберіть –"
                                value={value || ''}
                                onChange={(e) => handleNameChange(e, fieldOnChange)}
                                isDisabled={isDisabled}
                                {...styles.inputSize}
                            >
                                {(commonMedications || []).map(opt => opt && <option key={`med-name-opt-${index}-${opt}`} value={opt}>{opt}</option>)}
                            </Select>
                        )}
                     />
                    <FormErrorMessage {...styles.errorMessage}>{String(nameError?.message || '')}</FormErrorMessage>
                </FormControl>

                {/* Доза та Одиниці */}
                <FormControl id={dosageValueName} isInvalid={!!dosageValueError || !!dosageUnitError} {...styles.formControl}>
                     <FormLabel {...styles.formLabel}>Доза</FormLabel>
                     <InputGroup {...styles.dosageInputGroup} size="sm">
                         <Input
                             {...register(dosageValueName)}
                             type="text"
                             inputMode="decimal"
                             placeholder="К-сть"
                             isDisabled={isDisabled}
                             aria-label="Значення дози"
                             borderRightRadius={0}
                         />
                         <InputRightAddon {...styles.dosageUnitAddon} p={0}>
                             <Select
                                {...register(dosageUnitName)}
                                isDisabled={isDisabled}
                                placeholder="Од."
                                aria-label="Одиниці виміру дози"
                                {...styles.dosageUnitSelect}
                                borderLeftRadius={0}
                                size="sm"
                             >
                                {(dosageUnits || []).map(unit => unit && (
                                    <option key={`unit-opt-${index}-${unit}`} value={unit}>{unit}</option>
                                ))}
                             </Select>
                         </InputRightAddon>
                     </InputGroup>
                     {(dosageValueError || dosageUnitError) && (
                        <FormErrorMessage {...styles.errorMessage}>
                            {String(dosageValueError?.message || dosageUnitError?.message || 'Некоректна доза')}
                        </FormErrorMessage>
                     )}
                 </FormControl>

                 {/* Шлях */}
                 <FormControl id={routeName} isInvalid={!!routeError} {...styles.formControl}>
                     <FormLabel {...styles.formLabel}>Шлях</FormLabel>
                     <Select placeholder="– Оберіть –" isDisabled={isDisabled} {...register(routeName)} {...styles.inputSize}>
                         {(medRoutes || []).map(opt => opt && <option key={`medroute-opt-${index}-${opt}`} value={opt}>{opt}</option>)}
                     </Select>
                     <FormErrorMessage {...styles.errorMessage}>{String(routeError?.message || '')}</FormErrorMessage>
                 </FormControl>

                 {/* Видалити */}
                 <Box {...styles.deleteButtonContainer} alignSelf="flex-end" pb={errors ? 1 : 0}> {/* Вирівнюємо по низу */}
                     <IconButton aria-label="Видалити ліки" icon={<DeleteIcon />} onClick={handleDelete} isDisabled={isDisabled} {...styles.deleteButton} size="sm"/>
                 </Box>
            </SimpleGrid>

            {/* Поле "Інше" для Назви Ліків */}
            {showOtherNameInput && (
                 <FormControl mt={2} id={nameOtherName} isInvalid={!!nameOtherError} isRequired={showOtherNameInput}>
                     {/* Змінено FormLabel для кращого вигляду */}
                     <FormLabel {...styles.formLabel}>Вкажіть назву ліків <Text as="span" color="red.500" ml={1}>*</Text></FormLabel>
                     <Input placeholder="Введіть назву..." isDisabled={isDisabled} {...register(nameOtherName)} {...styles.inputSize}/>
                     <FormErrorMessage {...styles.errorMessage}>{String(nameOtherError?.message || '')}</FormErrorMessage>
                 </FormControl>
            )}
        </Box>
    );
});

// Додаємо displayName для дебагінгу
MedicationRow.displayName = 'MedicationRow';

// Переконуємось в правильному експорті
export default MedicationRow;