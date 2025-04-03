// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'; // Імпорти для роутера
// import {
//   Box,
//   Heading,
//   Text,
//   Spinner,
//   Alert,
//   AlertIcon,
//   AlertTitle,
//   AlertDescription,
//   SimpleGrid, // Для гарного відображення пар ключ-значення
//   Tag,
//   Divider,
//   List, // Для списку турнікетів
//   ListItem,
//   ListIcon,
//   Badge, // Для інших позначок
//   Button, // Для кнопки "Назад" або "Редагувати"
//   Link as ChakraLink,
//   HStack,
//   VStack
// } from '@chakra-ui/react';
// import { ArrowBackIcon, EditIcon } from '@chakra-ui/icons'; // Іконки
// import { getInjuredById } from '../services/injuredApi'; // Функція API

// // Допоміжні функції (можна винести в окремий файл utils)
// const formatDateTime = (isoString) => {
//   if (!isoString) return 'N/A';
//   try {
//     const date = new Date(isoString);
//     return `${date.toLocaleDateString('uk-UA')} ${date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;
//   } catch (e) {
//     return 'Invalid Date';
//   }
// };

// const getTriageTagColor = (triageCategory) => {
//   switch (triageCategory) {
//     case 'T1': return 'red';
//     case 'T2': return 'yellow';
//     case 'T3': return 'green';
//     case 'T4': return 'blackAlpha';
//     default: return 'gray';
//   }
// };

// // Компонент для відображення поля даних
// const DetailItem = ({ label, value, children }) => (
//     <Box mb={3}>
//         <Text fontWeight="bold" color="gray.600" fontSize="sm">{label}:</Text>
//         {children ? children : <Text>{value || 'N/A'}</Text>}
//     </Box>
// );


// function CasualtyDetailPage() {
//   const { id } = useParams(); // Отримуємо ID з URL
//   const navigate = useNavigate(); // Для кнопки "Назад" та "Редагувати"
//   const [casualty, setCasualty] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchCasualtyDetails = async () => {
//       if (!id) {
//         setError('ID пораненого не вказано.');
//         setIsLoading(false);
//         return;
//       }
//       setIsLoading(true);
//       setError(null);
//       try {
//         const data = await getInjuredById(id);
//         setCasualty(data);
//       } catch (err) {
//         console.error(`Помилка завантаження деталей для ID ${id}:`, err);
//         setError(err.response?.data?.message || err.message || 'Не вдалося завантажити дані.');
//         setCasualty(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCasualtyDetails();
//   }, [id]); // Перезавантажуємо, якщо ID змінився

//   // --- Рендеринг ---

//   if (isLoading) {
//     return (
//       <Box textAlign="center" mt={10}>
//         <Spinner size="xl" />
//         <Text mt={4}>Завантаження деталей...</Text>
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//         <VStack spacing={4} align="center" mt={10}>
//              <Alert status="error">
//                 <AlertIcon />
//                 <AlertTitle>Помилка завантаження!</AlertTitle>
//                 <AlertDescription>{error}</AlertDescription>
//             </Alert>
//              <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} colorScheme="gray">
//                 Повернутися до списку
//             </Button>
//         </VStack>
//     );
//   }

//   if (!casualty) {
//     return (
//       <VStack spacing={4} align="center" mt={10}>
//         <Alert status="warning">
//             <AlertIcon />
//             <AlertTitle>Не знайдено</AlertTitle>
//             <AlertDescription>Дані для пораненого з ID {id} не знайдено.</AlertDescription>
//         </Alert>
//          <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} colorScheme="gray">
//             Повернутися до списку
//         </Button>
//       </VStack>
//     );
//   }

//   // Основний рендер даних
//   return (
//     <Box p={5}>
//       <HStack justifyContent="space-between" mb={6}>
//         <Heading size="lg">
//           Деталі: {casualty.patientFullName || casualty.temporaryStabpointId || `ID: ${id.slice(-6)}`}
//         </Heading>
//         <HStack>
//              <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outline" size="sm">
//                 До списку
//             </Button>
//             <Button
//                 leftIcon={<EditIcon />}
//                 colorScheme="yellow"
//                 variant="outline"
//                 size="sm"
//                 onClick={() => navigate(`/edit-casualty/${id}`)} // Перехід на редагування
//             >
//                 Редагувати
//             </Button>
//         </HStack>
//       </HStack>

