// src/components/CasualtyLog/CasualtyLog.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Heading, Button, useToast, Spinner, Text, Alert, AlertIcon, AlertTitle, AlertDescription, VStack, HStack,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td, Tag, IconButton, Tooltip,
    InputGroup, InputLeftElement, Input,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    useDisclosure,
    SimpleGrid, Divider, Badge, Flex
} from '@chakra-ui/react';

import ViewCasualtyModal from './ViewCasualtyModal';

import { AddIcon, EditIcon, RepeatIcon, SearchIcon, ViewIcon, DeleteIcon } from '@chakra-ui/icons';
// Переконайтесь, що шлях до API файлу правильний
import { getInjuredList, deleteInjured } from '../../services/injuredApi';
import { format, parseISO, isValid } from 'date-fns';
import { uk } from 'date-fns/locale';
import { debounce } from 'lodash'; // Імпортуємо debounce з lodash

// --- Helper Functions ---

// Функція для форматування дати і часу
const formatLogDateTime = (isoString) => {
    if (!isoString) return '-';
    try {
        const date = parseISO(isoString);
        if (!isValid(date)) {
            console.warn("Invalid date received for formatting:", isoString);
            return '-';
        }
        return format(date, 'dd.MM.yyyy HH:mm', { locale: uk });
    } catch (e) {
        console.error("Error formatting date for log:", isoString, e);
        return 'Помилка';
    }
};

// Функція для мапінгу пріоритету на колір Tag
const getPriorityColorScheme = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'невідкладна': return 'red';
        case 'пріоритетна': return 'orange';
        case 'звичайна': return 'green';
        default: return 'gray';
    }
};

