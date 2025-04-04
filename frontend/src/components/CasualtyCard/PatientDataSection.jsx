// src/components/CasualtyCard/PatientDataSection.jsx
import React, { useCallback } from 'react';
import {
    Box, SimpleGrid, FormControl, FormLabel, Input, Select, RadioGroup, Radio, Stack, Checkbox, CheckboxGroup, Textarea, Text, VStack, Divider, Heading
} from '@chakra-ui/react';

// Import styles
import { patientDataStyles, commonStyles } from './casualtyCardStyles';
import constants from '../../constants/constants.json';

function PatientDataSection({ data, setFormData, isDisabled }) {

    // Use lists from the imported constants object
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
            // Important: use allergensList (from constants) here
            const newKnown = isChecked ? Object.fromEntries(allergensList.map(a => [a, false])) : {};
            const newOther = isChecked ? '' : (currentAllergies.other || '');
            // ... rest of the logic
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
   }, [setFormData, allergensList]); // Add allergensList to useCallback dependencies

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
            {/* Apply section heading style */}
            {/* <Heading {...patientDataStyles.section1Heading}>
                1. Дані Постраждалого
            </Heading> */}

            {/* Apply patient info grid style */}
            <SimpleGrid {...patientDataStyles.patientInfoGrid}>
                 <FormControl id="patientFullName" isRequired>
                     {/* Apply label style and required asterisk style */}
                     <FormLabel {...patientDataStyles.label}>
                         ПІБ <Text {...commonStyles.requiredAsterisk}>*</Text>
                     </FormLabel>
                     {/* Apply input style */}
                     <Input
                         {...commonStyles.inputSm}
                         name="patientFullName"
                         value={data.patientFullName || ''}
                         onChange={handleChange}
                         isDisabled={isDisabled}
                         placeholder="Прізвище Ім'я"
                         autoComplete="name"
                     />
                 </FormControl>
                 <FormControl id="last4SSN">
                      {/* Apply label style */}
                     <FormLabel {...patientDataStyles.label}>Останні 4 НСС</FormLabel>
                     {/* Apply input style */}
                     <Input
                         {...commonStyles.inputSm}
                         name="last4SSN"
                         value={data.last4SSN || ''}
                         onChange={handleNumericChange}
                         isDisabled={isDisabled}
                         maxLength={4}
                         inputMode="numeric"
                         placeholder="1234"
                     />
                 </FormControl>
                 <FormControl id="gender">
                      {/* Apply label style */}
                     <FormLabel {...patientDataStyles.label}>Стать</FormLabel>
                     <RadioGroup onChange={handleGenderChange} value={data.gender || ''} isDisabled={isDisabled}>
                         {/* Apply gender radio stack style */}
                         <Stack {...patientDataStyles.genderRadioStack}>
                             {/* Keep size prop for Radio as it's simple */}
                             <Radio value='Ч' size="sm">Чол</Radio>
                             <Radio value='Ж' size="sm">Жін</Radio>
                         </Stack>
                     </RadioGroup>
                 </FormControl>

                <FormControl id="branchOfService">
                     {/* Apply label style */}
                    <FormLabel {...patientDataStyles.label}>Рід військ</FormLabel>
                    {/* Apply input style (for Select) */}
                    <Select
                        {...commonStyles.inputSm}
                        name="branchOfService"
                        value={data.branchOfService || ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="Оберіть..."
                    >
                        {branchesOfServiceList.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </Select>
                </FormControl>

                {showBranchOtherInput && (
                    <FormControl id="branchOfServiceOther" isRequired>
                        {/* Apply label style and required asterisk style */}
                       <FormLabel {...patientDataStyles.label}>
                           Вкажіть рід військ <Text {...commonStyles.requiredAsterisk}>*</Text>
                       </FormLabel>
                       {/* Apply input style */}
                        <Input
                            {...commonStyles.inputSm}
                            name="branchOfServiceOther"
                            value={data.branchOfServiceOther || ''}
                            onChange={handleChange}
                            isDisabled={isDisabled}
                            placeholder="Введіть назву"
                        />
                    </FormControl>
                )}

                 <FormControl id="unit" gridColumn={showBranchOtherInput ? 'auto' : {md: 'span 1'}}>
                    {/* Apply label style */}
                   <FormLabel {...patientDataStyles.label}>Підрозділ</FormLabel>
                   {/* Apply input style */}
                    <Input
                        {...commonStyles.inputSm}
                        name="unit"
                        value={data.unit || ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="Напр., 1 Бат., Рота 'Альфа'"
                    />
                 </FormControl>
            </SimpleGrid>

            {/* Apply common divider style */}
            <Divider sx={commonStyles.divider} />

            {/* Reuse patient info grid style for layout consistency */}
            <SimpleGrid {...patientDataStyles.patientInfoGrid}>
                 <FormControl id="injuryDate" isRequired>
                      {/* Apply label style and required asterisk style */}
                     <FormLabel {...patientDataStyles.label}>
                         Дата поранення <Text {...commonStyles.requiredAsterisk}>*</Text>
                     </FormLabel>
                     {/* Apply input style */}
                     <Input
                         {...commonStyles.inputSm}
                         type="date"
                         name="injuryDate"
                         value={data.injuryDate || ''}
                         onChange={handleChange}
                         isDisabled={isDisabled}
                         max={new Date().toISOString().split("T")[0]}
                     />
                 </FormControl>
                 <FormControl id="injuryTime" isRequired>
                      {/* Apply label style and required asterisk style */}
                     <FormLabel {...patientDataStyles.label}>
                         Час поранення <Text {...commonStyles.requiredAsterisk}>*</Text>
                     </FormLabel>
                      {/* Apply input style */}
                     <Input
                         {...commonStyles.inputSm}
                         type="time"
                         name="injuryTime"
                         value={data.injuryTime || ''}
                         onChange={handleChange}
                         isDisabled={isDisabled}
                         pattern="[0-9]{2}:[0-9]{2}"
                     />
                 </FormControl>

                 <FormControl id="evacuationPriority">
                    {/* Apply label style */}
                    <FormLabel {...patientDataStyles.label}>Пріоритет евакуації</FormLabel>
                    {/* Apply input style (for Select) */}
                    <Select
                        {...commonStyles.inputSm}
                        name="evacuationPriority"
                        value={data.evacuationPriority || ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="Оберіть..."
                    >
                        {evacuationPrioritiesList.map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                        ))}
                    </Select>
                </FormControl>
            </SimpleGrid>

            {/* Apply common divider style */}
            <Divider sx={commonStyles.divider} />

            {/* Keep gridColumn inline as it's layout specific */}
            <FormControl id="allergies" gridColumn="1 / -1">
                 {/* Apply allergies label style */}
                 <FormLabel {...patientDataStyles.allergiesLabel}>Алергії</FormLabel>
                 {/* Apply allergies container box style */}
                 <Box {...patientDataStyles.allergiesContainerBox}>
                     {/* Apply allergies VStack style */}
                     <VStack {...patientDataStyles.allergiesVStack}>
                          {/* Apply NKA checkbox style */}
                         <Checkbox
                             {...patientDataStyles.nkaCheckbox}
                             isChecked={!!allergiesData.nka}
                             onChange={handleNkaChange}
                             isDisabled={isDisabled}
                         >
                              {/* Apply NKA label text style */}
                             <Text {...patientDataStyles.nkaLabelText}>
                                 Немає відомих алергій (НВА / NKA)
                             </Text>
                         </Checkbox>
                         {/* Basic divider, no extra margin needed here */}
                         <Divider />
                          {/* Apply known allergies label text style, keep conditional color inline */}
                         <Text
                             {...patientDataStyles.knownAllergiesLabelText}
                             color={allergiesData.nka ? "gray.400" : "gray.700"}
                         >
                             Або вкажіть відомі:
                         </Text>
                          {/* Apply known allergies box style (padding) */}
                         <Box {...patientDataStyles.knownAllergiesBox}>
                             <CheckboxGroup isDisabled={isDisabled || !!allergiesData.nka}>
                                 {/* Apply known allergens grid style */}
                                 <SimpleGrid {...patientDataStyles.knownAllergensGrid}>
                                     {allergensList.map(allergen => (
                                         <Checkbox
                                             key={allergen}
                                             {...patientDataStyles.knownAllergenCheckbox} // Apply known allergen checkbox style
                                             isChecked={!!allergiesData.known?.[allergen]}
                                             onChange={() => handleKnownAllergyChange(allergen)}
                                         >
                                             {allergen}
                                         </Checkbox>
                                     ))}
                                 </SimpleGrid>
                             </CheckboxGroup>
                         </Box>
                         {/* Apply other allergies textarea style */}
                         <Textarea
                             {...patientDataStyles.otherAllergiesTextarea}
                             placeholder="Інші алергії або деталі (напр., реакція...)"
                             value={allergiesData.other || ''}
                             onChange={handleOtherAllergyChange}
                             isDisabled={isDisabled || !!allergiesData.nka}
                         />
                     </VStack>
                 </Box>
            </FormControl>
        </Box>
    );
}

export default PatientDataSection;