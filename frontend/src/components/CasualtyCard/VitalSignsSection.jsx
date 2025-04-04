// src/components/CasualtyCard/VitalSignsSection.jsx
import React, { useCallback, memo, useState } from 'react';
import {
    Box, Heading, VStack, SimpleGrid, FormControl, FormLabel, Input, Select, Button, IconButton, HStack, Text, Divider, Tooltip,
    FormErrorMessage // Імпортуємо
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';

// Припускаємо, що стилі імпортовані
// import { vitalSignsStyles, commonStyles } from './casualtyCardStyles';

// --- Валідація для рядка життєвих показників ---
const validateVitalSignsRow = (vs) => {
    const errors = {};
    const numberRegex = /^\d+$/; // Перевірка на ціле невід'ємне число
    const bpRegex = /^\d{1,3}\/\d{1,3}$/; // Формат АТ (напр., 120/80)
    const spo2Regex = /^(100|[1-9]?\d)$/; // SpO2 від 0 до 100

    if (vs.pulse && (!numberRegex.test(vs.pulse) || parseInt(vs.pulse, 10) <= 0)) {
        errors.pulse = "Пульс має бути цілим числом > 0";
    }
    if (vs.bp && !bpRegex.test(vs.bp.trim())) {
        errors.bp = "Невірний формат АТ (має бути ЧЧЧ/ЧЧЧ)";
    }
    if (vs.rr && (!numberRegex.test(vs.rr) || parseInt(vs.rr, 10) <= 0)) {
        errors.rr = "ЧД має бути цілим числом > 0";
    }
    if (vs.spO2 && !spo2Regex.test(vs.spO2)) {
        errors.spO2 = "SpO2 має бути від 0 до 100";
    }
    // AVPU та Біль - зазвичай не потребують валідації, якщо значення вибрано зі списку

    return errors;
};

// --- Дочірній компонент для рядка ---
const VitalSignsRow = memo(({ vitalEntry, rowErrors = {}, isDisabled, onVitalChange, onDeleteVital, onSetCurrentTime }) => {

    const handleTimeClick = useCallback(() => {
        onSetCurrentTime(vitalEntry.id);
    }, [vitalEntry.id, onSetCurrentTime]);

    const handleChange = useCallback((e) => {
        const { name, value, type } = e.target;
        // Для числових полів дозволяємо порожній рядок або число
         const finalValue = (type === 'number' && value !== '') ? value : value; // Зберігаємо як рядок для гнучкості валідації, але можна і parseFloat
        onVitalChange(vitalEntry.id, name, finalValue);
    }, [vitalEntry.id, onVitalChange]);

    const handleDeleteClick = useCallback(() => {
        onDeleteVital(vitalEntry.id);
    }, [vitalEntry.id, onDeleteVital]);

    const avpuOptions = ['', 'A', 'V', 'P', 'U'];
    const painOptions = ['', ...Array.from({ length: 11 }, (_, i) => i.toString())];

    return (
         // Застосовуємо стилі (якщо є) та рамку помилки
        <Box borderWidth="1px" borderRadius="md" p={2} mb={2} borderColor={Object.keys(rowErrors).length > 0 ? "red.300" : "gray.100"}>
            {/* Адаптивна сітка, вирівнювання по верху для помилок */}
            <SimpleGrid columns={{ base: 2, sm: 4, md: 8 }} spacing={3} alignItems="flex-start">
                {/* --- Час --- */}
                 <FormControl id={`time-${vitalEntry.id}`} gridColumn={{ base: "span 2", sm: "span 1", md: "span 1" }} >
                    <FormLabel fontSize="xs" mb={1}>Час</FormLabel>
                    <HStack spacing={1}>
                        <Input
                            pt="5px" // Невеликий відступ зверху для кращого вигляду часу
                            type="time"
                            size="xs"
                            name="time" // Додаємо name
                            value={vitalEntry.time || ''}
                            onChange={handleChange}
                            isDisabled={isDisabled}
                            pattern="[0-9]{2}:[0-9]{2}"
                        />
                        <Tooltip label="Поточний час" fontSize="xs">
                             <IconButton
                                aria-label="Встановити поточний час"
                                size="xs"
                                variant="outline"
                                icon={<TimeIcon />}
                                onClick={handleTimeClick}
                                isDisabled={isDisabled}
                             />
                         </Tooltip>
                    </HStack>
                 </FormControl>

                {/* --- Пульс --- */}
                 <FormControl id={`pulse-${vitalEntry.id}`} isInvalid={!!rowErrors.pulse} gridColumn={{ base: "span 1" }}>
                    <FormLabel fontSize="xs" mb={1}>Пульс</FormLabel>
                    <Input
                        size="xs"
                        type="number" // Для кращого введення
                        inputMode="numeric"
                        name="pulse"
                        value={vitalEntry.pulse ?? ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="уд/хв"
                        min={1} // Браузерна валідація
                    />
                    <FormErrorMessage fontSize="xs">{rowErrors.pulse}</FormErrorMessage>
                 </FormControl>

                {/* --- АТ --- */}
                 <FormControl id={`bp-${vitalEntry.id}`} isInvalid={!!rowErrors.bp} gridColumn={{ base: "span 1" }}>
                    <FormLabel fontSize="xs" mb={1}>АТ</FormLabel>
                    <Input
                        size="xs"
                        name="bp"
                        value={vitalEntry.bp || ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="120/80"
                        pattern="\d{1,3}\/\d{1,3}" // Браузерна валідація
                    />
                     <FormErrorMessage fontSize="xs">{rowErrors.bp}</FormErrorMessage>
                 </FormControl>

                 {/* --- ЧД --- */}
                 <FormControl id={`rr-${vitalEntry.id}`} isInvalid={!!rowErrors.rr} gridColumn={{ base: "span 1" }}>
                    <FormLabel fontSize="xs" mb={1}>ЧД</FormLabel>
                    <Input
                        size="xs"
                        type="number"
                        inputMode="numeric"
                        name="rr"
                        value={vitalEntry.rr ?? ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="дих/хв"
                        min={1}
                    />
                    <FormErrorMessage fontSize="xs">{rowErrors.rr}</FormErrorMessage>
                 </FormControl>

                 {/* --- SpO2 --- */}
                 <FormControl id={`spO2-${vitalEntry.id}`} isInvalid={!!rowErrors.spO2} gridColumn={{ base: "span 1" }}>
                    <FormLabel fontSize="xs" mb={1}>SpO2%</FormLabel>
                    <Input
                        size="xs"
                        type="number"
                        inputMode="numeric"
                        name="spO2"
                        value={vitalEntry.spO2 ?? ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="%"
                        min={0}
                        max={100}
                    />
                     <FormErrorMessage fontSize="xs">{rowErrors.spO2}</FormErrorMessage>
                 </FormControl>

                 {/* --- AVPU --- */}
                 <FormControl id={`avpu-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                    <FormLabel fontSize="xs" mb={1}>AVPU</FormLabel>
                    <Select size="xs" name="avpu" value={vitalEntry.avpu || ''} onChange={handleChange} isDisabled={isDisabled}>
                        {avpuOptions.map(opt => <option key={`avpu-${opt}`} value={opt}>{opt || '–'}</option>)}
                    </Select>
                 </FormControl>

                 {/* --- Біль --- */}
                 <FormControl id={`pain-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                    <FormLabel fontSize="xs" mb={1}>Біль (0-10)</FormLabel>
                    <Select size="xs" name="pain" value={vitalEntry.pain || ''} onChange={handleChange} isDisabled={isDisabled}>
                        {painOptions.map(opt => <option key={`pain-${opt}`} value={opt}>{opt === '' ? '–' : opt}</option>)}
                    </Select>
                 </FormControl>

                 {/* --- Видалити --- */}
                 {/* Вирівнюємо кнопку по нижньому краю */}
                 <Box alignSelf="flex-end" pb={rowErrors.pulse || rowErrors.bp || rowErrors.rr || rowErrors.spO2 ? '24px' : '0' } gridColumn={{ base: "span 2", sm:"span 1", md:"span 1" }} textAlign="right"> {/* Додаємо відступ знизу, якщо є помилки */}
                    <IconButton
                        aria-label="Видалити запис показників"
                        icon={<DeleteIcon />}
                        size="sm" // Зробимо трохи більшою для зручності
                        colorScheme="red"
                        variant="ghost"
                        onClick={handleDeleteClick}
                        isDisabled={isDisabled}
                    />
                 </Box>
            </SimpleGrid>
        </Box>
    );
});
VitalSignsRow.displayName = 'VitalSignsRow';

// --- Основний компонент секції ---
function VitalSignsSection({ data, setFormData, isDisabled, vitalSignsErrors = {}, setVitalSignsErrors = () => {} }) { // Очікуємо помилки і функцію їх оновлення

    const vitalSignsData = Array.isArray(data?.vitalSigns) ? data.vitalSigns : [];

    const getCurrentTime = useCallback(() => new Date().toTimeString().slice(0, 5), []);

    // Оновлення помилок для одного рядка (виклик функції з пропсів)
    const updateErrors = useCallback((id, rowErrors) => {
        setVitalSignsErrors(prevErrors => ({
            ...prevErrors,
            [id]: rowErrors
        }));
    }, [setVitalSignsErrors]);

    // Обробник змін - тепер валідує
    const handleVitalChange = useCallback((id, field, value) => {
        setFormData(prevData => {
            const updatedVitals = (prevData.vitalSigns || []).map(vs =>
                vs.id === id ? { ...vs, [field]: value } : vs
            );
            // Валідуємо рядок ПІСЛЯ оновлення даних у стані батька
             setTimeout(() => {
                const vitalToValidate = updatedVitals.find(v => v.id === id);
                 if (vitalToValidate) {
                    const rowErrors = validateVitalSignsRow(vitalToValidate);
                    updateErrors(id, rowErrors);
                }
            }, 0);
            return { ...prevData, vitalSigns: updatedVitals };
        });
    }, [setFormData, updateErrors]);

    // Додавання рядка - очищає помилки для нового ID
    const addVitalRow = useCallback(() => {
        const newId = crypto.randomUUID();
        setFormData(prevData => {
            const currentVitals = Array.isArray(prevData?.vitalSigns) ? prevData.vitalSigns : [];
            return {
                ...prevData,
                vitalSigns: [
                    ...currentVitals,
                    { id: newId, time: getCurrentTime(), pulse: '', bp: '', rr: '', spO2: '', avpu: '', pain: '' }
                ]
            };
        });
        updateErrors(newId, {}); // Скидаємо помилки для нового рядка
    }, [setFormData, getCurrentTime, updateErrors]);

    // Видалення рядка - видаляє і помилки
    const deleteVitalRow = useCallback((idToDelete) => {
        setFormData(prevData => ({
            ...prevData,
            vitalSigns: (prevData.vitalSigns || []).filter(vs => vs.id !== idToDelete)
        }));
        // Видаляємо помилки
        setVitalSignsErrors(prevErrors => {
            const nextErrors = { ...prevErrors };
            delete nextErrors[idToDelete];
            return nextErrors;
        });
    }, [setFormData, setVitalSignsErrors]);

     // Встановлення поточного часу
     const setCurrentVitalTime = useCallback((id) => {
        handleVitalChange(id, 'time', getCurrentTime()); // Викличе і валідацію
    }, [getCurrentTime, handleVitalChange]);

    return (
        <Box>
            {/* Заголовок і кнопка Додати */}
            {/* Застосовуємо стилі, якщо є */}
            <HStack justifyContent="space-between" alignItems="center" mb={3} /* {...vitalSignsStyles.headingHStack} */>
                 {/* Heading прибрано, він буде в AccordionButton */}
                 <Button
                    // {...vitalSignsStyles.addVitalButton} // Застосувати стилі, якщо є
                    leftIcon={<AddIcon />}
                    size="xs" // Зробимо розмір як у секції ліків
                    colorScheme="blue" // Інший колір для візуального розділення
                    variant="outline"
                    onClick={addVitalRow}
                    isDisabled={isDisabled}
                 >
                    Додати Запис Показників
                 </Button>
            </HStack>

            {/* Список записів */}
             {/* Застосовуємо стилі, якщо є */}
            <VStack spacing={2} align="stretch" /* {...vitalSignsStyles.vitalListVStack} */>
                 {vitalSignsData.length === 0 && ( // Показуємо завжди, коли порожньо
                    <Text color={isDisabled ? "gray.400" : "gray.500"} fontSize="sm" textAlign="center" py={2} /* {...vitalSignsStyles.noEntriesText} */>
                        Немає записів. Натисність "+ Додати Запис Показників", щоб додати.
                    </Text>
                 )}
                {vitalSignsData.map((vitalEntry) => (
                    <VitalSignsRow
                        key={vitalEntry.id}
                        vitalEntry={vitalEntry}
                        rowErrors={vitalSignsErrors[vitalEntry.id]} // Передаємо помилки
                        isDisabled={isDisabled}
                        onVitalChange={handleVitalChange}
                        onDeleteVital={deleteVitalRow}
                        onSetCurrentTime={setCurrentVitalTime}
                    />
                ))}
            </VStack>
        </Box>
    );
}

export default VitalSignsSection; // Експортуємо оновлений компонент