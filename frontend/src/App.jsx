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
    const sidebarWidth = '250px';
    const { isOpen: isMobileNavOpen, onToggle: onMobileNavToggle, onClose: onMobileNavClose } = useDisclosure();

    return (
        <ChakraProvider theme={theme}>
            <Flex direction="row" minH="100vh" bg={theme.colors.pageBg || "gray.100"}> {/* Використовуємо колір з теми */}

                <Sidebar
                    display={{ base: 'none', md: 'flex' }}
                    w={sidebarWidth}
                    onClose={() => {}} // Для десктопу onClose може бути порожньою функцією
                />

                <Sidebar
                    isOpen={isMobileNavOpen}
                    onClose={onMobileNavClose}
                    display={{ base: 'flex', md: 'none' }}
                    isDrawer
                />
                <Box
                    as="main"
                    flex="1"
                    // ml={{ base: 0, md: sidebarWidth }} // Потрібно, якщо Sidebar має position: fixed
                    w={{ base: '100%', md: `calc(100% - ${sidebarWidth})`}} // Якщо sidebar не fixed, ця ширина коректна
                    overflowX="hidden"
                    // p={{ base: 3, sm: 4, md: 6 }} // Відступи краще застосувати до внутрішнього контейнера сторінки
                >
                    <Flex
                        display={{ base: 'flex', md: 'none' }}
                        alignItems="center"
                        justifyContent="space-between"
                        mb={4}
                        px={4} // Збільшено відступи
                        py={3}
                        bg="white" // Або theme.colors.cardBg
                        boxShadow="sm"
                        // borderRadius="md" // Можна прибрати, якщо хедер на всю ширину
                        position="sticky"
                        top={0}
                        zIndex="sticky"
                    >
                        <RouterLink to="/trauma-journal">
                            {/* Ви можете використовувати логотип або більш стилізований заголовок */}
                            <Heading size="md" color="brand.primary.500"> {/* Використовуємо колір з теми */}
                                EMS Журнал
                            </Heading>
                        </RouterLink>
                        <IconButton
                            onClick={onMobileNavToggle}
                            variant="ghost"
                            aria-label={isMobileNavOpen ? "Закрити меню" : "Відкрити меню"}
                            icon={isMobileNavOpen ? <CloseIcon /> : <HamburgerIcon fontSize="xl" />}
                        />
                    </Flex>

                    {/* Основний контент сторінки з власними відступами */}
                    <Box p={{ base: 3, sm: 4, md: 6 }}>
                        <Routes>
                            <Route path="/" element={<Navigate replace to="/trauma-journal" />} />
                            <Route path="/trauma-journal" element={<PatientJournal />} />
                            <Route path="/prehospital-care" element={<PreHospitalCareSection />} />
                            <Route path="/prehospital-care/:id" element={<PreHospitalCareSection />} />

                            {/* Маршрут для перегляду картки */}
                            {/* Шлях: /med-system/trauma-records/АЙДІ_ЗАПИСУ/view */}
                            <Route
                                path="/trauma-records/:id/view" // Залишаємо цей шлях
                                element={<UnderDevelopmentPage title="Перегляд Картки Пацієнта" />}
                            />

                            <Route path="/reports" element={<UnderDevelopmentPage title="Звіти" />} />
                            <Route path="/settings" element={<UnderDevelopmentPage title="Налаштування" />} />

                            <Route path="*" element={
                                <VStack spacing={4} textAlign="center" py={10} px={6} mt={{ base: "10vh", md: "15vh" }}>
                                    <Icon as={WarningIcon} boxSize={'50px'} color={'orange.300'} />
                                    <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
                                        404 - Сторінку не знайдено
                                    </Heading>
                                    <Text fontSize={{ base: "md", md: "lg" }} color={'gray.500'}>
                                        На жаль, ми не можемо знайти сторінку, яку ви шукаєте.
                                    </Text>
                                    <Button
                                        as={RouterLink}
                                        to="/trauma-journal"
                                        colorScheme="brand.primary" // Використовуємо колір з теми
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