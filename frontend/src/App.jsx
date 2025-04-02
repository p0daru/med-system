import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Flex, useColorMode, Button, Spacer, Heading } from '@chakra-ui/react';
import Sidebar from './components/Sidebar/Sidebar'; // Новий компонент бічного меню
import InjuredListPage from './pages/InjuredListPage/InjuredListPage'; // Сторінка зі списком
import AddInjuredPage from './pages/AddInjuredPage/AddInjuredPage';   // Сторінка додавання
import InjuredDetailPage from './pages/InjuredDetailPage/InjuredDetailPage'; // Сторінка деталей
import EditInjuredPage from './pages/EditInjuredPage/EditInjuredPage'; 
// import NotFoundPage from './pages/NotFoundPage'; // (Опціонально) Сторінка 404

function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex minH="100vh"> {/* Розтягуємо на весь екран */}
      {/* Бічне меню */}
      <Sidebar />

      {/* Основний контент */}
      <Box flex="1" p={{ base: 4, md: 6 }}> {/* Займає решту місця */}
        {/* Хедер (якщо потрібен над контентом) */}
        <Flex mb={6} alignItems="center">
           <Heading as="h1" size="xl">Система обліку поранених</Heading>
           <Spacer />
           <Button onClick={toggleColorMode} variant="outline" size="sm">
              {colorMode === 'light' ? '🌙 Темна' : '☀️ Світла'}
           </Button>
        </Flex>

        {/* Маршрутизація контенту */}
        <Routes>
          {/* Головна сторінка - Журнал */}
          <Route path="/" element={<InjuredListPage />} />

          {/* Сторінка додавання нового запису */}
          <Route path="/add" element={<AddInjuredPage />} />

          {/* Сторінка деталей конкретного пораненого */}
          {/* :id буде динамічним параметром */}
          <Route path="/injured/:id" element={<InjuredDetailPage />} />

          {/* --- редагування --- */}
          <Route path="/injured/:id/edit" element={<EditInjuredPage />} />

          {/* Сторінка не знайдено (опціонально) */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
           <Route path="*" element={<Heading size="lg">Сторінку не знайдено (404)</Heading>} />
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;