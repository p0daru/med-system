// src/components/CasualtyCard/AdministrativeDataSection.jsx
import React, { useEffect, useMemo, useCallback } from 'react'; // Додаємо хуки
import { useForm, FormProvider } from 'react-hook-form'; // Імпортуємо RHF
// Валідація не потрібна, тому yupResolver не імпортуємо
import { Box, Heading, VStack, SimpleGrid, FormControl, FormLabel, Input, Divider } from '@chakra-ui/react';

// Імпорти стилів та хелперів
import { adminDataSectionStyles as styles } from './styles'; // Перевірте шлях!
import { formatDateTime } from '../../utils/helpers'; // Перевірте шлях!

function AdministrativeDataSection({ data, setFormData, isDisabled }) {
    // --- RHF Setup ---
    const methods = useForm({
        // resolver не потрібен
        defaultValues: useMemo(() => ({
            providerFullName: data?.providerFullName || '',
            providerLast4SSN: data?.providerLast4SSN || '',
            // Поля аудиту (recordedBy, createdAt, updatedAt) не є частиною форми для редагування
        }), [data]), // Залежимо від data
        // mode: 'onChange', // Не потрібен без валідації
    });

    const { register, watch, reset, setValue } = methods; 

    // --- Синхронізація: Зовнішні дані -> Форма RHF ---
    useEffect(() => {
        // Reset оновлює форму значеннями з data, коли data змінюється
        reset({
            providerFullName: data?.providerFullName || '',
            providerLast4SSN: data?.providerLast4SSN || '',
        });
    }, [data, reset]); // Залежимо від data та reset

    // --- Синхронізація: Форма RHF -> Зовнішній стан (setFormData) - ВИДАЛЕНО ---
    // Батьківський компонент має сам отримувати дані

    // --- Обробник для providerLast4SSN (використовуємо register + setValue) ---
    const handleSsnChange = useCallback((e) => {
        const { value } = e.target;
        const filteredValue = value.replace(/\D/g, '').slice(0, 4);
        setValue('providerLast4SSN', filteredValue, { shouldDirty: true });
    }, [setValue]);


    // --- Рендеринг ---
    return (
        // Надаємо методи форми дочірнім (якщо будуть)
        <FormProvider {...methods}>
            <Box>
                {/* --- Дані Провайдера --- */}
                <Heading {...styles.sectionHeading}>Дані Особи, яка надала допомогу</Heading>
                <SimpleGrid {...styles.providerGrid}>
                    {/* --- ПІБ Провайдера (register) --- */}
                    <FormControl id="providerFullName">
                        <FormLabel {...styles.formLabel}>ПІБ (Прізвище, Ім'я)</FormLabel>
                        <Input
                            placeholder="Іваненко Іван"
                            autoComplete="name"
                            isDisabled={isDisabled}
                            {...register('providerFullName')} // Реєструємо поле
                            {...styles.inputSize}
                        />
                        {/* FormErrorMessage не потрібен без валідації */}
                    </FormControl>

                    {/* --- НСС Провайдера (register + кастомний onChange) --- */}
                    <FormControl id="providerLast4SSN">
                        <FormLabel {...styles.formLabel}>Останні 4 НСС</FormLabel>
                        <Input
                            {...register('providerLast4SSN')} // Реєструємо
                            placeholder="1234"
                            maxLength={4}
                            inputMode="numeric"
                            isDisabled={isDisabled}
                            onChange={handleSsnChange} // Кастомний обробник
                            value={watch('providerLast4SSN') ?? ''} // Контролюємо value
                            {...styles.inputSize}
                        />
                         {/* FormErrorMessage не потрібен */}
                    </FormControl>
                </SimpleGrid>

                <Divider sx={styles.divider} />

                {/* --- Адміністративна Інформація (Read Only) --- */}
                <Heading {...styles.sectionHeading}>Адміністративна Інформація</Heading>
                <VStack {...styles.adminInfoVStack}>
                    <SimpleGrid {...styles.timestampsGrid}>
                        {/* --- Запис створив --- */}
                        <FormControl id="recordedBy">
                            <FormLabel {...styles.formLabel}>Запис створив/редагував</FormLabel>
                            <Input
                                type="text"
                                // Значення беремо напряму з data, бо це не редагується
                                value={data?.recordedBy || 'Автоматично'}
                                isReadOnly
                                isDisabled // Візуально заблоковано
                                {...styles.inputSize}
                                sx={styles.readOnlyInput} // Застосовуємо стилі для read-only
                            />
                        </FormControl>

                        {/* --- Час Створення --- */}
                        {data?.createdAt && (
                            <FormControl>
                                <FormLabel {...styles.formLabel}>Час Створення Запису</FormLabel>
                                <Input
                                    type="text"
                                    // Форматуємо значення з data
                                    value={formatDateTime(data.createdAt)}
                                    isReadOnly
                                    isDisabled
                                    {...styles.inputSize}
                                    sx={styles.readOnlyInput}
                                />
                            </FormControl>
                        )}

                        {/* --- Час Оновлення --- */}
                        {data?.updatedAt && (
                            <FormControl>
                                <FormLabel {...styles.formLabel}>Час Останнього Оновлення</FormLabel>
                                <Input
                                    type="text"
                                    // Форматуємо значення з data
                                    value={formatDateTime(data.updatedAt)}
                                    isReadOnly
                                    isDisabled
                                    {...styles.inputSize}
                                    sx={styles.readOnlyInput}
                                />
                            </FormControl>
                        )}
                    </SimpleGrid>
                </VStack>
            </Box>
        </FormProvider>
    );
}

export default AdministrativeDataSection;