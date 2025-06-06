import React from 'react';
import { Box, Heading, Flex, Select, Button, Icon, Text } from '@chakra-ui/react';
import { FaClipboardList } from 'react-icons/fa';
import { TRIAGE_CATEGORIES_OPTIONS } from '../PatientCard/patientCardConstants';

const TriageControls = ({
    category,
    onCategoryChange,
    onRunTriage,
    isLoading,
    styles // Цей пропс тепер буде коректно переданий
}) => {
    const triageOptions = TRIAGE_CATEGORIES_OPTIONS.filter(opt => opt.value);

    return (
        <Box
            p={4}
            bg={styles.cardBg}
            borderRadius="lg"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={styles.borderColor}
            flex="1"
            minW={{ base: "100%", lg: "300px" }}
            maxW={{ base: "100%", lg: "450px" }}
        >
            <Heading size="sm" color={styles.headingColor} mb={3}>
                Розширений тріаж (МАІ)
            </Heading>
            <Text fontSize="sm" color={styles.subtleText} mb={4}>
                Ранжування пацієнтів у межах однієї категорії за пріоритетністю на основі комплексного аналізу.
            </Text>
            <Flex direction={{ base: 'column', md: 'row' }} gap={3} align="center">
                <Select
    value={category}
    onChange={(e) => onCategoryChange(e.target.value)}
    placeholder="Оберіть категорію"
    focusBorderColor={styles.primaryAccentColor}
    bg={styles.pageContainerBg} // <-- Використовуємо передане значення
>
                    {triageOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <Button
                    colorScheme="purple"
                    onClick={onRunTriage}
                    isLoading={isLoading}
                    loadingText="Розрахунок..."
                    leftIcon={<Icon as={FaClipboardList} />}
                    w={{ base: "100%", md: "auto" }}
                    flexShrink={0}
                >
                    Ранжувати
                </Button>
            </Flex>
        </Box>
    );
};

export default TriageControls;