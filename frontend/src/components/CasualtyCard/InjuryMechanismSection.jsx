// src/components/CasualtyCard/InjuryMechanismSection.jsx
import React, { useEffect, useMemo, useCallback } from 'react';
// Keep local useForm, FormProvider, Controller
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box, VStack, CheckboxGroup, Stack, Checkbox, FormControl, FormLabel, Input, Textarea, FormErrorMessage
} from '@chakra-ui/react';

// Import schema, styles, constants directly
import { injuryMechanismSchema } from './validationSchema'; // Verify path
import { mechSectionStyles as styles } from './styles'; // Verify path
import { ALL_MECHANISMS } from '../../constants/constants'; // Use prop instead

// Keep data, isDisabled props. setFormData is not strictly needed if parent reads on submit.
function InjuryMechanismSection({ data, isDisabled }) {

    // --- RHF Setup (LOCAL to this component) ---
    const methods = useForm({
        resolver: yupResolver(injuryMechanismSchema),
        // Default values are derived from the 'data' prop
        defaultValues: useMemo(() => ({
            mechanismOfInjury: Array.isArray(data?.mechanismOfInjury) ? data.mechanismOfInjury : [],
            mechanismOfInjuryOther: data?.mechanismOfInjuryOther || '',
            injuryDescription: data?.injuryDescription || '',
        }), [data]), // Re-calculate defaults when 'data' prop changes
        mode: 'onChange',
    });

    // Get methods from the LOCAL useForm instance
    const { control, register, watch, reset, setValue, formState: { errors } } = methods;

    // --- Sync External Data Prop -> Internal RHF State ---
    // This effect IS necessary in this isolated structure
    useEffect(() => {
        console.log("InjuryMechanismSection useEffect: data prop changed. Resetting internal form.", data);
        // Reset the LOCAL form when the 'data' prop from the parent changes
        reset({
            mechanismOfInjury: Array.isArray(data?.mechanismOfInjury) ? data.mechanismOfInjury : [],
            mechanismOfInjuryOther: data?.mechanismOfInjuryOther || '',
            injuryDescription: data?.injuryDescription || '',
        });
    }, [data, reset]); // Depend on the 'data' prop and the local 'reset' function

    // --- UI Logic ---
    const mechanismOfInjuryValue = watch('mechanismOfInjury'); // Watch local RHF state
    const showOtherInput = Array.isArray(mechanismOfInjuryValue) && mechanismOfInjuryValue.includes('Інше');

    // --- CheckboxGroup Handler ---
    const handleCheckboxGroupChange = useCallback((values, fieldOnChange) => {
        // Ensure 'values' is always an array before processing
        const safeValues = Array.isArray(values) ? values : [];
        fieldOnChange(safeValues); // Update internal RHF state

        // Clear 'other' field if 'Інше' is unchecked
        if (!safeValues.includes('Інше')) {
            setValue('mechanismOfInjuryOther', '', {
                shouldValidate: true,
                shouldDirty: true
            });
        }
    }, [setValue]); // Depend on local 'setValue'


    // --- Rendering ---
    // Wrap content in the LOCAL FormProvider
    return (
        <FormProvider {...methods}>
            <Box>
                <VStack {...styles.containerVStack}>
                    {/* --- Mechanism of Injury CheckboxGroup --- */}
                    <FormControl isInvalid={!!errors.mechanismOfInjury}>
                        <FormLabel {...styles.formLabel}>Механізм поранення (позначте все потрібне)</FormLabel>
                        <Controller
                            name="mechanismOfInjury" // Field name for local RHF state
                            control={control} // Use local control
                            render={({ field: { onChange: fieldOnChange, value, ...fieldProps } }) => (
                                <CheckboxGroup
                                    {...fieldProps}
                                    colorScheme='blue'
                                    // Value from local RHF state, ensure it's an array
                                    value={Array.isArray(value) ? value : []}
                                    onChange={(values) => handleCheckboxGroupChange(values, fieldOnChange)}
                                    isDisabled={isDisabled}
                                >
                                    <Stack {...styles.checkboxGroupStack}>
                                        {/* Map over the locally defined/imported ALL_MECHANISMS */}
                                        {ALL_MECHANISMS.map((mech) => (
                                            <Checkbox key={mech} value={mech} {...styles.checkbox}>
                                                {mech}
                                            </Checkbox>
                                        ))}
                                        {/* If "Інше" isn't in ALL_MECHANISMS, add it explicitly */}
                                        {/* {!ALL_MECHANISMS.includes("Інше") && (
                                            <Checkbox value="Інше" {...styles.checkbox}>Інше</Checkbox>
                                        )} */}
                                    </Stack>
                                </CheckboxGroup>
                            )}
                        />
                        <FormErrorMessage {...styles.errorMessage}>
                            {errors.mechanismOfInjury?.message}
                        </FormErrorMessage>
                    </FormControl>

                    {/* --- "Other" Input (conditional) --- */}
                    {showOtherInput && (
                        <FormControl isRequired={showOtherInput} isInvalid={!!errors.mechanismOfInjuryOther}>
                            <FormLabel {...styles.otherInputLabel}>Уточніть "Інше"</FormLabel>
                            <Input
                                {...register('mechanismOfInjuryOther')} // Register with local RHF
                                placeholder="Опишіть інший механізм"
                                isDisabled={isDisabled}
                                {...styles.otherInput}
                            />
                            <FormErrorMessage {...styles.errorMessage}>
                                {errors.mechanismOfInjuryOther?.message}
                            </FormErrorMessage>
                        </FormControl>
                    )}

                    {/* --- Injury Description --- */}
                    <FormControl isInvalid={!!errors.injuryDescription}>
                        <FormLabel {...styles.formLabel}>Інформація про поранення / Опис / Відмітки</FormLabel>
                        <Textarea
                            {...register('injuryDescription')} // Register with local RHF
                            placeholder="Опишіть місця та характер поранень, відсоток опіків тощо."
                            isDisabled={isDisabled}
                            {...styles.descriptionTextarea}
                        />
                        <FormErrorMessage {...styles.errorMessage}>
                            {errors.injuryDescription?.message}
                        </FormErrorMessage>
                    </FormControl>
                </VStack>
            </Box>
        </FormProvider>
    );
}

export default InjuryMechanismSection;