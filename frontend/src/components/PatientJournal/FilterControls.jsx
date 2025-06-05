import React from 'react';
import {
    Box, Heading, VStack, Input, InputGroup, InputLeftElement, Icon,
    SimpleGrid, Select, InputRightElement, IconButton
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { TRIAGE_CATEGORIES_OPTIONS, GENDER_OPTIONS } from '../PatientCard/patientCardConstants'; // Assuming this path is correct

// STATUS_OPTIONS_FOR_FILTER should be defined here or imported if it's used elsewhere
const STATUS_OPTIONS_FOR_FILTER = [
    { value: '', label: 'Всі статуси' },
    { value: 'Pending', label: 'Очікує' },
    { value: 'PreHospitalActive', label: 'Долікарняний (Активна)' },
    { value: 'PreHospitalFinalized', label: 'Долікарняний (Завершено)' },
    { value: 'HospitalCareActive', label: 'Госпітальний (Активна)' },
    { value: 'HospitalCareFinalized', label: 'Госпітальний (Завершено)' },
    { value: 'Closed', label: 'Закрита' },
    { value: 'Archived', label: 'Архівна' },
];


function FilterControls({
    searchTerm,
    onSearchTermChange,
    filterTriageCategory,
    onFilterTriageCategoryChange,
    filterStatus,
    onFilterStatusChange,
    filterGender,
    onFilterGenderChange,
    styles // Pass the main styles object
}) {
    return (
        <Box
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={styles.borderColor}
            bg={styles.cardBg}
            boxShadow="sm"
        >
            <Heading as="h3" size="sm" mb={4} color={styles.textColor}>Пошук та фільтрація</Heading>
            <VStack spacing={3} align="stretch">
                <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none" children={<Icon as={SearchIcon} color="gray.500" />} />
                    <Input
                        type="text"
                        placeholder="Пошук за ID, ПІБ, віком, скаргами..."
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        borderRadius="md" bg={styles.cardBg}
                    />
                    {searchTerm && (
                        <InputRightElement>
                            <IconButton
                                aria-label="Очистити пошук"
                                icon={<CloseIcon />}
                                size="xs"
                                variant="ghost"
                                onClick={() => onSearchTermChange('')}
                            />
                        </InputRightElement>
                    )}
                </InputGroup>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                    <Select
                        size="sm"
                        placeholder="Всі категорії тріажу"
                        value={filterTriageCategory}
                        onChange={(e) => onFilterTriageCategoryChange(e.target.value)}
                        bg={styles.cardBg} borderColor={styles.borderColor} borderRadius="md"
                    >
                        {TRIAGE_CATEGORIES_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                    <Select
                        size="sm"
                        value={filterStatus} // No placeholder, "Всі статуси" is the first option
                        onChange={(e) => onFilterStatusChange(e.target.value)}
                        bg={styles.cardBg} borderColor={styles.borderColor} borderRadius="md"
                    >
                        {STATUS_OPTIONS_FOR_FILTER.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                    <Select
                        size="sm"
                        placeholder="Будь-яка стать"
                        value={filterGender}
                        onChange={(e) => onFilterGenderChange(e.target.value)}
                        bg={styles.cardBg} borderColor={styles.borderColor} borderRadius="md"
                    >
                        {GENDER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                </SimpleGrid>
            </VStack>
        </Box>
    );
}

export default FilterControls;