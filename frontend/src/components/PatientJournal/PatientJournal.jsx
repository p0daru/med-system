import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Spinner, VStack, useDisclosure, useToast,
    Alert, AlertIcon, AlertTitle, AlertDescription,
    Flex, Kbd, Text, Icon, Heading, useColorModeValue,
} from '@chakra-ui/react';
import {
    RepeatIcon, WarningTwoIcon, QuestionOutlineIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, formatDistanceToNowStrict, differenceInYears } from 'date-fns';
import { uk } from 'date-fns/locale';

import { getAllTraumaRecords, deleteTraumaRecord as apiDeleteTraumaRecord, getMultipleTraumaRecordDetails, createMultipleTraumaRecords} from '../../services/traumaRecord.api';
import { performAhpTriage } from '../../services/ahpTriage';
import ConfirmationModal from '../UI/ConfirmationModal';
import { TRIAGE_CATEGORIES_OPTIONS, GENDER_OPTIONS, AIRWAY_STATUS_OPTIONS } from '../PatientCard/patientCardConstants';

// Нові компоненти з правильними розширеннями
import PatientJournalHeader from './PatientJournalHeader';
import FilterControls from './FilterControls';
import PatientRecordGrid from './PatientRecordGrid';
import TriageControls from './TriageControls'; // <-- ВИПРАВЛЕНО: Імпортуємо .jsx
import TriageResultsModal from './TriageResultsModal'; // <-- ВИПРАВЛЕНО: Імпортуємо .jsx

// Функції форматування (без змін)
const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try { return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: uk }); }
    catch (e) { console.warn(`timeAgo parsing error for ${dateString}:`, e); return 'Невірно'; }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'dd.MM.yyyy', { locale: uk }); }
    catch (e) { console.warn(`formatDate parsing error for ${dateString}:`, e); return 'Невірно'; }
};

const mapStatusToDisplay = (statusKey) => {
    const statusMap = {
        Pending: { label: 'Очікує', colorScheme: 'gray' },
        PreHospitalActive: { label: 'Долікарняний (Активна)', colorScheme: 'blue' },
        PreHospitalFinalized: { label: 'Долікарняний (Завершено)', colorScheme: 'green' },
        HospitalCareActive: { label: 'Госпітальний (Активна)', colorScheme: 'orange' },
        HospitalCareFinalized: { label: 'Госпітальний (Завершено)', colorScheme: 'teal' },
        Closed: { label: 'Закрита', colorScheme: 'purple' },
        Archived: { label: 'Архівна', colorScheme: 'pink' },
    };
    return statusMap[statusKey] || { label: statusKey || 'Невідомий', colorScheme: 'gray' };
};


