// src/components/CasualtyCard/InjuryMechanismSection.jsx
import React from 'react';
import { Box, Heading, VStack, CheckboxGroup, Stack, Checkbox, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';

const ALL_MECHANISMS = ['Артобстріл', 'Тупа травма', 'Опік', 'Падіння з висоти', 'Граната', 'Вогнепальна рана', 'СВП', 'Протипіхотна міна', 'ДТП', 'РПГ']; // Без 'Інше'

function InjuryMechanismSection({ data, setFormData, isDisabled }) {

  const handleCheckboxChange = (values) => {
    // Оновлюємо масив вибраних механізмів
    // Якщо 'Інше' знято, очищаємо mechanismOfInjuryOther
    const otherCleared = !values.includes('Інше') ? { mechanismOfInjuryOther: '' } : {};
    setFormData({ ...data, mechanismOfInjury: values, ...otherCleared });
  };

   const handleOtherTextChange = (e) => {
     setFormData({ ...data, mechanismOfInjuryOther: e.target.value });
   };

   const handleDescriptionChange = (e) => {
     setFormData({ ...data, injuryDescription: e.target.value });
   };

    // Поточні вибрані значення + 'Інше', якщо є текст
   const currentSelection = data.mechanismOfInjuryOther ? [...data.mechanismOfInjury, 'Інше'] : data.mechanismOfInjury;


  return (
    <Box>
      <Heading size="md" mb={4}>2. Інформація про Поранення</Heading>
      <VStack align="stretch" spacing={4}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="bold">Механізм поранення (позначте все потрібне)</FormLabel>
          <CheckboxGroup colorScheme='blue' value={currentSelection} onChange={handleCheckboxChange}>
            <Stack spacing={[1, 3]} direction={['column', 'row']} wrap="wrap">
              {ALL_MECHANISMS.map((mech) => (
                <Checkbox key={mech} value={mech} isDisabled={isDisabled}>{mech}</Checkbox>
              ))}
              <Checkbox value="Інше" isDisabled={isDisabled}>Інше</Checkbox>
            </Stack>
          </CheckboxGroup>
        </FormControl>

        {data.mechanismOfInjury.includes('Інше') && (
          <FormControl>
            <FormLabel fontSize="sm">Уточніть "Інше"</FormLabel>
            <Input
              name="mechanismOfInjuryOther"
              value={data.mechanismOfInjuryOther || ''}
              onChange={handleOtherTextChange}
              isDisabled={isDisabled}
              placeholder="Опишіть інший механізм"
            />
          </FormControl>
        )}

         {/* <FormControl>
          <FormLabel fontSize="sm" fontWeight="bold">Інформація про поранення / Опис / Відмітки</FormLabel>
           <Textarea
             name="injuryDescription"
             value={data.injuryDescription || ''}
             onChange={handleDescriptionChange}
             isDisabled={isDisabled}
             placeholder="Опишіть місця та характер поранень, відсоток опіків тощо. (Діаграма тіла не реалізована)"
             rows={3}
           />
        </FormControl> */}
      </VStack>
    </Box>
  );
}
export default InjuryMechanismSection;