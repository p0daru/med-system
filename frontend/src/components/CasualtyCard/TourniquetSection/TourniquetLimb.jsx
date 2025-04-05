// src/components/CasualtyCard/TourniquetLimb.jsx
import React, { memo, useCallback } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
    Box, FormControl, FormLabel, Input, Select, Text, FormErrorMessage // Додаємо FormErrorMessage про всяк випадок
} from '@chakra-ui/react';

// Імпортуємо стилі та константи
import { tourniqLimbStyles as styles } from '../styles';

// Константи типів передаються через пропси (tourniquetTypesList)

const TourniquetLimb = memo(({ limb, label, isDisabled, tourniquetTypesList }) => {
    // Отримуємо методи з контексту
    const { control, watch, setValue, register, formState: { errors } } = useFormContext();

    // Генеруємо базові імена полів для цієї кінцівки
    const typeFieldName = `tourniquets.${limb}.type`;
    const typeOtherFieldName = `tourniquets.${limb}.typeOther`;
    const timeFieldName = `tourniquets.${limb}.time`;

    // Слідкуємо за значенням поля "Тип"
    const typeValue = watch(typeFieldName);
    const showTypeOtherInput = typeValue === 'Інше';

    // Отримуємо помилки (на випадок майбутньої валідації)
    const typeError = errors?.tourniquets?.[limb]?.type;
    const typeOtherError = errors?.tourniquets?.[limb]?.typeOther;
    const timeError = errors?.tourniquets?.[limb]?.time;

    // Обробник зміни типу турнікета
    const handleTypeChange = useCallback((e, fieldOnChange) => {
        const newValue = e.target.value;
        fieldOnChange(newValue); // Оновлюємо поле 'type' через Controller

        // Якщо вибрано НЕ "Інше", очищуємо поле "typeOther"
        if (newValue !== 'Інше') {
            setValue(typeOtherFieldName, '', {
                // shouldValidate: true // Поки валідації немає, можна не ставити
                shouldDirty: true,
            });
        }
    }, [limb, setValue, typeOtherFieldName]); // Додаємо залежності

    return (
        <Box {...styles.containerBox}>
            <Text {...styles.label}>{label}</Text>

            {/* --- Тип турнікета (Select через Controller) --- */}
            <FormControl {...styles.formControl} isInvalid={!!typeError}>
                <FormLabel {...styles.formLabel}>Тип</FormLabel>
                <Controller
                    name={typeFieldName}
                    control={control}
                    render={({ field: { onChange: fieldOnChange, value, ref, ...restField } }) => (
                        <Select
                            {...restField}
                            ref={ref}
                            placeholder="Оберіть тип..."
                            value={value || ''} // Контролюємо значення
                            onChange={(e) => handleTypeChange(e, fieldOnChange)} // Кастомний обробник
                            isDisabled={isDisabled}
                            {...styles.inputSize}
                        >
                            {(tourniquetTypesList || []).map(typeOption => (
                                <option key={`${limb}-${typeOption}`} value={typeOption}>{typeOption}</option>
                            ))}
                        </Select>
                    )}
                />
                 <FormErrorMessage {...styles.errorMessage}>{typeError?.message}</FormErrorMessage>
            </FormControl>

            {/* --- Уточнення "Інше" (Input через register) --- */}
            {showTypeOtherInput && (
                <FormControl {...styles.formControl} isInvalid={!!typeOtherError} isRequired={showTypeOtherInput}>
                    <FormLabel {...styles.formLabel}>Вкажіть тип <Text as="span" {...styles.requiredIndicator}>*</Text></FormLabel>
                    <Input
                        {...register(typeOtherFieldName)} // Реєструємо поле
                        placeholder="Введіть тип турнікета..."
                        isDisabled={isDisabled}
                        {...styles.inputSize}
                    />
                    <FormErrorMessage {...styles.errorMessage}>{typeOtherError?.message}</FormErrorMessage>
                </FormControl>
            )}

            {/* --- Час накладання (Input через register) --- */}
            <FormControl isInvalid={!!timeError}>
                <FormLabel {...styles.formLabel}>Час накладання (ГГ:ХХ)</FormLabel>
                <Input
                    {...register(timeFieldName)} // Реєструємо поле
                    type="time"
                    pattern="[0-9]{2}:[0-9]{2}"
                    isDisabled={isDisabled}
                    {...styles.inputSize}
                />
                 <FormErrorMessage {...styles.errorMessage}>{timeError?.message}</FormErrorMessage>
            </FormControl>
        </Box>
    );
});

TourniquetLimb.displayName = 'TourniquetLimb';
export default TourniquetLimb;