function PatientJournal() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    // Стан для фільтрів
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTriageCategory, setFilterTriageCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterGender, setFilterGender] = useState('');

    // Стан для видалення
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const [recordToDelete, setRecordToDelete] = useState(null);

     // Новий стан для МАІ тріажу
    const [triageCategory, setTriageCategory] = useState('red');
    const [isTriageLoading, setIsTriageLoading] = useState(false);
    const [triageResults, setTriageResults] = useState([]);
    const { isOpen: isTriageModalOpen, onOpen: onTriageModalOpen, onClose: onTriageModalClose } = useDisclosure();

    // === ПОЧАТОК ЗМІН ===

    // 1. Викличте всі хуки на верхньому рівні
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
    const subtleTextColor = useColorModeValue("gray.600", "gray.400");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const primaryAccentColor = useColorModeValue("purple.500", "purple.300");
    const pageContainerBg = useColorModeValue("gray.50", "gray.800"); // Окремо для pageContainer
    const kbdBg = useColorModeValue("gray.100", "gray.600"); // Окремо для kbd

    // 2. Використовуйте ці змінні всередині useMemo
    const styles = useMemo(() => ({
        pageContainer: { p: { base: 3, md: 6 }, bg: pageContainerBg, minH: "calc(100vh - 60px)" },
        pageTitle: { size: { base: "lg", md: "xl" }, color: textColor },
        recordCard: { bg: cardBg, p: { base: 3, md: 4 }, borderRadius: "lg", boxShadow: "sm", _hover: { boxShadow: "md", cursor: "pointer", transform: "translateY(-2px)" }, transition: "all 0.2s ease-in-out" },
        patientNameHeading: { fontSize: "lg", fontWeight: "semibold", color: textColor, noOfLines: 1 },
        cardIdText: { fontSize: "xs", color: "gray.500" },
        cardIdKbd: { fontSize: "xs", px: 1.5, py: 0.5, borderRadius: "sm", bg: kbdBg },
        triageCircle: { size: "32px", borderWidth: "2px" },
        triageCircleText: { fontWeight: "bold", fontSize: "sm" },
        cardInfoHStack: { alignItems: "center" },
        cardInfoIcon: { mr: 1.5, color: subtleTextColor, boxSize: "1em" },
        cardInfoText: { fontSize: "sm", color: subtleTextColor, noOfLines: 1 },
        cardFooterFlex: { justifyContent: "space-between", alignItems: "center", pt: 3, mt: "auto", borderTopWidth: "1px", borderColor: borderColor },
        cardActionButton: { size: "sm", variant: "ghost" },
        subtleText: subtleTextColor,
        headingColor: textColor,
        primaryAccentColor: primaryAccentColor,
        borderColor: borderColor,
        cardBg: cardBg,
        textColor: textColor,
        pageContainerBg: pageContainerBg, // Додамо для TriageControls
    }), [textColor, subtleTextColor, borderColor, primaryAccentColor, cardBg, pageContainerBg, kbdBg]);

    const fetchRecords = useCallback(async (showToast = false) => {
        setLoading(true); setError(null);
        try {
            const response = await getAllTraumaRecords();
            setRecords(Array.isArray(response.data) ? response.data : []);
            if (showToast) toast({ title: "Журнал оновлено", status: "success", duration: 2000, isClosable: true, position: "top-right" });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Не вдалося завантажити записи';
            setError(errorMessage);
            console.error("Fetch records error:", err);
            if (showToast) toast({ title: "Помилка оновлення", description: errorMessage, status: "error", duration: 5000, isClosable: true, position: "top-right" });
        } finally { setLoading(false); }
    }, [toast]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const filteredRecords = useMemo(() => {
        let tempRecords = records ? [...records] : [];
        if (filterTriageCategory) tempRecords = tempRecords.filter(r => r.triageCategory?.toLowerCase() === filterTriageCategory.toLowerCase());
        if (filterStatus) tempRecords = tempRecords.filter(r => r.status === filterStatus);
        if (filterGender) tempRecords = tempRecords.filter(r => r.patientInfo?.gender?.toLowerCase() === filterGender.toLowerCase());
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        if (lowercasedSearchTerm) {
            tempRecords = tempRecords.filter(item => {
                const patientInfo = item.patientInfo || {};
                return (
                    item.cardId?.toLowerCase().includes(lowercasedSearchTerm) ||
                    patientInfo.patientFullName?.toLowerCase().includes(lowercasedSearchTerm) ||
                    (patientInfo.patientApproximateAge && patientInfo.patientApproximateAge.toString().includes(lowercasedSearchTerm)) ||
                    mapStatusToDisplay(item.status).label.toLowerCase().includes(lowercasedSearchTerm)
                );
            });
        }
        return tempRecords;
    }, [records, searchTerm, filterTriageCategory, filterStatus, filterGender]);

    const handleCardClick = (recordId) => navigate(`/trauma-records/${recordId}/view`);
    const handleEditClick = (recordId) => navigate(`/prehospital-care/${recordId}`);
   const handleDeleteClick = (record) => {
    // === ДІАГНОСТИЧНИЙ ЛОГ ===
    console.log("handleDeleteClick викликано з записом:", record);
    // Перевіряємо, чи є в об'єкті _id
    if (!record || !record._id) {
        console.error("ПОМИЛКА: Спроба видалити запис без _id!", record);
        toast({
            title: "Помилка інтерфейсу",
            description: "Не вдалося отримати ID запису для видалення.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
        return; // Зупиняємо виконання, якщо ID відсутній
    }
    // ===========================

    setRecordToDelete(record);
    onDeleteModalOpen();
};

    const confirmDelete = async () => {
        if (!recordToDelete?._id) return;
        try {
            await apiDeleteTraumaRecord(recordToDelete._id);
            toast({ title: "Запис видалено", status: "success", duration: 3000, isClosable: true });
            fetchRecords();
        } catch (err) {
            toast({ title: "Помилка видалення", description: err.response?.data?.message || err.message, status: "error", duration: 5000, isClosable: true });
        } finally {
            onDeleteModalClose();
            setRecordToDelete(null);
        }
    };

    const handleClearFiltersAndSearch = () => {
        setSearchTerm('');
        setFilterTriageCategory('');
        setFilterStatus('');
        setFilterGender('');
    };

     const handleRunTriage = async () => { // Зробили функцію асинхронною
        if (!triageCategory) {
            toast({ title: "Оберіть категорію", description: "Для ранжування необхідно обрати тріажну категорію.", status: "warning", duration: 3000, isClosable: true });
            return;
        }

        setIsTriageLoading(true);
        setTriageResults([]);

        // Крок 1: Фільтруємо записи зі стану, щоб отримати їх ID
        const patientStubs = records.filter(
            (record) => record.triageCategory?.toLowerCase() === triageCategory.toLowerCase()
        );

        if (patientStubs.length === 0) {
            toast({ title: "Немає пацієнтів", description: `Не знайдено пацієнтів у категорії "${TRIAGE_CATEGORIES_OPTIONS.find(opt => opt.value === triageCategory)?.label || triageCategory}".`, status: "info", duration: 4000, isClosable: true });
            setIsTriageLoading(false);
            onTriageModalOpen();
            return;
        }

        try {
            // Крок 2: Витягуємо ID пацієнтів
            const patientIds = patientStubs.map(p => p._id);

            // Крок 3: Робимо API-запит для отримання ПОВНИХ даних для цих пацієнтів
            const response = await getMultipleTraumaRecordDetails(patientIds);
            const fullPatientData = response.data; // Тепер тут масив з повними об'єктами

            console.log("Отримано повні дані для тріажу:", fullPatientData); // Важливий лог для перевірки!

            // Крок 4: Запускаємо тріаж з повними, а не скороченими даними
            const result = performAhpTriage(fullPatientData);

            // Крок 5: Формуємо результати для модального вікна
            const populatedResults = result.rankedPatients.map(rankedPatient => ({
                ...rankedPatient,
                // Тепер шукаємо пацієнта в масиві з повними даними
                patient: fullPatientData.find(r => r._id === rankedPatient.patientId)
            }));
            
            setTriageResults(populatedResults);
            onTriageModalOpen();

        } catch (error) {
            console.error("Помилка під час виконання МАІ тріажу:", error);
            toast({
                title: "Помилка розрахунку тріажу",
                description: error.response?.data?.message || error.message || "Сталася невідома помилка.",
                status: "error",
                duration: 7000,
                isClosable: true
            });
        } finally {
            setIsTriageLoading(false);
        }
    };

    const getTriageDisplay = useCallback((triageCategory) => {
        if (!triageCategory) return { scheme: "gray", label: "?", fullText: "N/A", color: "gray.500" };
        const triageOption = TRIAGE_CATEGORIES_OPTIONS.find(opt => opt.value === triageCategory.toLowerCase());
        if (triageOption) {
            return {
                label: triageOption.label.match(/([IV]+)/)?.[1] || triageOption.label.charAt(0).toUpperCase(),
                fullText: triageOption.label,
                color: triageOption.color
            };
        }
        return { label: "?", fullText: triageCategory, color: "gray.500" };
    }, []);

    const getPatientDisplayName = useCallback((record, forToast = false) => {
        if (!record) return forToast ? 'Запис відсутній' : <Text fontStyle="italic" color={styles.subtleText}>Запис відсутній</Text>;
        const patientInfo = record.patientInfo || {};
        if (!patientInfo.patientFullName?.trim() && !patientInfo.patientApproximateAge && !patientInfo.patientDateOfBirth) {
            const text = `Неідентифікований (Картка #${record.cardId || 'ID?'})`;
            if (forToast) return text;
            return (
                <Flex alignItems="center" title={text}>
                    <Icon as={QuestionOutlineIcon} color="orange.400" boxSize="0.9em" mr={1.5}/>
                    <Text as="span" fontWeight="medium" color={styles.headingColor} fontStyle="italic" noOfLines={1}>Неідентифікований</Text>
                </Flex>
            );
        }
        const name = patientInfo.patientFullName?.trim() || 'Невідомий пацієнт';
        let ageInfo = '';
        if (patientInfo.patientDateOfBirth) {
            try { ageInfo = ` (${differenceInYears(new Date(), parseISO(patientInfo.patientDateOfBirth))}р.)`; } catch (e) { /* ignore */ }
        } else if (patientInfo.patientApproximateAge) {
            ageInfo = ` (~${patientInfo.patientApproximateAge}р.)`;
        }
        const fullTitle = `${name}${ageInfo}`.trim();
        if (forToast) return fullTitle;
        return (
            <Text as="span" color={styles.headingColor} fontWeight="semibold" noOfLines={1} title={fullTitle} lineHeight="short">
                {name}
                {ageInfo && <Text as="span" fontSize="sm" color={styles.subtleText} ml={1.5}>{ageInfo}</Text>}
            </Text>
        );
    }, [styles.subtleText, styles.headingColor]);

    const getShortAbcdeSummary = useCallback((record) => {
        if (!record) return 'Дані ABCDE відсутні';
        const parts = [];
        const airwayLabel = AIRWAY_STATUS_OPTIONS.find(o => o.value === record.airwayStatus)?.label;
        if (record.airwayStatus) parts.push(`A: ${airwayLabel || record.airwayStatus}`);
        let bPart = [];
        if (record.breathingRate) bPart.push(`ЧД ${record.breathingRate}`);
        if (record.breathingSaturation || record.oxygenSaturation) bPart.push(`SpO2 ${record.breathingSaturation || record.oxygenSaturation}%`);
        if (bPart.length > 0) parts.push(`B: ${bPart.join(', ')}`);
        let cPart = [];
        if (record.pulseRate) cPart.push(`ЧСС ${record.pulseRate}`);
        if (record.bloodPressureSystolic) cPart.push(`АТ ${record.bloodPressureSystolic}/${record.bloodPressureDiastolic || '?'}`);
        if (cPart.length > 0) parts.push(`C: ${cPart.join(', ')}`);
        let gcsDisplayValue = record.gcsTotal;
        if (gcsDisplayValue === undefined || gcsDisplayValue === null) {
            if (record.glasgowComaScaleEye && record.glasgowComaScaleVerbal && record.glasgowComaScaleMotor) {
                const gcsE = parseInt(record.glasgowComaScaleEye) || 0;
                const gcsV = parseInt(record.glasgowComaScaleVerbal) || 0;
                const gcsM = parseInt(record.glasgowComaScaleMotor) || 0;
                if (gcsE > 0 || gcsV > 0 || gcsM > 0) { gcsDisplayValue = gcsE + gcsV + gcsM; }
            }
        }
        if (gcsDisplayValue !== undefined && gcsDisplayValue !== null) parts.push(`D: ШКГ ${gcsDisplayValue}`);
        return parts.length > 0 ? parts.join(' | ') : 'Дані ABCDE неповні';
    }, []);

    // ... (код для loading та error станів без змін)
    if (loading && records.length === 0) {
        return <Flex justifyContent="center" alignItems="center" minH="80vh"><Spinner size="xl" thickness="4px" color={styles.primaryAccentColor} /></Flex>;
    }
    if (error && records.length === 0) {
        return (
            <Flex justifyContent="center" alignItems="center" minH="80vh" direction="column" p={5}>
                <Icon as={WarningTwoIcon} w={16} h={16} color="red.400" mb={4} />
                <Heading size="md" color={styles.headingColor} mb={2}>Помилка завантаження</Heading>
                <Text color={styles.subtleText} mb={4}>{error}</Text>
                <Button onClick={() => fetchRecords(true)} leftIcon={<RepeatIcon />}>Спробувати ще раз</Button>
            </Flex>
        );
    }

    return (
        <Box {...styles.pageContainer}>
            <VStack spacing={5} align="stretch" mb={6}>
                <PatientJournalHeader
                    loading={loading && records.length > 0}
                    onRefresh={() => fetchRecords(true)}
                    styles={styles}
                />
                <Flex 
                    direction={{ base: "column", lg: "row" }} 
                    gap={5}
                    alignItems={{ base: "stretch", lg: "flex-start" }}
                >
                    <FilterControls
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        filterTriageCategory={filterTriageCategory}
                        onFilterTriageCategoryChange={setFilterTriageCategory}
                        filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus}
                        filterGender={filterGender}
                        onFilterGenderChange={setFilterGender}
                        styles={styles}
                    />
                    <TriageControls
                        category={triageCategory}
                        onCategoryChange={setTriageCategory}
                        onRunTriage={handleRunTriage}
                        isLoading={isTriageLoading}
                        styles={styles} // <-- ВИПРАВЛЕНО: Додано пропс styles
                    />
                </Flex>
            </VStack>

            {error && records.length > 0 && (
                <Alert status="warning" borderRadius="md" mb={4}>
                    <AlertIcon />
                    <AlertTitle>Помилка оновлення!</AlertTitle>
                    <AlertDescription>Не вдалося оновити дані: {error}. Відображаються останні завантажені.</AlertDescription>
                </Alert>
            )}
            
            <PatientRecordGrid
                records={filteredRecords}
                isLoading={loading && records.length > 0}
                searchActive={!!(searchTerm || filterTriageCategory || filterStatus || filterGender)}
                onClearFilters={handleClearFiltersAndSearch}
                styles={styles}
                onCardClick={handleCardClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                getTriageDisplay={getTriageDisplay}
                getPatientDisplayName={getPatientDisplayName}
                getShortAbcdeSummary={getShortAbcdeSummary}
                formatDate={formatDate}
                timeAgo={timeAgo}
                mapStatusToDisplay={mapStatusToDisplay}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                onConfirm={confirmDelete}
                title="Підтвердити Видалення"
                body={recordToDelete ? (<Text>Ви дійсно бажаєте видалити картку для <Text as="strong">{getPatientDisplayName(recordToDelete, true)}</Text> (ID: <Kbd>{recordToDelete.cardId}</Kbd>)?</Text>) : "Підтвердити?"}
                confirmButtonText="Видалити"
                confirmButtonColorScheme="red"
            />
            
            <TriageResultsModal
                isOpen={isTriageModalOpen}
                onClose={() => { onTriageModalClose(); setTriageResults([]); }}
                rankedPatients={triageResults}
                getPatientDisplayName={getPatientDisplayName}
                styles={styles} // <-- ВИПРАВЛЕНО: Додано пропс styles
            />
        </Box>
    );
}

export default PatientJournal;