// YourParentComponent.jsx (перейменовано в PatientCard.jsx)
import React, { useState, useCallback } from 'react';
import PatientDataSection from './PatientDataSection/PatientDataSection'; // Шлях до дочірнього компонента
import { Box, Container, Button, HStack, useToast } from '@chakra-ui/react';
// import axios from 'axios'; // Якщо використовуєте axios для API запитів

// Початковий стан форми (для очищення)
const initialFormData = {
    isUnknown: false,
    gender: '',
    category: '',
    fullName: '',
    militaryId: '',
    dob: '',
    militaryRank: '',
    militaryUnit: '',
    allergyPresence: '',
    allergyDetails: '',
    eventDate: '', // Додано для повноти
    eventTime: '', // Додано для повноти
    arrivalDate: '', // Додано для повноти
    arrivalTime: '', // Додано для повноти
    transportType: '',
    arrivalSource: '',
    medicalRole: '',
    medicalUnitName: '',
    triageCategory: '',
};

function PatientCard() {
    // Стан форми тепер живе тут
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false); // Стан для блокування кнопки під час відправки
    const toast = useToast(); // Для сповіщень

    // --- Обробники змін (передаватимуться до PatientDataSection) ---

    // useCallback тут для оптимізації, щоб функції не створювались заново при кожному рендері,
    // якщо PatientDataSection обгорнутий в React.memo (але тут це не критично)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }, []); // Пустий масив залежностей, бо функція не залежить від зовнішніх змінних (крім setFormData)

    const handleRadioChange = useCallback((name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }, []);

    const handleCheckboxChange = useCallback((e) => {
        const { name, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: checked,
            // Логіка очищення полів при isUnknown=true - ОНОВЛЕНО
            ...(name === 'isUnknown' && checked && {
                fullName: '', // Очищуємо fullName
                militaryId: '',
                dob: '',
            }),
        }));
    }, []);


    // --- Обробники кнопок ---

    const handleSave = async () => {
        setIsSubmitting(true); // Блокуємо кнопку
        console.log('Дані для відправки:', { patientData: formData }); // Логуємо дані у форматі, очікуваному бекендом

        // --- Тут буде ваш API запит ---
        try {
            // Приклад з використанням fetch (замініть '/api/casualty-cards' на ваш реальний ендпоінт)
            const response = await fetch('/api/casualty-cards', { // Або ваш URL API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Додайте інші заголовки, якщо потрібно (наприклад, Authorization)
                },
                // Відправляємо дані в очікуваному бекендом форматі
                body: JSON.stringify({ patientData: formData }),
            });

            if (!response.ok) {
                // Спробувати отримати деталі помилки з відповіді
                const errorData = await response.json().catch(() => ({ message: 'Помилка відправки даних' }));
                throw new Error(errorData.message || `HTTP помилка! статус: ${response.status}`);
            }

            const result = await response.json();
            console.log('Успішна відповідь:', result);

            toast({
                title: 'Картку збережено.',
                description: "Дані постраждалого успішно збережено.",
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Опціонально: Очистити форму після успішного збереження
            // handleClear();
            // Або перенаправити користувача, або оновити список карток тощо.

        } catch (error) {
            console.error('Помилка при збереженні картки:', error);
            toast({
                title: 'Помилка збереження.',
                description: error.message || "Не вдалося зберегти дані. Спробуйте ще раз.",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false); // Розблоковуємо кнопку в будь-якому випадку
        }
        // -----------------------------
    };

    const handleClear = () => {
        setFormData(initialFormData); // Скидаємо стан до початкового
        toast({
            title: 'Форму очищено.',
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
    };

    return (
        <Container maxW="container.lg" py={5}>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <PatientDataSection
                    formData={formData}
                    handleChange={handleChange}
                    handleRadioChange={handleRadioChange}
                    handleCheckboxChange={handleCheckboxChange}
                    // Передаємо константи, якщо вони потрібні в дочірньому компоненті
                    // constants={constants}
                />
                 <HStack mt={8} spacing={4} justify="flex-end">
                    <Button onClick={handleClear} variant="outline" isDisabled={isSubmitting}>
                        Очистити форму
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSave}
                        isLoading={isSubmitting}
                        loadingText="Збереження..."
                    >
                        Зберегти картку
                    </Button>
                </HStack>
            </Box>
        </Container>
    );
}

export default PatientCard;