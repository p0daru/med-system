// src/components/CasualtyCard/AdministrativeDataSection.jsx
import React, { useCallback } from 'react'; // Імпортуємо useCallback
import { Box, Heading, VStack, SimpleGrid, FormControl, FormLabel, Input, Textarea, Text } from '@chakra-ui/react';
import { adminDataStyles, commonStyles } from './casualtyCardStyles'; 

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
      {/* Section 7: Notes */}
      <FormControl {...adminDataStyles.notesControl}>
        <FormLabel {...adminDataStyles.label}>7. Нотатки</FormLabel> {/* Use label style */}
        <Textarea
          name="notes"
          value={data?.notes || ''}
          onChange={handleChange}
          isDisabled={isDisabled}
          placeholder="Додаткова інформація..."
          rows={4}
        />
      </FormControl>

      {/* Section 8: Provider Data */}
      <Heading {...adminDataStyles.section8Heading}>8. Дані Особи, яка надала допомогу</Heading>
      <SimpleGrid {...adminDataStyles.providerGrid}>
        <FormControl id="providerFullName">
          <FormLabel {...adminDataStyles.label}>ПІБ (Прізвище, Ім'я)</FormLabel> {/* Use label style */}
          <Input
            name="providerFullName"
            value={data?.providerFullName || ''}
            onChange={handleChange}
            isDisabled={isDisabled}
            placeholder="Іваненко Іван"
            autoComplete="name"
            {...commonStyles.inputSm} // Use common style
          />
        </FormControl>
        <FormControl id="providerLast4SSN">
          <FormLabel {...adminDataStyles.label}>Останні 4 НСС</FormLabel> {/* Use label style */}
          <Input
            name="providerLast4SSN"
            value={data?.providerLast4SSN || ''}
            onChange={handleSsnChange}
            isDisabled={isDisabled}
            placeholder="1234"
            maxLength={4}
            inputMode="numeric"
             {...commonStyles.inputSm} // Use common style
          />
        </FormControl>
      </SimpleGrid>

      {/* Administrative Info */}
      <Heading {...adminDataStyles.adminInfoHeading}>Адміністративна Інформація</Heading>
      <VStack {...adminDataStyles.adminInfoVStack}>
        <SimpleGrid {...adminDataStyles.timestampsGrid}>
          {/* Recorded By */}
          <FormControl id="recordedBy">
            <FormLabel {...adminDataStyles.label}>Запис створив/редагував</FormLabel>
            <Input
              type="text"
              name="recordedBy"
              value={data?.recordedBy || 'Автоматично'}
              isReadOnly
              isDisabled // Visually disabled
              _disabled={commonStyles.disabledInput} // Apply disabled style from common
              placeholder="Користувач системи"
               {...commonStyles.inputSm}
            />
          </FormControl>

          {/* Timestamps */}
          {(data?.createdAt || data?.updatedAt) && (
            <>
              {data?.createdAt && (
                <FormControl>
                  <FormLabel {...adminDataStyles.label}>Час Створення Запису</FormLabel>
                  <Input
                    type="text"
                    value={formatDateTime(data.createdAt)}
                    isReadOnly
                    isDisabled
                    _disabled={commonStyles.disabledInput} // Apply disabled style
                     {...commonStyles.inputSm}
                  />
                </FormControl>
              )}
              {data?.updatedAt && (
                 <FormControl>
                  <FormLabel {...adminDataStyles.label}>Час Останнього Оновлення</FormLabel>
                  <Input
                    type="text"
                    value={formatDateTime(data.updatedAt)}
                    isReadOnly
                    isDisabled
                     _disabled={commonStyles.disabledInput} // Apply disabled style
                     {...commonStyles.inputSm}
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