import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Використовуємо Link з роутера
import { Box, VStack, Heading, Link, Divider, Icon, Text } from '@chakra-ui/react';
import { FaHome, FaPlus, FaListAlt } from 'react-icons/fa'; // Іконки для меню

function Sidebar() {
  const linkStyles = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 15px',
    borderRadius: 'md',
    _hover: {
      bg: 'gray.100',
      _dark: { bg: 'gray.700' },
      textDecoration: 'none',
    },
    color: 'gray.700',
    _dark: {
        color: 'gray.200'
    }
  };

  return (
    <Box
      w={{ base: '60px', md: '250px' }} // Ширина меню (згортається на моб)
      bg="gray.50"
      p={4}
      borderRight="1px solid"
      borderColor="gray.200"
      _dark={{
        bg: 'gray.800',          // Фон для темного режиму
        borderColor: 'gray.700' // Колір рамки для темного режиму (або gray.600, якщо ви цього хочете)
      }}
      position="sticky" // Робимо меню "липким"
      top="0"
      height="100vh" // На всю висоту
    >
      <Heading size="md" mb={6} display={{ base: 'none', md: 'block' }}>
        Меню
      </Heading>
      <VStack align="stretch" spacing={3}>
        <Link as={RouterLink} to="/" sx={linkStyles}>
          <Icon as={FaListAlt} mr={{ base: 0, md: 3 }} />
          <Text display={{ base: 'none', md: 'inline' }}>Журнал</Text>
        </Link>
        <Link as={RouterLink} to="/add" sx={linkStyles}>
           <Icon as={FaPlus} mr={{ base: 0, md: 3 }} />
           <Text display={{ base: 'none', md: 'inline' }}>Додати запис</Text>
        </Link>
        {/* Можна додати інші посилання */}
        {/* <Divider />
        <Link as={RouterLink} to="/settings" sx={linkStyles}>Налаштування</Link> */}
      </VStack>
    </Box>
  );
}

export default Sidebar;