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
    Button,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useColorModeValue
} from '@chakra-ui/react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { TimeIcon, SettingsIcon, AttachmentIcon } from '@chakra-ui/icons';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

// Компонент для елемента навігації
const NavItem = ({ icon, children, to, onClose, ...rest }) => {
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

// Основний компонент Sidebar
function Sidebar({ isOpen, onClose, display, isDrawer = false, onLogout, ...rest }) { 
    const { isAdmin, user } = useAuth(); 
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Функція, що повертає назву ролі українською
    const getRoleName = (role) => {
        switch (role) {
            case 'medic': return 'Медик';
            case 'doctor': return 'Лікар';
            case 'admin': return 'Адміністратор';
            default: return 'Невідома роль';
        }
    };

    const sidebarContent = (
        <Box
            bg={bgColor}
            borderRight={!isDrawer ? '1px' : 'none'}
            borderColor={borderColor}
            w="100%"
            h="full"
            pt={isDrawer ? 0 : 4}
            pb={4}
            display="flex"
            flexDirection="column"
        >
            <VStack spacing={3} align="stretch">
                <Box px={4} mb={isDrawer ? 0 : 2} display={isDrawer ? 'none' : 'block'}>
                    <Heading as="h2" size="md" color="red.600" textAlign="center">
                        EMS Control
                    </Heading>
                    <Divider my={3} />
                </Box>

                <NavItem icon={TimeIcon} to="/trauma-journal" onClose={onClose}>
                    Журнал Пацієнтів
                </NavItem>
                
                {isAdmin && (
                    <NavItem icon={AttachmentIcon} to="/reports" onClose={onClose}>
                        Звіти
                    </NavItem>
                )}

                {isAdmin && (
                    <NavItem icon={SettingsIcon} to="/settings" onClose={onClose}>
                        Налаштування
                    </NavItem>
                )}
            </VStack>

            {/* Блок з інформацією про користувача та кнопкою виходу */}
            <Box flex="1" /> {/* Розпірник, що притискає наступний блок до низу */}

             <Box px={4} textAlign='center' mb={2}>
                <Text fontWeight="bold">{user?.username || 'Користувач'}</Text>
                <Text fontSize="sm" color="gray.500" textTransform="capitalize">
                    {getRoleName(user?.role)}
                </Text>
            </Box>
            
            <Box px={4} pt={4}>
                <Button
                    width="full"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<Icon as={FiLogOut} />}
                    onClick={() => {
                        // Викликаємо функцію onLogout, передану з App.jsx
                        if (onLogout) onLogout();
                        // Закриваємо мобільне меню, якщо воно було відкрите
                        if (onClose) onClose();
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

    // Логіка для відображення як Drawer на мобільних
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
                        {sidebarContent}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        );
    }
    
    // Відображення як статичної панелі на десктопі
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
            {sidebarContent}
        </Box>
    );
}

export default Sidebar;