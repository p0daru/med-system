// src/components/CasualtyCard/AdministrativeDataSection.jsx
import React, { useCallback } from 'react'; // Імпортуємо useCallback
import { Box, Heading, VStack, SimpleGrid, FormControl, FormLabel, Input, Textarea, Text } from '@chakra-ui/react';

function AdministrativeDataSection({ data, setFormData, isDisabled }) {

  // Обробник для звичайних полів вводу
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }, [setFormData]); // Залежність від setFormData

  // Обробник для поля НСС, що дозволяє лише цифри та обмежує довжину
  const handleSsnChange = useCallback((e) => {
    const { name, value } = e.target;
    // Видаляємо всі не-цифрові символи
    const numericValue = value.replace(/\D/g, '');
    // Обмежуємо довжину до 4 символів
    const truncatedValue = numericValue.slice(0, 4);
    setFormData(prevData => ({ ...prevData, [name]: truncatedValue }));
  }, [setFormData]); // Залежність від setFormData


  // Функція для форматування дати/часу
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const dateObj = new Date(isoString);
      if (isNaN(dateObj.getTime())) return 'Недійсна дата';
      // Формат: 27.10.2023, 15:30
      return dateObj.toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24-годинний формат
      });
    } catch (e) {
      console.error("Помилка форматування дати:", isoString, e);
      return 'Помилка';
    }
  };

  return (
    <Box>
         {/* Розділ 7: Нотатки */}
         <FormControl id="notes" mb={6}> {/* Додано відступ знизу */}
            <FormLabel fontSize="sm">7. Нотатки</FormLabel>
            <Textarea
                name="notes"
                value={data?.notes || ''} // Безпечний доступ
                onChange={handleChange}
                isDisabled={isDisabled}
                placeholder="Додаткова інформація, роз'яснення, динаміка стану..."
                rows={4}
            />
        </FormControl>

        {/* Розділ 8: Дані особи, яка надала допомогу */}
        <Heading size="sm" mb={2}>8. Дані Особи, яка надала допомогу</Heading>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}> {/* Додано відступ знизу */}
             <FormControl id="providerFullName">
                 <FormLabel fontSize="sm">ПІБ (Прізвище, Ім'я)</FormLabel>
                 <Input
                     name="providerFullName"
                     value={data?.providerFullName || ''} // Безпечний доступ
                     onChange={handleChange}
                     isDisabled={isDisabled}
                     placeholder="Іваненко Іван"
                     autoComplete="name" // Підказка для автозаповнення
                 />
             </FormControl>
             <FormControl id="providerLast4SSN">
                 <FormLabel fontSize="sm">Останні 4 НСС</FormLabel>
                 <Input
                     name="providerLast4SSN"
                     value={data?.providerLast4SSN || ''} // Безпечний доступ
                     // Використовуємо спеціальний обробник для НСС
                     onChange={handleSsnChange}
                     isDisabled={isDisabled}
                     placeholder="1234"
                     maxLength={4} // Залишаємо для візуального обмеження
                     // pattern="\d{4}" // Патерн корисний для нативної валідації, але handleSsnChange гарантує цифри
                     inputMode="numeric" // Підказка для мобільної клавіатури
                 />
             </FormControl>
         </SimpleGrid>

        {/* Адміністративна інформація про запис картки */}
        <Heading size="sm" mb={2}>Адміністративна Інформація</Heading>
        <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* Поле "Запис створив/редагував" часто заповнюється автоматично системою */}
                <FormControl id="recordedBy">
                    <FormLabel fontSize="sm">Запис створив/редагував</FormLabel>
                    <Input
                        type="text"
                        name="recordedBy"
                        value={data?.recordedBy || 'Автоматично'} // Показуємо 'Автоматично', якщо поле порожнє
                        isReadOnly // Робимо поле тільки для читання
                        isDisabled // І візуально неактивним
                        _disabled={{ bg: "gray.100", color: "gray.700", cursor: "not-allowed", opacity: 0.8 }} // Стилізація для isDisabled
                        placeholder="Користувач системи"
                    />
                </FormControl>

                 {/* Поля для відображення часу створення/оновлення (тільки для читання) */}
                 {/* Перевіряємо наявність дат перед відображенням */}
                {(data?.createdAt || data?.updatedAt) && ( // Показувати блок лише якщо є хоча б одна дата
                    <>
                        {data?.createdAt && (
                            <FormControl>
                                <FormLabel fontSize="sm">Час Створення Запису</FormLabel>
                                <Input
                                    type="text"
                                    value={formatDateTime(data.createdAt)}
                                    isReadOnly
                                    isDisabled
                                    _disabled={{ bg: "gray.100", color: "gray.700", cursor: "not-allowed", opacity: 0.8 }}
                                />
                            </FormControl>
                        )}
                        {/* Показувати час оновлення, лише якщо він існує */}
                        {data?.updatedAt && (
                            <FormControl>
                                <FormLabel fontSize="sm">Час Останнього Оновлення</FormLabel>
                                <Input
                                    type="text"
                                    value={formatDateTime(data.updatedAt)}
                                    isReadOnly
                                    isDisabled
                                    _disabled={{ bg: "gray.100", color: "gray.700", cursor: "not-allowed", opacity: 0.8 }}
                                />
                            </FormControl>
                        )}
                    </>
                )}
            </SimpleGrid>
        </VStack>
    </Box>
  );
}

export default AdministrativeDataSection;