import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Spinner, VStack, useDisclosure, useToast,
    Alert, AlertIcon, AlertTitle, AlertDescription,
    Flex, Kbd, Text, Icon, Heading, useColorModeValue, List, ListItem, Circle, OrderedList
} from '@chakra-ui/react';
import {
    RepeatIcon, WarningTwoIcon, QuestionOutlineIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, formatDistanceToNowStrict, differenceInYears } from 'date-fns';
import { uk } from 'date-fns/locale';

import { getAllTraumaRecords, deleteTraumaRecord as apiDeleteTraumaRecord } from '../../services/traumaRecord.api';
import ConfirmationModal from '../UI/ConfirmationModal';
import { TRIAGE_CATEGORIES_OPTIONS, GENDER_OPTIONS, AIRWAY_STATUS_OPTIONS } from '../PatientCard/patientCardConstants';
// import { runAhpTriageForCategory, AHP_CRITERIA_NAMES } from './triageService'; 

// Import new components
import PatientJournalHeader from './PatientJournalHeader';
import FilterControls from './FilterControls';
import PatientRecordGrid from './PatientRecordGrid';
// import AhpTriageControls from './AhpTriageControls'; 

// Функції форматування (can be moved to a utils file if preferred)
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTriageCategory, setFilterTriageCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const toast = useToast();

    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const [recordToDelete, setRecordToDelete] = useState(null);

    // State для МАІ
    const [triageCategoryForAHP, setTriageCategoryForAHP] = useState('red');
    const [isAhpLoading, setIsAhpLoading] = useState(false);
    const [ahpRankedPatients, setAhpRankedPatients] = useState([]);
    const [ahpCriteriaWeights, setAhpCriteriaWeights] = useState([]);
    const [ahpConsistencyOk, setAhpConsistencyOk] = useState(true);
    const [ahpConsistencyRatio, setAhpConsistencyRatio] = useState(null);

    // Disclosure для модального вікна AHP (передається в AhpTriageControls)
    const disclosureAhpModal = useDisclosure();

    // Styles - these will be passed down
    const cardBg = useColorModeValue("white", "gray.700");
    const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
    const subtleTextColor = useColorModeValue("gray.600", "gray.400");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const primaryAccentColor = useColorModeValue("purple.500", "purple.300");
    const secondaryAccentColor = useColorModeValue("teal.500", "teal.300");

    const styles = useMemo(() => ({
        pageContainer: { p: { base: 3, md: 6 }, bg: useColorModeValue("gray.50", "gray.800"), minH: "calc(100vh - 60px)" },
        pageTitle: { size: { base: "lg", md: "xl" }, color: textColor },
        actionButton: { borderRadius: "md", size: "sm" },
        recordCard: { bg: cardBg, p: { base: 3, md: 4 }, borderRadius: "lg", boxShadow: "sm", _hover: { boxShadow: "md", cursor: "pointer", transform: "translateY(-2px)" }, transition: "all 0.2s ease-in-out" },
        patientNameHeading: { fontSize: "lg", fontWeight: "semibold", color: textColor, noOfLines: 1 },
        cardIdText: { fontSize: "xs", color: "gray.500" },
        cardIdKbd: { fontSize: "xs", px: 1.5, py: 0.5, borderRadius: "sm", bg: useColorModeValue("gray.100", "gray.600") },
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
        secondaryAccentColor: secondaryAccentColor,
        borderColor: borderColor, // Explicitly add for FilterControls
        cardBg: cardBg, // Explicitly add for FilterControls
        textColor: textColor // Explicitly add for FilterControls
    }), [textColor, subtleTextColor, borderColor, primaryAccentColor, secondaryAccentColor, cardBg]);


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
        if (filterTriageCategory) {
            tempRecords = tempRecords.filter(
                (record) => record.triageCategory?.toLowerCase() === filterTriageCategory.toLowerCase()
            );
        }
        if (filterStatus) {
            tempRecords = tempRecords.filter(record => record.status === filterStatus);
        }
        if (filterGender) {
            tempRecords = tempRecords.filter(record => record.patientInfo?.gender?.toLowerCase() === filterGender.toLowerCase());
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase().trim();
        if (lowercasedSearchTerm) {
            tempRecords = tempRecords.filter(item => {
                const patientInfo = item.patientInfo || {};
                return (
                    item.cardId?.toLowerCase().includes(lowercasedSearchTerm) ||
                    patientInfo.patientFullName?.toLowerCase().includes(lowercasedSearchTerm) ||
                    (patientInfo.patientApproximateAge && patientInfo.patientApproximateAge.toString().includes(lowercasedSearchTerm)) ||
                    item.medicalTeamResponsible?.toLowerCase().includes(lowercasedSearchTerm) ||
                    (item.complaints && item.complaints.toLowerCase().includes(lowercasedSearchTerm)) ||
                    (item.mechanismOfInjuryDetailed && item.mechanismOfInjuryDetailed.toLowerCase().includes(lowercasedSearchTerm)) ||
                    // (item.exposureDetails && item.exposureDetails.toLowerCase().includes(lowercasedSearchTerm)) ||
                    mapStatusToDisplay(item.status).label.toLowerCase().includes(lowercasedSearchTerm) ||
                    formatDate(item.incidentDateTime)?.includes(lowercasedSearchTerm)
                );
            });
        }
        return tempRecords;
    }, [records, searchTerm, filterTriageCategory, filterStatus, filterGender]);

    const handleDeleteClick = (e, record) => { // e might not be needed if stopPropagation is handled in card
        // e.stopPropagation(); // If called from card, stopPropagation should be there
        setRecordToDelete(record);
        onDeleteModalOpen();
    };

    const confirmDelete = async () => {
        if (!recordToDelete?._id) return;
        try {
            await apiDeleteTraumaRecord(recordToDelete._id);
            toast({ title: "Запис видалено", description: `Картку для "${getPatientDisplayName(recordToDelete, true)}" видалено.`, status: "success", duration: 3000, isClosable: true, position: "top-right" });
            fetchRecords();
        } catch (err) {
            toast({ title: "Помилка видалення", description: err.response?.data?.message || err.message, status: "error", duration: 5000, isClosable: true, position: "top-right" });
        }
        finally {
            onDeleteModalClose();
            setRecordToDelete(null);
        }
    };

    const getTriageDisplay = useCallback((triageCategory) => {
        if (!triageCategory) return { scheme: "gray", label: "?", fullText: "N/A", color: "gray.500" };
        const categoryLower = triageCategory.toLowerCase();
        const triageOption = TRIAGE_CATEGORIES_OPTIONS.find(opt => opt.value === categoryLower);
        if (triageOption) {
            return {
                scheme: triageOption.value,
                label: triageOption.label.match(/([IV]+)/)?.[1] || triageOption.label.charAt(0).toUpperCase(),
                fullText: triageOption.label,
                color: triageOption.color
            };
        }
        return { scheme: "gray", label: "?", fullText: triageCategory, color: "gray.500" };
    }, []);

    const getPatientDisplayName = useCallback((record, forToast = false) => {
        if (!record) {
            return forToast ? 'Запис відсутній' : <Text fontStyle="italic" color={styles.subtleText}>Запис відсутній</Text>;
        }
        const patientInfo = record.patientInfo || {};
        const cardIdToDisplay = record.cardId || 'ID?';
        if (!patientInfo.patientFullName?.trim() && !patientInfo.patientApproximateAge && !patientInfo.patientDateOfBirth) {
            const text = `Неідентифікований (Картка #${cardIdToDisplay})`;
            if (forToast) return text;
            return (
                <Flex alignItems="center" title={text}> {/* Changed HStack to Flex for potential icon issue */}
                    <Icon as={QuestionOutlineIcon} color="orange.400" boxSize="0.9em" mr={1.5}/>
                    <Text as="span" fontWeight="medium" color={styles.headingColor} fontStyle="italic" noOfLines={1}>
                        Неідентифікований
                    </Text>
                </Flex>
            );
        }
        const name = patientInfo.patientFullName?.trim() || (patientInfo.gender ? (GENDER_OPTIONS.find(g => g.value === patientInfo.gender)?.label || 'Невідомий(а)') + ' пацієнт' : 'Невідомий(а)');
        let ageInfo = '';
        if (patientInfo.patientDateOfBirth) {
            try {
                const age = differenceInYears(new Date(), parseISO(patientInfo.patientDateOfBirth));
                ageInfo = ` (${age}р.)`;
            } catch (e) { /* ігноруємо */ }
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
    }, [styles.subtleText, styles.headingColor]); // Ensure styles is a dependency

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
                if (gcsE > 0 || gcsV > 0 || gcsM > 0) {
                    gcsDisplayValue = gcsE + gcsV + gcsM;
                }
            }
        }
        if (gcsDisplayValue !== undefined && gcsDisplayValue !== null) parts.push(`D: ШКГ ${gcsDisplayValue}`);
        return parts.length > 0 ? parts.join(' | ') : 'Дані ABCDE неповні';
    }, []);

    const handleCardClick = (recordId) => {
        navigate(`/trauma-records/${recordId}/view`);
    };
    const handleEditClick = (recordId) => {
        navigate(`/prehospital-care/${recordId}`);
    };

    const handleClearFiltersAndSearch = () => {
        setSearchTerm('');
        setFilterTriageCategory('');
        setFilterStatus('');
        setFilterGender('');
    };

    const handleRunAhpTriage = () => {
        if (!triageCategoryForAHP) {
            toast({ title: "Оберіть категорію", description: "Будь ласка, оберіть категорію тріажу для сортування.", status: "warning", duration: 3000, isClosable: true, position: "top-right" });
            return;
        }

        setIsAhpLoading(true);
        setAhpRankedPatients([]);
        setAhpCriteriaWeights([]);
        setAhpConsistencyOk(true);
        setAhpConsistencyRatio(null);
        
        const patientsForAhp = records.filter(
            (record) => record.triageCategory?.toLowerCase() === triageCategoryForAHP.toLowerCase()
        );

        if (patientsForAhp.length === 0) {
            toast({ title: "Немає пацієнтів", description: `Не знайдено пацієнтів у категорії "${TRIAGE_CATEGORIES_OPTIONS.find(opt => opt.value === triageCategoryForAHP)?.label || triageCategoryForAHP}" для тріажу.`, status: "info", duration: 4000, isClosable: true, position: "top-right" });
            setIsAhpLoading(false);
            disclosureAhpModal.onOpen();
            return;
        }
        
        try {
            const ahpResult = runAhpTriageForCategory(patientsForAhp);
            
            setAhpRankedPatients(ahpResult.rankedPatients || []);
            setAhpCriteriaWeights(ahpResult.criteriaWeights || []);
            setAhpConsistencyOk(ahpResult.consistencyOk !== undefined ? ahpResult.consistencyOk : true);
            setAhpConsistencyRatio(ahpResult.consistencyRatio);

            if (ahpResult.consistencyOk === false) {
                 toast({
                    title: "Попередження: Узгодженість МАІ",
                    description: `Матриця порівняння критеріїв може бути неузгодженою (CR > 0.1). Результати тріажу слід інтерпретувати з обережністю. CR = ${ahpResult.consistencyRatio?.toFixed(3)}`,
                    status: "warning",
                    duration: 9000,
                    isClosable: true,
                    position: "top-right"
                });
            }
            disclosureAhpModal.onOpen();
        } catch (error) {
            console.error("[PatientJournal] Помилка під час виконання МАІ:", error);
            toast({ title: "Помилка розрахунку МАІ", description: `Сталася помилка: ${error.message || 'Невідома помилка сервісу тріажу.'}`, status: "error", duration: 7000, isClosable: true, position: "top-right" });
        } finally {
            setIsAhpLoading(false);
        }
    };

     if (loading && records.length === 0) {
        return <Flex justifyContent="center" alignItems="center" minH="80vh"><Spinner size="xl" thickness="4px" color={styles.primaryAccentColor} /></Flex>;
    }
    if (error && records.length === 0) {
        return (
            <Flex justifyContent="center" alignItems="center" minH="80vh" direction="column" p={5}>
                <Icon as={WarningTwoIcon} w={16} h={16} color="red.400" mb={4} />
                <Heading size="md" color={styles.headingColor} mb={2}>Помилка завантаження</Heading>
                <Text color={styles.subtleText} mb={4}>{error}</Text>
                <button onClick={() => fetchRecords(true)} style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon as={RepeatIcon} mr={2} />
                    Спробувати ще раз
                </button>
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
                {/* Розміщуємо FilterControls та AhpTriageControls в одному Flex контейнері */}
                <Flex 
                    direction={{ base: "column", lg: "row" }} 
                    gap={{ base: 4, md: 5 }}
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
                        styles={styles} // Передаємо styles
                    />
                    {/* <AhpTriageControls
                        records={records}
                        triageCategoryForAHP={triageCategoryForAHP}
                        onTriageCategoryForAHPChange={setTriageCategoryForAHP}
                        onRunAhpTriage={handleRunAhpTriage}
                        isAhpLoading={isAhpLoading}
                        ahpResults={{
                            rankedPatients: ahpRankedPatients,
                            criteriaWeights: ahpCriteriaWeights,
                            consistencyOk: ahpConsistencyOk,
                            consistencyRatio: ahpConsistencyRatio 
                        }}
                        disclosureAhpModal={disclosureAhpModal} // Передаємо весь об'єкт disclosure
                        getPatientDisplayName={getPatientDisplayName}
                        styles={styles}
                        // AHP_CRITERIA_NAMES не потрібен тут як prop, він використовується в AhpTriageControls з імпорту
                    /> */}
                </Flex>
            </VStack>

            {error && records.length > 0 && (
                <Alert status="warning" borderRadius="md" mb={4}>
                    <AlertIcon />
                    <AlertTitle mr={2}>Помилка оновлення!</AlertTitle>
                    <AlertDescription>Не вдалося оновити дані: {error}. Відображаються останні завантажені.</AlertDescription>
                </Alert>
            )}
            
            {/* PatientRecordGrid залишається тут */}
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

            {/* Модальне вікно AHP тепер є частиною AhpTriageControls, тому тут його не потрібно */}
        </Box>
    );
}

export default PatientJournal;