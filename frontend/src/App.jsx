// frontend/src/App.jsx

import React, { useState } from 'react';
import { Routes, Route, Navigate, Link as RouterLink, useParams } from 'react-router-dom';
import {
    ChakraProvider,
    Box,
    Flex,
    Heading,
    Text,
    VStack,
    Icon,
    IconButton,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon, WarningIcon, CloseIcon } from '@chakra-ui/icons';

// Імпортуємо всі необхідні компоненти та сторінки
import theme from './config/theme';
import AuthLayout from './pages/AuthLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Sidebar from './components/Sidebar/Sidebar';
import PatientJournal from './components/PatientJournal/PatientJournal';
import PatientRecordView from './components/PatientJournal/PatientRecordView';
import PreHospitalCareSection from './components/PatientCard/PreHospitalCareSection.jsx';

// --- Допоміжні компоненти (можна винести в окремі файли, але для повноти коду вони тут) ---

// Компонент-обгортка для сторінки створення/редагування картки
const PreHospitalCareWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // Помилка була тут, navigate не було визначено

    const handleSaveSuccess = (savedRecord) => {
        if (savedRecord?._id) {
            navigate(`/trauma-records/${savedRecord._id}/view`);
        } else {
            navigate('/trauma-journal');
        }
    };
    const handleCancelForm = () => navigate('/trauma-journal');

    return (
        <PreHospitalCareSection
            recordIdToEdit={id}
            onSave={handleSaveSuccess}
            onCancel={handleCancelForm}
        />
    );
};

// Компонент для сторінок "В розробці"
const UnderDevelopmentPage = ({ title }) => (
    <Box p={5} bg="white" borderRadius="md" boxShadow="sm" textAlign="center" mt={10}>
        <Heading size="lg" mb={4}>{title}</Heading>
        <Text fontSize="xl" color="gray.600">Ця сторінка наразі знаходиться в розробці.</Text>
        <Button as={RouterLink} to="/trauma-journal" colorScheme="blue" mt={6}>
            Повернутися до Журналу
        </Button>
    </Box>
);

// Компонент для макету залогіненого користувача (з сайдбаром)
const MainAppLayout = ({ children, onLogout }) => {
    const sidebarWidth = '250px';
    const { isOpen: isMobileNavOpen, onToggle: onMobileNavToggle, onClose: onMobileNavClose } = useDisclosure();
    
    return (
        <Flex direction="row" minH="100vh" bg={theme.colors.pageBg || "gray.100"}>
            <Sidebar
                display={{ base: 'none', md: 'flex' }}
                w={sidebarWidth}
                onClose={() => {}} 
                onLogout={onLogout} 
            />
            <Sidebar
                isOpen={isMobileNavOpen}
                onClose={onMobileNavClose}
                display={{ base: 'flex', md: 'none' }}
                isDrawer
                onLogout={onLogout}
            />
            <Box as="main" flex="1" w={{ base: '100%', md: `calc(100% - ${sidebarWidth})`}} overflowX="hidden">
                <Flex
                    display={{ base: 'flex', md: 'none' }}
                    alignItems="center"
                    justifyContent="space-between"
                    mb={4}
                    px={4} 
                    py={3}
                    bg="white" 
                    boxShadow="sm"
                    position="sticky"
                    top={0}
                    zIndex="sticky"
                >
                    <RouterLink to="/trauma-journal">
                        <Heading size="md" color="brand.primary.500">
                            TRAUMA RECORDS
                        </Heading>
                    </RouterLink>
                    <IconButton
                        onClick={onMobileNavToggle}
                        variant="ghost"
                        aria-label={isMobileNavOpen ? "Закрити меню" : "Відкрити меню"}
                        icon={isMobileNavOpen ? <CloseIcon boxSize={5} /> : <HamburgerIcon fontSize="xl" />}
                    />
                </Flex>
                <Box p={{ base: 3, sm: 4, md: 6 }}>
                    {children}
                </Box>
            </Box>
        </Flex>
    );
};

// --- Основний компонент App ---

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return !!(userInfo && JSON.parse(userInfo).token);
        } catch {
            return false;
        }
    });

    const handleLoginSuccess = () => setIsLoggedIn(true);
    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setIsLoggedIn(false);
    };

    return (
        <ChakraProvider theme={theme}>
            <Routes>
                {isLoggedIn ? (
                    // --- ЗАХИЩЕНІ РОУТИ (коли користувач залогінений) ---
                    <Route
                        path="/*"
                        element={
                            <MainAppLayout onLogout={handleLogout}>
                                <Routes>
                                    <Route index element={<Navigate to="/trauma-journal" replace />} />
                                    <Route path="trauma-journal" element={<PatientJournal />} />
                                    <Route path="prehospital-care" element={<PreHospitalCareWrapper />} />
                                    <Route path="prehospital-care/:id" element={<PreHospitalCareWrapper />} />
                                    <Route path="trauma-records/:id/view" element={<PatientRecordView />} />
                                    <Route path="reports" element={<UnderDevelopmentPage title="Звіти" />} />
                                    <Route path="settings" element={<UnderDevelopmentPage title="Налаштування" />} />
                                    {/* Будь-який інший шлях перенаправляє на головну */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </MainAppLayout>
                        }
                    />
                ) : (
                    // --- ПУБЛІЧНІ РОУТИ (коли користувач не залогінений) ---
                    <Route
                        path="/*"
                        element={
                            <AuthLayout>
                                <Routes>
                                    <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    {/* Будь-який інший шлях перенаправляє на сторінку входу */}
                                    <Route path="*" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </AuthLayout>
                        }
                    />
                )}
            </Routes>
        </ChakraProvider>
    );
}

export default App;