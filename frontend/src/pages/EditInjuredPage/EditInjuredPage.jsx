// frontend/src/pages/EditInjuredPage/EditInjuredPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Spinner, Alert, AlertIcon, useToast, Button, VStack, Heading } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import InjuredForm from '../../components/InjuredForm/InjuredForm'; // Використовуємо той самий компонент форми
import * as api from '../../services/injuredApi';

function EditInjuredPage() {
  const { id } = useParams(); // Отримуємо ID з URL
  const navigate = useNavigate();
  const toast = useToast();

  const [initialData, setInitialData] = useState(null); // Дані для заповнення форми
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Додаємо стан для сабміту

  // Завантаження існуючих даних
  const fetchDataForEdit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInjuredById(id);
      setInitialData(data); // Зберігаємо отримані дані
    } catch (err) {
      console.error("Fetch data for edit error:", err);
      const errorMsg = err.response?.status === 404
        ? 'Запис для редагування не знайдено.'
        : (err.response?.data?.msg || err.message || 'Не вдалося завантажити дані для редагування.');
      setError(errorMsg);
      toast({
        title: 'Помилка завантаження даних',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDataForEdit();
  }, [fetchDataForEdit]);

  // Обробник сабміту форми (оновлення)
  const handleFormSubmit = async (submissionData) => {
      // Не встановлюємо isSubmitting тут, це зробить форма
      // Але можна повернути Promise для обробки в формі
      // Або встановити глобальний isSubmitting, якщо потрібно блокувати навігацію
       setIsSubmitting(true); // Встановлюємо перед запитом
      try {
          const updatedRecord = await api.updateInjured(id, submissionData);
          toast({
              title: 'Запис успішно оновлено!',
              status: 'success',
              duration: 3000,
              isClosable: true,
          });
          navigate(`/injured/${id}`); // Повертаємось на сторінку деталей після успіху
          return updatedRecord; // Повертаємо для форми (необов'язково тут)
      } catch (err) {
          console.error("Update error:", err.response ? err.response.data : err);
          const errorMsg = err.response?.data?.msg || err.message || 'Сталася помилка при оновленні запису.';
          toast({
              title: 'Помилка оновлення',
              description: errorMsg,
              status: 'error',
              duration: 5000,
              isClosable: true,
          });
           setIsSubmitting(false); // Скидаємо при помилці
           throw err; // Перекидаємо помилку, щоб форма знала про невдачу
      }
      // finally блоку тут не потрібно, бо isSubmitting скидається при помилці,
      // а при успіху відбувається навігація
  };

   // Обробник скасування редагування
  const handleCancelEdit = () => {
    navigate(`/injured/${id}`); // Повертаємось на сторінку деталей
    // або navigate(-1); // Повернутись на попередню сторінку
  };

  // --- Рендеринг ---
  if (loading) {
    return <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" display="block" mx="auto" my={6} />;
  }

  if (error) {
    return (
      <VStack spacing={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        {/* Кнопка повернення або на деталі, або на список */}
        <Button onClick={() => navigate(`/injured/${id}`)} leftIcon={<FaArrowLeft />}>
          Повернутись до деталей
        </Button>
         <Button onClick={() => navigate('/')} variant="outline" size="sm">
           До журналу
        </Button>
      </VStack>
    );
  }

  if (!initialData) {
    // Мало б бути оброблено error, але про всяк випадок
    return <Text>Не вдалося завантажити дані.</Text>;
  }


  return (
    <Box>
      {/* Передаємо initialData та isEditing=true у форму */}
      <InjuredForm
        onSubmit={handleFormSubmit}
        initialData={initialData} // Передаємо завантажені дані
        isEditing={true}          // Вказуємо, що це режим редагування
        onCancelEdit={handleCancelEdit} // Передаємо функцію скасування
        isSubmittingParent={isSubmitting} // Передаємо стан сабміту (опціонально, для блокування кнопки Cancel)
      />
    </Box>
  );
}

export default EditInjuredPage;