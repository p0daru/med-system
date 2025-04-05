// src/components/CasualtyCard/FluidRow.jsx
import React, { memo, useCallback } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import {
    Box, SimpleGrid, FormControl, FormLabel, Input, Select, Tooltip, FormErrorMessage, HStack, IconButton, Text
} from '@chakra-ui/react';
import { DeleteIcon, TimeIcon } from '@chakra-ui/icons';

// Імпортуємо потрібні хелпери та стилі
import { handleNumericInputChange } from '../../../utils/helpers'; // Перевірте шлях!
import { fluidRowStyles as styles } from '../styles';

const FluidRow = memo(({ index, fieldId, remove, isDisabled, COMMON_FLUIDS, FLUID_ROUTES }) => {
    // Отримуємо доступ до форми
    const { control, setValue, watch, formState: { errors } } = useFormContext();

    // Функція для отримання помилки поля
    const getFieldError = useCallback((fieldName) => {
        return errors?.fluidsGiven?.[index]?.[fieldName];
    }, [errors, index]);

    // Функція для встановлення поточного часу
    const handleTimeClick = useCallback(() => {
        const currentTime = new Date().toTimeString().slice(0, 5);
        setValue(`fluidsGiven.${index}.time`, currentTime, { shouldValidate: true, shouldDirty: true });
    }, [index, setValue]);

    // Функція для видалення рядка
    const handleDeleteClick = useCallback(() => {
        remove(index);
    }, [index, remove]);

    // Слідкуємо за полем 'name', щоб показувати/ховати 'nameOther'
    const nameFieldValue = watch(`fluidsGiven.${index}.name`);
    const showOtherNameInput = nameFieldValue === 'Інше...';

    // Обробник зміни назви, щоб очищати 'nameOther', якщо вибрано не "Інше..."
    const handleNameChange = (e, fieldOnChange) => {
        const newValue = e.target.value;
        fieldOnChange(newValue); // Оновлюємо поле 'name'
        if (newValue !== 'Інше...') {
            // Очищуємо 'nameOther' і тригеримо валідацію (якщо потрібно)
            setValue(`fluidsGiven.${index}.nameOther`, '', { shouldValidate: true });
        }
    };

    // Створюємо контролери для полів
    const { field: timeField } = useController({ name: `fluidsGiven.${index}.time`, control });
    const { field: nameField } = useController({ name: `fluidsGiven.${index}.name`, control });
    const { field: nameOtherField } = useController({ name: `fluidsGiven.${index}.nameOther`, control });
    const { field: volumeField } = useController({ name: `fluidsGiven.${index}.volume`, control });
    const { field: routeField } = useController({ name: `fluidsGiven.${index}.route`, control });

    // Визначаємо, чи є помилки в цьому рядку для стилізації рамки
    const hasErrors = !!(getFieldError('time') || getFieldError('name') || getFieldError('nameOther') || getFieldError('volume') || getFieldError('route'));
    const containerStyles = {
        ...styles.containerBox,
        borderColor: hasErrors ? "red.300" : "gray.100",
    };

    return (
        <Box {...containerStyles}>
            {/* Використовуємо fieldId для генерації унікальних ID */}
            <SimpleGrid {...styles.grid}>
                {/* Час */}
                <FormControl id={`fluid-time-${fieldId}`} isInvalid={!!getFieldError('time')}>
                    <FormLabel {...styles.formLabel}>Час</FormLabel>
                    <HStack {...styles.timeHStack}>
                        <Input type="time" isDisabled={isDisabled} {...timeField} {...styles.inputSize} />
                        <Tooltip label="Поточний час" {...styles.tooltip}>
                            <IconButton aria-label="Встановити поточний час" icon={<TimeIcon />} onClick={handleTimeClick} isDisabled={isDisabled} {...styles.timeButton}/>
                        </Tooltip>
                    </HStack>
                    <FormErrorMessage {...styles.errorMessage}>{getFieldError('time')?.message}</FormErrorMessage>
                </FormControl>

                {/* Назва */}
                {/* Змінюємо gridColumn залежно від showOtherNameInput для адаптивності */}
                <FormControl id={`fluid-name-${fieldId}`} isInvalid={!!getFieldError('name')} gridColumn={{ base: "span 2", md: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Назва</FormLabel>
                    <Select placeholder="– Оберіть –" isDisabled={isDisabled} {...nameField} {...styles.inputSize}
                        // Використовуємо кастомний onChange
                        onChange={(e) => handleNameChange(e, nameField.onChange)} >
                        {(COMMON_FLUIDS || []).map(opt => opt && <option key={`fluid-${fieldId}-${opt}`} value={opt}>{opt}</option>)}
                    </Select>
                     <FormErrorMessage {...styles.errorMessage}>{getFieldError('name')?.message}</FormErrorMessage>
                </FormControl>

                {/* Об'єм */}
                <FormControl id={`fluid-volume-${fieldId}`} isInvalid={!!getFieldError('volume')} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Об'єм (мл)</FormLabel>
                    <Input type="text" inputMode="numeric" placeholder="500" isDisabled={isDisabled}
                        {...volumeField} onChange={(e) => handleNumericInputChange(e, volumeField.onChange)} value={volumeField.value ?? ''} {...styles.inputSize}/>
                     <FormErrorMessage {...styles.errorMessage}>{getFieldError('volume')?.message}</FormErrorMessage>
                </FormControl>

                {/* Шлях */}
                <FormControl id={`fluid-route-${fieldId}`} isInvalid={!!getFieldError('route')} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Шлях</FormLabel>
                    <Select placeholder="–" isDisabled={isDisabled} {...routeField} {...styles.inputSize}>
                        {(FLUID_ROUTES || []).map(opt => opt && <option key={`route-${fieldId}-${opt}`} value={opt}>{opt}</option>)}
                    </Select>
                     <FormErrorMessage {...styles.errorMessage}>{getFieldError('route')?.message}</FormErrorMessage>
                </FormControl>

                 {/* Видалити */}
                 <Box {...styles.deleteButtonContainer}>
                    <IconButton aria-label="Видалити рідину" icon={<DeleteIcon />} onClick={handleDeleteClick} isDisabled={isDisabled} {...styles.deleteButton} />
                 </Box>
            </SimpleGrid>

            {/* --- Поле "Інше" для Назви (з'являється умовно) --- */}
            {showOtherNameInput && (
                 <FormControl id={`fluid-nameOther-${fieldId}`} isInvalid={!!getFieldError('nameOther')} {...styles.otherNameControl}>
                     <FormLabel {...styles.formLabel}>
                         Вкажіть назву
                         <Text as="span" {...styles.requiredIndicator}>*</Text>
                     </FormLabel>
                     <Input
                         placeholder="Введіть назву рідини/крові..."
                         isDisabled={isDisabled}
                         {...nameOtherField}
                         {...styles.inputSize}
                     />
                      <FormErrorMessage {...styles.errorMessage}>{getFieldError('nameOther')?.message}</FormErrorMessage>
                 </FormControl>
             )}
        </Box>
    );
});

FluidRow.displayName = 'FluidRow';
export default FluidRow;