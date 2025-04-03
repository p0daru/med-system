// src/components/Sidebar/Sidebar.jsx
import React from 'react';
import {
    Box,
    VStack,
    Link as ChakraLink,
    Heading,
    Icon,
    Text,
    IconButton, // <-- Імпорт IconButton
    useColorMode, // <-- Імпорт хука теми
    Flex,         // <-- Для гнучкого розташування
    // Spacer,    // <-- Можна використовувати Spacer або flexGrow
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ViewIcon, AddIcon, DownloadIcon, SunIcon, MoonIcon } from '@chakra-ui/icons'; // <-- Додаємо іконки теми

// --- Компонент NavItem (трохи оновлений для тем) ---
const NavItem = ({ icon, to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { colorMode } = useColorMode(); // Отримуємо поточний режим

  // Визначаємо кольори залежно від теми
  const activeBg = colorMode === 'light' ? 'blue.100' : 'blue.800';
  const activeColor = colorMode === 'light' ? 'blue.700' : 'blue.100';
  const inactiveColor = colorMode === 'light' ? 'gray.700' : 'gray.200';
  const hoverBg = colorMode === 'light' ? 'gray.200' : 'gray.700';
  const hoverColor = colorMode === 'light' ? 'gray.900' : 'white';

  return (
    <ChakraLink
      as={RouterLink}
      to={to}
      p={3}
      borderRadius="md"
      display="flex"
      alignItems="center"
      fontWeight="medium"
      bg={isActive ? activeBg : 'transparent'} // Активний фон
      color={isActive ? activeColor : inactiveColor} // Колір тексту
      _hover={{
        bg: hoverBg,
        textDecoration: 'none',
        color: hoverColor,
      }}
      _focus={{ boxShadow: 'outline' }}
    >
      {icon && <Icon as={icon} mr={3} w={5} h={5} />}
      <Text>{children}</Text>
    </ChakraLink>
  );
};


function Sidebar() {
  // Отримуємо поточний режим та функцію перемикання
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      as="nav"
      pos="fixed"
      left={0}
      top={0}
      h="100vh"
      w="250px"
      // Змінюємо фон залежно від теми
    //   bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
      // Змінюємо колір тексту за замовчуванням
    //   color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
      boxShadow="md"
      zIndex="sticky"
      // Використовуємо Flex для розташування кнопки внизу
      display="flex"
      flexDirection="column"
      p={5}
    >
      {/* Заголовок */}
      <Heading size="md" mb={10} color={colorMode === 'light' ? 'gray.700' : 'whiteAlpha.900'}>
        МедСистема
      </Heading>

      {/* Основна навігація */}
      <VStack align="stretch" spacing={3} flexGrow={1}> {/* flexGrow=1 розтягує цей блок */}
        <NavItem icon={ViewIcon} to="/">
          Журнал
        </NavItem>
        <NavItem icon={AddIcon} to="/add-casualty">
          DD 1380
        </NavItem>
        <NavItem icon={DownloadIcon} to="/reports">
          Генерація Звітів
        </NavItem>
        {/* Додавайте інші посилання сюди */}
      </VStack>

      {/* Кнопка перемикання теми внизу */}
      <IconButton
        aria-label="Змінити тему"
        // Вибираємо іконку залежно від поточної теми
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode} // Функція перемикання
        variant="ghost" // Прозорий фон
        alignSelf="center" // Центруємо кнопку горизонтально
        mt={6} // Додаємо відступ зверху
        color={colorMode === 'light' ? 'gray.600' : 'yellow.300'} // Колір іконки
        _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.700' }}
      />
    </Box>
  );
}

export default Sidebar;