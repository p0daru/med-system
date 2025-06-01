// frontend/src/components/PatientJournal/PatientJournal.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Heading, Text, Spinner, VStack, HStack, Button, SimpleGrid, Tag,
    Input, InputGroup, InputLeftElement, Icon, useDisclosure, useToast,
    Tooltip, IconButton, Flex, Kbd, Circle, useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, RepeatIcon, TimeIcon, InfoOutlineIcon, WarningTwoIcon, ViewIcon } from '@chakra-ui/icons';
import { getAllTraumaRecords, deleteTraumaRecord as apiDeleteTraumaRecord } from '../../services/traumaRecord.api';
import ConfirmationModal from '../UI/ConfirmationModal';
import { format, parseISO, formatDistanceToNowStrict, differenceInYears } from 'date-fns';
import { uk } from 'date-fns/locale';
import { TRIAGE_CATEGORIES_OPTIONS } from '../PatientCard/patientCardConstants'; // Переконайтесь, що шлях правильний

// Імпорт стилів
import { useJournalStyles } from './journalStyles';

// Утиліти для форматування дати (без змін)
const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: uk });
    } catch (e) { return 'Невірно'; }
};
const formatFullDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: uk });
    } catch (e) { return 'Невірно'; }
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd.MM.yyyy', { locale: uk });
    } catch (e) { return 'Невірно'; }
};