//       <Divider mb={6} />

//       {/* Розділ Ідентифікації */}
//       <Heading size="md" mb={4}>1. Ідентифікація та Прибуття</Heading>
//       <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
//         <DetailItem label="Повне ім'я (ПІБ)" value={casualty.patientFullName} />
//         <DetailItem label="Номер жетону" value={casualty.dogTagNumber} />
//         <DetailItem label="Позивний" value={casualty.callSign} />
//         <DetailItem label="Підрозділ" value={casualty.unit} />
//         <DetailItem label="Тимчасовий ID стабпункту" value={casualty.temporaryStabpointId} />
//         <DetailItem label="Потребує ідентифікації?">
//             <Badge colorScheme={casualty.needsIdentification ? 'orange' : 'green'}>
//                 {casualty.needsIdentification ? 'Так' : 'Ні'}
//             </Badge>
//         </DetailItem>
//         <DetailItem label="Час прибуття на стабпункт" value={formatDateTime(casualty.arrivalDateTime)} />
//         <DetailItem label="Ким доставлено" value={casualty.deliveredBy} />
//       </SimpleGrid>

//       <Divider mb={6} />

//       {/* Розділ Дані TCCC / Попередній етап */}
//       <Heading size="md" mb={4}>2. Дані з Попереднього Етапу (TCCC Card)</Heading>
//       <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
//          <DetailItem label="Час поранення" value={casualty.timeOfInjury} />
//          <DetailItem label="Механізм травми" value={casualty.mechanismOfInjury} />
//          <DetailItem label="Тріаж (попередній)" >
//             {casualty.previousTriageCategory ? (
//                 <Tag size="md" variant="outline" colorScheme={getTriageTagColor(casualty.previousTriageCategory.split('/')[0])}>
//                     {casualty.previousTriageCategory}
//                 </Tag>
//             ) : 'N/A'}
//          </DetailItem>
//          <DetailItem label="Стан свідомості (AVPU)" value={casualty.avpuLevel} />
//          <DetailItem label="Алергії" value={casualty.allergies} />
//       </SimpleGrid>

//       <Heading size="sm" mb={3}>Надана допомога ДО прибуття:</Heading>
//       <Text mb={3}>{casualty.otherAidProvidedDetails || 'N/A'}</Text>

//        <Heading size="sm" mb={3}>Введені медикаменти ДО прибуття:</Heading>
//        <Text mb={6}>{casualty.medicationsAdministeredDetails || 'N/A'}</Text>

//        <Heading size="sm" mb={3}>Накладені джгути (турнікети):</Heading>
//        {casualty.tourniquetsApplied && casualty.tourniquetsApplied.length > 0 ? (
//            <List spacing={2} mb={6} pl={5}>
//                {casualty.tourniquetsApplied.map((t, index) => (
//                    <ListItem key={index}>
//                        <Text as="span" fontWeight="medium">{t.timeApplied}</Text> - {t.location} ({t.type || 'Тип не вказано'})
//                    </ListItem>
//                ))}
//            </List>
//        ) : (
//            <Text mb={6}>Немає даних про накладені джгути.</Text>
//        )}

//       <Divider mb={6} />

//       {/* Розділ Поточний Стан / Стабпункт */}
//        <Heading size="md" mb={4}>3. Оцінка на Стабпункті</Heading>
//         <DetailItem label="Первинний тріаж (стабпункт)">
//             {casualty.stabpointTriageCategory ? (
//                 <Tag size="lg" colorScheme={getTriageTagColor(casualty.stabpointTriageCategory)}>
//                     {casualty.stabpointTriageCategory}
//                 </Tag>
//             ) : 'N/A'}
//          </DetailItem>
//          {/* Сюди можна додавати інші поля, які будуть заповнюватися ПІСЛЯ прибуття */}

//     </Box>
//   );
// }

// export default CasualtyDetailPage;