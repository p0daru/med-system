// PatientCard.jsx
import React, { useState, useCallback } from 'react';
import {
    Box, Container, Button, HStack, useToast, VStack
} from '@chakra-ui/react';

// Імпорт констант
// Припускаємо, що файл patientCardConstants.js знаходиться в тій же директорії, що і PatientCard.jsx
// і експортує об'єкт constants, який містить initialFormData, medicationKeys, API_ENDPOINT і списки опцій
import constants from './patientCardConstants'; // Змінено імпорт

// Імпорт компонентів секцій
import PatientDataSection from './PatientDataSection/PatientDataSection';
import PriorAidSection from './PriorAidSection/PriorAidSection';

// Перевіряємо, чи константи завантажились і мають потрібну структуру
const initialFormDataToUse = constants?.initialFormData || {}; // Використовуємо initialFormData з констант або пустий об'єкт
const medicationKeysToUse = constants?.priorAid?.medicationKeys || []; // Використовуємо ключі з констант або пустий масив
const apiEndpointToUse = constants?.API_ENDPOINT || '/api/default-endpoint'; // Використовуємо API_ENDPOINT або дефолтний

function PatientCard() {
   // --- State ---
   const [formData, setFormData] = useState(initialFormDataToUse);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const toast = useToast();

   // --- Обробники Змін ---

   const handleChange = useCallback((e) => {
       const { name, value } = e.target;
       setFormData((prevData) => ({
           ...prevData,
           [name]: value,
       }));
   }, []);

   const handleRadioChange = useCallback((name, value) => {
       setFormData((prevData) => {
           const newData = { ...prevData, [name]: value };
           if (name === 'originType') {
               newData.medicalUnitName = value === 'location' ? '' : prevData.medicalUnitName;
               newData.medicalRole = value === 'location' ? '' : prevData.medicalRole;
               newData.arrivalLocationName = value === 'medical_unit' ? '' : prevData.arrivalLocationName;
           } else if (name === 'allergyPresence' && (value === 'Ні' || value === 'Невідомо')) {
               newData.allergyDetails = '';
           } else if (name === 'category' && value !== 'Військовослужбовець') {
               newData.militaryId = '';
               newData.militaryRank = '';
               newData.militaryUnit = '';
           }
           return newData;
       });
   }, []);

   const handleCheckboxChange = useCallback((e) => {
       const { name, checked } = e.target;
       setFormData((prevData) => ({
           ...prevData,
           [name]: checked,
           ...(name === 'isUnknown' && checked && {
               fullName: '',
               militaryId: '',
               dob: '',
           }),
       }));
   }, []);

   const handleNestedStateChange = useCallback((fieldPath, value) => {
       setFormData(prevData => {
           const keys = fieldPath.split('.');
           const newData = structuredClone(prevData);
           let currentLevel = newData;
           for (let i = 0; i < keys.length - 1; i++) {
               const currentKey = keys[i];
                if (!currentLevel[currentKey]) {
                   currentLevel[currentKey] = {};
               }
               currentLevel = currentLevel[currentKey];
           }
           const finalKey = keys[keys.length - 1];
           currentLevel[finalKey] = value;

           // Логіка Очищення для PriorAid
           if (fieldPath === 'priorAid.aidProvider' && (value === 'Невідомо' || value === 'Не надавалась')) {
                if (newData.priorAid) {
                    newData.priorAid.aidTime = '';
                    newData.priorAid.aidDate = '';
                }
           }
           if (fieldPath === 'priorAid.interventions.otherIntervention' && !value) {
                if (newData.priorAid?.interventions) {
                    newData.priorAid.interventions.otherInterventionDetails = '';
                }
           }
           medicationKeysToUse.forEach(key => {
               if (fieldPath === `priorAid.medications.${key}.given` && !value) {
                   if (newData.priorAid?.medications?.[key]) {
                        newData.priorAid.medications[key].details = { dose: '', route: '', time: '' };
                   }
               }
           });

           return newData;
       });
   }, []);

    // --- Дії Кнопок ---

      // Оновлений handleSave, який відправляє ВЕСЬ поточний formData
      const handleSave = async () => {
        setIsSubmitting(true);
        // Готуємо дані для відправки - тепер просто весь поточний formData
        // Бекенд повинен бути готовий прийняти початкові/порожні значення для полів Секції 1
        const dataToSend = { patientData: formData };
        console.log('Дані для відправки (весь поточний formData):', JSON.stringify(dataToSend, null, 2));

        // --- API Запит ---
        try {
            const response = await fetch(apiEndpointToUse, { // Використовуємо константу
                method: 'POST',
                headers: { 'Content-Type': 'application/json', /* + інші заголовки */ },
                body: JSON.stringify(dataToSend), // Відправляємо весь об'єкт formData під ключем patientData
            });

            if (!response.ok) {
                let errorDetails = `HTTP помилка! статус: ${response.status}`;
                try { const errorData = await response.json(); errorDetails = errorData.message || JSON.stringify(errorData); }
                catch (parseError) { errorDetails = await response.text() || errorDetails; }
                throw new Error(errorDetails);
            }

            const result = await response.json();
            console.log('Успішна відповідь:', result);
            toast({
                title: 'Картку збережено.',
                description: "Дані успішно збережено (Секція 1 з поточними/початковими значеннями).",
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
            // handleClear(); // Можна розкоментувати для очищення після збереження
        } catch (error) {
            console.error('Помилка при збереженні картки:', error);
            toast({
                title: 'Помилка збереження.',
                description: error.message || "Не вдалося зберегти дані.",
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsSubmitting(false);
        }
        // -----------------
    };


    const handleClear = () => {
        // Використовуємо initialFormDataToUse
        setFormData(initialFormDataToUse);
        toast({
            title: 'Форму очищено.',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top',
        });
    };

    // --- Рендеринг ---
    return (
        <Container maxW="container.xl" py={6}>
            <VStack spacing={8} align="stretch">
                {/* --- Секція 1 --- */}
                {/* <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg">
                    <PatientDataSection
                        formData={formData}
                        handleChange={handleChange}
                        handleRadioChange={handleRadioChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                </Box> */}

                {/* --- Секція 2 --- */}
                <Box p={6} shadow="md" borderWidth="1px" borderRadius="lg">
                    <PriorAidSection
                         formData={formData}
                         handleNestedStateChange={handleNestedStateChange}
                    />
                </Box>

                {/* --- Кнопки --- */}
               <HStack spacing={5} justify="flex-end" mt={2}>
                    <Button onClick={handleClear} variant="outline" isDisabled={isSubmitting} minW="120px">
                        Очистити
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave} isLoading={isSubmitting} loadingText="Збереження..." minW="150px">
                        Зберегти картку
                    </Button>
                </HStack>
            </VStack>
        </Container>
    );
}

export default PatientCard;