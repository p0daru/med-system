// src/components/CasualtyCard/PatientDataSection/AllergiesSubSection.jsx
// АБО там, де він фактично знаходиться, головне щоб імпорт був правильним

import React, { memo, useCallback } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
    Box, Checkbox, SimpleGrid, Textarea, Text, VStack, Divider, FormControl, FormLabel, FormErrorMessage
} from '@chakra-ui/react';

// Переконайтеся, що шляхи до стилів, констант та хелперів правильні ВІДНОСНО ЦЬОГО ФАЙЛУ
import { allergiesStyles as styles } from '../styles'; // Шлях може бути іншим! ../../styles ?
import { COMMON_ALLERGENS } from '../../../constants/constants'; // Шлях може бути іншим! ../../../constants/constants ?
import { generateAllergyKey } from '../../../utils/helpers'; // Шлях може бути іншим! ../../../utils/helpers ?

const AllergiesSubSection = memo(({ isDisabled }) => {
    const { control, register, watch, setValue, getValues, trigger, formState: { errors } } = useFormContext();

    const nkaCheckedForUI = watch('allergies.nka');

    const validateAllergySelection = useCallback((nkaValue) => {
        const currentValues = getValues();
        const known = currentValues.allergies?.known;
        const other = currentValues.allergies?.other;
        const anyKnownChecked = known ? Object.values(known).some(val => !!val) : false;
        const otherTextEntered = other ? other.trim().length > 0 : false;

        if (nkaValue || anyKnownChecked || otherTextEntered) {
            return true;
        }
        return "Будь ласка, оберіть 'НВА', позначте відому алергію чи опишіть в полі 'Інші'.";
    }, [getValues]);

    const allergyRequirementError = errors?.allergies?.nka?.message;
    const otherAllergySpecificError = errors?.allergies?.other;

    const handleNkaToggle = useCallback(async (e, fieldOnChange) => {
        const isCheckingNka = e.target.checked;
        fieldOnChange(isCheckingNka);

        if (isCheckingNka) {
            COMMON_ALLERGENS.forEach(allergen => {
                const key = generateAllergyKey(allergen);
                if (key && getValues(`allergies.known.${key}`)) {
                    setValue(`allergies.known.${key}`, false, { shouldValidate: false, shouldDirty: true, shouldTouch: true });
                }
            });
            if (getValues('allergies.other')?.trim()) {
                setValue('allergies.other', '', { shouldValidate: false, shouldDirty: true, shouldTouch: true });
            }
        }
        await trigger('allergies.nka');
    }, [setValue, getValues, trigger]);

    const handleKnownAllergyChange = useCallback(async (e, fieldOnChange, fieldName) => {
        const isCheckingKnown = e.target.checked;
        fieldOnChange(isCheckingKnown);

        if (isCheckingKnown && getValues('allergies.nka')) {
            setValue('allergies.nka', false, { shouldValidate: false, shouldDirty: true, shouldTouch: true });
        }
        await trigger('allergies.nka');
    }, [setValue, getValues, trigger]);

    const otherRegisterProps = register('allergies.other', {
        onChange: async (e) => {
            if (e.target.value.trim().length > 0 && getValues('allergies.nka')) {
                setValue('allergies.nka', false, { shouldValidate: false, shouldDirty: true, shouldTouch: true });
            }
            await trigger('allergies.nka');
        },
    });

    const isInvalid = !!allergyRequirementError || !!otherAllergySpecificError;

    return (
        <FormControl id="allergies-section" {...styles.containerFormControl} isInvalid={isInvalid}>
            <FormLabel {...styles.label} mb={2}>
                Алергії
                <Text as="span" color="orange.500" ml={1}>*</Text>
            </FormLabel>
            <Box {...styles.containerBox} border="none" p={0}> 
                <VStack {...styles.vStack} spacing={3}>
                    <Controller
                        name="allergies.nka"
                        control={control}
                        rules={{ validate: validateAllergySelection }}
                        render={({ field: { onChange: fieldOnChange, value, ref, ...restField } }) => (
                            <Checkbox
                                {...restField} ref={ref} isChecked={!!value}
                                onChange={(e) => handleNkaToggle(e, fieldOnChange)}
                                isDisabled={isDisabled} {...styles.nkaCheckbox}
                            >
                                <Text {...styles.nkaLabelText}>Немає відомих алергій (НВА / NKA)</Text>
                            </Checkbox>
                        )}
                    />
                    <Divider />
                    <Text
                        alignSelf="flex-start" // Вирівнювання тексту
                        {...styles.knownAllergiesLabelText}
                        color={nkaCheckedForUI ? "gray.400" : "gray.700"}
                    >
                        Або вкажіть відомі:
                    </Text>
                    <Box {...styles.knownAllergiesBox} w="100%"> {/* Розтягуємо блок */}
                        <SimpleGrid {...styles.knownAllergensGrid}>
                            {COMMON_ALLERGENS.filter(a => a !== 'Інше...').map(allergen => {
                                const key = generateAllergyKey(allergen);
                                if (!key) return null;
                                const fieldName = `allergies.known.${key}`;
                                return (
                                    <Controller
                                        key={fieldName} name={fieldName} control={control}
                                        render={({ field: { onChange: fieldOnChange, value, ref, ...restField } }) => (
                                            <Checkbox
                                                {...restField} ref={ref} isChecked={!!value}
                                                onChange={(e) => handleKnownAllergyChange(e, fieldOnChange, fieldName)}
                                                isDisabled={isDisabled || nkaCheckedForUI} {...styles.knownAllergenCheckbox}
                                            >
                                                {allergen}
                                            </Checkbox>
                                        )}
                                    />
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                    <Textarea
                        placeholder="Інші алергії або деталі (напр., реакція...)"
                        isDisabled={isDisabled || nkaCheckedForUI}
                        {...otherRegisterProps}
                        {...styles.otherAllergiesTextarea}
                    />
                    {allergyRequirementError && (
                        <FormErrorMessage {...styles.errorMessage}>
                            {allergyRequirementError}
                        </FormErrorMessage>
                    )}
                    {otherAllergySpecificError && allergyRequirementError !== otherAllergySpecificError.message && (
                        <FormErrorMessage {...styles.errorMessage}>
                            {otherAllergySpecificError.message}
                        </FormErrorMessage>
                    )}
                </VStack>
            </Box>
        </FormControl>
    );
});

AllergiesSubSection.displayName = 'AllergiesSubSection';
export default AllergiesSubSection;