// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import {
    ChakraProvider,
    Box,
    Heading,
    Text,
    VStack,
    Icon,
    IconButton,
    Button,
    useDisclosure,
    Flex // Додано Flex для кращого контролю над шапкою
} from '@chakra-ui/react';
import { HamburgerIcon, WarningIcon, CloseIcon } from '@chakra-ui/icons';

import theme from './config/theme';

// Компоненти сторінок
import PreHospitalCareSection from './components/PatientCard/PreHospitalCareSection.jsx';
import PatientJournal from './components/PatientJournal/PatientJournal';
import Sidebar from './components/Sidebar/Sidebar';

// Компонент для сторінки "В розробці"
const UnderDevelopmentPage = ({ title }) => (
    <Box p={5} bg="white" borderRadius="md" boxShadow="sm" textAlign="center" mt={10}>
        <Heading size="lg" mb={4}>{title}</Heading>
        <Text fontSize="xl" color="gray.600">Ця сторінка наразі знаходиться в розробці.</Text>
        <Text mt={2}>Ми працюємо над тим, щоб вона стала доступною якомога швидше!</Text>
        <Button as={RouterLink} to="/trauma-journal" colorScheme="blue" mt={6}>
            Повернутися до Журналу
        </Button>
    </Box>
);

function App() {
    const sidebarWidth = '250px'; // Або будь-яка інша ширина
    const { isOpen: isMobileNavOpen, onToggle: onMobileNavToggle, onClose: onMobileNavClose } = useDisclosure();

    return (
        <ChakraProvider theme={theme}>
            <Flex direction="row" minH="100vh" bg="gray.100"> {/* Змінено на Flex для всього App */}

               {/* Десктопний Sidebar */}
                <Sidebar
                    display={{ base: 'none', md: 'flex' }}
                    w={sidebarWidth} // Передаємо ширину
                    onClose={onMobileNavClose} // Для закриття при кліку на посилання (хоча для десктопу це не так критично)
                />

                {/* Мобільний Sidebar (Drawer) */}
                <Sidebar
                    isOpen={isMobileNavOpen}
                    onClose={onMobileNavClose}
                    display={{ base: 'flex', md: 'none' }} // display 'flex' тут вже не так важливий, бо Drawer контролює видимість
                    isDrawer // Вказуємо, що це Drawer
                />
                <Box
                    as="main"
                    flex="1"
                    // ml={{ base: 0, md: sidebarWidth }} // Більше не потрібен, якщо Sidebar не 'fixed' або 'absolute'
                                                        // Якщо Sidebar має position fixed, то цей ml потрібен.
                                                        // Для поточного Sidebar (без position: fixed) це не потрібно.
                    p={{ base: 3, sm: 4, md: 6 }}
                    w={{ base: '100%', md: `calc(100% - ${sidebarWidth})`}} // Обережно з цим, якщо сайдбар не фіксований
                    overflowX="hidden" // Важливо для горизонтального скролу
                >
                    {/* Верхня панель для мобільної навігації */}
                    <Flex
                        display={{ base: 'flex', md: 'none' }}
                        alignItems="center"
                        justifyContent="space-between"
                        mb={4}
                        p={2}
                        bg="white"
                        boxShadow="sm"
                        borderRadius="md"
                        position="sticky" // Робить хедер "липким" на мобільних
                        top={0}
                        zIndex="sticky" // Щоб був поверх контенту, але нижче модалок
                    >
                        <RouterLink to="/trauma-journal">
                            <Heading size="md" color="red.600">EMS Журнал</Heading>
                        </RouterLink>
                        <IconButton
                            onClick={onMobileNavToggle}
                            variant="ghost"
                            colorScheme="gray"
                            aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
                            icon={isMobileNavOpen ? <CloseIcon /> : <HamburgerIcon fontSize="xl" />}
                        />
                    </Flex>

                    {/* Основний контент сторінки */}
                    <Box> {/* Додаткова обгортка може бути корисною для відступів */}
                        <Routes>
                            {/* Головний маршрут перенаправляє на журнал */}
                            <Route path="/" element={<Navigate replace to="/trauma-journal" />} />

                            {/* Журнал травм */}
                            <Route path="/trauma-journal" element={<PatientJournal />} />

                            {/* Створення нової догоспітальної картки */}
                            {/* Використовуємо /prehospital-care для нових, PreHospitalCareSection сам визначить, що ID немає */}
                            <Route path="/prehospital-care" element={<PreHospitalCareSection />} />

                            {/* Редагування існуючої догоспітальної картки */}
                            {/* Цей маршрут буде використовуватися з PatientJournal */}
                            <Route path="/prehospital-care/:id" element={<PreHospitalCareSection />} />

                            {/* Приклад маршруту для перегляду (поки що як заглушка) */}
                            <Route
                                path="/trauma-records/:id/view"
                                element={<UnderDevelopmentPage title="Перегляд Картки Пацієнта" />}
                            />

                            {/* Приклади інших маршрутів */}
                            <Route path="/reports" element={<UnderDevelopmentPage title="Звіти" />} />
                            <Route path="/settings" element={<UnderDevelopmentPage title="Налаштування" />} />

                            {/* Сторінка 404 */}
                            <Route path="*" element={
                                <VStack spacing={4} textAlign="center" py={10} px={6} mt={{ base: "10vh", md: "15vh" }}>
                                    <Icon as={WarningIcon} boxSize={'50px'} color={'orange.300'} />
                                    <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
                                        404 - Сторінку не знайдено
                                    </Heading>
                                    <Text fontSize={{ base: "md", md: "lg" }} color={'gray.500'}>
                                        На жаль, ми не можемо знайти сторінку, яку ви шукаєте.
                                        Можливо, її було переміщено або видалено.
                                    </Text>
                                    <Button
                                        as={RouterLink}
                                        to="/trauma-journal"
                                        colorScheme="red" // Змінив колір для відповідності до стилю
                                        variant="solid"
                                        mt={6}
                                        size="lg"
                                    >
                                        Повернутися до Журналу
                                    </Button>
                                </VStack>
                            }/>
                        </Routes>
                    </Box>
                </Box>
            </Flex>
        </ChakraProvider>
    );
}

export default App;