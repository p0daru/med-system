import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Для переходу на інші сторінки
import {
  Box,
  Heading,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Spacer,
  Icon
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import InjuredList from '../../components/InjuredList/InjuredList'; // Компонент таблиці
import * as api from '../../services/injuredApi';

function InjuredListPage() {
  const [injuredList, setInjuredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate(); // Хук для навігації

  // Функція завантаження даних
  const fetchInjured = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllInjured();
      setInjuredList(data);
    } catch (err) {
      console.error("Fetch list error:", err);
      const errorMsg = err.response?.data?.msg || err.message || 'Не вдалося завантажити список.';
      setError(`Помилка завантаження списку: ${errorMsg}`);
      setInjuredList([]);
      toast({
        title: 'Помилка завантаження',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // Залежність від toast

  // Завантаження даних при монтуванні
  useEffect(() => {
    fetchInjured();
  }, [fetchInjured]);

  // Обробник для переходу на сторінку деталей
  const handleViewDetails = (id) => {
    navigate(`/injured/${id}`); // Переходимо на /injured/айді_пораненого
  };

   // Обробник для переходу на сторінку додавання
  const handleAddClick = () => {
      navigate('/add'); // Переходимо на сторінку /add
  }

  return (
    <Box>
      <Flex mb={4} alignItems="center">
          <Heading as="h2" size="lg">Журнал обліку поранених</Heading>
          <Spacer />
          <Button colorScheme="green" leftIcon={<Icon as={FaPlus} />} onClick={handleAddClick}>
              Додати запис
          </Button>
      </Flex>


      {loading && <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" display="block" mx="auto" my={6} />}

      {error && !loading && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <InjuredList
          injuredList={injuredList}
          onViewDetails={handleViewDetails} // Передаємо функцію для кліку на рядок/кнопку
          // Видаляємо onDelete та onEdit звідси, вони будуть на сторінці деталей
        />
      )}
    </Box>
  );
}

export default InjuredListPage;