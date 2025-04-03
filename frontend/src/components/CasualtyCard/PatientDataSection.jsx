// src/components/CasualtyCard/PatientDataSection.jsx
import React, { useCallback } from 'react';
import {
    Box, SimpleGrid, FormControl, FormLabel, Input, Select, RadioGroup, Radio, Stack, Checkbox, CheckboxGroup, Textarea, Text, VStack, Divider, Heading
} from '@chakra-ui/react';

// Імпортуємо всі константи з JSON файлу
import constants from '../../constants/constants.json';

function PatientDataSection({ data, setFormData, isDisabled }) {

    // Використовуємо списки з імпортованого об'єкта constants
    const allergensList = constants.commonAllergens;
    const branchesOfServiceList = constants.branchesOfService;
    const evacuationPrioritiesList = constants.evacuationPriorities;

    // --- Memoized Handlers ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    }, [setFormData]);

    const handleNumericChange = useCallback((e) => {
        const { name, value } = e.target;
        const numericValue = value.replace(/\D/g, '');
        setFormData(prevData => ({ ...prevData, [name]: numericValue }));
    }, [setFormData]);

    const handleGenderChange = useCallback((value) => {
        setFormData(prevData => ({ ...prevData, gender: value }));
    }, [setFormData]);

    const handleNkaChange = useCallback((e) => {
        const isChecked = e.target.checked;
        setFormData(prevData => {
            const currentAllergies = prevData.allergies || {};
            // Важливо: використовуємо allergensList (отриманий з constants) тут
            const newKnown = isChecked ? Object.fromEntries(allergensList.map(a => [a, false])) : {};
            const newOther = isChecked ? '' : (currentAllergies.other || '');
            // ... решта логіки
            return {
                ...prevData,
                allergies: {
                    ...currentAllergies,
                    nka: isChecked,
                    known: newKnown,
                    other: newOther,
                }
            };
        });
   }, [setFormData, allergensList]); // Додаємо allergensList до залежностей useCallback

    const handleKnownAllergyChange = useCallback((allergen) => {
        setFormData(prevData => {
            const currentAllergies = prevData.allergies || { known: {}, other: '', nka: false };
            if (currentAllergies.nka) return prevData;

            const currentKnown = currentAllergies.known || {};
            const newKnown = { ...currentKnown, [allergen]: !currentKnown[allergen] };
            return { ...prevData, allergies: { ...currentAllergies, known: newKnown } };
        });
    }, [setFormData]);

    const handleOtherAllergyChange = useCallback((e) => {
        const { value } = e.target;
        setFormData(prevData => {
            const currentAllergies = prevData.allergies || { known: {}, other: '', nka: false };
            if (currentAllergies.nka) return prevData;
            return { ...prevData, allergies: { ...currentAllergies, other: value } };
        });
    }, [setFormData]);
    // --- End Memoized Handlers ---

    const allergiesData = data.allergies || { known: {}, other: '', nka: false };
    const showBranchOtherInput = data.branchOfService === 'Інше';

    return (
        <Box>
            <Heading size="sm" mb={3} borderBottomWidth={1} pb={1} borderColor="gray.200">
                1. Дані Постраждалого
            </Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={4}>
            <FormControl id="patientFullName" isRequired>
                     <FormLabel fontSize="sm" mb={1}>ПІБ <Text as="span" color="red.500">*</Text></FormLabel>
                     <Input name="patientFullName" size="sm" value={data.patientFullName || ''} onChange={handleChange} isDisabled={isDisabled} placeholder="Прізвище Ім'я" autoComplete="name" />
                 </FormControl>
                 <FormControl id="last4SSN">
                     <FormLabel fontSize="sm" mb={1}>Останні 4 НСС</FormLabel>
                     <Input name="last4SSN" size="sm" value={data.last4SSN || ''} onChange={handleNumericChange} isDisabled={isDisabled} maxLength={4} inputMode="numeric" placeholder="1234" />
                 </FormControl>
                 <FormControl id="gender">
                     <FormLabel fontSize="sm" mb={1}>Стать</FormLabel>
                     <RadioGroup onChange={handleGenderChange} value={data.gender || ''} isDisabled={isDisabled}>
                         <Stack direction='row' spacing={4}>
                             <Radio value='Ч' size="sm">Чол</Radio>
                             <Radio value='Ж' size="sm">Жін</Radio>
                         </Stack>
                     </RadioGroup>
                 </FormControl>

                <FormControl id="branchOfService">
                    <FormLabel fontSize="sm" mb={1}>Рід військ/Служба</FormLabel>
                    {/* Використовуємо branchesOfServiceList */}
                    <Select name="branchOfService" size="sm" value={data.branchOfService || ''} onChange={handleChange} isDisabled={isDisabled} placeholder="Оберіть...">
                        {branchesOfServiceList.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </Select>
                </FormControl>

                {showBranchOtherInput && (
                    <FormControl id="branchOfServiceOther" isRequired>
                       {/* ... (Input для "Інше" роду військ) ... */}
                       <FormLabel fontSize="sm" mb={1}>Вкажіть рід військ/службу <Text as="span" color="red.500">*</Text></FormLabel>
                        <Input
                            name="branchOfServiceOther"
                            size="sm"
                            value={data.branchOfServiceOther || ''}
                            onChange={handleChange}
                            isDisabled={isDisabled}
                            placeholder="Введіть назву"
                        />
                    </FormControl>
                )}

                 <FormControl id="unit" gridColumn={showBranchOtherInput ? 'auto' : {md: 'span 1'}}>
                   {/* ... (Input для Підрозділ) ... */}
                   <FormLabel fontSize="sm" mb={1}>Підрозділ</FormLabel>
                    <Input name="unit" size="sm" value={data.unit || ''} onChange={handleChange} isDisabled={isDisabled} placeholder="Напр., 1 Бат., Рота 'Альфа'" />
                 </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={4}>
                 {/* ... (Дата, Час поранення) ... */}
                 <FormControl id="injuryDate" isRequired>
                     <FormLabel fontSize="sm" mb={1}>Дата поранення <Text as="span" color="red.500">*</Text></FormLabel>
                     <Input type="date" size="sm" name="injuryDate" value={data.injuryDate || ''} onChange={handleChange} isDisabled={isDisabled} max={new Date().toISOString().split("T")[0]} />
                 </FormControl>
                 <FormControl id="injuryTime" isRequired>
                     <FormLabel fontSize="sm" mb={1}>Час поранення <Text as="span" color="red.500">*</Text></FormLabel>
                     <Input type="time" size="sm" name="injuryTime" value={data.injuryTime || ''} onChange={handleChange} isDisabled={isDisabled} pattern="[0-9]{2}:[0-9]{2}" />
                 </FormControl>

                 <FormControl id="evacuationPriority">
                    <FormLabel fontSize="sm" mb={1}>Пріоритет евакуації</FormLabel>
                    {/* Використовуємо evacuationPrioritiesList */}
                    <Select size="sm" name="evacuationPriority" value={data.evacuationPriority || ''} onChange={handleChange} isDisabled={isDisabled} placeholder="Оберіть...">
                        {evacuationPrioritiesList.map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                        ))}
                    </Select>
                </FormControl>
            </SimpleGrid>

            <Divider my={4} />

            <FormControl id="allergies" gridColumn="1 / -1">
                 <FormLabel fontSize="md" mb={2} fontWeight="medium">Алергії</FormLabel>
                 <Box borderWidth={1} borderRadius="md" p={4} borderColor="gray.200">
                     <VStack align="stretch" spacing={3}>
                         {/* ... (Чекбокс NKA) ... */}
                         <Checkbox isChecked={!!allergiesData.nka} onChange={handleNkaChange} isDisabled={isDisabled} colorScheme="green" size="md">
                             <Text fontWeight="bold" fontSize="sm">Немає відомих алергій (НВА / NKA)</Text>
                         </Checkbox>
                         <Divider />
                         <Text fontSize="sm" fontWeight="medium" color={allergiesData.nka ? "gray.400" : "gray.700"}>Або вкажіть відомі:</Text>
                         <Box pl={2}>
                             <CheckboxGroup isDisabled={isDisabled || !!allergiesData.nka}>
                                 <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacingX={4} spacingY={1.5}>
                                     {/* Використовуємо allergensList */}
                                     {allergensList.map(allergen => (
                                         <Checkbox key={allergen} isChecked={!!allergiesData.known?.[allergen]} onChange={() => handleKnownAllergyChange(allergen)} size="sm">
                                             {allergen}
                                         </Checkbox>
                                     ))}
                                 </SimpleGrid>
                             </CheckboxGroup>
                         </Box>
                         {/* ... (Textarea для інших алергій) ... */}
                         <Textarea placeholder="Інші алергії або деталі (напр., реакція...)" value={allergiesData.other || ''} onChange={handleOtherAllergyChange} isDisabled={isDisabled || !!allergiesData.nka} size="sm" rows={2} mt={1} />
                     </VStack>
                 </Box>
            </FormControl>
        </Box>
    );
}

export default PatientDataSection;