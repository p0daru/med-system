// frontend/src/components/InjuredForm/InjuredForm.jsx
import React, { useState, useEffect } from 'react';
import { generateMockInjuredData } from '../../utils/mockDataGenerator'; // Переконайтесь, що шлях правильний
import {
    Box, Heading, FormControl, FormLabel, Input, Select, Textarea, Button,
    SimpleGrid, Text, Flex, Alert, AlertIcon, VStack, NumberInput,
    NumberInputField, Icon, Spacer,
    // NumberInputStepper, // Розкоментуйте, якщо потрібні стрілки
    // NumberIncrementStepper,
    // NumberDecrementStepper,
    // ButtonSpinner, // Використовується автоматично в Button isLoading
} from '@chakra-ui/react';
import { FaDice, FaSave, FaTimes } from 'react-icons/fa';

// Початкові дані форми (з усіма полями)
const initialFormData = {
    name: '', callSign: '', unit: '', bloodType: 'Unknown', allergies: '',
    incidentTimestamp: new Date().toISOString().substring(0, 16), incidentLocation: '', mechanismOfInjury: '',
    medicalStatus: 'Unknown', initialAssessmentNotes: '', evacuationStatus: 'Unknown', evacuationPriority: 'Unknown',
    evacuationDestination: '', recordEnteredBy: '', notes: '', injuryType: 'Unknown', injuryLocation: '',
    injurySeverity: 'Unknown', injuryNotes: '', vitalTimestamp: new Date().toISOString().substring(0, 16),
    vitalPulse: '', vitalBp: '', vitalRespiration: '', vitalSpo2: '', vitalTemperature: '', vitalConsciousness: 'Unknown',
    treatmentTimestamp: new Date().toISOString().substring(0, 16), treatmentAction: '', treatmentProvider: '',
};

