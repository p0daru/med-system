// src/components/CasualtyCard/ProvidedAidSection.jsx
import React, { useCallback } from 'react';
// Додаємо watch до імпортів з react-hook-form
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import {
    Box, Heading, Checkbox, SimpleGrid, Button, HStack, Text, VStack, Divider
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import FluidRow from './FluidRow';
import { getCurrentTime } from '../../../utils/helpers';
import { providedAidStyles as styles } from '../styles';

function ProvidedAidSection({ isDisabled, constants }) {
    // Отримуємо control, register, ТА watch з контексту
    const { control, register, watch, formState: { errors } } = useFormContext();

    // --- Відстежуємо значення для чекбоксів ---
    // Використовуємо watch, щоб компонент реагував на зміни цих значень
    const aidCirculationValues = watch('aidCirculation');
    const aidAirwayValues = watch('aidAirway');
    const aidBreathingValues = watch('aidBreathing');
    // Альтернатива (менш ефективно, якщо багато полів):
    // const tourniquetJunctionalChecked = watch('aidCirculation.tourniquetJunctional');
    // const tourniquetTruncalChecked = watch('aidCirculation.tourniquetTruncal');
    // і т.д.

    const { fields, append, remove } = useFieldArray({
        control,
        name: "fluidsGiven"
    });

    const addFluidRow = useCallback(() => {
        const newRow = {
            time: getCurrentTime(),
            name: '', amount: '', route: '', nameOther: ''
        };
        append(newRow, { shouldFocus: false });
    }, [append]);

    return (
        <Box>
            {/* --- C - Circulation --- */}
            <Box {...styles.marchGroupContainer}>
                <Heading {...styles.marchHeading} color="red.600">C - Circulation (Масивна кровотеча)</Heading>
                <SimpleGrid {...styles.marchGrid}>
                    {/* Додаємо isChecked={!!watchedValue} */}
                    {/* !! перетворює значення на boolean (true/false), ?. - безпечний доступ */}
                    <Checkbox
                        isDisabled={isDisabled}
                        // Явно контролюємо стан чекбоксу
                        isChecked={!!aidCirculationValues?.tourniquetJunctional}
                        // register все ще потрібен для RHF механіки (onChange, name etc.)
                        {...register('aidCirculation.tourniquetJunctional')}
                        {...styles.marchCheckbox}
                    >
                        Вузловий турнікет
                    </Checkbox>
                    <Checkbox
                        isDisabled={isDisabled}
                        isChecked={!!aidCirculationValues?.tourniquetTruncal}
                        {...register('aidCirculation.tourniquetTruncal')}
                        {...styles.marchCheckbox}
                    >
                        Турнікет на тулуб
                    </Checkbox>
                    <Checkbox
                        isDisabled={isDisabled}
                        isChecked={!!aidCirculationValues?.dressingHemostatic}
                        {...register('aidCirculation.dressingHemostatic')}
                        {...styles.marchCheckbox}
                    >
                        Гемостат. пов'язка
                    </Checkbox>
                    <Checkbox
                        isDisabled={isDisabled}
                        isChecked={!!aidCirculationValues?.dressingPressure}
                        {...register('aidCirculation.dressingPressure')}
                        {...styles.marchCheckbox}
                    >
                        Тиснуча пов'язка
                    </Checkbox>
                    <Checkbox
                        isDisabled={isDisabled}
                        isChecked={!!aidCirculationValues?.dressingOther}
                        {...register('aidCirculation.dressingOther')}
                        {...styles.marchCheckbox}
                    >
                        Інша пов'язка
                    </Checkbox>
                </SimpleGrid>
            </Box>
            <Divider {...styles.divider}/>

            {/* --- A - Airway --- */}
            <Box {...styles.marchGroupContainer}>
                <Heading {...styles.marchHeading} color="orange.500">A - Airway (Дихальні шляхи)</Heading>
                <SimpleGrid {...styles.marchGrid}>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidAirwayValues?.npa} {...register('aidAirway.npa')} {...styles.marchCheckbox}>Назофаринг. повітровід</Checkbox>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidAirwayValues?.supraglottic} {...register('aidAirway.supraglottic')} {...styles.marchCheckbox}>Надгорт. повітровід</Checkbox>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidAirwayValues?.etTube} {...register('aidAirway.etTube')} {...styles.marchCheckbox}>Ендотрах. трубка</Checkbox>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidAirwayValues?.cric} {...register('aidAirway.cric')} {...styles.marchCheckbox}>Крікотиреотомія</Checkbox>
                </SimpleGrid>
            </Box>
            <Divider {...styles.divider}/>

            {/* --- B - Breathing --- */}
            <Box {...styles.marchGroupContainer}>
                <Heading {...styles.marchHeading} color="blue.500">B - Breathing (Дихання)</Heading>
                <SimpleGrid {...styles.marchGrid}>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidBreathingValues?.o2} {...register('aidBreathing.o2')} {...styles.marchCheckbox}>Кисень (O2)</Checkbox>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidBreathingValues?.needleDecompression} {...register('aidBreathing.needleDecompression')} {...styles.marchCheckbox}>Голкова декомпресія</Checkbox>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidBreathingValues?.chestTube} {...register('aidBreathing.chestTube')} {...styles.marchCheckbox}>Дренаж плевральний</Checkbox>
                    <Checkbox isDisabled={isDisabled} isChecked={!!aidBreathingValues?.occlusiveDressing} {...register('aidBreathing.occlusiveDressing')} {...styles.marchCheckbox}>Оклюз. наліпка</Checkbox>
                </SimpleGrid>
            </Box>
            <Divider {...styles.divider}/>

            {/* --- C - Fluids --- */}
            {/* Код для рідин залишається без змін, useFieldArray має працювати */}
            <Box>
                <HStack {...styles.fluidsHeaderHStack}>
                    <Heading {...styles.fluidsHeading}>C - Інфузійна терапія / Продукти крові</Heading>
                </HStack>
                <Button leftIcon={<AddIcon />} onClick={addFluidRow} isDisabled={isDisabled} {...styles.addFluidButton}>
                    Додати Рідину/Кров
                </Button>
                <VStack {...styles.fluidsListVStack}>
                    {fields.length === 0 && !isDisabled && (
                        <Text {...styles.noFluidsText}>Немає записів. Натисніть "+ Додати Рідину/Кров", щоб додати.</Text>
                    )}
                    {fields.map((field, index) => (
                        <FluidRow
                            key={field.id}
                            index={index}
                            remove={() => remove(index)}
                            isDisabled={isDisabled}
                            COMMON_FLUIDS={constants?.commonFluids || []}
                            FLUID_ROUTES={constants?.fluidRoutes || []}
                        />
                    ))}
                     {errors.fluidsGiven?.root?.message && (
                        <Text color="red.500" mt={2} fontSize="sm">
                            {errors.fluidsGiven.root.message}
                        </Text>
                     )}
                </VStack>
            </Box>
        </Box>
    );
}

export default ProvidedAidSection;