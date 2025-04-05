// src/components/CasualtyCard/PatientDataSection/PatientDataSection.jsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
    Box, SimpleGrid, FormControl, FormLabel, Input, Select, RadioGroup, Radio, Stack, Text, Divider, FormErrorMessage
} from '@chakra-ui/react';

// Імпортуємо стилі та підкомпоненти
// Переконайтесь, що шлях до стилів правильний
import { patientDataStyles as styles /* genderRadioStyles */ } from '../styles'; // genderRadioStyles не використовується?
// --- Імпортуємо AllergiesSubSection ---
import AllergiesSubSection from './AllergiesSubSection'; // Припускаємо, що він у цій же папці

// Компонент отримує константи та isDisabled як пропси
function PatientDataSection({ isDisabled, constants }) {
    // Отримуємо методи з батьківської форми через контекст
    const { control, register, watch, formState: { errors } } = useFormContext();

    // Стежимо за значенням роду військ для умовного рендерингу
    const branchOfServiceValue = watch('branchOfService');
    const showBranchOtherInput = branchOfServiceValue === 'Інше';

    // Опції статі для відображення (можна додати 'Не вказано', якщо потрібно)
    const genderOptionsToShow = (constants?.GENDER_OPTIONS || ['Ч', 'Ж']) // Запасний варіант
                                  .filter(opt => opt === 'Ч' || opt === 'Ж'); // Показуємо тільки Ч/Ж

    // --- Рендеринг ---
    return (
        <Box>
            {/* --- Основна інформація про пацієнта --- */}
            <SimpleGrid {...styles.grid}>
                 {/* ПІБ */}
                 <FormControl id="patientFullName" isRequired isInvalid={!!errors.patientFullName}>
                     <FormLabel {...styles.formLabel}>ПІБ</FormLabel>
                     <Input placeholder="Прізвище Ім'я" autoComplete="name" isDisabled={isDisabled} {...register('patientFullName')} {...styles.inputSize} />
                     <FormErrorMessage>{errors.patientFullName?.message}</FormErrorMessage>
                 </FormControl>

                {/* Останні 4 НСС */}
                <FormControl id="last4SSN" isRequired isInvalid={!!errors.last4SSN}>
                      <FormLabel {...styles.formLabel}>Останні 4 НСС</FormLabel>
                      <Input
                          {...register('last4SSN')}
                          placeholder="1234" maxLength={4} type="text" inputMode="numeric"
                          isDisabled={isDisabled} {...styles.inputSize}
                      />
                     <FormErrorMessage>{errors.last4SSN?.message}</FormErrorMessage>
                 </FormControl>

                 {/* Стать (Через Controller для RadioGroup) */}
                 <FormControl as="fieldset" id="gender" isRequired isInvalid={!!errors.gender} {...styles.formControl}>
                    <FormLabel as="legend" {...styles.formLabel}>Стать</FormLabel>
                    <Controller
                        name="gender" control={control} rules={{ required: 'Оберіть стать' }}
                        render={({ field }) => (
                            <RadioGroup {...field} isDisabled={isDisabled} {...styles.radioGroup}>
                                <Stack direction="row" spacing={5}>
                                    {genderOptionsToShow.map(opt => (
                                        <Radio key={opt} value={opt} {...styles.radio} >
                                            {opt === 'Ч' ? 'Чол' : 'Жін'}
                                        </Radio>
                                    ))}
                                </Stack>
                            </RadioGroup>
                        )}
                    />
                    <FormErrorMessage {...styles.errorMessage}>{errors.gender?.message}</FormErrorMessage>
                 </FormControl>

                 {/* Рід військ */}
                <FormControl id="branchOfService" isInvalid={!!errors.branchOfService}>
                     <FormLabel {...styles.formLabel}>Рід військ</FormLabel>
                     <Select placeholder="Оберіть..." isDisabled={isDisabled} {...register('branchOfService')} {...styles.inputSize}>
                        {(constants?.branchesOfService || []).map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </Select>
                    <FormErrorMessage>{errors.branchOfService?.message}</FormErrorMessage>
                </FormControl>

                {/* Інший Рід військ (умовно) */}
                {showBranchOtherInput && (
                    <FormControl id="branchOfServiceOther" isRequired={showBranchOtherInput} isInvalid={!!errors.branchOfServiceOther}>
                        <FormLabel {...styles.formLabel}>Вкажіть рід військ <Text as="span" {...styles.requiredAsterisk}>*</Text></FormLabel>
                        <Input placeholder="Введіть назву" isDisabled={isDisabled} {...register('branchOfServiceOther')} {...styles.inputSize}/>
                        <FormErrorMessage>{errors.branchOfServiceOther?.message}</FormErrorMessage>
                    </FormControl>
                )}

                 {/* Підрозділ */}
                 <FormControl id="unit" isInvalid={!!errors.unit} gridColumn={showBranchOtherInput ? 'auto' : {md: 'span 1'}}>
                   <FormLabel {...styles.formLabel}>Підрозділ</FormLabel>
                    <Input placeholder="Напр., 1 Бат., Рота 'Альфа'" isDisabled={isDisabled} {...register('unit')} {...styles.inputSize}/>
                    <FormErrorMessage>{errors.unit?.message}</FormErrorMessage>
                 </FormControl>
            </SimpleGrid>

            {/* --- Роздільник --- */}
            <Divider sx={styles.divider} />

            {/* --- Інформація про поранення та пріоритет --- */}
            <SimpleGrid {...styles.grid}>
                 {/* Дата поранення */}
                 <FormControl id="injuryDate" isRequired isInvalid={!!errors.injuryDate}>
                     <FormLabel {...styles.formLabel}>Дата поранення</FormLabel>
                     <Input type="date" isDisabled={isDisabled} max={new Date().toISOString().split("T")[0]} {...register('injuryDate')} {...styles.inputSize}/>
                     <FormErrorMessage>{errors.injuryDate?.message}</FormErrorMessage>
                 </FormControl>

                 {/* Час поранення */}
                 <FormControl id="injuryTime" isRequired isInvalid={!!errors.injuryTime}>
                     <FormLabel {...styles.formLabel}>Час поранення</FormLabel>
                     <Input type="time" isDisabled={isDisabled} pattern="[0-9]{2}:[0-9]{2}" {...register('injuryTime')} {...styles.inputSize}/>
                     <FormErrorMessage>{errors.injuryTime?.message}</FormErrorMessage>
                 </FormControl>

                 {/* Пріоритет евакуації */}
                 <FormControl id="evacuationPriority" isInvalid={!!errors.evacuationPriority} isRequired>
                    <FormLabel htmlFor="evacuationPriority" {...styles.formLabel}>Пріоритет евакуації</FormLabel>
                    <Select
                        id="evacuationPriority" placeholder="Оберіть..." isDisabled={isDisabled}
                        {...register('evacuationPriority', { required: 'Будь ласка, оберіть пріоритет евакуації' })}
                        {...styles.inputSize}
                    >
                        {(constants?.evacuationPriorities || []).map(priority => (
                            priority && <option key={priority} value={priority}>{priority}</option>
                        ))}
                    </Select>
                    <FormErrorMessage>{errors.evacuationPriority?.message}</FormErrorMessage>
                 </FormControl>
            </SimpleGrid>

            {/* --- Роздільник --- */}
            <Divider sx={styles.divider} />

            {/* --- РЕНДЕРИНГ СЕКЦІЇ АЛЕРГІЙ --- */}
            {/* Передаємо тільки isDisabled, оскільки AllergiesSubSection */}
            {/* використовує useFormContext для доступу до форми */}
            <AllergiesSubSection isDisabled={isDisabled} />

        </Box>
    );
}

export default PatientDataSection;