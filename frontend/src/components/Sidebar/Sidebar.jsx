// frontend/src/components/Sidebar/Sidebar.jsx
import React from 'react';
import {
    Box,
    VStack,
    Link as ChakraLink,
    Text,
    Icon,
    Divider,
    Heading,
    Button, // Переконуємось, що Button імпортовано
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useColorModeValue
} from '@chakra-ui/react';
import { FiHome, FiFileText, FiSettings, FiLogOut } from 'react-icons/fi'; // <-- ДОДАНО FiLogOut
import { NavLink as RouterNavLink } from 'react-router-dom';
import {
    TimeIcon,
    SettingsIcon,
    AttachmentIcon
} from '@chakra-ui/icons';
import { useAuth } from '../../hooks/useAuth';

// Компонент для елемента навігації (без змін)
const NavItem = ({ icon, children, to, onClose, ...rest }) => {
    // ... твій код NavItem залишається без змін
    const activeBg = useColorModeValue("red.100", "red.700");
    const activeColor = useColorModeValue("red.700", "white");
    const hoverBg = useColorModeValue("gray.100", "gray.700");

    return (
        <ChakraLink
            as={RouterNavLink}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
                backgroundColor: isActive ? activeBg : undefined,
                color: isActive ? activeColor : undefined,
                fontWeight: isActive ? 'bold' : 'normal'
            })}
            _hover={{
                textDecoration: 'none',
                bg: hoverBg,
            }}
            display="flex"
            alignItems="center"
            p="3"
            mx="2"
            borderRadius="md"
            role="group"
            transition=".15s ease"
            {...rest}
        >
            {icon && (
                <Icon
                    mr="3"
                    boxSize="5"
                    as={icon}
                />
            )}
            {children}
        </ChakraLink>
    );
};

function Sidebar({ isOpen, onClose, display, isDrawer = false, onLogout, ...rest }) { 
    const { isAdmin, isDoctor, isMedic, user } = useAuth(); 
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const sidebarContent = (
        <Box
            bg={bgColor}
            borderRight={!isDrawer ? '1px' : 'none'}
            borderColor={borderColor}
            w="100%"
            h="full"
            pt={isDrawer ? 0 : 4}
            pb={4}
            display="flex" // <-- ДОДАНО: Для роботи flex="1"
            flexDirection="column" // <-- ДОДАНО: Для роботи flex="1"
        >
            <VStack spacing={3} align="stretch">
                <Box px={4} mb={isDrawer ? 0 : 2} display={isDrawer ? 'none' : 'block'}>
                    <Heading as="h2" size="md" color="red.600" textAlign="center">
                        EMS Control
                    </Heading>
                    <Divider my={3} />
                </Box>

                {/* Це посилання бачать всі залогінені користувачі */}
                <NavItem icon={TimeIcon} to="/trauma-journal" onClose={onClose}>
                    Журнал Пацієнтів
                </NavItem>
                
                {/* Це посилання бачать ТІЛЬКИ адміни */}
                {isAdmin && (
                    <NavItem icon={AttachmentIcon} to="/reports" onClose={onClose}>
                        Звіти
                    </NavItem>
                )}

                {/* Це посилання бачать ТІЛЬКИ адміни */}
                {isAdmin && (
                    <NavItem icon={SettingsIcon} to="/settings" onClose={onClose}>
                        Налаштування
                    </NavItem>
                )}
            </VStack>

            {/* <--- ЗМІНИ ТУТ: Додаємо кнопку виходу ---> */}
            <Box flex="1" /> {/* Цей розпірник "притисне" кнопку до низу */}

             <Box px={4} textAlign='center' mb={2}>
                <Text fontWeight="bold">{user?.username}</Text>
                <Text fontSize="sm" color="gray.500" textTransform="capitalize">
                    {user?.role === 'medic' && 'Медик'}
                    {user?.role === 'doctor' && 'Лікар'}
                    {user?.role === 'admin' && 'Адміністратор'}
                </Text>
            </Box>
            
            <Box px={4} pt={4}>
                <Button
                    width="full"
                    colorScheme="red"
                    variant="outline" // "outline" виглядає добре для дії виходу
                    leftIcon={<Icon as={FiLogOut} />}
                    onClick={() => {
                        if(onLogout) onLogout(); // Викликаємо функцію виходу
                        if(onClose) onClose(); // Закриваємо мобільне меню, якщо воно відкрите
                    }}
                >
                    Вийти
                </Button>
            </Box>

            <Divider my={2} />
            <Box px={4} textAlign="center">
                <Text fontSize="xs" color="gray.500">
                    Версія 0.1.0
                </Text>
            </Box>
        </Box>
    );

    if (isDrawer) {
        return (
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
                <DrawerOverlay />
                <DrawerContent bg={bgColor}>
                    <DrawerCloseButton _focus={{ boxShadow: "none" }} />
                    <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} color="red.600">
                        Навігація
                    </DrawerHeader>
                    <DrawerBody p={0}>
                        {React.cloneElement(sidebarContent, { onLogout, onClose })}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        );
    }
    
    return (
        <Box
            as="nav"
            pos="sticky"
            top="0"
            h="100vh"
            overflowY="auto"
            w={{ base: 'full', md: rest.w || '250px' }}
            display={display}
            boxShadow="sm"
            {...rest}
        >
            {React.cloneElement(sidebarContent, { onLogout, onClose })}
        </Box>
    );
}

export default Sidebar;