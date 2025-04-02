import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, useToast } from '@chakra-ui/react';
import InjuredForm from '../../components/InjuredForm/InjuredForm'; // Використовуємо ту саму форму
import * as api from '../../services/injuredApi';

function AddInjuredPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Обробник сабміту форми (тільки для створення)
  const handleFormSubmit = async (submissionData) => {
    try {
      const newRecord = await api.createInjured(submissionData);
      toast({
        title: 'Запис успішно додано!',
        description: `Додано запис для ${newRecord.name || 'бійця'}.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate('/'); // Повертаємось до списку після успішного додавання
      return newRecord; // Повертаємо створений запис (для InjuredForm)
    } catch (err) {
      console.error("Create error:", err.response ? err.response.data : err);
      const errorMsg = err.response?.data?.msg || err.message || 'Сталася помилка при створенні запису.';
      toast({
        title: 'Помилка створення',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Не перенаправляємо, щоб користувач міг виправити дані
      throw err; // Перекидаємо помилку далі, щоб форма знала про невдачу
    }
  };

  return (
    <Box>
      {/* <Heading as="h2" size="lg" mb={6}>Додати новий запис</Heading> */} {/* Заголовок тепер у формі */}
      <InjuredForm
        onSubmit={handleFormSubmit}
        // Не передаємо initialData, isEditing, onCancelEdit, бо це сторінка додавання
      />
    </Box>
  );
}

export default AddInjuredPage;