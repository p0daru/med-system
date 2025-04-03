import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tag,
  IconButton,
  HStack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Button,
  Checkbox, // Додаємо імпорт Checkbox
  // Link as ChakraLink, // Імпортуємо як ChakraLink для уникнення конфлікту - не використовується, можна видалити
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { getAllInjured, deleteInjured } from '../services/injuredApi'; // Перевірте шлях!
import { useNavigate /*, Link as RouterLink */ } from 'react-router-dom'; // Імпортуємо RouterLink - не використовується, можна видалити

// --- Допоміжні функції ---

// Форматування дати та часу
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        // Повертаємо тільки час
        return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error("Error formatting time:", e);
        return 'Invalid Time';
    }
};

// Форматування тільки дати
const formatDateOnly = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        // Повертаємо тільки дату
        return date.toLocaleDateString('uk-UA');
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
};


// Оновлена функція для кольору тега ПРІОРИТЕТУ
const getPriorityTagInfo = (priority) => {
  switch (priority) {
    case 'NEVIDKLADNA': return { color: 'red', label: 'Невідкл.' };
    case 'PRIORITETNA': return { color: 'yellow', label: 'Пріорит.' };
    case 'ZVYCHAYNA': return { color: 'green', label: 'Звич.' };
    default: return { color: 'gray', label: 'N/A' };
  }
};


