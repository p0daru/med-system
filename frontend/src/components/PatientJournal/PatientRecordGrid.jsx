import React from 'react';
import { Box, SimpleGrid, Flex, Icon, Heading, Text, Button } from '@chakra-ui/react';
import { SearchIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import PatientRecordCard from './PatientRecordCard'; // Assuming this path

function PatientRecordGrid({
    records,
    isLoading, // This is for when records are being filtered/searched, not initial load
    searchActive, // Boolean indicating if search or filters are active
    onClearFilters,
    styles, // Pass the main styles object
    // Props for PatientRecordCard
    onCardClick,
    onEditClick,
    onDeleteClick,
    getTriageDisplay,
    getPatientDisplayName,
    getShortAbcdeSummary,
    formatDate,
    timeAgo,
    mapStatusToDisplay,
}) {
    if (records.length === 0 && !isLoading) {
        return (
            <Flex minH="40vh" w="100%" display="flex" alignItems="center" justifyContent="center" textAlign="center" direction="column" p={5}>
                <Icon as={searchActive ? SearchIcon : InfoOutlineIcon} w={16} h={16} color={styles.subtleText} mb={4} />
                <Heading size="md" color={styles.headingColor} mb={2}>
                    {searchActive ? "Нічого не знайдено" : "Журнал порожній"}
                </Heading>
                <Text color={styles.subtleText} mb={4}>
                    {searchActive ? "Спробуйте змінити параметри пошуку або фільтрації." : "Створіть нову картку пацієнта."}
                </Text>
                {searchActive &&
                    <Button
                        onClick={onClearFilters}
                        variant="link"
                        colorScheme={styles.secondaryAccentColor?.split('.')[0] || 'teal'}
                    >
                        Очистити всі фільтри та пошук
                    </Button>
                }
            </Flex>
        );
    }

    return (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{ base: 4, md: 5 }}>
            {records.map((record) => (
                <PatientRecordCard
                    key={record._id}
                    record={record}
                    onCardClick={() => onCardClick(record._id)}
                    onEditClick={() => onEditClick(record._id)}
                    onDeleteClick={() => onDeleteClick(record)} 
                    styles={styles}
                    getTriageDisplay={getTriageDisplay}
                    getPatientDisplayName={getPatientDisplayName}
                    getShortAbcdeSummary={getShortAbcdeSummary}
                    formatDate={formatDate}
                    timeAgo={timeAgo}
                    mapStatusToDisplay={mapStatusToDisplay}
                />
            ))}
        </SimpleGrid>
    );
}

export default PatientRecordGrid;