function PatientJournal() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();

    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const [recordToDelete, setRecordToDelete] = useState(null);

    const styles = useJournalStyles(); // Використовуємо хук для отримання стилів

    const fetchRecords = useCallback(async (showToast = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllTraumaRecords();
            const fetchedData = Array.isArray(response.data) ? response.data : [];
            setRecords(fetchedData);
            if (showToast) {
                toast({ title: "Журнал оновлено", status: "success", duration: 2000, isClosable: true, position: "top-right" });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Не вдалося завантажити записи';
            setError(errorMessage);
            if (showToast) {
                 toast({ title: "Помилка оновлення", description: errorMessage, status: "error", duration: 5000, isClosable: true, position: "top-right" });
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const filteredRecords = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        if (!lowercasedFilter) return records;

        return records.filter(item => {
            const cardId = item.cardId?.toLowerCase() || '';
            const incidentDate = item.incidentDateTime ? formatDate(item.incidentDateTime) : '';
            const description = `${item.complaints || ''} ${item.mechanismOfInjuryDetailed || ''} ${item.exposureDetails || ''}`.toLowerCase();
            const patientFullName = item.patientInfo?.patientFullName?.toLowerCase() || '';
            const triage = item.triageCategory?.toLowerCase() || '';
            const mongoId = item._id?.toLowerCase() || '';
            const responsible = item.medicalTeamResponsible?.toLowerCase() || '';

            return (
                cardId.includes(lowercasedFilter) ||
                incidentDate.includes(lowercasedFilter) ||
                description.includes(lowercasedFilter) ||
                patientFullName.includes(lowercasedFilter) ||
                triage.includes(lowercasedFilter) ||
                mongoId.includes(lowercasedFilter) ||
                responsible.includes(lowercasedFilter)
            );
        });
    }, [searchTerm, records]);

    const handleDeleteClick = (record) => {
        setRecordToDelete(record);
        onDeleteModalOpen();
    };

    const confirmDelete = async () => {
        if (recordToDelete?._id) {
            try {
                await apiDeleteTraumaRecord(recordToDelete._id);
                toast({ title: "Запис видалено", description: `Картку "${getPatientDisplayName(recordToDelete, true)}" (#${recordToDelete.cardId}) успішно видалено.`, status: "success", duration: 3000, isClosable: true, position: "top-right" });
                fetchRecords();
            } catch (err) {
                toast({ title: "Помилка видалення", description: err.response?.data?.message || err.message || "Не вдалося видалити запис.", status: "error", duration: 5000, isClosable: true, position: "top-right" });
            } finally {
                onDeleteModalClose();
                setRecordToDelete(null);
            }
        }
    };

    const getTriageDisplay = (triageCategory) => {
        if (!triageCategory) return { scheme: "gray", label: "N/A", fullText: "Тріаж не вказано" };
        const categoryLower = triageCategory.toLowerCase();
        const triageOption = TRIAGE_CATEGORIES_OPTIONS.find(opt => opt.value === categoryLower);
        const fullText = triageOption ? triageOption.label : triageCategory;

        // Кольорові схеми для Chakra UI
        if (categoryLower === "red") return { scheme: "red", label: "III", fullText };
        if (categoryLower === "yellow") return { scheme: "yellow", label: "II", fullText };
        if (categoryLower === "green") return { scheme: "green", label: "I", fullText };
        if (categoryLower === "black") return { scheme: "blackAlpha", label: "IV", fullText }; // blackAlpha для кращого контрасту
        return { scheme: "gray", label: "?", fullText };
    };
    
    // ОСНОВНІ ЗМІНИ ТУТ: getPatientDisplayName
    const getPatientDisplayName = (record, forToast = false) => {
        if (!record) {
            const text = 'Запис відсутній';
            if (forToast) return text;
            return <Text as="span" fontStyle="italic" color={styles.subtleText}>{text}</Text>;
        }

        const patientInfo = record.patientInfo;
        const cardIdToDisplay = record.cardId || 'ID?';

        if (!patientInfo) {
            const text = `Дані пацієнта відсутні (Картка #${cardIdToDisplay})`;
            if (forToast) return text;
            return (
                <HStack spacing={1.5} alignItems="center" title={`Основна інформація про пацієнта для картки ${cardIdToDisplay} не заповнена.`}>
                    <Icon as={WarningTwoIcon} color="orange.400" boxSize="1em"/>
                    <Text as="span" fontWeight="medium" color={styles.headingColor} fontStyle="italic" noOfLines={1}>
                        Пацієнт не ідентиф.
                    </Text>
                </HStack>
            );
        }
        
        const { patientFullName, patientDateOfBirth, patientApproximateAge } = patientInfo;
        // Перевірка, чи ім'я фактично невідоме (пусте, містить "невідом" або складається з пробілів)
        const isEffectivelyUnknown = !patientFullName?.trim() || patientFullName.toLowerCase().includes('невідом');

        if (isEffectivelyUnknown) {
            const nameDisplay = patientFullName?.trim() || 'Невідомий(а)'; // Якщо є щось типу "Невідомий №1", покажемо це
            const ageDisplay = patientApproximateAge ? ` (орієнт. ${patientApproximateAge}р.)` : '';
            const fullTitle = `${nameDisplay}${ageDisplay}`.trim();

            if (forToast) return fullTitle;
            return (
                <HStack spacing={1.5} alignItems="center" title={fullTitle || "Інформація про особу пацієнта обмежена або відсутня."}>
                    <Icon as={QuestionOutlineIcon} color={styles.subtleText} boxSize="0.9em"/>
                    <Text as="span" fontWeight="medium" color={styles.headingColor} fontStyle="italic" noOfLines={1}>
                        {nameDisplay}
                        {patientApproximateAge && <Text as="span" fontSize="sm" color={styles.subtleText} ml={1.5}>{ageDisplay}</Text>}
                    </Text>
                </HStack>
            );
        }

        let ageInfo = '';
        if (patientDateOfBirth) { 
            try { 
                const age = differenceInYears(new Date(), parseISO(patientDateOfBirth)); 
                ageInfo = ` (${age}р.)`; 
            } catch (e) { /* ігноруємо помилку */ }
        } else if (patientApproximateAge) { 
            ageInfo = ` (~${patientApproximateAge}р.)`;
        }
        
        const name = patientFullName.trim(); // Завжди обрізаємо пробіли
        const fullTitle = `${name}${ageInfo}`.trim();

        if (forToast) return fullTitle;
        return (
            <Text as="span" color={styles.headingColor} fontWeight="semibold" noOfLines={2} title={fullTitle} lineHeight="short"> {/* Дозволяємо 2 рядки для довгих імен */}
                {name}
                {ageInfo && <Text as="span" fontSize="sm" color={styles.subtleText} ml={1.5}>{ageInfo}</Text>}
            </Text>
        );
    };

    if (loading && records.length === 0) {
        return (
            <Flex {...styles.stateFlexBase} {...styles.loadingStateFlex}>
                <VStack spacing={4}>
                    <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.700" color={(styles.secondaryAccentColor || "blue.500")} />
                    <Text color={styles.subtleText} fontSize="lg">Завантаження журналу...</Text>
                </VStack>
            </Flex>
        );
    }

    if (error && records.length === 0) {
        return (
            <Flex {...styles.stateFlexBase} {...styles.errorStateFlex}>
                <VStack spacing={4} bg={styles.cardBgColor} p={8} borderRadius="lg" boxShadow="md">
                    <Icon as={WarningTwoIcon} w={12} h={12} color="red.400" />
                    <Heading size="md" color={styles.headingColor}>Помилка завантаження</Heading>
                    <Text color={styles.subtleText}>{error}</Text>
                    <Button mt={4} onClick={() => fetchRecords(true)} leftIcon={<RepeatIcon />} colorScheme={(styles.secondaryAccentColor || "blue").split('.')[0]} variant="solid" borderRadius="lg">
                        Спробувати ще раз
                    </Button>
                </VStack>
            </Flex>
        );
    }

    return (
        <Box {...styles.pageContainer}>
            <Flex {...styles.headerFlex}>
                <Heading {...styles.pageTitle}>Журнал Пацієнтів</Heading>
                 <InputGroup {...styles.searchInputGroup}>
                    <InputLeftElement pointerEvents="none" children={<Icon as={SearchIcon} color="gray.500" />} />
                    <Input type="text" placeholder="Пошук за ID, ПІБ, датою..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} {...styles.searchInput}/>
                </InputGroup>
                <HStack {...styles.actionButtonsContainer}>
                    <Tooltip label="Оновити журнал (Ctrl+R)" placement="bottom" openDelay={500}>
                        <IconButton icon={<RepeatIcon />} aria-label="Оновити журнал" onClick={() => fetchRecords(true)} isLoading={loading} colorScheme={(styles.secondaryAccentColor || "blue").split('.')[0]} variant="outline" {...styles.actionButton} sx={styles.refreshButton} />
                    </Tooltip>
                    <Button as={RouterLink} to="/prehospital-care" colorScheme={(styles.primaryAccentColor || "purple").split('.')[0]} leftIcon={<AddIcon />} {...styles.actionButton} sx={styles.newCardButton} px={{base: 3, md: 4}}>
                        Нова Картка
                    </Button>
                </HStack>
            </Flex>

            {error && records.length > 0 && (
                 <Flex {...styles.errorBannerFlex}>
                    <Icon as={WarningTwoIcon} mr={3} boxSize={5}/>
                    <Text fontSize="sm">Не вдалося оновити дані: {error}. Відображаються останні завантажені.</Text>
                </Flex>
            )}

            {filteredRecords.length === 0 && !loading ? (
                <Flex {...styles.stateFlexBase} {...styles.emptyStateFlex}>
                    <VStack {...styles.emptyStateVStack}>
                        <Icon as={searchTerm ? SearchIcon : InfoOutlineIcon} w={16} h={16} color={styles.subtleText} />
                        <Heading size="lg" color={styles.headingColor} fontWeight="medium">{searchTerm ? "Нічого не знайдено" : "Журнал порожній"}</Heading>
                        <Text color={styles.subtleText} maxW="sm">{searchTerm ? "Спробуйте змінити параметри пошуку або очистити фільтр." : "Натисніть 'Нова Картка', щоб додати перший запис."}</Text>
                        {!searchTerm && (
                            <Button as={RouterLink} to="/prehospital-care" colorScheme={(styles.primaryAccentColor || "purple").split('.')[0]} mt={4} leftIcon={<AddIcon />} size="lg" borderRadius="lg">
                                Створити Першу Картку
                            </Button>
                        )}
                         {searchTerm && (
                            <Button onClick={() => setSearchTerm('')} variant="link" colorScheme={(styles.secondaryAccentColor || "blue").split('.')[0]} mt={2}>
                                Очистити пошук
                            </Button>
                        )}
                    </VStack>
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 2, xl: 3, "2xl": 4 }} spacing={{base: 4, md: 5 }}>
                    {filteredRecords.map((record) => {
                        const triageDisplay = getTriageDisplay(record.triageCategory);
                        const displayName = getPatientDisplayName(record);
                        const displayNameStringForTitle = getPatientDisplayName(record, true); // Для Tooltip
                        const primaryDescription = record.complaints || record.mechanismOfInjuryDetailed || record.exposureDetails || 'Опис відсутній.';
                        const incidentDateFormatted = record.incidentDateTime ? formatDate(record.incidentDateTime) : 'N/A';
                        const incidentTimeAgo = record.incidentDateTime ? timeAgo(record.incidentDateTime) : '';


                        return (
                        <Box key={record._id} {...styles.recordCard}>
                            {/* Основний контент картки */}
                            <Box flexGrow={1} display="flex" flexDirection="column">
                                <Flex {...styles.cardHeaderFlex}>
                                    <VStack align="flex-start" spacing={0.5} flexGrow={1} mr={2} overflow="hidden">
                                        <Tooltip label={displayNameStringForTitle} placement="top-start" openDelay={300} isDisabled={typeof displayName === 'string' && displayName.length < 25}>
                                            <Box {...styles.patientNameHeading} title={displayNameStringForTitle}>
                                                {displayName}
                                            </Box>
                                        </Tooltip>
                                        <Tooltip label={`ID Картки: ${record.cardId} | MongoDB ID: ${record._id}`} placement="bottom-start" openDelay={500}>
                                            <Text {...styles.cardIdText}>
                                                ID: <Kbd sx={styles.cardIdKbd}>{record.cardId || 'N/A'}</Kbd>
                                            </Text>
                                        </Tooltip>
                                    </VStack>
                                    <Tooltip label={triageDisplay.fullText} placement="top" openDelay={300}>
                                         <Circle 
                                            {...styles.triageCircle} 
                                            bg={`${triageDisplay.scheme}.500`} // Основний колір для фону кола
                                            borderColor={`${triageDisplay.scheme}.300`} // Світліший для обводки
                                        >
                                            <Text {...styles.triageCircleText} color={`${triageDisplay.scheme === 'yellow' ? 'gray.800' : 'white'}`}> {/* Чорний текст на жовтому для контрасту */}
                                                {triageDisplay.label}
                                            </Text>
                                        </Circle>
                                    </Tooltip>
                                </Flex>

                                <VStack {...styles.cardInfoVStack}>
                                    <HStack {...styles.cardInfoHStack}>
                                        <Icon as={TimeIcon} {...styles.cardInfoIcon}/>
                                        <Tooltip label={`Дата та час інциденту: ${formatFullDateTime(record.incidentDateTime)} (${incidentTimeAgo})`} placement="right" openDelay={300}>
                                            <Text {...styles.cardInfoText}>
                                                Інцидент: <Text {...styles.cardInfoData}>{incidentDateFormatted}</Text>
                                            </Text>
                                        </Tooltip>
                                    </HStack>
                                    <Text {...styles.cardDescriptionText} title={primaryDescription}>
                                        <Text as="span" fontWeight="medium" color={styles.subtleText}>Опис: </Text>{primaryDescription}
                                    </Text>
                                </VStack>
                            </Box>

                            {/* Футер з кнопками дій */}
                            <Flex {...styles.cardFooterFlex}>
                                <HStack spacing={1}>
                                  <Tooltip label="Переглянути деталі" placement="top" openDelay={300}>
                                    <IconButton
                                        icon={<ViewIcon />}
                                        aria-label="Переглянути картку"
                                        {...styles.cardActionButton}
                                        // ШЛЯХ ДЛЯ ПЕРЕГЛЯДУ - /trauma-records/:id/view
                                        onClick={(e) => { e.stopPropagation(); navigate(`/trauma-records/${record._id}/view`); }}
                                        colorScheme={(styles.secondaryAccentColor || "blue").split('.')[0]}
                                    />
                                </Tooltip>
                                <Tooltip label="Редагувати картку" placement="top" openDelay={300}>
                                    <IconButton
                                        icon={<EditIcon />}
                                        aria-label="Редагувати картку"
                                        {...styles.cardActionButton}
                                        // ШЛЯХ ДЛЯ РЕДАГУВАННЯ - /prehospital-care/:id
                                        onClick={(e) => { e.stopPropagation(); navigate(`/prehospital-care/${record._id}`); }}
                                        colorScheme="green"
                                    />
                                </Tooltip>
                                    <Tooltip label="Видалити картку" placement="top" openDelay={300}>
                                        <IconButton
                                            icon={<DeleteIcon />}
                                            aria-label="Видалити картку"
                                            {...styles.cardActionButton}
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(record); }}
                                            colorScheme={(styles.primaryAccentColor || "purple").split('.')[0]} // Використовуємо primaryAccent (purple) для видалення
                                        />
                                    </Tooltip>
                                </HStack>
                            </Flex>
                        </Box>
                        );
                    })}
                </SimpleGrid>
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                onConfirm={confirmDelete}
                title="Підтвердити Видалення"
                body={
                    recordToDelete ? (
                        <>Ви дійсно бажаєте видалити картку для <Text as="strong" color={(styles.primaryAccentColor || "purple").split('.')[0] + ".300"}>{getPatientDisplayName(recordToDelete, true)}</Text> (ID: <Kbd sx={styles.cardIdKbd}>{recordToDelete.cardId}</Kbd>)? Цю дію неможливо буде скасувати.</>
                    ) : "Підтвердити видалення?"
                }
                confirmButtonColorScheme={(styles.primaryAccentColor || "purple").split('.')[0]} // consistent with delete icon
                confirmButtonText="Видалити"
                cancelButtonText="Скасувати"
            />
        </Box>
    );
}

export default PatientJournal;