function CasualtyListPage() {
  const [casualties, setCasualties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [casualtyToDelete, setCasualtyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Окремий стан для процесу видалення

  // Функція завантаження даних
  const fetchCasualties = async () => {
    setIsLoading(true); // Показуємо спіннер завантаження
    setError(null);
    try {
      const data = await getAllInjured();
      // Важливо: Сортуємо дані, якщо потрібно (наприклад, за датою)
      // data.sort((a, b) => new Date(b.injuryDateTime) - new Date(a.injuryDateTime)); // Приклад сортування
      setCasualties(data);
    } catch (err) {
      console.error("Помилка завантаження списку поранених:", err);
      setError(err.response?.data?.message || err.message || 'Не вдалося завантажити дані.');
      setCasualties([]); // Очищаємо дані при помилці
    } finally {
      setIsLoading(false); // Прибираємо спіннер завантаження
    }
  };

  useEffect(() => {
    fetchCasualties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Залежність порожня, щоб викликалось один раз при монтуванні

  // Обробка видалення
  const handleDeleteClick = (casualty) => {
    if (!casualty || !casualty._id) {
         console.error("Invalid casualty object passed to handleDeleteClick");
         toast({ title: 'Помилка', description: 'Не вдалося ідентифікувати запис для видалення.', status: 'error'});
         return;
    }
    setCasualtyToDelete(casualty);
    onOpen(); // Відкриваємо діалог підтвердження
  };

  const confirmDelete = async () => {
      if (!casualtyToDelete?._id) {
          console.error("Attempted to delete but casualtyToDelete or its ID is invalid!");
          onClose();
          return;
      }

      const deleteId = casualtyToDelete._id;
      const identifier = casualtyToDelete.patientFullName || casualtyToDelete.individualNumber || `ID: ${deleteId.slice(-6)}`;

      setIsDeleting(true); // Показуємо спіннер на кнопці видалення

      try {
          await deleteInjured(deleteId);
          toast({
              title: 'Успіх!',
              description: `Запис для "${identifier}" видалено.`,
              status: 'success', duration: 4000, isClosable: true,
          });
          // Оновлюємо список ПІСЛЯ успішного видалення
          // Можна або видалити елемент зі стану локально, або перезавантажити весь список
          setCasualties(prevCasualties => prevCasualties.filter(c => c._id !== deleteId));
          // Або викликати fetchCasualties() знову: await fetchCasualties();
      } catch (err) {
          console.error(`!!! API deleteInjured FAILED for ID ${deleteId}:`, err);
           if (err.response) {
              console.error('Error Response Data:', err.response.data);
              console.error('Error Response Status:', err.response.status);
          } else if (err.request) {
              console.error('Error Request (No Response):', err.request);
          } else {
              console.error('Error Message:', err.message);
          }
          toast({
              title: 'Помилка видалення',
              description: err.response?.data?.message || err.message || 'Не вдалося видалити запис.',
              status: 'error', duration: 7000, isClosable: true,
          });
      } finally {
          onClose(); // Закриваємо діалог
          setCasualtyToDelete(null); // Очищаємо стан
          setIsDeleting(false); // Прибираємо спіннер з кнопки
      }
  };

  // --- Навігація ---
  const handleEditClick = (id) => navigate(`/edit-casualty/${id}`);
  const handleDetailsClick = (id) => navigate(`/casualty/${id}`);

  // --- Рендеринг ---

  // Початкове завантаження або завантаження після дії
  if (isLoading && casualties.length === 0) {
     return ( <Box textAlign="center" mt={10}> <Spinner size="xl" /> <Text mt={4}>Завантаження даних...</Text> </Box> );
  }

  // Помилка завантаження
  if (error) {
     return (
       <Box p={5}>
         <Heading mb={6}>Журнал Обліку Поранених</Heading>
         <Alert status="error" mt={5}>
           <AlertIcon />
           <AlertTitle>Помилка завантаження!</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       </Box>
     );
  }

  return (
    <Box p={5}>
      <Heading mb={6}>Журнал Обліку Поранених</Heading>

      {/* Спіннер оновлення даних поверх таблиці */}
      {isLoading && casualties.length > 0 && (
          <Box textAlign="center" my={4}>
              <Spinner size="md" /> <Text display="inline-block" ml={2}>Оновлення даних...</Text>
          </Box>
      )}

      {!isLoading && casualties.length === 0 ? (
        <Text mt={5}>На даний момент поранених не зареєстровано.</Text>
      ) : (
        <TableContainer mt={isLoading ? 8 : 0}> {/* Додаємо відступ, якщо є спіннер оновлення */}
          <Table variant="striped" colorScheme="gray" size="sm">
              <Thead>
              <Tr>
                  <Th width="50px">№</Th> {/* Нова колонка для номера */}
                  <Th>Дата</Th> {/* Нова колонка для дати */}
                  <Th>Ідентифікація</Th>
                  <Th>Інд. номер</Th>
                  <Th>Час пор.</Th> {/* Скорочено */}
                  <Th>Пріоритет</Th> {/* Скорочено */}
                  <Th>Механізм</Th>
                  <Th isNumeric>Дії</Th>
              </Tr>
              </Thead>
              <Tbody>
              {casualties.map((casualty, index) => {
                  const priorityInfo = getPriorityTagInfo(casualty.evacuationPriority);
                  const mechanismDisplay = casualty.mechanismOfInjury?.length > 1
                      ? "Комбін." // Скорочено
                      : casualty.mechanismOfInjury?.[0] || 'N/A';

                  // Припускаємо, що в об'єкті casualty є поле isHelpProvided (boolean)
                  // Якщо його немає, треба оновити API та модель даних
                  const isHelpProvided = !!casualty.isHelpProvided; // Перетворюємо на boolean (undefined/null стануть false)

                  return (
                  <Tr key={casualty._id} _hover={{ bg: 'gray.100' }}> {/* Ефект при наведенні */}
                      <Td>{index + 1}</Td> {/* Відображаємо номер по порядку */}
                      <Td>{formatDateOnly(casualty.injuryDateTime)}</Td> {/* Відображаємо дату */}
                      <Td>
                      {/* Пріоритет відображення: ПІБ -> Номер -> Позивний -> ID */}
                      {casualty.patientFullName || casualty.individualNumber || casualty.callSign || `ID: ${casualty._id.slice(-6)}`}
                      {casualty.patientFullName && casualty.callSign && ` (${casualty.callSign})`} {/* Додаємо позивний в дужках, якщо є ПІБ */}
                      </Td>
                      <Td>{casualty.individualNumber || 'N/A'}</Td>
                      <Td>{formatDateTime(casualty.injuryDateTime)}</Td> {/* Відображаємо час */}
                      <Td>
                          <Tag size="sm" colorScheme={priorityInfo.color} variant="subtle"> {/* Зменшено розмір тегу */}
                              {priorityInfo.label}
                          </Tag>
                      </Td>
                      <Td>{mechanismDisplay}</Td>
                      <Td isNumeric>
                      <HStack spacing={1} justify="flex-end">
                          <IconButton
                              aria-label="Деталі" icon={<ViewIcon />} size="sm"
                              colorScheme="blue" variant="ghost"
                              onClick={() => handleDetailsClick(casualty._id)}
                              title="Переглянути деталі" // Додаємо підказку
                          />
                          <IconButton
                              aria-label="Змінити" icon={<EditIcon />} size="sm"
                              colorScheme="yellow" variant="ghost"
                              onClick={() => handleEditClick(casualty._id)}
                              title="Редагувати запис" // Додаємо підказку
                          />
                          <IconButton
                              aria-label="Видалити" icon={<DeleteIcon />} size="sm"
                              colorScheme="red" variant="ghost"
                              onClick={() => handleDeleteClick(casualty)}
                              isDisabled={isDeleting} // Блокуємо кнопку під час видалення іншого запису
                              title="Видалити запис" // Додаємо підказку
                          />
                      </HStack>
                      </Td>
                  </Tr>
                  );
              })}
              </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Діалог підтвердження видалення */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Підтвердити Видалення
            </AlertDialogHeader>
            <AlertDialogBody>
              {/* Покращене повідомлення з ідентифікатором */}
              Ви впевнені, що хочете видалити запис для "{
                casualtyToDelete?.patientFullName ||
                casualtyToDelete?.individualNumber ||
                casualtyToDelete?.callSign ||
                `ID: ${casualtyToDelete?._id?.slice(-6)}`
              }"? Цю дію неможливо буде скасувати.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} isDisabled={isDeleting}> {/* Блокуємо "Скасувати" під час видалення */}
                Скасувати
              </Button>
              {/* Використовуємо isDeleting для стану завантаження кнопки */}
              <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={isDeleting}>
                Видалити
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default CasualtyListPage;