// Компонент форми, що працює для додавання та редагування
function InjuredForm({
    onSubmit, // Функція, що викликається при сабміті (створення або оновлення)
    initialData = null, // Початкові дані для заповнення (null при додаванні)
    isEditing = false, // Прапор режиму редагування
    onCancelEdit = () => {}, // Функція для кнопки "Скасувати"
    isSubmittingParent = false // Стан сабміту з батьківського компонента (опціонально)
}) {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false); // Локальний стан сабміту
    const [internalError, setInternalError] = useState(null); // Помилки валідації або API

    // Ефект для заповнення форми даними при редагуванні
    useEffect(() => {
        if (isEditing && initialData) {
            console.log("Populating form with initial data for editing:", initialData);
            const populatedData = { ...initialFormData }; // Починаємо з порожньої структури

            // Функція для безпечного форматування дати
            const formatISODateForInput = (isoString) => {
                if (!isoString) return '';
                try {
                    const dateValue = new Date(isoString);
                    if (!isNaN(dateValue.getTime())) {
                        return dateValue.toISOString().substring(0, 16);
                    }
                } catch (e) {
                    console.error(`Error parsing date: ${isoString}`, e);
                }
                return ''; // Повертаємо порожній рядок у разі помилки
            };

            // Копіюємо основні поля
            Object.keys(populatedData).forEach(key => {
                if (initialData[key] !== undefined && initialData[key] !== null) {
                     // Дати форматуємо окремо
                    if (!['injuries', 'vitalSignsHistory', 'treatments', 'incidentTimestamp', 'vitalTimestamp', 'treatmentTimestamp'].includes(key)) {
                         // Перетворюємо на рядок для полів типу number (якщо вони є)
                         populatedData[key] = typeof initialData[key] === 'number' ? initialData[key].toString() : initialData[key];
                    }
                }
            });

             // Форматуємо дати події, вітальних показників, лікування
            populatedData.incidentTimestamp = formatISODateForInput(initialData.incidentTimestamp);
            populatedData.vitalTimestamp = formatISODateForInput(initialData.vitalSignsHistory?.[0]?.timestamp || initialData.vitalTimestamp); // Беремо з історії, якщо є
            populatedData.treatmentTimestamp = formatISODateForInput(initialData.treatments?.[0]?.timestamp || initialData.treatmentTimestamp); // Беремо з історії, якщо є


            // Обробка вкладених даних (беремо перший/останній запис)
            const injury = initialData.injuries?.[0];
            if (injury) {
                populatedData.injuryType = injury.type || 'Unknown';
                populatedData.injuryLocation = injury.location || '';
                populatedData.injurySeverity = injury.severity || 'Unknown';
                populatedData.injuryNotes = injury.notes || '';
            }

             // Беремо ОСТАННІЙ запис вітальних показників з історії, якщо є
            const vitals = initialData.vitalSignsHistory?.[initialData.vitalSignsHistory.length - 1];
            if (vitals) {
                populatedData.vitalPulse = vitals.pulse?.toString() || ''; // Перетворюємо на рядок
                populatedData.vitalBp = vitals.bp || '';
                populatedData.vitalRespiration = vitals.respiration?.toString() || ''; // Перетворюємо на рядок
                populatedData.vitalSpo2 = vitals.spo2?.toString() || '';
                populatedData.vitalTemperature = vitals.temperature?.toString() || '';
                populatedData.vitalConsciousness = vitals.consciousness || 'Unknown';
                // Дата вже встановлена вище
            } else if (initialData.vitalPulse !== undefined) { // Якщо даних немає в історії, але є в кореневому об'єкті (стара структура?)
                 populatedData.vitalPulse = initialData.vitalPulse?.toString() || '';
                 populatedData.vitalBp = initialData.vitalBp || '';
                 populatedData.vitalRespiration = initialData.vitalRespiration?.toString() || '';
                 populatedData.vitalSpo2 = initialData.vitalSpo2?.toString() || '';
                 populatedData.vitalTemperature = initialData.vitalTemperature?.toString() || '';
                 populatedData.vitalConsciousness = initialData.vitalConsciousness || 'Unknown';
            }


             const treatment = initialData.treatments?.[0];
             if (treatment) {
                populatedData.treatmentAction = treatment.action || '';
                populatedData.treatmentProvider = treatment.provider || '';
                 // Дата вже встановлена вище
             } else if (initialData.treatmentAction !== undefined) { // Сумісність зі старою структурою?
                  populatedData.treatmentAction = initialData.treatmentAction || '';
                  populatedData.treatmentProvider = initialData.treatmentProvider || '';
             }


            setFormData(populatedData);
            setInternalError(null);
        } else if (!isEditing) {
            setFormData(initialFormData); // Скидаємо форму при переході в режим додавання
            setInternalError(null);
        }
    }, [isEditing, initialData]); // Залежимо від режиму та даних

    // Обробник зміни полів форми
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
        setInternalError(null); // Скидаємо помилку при будь-якій зміні
    };

    // Обробник зміни числових полів Chakra
    const handleNumberChange = (valueAsString, valueAsNumber, name) => {
         setFormData(prevData => ({ ...prevData, [name]: valueAsString }));
         setInternalError(null);
    };

    // Заповнення тестовими даними (тільки для додавання)
    const fillFormWithMockData = () => {
        const mock = generateMockInjuredData();
        // Форматуємо дати для input
        mock.incidentTimestamp = mock.incidentTimestamp ? new Date(mock.incidentTimestamp).toISOString().substring(0, 16) : '';
        mock.vitalTimestamp = mock.vitalTimestamp ? new Date(mock.vitalTimestamp).toISOString().substring(0, 16) : '';
        mock.treatmentTimestamp = mock.treatmentTimestamp ? new Date(mock.treatmentTimestamp).toISOString().substring(0, 16) : '';
        setFormData(mock);
        setInternalError(null);
    };

    // Обробник відправки форми
    const handleSubmit = async (e) => {
        e.preventDefault();
        setInternalError(null);
        // --- Валідація ---
        if (!formData.name) {
             setInternalError('Ім\'я / Позивний є обов\'язковим полем.');
             window.scrollTo({ top: 0, behavior: 'smooth' });
             return;
        }
         if (!formData.medicalStatus || formData.medicalStatus === 'Unknown') {
             setInternalError('Медичний статус є обов\'язковим полем.');
             window.scrollTo({ top: 0, behavior: 'smooth' });
             return;
        }
        // --- Кінець валідації ---

        setIsSubmitting(true); // Початок процесу відправки

        // --- Формування даних для API ---
        const submissionData = {
            // Основні поля
            name: formData.name,
            callSign: formData.callSign || null, // Надсилаємо null, якщо порожньо
            unit: formData.unit || null,
            bloodType: formData.bloodType,
            allergies: formData.allergies || null,
            incidentTimestamp: formData.incidentTimestamp || null,
            incidentLocation: formData.incidentLocation || null,
            mechanismOfInjury: formData.mechanismOfInjury || null,
            medicalStatus: formData.medicalStatus,
            initialAssessmentNotes: formData.initialAssessmentNotes || null,
            evacuationStatus: formData.evacuationStatus,
            evacuationPriority: formData.evacuationPriority,
            evacuationDestination: formData.evacuationDestination || null,
            recordEnteredBy: formData.recordEnteredBy || null,
            notes: formData.notes || null,
            // Масиви - завжди створюємо/оновлюємо ПЕРШИЙ елемент
            injuries: [],
            vitalSignsHistory: [],
            treatments: []
        };

        // Додаємо запис про травму, якщо є дані
        if (formData.injuryLocation || formData.injuryType !== 'Unknown' || formData.injurySeverity !== 'Unknown' || formData.injuryNotes) {
            submissionData.injuries.push({
                type: formData.injuryType,
                location: formData.injuryLocation || null,
                severity: formData.injurySeverity,
                notes: formData.injuryNotes || null
            });
        }

        // Додаємо запис про вітальні показники, якщо є дані
        if (formData.vitalPulse || formData.vitalBp || formData.vitalRespiration || formData.vitalSpo2 || formData.vitalTemperature || formData.vitalConsciousness !== 'Unknown' || formData.vitalTimestamp) {
             submissionData.vitalSignsHistory.push({
                timestamp: formData.vitalTimestamp || new Date().toISOString(), // Поточний час, якщо не вказано
                pulse: formData.vitalPulse ? Number(formData.vitalPulse) : null,
                bp: formData.vitalBp || null,
                respiration: formData.vitalRespiration ? Number(formData.vitalRespiration) : null,
                spo2: formData.vitalSpo2 ? Number(formData.vitalSpo2) : null,
                temperature: formData.vitalTemperature ? Number(formData.vitalTemperature) : null,
                consciousness: formData.vitalConsciousness
            });
        }

         // Додаємо запис про лікування, якщо є дані
        if (formData.treatmentAction || formData.treatmentProvider || formData.treatmentTimestamp) {
            submissionData.treatments.push({
                timestamp: formData.treatmentTimestamp || new Date().toISOString(), // Поточний час, якщо не вказано
                action: formData.treatmentAction || null,
                provider: formData.treatmentProvider || null
            });
        }
        // --- Кінець формування даних ---


        try {
            // Викликаємо зовнішню функцію onSubmit (createInjured або updateInjured)
            await onSubmit(submissionData);

            // Якщо це було додавання і воно успішне, можна скинути форму
            // (хоча зазвичай відбувається навігація)
            if (!isEditing) {
               // setFormData(initialFormData); // Можна розкоментувати, якщо навігації немає
            }
        } catch (error) {
             // Помилка буде оброблена (toast) в батьківському компоненті,
             // але ми покажемо її і тут, над формою
             window.scrollTo({ top: 0, behavior: 'smooth' }); // Прокрутка до верху
             console.error("Form submission error:", error);
             setInternalError(error.response?.data?.msg || error.message || `Помилка ${isEditing ? 'оновлення' : 'збереження'}. Перевірте дані.`);
        } finally {
             // Завжди завершуємо стан відправки
            setIsSubmitting(false);
        }
    };

    // --- Рендеринг компонента ---
    return (
        <VStack spacing={6} align="stretch">
             {/* Заголовок та кнопка генерації */}
             <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
                <Heading as="h2" size="lg">
                    {isEditing ? `Редагування: ${initialData?.name || 'запису'}` : 'Новий запис про пораненого'}
                </Heading>
                {!isEditing && ( // Кнопка "Заповнити тестовими" тільки при додаванні
                    <Button onClick={fillFormWithMockData} size="sm" variant="outline" leftIcon={<Icon as={FaDice} />}>
                        Заповнити тестовими
                    </Button>
                )}
            </Flex>

             {/* Сама форма */}
             <Box as="form" onSubmit={handleSubmit} borderWidth="1px" borderRadius="lg" p={{ base: 3, md: 6 }} boxShadow="sm">
                 {/* Повідомлення про помилку */}
                 {internalError && (
                    <Alert status="error" mb={4} borderRadius="md" variant='subtle'>
                         <AlertIcon />
                         {internalError}
                    </Alert>
                 )}

                 {/* Вертикальний стек для секцій форми */}
                 <VStack spacing={6} align="stretch">

                    {/* --- Секція: Ідентифікація --- */}
                    <Box borderWidth="1px" borderRadius="md" p={4}>
                        <Text fontWeight="semibold" mb={4} fontSize="lg">Ідентифікація</Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isRequired id="name"> {/* isRequired для візуальної підказки */}
                                <FormLabel>Ім'я / Позивний:</FormLabel>
                                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Іван Петренко / Сокіл"/>
                            </FormControl>
                            <FormControl id="callSign">
                                <FormLabel>Позивний (якщо відрізняється):</FormLabel>
                                <Input name="callSign" value={formData.callSign} onChange={handleChange} placeholder="Сокіл"/>
                            </FormControl>
                            <FormControl id="unit">
                                <FormLabel>Підрозділ:</FormLabel>
                                <Input name="unit" value={formData.unit} onChange={handleChange} placeholder="1 Рота, 2 Бат"/>
                            </FormControl>
                            <FormControl id="bloodType">
                                <FormLabel>Група крові:</FormLabel>
                                <Select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                                    <option value="Unknown">Невідомо</option>
                                    <option value="O+">O (I) Rh+</option><option value="O-">O (I) Rh-</option>
                                    <option value="A+">A (II) Rh+</option><option value="A-">A (II) Rh-</option>
                                    <option value="B+">B (III) Rh+</option><option value="B-">B (III) Rh-</option>
                                    <option value="AB+">AB (IV) Rh+</option><option value="AB-">AB (IV) Rh-</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                        <FormControl mt={4} id="allergies">
                            <FormLabel>Відомі алергії:</FormLabel>
                            <Input name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Наприклад, Пеніцилін"/>
                        </FormControl>
                    </Box>

                    {/* --- Секція: Обставини події --- */}
                    <Box borderWidth="1px" borderRadius="md" p={4}>
                         <Text fontWeight="semibold" mb={4} fontSize="lg">Обставини події</Text>
                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                             <FormControl id="incidentTimestamp">
                                 <FormLabel>Дата та час події:</FormLabel>
                                 <Input type="datetime-local" name="incidentTimestamp" value={formData.incidentTimestamp} onChange={handleChange} />
                             </FormControl>
                             <FormControl id="incidentLocation">
                                 <FormLabel>Місце події (координати/опис):</FormLabel>
                                 <Input name="incidentLocation" value={formData.incidentLocation} onChange={handleChange} placeholder="49.1234, 32.5678 / Посадка Б"/>
                             </FormControl>
                         </SimpleGrid>
                         <FormControl mt={4} id="mechanismOfInjury">
                             <FormLabel>Механізм травми (опис):</FormLabel>
                             <Textarea name="mechanismOfInjury" value={formData.mechanismOfInjury} onChange={handleChange} rows={2} placeholder="Осколкове поранення внаслідок вибуху..."/>
                         </FormControl>
                    </Box>

                     {/* --- Секція: Стан та Поранення --- */}
                    <Box borderWidth="1px" borderRadius="md" p={4}>
                         <Text fontWeight="semibold" mb={4} fontSize="lg">Стан та Поранення</Text>
                         <FormControl isRequired id="medicalStatus" mb={4}> {/* isRequired для візуальної підказки */}
                             <FormLabel>Загальний Медичний Статус:</FormLabel>
                             <Select name="medicalStatus" value={formData.medicalStatus} onChange={handleChange}>
                                 <option value="Unknown">Невідомо</option>
                                 <option value="Stable">Стабільний</option>
                                 <option value="Serious">Важкий</option>
                                 <option value="Critical">Критичний</option>
                                 <option value="Treated">Допомога надана (на місці)</option>
                                 <option value="Evacuated">Евакуйований</option>
                                 <option value="Deceased (KIA)">Загиблий (KIA)</option>
                                 <option value="Missing (MIA)">Зниклий безвісти (MIA)</option>
                             </Select>
                         </FormControl>
                         <FormControl id="initialAssessmentNotes" mb={4}>
                             <FormLabel>Первинний огляд (MIST/MARCH/інше):</FormLabel>
                             <Textarea name="initialAssessmentNotes" value={formData.initialAssessmentNotes} onChange={handleChange} rows={3} placeholder="MARCH: M-контроль масивної кровотечі..., A-дихальні шляхи прохідні..."/>
                         </FormControl>
                         {/* Блок для деталей поранення */}
                         <Box bg="gray.50" _dark={{ bg: "gray.700" }} p={3} borderRadius="md">
                              <Heading size="sm" mb={3}>Поранення (основне)</Heading>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  <FormControl id="injuryLocation">
                                      <FormLabel>Локалізація:</FormLabel>
                                      <Input name="injuryLocation" value={formData.injuryLocation} onChange={handleChange} placeholder="Напр., Праве плече" />
                                  </FormControl>
                                  <FormControl id="injuryType">
                                      <FormLabel>Тип поранення:</FormLabel>
                                       <Select name="injuryType" value={formData.injuryType} onChange={handleChange}>
                                           <option value="Unknown">Невідомо</option>
                                           <option value="Gunshot">Вогнепальне</option><option value="Shrapnel">Осколкове</option>
                                           <option value="Blast">Вибухове</option><option value="Burn">Опік</option>
                                           <option value="Crush">Задавлення</option><option value="Fall">Падіння</option>
                                           <option value="Medical">Медичне (не травма)</option><option value="Other">Інше</option>
                                       </Select>
                                  </FormControl>
                                   <FormControl id="injurySeverity">
                                      <FormLabel>Тяжкість:</FormLabel>
                                       <Select name="injurySeverity" value={formData.injurySeverity} onChange={handleChange}>
                                           <option value="Unknown">Невідомо</option>
                                           <option value="Minor">Легке</option><option value="Moderate">Середнє</option>
                                           <option value="Serious">Важке</option><option value="Critical">Критичне</option>
                                           <option value="Expectant">Агональне</option>
                                       </Select>
                                  </FormControl>
                                  <FormControl id="injuryNotes">
                                      <FormLabel>Примітки до поранення:</FormLabel>
                                      <Input name="injuryNotes" value={formData.injuryNotes} onChange={handleChange} placeholder="Наскрізне, невелика кровотеча"/>
                                  </FormControl>
                              </SimpleGrid>
                         </Box>
                    </Box>

                    {/* --- Секція: Вітальні показники --- */}
                    <Box borderWidth="1px" borderRadius="md" p={4}>
                        <Text fontWeight="semibold" mb={4} fontSize="lg">Вітальні показники (останній замір)</Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                             <FormControl id="vitalTimestamp">
                                <FormLabel>Час вимірювання:</FormLabel>
                                <Input type="datetime-local" name="vitalTimestamp" value={formData.vitalTimestamp} onChange={handleChange}/>
                            </FormControl>
                            <FormControl id="vitalConsciousness">
                                <FormLabel>Свідомість (AVPU):</FormLabel>
                                 <Select name="vitalConsciousness" value={formData.vitalConsciousness} onChange={handleChange}>
                                   <option value="Unknown">Невідомо</option>
                                   <option value="Alert">A - Притомний</option><option value="Voice">V - Реакція на голос</option>
                                   <option value="Pain">P - Реакція на біль</option><option value="Unresponsive">U - Непритомний</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={4}>
                             <FormControl id="vitalPulse">
                                <FormLabel>Пульс (уд/хв):</FormLabel>
                                <Input type="number" name="vitalPulse" value={formData.vitalPulse} onChange={handleChange} placeholder="90"/>
                            </FormControl>
                            <FormControl id="vitalBp">
                                <FormLabel>Тиск (мм рт.ст.):</FormLabel>
                                <Input name="vitalBp" value={formData.vitalBp} onChange={handleChange} placeholder="110/70"/>
                            </FormControl>
                            <FormControl id="vitalRespiration">
                                <FormLabel>Дихання (в хв):</FormLabel>
                                <Input type="number" name="vitalRespiration" value={formData.vitalRespiration} onChange={handleChange} placeholder="16"/>
                            </FormControl>
                            <FormControl id="vitalSpo2">
                                <FormLabel>Сатурація SpO2 (%):</FormLabel>
                                <NumberInput name="vitalSpo2" value={formData.vitalSpo2} onChange={(valStr, valNum) => handleNumberChange(valStr, valNum, 'vitalSpo2')} min={0} max={100}>
                                    <NumberInputField placeholder="95"/>
                                </NumberInput>
                             </FormControl>
                             <FormControl id="vitalTemperature">
                                <FormLabel>Температура (°C):</FormLabel>
                                <NumberInput name="vitalTemperature" value={formData.vitalTemperature} onChange={(valStr, valNum) => handleNumberChange(valStr, valNum, 'vitalTemperature')} precision={1} step={0.1}>
                                     <NumberInputField placeholder="36.6"/>
                                </NumberInput>
                             </FormControl>
                       </SimpleGrid>
                    </Box>

                     {/* --- Секція: Надана допомога --- */}
                    <Box borderWidth="1px" borderRadius="md" p={4}>
                        <Text fontWeight="semibold" mb={4} fontSize="lg">Надана допомога (основне)</Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                             <FormControl id="treatmentTimestamp">
                                <FormLabel>Час надання:</FormLabel>
                                <Input type="datetime-local" name="treatmentTimestamp" value={formData.treatmentTimestamp} onChange={handleChange}/>
                            </FormControl>
                             <FormControl id="treatmentProvider">
                                <FormLabel>Хто надав (Позивний/Ім'я):</FormLabel>
                                <Input name="treatmentProvider" value={formData.treatmentProvider} onChange={handleChange} placeholder="Медик / Док"/>
                            </FormControl>
                       </SimpleGrid>
                       <FormControl id="treatmentAction">
                           <FormLabel>Дія / Маніпуляція / Ліки:</FormLabel>
                           <Textarea name="treatmentAction" value={formData.treatmentAction} onChange={handleChange} rows={2} placeholder="Напр., Турнікет на праве стегно"/>
                       </FormControl>
                   </Box>

                    {/* --- Секція: Евакуація --- */}
                    <Box borderWidth="1px" borderRadius="md" p={4}>
                        <Text fontWeight="semibold" mb={4} fontSize="lg">Евакуація</Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                            <FormControl id="evacuationPriority">
                                <FormLabel>Пріоритет евакуації:</FormLabel>
                                <Select name="evacuationPriority" value={formData.evacuationPriority} onChange={handleChange}>
                                    <option value="Unknown">Не визначено</option>
                                    <option value="T1-Urgent">T1 - Невідкладний (Urgent)</option>
                                    <option value="T2-Priority">T2 - Пріоритетний (Priority)</option>
                                    <option value="T3-Routine">T3 - Плановий (Routine)</option>
                                    <option value="T4-Expectant/Deceased">T4 - Агональний/Загиблий</option>
                                </Select>
                            </FormControl>
                           <FormControl id="evacuationStatus">
                                <FormLabel>Статус евакуації:</FormLabel>
                                <Select name="evacuationStatus" value={formData.evacuationStatus} onChange={handleChange}>
                                    <option value="Unknown">Невідомо</option>
                                    <option value="Not Required">Не потребує</option>
                                    <option value="Requested">Запит надіслано</option>
                                    <option value="In Progress">В процесі</option>
                                    <option value="Completed">Завершено</option>
                                    <option value="Delayed">Відкладено</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>
                        <FormControl id="evacuationDestination">
                           <FormLabel>Пункт призначення евакуації:</FormLabel>
                           <Input name="evacuationDestination" value={formData.evacuationDestination} onChange={handleChange} placeholder="Стабпункт Альфа"/>
                       </FormControl>
                    </Box>

                    {/* --- Секція: Загальна інформація --- */}
                    <Box borderWidth="1px" borderRadius="md" p={4}>
                        <Text fontWeight="semibold" mb={4} fontSize="lg">Загальна інформація</Text>
                        <FormControl id="recordEnteredBy" mb={4}>
                           <FormLabel>Хто вніс запис (Позивний/Ім'я):</FormLabel>
                           <Input name="recordEnteredBy" value={formData.recordEnteredBy} onChange={handleChange} placeholder="Ваш позивний/ім'я"/>
                       </FormControl>
                       <FormControl id="notes">
                           <FormLabel>Загальні примітки:</FormLabel>
                           <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Додаткова інформація..."/>
                       </FormControl>
                   </Box>

                   {/* --- Кнопки дій --- */}
                   <Flex justify="flex-start" gap={4} mt={4} wrap="wrap">
                        {/* Кнопка Зберегти/Оновити */}
                        <Button
                            type="submit"
                            colorScheme={isEditing ? "blue" : "green"}
                            isLoading={isSubmitting || isSubmittingParent} // Враховуємо обидва стани
                            loadingText={isEditing ? 'Оновлення...' : 'Додавання...'}
                            leftIcon={<Icon as={FaSave} />}
                            minWidth="150px" // Щоб текст не стрибав при зміні
                        >
                           {isEditing ? 'Оновити запис' : 'Додати запис'}
                        </Button>
                        {/* Кнопка Скасувати (тільки при редагуванні) */}
                        {isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancelEdit} // Викликаємо передану функцію
                                isDisabled={isSubmitting || isSubmittingParent} // Блокуємо під час відправки
                                leftIcon={<Icon as={FaTimes}/>}
                            >
                                Скасувати
                            </Button>
                        )}
                    </Flex>
                 </VStack>
             </Box>
        </VStack>
    );
}

export default InjuredForm;