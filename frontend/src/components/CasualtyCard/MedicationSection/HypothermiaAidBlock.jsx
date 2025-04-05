// src/components/CasualtyCard/HypothermiaAidBlock.jsx
import React, { memo, useCallback } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
    Box, Checkbox, VStack, FormControl, FormLabel, Select, Input, Text, FormErrorMessage
} from '@chakra-ui/react';

// Імпортуємо стилі та константи
import { hypothermiaStyles as styles } from '../styles'; // Стилі для цього блоку
// Константи типів передаються через пропси

const HypothermiaAidBlock = memo(({ isDisabled, hypothermiaPreventionTypes }) => {
    // Отримуємо методи з контексту
    const { control, watch, setValue, register, formState: { errors } } = useFormContext();

    // Імена полів для зручності
    const preventionFieldName = 'aidHypothermiaOther.hypothermiaPrevention';
    const typeFieldName = 'aidHypothermiaOther.hypothermiaPreventionType';
    const typeOtherFieldName = 'aidHypothermiaOther.hypothermiaPreventionTypeOther';

    // Слідкуємо за станом чекбокса та типу
    const isPreventionEnabled = watch(preventionFieldName);
    const typeValue = watch(typeFieldName);
    const isOtherTypeSelected = typeValue === 'Інше...';

    // Отримуємо помилки
    const typeOtherError = errors?.aidHypothermiaOther?.hypothermiaPreventionTypeOther;

    // Обробник основного чекбоксу
    const handlePreventionToggle = useCallback((e, fieldOnChange) => {
        const isChecked = e.target.checked;
        fieldOnChange(isChecked); // Оновлюємо стан чекбоксу

        // Якщо знімаємо галочку, очищуємо залежні поля
        if (!isChecked) {
            setValue(typeFieldName, '', { shouldDirty: true });
            setValue(typeOtherFieldName, '', { shouldDirty: true });
        }
    }, [setValue, typeFieldName, typeOtherFieldName]);

    // Обробник зміни типу
    const handleTypeChange = useCallback((e, fieldOnChange) => {
        const newValue = e.target.value;
        fieldOnChange(newValue);
        if (newValue !== 'Інше...') {
            setValue(typeOtherFieldName, '', { shouldDirty: true }); // Очищуємо "інше"
        }
    }, [setValue, typeOtherFieldName]);

    // Стилі для контейнера
    const containerStyles = {
        ...styles.containerVStackBase,
        borderWidth: isPreventionEnabled ? 1 : 0,
        p: isPreventionEnabled ? 2 : 0,
        borderColor: typeOtherError ? "red.300" : "gray.100",
    };

    return (
        <VStack {...containerStyles}>
            {/* --- Основний чекбокс (Controller) --- */}
            <Controller
                name={preventionFieldName}
                control={control}
                render={({ field: { onChange: fieldOnChange, value, ref, ...restField } }) => (
                     <Checkbox
                        {...restField}
                        ref={ref}
                        isChecked={!!value}
                        onChange={(e) => handlePreventionToggle(e, fieldOnChange)} // Кастомний обробник
                        isDisabled={isDisabled}
                        size="sm" // Стиль тут, бо він простий
                        fontWeight={!!value ? "medium" : "normal"} // Динамічний стиль
                    >
                        Попередження гіпотермії
                    </Checkbox>
                )}
            />

            {/* --- Деталі (з'являються умовно) --- */}
            {isPreventionEnabled && (
                <VStack {...styles.detailsVStack}>
                    {/* --- Тип (Select через Controller) --- */}
                    <FormControl id={typeFieldName} {...styles.selectControl}>
                        <Controller
                            name={typeFieldName}
                            control={control}
                            render={({ field: { onChange: fieldOnChange, value, ref, ...restField } }) => (
                                <Select
                                    {...restField}
                                    ref={ref}
                                    placeholder="– Оберіть тип –"
                                    value={value || ''}
                                    onChange={(e) => handleTypeChange(e, fieldOnChange)} // Кастомний обробник
                                    isDisabled={isDisabled}
                                    {...styles.select}
                                    aria-label="Тип попередження гіпотермії"
                                >
                                    {(hypothermiaPreventionTypes || []).map(opt => opt && (
                                        <option key={`hypo-type-${opt}`} value={opt}>{opt}</option>
                                    ))}
                                    {/* <option value="Інше...">Інше...</option> */} {/* "Інше" тепер частина списку */}
                                </Select>
                            )}
                        />
                         {/* Місце для помилки типу, якщо знадобиться */}
                    </FormControl>

                    {/* --- Уточнення "Інше" (Input через register) --- */}
                    {isOtherTypeSelected && (
                        <FormControl id={typeOtherFieldName} isRequired={isOtherTypeSelected} isInvalid={!!typeOtherError} {...styles.otherInputControl}>
                             {/* FormLabel тут не потрібна, бо це уточнення */}
                            <Input
                                {...register(typeOtherFieldName)}
                                placeholder="Уточніть тип..."
                                value={watch(typeOtherFieldName) || ''} // Контролюємо значення
                                isDisabled={isDisabled}
                                {...styles.otherInput}
                                aria-label="Уточнення типу попередження гіпотермії"
                            />
                             <FormErrorMessage {...styles.errorMessage}>{typeOtherError?.message}</FormErrorMessage>
                        </FormControl>
                    )}
                </VStack>
            )}
        </VStack>
    );
});

HypothermiaAidBlock.displayName = 'HypothermiaAidBlock';
export default HypothermiaAidBlock;