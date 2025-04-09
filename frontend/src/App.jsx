// src/App.jsx
import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom'; // Імпорти для роутінгу
import { Box, Container, Heading, Flex, Link as ChakraLink, Spacer } from '@chakra-ui/react'; // Компоненти Chakra

// Імпортуємо ваші сторінки/компоненти
// import CasualtyCard from './components/CasualtyCard/CasualtyCard';
import CasualtyLog from './components/CasualtyLog/CasualtyLog';
// import CasualtyDetailPage from './pages/CasualtyDetailPage';

import PatientCard from './components/PatientCard/PatientCard';
import PatientDataSection from './components/PatientCard/PatientDataSection/PatientDataSection';
import Sidebar from './components/Sidebar/Sidebar'; 

function App() {
  const sidebarWidth = '250px'; // Винесемо ширину в змінну для зручності

  return (
    <Box display="flex"> {/* Головний Flex контейнер */}

      {/* Рендеримо Sidebar */}
      <Sidebar />

      {/* Основна Область Контенту */}
      <Box
        as="main" // Семантичний тег
        flex="1" // Займає весь доступний простір праворуч
        ml={sidebarWidth} // !!! Важливо: Додаємо лівий відступ, рівний ширині Sidebar
        p={8} // Додаємо відступи для самого контенту
        // Якщо контенту може бути багато, можна додати прокрутку
        // h="100vh"
        // overflowY="auto"
      >
        {/* Визначення Маршрутів залишається тут */}
        <Routes>
          {/* Головна сторінка - показує список */}
          {/* <Route path="/" element={<CasualtyLog />} />

          <Route path="/add-casualty" element={<CasualtyCard />} />

          <Route path="/casualty/new" element={<CasualtyCard />} />

          <Route path="/casualty/:id" element={<CasualtyCard />} /> */}

          <Route path="/" element={<CasualtyLog />} />

          <Route path="/add-casualty" element={<PatientCard />} />

          {/* <Route path="/casualty/new" element={<PatientCard />} />

          <Route path="/casualty/:id" element={<PatientCard />} /> */}


          {/* Деталі */}
          {/* <Route path="/casualty/:id" element={<CasualtyDetailPage />} /> */}

          {/* Редагування */}
          {/* <Route path="/edit-casualty/:id" element={<CasualtyCard />} /> */}

          {/* Додамо маршрут для сторінки звітів (поки що заглушка) */}
          <Route path="/reports" 
          // element={
          //   <Box>
          //     <Heading size="lg">Генерація Звітів</Heading>
          //     <Text mt={4}>Ця сторінка знаходиться в розробці.</Text>
          //   </Box>
          // }
           />

          {/* Маршрут для неіснуючих сторінок (опціонально) */}
          {/* <Route path="*" element={<div>Сторінку не знайдено (404)</div>} /> */}
        </Routes>
      </Box>

    </Box>
  );
}

export default App;