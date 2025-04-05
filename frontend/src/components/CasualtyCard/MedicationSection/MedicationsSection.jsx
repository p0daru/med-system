// src/components/CasualtyCard/MedicationsSection/MedicationsSection.jsx

import React, { useCallback } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import {
    Box, Heading, Checkbox, SimpleGrid, Select, Button,
    HStack, Text, VStack, Divider, FormControl, FormLabel, Textarea, FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

// Імпорти дочірніх компонентів
import MedicationRow from './MedicationRow';
import HypothermiaAidBlock from './HypothermiaAidBlock';
import { medicSecStyles as styles } from '../styles';
import { getCurrentTime } from '../../../utils/helpers';

// --- ПРАВИЛЬНИЙ ІМПОРТ КОНСТАНТ ---
import constants from '../../../constants/constants.json'; // Default import! Перевірте шлях!

// Опції для щитка, специфічні для цього компонента
const EYE_SHIELD_OPTIONS = [
    { value: 'Ліве', label: 'Ліве око' },
    { value: 'Праве', label: 'Праве око' },
    { value: 'Обидва', label: 'Обидва ока' },
];

// --- Основний компонент
function MedicationsSection({ isDisabled }) {
    // --- Отримуємо методи з батьківського контексту ---
    const { control, register, watch, formState: { errors } } = useFormContext();

    // --- Field Array для ліків ---
    const { fields, append, remove } = useFieldArray({
        control,
        name: "medicationsGiven"
    });

    // --- Відстежуємо значення для UI ---
    const aidHypothermiaOtherValues = watch('aidHypothermiaOther');

    // --- Обробник додавання ліків ---
    const addMedRow = useCallback(() => {
        const newRow = {
            time: getCurrentTime(),
            name: '',
            dosageValue: '',
            dosageUnit: '',
            route: '',
            nameOther: ''
        };
        append(newRow, { shouldFocus: false });
    }, [append]);

    return (
        <Box>
            {/* --- Розділ Ліки --- */}
            <Box mb={4}>
                <HStack {...styles.headerHStack}>
                    <Button leftIcon={<AddIcon />} onClick={addMedRow} isDisabled={isDisabled} {...styles.addMedButton} aria-label="Додати запис про ліки">
                        Додати Ліки
                    </Button>
                </HStack>
                <VStack {...styles.medListVStack}>
                    {fields.length === 0 && !isDisabled && (
                        <Text {...styles.noMedsText}>Немає записів. Натисність "+ Додати Ліки", щоб додати.</Text>
                    )}
                    {fields.map((field, index) => (
                        <MedicationRow
                            key={field.id}
                            index={index}
                            remove={remove}
                            isDisabled={isDisabled}
                            // --- Передаємо константи з імпортованого об'єкта ---
                            commonMedications={constants.commonMedications || []}
                            dosageUnits={constants.dosageUnits || []}
                            medRoutes={constants.medRoutes || []} // <- Звертаємось через constants.
                        />
                    ))}
                    {/* Безпечне відображення помилки масиву */}
                    {errors.medicationsGiven?.root?.message && (
                         <Text color="red.500" mt={2} fontSize="sm">
                            {typeof errors.medicationsGiven.root.message === 'string'
                                ? errors.medicationsGiven.root.message
                                : 'Помилка валідації списку ліків'}
                        </Text>
                    )}
                </VStack>
            </Box>

            <Divider {...styles.divider}/>

            {/* --- Розділ H+E --- */}
            <Box mt={2}>
                <Heading {...styles.hAndESectionHeading}>Інші заходи (H+E)</Heading>
                <SimpleGrid {...styles.hAndEGrid}>
                    {/* Checkbox: Pill Pack */}
                    <Checkbox
                        isDisabled={isDisabled}
                        isChecked={!!aidHypothermiaOtherValues?.combatPillPack}
                        {...register('aidHypothermiaOther.combatPillPack')}
                        {...styles.hAndECheckbox}
                    >
                        Набір таблеток (Pill Pack)
                    </Checkbox>

                    {/* Select: Eye Shield */}
                    <FormControl id="eyeShieldControl">
                        <FormLabel htmlFor="aidHypothermiaOther.eyeShieldSide" {...styles.hAndEEyeLabel}>Щиток на око</FormLabel>
                        <Select
                            id="aidHypothermiaOther.eyeShieldSide"
                            placeholder="– Не застосовано –"
                            isDisabled={isDisabled}
                            value={aidHypothermiaOtherValues?.eyeShieldSide || ''}
                            {...register('aidHypothermiaOther.eyeShieldSide')}
                            {...styles.hAndEEyeSelect}
                        >
                            {EYE_SHIELD_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Checkbox: Splinting */}
                    <Checkbox
                        isDisabled={isDisabled}
                        isChecked={!!aidHypothermiaOtherValues?.splinting}
                        {...register('aidHypothermiaOther.splinting')}
                        {...styles.hAndECheckbox}
                    >
                        Шина
                    </Checkbox>

                    {/* Hypothermia Block */}
                    <HypothermiaAidBlock
                        isDisabled={isDisabled}
                        // --- Передаємо константи з імпортованого об'єкта ---
                        hypothermiaPreventionTypes={constants.hypothermiaPreventionTypes || []} // <- Звертаємось через constants.
                    />
                </SimpleGrid>
            </Box>

            <Divider {...styles.divider}/>

            {/* --- Нотатки --- */}
            <Box>
                <FormControl id="notesControl" isInvalid={!!errors.notes} {...styles.notesControl}>
                    <FormLabel htmlFor="notes" {...styles.notesLabel}> Нотатки</FormLabel>
                    <Textarea
                        id="notes"
                        placeholder="Додаткова інформація..."
                        isDisabled={isDisabled}
                        {...register('notes')}
                        {...styles.notesTextarea}
                    />
                     {/* Додано безпечне відображення помилки */}
                     <FormErrorMessage>{String(errors.notes?.message || '')}</FormErrorMessage>
                </FormControl>
            </Box>
        </Box>
    );
}

export default MedicationsSection;