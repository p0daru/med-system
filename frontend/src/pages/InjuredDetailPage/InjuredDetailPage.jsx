import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'; // useParams для отримання ID
import {
    Box, Heading, Text, Spinner, Alert, AlertIcon, Button, useToast, SimpleGrid,
    Tag, Divider, VStack, HStack, IconButton, // IconButton для кнопок дій
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Flex
  } from '@chakra-ui/react';
import { FaEdit, FaTrashAlt, FaArrowLeft } from 'react-icons/fa'; // Іконки
import * as api from '../../services/injuredApi';

// Допоміжна функція для форматування дати/часу
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString('uk-UA', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return 'Недійсна дата';
  }
};

// Допоміжний компонент для відображення поля
const DetailField = ({ label, value, children }) => (
  <Box mb={3}>
    <Text fontWeight="semibold" color="gray.500" fontSize="sm">{label}:</Text>
    {children ? children : <Text fontSize="md">{value || '-'}</Text>}
  </Box>
);

function InjuredDetailPage() {
  const { id } = useParams(); // Отримуємо ID з URL (/injured/:id)
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure(); // Для модалки видалення

  const [injuredData, setInjuredData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Функція для отримання кольору тегу статусу (дублюємо або виносимо в утіліти)
  const getStatusColorScheme = (status) => {
    switch (status) {
      case 'Stable': return 'statusGreen'; // Назва нашої кастомної палітри
      case 'Serious': return 'statusOrange';
      case 'Critical': return 'statusRed';
      case 'Evacuated': return 'statusBlue';
      case 'Treated': return 'teal'; // Можна залишити стандартний або додати свій
      case 'Deceased (KIA)': return 'warmGray'; // Використовуємо теплі сірі
      default: return 'warmGray';
    }
  };

  // Завантаження даних конкретного пораненого
  const fetchInjuredDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInjuredById(id);
      setInjuredData(data);
    } catch (err) {
      console.error("Fetch details error:", err);
      const errorMsg = err.response?.status === 404
        ? 'Запис з таким ID не знайдено.'
        : (err.response?.data?.msg || err.message || 'Не вдалося завантажити деталі.');
      setError(errorMsg);
      toast({
        title: 'Помилка завантаження',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchInjuredDetails();
  }, [fetchInjuredDetails]);

  // Обробник видалення
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await api.deleteInjured(id);
      toast({
        title: 'Запис видалено',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/'); // Повертаємось до списку після видалення
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.msg || err.message || 'Сталася помилка при видаленні.';
      setError(`Не вдалося видалити запис: ${errorMsg}`); // Показуємо помилку на сторінці
       toast({
        title: 'Помилка видалення',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsDeleting(false);
      onDeleteClose(); // Закриваємо модалку при помилці
    }
    // finally { // Не потрібно, бо навігація відбувається при успіху
    //   setIsDeleting(false);
    //   onDeleteClose();
    // }
  };

  // Обробник редагування (перехід на сторінку редагування - поки не реалізовано)
  const handleEdit = () => {
      // TODO: Створити сторінку EditInjuredPage або додати режим редагування в AddInjuredPage
      toast({
          title: 'Редагування',
          description: 'Функція редагування ще не реалізована.',
          status: 'info',
          duration: 3000,
          isClosable: true,
      });
      // Приклад навігації на майбутню сторінку редагування:
      navigate(`/injured/${id}/edit`);
  };


  // --- Рендеринг ---
  if (loading) {
    return <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" display="block" mx="auto" my={6} />;
  }

  if (error) {
    return (
        <VStack spacing={4}>
             <Alert status="error">
               <AlertIcon />
               {error}
             </Alert>
             <Button as={RouterLink} to="/" leftIcon={<FaArrowLeft />}>
                 Повернутись до списку
             </Button>
        </VStack>
    );
  }

  if (!injuredData) {
    // Це не повинно трапитись, якщо немає помилки, але про всяк випадок
    return <Text>Дані не знайдено.</Text>;
  }

  // Розпакування даних для зручності
  const { name, callSign, unit, bloodType, allergies, incidentTimestamp, incidentLocation, mechanismOfInjury,
          medicalStatus, initialAssessmentNotes, evacuationStatus, evacuationPriority, evacuationDestination,
          recordEnteredBy, notes, injuries, vitalSignsHistory, treatments, createdAt, updatedAt } = injuredData;

  const lastInjury = injuries?.[0]; // Припускаємо, що зберігаємо одне основне поранення
  const lastVitals = vitalSignsHistory?.[vitalSignsHistory.length - 1]; // Останній запис вітальних показників
  const lastTreatment = treatments?.[0]; // Припускаємо, що зберігаємо одну основну дію

  return (
    <Box>
       <VStack spacing={4} align="stretch">
           {/* Кнопка "Назад" та Кнопки дій */}
           <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                <Button as={RouterLink} to="/" variant="outline" size="sm" leftIcon={<FaArrowLeft />}>
                   До журналу
                </Button>
                <HStack spacing={2}>
                    <Button colorScheme="blue" size="sm" leftIcon={<FaEdit />} onClick={handleEdit}>
                        Редагувати
                    </Button>
                    <Button colorScheme="red" size="sm" leftIcon={<FaTrashAlt />} onClick={onDeleteOpen} isLoading={isDeleting}>
                        Видалити
                    </Button>
                </HStack>
           </Flex>

           {/* Заголовок з іменем */}
           <Heading as="h2" size="xl" mt={4}>{name} {callSign && `(${callSign})`}</Heading>
            <Tag size="lg" colorScheme={getStatusColorScheme(medicalStatus)} alignSelf="flex-start">
                {medicalStatus || 'Статус невідомий'}
            </Tag>

           <Divider my={4} />

           {/* Сітка з детальною інформацією */}
           <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>

                {/* Секція: Ідентифікація */}
                <Box>
                    <Heading size="md" mb={4} borderBottomWidth="1px" pb={1}>Ідентифікація</Heading>
                    <DetailField label="Повний запис" value={name} />
                    {callSign && <DetailField label="Позивний" value={callSign} />}
                    <DetailField label="Підрозділ" value={unit} />
                    <DetailField label="Група крові" value={bloodType} />
                    <DetailField label="Алергії" value={allergies} />
                </Box>

                 {/* Секція: Подія */}
                 <Box>
                    <Heading size="md" mb={4} borderBottomWidth="1px" pb={1}>Подія</Heading>
                    <DetailField label="Дата та час" value={formatDateTime(incidentTimestamp)} />
                    <DetailField label="Місце" value={incidentLocation} />
                    <DetailField label="Механізм травми" value={mechanismOfInjury} />
                 </Box>

                 {/* Секція: Стан та Поранення */}
                 <Box>
                    <Heading size="md" mb={4} borderBottomWidth="1px" pb={1}>Стан та Поранення</Heading>
                     <DetailField label="Загальний огляд (MIST/MARCH)">
                        <Text whiteSpace="pre-wrap" fontSize="md">{initialAssessmentNotes || '-'}</Text>
                     </DetailField>
                     {lastInjury && (
                         <Box mt={4} pl={2} borderLeftWidth="2px" borderColor="orange.300">
                              <Text fontWeight="semibold" mb={1}>Основне поранення:</Text>
                              <DetailField label="Локалізація" value={lastInjury.location} />
                              <DetailField label="Тип" value={lastInjury.type} />
                              <DetailField label="Тяжкість" value={lastInjury.severity} />
                              <DetailField label="Примітки" value={lastInjury.notes} />
                         </Box>
                     )}
                 </Box>

                {/* Секція: Вітальні показники (останні) */}
                <Box>
                    <Heading size="md" mb={4} borderBottomWidth="1px" pb={1}>Вітальні показники</Heading>
                    {lastVitals ? (
                        <>
                           <DetailField label="Час вимірювання" value={formatDateTime(lastVitals.timestamp)} />
                           <SimpleGrid columns={2} spacingX={4} spacingY={0}>
                                <DetailField label="Пульс" value={lastVitals.pulse} />
                                <DetailField label="Тиск" value={lastVitals.bp} />
                                <DetailField label="Дихання" value={lastVitals.respiration} />
                                <DetailField label="SpO2" value={lastVitals.spo2 ? `${lastVitals.spo2}%` : null} />
                                <DetailField label="Температура" value={lastVitals.temperature ? `${lastVitals.temperature}°C` : null} />
                                <DetailField label="Свідомість (AVPU)" value={lastVitals.consciousness} />
                           </SimpleGrid>
                        </>
                    ) : <Text>Немає даних</Text>}
                 </Box>

                {/* Секція: Надана допомога */}
                <Box>
                    <Heading size="md" mb={4} borderBottomWidth="1px" pb={1}>Надана допомога</Heading>
                     {lastTreatment ? (
                        <>
                            <DetailField label="Час надання" value={formatDateTime(lastTreatment.timestamp)} />
                            <DetailField label="Хто надав" value={lastTreatment.provider} />
                            <DetailField label="Дія/Ліки" value={lastTreatment.action} />
                        </>
                     ) : <Text>Немає даних</Text>}
                </Box>

                {/* Секція: Евакуація */}
                <Box>
                    <Heading size="md" mb={4} borderBottomWidth="1px" pb={1}>Евакуація</Heading>
                    <DetailField label="Статус" value={evacuationStatus} />
                    <DetailField label="Пріоритет" value={evacuationPriority} />
                    <DetailField label="Пункт призначення" value={evacuationDestination} />
                 </Box>

                 {/* Секція: Загальні примітки та метадані */}
                 <Box gridColumn={{ lg: "span 2" }}> {/* Займає більше місця */}
                     <Heading size="md" mb={4} borderBottomWidth="1px" pb={1}>Додатково</Heading>
                     <DetailField label="Загальні примітки">
                         <Text whiteSpace="pre-wrap" fontSize="md">{notes || '-'}</Text>
                     </DetailField>
                     <DetailField label="Хто вніс запис" value={recordEnteredBy} />
                     <HStack spacing={4} mt={2} color="gray.500" fontSize="sm">
                         <Text>Створено: {formatDateTime(createdAt)}</Text>
                         {updatedAt !== createdAt && <Text>Оновлено: {formatDateTime(updatedAt)}</Text>}
                     </HStack>
                 </Box>

           </SimpleGrid>
       </VStack>

        {/* Модальне вікно підтвердження видалення */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Підтвердження видалення</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Ви впевнені, що хочете видалити запис для <Text as="span" fontWeight="bold">{name || 'цього бійця'}?</Text> Цю дію не можна буде скасувати.
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onDeleteClose} isDisabled={isDeleting}>
                        Скасувати
                    </Button>
                    <Button colorScheme="red" onClick={handleDelete} isLoading={isDeleting}>
                        Видалити
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </Box>
  );
}

export default InjuredDetailPage;