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
    const [selectedCardForView, setSelectedCardForView] = useState(null); // Картка для перегляду

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

            {/* --- Модальне вікно Перегляду Деталей --- */}
            <Modal isOpen={isViewModalOpen} onClose={onCloseViewModal} size="2xl" scrollBehavior="inside">
                <ModalOverlay bg='blackAlpha.300' backdropFilter='blur(5px)'/>
                <ModalContent>
                    {/* <ModalHeader>Боєць {selectedCardForView.individualNumber || null}
                    <Text><Tag size="sm" colorScheme={getPriorityColorScheme(selectedCardForView.evacuationPriority)}>{selectedCardForView.evacuationPriority || '-'}</Tag></Text>
                    </ModalHeader> */}
                    
                    {/* <ModalHeader>Деталі Картки: {selectedCardForView?.patientFullName || 'N/A'}</ModalHeader> */}
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedCardForView ? (
                            <VStack spacing={5} align="stretch">
                                {/* --- Секція 1 --- */}
                                <Box borderWidth={1} p={3} borderRadius="md" borderColor="gray.200">
                                    <Heading size="sm" mb={2}>1. Дані постраждалого</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} fontSize="sm">
                                        <Text><strong>ПІБ:</strong> {selectedCardForView.patientFullName || '-'}</Text>
                                        {/* <Text><strong>ID Бійця:</strong> {selectedCardForView.individualNumber || '-'}</Text> */}
                                        <Text><strong>Стать:</strong> {selectedCardForView.gender || '-'}</Text>
                                        <Text><strong>Підрозділ:</strong> {selectedCardForView.unit || '-'}</Text>
                                        <Text><strong>Рід військ:</strong> {selectedCardForView.branchOfService || '-'}</Text>
                                        <Text><strong>Дата/час поранення:</strong> {formatLogDateTime(selectedCardForView.injuryDateTime)}</Text>
                                        {/* <Text><strong>Пріоритет евакуації:</strong> 
                                        <Tag size="sm" colorScheme={getPriorityColorScheme(selectedCardForView.evacuationPriority)}>{selectedCardForView.evacuationPriority || '-'}</Tag></Text> */}
                                        {/* {selectedCardForView.last4SSN && <Text><strong>Ост. 4 НСС:</strong> {selectedCardForView.last4SSN}</Text>} */}
                                    </SimpleGrid>
                                    <Heading size="xs" mt={3} mb={1}>Алергії:</Heading>
                                    {selectedCardForView.allergies?.nka ? <Tag colorScheme="green" size="sm">Немає відомих алергій</Tag> : (
                                        <VStack align="start" pl={2} spacing={0.5} fontSize="sm">
                                            {Object.entries(selectedCardForView.allergies?.known || {}).filter(([, value]) => value).map(([key]) => <Text key={key}>- {key}</Text>)}
                                            {selectedCardForView.allergies?.other && <Text><strong>Інше:</strong> {selectedCardForView.allergies.other}</Text>}
                                            {!Object.values(selectedCardForView.allergies?.known || {}).some(v => v) && !selectedCardForView.allergies?.other && <Text fontStyle="italic" color="gray.500">Не вказано</Text>}
                                        </VStack>
                                    )}
                                </Box>

                                {/* --- Секція 2 & 3 --- */}
                                <Box borderWidth={1} p={3} borderRadius="md" borderColor="gray.200">
                                    <Heading size="sm" mb={2}>2. Інформація про поранення</Heading>
                                    <Text fontSize="sm"><strong>Механізм:</strong> {selectedCardForView.mechanismOfInjury?.join(', ') || '-'} {selectedCardForView.mechanismOfInjuryOther ? `(${selectedCardForView.mechanismOfInjuryOther})` : ''}</Text>
                                    <Text fontSize="sm"><strong>Опис:</strong> {selectedCardForView.injuryDescription || '-'}</Text>
                                    <Divider my={3} />
                                    <Heading size="sm" mb={2}>3. Турнікети</Heading>
                                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                                        {Object.entries(selectedCardForView.tourniquets || {}).filter(([limb, data]) => data && (data.time || data.type)).length > 0 ?
                                           Object.entries(selectedCardForView.tourniquets || {}).map(([limb, data]) => (
                                                data && (data.time || data.type) ? (
                                                   <Box key={limb} p={2} borderWidth={1} borderRadius="sm" borderColor="gray.100">
                                                        <Text fontSize="sm" fontWeight="bold">{ {rightArm: "Пр. рука", leftArm: "Лів. рука", rightLeg: "Пр. нога", leftLeg: "Лів. нога"}[limb] || limb }</Text>
                                                        <Text fontSize="xs">Час: {data.time || '-'}</Text>
                                                        <Text fontSize="xs">Тип: {data.type || '-'}</Text>
                                                    </Box>
                                                 ) : null
                                            )) : <Text fontSize="sm" color="gray.500">Не застосовувались</Text>}
                                    </SimpleGrid>
                                </Box>

                                {/* --- Секція 4: Вітальні знаки --- */}
                                <Box borderWidth={1} p={3} borderRadius="md" borderColor="gray.200">
                                    <Heading size="sm" mb={2}>4. Життєві показники</Heading>
                                    {(selectedCardForView.vitalSigns || []).length > 0 ? (
                                        <TableContainer>
                                            <Table variant="simple" size="xs">
                                                <Thead>
                                                    <Tr><Th>Час</Th><Th>Пульс</Th><Th>АТ</Th><Th>ЧД</Th><Th>SpO2</Th><Th>AVPU</Th><Th>Біль</Th></Tr>
                                                </Thead>
                                                <Tbody>
                                                    {(selectedCardForView.vitalSigns || []).map((vs, index) => (
                                                        <Tr key={`vs-${index}`}>
                                                            <Td>{vs.time || '-'}</Td><Td>{vs.pulse || '-'}</Td><Td>{vs.bp || '-'}</Td>
                                                            <Td>{vs.rr || '-'}</Td><Td>{vs.spO2 || '-'}</Td><Td>{vs.avpu || '-'}</Td><Td>{vs.pain || '-'}</Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    ) : <Text fontSize="sm" color="gray.500">Немає записів</Text>}
                                </Box>

                                 {/* --- Секція 5: Надана допомога --- */}
                                 <Box borderWidth={1} p={3} borderRadius="md" borderColor="gray.200">
                                     <Heading size="sm" mb={2}>5. Надана Допомога (MARCH)</Heading>
                                     <VStack align="stretch" spacing={2}>
                                          <Text fontSize="xs" fontWeight="bold" color="red.600">C - Circulation:</Text>
                                         <HStack wrap="wrap" spacing={2}>
                                              {selectedCardForView.aidCirculation?.tourniquetJunctional && <Tag size="sm" colorScheme="red">Вузловий турнікет</Tag>}
                                              {selectedCardForView.aidCirculation?.tourniquetTruncal && <Tag size="sm" colorScheme="red">Турнікет на тулуб</Tag>}
                                              {selectedCardForView.aidCirculation?.dressingHemostatic && <Tag size="sm" colorScheme="red">Гемостат. пов'язка</Tag>}
                                              {selectedCardForView.aidCirculation?.dressingPressure && <Tag size="sm" colorScheme="red">Тиснуча пов'язка</Tag>}
                                              {selectedCardForView.aidCirculation?.dressingOther && <Tag size="sm" colorScheme="red">Інша пов'язка</Tag>}
                                              {!Object.values(selectedCardForView.aidCirculation || {}).some(v => v) && <Text fontSize="xs" color="gray.500">Не застосовано</Text>}
                                         </HStack>
                                          <Text fontSize="xs" fontWeight="bold" color="orange.500" mt={1}>A - Airway:</Text>
                                         <HStack wrap="wrap" spacing={2}>
                                             {selectedCardForView.aidAirway?.npa && <Tag size="sm" colorScheme="orange">Назофаринг. повітровід</Tag>}
                                             {selectedCardForView.aidAirway?.supraglottic && <Tag size="sm" colorScheme="orange">Надгорт. повітровід</Tag>}
                                             {selectedCardForView.aidAirway?.etTube && <Tag size="sm" colorScheme="orange">Ендотрах. трубка</Tag>}
                                             {selectedCardForView.aidAirway?.cric && <Tag size="sm" colorScheme="orange">Крікотиреотомія</Tag>}
                                             {!Object.values(selectedCardForView.aidAirway || {}).some(v => v) && <Text fontSize="xs" color="gray.500">Не застосовано</Text>}
                                         </HStack>
                                          <Text fontSize="xs" fontWeight="bold" color="blue.500" mt={1}>B - Breathing:</Text>
                                         <HStack wrap="wrap" spacing={2}>
                                              {selectedCardForView.aidBreathing?.o2 && <Tag size="sm" colorScheme="blue">Кисень (O2)</Tag>}
                                              {selectedCardForView.aidBreathing?.needleDecompression && <Tag size="sm" colorScheme="blue">Голкова декомпресія</Tag>}
                                              {selectedCardForView.aidBreathing?.chestTube && <Tag size="sm" colorScheme="blue">Дренаж плевральний</Tag>}
                                              {selectedCardForView.aidBreathing?.occlusiveDressing && <Tag size="sm" colorScheme="blue">Оклюз. наліпка</Tag>}
                                              {!Object.values(selectedCardForView.aidBreathing || {}).some(v => v) && <Text fontSize="xs" color="gray.500">Не застосовано</Text>}
                                         </HStack>
                                         <Text fontSize="xs" fontWeight="bold" color="red.600" mt={1}>C - Інфузійна терапія:</Text>
                                         {(selectedCardForView.fluidsGiven || []).length > 0 ? (
                                             <VStack align="stretch" pl={2} spacing={1}>
                                                 {(selectedCardForView.fluidsGiven || []).map((f, idx) => (
                                                     <Text key={`fluid-${idx}`} fontSize="xs">{f.time} - {f.name} ({f.volume} мл) - {f.route}</Text>
                                                 ))}
                                             </VStack>
                                         ) : <Text fontSize="xs" color="gray.500">Не застосовано</Text>}
                                     </VStack>
                                 </Box>

                                 {/* --- Секція 6: Ліки та HE --- */}
                                <Box borderWidth={1} p={3} borderRadius="md" borderColor="gray.200">
                                     <Heading size="sm" mb={2}>6. Ліки та Інше (H+E)</Heading>
                                     <Text fontSize="xs" fontWeight="bold" mb={1}>Введені ліки:</Text>
                                     {(selectedCardForView.medicationsGiven || []).length > 0 ? (
                                         <VStack align="stretch" pl={2} spacing={1}>
                                             {(selectedCardForView.medicationsGiven || []).map((m, idx) => (
                                                 <Text key={`med-${idx}`} fontSize="xs">{m.time} - {m.name} - {m.dosage} - {m.route}</Text>
                                             ))}
                                         </VStack>
                                     ) : <Text fontSize="xs" color="gray.500">Немає записів</Text>}
                                     <Text fontSize="xs" fontWeight="bold" mt={2} mb={1}>Інша допомога (H+E):</Text>
                                      <HStack wrap="wrap" spacing={2}>
                                          {selectedCardForView.aidHypothermiaOther?.combatPillPack && <Tag size="sm">Pill Pack</Tag>}
                                          {selectedCardForView.aidHypothermiaOther?.eyeShieldRight && <Tag size="sm">Щиток на око (П)</Tag>}
                                          {selectedCardForView.aidHypothermiaOther?.eyeShieldLeft && <Tag size="sm">Щиток на око (Л)</Tag>}
                                          {selectedCardForView.aidHypothermiaOther?.splinting && <Tag size="sm">Шина</Tag>}
                                          {selectedCardForView.aidHypothermiaOther?.hypothermiaPrevention && <Tag size="sm">Попер. гіпотермії ({selectedCardForView.aidHypothermiaOther.hypothermiaPreventionType || 'тип не вказано'})</Tag>}
                                          {!Object.values(selectedCardForView.aidHypothermiaOther || {}).some(v => v) && <Text fontSize="xs" color="gray.500">Не застосовано</Text>}
                                      </HStack>
                                </Box>


                                {/* --- Секція 7 & 8 & Адмін --- */}
                                <Box borderWidth={1} p={3} borderRadius="md" borderColor="gray.200">
                                     <Heading size="sm" mb={2}>7. Нотатки</Heading>
                                     <Text fontSize="sm" whiteSpace="pre-wrap" bg="gray.50" p={2} borderRadius="sm">{selectedCardForView.notes || <Text as="span" color="gray.500">Немає</Text>}</Text>
                                     <Divider my={3}/>
                                     <Heading size="sm" mb={2}>8. Дані особи, що надала допомогу</Heading>
                                     <Text fontSize="sm"><strong>ПІБ:</strong> {selectedCardForView.providerFullName || '-'}</Text>
                                     <Text fontSize="sm"><strong>НСС:</strong> {selectedCardForView.providerLast4SSN || '-'}</Text>
                                     <Divider my={3}/>
                                     <Heading size="sm" mb={2}>Адмін. Інформація</Heading>
                                     <Text fontSize="xs"><strong>Створено:</strong> {formatLogDateTime(selectedCardForView.createdAt)}</Text>
                                     <Text fontSize="xs"><strong>Оновлено:</strong> {formatLogDateTime(selectedCardForView.updatedAt)}</Text>
                                     <Text fontSize="xs"><strong>Записав:</strong> {selectedCardForView.recordedBy || '-'}</Text>
                                     <Text fontSize="xs"><strong>ID Запису:</strong> {selectedCardForView._id}</Text>
                                </Box>

                            </VStack>
                        ) : (
                            <VStack justify="center" align="center" minHeight="200px">
                                <Spinner size="lg" color="blue.500"/>
                                <Text mt={2}>Завантаження деталей...</Text>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px" borderColor="gray.200" pt={3}>
                        <Button colorScheme='gray' variant='outline' mr={3} onClick={onCloseViewModal} size="sm">Закрити</Button>
                        {selectedCardForView && (
                            <Button colorScheme='blue' variant='solid' onClick={() => { onCloseViewModal(); navigate(`/casualty/${selectedCardForView._id}`); }} size="sm">Редагувати</Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

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