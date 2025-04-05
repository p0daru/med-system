// src/components/CasualtyCard/PatientDataSection/PatientData.styles.js

// Consistent Input/Select/Textarea styling
const commonInputStyles = {
    size: 'md', // Consistent size
    bg: 'white', // Ensure background for contrast
    _disabled: {
      bg: 'gray.100', // Slightly different disabled background
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    _placeholder: {
        color: 'black', // Slightly darker placeholder
    }
};

export const patientDataStyles = {
    // Section container
    sectionContainer: {
        // p: { base: 4, md: 0 }, // Parent should handle padding if needed
    },
    // Grid layout
    grid: {
        columns: { base: 1, md: 2 },
        spacingX: { base: 4, md: 6 },
        spacingY: { base: 5, md: 6 },
        alignItems: 'start', // Align items at the start of the grid cell vertically
    },
    // Block Headings
    blockHeading: {
        fontSize: { base: 'lg', md: 'xl' },
        fontWeight: 'semibold',
        mb: 6,
        mt: 8,
        pb: 2,
        borderBottomWidth: '1px',
        borderColor: 'gray.300',
        color: 'gray.700',
    },
    // Form Labels
    formLabel: {
        fontWeight: 'medium',
        fontSize: 'sm',
        mb: 1.5,
        color: 'gray.900',
        display: 'flex',
        alignItems: 'center', // Vertically align label text and icon
        gap: 1.5, // Add small gap between label text and icon
    },
    // Common Input Styles
    inputStyles: {
        ...commonInputStyles,
    },
    // Select Placeholder specific style
    selectPlaceholder: {
        color: 'gray.700',
    },
    // Radio/Checkbox specific styles
    radioGroup: {
        mt: 2,
    },
    radio: {
        // Default Chakra radio styles are usually fine
    },
    checkbox: {
        bg: "yellow",
        // Styles applied directly in component for clarity: fontWeight='medium'
        // Ensure vertical alignment if needed: alignItems: 'center' // Usually default
    },
    // Error Messages
    errorMessage: {
        color: 'red.600',
        fontSize: 'sm',
        mt: 1.5,
    },
    // Required Asterisk
    requiredAsterisk: {
        color: 'red.500',
        // ml: 1, // Replaced by gap in FormLabel's flex
        fontWeight: 'bold',
        display: 'inline-block', // Ensure it stays inline
    },
    // Divider
    divider: {
        my: 10,
        borderColor: 'gray.200',
    },
    // Tooltip Icon Style
    tooltipIcon: {
        color: 'gray.500',
        fontSize: 'md',
        cursor: 'help',
        verticalAlign: 'middle', // Helps align with text
        _hover: {
            color: 'gray.700',
        },
    },
    // Specific Layout Styles
    fullWidth: {
        gridColumn: { base: '1 / -1', md: 'span 2' },
    },
    // "Unknown" Checkbox Container
    unknownCheckboxContainer: {
        // gridColumn: '1 / -1', // No longer inside the grid
        mb: 6,
        p: 4,
        bg: 'blue.50',
        borderRadius: 'md',
        borderWidth: '1px',
        borderColor: 'blue.200',
    },
    // Military Details Group Container
    militaryGroupContainer: {
        p: 4,
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderRadius: 'md',
        bg: 'gray.50',
    },
    // Military Details Group Heading
    militaryGroupHeading: {
        size: "sm",
        color: "gray.600",
        mb: 4,
        fontWeight: "medium",
    },
    // Allergy Group Container
    allergyGroupContainer: {
        p: 4,
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderRadius: 'md',
        bg: 'white',
    },
};