// --- Main Component ---
function CasualtyLog() {
    const navigate = useNavigate();
    const toast = useToast();
    const [cards, setCards] = useState([]); // Список карток
    const [isLoading, setIsLoading] = useState(false); // Стан завантаження списку
    const [error, setError] = useState(null); // Помилка завантаження списку
    const [searchTerm, setSearchTerm] = useState(''); // Пошуковий термін

    // Стан та хуки для модального вікна Перегляду Деталей
    const { isOpen: isViewModalOpen, onOpen: onOpenViewModal, onClose: onCloseViewModal } = useDisclosure();
    const [selectedCardForView, setSelectedCardForView] = useState(null);

    // Стан та хуки для Діалогу Підтвердження Видалення
    const { isOpen: isDeleteDialogOpen, onOpen: onOpenDeleteDialog, onClose: onCloseDeleteDialog } = useDisclosure();
    const [cardIdToDelete, setCardIdToDelete] = useState(null); // ID картки для видалення
    const [isDeleting, setIsDeleting] = useState(false); // Стан процесу видалення
    const cancelRef = useRef(); // Референс для кнопки "Скасувати" в AlertDialog

    // --- Data Fetching Logic ---
    const fetchCards = useCallback(async (termToSearch, showToast = false) => {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching cards with search term: "${termToSearch}"`);
        try {
            const data = await getInjuredList(termToSearch); // Використовуємо переданий термін
            console.log("Received data from API:", data);
            // Сортування новіші перші, якщо бекенд не сортує
            const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
            setCards(sortedData); // Встановлюємо дані, перевіряючи чи це масив
            if (showToast) {
                 toast({ title: "Список оновлено", status: "success", duration: 1500, position: "top-right" });
            }
        } catch (err) {
            console.error("Failed to fetch casualty list:", err);
            const errorMessage = err.response?.data?.message || err.message || "Не вдалося завантажити дані журналу."; // Отримуємо повідомлення з відповіді API, якщо є
            setError(errorMessage);
            if(showToast) { // Показуємо тост лише при ручному оновленні/пошуку
               toast({ title: "Помилка завантаження", description: errorMessage, status: "error", duration: 5000 });
            }
        } finally {
            setIsLoading(false);
        }
    }, [toast]); // searchTerm виключено, бо він використовується в debounced

    // --- Debounced Fetch Function ---
    const debouncedFetchCards = useMemo(
        () => debounce((term) => {
            fetchCards(term, false); // false - не показувати тост при авто-пошуку
        }, 500), // Затримка 500 мс
        [fetchCards] // Залежність від оригінальної fetchCards
    );

    // --- Effects ---
    useEffect(() => {
        fetchCards(''); // Початкове завантаження без терміну
    }, [fetchCards]); // Залежність лише від fetchCards

    useEffect(() => {
        debouncedFetchCards(searchTerm);
        // Функція очищення для скасування debounce
        return () => {
            debouncedFetchCards.cancel();
        };
    }, [searchTerm, debouncedFetchCards]); // Залежність від searchTerm та debounced функції

    // --- Event Handlers ---
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleRefreshOrSearch = () => {
        fetchCards(searchTerm, true); // true - показати тост
    };

    const handleViewDetails = (card) => {
        setSelectedCardForView(card);
        onOpenViewModal();
    };

    const handleOpenDeleteConfirmation = (id) => {
        setCardIdToDelete(id);
        onOpenDeleteDialog();
    };

    const handleConfirmDelete = async () => {
        if (!cardIdToDelete) return;
        setIsDeleting(true);
        try {
            await deleteInjured(cardIdToDelete);
            toast({ title: "Запис видалено", status: "success", duration: 3000, isClosable: true });
            setCards(prevCards => prevCards.filter(card => card._id !== cardIdToDelete)); // Оновлюємо список локально
        } catch (err) {
            console.error("Failed to delete casualty card:", err);
            const errorMessage = err.response?.data?.message || err.message || "Не вдалося видалити картку.";
            toast({ title: "Помилка видалення", description: errorMessage, status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsDeleting(false);
            setCardIdToDelete(null);
            onCloseDeleteDialog();
        }
    };

    // --- Render Logic ---
    return (
        <Box p={{ base: 2, sm: 4, md: 6 }} w="100%" minH="calc(100vh - 80px)"> {/* Намагаємось зайняти весь екран */}
            <VStack spacing={4} align="stretch">
                {/* --- Заголовок та Кнопки --- */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                    <Heading as="h1" size="lg" color="gray.700" flexShrink={0}>Журнал Постраждалих</Heading>
                    <HStack spacing={2}>
                        <Tooltip label="Оновити список" fontSize="sm">
                            <IconButton
                                icon={<RepeatIcon />} aria-label="Оновити список"
                                onClick={handleRefreshOrSearch} isLoading={isLoading && !isDeleting}
                                colorScheme="blue" variant="outline" size="sm"
                            />
                        </Tooltip>
                        <Button
                            leftIcon={<AddIcon />} colorScheme="blue"
                            onClick={() => navigate('/casualty/new')} // Перехід на створення
                            size="sm"
                        >
                            Нова Картка
                        </Button>
                    </HStack>
                </Flex>

                {/* --- Пошук --- */}
                <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.400" />} />
                    <Input
                        placeholder="Пошук за ПІБ, ID Бійця, НСС..." // Оновлено плейсхолдер
                        value={searchTerm}
                        onChange={handleSearchChange}
                        borderRadius="md"
                    />
                </InputGroup>

                {/* --- Стан Завантаження --- */}
                {isLoading && (
                    <VStack justify="center" align="center" minHeight="300px">
                        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s"/>
                        <Text mt={3} color="gray.600" fontSize="lg">Завантаження записів...</Text>
                    </VStack>
                )}

                {/* --- Помилка Завантаження --- */}
                {error && !isLoading && (
                    <Alert status="error" borderRadius="md" variant="left-accent">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                            <AlertTitle>Помилка завантаження</AlertTitle>
                            <Text fontSize="sm">{error}</Text>
                        </VStack>
                         <Button ml="auto" size="xs" variant="ghost" onClick={() => fetchCards(true)}>Спробувати ще</Button>
                    </Alert>
                )}

                {/* --- Таблиця з Даними --- */}
                {!isLoading && !error && (
                    <TableContainer borderWidth="1px" borderRadius="lg" borderColor="gray.200" overflowX="auto">
                        <Table variant="simple" size="sm">
                            <Thead bg="gray.100">
                                <Tr>
                                    {/* --- Оновлені/Додані Колонки --- */}
                                    <Th py={3} isNumeric width="50px">#</Th> {/* Додано № п/п */}
                                    <Th py={3}>ПІБ</Th>
                                    <Th py={3} textAlign="center">Стать</Th>
                                    <Th py={3}>ID Бійця</Th> {/* Змінено заголовок */}
                                    <Th py={3}>Дата/Час Поранення</Th>
                                    <Th py={3}>Пріоритет</Th>
                                    <Th py={3} textAlign="center">Алергії</Th>
                                    <Th py={3}>Час Оновлення</Th>
                                    <Th py={3} textAlign="right">Дії</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {cards.length > 0 ? (
                                    // Проходимо по відсортованому масиву і додаємо index
                                    cards.map((card, index) => (
                                        <Tr key={card._id} _hover={{ bg: 'blue.50' }}>
                                            {/* --- Оновлені/Додані Колонки --- */}
                                            <Td isNumeric>{index + 1}</Td> {/* Відображення № п/п */}
                                            <Td fontWeight="medium" maxW="200px" isTruncated title={card.patientFullName || '-'}>
                                                {card.patientFullName || '-'}
                                            </Td>
                                            <Td textAlign="center">{card.gender || '-'}</Td>
                                            {/* Відображаємо тільки individualNumber (ID бійця) */}
                                            <Td fontFamily="mono">{card.individualNumber || '-'}</Td>
                                            <Td>{formatLogDateTime(card.injuryDateTime)}</Td>
                                            <Td>
                                                <Tag size="sm" colorScheme={getPriorityColorScheme(card.evacuationPriority)} variant="subtle">
                                                    {card.evacuationPriority || '-'}
                                                </Tag>
                                            </Td>
                                            <Td textAlign="center">
                                                {card.allergies?.nka ? (
                                                    <Tooltip label="Немає відомих алергій" fontSize="xs"><Badge colorScheme='green' variant='solid' fontSize='0.6rem'>НВА</Badge></Tooltip>
                                                ) : (Object.values(card.allergies?.known || {}).some(v => v) || card.allergies?.other) ? (
                                                    <Tooltip label="Є відомі алергії" fontSize="xs"><Badge colorScheme='red' variant='outline' fontSize='0.6rem'>АЛГ</Badge></Tooltip>
                                                ) : (
                                                    <Text as='span' fontSize='xs' color='gray.400'>?</Text>
                                                )}
                                            </Td>
                                            <Td>{formatLogDateTime(card.updatedAt)}</Td>
                                            <Td>
                                                <HStack spacing={1} justify="flex-end">
                                                    <Tooltip label="Переглянути деталі" fontSize="xs"><IconButton icon={<ViewIcon />} aria-label="Переглянути деталі" size="xs" variant="ghost" colorScheme="cyan" onClick={() => handleViewDetails(card)} /></Tooltip>
                                                    <Tooltip label="Редагувати" fontSize="xs"><IconButton icon={<EditIcon />} aria-label="Редагувати картку" size="xs" variant="ghost" colorScheme="blue" onClick={() => navigate(`/casualty/${card._id}`)} /></Tooltip>
                                                    <Tooltip label="Видалити" fontSize="xs"><IconButton icon={<DeleteIcon />} aria-label="Видалити картку" size="xs" variant="ghost" colorScheme="red" onClick={() => handleOpenDeleteConfirmation(card._id)} /></Tooltip>
                                                </HStack>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={9} textAlign="center" color="gray.500" py={10}> {/* Збільшено colSpan */}
                                            {searchTerm ? `Не знайдено записів для "${searchTerm}"` : "Немає жодного запису в журналі."}
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}
            </VStack>

            <ViewCasualtyModal
                 isOpen={isViewModalOpen}
                 onClose={onCloseViewModal}
                 cardData={selectedCardForView}
             />


            {/* --- Діалог Підтвердження Видалення --- */}
            <AlertDialog isOpen={isDeleteDialogOpen} leastDestructiveRef={cancelRef} onClose={onCloseDeleteDialog} isCentered>
                 <AlertDialogOverlay><AlertDialogContent>
                     <AlertDialogHeader fontSize='lg' fontWeight='bold'>Підтвердження Видалення</AlertDialogHeader>
                     <AlertDialogBody>Ви впевнені, що хочете видалити цю картку? Цю дію неможливо буде скасувати.</AlertDialogBody>
                     <AlertDialogFooter>
                         <Button ref={cancelRef} onClick={onCloseDeleteDialog} isDisabled={isDeleting} size="sm">Скасувати</Button>
                         <Button colorScheme='red' onClick={handleConfirmDelete} ml={3} isLoading={isDeleting} size="sm">Видалити</Button>
                     </AlertDialogFooter>
                 </AlertDialogContent></AlertDialogOverlay>
             </AlertDialog>
        </Box>
    );
}

export default CasualtyLog;