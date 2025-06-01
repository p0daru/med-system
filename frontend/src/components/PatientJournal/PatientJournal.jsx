// frontend/src/components/PatientJournal/PatientJournal.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box, Heading, Text, Spinner, VStack, HStack, Button, SimpleGrid, Tag,
    Input, InputGroup, InputLeftElement, Icon, useDisclosure, useToast,
    Tooltip, IconButton, Flex, Kbd, useColorModeValue, Circle
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon, RepeatIcon, TimeIcon, InfoOutlineIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { getAllTraumaRecords, deleteTraumaRecord as apiDeleteTraumaRecord } from '../../services/traumaRecord.api';
import ConfirmationModal from '../UI/ConfirmationModal';
import { format, parseISO, formatDistanceToNowStrict } from 'date-fns';
import { uk } from 'date-fns/locale';

// Утиліта для форматування часу "тому"
const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: uk });
    } catch (e) {
        console.error("Error formatting time ago:", e);
        return 'Невірно';
    }
};

// Утиліта для форматування дати і часу
const formatFullDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: uk });
    } catch (e) {
        console.error("Error formatting full date time:", e);
        return 'Невірно';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd.MM.yyyy', { locale: uk });
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Невірно';
    }
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

    const cardBg = useColorModeValue("white", "gray.750");
    const cardHoverBg = useColorModeValue("gray.50", "gray.700"); // Не використовується напряму, але може бути корисним
    const subtleText = useColorModeValue("gray.600", "gray.400");
    const headingColor = useColorModeValue("gray.700", "gray.200");
    const primaryAccentColor = "red.500";
    const secondaryAccentColor = "blue.500";

    const fetchRecords = useCallback(async (showToast = false) => {
        setLoading(true);
        try {
            const response = await getAllTraumaRecords();
            const fetchedData = response.data || [];
            setRecords(fetchedData);
            setError(null);
            if (showToast) {
                toast({ title: "Журнал оновлено", status: "success", duration: 2000, isClosable: true, position: "top-right" });
            }
        } catch (err) {
            console.error("Error fetching trauma records:", err);
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
            const internalId = item.internalCardId?.toLowerCase() || '';
            const incidentDate = item.incidentDateTime ? formatDate(item.incidentDateTime) : '';
            const reason = item.reasonForCall?.toLowerCase() || '';
            const lastName = item.patientInfo?.lastName?.toLowerCase() || '';
            const firstName = item.patientInfo?.firstName?.toLowerCase() || '';
            const triage = item.triageCategory?.toLowerCase() || '';
            const mongoId = item._id?.toLowerCase() || '';
            const tempPatientId = item.patientInfo?.tempPatientId?.toLowerCase() || '';

            return (
                internalId.includes(lowercasedFilter) ||
                incidentDate.includes(lowercasedFilter) ||
                reason.includes(lowercasedFilter) ||
                lastName.includes(lowercasedFilter) ||
                firstName.includes(lowercasedFilter) ||
                `${lastName} ${firstName}`.trim().includes(lowercasedFilter) ||
                `${firstName} ${lastName}`.trim().includes(lowercasedFilter) ||
                triage.includes(lowercasedFilter) ||
                mongoId.includes(lowercasedFilter) ||
                tempPatientId.includes(lowercasedFilter)
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
                toast({ title: "Запис видалено", description: `Картку "${getPatientDisplayName(recordToDelete, true)}" видалено.`, status: "success", duration: 3000, isClosable: true, position: "top-right" });
                fetchRecords();
            } catch (err) {
                toast({ title: "Помилка видалення", description: err.response?.data?.message || err.message, status: "error", duration: 5000, isClosable: true, position: "top-right" });
            } finally {
                onDeleteModalClose();
                setRecordToDelete(null);
            }
        }
    };

    const getTriageStyles = (triageCategory) => {
        if (!triageCategory) return { scheme: "gray", iconColor: "gray.500" };
        const categoryLower = triageCategory.toLowerCase();
        if (categoryLower.includes("червоний") || categoryLower.includes("red")) return { scheme: "red", iconColor: "red.500" };
        if (categoryLower.includes("жовтий") || categoryLower.includes("yellow")) return { scheme: "yellow", iconColor: "yellow.500" };
        if (categoryLower.includes("зелений") || categoryLower.includes("green")) return { scheme: "green", iconColor: "green.500" };
        if (categoryLower.includes("чорний") || categoryLower.includes("black")) return { scheme: "blackAlpha", iconColor: "blackAlpha.600" };
        return { scheme: "gray", iconColor: "gray.500" };
    };

    const getPatientDisplayName = (record, forToast = false) => {
        if (!record || !record.patientInfo) {
            return record?.internalCardId || 'Дані пацієнта відсутні';
        }
        const isEffectivelyUnknown = record.patientInfo.isUnknown || (!record.patientInfo.firstName && !record.patientInfo.lastName);

        if (isEffectivelyUnknown) {
            const tempId = record.patientInfo.tempPatientId;
            if (forToast) { // Для toast повертаємо простий рядок
                return tempId ? `Невід. ${tempId}` : (record.internalCardId || 'Невідомий');
            }
            return tempId ? (
                <HStack spacing={1} alignItems="center">
                    <Icon as={WarningTwoIcon} color="orange.400" boxSize={3.5}/>
                    <Text as="span" fontStyle="italic">{tempId}</Text>
                </HStack>
            ) : (record.internalCardId || 'Невідомий');
        }
        return `${record.patientInfo.lastName || ''} ${record.patientInfo.firstName || ''}`.trim();
    };

    const getStatusTag = (status) => {
        let colorScheme = "gray";
        if (status === 'PreHospital') colorScheme = "orange";
        if (status === 'Completed') colorScheme = "green";
        if (status === 'Cancelled') colorScheme = "purple";
        return <Tag size="sm" colorScheme={colorScheme} variant="subtle">{status || 'N/A'}</Tag>;
    };

    if (loading && records.length === 0) {
        return (
            <Flex justify="center" align="center" minHeight="calc(100vh - 200px)">
                <VStack spacing={4}>
                    <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color={secondaryAccentColor} />
                    <Text color={subtleText}>Завантаження журналу...</Text>
                </VStack>
            </Flex>
        );
    }

    if (error && records.length === 0) {
        return (
            <Flex justify="center" align="center" minHeight="calc(100vh - 200px)" textAlign="center" p={5}>
                 <VStack spacing={4} bg={cardBg} p={8} borderRadius="lg" boxShadow="md">
                    <Icon as={WarningTwoIcon} w={12} h={12} color="red.400" />
                    <Heading size="md" color={headingColor}>Помилка завантаження</Heading>
                    <Text color={subtleText}>{error}</Text>
                    <Button
                        mt={4}
                        onClick={() => fetchRecords(true)}
                        leftIcon={<RepeatIcon />}
                        colorScheme="blue"
                        variant="solid"
                    >
                        Спробувати ще раз
                    </Button>
                </VStack>
            </Flex>
        );
    }

    return (
        <Box p={{ base: 2, sm:3, md: 5 }} maxW="1600px" mx="auto">
            <Flex
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ base: "stretch", md: "center" }}
                mb={6}
                gap={{base: 4, md: 3}}
            >
                <Heading as="h1" size="lg" color={headingColor}>
                    Журнал Догоспітальних Карт
                </Heading>
                 <InputGroup maxW={{ base: "100%", md: "400px" }} order={{base: 2, md: 1}}>
                    <InputLeftElement pointerEvents="none">
                        <Icon as={SearchIcon} color="gray.400" />
                    </InputLeftElement>
                    <Input
                        type="text"
                        placeholder="Пошук (ПІБ, ID, дата...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="filled"
                        bg={useColorModeValue("gray.50", "gray.800")}
                        _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
                        _focus={{ bg: useColorModeValue("white", "gray.750"), borderColor: secondaryAccentColor, boxShadow: `0 0 0 1px ${secondaryAccentColor}`}}
                        borderRadius="md"
                    />
                </InputGroup>
                <HStack spacing={3} order={{base: 1, md: 2}}>
                    <Tooltip label="Оновити журнал (Ctrl+R)" placement="bottom" openDelay={500}>
                        <IconButton
                            icon={<RepeatIcon />}
                            aria-label="Оновити журнал"
                            onClick={() => fetchRecords(true)}
                            isLoading={loading}
                            colorScheme={secondaryAccentColor.split('.')[0]}
                            variant="outline"
                            size="md"
                        />
                    </Tooltip>
                    <Button
                        as={RouterLink}
                        to="/prehospital-care"
                        colorScheme={primaryAccentColor.split('.')[0]}
                        leftIcon={<AddIcon />}
                        boxShadow="sm"
                        _hover={{ boxShadow: "md", bg: useColorModeValue("red.600", "red.400") }}
                        size="md"
                    >
                        Нова Картка
                    </Button>
                </HStack>
            </Flex>

            {error && records.length > 0 && (
                <Flex bg="red.50" p={3} borderRadius="md" mb={4} alignItems="center" borderWidth="1px" borderColor="red.200">
                    <Icon as={WarningTwoIcon} color="red.500" mr={3} boxSize={5}/>
                    <Text color="red.700" fontSize="sm">
                        Не вдалося оновити дані: {error}. Відображаються останні завантажені.
                    </Text>
                </Flex>
            )}

            {filteredRecords.length === 0 && !loading ? (
                <Flex justify="center" align="center" minHeight="calc(100vh - 300px)" p={5}>
                    <VStack spacing={5} bg={cardBg} p={{base: 6, md:10}} borderRadius="xl" boxShadow="lg" textAlign="center">
                        <Icon as={searchTerm ? SearchIcon : InfoOutlineIcon} w={16} h={16} color={subtleText} />
                        <Heading size="md" color={headingColor} fontWeight="medium">
                            {searchTerm ? "Нічого не знайдено" : "Журнал порожній"}
                        </Heading>
                        <Text color={subtleText} maxW="sm">
                            {searchTerm ? "Спробуйте змінити параметри пошуку або очистити фільтр." : "Натисніть 'Нова Картка', щоб додати перший запис до журналу."}
                        </Text>
                        {!searchTerm && (
                            <Button as={RouterLink} to="/prehospital-care" colorScheme={primaryAccentColor.split('.')[0]} mt={4} leftIcon={<AddIcon />} size="lg">
                                Створити Першу Картку
                            </Button>
                        )}
                         {searchTerm && (
                            <Button onClick={() => setSearchTerm('')} variant="link" colorScheme={secondaryAccentColor.split('.')[0]} mt={2}>
                                Очистити пошук
                            </Button>
                        )}
                    </VStack>
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={{base: 4, md: 6}}>
                    {filteredRecords.map((record) => {
                        const triageStyle = getTriageStyles(record.triageCategory);
                        const displayName = getPatientDisplayName(record);
                        const displayNameString = getPatientDisplayName(record, true); // Для title

                        return (
                        <Box
                            key={record._id}
                            bg={cardBg}
                            p={5}
                            borderRadius="xl"
                            boxShadow="base"
                            transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
                            _hover={{
                                boxShadow: "xl",
                                borderColor: primaryAccentColor, // Буде видно, якщо задати borderWidth
                                transform: "translateY(-4px) scale(1.01)",
                                cursor: "pointer"
                            }}
                            onClick={(e) => {
                                if (e.target.closest('button, a')) { // Перевірка на кнопки або посилання
                                    return;
                                }
                                navigate(`/prehospital-care/${record._id}`);
                            }}
                        >
                            <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                                <VStack align="flex-start" spacing={0.5} flexGrow={1} mr={2}> {/* Додано flexGrow і mr */}
                                     <Heading as="h3" size="sm" noOfLines={1} title={displayNameString} color={headingColor} fontWeight="semibold">
                                        {displayName}
                                    </Heading>
                                    <Tooltip label={`ID Картки: ${record.internalCardId} | MongoDB ID: ${record._id}`} placement="bottom-start" openDelay={500}>
                                        <Text fontSize="xs" color={subtleText} display="flex" alignItems="center">
                                            {record.internalCardId}
                                        </Text>
                                    </Tooltip>
                                </VStack>
                                <Tooltip label={record.triageCategory || 'Тріаж не вказано'} placement="top" openDelay={300}>
                                    <Circle size="24px" bg={`${triageStyle.scheme}.100`} borderWidth="2px" borderColor={`${triageStyle.scheme}.500`}>
                                        <Text fontSize="xs" fontWeight="bold" color={`${triageStyle.scheme}.700`}>
                                            {record.triageCategory?.substring(0,1).toUpperCase() || '?'}
                                        </Text>
                                    </Circle>
                                </Tooltip>
                            </Flex>

                            <VStack spacing={2.5} align="flex-start" mb={4}>
                                <HStack>
                                    <Icon as={TimeIcon} color={subtleText} boxSize={4}/>
                                    <Tooltip label={`Дата та час інциденту: ${formatFullDateTime(record.incidentDateTime)}`} placement="right" openDelay={300}>
                                        <Text fontSize="sm" color={subtleText}>
                                            Інцидент: <Text as="span" fontWeight="medium" color={headingColor}>{formatDate(record.incidentDateTime)}</Text>
                                        </Text>
                                    </Tooltip>
                                </HStack>
                                <Text fontSize="sm" color={headingColor} noOfLines={2} title={record.reasonForCall} minHeight={{ base: "auto", md:"2.6em" }}>
                                    <Text as="span" color={subtleText}>Причина: </Text>{record.reasonForCall || 'Не вказано'}
                                </Text>
                                <HStack justifyContent="space-between" w="full">
                                    {getStatusTag(record.status)}
                                    <Tooltip label={`Створено: ${formatFullDateTime(record.createdAt)}`} placement="left" openDelay={300}>
                                        <Text fontSize="xs" color={subtleText}>
                                            {timeAgo(record.createdAt)}
                                        </Text>
                                    </Tooltip>
                                </HStack>
                            </VStack>

                            <Flex justifyContent="flex-end" borderTopWidth="1px" borderColor={useColorModeValue("gray.200", "gray.600")} pt={3} mt={1}>
                                <HStack spacing={2}>
                                    <Tooltip label="Редагувати картку" placement="top" openDelay={300}>
                                        <IconButton
                                            icon={<EditIcon />}
                                            aria-label="Редагувати картку"
                                            size="sm"
                                            colorScheme={secondaryAccentColor.split('.')[0]}
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/prehospital-care/${record._id}`); }}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Видалити картку" placement="top" openDelay={300}>
                                        <IconButton
                                            icon={<DeleteIcon />}
                                            aria-label="Видалити картку"
                                            size="sm"
                                            colorScheme={primaryAccentColor.split('.')[0]}
                                            variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(record); }}
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
                        <>Ви дійсно бажаєте видалити картку для <Text as="strong">{getPatientDisplayName(recordToDelete, true)}</Text> (ID: <Kbd>{recordToDelete.internalCardId}</Kbd>)? Цю дію неможливо буде скасувати.</>
                    ) : "Підтвердити видалення?"
                }
                confirmButtonColorScheme={primaryAccentColor.split('.')[0]}
                confirmButtonText="Видалити"
                cancelButtonText="Скасувати"
            />
        </Box>
    );
}

export default PatientJournal;