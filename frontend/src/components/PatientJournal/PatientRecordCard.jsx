import React from 'react';
import {
    Box, Text, VStack, HStack, Icon, Tooltip, IconButton, Flex, Kbd, Circle, Tag, useColorModeValue
} from '@chakra-ui/react';
import {
    EditIcon, DeleteIcon, ViewIcon, AtSignIcon, InfoOutlineIcon, CalendarIcon
} from '@chakra-ui/icons';

function PatientRecordCard({
    record,
    onCardClick,
    onEditClick,
    onDeleteClick,
    styles, // Pass the main styles object
    getTriageDisplay,
    getPatientDisplayName,
    getShortAbcdeSummary,
    formatDate,
    timeAgo,
    mapStatusToDisplay
}) {
    const triageDisplay = getTriageDisplay(record.triageCategory);
    const statusDisplay = mapStatusToDisplay(record.status);

    return (
        <Box
            {...styles.recordCard}
            display="flex"
            flexDirection="column"
            onClick={onCardClick}
        >
            <VStack spacing={3} align="stretch" flexGrow={1}>
                <Flex justifyContent="space-between" alignItems="flex-start">
                    <Box flex="1" minW="0" mr={2}>
                        {getPatientDisplayName(record)}
                    </Box>
                    <Tooltip label={triageDisplay.fullText} placement="top" openDelay={300}>
                        <Circle
                            {...styles.triageCircle}
                            bg={triageDisplay.color || `${triageDisplay.scheme}.500`}
                            borderColor={useColorModeValue(triageDisplay.color ? `${triageDisplay.scheme}.300` : `${triageDisplay.scheme}.300`, triageDisplay.color ? `${triageDisplay.scheme}.600` : `${triageDisplay.scheme}.600`)}
                        >
                            <Text {...styles.triageCircleText} color={triageDisplay.scheme === 'yellow' || triageDisplay.scheme === 'green' ? 'black' : 'white'}>
                                {triageDisplay.label}
                            </Text>
                        </Circle>
                    </Tooltip>
                </Flex>

                <HStack {...styles.cardInfoHStack} title={`ID Картки: ${record.cardId}`}>
                    <Icon as={InfoOutlineIcon} {...styles.cardInfoIcon} />
                    <Text {...styles.cardInfoText}>ID: <Kbd {...styles.cardIdKbd}>{record.cardId || 'N/A'}</Kbd></Text>
                </HStack>

                <HStack {...styles.cardInfoHStack} title={`Дата та час інциденту: ${record.incidentDateTime ? new Date(record.incidentDateTime).toLocaleString('uk-UA') : 'N/A'}`}>
                    <Icon as={CalendarIcon} {...styles.cardInfoIcon} />
                    <Text {...styles.cardInfoText}>{formatDate(record.incidentDateTime)} ({timeAgo(record.incidentDateTime)})</Text>
                </HStack>

                <Box title={`Показники ABCDE: ${getShortAbcdeSummary(record)}`}>
                    <Text fontWeight="medium" fontSize="sm" color={styles.headingColor} mb="2px">ABCDE:</Text>
                    <Text {...styles.cardInfoText} noOfLines={2} lineHeight="short" whiteSpace="normal">
                        {getShortAbcdeSummary(record)}
                    </Text>
                </Box>

                <HStack {...styles.cardInfoHStack} title={`Відповідальний: ${record.medicalTeamResponsible}`}>
                    <Icon as={AtSignIcon} {...styles.cardInfoIcon} />
                    <Text {...styles.cardInfoText} noOfLines={1}>
                        {record.medicalTeamResponsible || <Text as="span" fontStyle="italic">Не вказано</Text>}
                    </Text>
                </HStack>
            </VStack>

            <Flex {...styles.cardFooterFlex}>
                <Tag size="sm" colorScheme={statusDisplay.colorScheme} variant="subtle">
                    {statusDisplay.label}
                </Tag>
                <HStack spacing={1}>
                    <Tooltip label="Переглянути деталі" placement="top" openDelay={300}>
                        <IconButton
                            icon={<ViewIcon />}
                            aria-label="Переглянути картку"
                            {...styles.cardActionButton}
                            onClick={(e) => { e.stopPropagation(); onCardClick(); }} // Re-use onCardClick or pass specific onViewClick
                            colorScheme={styles.secondaryAccentColor?.split('.')[0] || 'teal'}
                        />
                    </Tooltip>
                    <Tooltip label="Редагувати картку" placement="top" openDelay={300}>
                        <IconButton
                            icon={<EditIcon />}
                            aria-label="Редагувати картку"
                            {...styles.cardActionButton}
                            onClick={(e) => { e.stopPropagation(); onEditClick(); }}
                            colorScheme="green"
                        />
                    </Tooltip>
                    <Tooltip label="Видалити картку" placement="top" openDelay={300}>
                        <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Видалити картку"
                            {...styles.cardActionButton}
                            onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
                            colorScheme="red"
                        />
                    </Tooltip>
                </HStack>
            </Flex>
        </Box>
    );
}

export default PatientRecordCard;