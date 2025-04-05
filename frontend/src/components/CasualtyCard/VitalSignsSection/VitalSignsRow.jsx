// src/components/CasualtyCard/VitalSignsRow.jsx
import React, { memo, useCallback } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import {
    Box, SimpleGrid, FormControl, FormLabel, Input, Select, Tooltip, FormErrorMessage, HStack, IconButton
} from '@chakra-ui/react';
import { DeleteIcon, TimeIcon } from '@chakra-ui/icons';

import { handleNumericInputChange, handleBpInputChange } from '../../../utils/helpers';
// Імпортуємо стилі
import { vitalRowStyles as styles} from '../styles';

// Константи (можна також винести в helpers.js або constants.js)
const AVPU_OPTIONS = ['', 'A (притомний)', 'V (реакція на голос)', 'P (реакція на біль)', 'U (не реагує)'];
const PAIN_OPTIONS = ['', ...Array.from({ length: 11 }, (_, i) => i.toString())];

const VitalSignsRow = memo(({ index, fieldId, remove, isDisabled }) => {
    const { control, setValue, formState: { errors } } = useFormContext();

    const getFieldError = useCallback((fieldName) => {
        return errors?.vitalSigns?.[index]?.[fieldName];
    }, [errors, index]);

    const handleTimeClick = useCallback(() => {
        const currentTime = new Date().toTimeString().slice(0, 5);
        setValue(`vitalSigns.${index}.time`, currentTime, { shouldDirty: true });
    }, [index, setValue]);

    const handleDeleteClick = useCallback(() => {
        remove(index);
    }, [index, remove]);

    const { field: timeField } = useController({ name: `vitalSigns.${index}.time`, control });
    const { field: pulseField } = useController({ name: `vitalSigns.${index}.pulse`, control });
    const { field: bpField } = useController({ name: `vitalSigns.${index}.bp`, control });
    const { field: rrField } = useController({ name: `vitalSigns.${index}.rr`, control });
    const { field: spo2Field } = useController({ name: `vitalSigns.${index}.spO2`, control });
    const { field: avpuField } = useController({ name: `vitalSigns.${index}.avpu`, control });
    const { field: painField } = useController({ name: `vitalSigns.${index}.pain`, control });

    const hasErrors = !!(getFieldError('pulse') || getFieldError('bp') || getFieldError('rr') || getFieldError('spO2'));

    // Визначаємо стилі контейнера залежно від помилок
    const containerStyles = {
        ...styles.containerBoxBase,
        borderColor: hasErrors ? "red.300" : "gray.100",
    };

    // Визначаємо відступ для кнопки видалення
    const deleteButtonContainerStyles = {
        ...styles.deleteButtonContainer,
        pb: hasErrors ? '24px' : '0', // Динамічний відступ знизу
        // Адаптивні колонки залишаємо тут для ясності структури
        gridColumn: { base: "span 2", sm:"span 1", md:"span 1" },
    };

    return (
        <Box {...containerStyles}>
            {/* Адаптивні колонки грід залишаємо тут */}
            <SimpleGrid columns={{ base: 2, sm: 4, md: 8 }} {...styles.grid}>
                 {/* Час */}
                 <FormControl id={`time-${fieldId}`} gridColumn={{ base: "span 2", sm: "span 1", md: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Час</FormLabel>
                    <HStack {...styles.timeHStack}>
                        <Input type="time" isDisabled={isDisabled} {...timeField} {...styles.inputSize} {...styles.timeInput} />
                        <Tooltip label="Поточний час" {...styles.tooltip}>
                            <IconButton aria-label="Встановити поточний час" icon={<TimeIcon />} onClick={handleTimeClick} isDisabled={isDisabled} {...styles.timeButton} />
                         </Tooltip>
                    </HStack>
                 </FormControl>

                {/* Пульс */}
                 <FormControl id={`pulse-${fieldId}`} isInvalid={!!getFieldError('pulse')} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Пульс</FormLabel>
                    <Input type="text" inputMode="numeric" placeholder="уд/хв" isDisabled={isDisabled}
                        {...pulseField} onChange={(e) => handleNumericInputChange(e, pulseField.onChange)} value={pulseField.value ?? ''} {...styles.inputSize} />
                    <FormErrorMessage {...styles.errorMessage}>{getFieldError('pulse')?.message}</FormErrorMessage>
                 </FormControl>

                {/* АТ */}
                 <FormControl id={`bp-${fieldId}`} isInvalid={!!getFieldError('bp')} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Арт.Тиск</FormLabel>
                    <Input type="text" inputMode="numeric" placeholder="120/80" isDisabled={isDisabled}
                        {...bpField} onChange={(e) => handleBpInputChange(e, bpField.onChange)} value={bpField.value ?? ''} {...styles.inputSize} />
                     <FormErrorMessage {...styles.errorMessage}>{getFieldError('bp')?.message}</FormErrorMessage>
                 </FormControl>

                 {/* ЧД */}
                 <FormControl id={`rr-${fieldId}`} isInvalid={!!getFieldError('rr')} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Частота дихання</FormLabel>
                    <Input type="text" inputMode="numeric" placeholder="дих/хв" isDisabled={isDisabled}
                        {...rrField} onChange={(e) => handleNumericInputChange(e, rrField.onChange)} value={rrField.value ?? ''} {...styles.inputSize} />
                    <FormErrorMessage {...styles.errorMessage}>{getFieldError('rr')?.message}</FormErrorMessage>
                 </FormControl>

                 {/* SpO2 */}
                 <FormControl id={`spO2-${fieldId}`} isInvalid={!!getFieldError('spO2')} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Сатурація O2%</FormLabel>
                    <Input type="text" inputMode="numeric" placeholder="%" isDisabled={isDisabled}
                        {...spo2Field} onChange={(e) => handleNumericInputChange(e, spo2Field.onChange)} value={spo2Field.value ?? ''} {...styles.inputSize} />
                     <FormErrorMessage {...styles.errorMessage}>{getFieldError('spO2')?.message}</FormErrorMessage>
                 </FormControl>

                 {/* AVPU */}
                 <FormControl id={`avpu-${fieldId}`} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>AVPU</FormLabel>
                    <Select isDisabled={isDisabled} {...avpuField} value={avpuField.value ?? ''} {...styles.inputSize} {...styles.select}>
                        {AVPU_OPTIONS.map(opt => <option key={`avpu-${opt}`} value={opt}>{opt || '–'}</option>)}
                    </Select>
                 </FormControl>

                 {/* Біль */}
                 <FormControl id={`pain-${fieldId}`} gridColumn={{ base: "span 1" }}>
                    <FormLabel {...styles.formLabel}>Біль (0-10)</FormLabel>
                    <Select isDisabled={isDisabled} {...painField} value={painField.value ?? ''} {...styles.inputSize} {...styles.select}>
                        {PAIN_OPTIONS.map(opt => <option key={`pain-${opt}`} value={opt}>{opt === '' ? '–' : opt}</option>)}
                    </Select>
                 </FormControl>

                 {/* Видалити */}
                 <Box {...deleteButtonContainerStyles}>
                    <IconButton aria-label="Видалити запис показників" icon={<DeleteIcon />} onClick={handleDeleteClick} isDisabled={isDisabled} {...styles.deleteButton}/>
                 </Box>
            </SimpleGrid>
        </Box>
    );
});

VitalSignsRow.displayName = 'VitalSignsRow';
export default VitalSignsRow;