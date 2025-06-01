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
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useColorModeValue
} from '@chakra-ui/react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import {
    TimeIcon,       // Для Журналу Карт
    SettingsIcon,   // Для Налаштувань
    AttachmentIcon  // Для Звітів
    // Можна додати AddIcon, якщо потрібне посилання "Нова Картка" в сайдбарі
    // import { AddIcon } from '@chakra-ui/icons';
} from '@chakra-ui/icons';

// Компонент для елемента навігації
const NavItem = ({ icon, children, to, onClose, ...rest }) => {
    const activeBg = useColorModeValue("red.100", "red.700");
    const activeColor = useColorModeValue("red.700", "white");
    const hoverBg = useColorModeValue("gray.100", "gray.700");

    return (
        <ChakraLink
            as={RouterNavLink}
            to={to}
            onClick={onClose} // Закриваємо Drawer при кліку на посилання
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
            mx="2" // Невеликий відступ по горизонталі
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

function Sidebar({ isOpen, onClose, display, isDrawer = false, ...rest }) {
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Вміст сайдбару, який буде однаковим для Drawer та звичайного Sidebar
    const sidebarContent = (
        <Box
            bg={bgColor}
            borderRight={!isDrawer ? '1px' : 'none'} // Тільки для десктопного
            borderColor={borderColor}
            w="100%" // Займає всю ширину батька (DrawerContent або Box)
            h="full" // Займає всю висоту
            pt={isDrawer ? 0 : 4} // Відступ зверху, якщо не Drawer
            pb={4}
        >
            <VStack spacing={3} align="stretch">
                <Box px={4} mb={isDrawer ? 0 : 2} display={isDrawer ? 'none' : 'block'}> {/* Лого/Назва, прихована в Drawer, бо там є DrawerHeader */}
                    <Heading as="h2" size="md" color="red.600" textAlign="center">
                        EMS Control
                    </Heading>
                    <Divider my={3} />
                </Box>

                <NavItem icon={TimeIcon} to="/trauma-journal" onClose={onClose}>
                    Журнал Пацієнтів
                </NavItem>
                {/* 
                Приклад, якщо додати створення картки прямо з сайдбару,
                хоча зазвичай це робиться з журналу.
                <NavItem icon={AddIcon} to="/prehospital-care" onClose={onClose}>
                    Нова Картка
                </NavItem> 
                */}
                <NavItem icon={AttachmentIcon} to="/reports" onClose={onClose}>
                    Звіти
                </NavItem>
                <NavItem icon={SettingsIcon} to="/settings" onClose={onClose}>
                    Налаштування
                </NavItem>
                {/* Додайте інші NavItem тут */}

                {/* Приклад секції або просто відступ */}
                <Box flex="1" /> {/* Займає вільний простір, щоб нижні елементи були знизу */}
                
                <Divider my={2} />
                <Box px={4} textAlign="center">
                    <Text fontSize="xs" color="gray.500">
                        Версія 0.1.0
                    </Text>
                </Box>
            </VStack>
        </Box>
    );

    if (isDrawer) {
        return (
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
                <DrawerOverlay />
                <DrawerContent bg={bgColor}> {/* Встановлюємо фон для всього DrawerContent */}
                    <DrawerCloseButton _focus={{ boxShadow: "none" }} />
                    <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} color="red.600">
                        Навігація
                    </DrawerHeader>
                    <DrawerBody p={0}> {/* Забираємо внутрішні падінги DrawerBody */}
                        {sidebarContent}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        );
    }

    // Десктопна версія сайдбару
    return (
        <Box
            as="nav"
            pos="sticky" // Робить сайдбар "липким" відносно viewport
            top="0" // Прилипає до верху
            h="100vh" // Займає всю висоту екрану
            overflowY="auto" // Додає скрол, якщо вміст не влазить
            w={{ base: 'full', md: rest.w || '250px' }} // Ширина передається з App.jsx або дефолтна
            display={display} // Контролюється з App.jsx (none/flex)
            boxShadow="sm"
            {...rest} // Передаємо інші пропси, наприклад, ширину з App.jsx
        >
            {sidebarContent}
        </Box>
    );
}

export default Sidebar;