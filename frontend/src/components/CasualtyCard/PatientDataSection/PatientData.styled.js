// src/components/CasualtyCard/PatientDataSection/PatientData.styled.js
import { styled, Box, SimpleGrid, Heading, FormLabel, Input, Select, Textarea, FormErrorMessage, FormHelperText, Divider, Checkbox, RadioGroup, Radio, HStack, VStack, Flex, Icon, Text } from '@chakra-ui/react';

// --- Базові стилі з попереднього PatientData.styles.js ---
const styles = {
    sectionContainer: {},
    grid: { columns: { base: 1, md: 2 }, spacingX: { base: 4, md: 6 }, spacingY: { base: 5, md: 6 } },
    blockHeading: { fontSize: 'xl', fontWeight: 'semibold', mb: 5, mt: 8, pb: 2, borderBottomWidth: '1px', borderColor: 'gray.200' },
    formLabel: { fontWeight: 'medium', fontSize: 'sm', mb: 1.5, color: 'gray.700', display: 'flex', alignItems: 'center' },
    // Перейменовано з inputSize/inputStyles для ясності
    inputBaseStyles: {
        // ...commonInputSize, // Застосовуємо базовий розмір
        borderColor: 'gray.300', // Додамо базовий колір рамки
        _hover: {
            borderColor: 'gray.400', // Зміна рамки при наведенні
        },
        _placeholder: { // Стилізація плейсхолдера для всіх інпутів
             color: 'gray.500',
        },
        // Не додаємо focusBorderColor тут, щоб дозволити Chakra UI використовувати колір теми
    },
    selectPlaceholder: { color: 'gray.500' }, // Залишимо для sx пропса, бо _placeholder для Select працює інакше
    radioGroup: { mt: 2 },
    radio: {},
    checkbox: { fontWeight: 'medium' },
    errorMessage: { color: 'red.600', fontSize: 'sm', mt: 1.5 },
    requiredAsterisk: { color: 'red.500', ml: 1, fontSize: 'sm', userSelect: 'none' }, // Додано fontSize та userSelect
    divider: { my: 8, borderColor: 'gray.300' },
    helperText: { fontSize: 'xs', color: 'gray.500', mt: 1.5 },
    tooltipIcon: { ml: 2, color: 'gray.400', fontSize: 'md', cursor: 'help', _hover: { color: 'gray.600' } },
    unknownCheckboxContainer: { gridColumn: '1 / -1', mb: 6, p: 4, bg: 'blue.50', borderRadius: 'md', borderWidth: '1px', borderColor: 'blue.100' },
    militaryGroupContainer: { p: 4, borderWidth: '1px', borderColor: 'gray.200', borderRadius: 'md', mb: 4, bg: 'gray.50' },
    militaryGroupHeading: { size: "sm", color: "gray.600", gridColumn: "1 / -1", mb: 3, fontWeight: "medium" },
    dateTimeContainer: { flexDirection: { base: 'column', sm: 'row' }, gap: { base: 4, sm: 3 }, alignItems: 'start' },
    allergyGroupContainer: { p: 4, borderWidth: '1px', borderColor: 'gray.200', borderRadius: 'md', bg: 'white' }, // Додано для групи алергій
};

// --- Створюємо стилізовані компоненти ---

export const SectionContainer = styled(Box, { baseStyle: styles.sectionContainer });
export const FormGrid = styled(SimpleGrid, { baseStyle: styles.grid });
export const BlockHeading = styled(Heading, { baseStyle: styles.blockHeading });
export const StyledFormLabel = styled(FormLabel, { baseStyle: styles.formLabel });
export const StyledError = styled(FormErrorMessage, { baseStyle: styles.errorMessage });
export const StyledHelper = styled(FormHelperText, { baseStyle: styles.helperText });
export const SectionDivider = styled(Divider, { baseStyle: styles.divider });
export const StyledCheckbox = styled(Checkbox, { baseStyle: styles.checkbox });
export const StyledRadio = styled(Radio, { baseStyle: styles.radio });
export const StyledRadioGroup = styled(RadioGroup, { baseStyle: styles.radioGroup });
export const StyledHStack = styled(HStack, { baseStyle: {} });
export const StyledVStack = styled(VStack, { baseStyle: {} });
export const StyledFlex = styled(Flex, { baseStyle: {} });

// Стилізовані інпути
export const StyledInput = styled(Input, { baseStyle: styles.inputBaseStyles });
export const StyledSelect = styled(Select, {
    baseStyle: {
        ...styles.inputBaseStyles,
        // Не додаємо _placeholder тут, використаємо sx prop для Select
    }
});
export const StyledTextarea = styled(Textarea, { baseStyle: styles.inputBaseStyles });

// Спеціалізовані контейнери
export const UnknownContainer = styled(Box, { baseStyle: styles.unknownCheckboxContainer });
export const MilitaryContainer = styled(Box, { baseStyle: styles.militaryGroupContainer });
export const MilitaryHeading = styled(Heading, { baseStyle: styles.militaryGroupHeading });
export const AllergyContainer = styled(Box, { baseStyle: styles.allergyGroupContainer });

// Допоміжні стилізовані компоненти
export const RequiredAsteriskText = styled(Text, { baseStyle: styles.requiredAsterisk });
export const InfoIcon = styled(Icon, { baseStyle: styles.tooltipIcon });