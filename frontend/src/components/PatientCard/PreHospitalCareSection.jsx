// frontend/src/components/PatientCard/PreHospitalCareSection.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Heading, HStack, IconButton, Input,
    InputGroup, InputRightElement, Select, SimpleGrid, Text, Textarea, VStack, useToast, Divider,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Checkbox,
    Spinner, Flex, useColorModeValue, Tag, Tooltip, Icon
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon, ArrowBackIcon, QuestionOutlineIcon, WarningTwoIcon, CheckCircleIcon,
    ChatIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import constants from './patientCardConstants';
import { getPreHospitalTestData } from './testData';
import {
    createPreHospitalRecord,
    getTraumaRecordById,
    updateTraumaRecord
} from '../../services/traumaRecord.api';

// Утиліти для часу та дати
const getCurrentTime = () => new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

const getCurrentDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date for input:", e);
        return '';
    }
};

const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return '';
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } catch (e) {
        console.error("Error formatting datetime for input:", e);
        return '';
    }
};

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age.toString() : '';
};


function PreHospitalCareSection() {
    const { id: recordId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!recordId;

    // Кольорові схеми з вашої теми
    const brandColorScheme = "brand";
    const highlightColorScheme = "highlight";
    const neutralColorScheme = "gray";
    const patientInfoColorScheme = "blue";
    const injuriesColorScheme = "orange";
    const interventionsColorScheme = "green";
    const medicationsColorScheme = "purple";
    const transportColorScheme = "teal";

    // Кольори для UI елементів
    const pageBg = useColorModeValue('bg.page.light', 'bg.page.dark');
    const contentBg = useColorModeValue('bg.content.light', 'bg.content.dark');
    const subtlePaneBg = useColorModeValue('gray.50', 'gray.800');
    const inputBg = useColorModeValue('white', 'gray.700');
    const mainBorderColor = useColorModeValue('gray.200', 'gray.700');
    const formLabelColor = useColorModeValue('gray.600', 'gray.400');
    const mainHeadingColor = useColorModeValue(`${brandColorScheme}.600`, `${brandColorScheme}.300`);
    const sectionTitleColor = (colorScheme = brandColorScheme) => useColorModeValue(`${colorScheme}.600`, `${colorScheme}.300`);


    const getInitialFormData = useCallback(() => {
        const initialData = JSON.parse(JSON.stringify(constants.initialPreHospitalFormData));
        if (!isEditMode) {
            initialData.internalCardId = `PH-${Date.now().toString(36).slice(-4).toUpperCase()}`;
            initialData.patientInfo.tempPatientId = `TEMP-${Date.now().toString(36).slice(-4).toUpperCase()}`;
        }
        return initialData;
    }, [isEditMode]);

    const [formData, setFormData] = useState(getInitialFormData);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const calculatedAge = useMemo(() => {
        return calculateAge(formData.patientInfo?.dateOfBirth);
    }, [formData.patientInfo?.dateOfBirth]);


    useEffect(() => {
        if (isEditMode && recordId) {
            const fetchRecord = async () => {
                setIsLoading(true);
                try {
                    const response = await getTraumaRecordById(recordId);
                    const fetchedData = response.data;
                    const initialTemplate = getInitialFormData();

                    const adaptedData = {
                        ...initialTemplate,
                        ...fetchedData,
                        incidentDateTime: formatDateTimeForInput(fetchedData.incidentDateTime),
                        teamArrivalTimeScene: formatDateTimeForInput(fetchedData.teamArrivalTimeScene),
                        patientContactTime: formatDateTimeForInput(fetchedData.patientContactTime),
                        patientInfo: {
                            ...initialTemplate.patientInfo,
                            ...(fetchedData.patientInfo || {}),
                            dateOfBirth: formatDateForInput(fetchedData.patientInfo?.dateOfBirth),
                        },
                        transportation: {
                            ...initialTemplate.transportation,
                            ...(fetchedData.transportation || {}),
                            departureTimeFromScene: formatDateTimeForInput(fetchedData.transportation?.departureTimeFromScene),
                        },
                        marchSurvey: {
                            ...initialTemplate.marchSurvey,
                            ...(fetchedData.marchSurvey || {}),
                        },
                        vitalSignsLog: Array.isArray(fetchedData.vitalSignsLog) ? fetchedData.vitalSignsLog.map(vs => ({...vs, timestamp: vs.timestamp || getCurrentTime() })) : [],
                        suspectedInjuries: Array.isArray(fetchedData.suspectedInjuries) ? fetchedData.suspectedInjuries : [],
                        interventionsPerformed: Array.isArray(fetchedData.interventionsPerformed) ? fetchedData.interventionsPerformed.map(ip => ({...ip, timestamp: ip.timestamp || getCurrentTime() })) : [],
                        medicationsAdministered: Array.isArray(fetchedData.medicationsAdministered) ? fetchedData.medicationsAdministered.map(med => ({...med, timestamp: med.timestamp || getCurrentTime() })) : [],
                    };
                    setFormData(adaptedData);
                } catch (error) {
                    console.error("Error fetching record for edit:", error);
                    toast({
                        title: "Помилка завантаження картки",
                        description: error.response?.data?.message || error.message,
                        status: "error", duration: 7000, isClosable: true, position: "top-right"
                    });
                    navigate('/trauma-journal');
                } finally { setIsLoading(false); }
            };
            fetchRecord();
        } else {
            setFormData(getInitialFormData());
            setIsLoading(false);
        }
    }, [recordId, isEditMode, navigate, toast, getInitialFormData]);

    const handleInputChange = useCallback((path, value) => {
        setFormData(prevData => {
            const keys = path.split('.');
            const newState = JSON.parse(JSON.stringify(prevData));
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key] || typeof current[key] !== 'object') {
                    const nextKeyIsNumeric = !isNaN(parseInt(keys[i + 1], 10));
                    current[key] = nextKeyIsNumeric ? [] : {};
                }
                current = current[key];
            }
            const finalKey = keys[keys.length - 1];

            if (path === 'patientInfo.isUnknown') {
                current[finalKey] = value;
                if (value === true) {
                    const initialPatientInfo = constants.initialPreHospitalFormData.patientInfo;
                    newState.patientInfo = {
                        ...initialPatientInfo,
                        isUnknown: true,
                        tempPatientId: prevData.patientInfo.tempPatientId || `TEMP-${Date.now().toString(36).slice(-4).toUpperCase()}`,
                        // Зберігаємо значення з AMPLE, якщо вони були введені до позначки "Невідомий"
                        allergiesShort: prevData.patientInfo.allergiesShort,
                        medicationsShort: prevData.patientInfo.medicationsShort,
                        medicalHistoryShort: prevData.patientInfo.medicalHistoryShort,
                        ageYears: prevData.patientInfo.ageYears, // Зберігаємо орієнтовний вік
                    };
                }
            } else if (path === 'patientInfo.dateOfBirth' && value === '') {
                // Якщо дата народження очищена, дозволяємо редагувати орієнтовний вік
                current[finalKey] = value;
                newState.patientInfo.ageYears = prevData.patientInfo.ageYears; // Зберігаємо поточне значення ageYears
            }
            else {
                current[finalKey] = value;
            }
            return newState;
        });
    }, []);

    const addToArray = useCallback((arrayPath, itemTemplate) => {
        setFormData(prevData => {
            const newState = JSON.parse(JSON.stringify(prevData));
            const keys = arrayPath.split('.');
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            const targetArrayName = keys[keys.length - 1];
            if (!Array.isArray(current[targetArrayName])) {
                current[targetArrayName] = [];
            }
            let newItem = { ...itemTemplate };
            if (itemTemplate.hasOwnProperty('timestamp')) {
                newItem.timestamp = getCurrentTime();
            }
            current[targetArrayName].push(newItem);
            return newState;
        });
    }, []);

    const removeFromArray = useCallback((arrayPath, index) => {
        setFormData(prevData => {
            const newState = JSON.parse(JSON.stringify(prevData));
            const keys = arrayPath.split('.');
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            const targetArrayName = keys[keys.length - 1];
            if (current[targetArrayName] && Array.isArray(current[targetArrayName]) && current[targetArrayName][index] !== undefined) {
                current[targetArrayName].splice(index, 1);
            }
            return newState;
        });
    }, []);

    const updateInArray = useCallback((arrayPath, index, field, value) => {
        setFormData(prevData => {
            const newState = JSON.parse(JSON.stringify(prevData));
            const keys = arrayPath.split('.');
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            const targetArrayName = keys[keys.length - 1];
            if (current[targetArrayName] && Array.isArray(current[targetArrayName]) && current[targetArrayName][index]) {
                current[targetArrayName][index][field] = value;
            }
            return newState;
        });
    }, []);

    const prepareDataForSubmit = (data) => {
        const dataToSubmit = JSON.parse(JSON.stringify(data));
        if (dataToSubmit.patientInfo?.dateOfBirth) {
            dataToSubmit.patientInfo.ageYears = calculateAge(dataToSubmit.patientInfo.dateOfBirth);
        }
        ['vitalSignsLog', 'suspectedInjuries', 'interventionsPerformed', 'medicationsAdministered'].forEach(key => {
            if (Array.isArray(dataToSubmit[key])) {
                dataToSubmit[key] = dataToSubmit[key].filter(item => {
                    const { timestamp, ...restOfItem } = item;
                    return Object.values(restOfItem).some(val => val !== '' && val !== null && val !== undefined);
                });
            }
        });
        return dataToSubmit;
    };

    const handleSave = async () => {
        // Валідація залишається важливою, але тут не показана для скорочення
        setIsSubmitting(true);
        const dataToSubmit = prepareDataForSubmit(formData);
        console.log("Дані для відправки:", JSON.stringify(dataToSubmit, null, 2));
        try {
            let response;
            if (isEditMode && recordId) {
                response = await updateTraumaRecord(recordId, dataToSubmit);
                toast({
                    title: "Картку успішно оновлено!",
                    description: `ID картки: ${response.data.record.internalCardId}`,
                    status: "success", duration: 5000, isClosable: true, position: "top-right",
                });
                navigate('/trauma-journal');
            } else {
                response = await createPreHospitalRecord(dataToSubmit);
                toast({
                    title: "Картку успішно створено!",
                    description: `ID картки: ${response.data.record.internalCardId} (MongoDB ID: ${response.data.record._id})`,
                    status: "success", duration: 7000, isClosable: true, position: "top-right",
                });
                handleClear(false);
            }
        } catch (error) {
            console.error("Помилка при збереженні картки:", error.response || error);
            const errorMsg = error.response?.data?.message || error.message || "Невідома помилка сервера";
            let errorDetails = "";
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                errorDetails = error.response.data.errors.map(err => `${err.path ? err.path + ': ' : ''}${err.msg}`).join('; ');
            }
            toast({
                title: `Помилка ${isEditMode ? 'оновлення' : 'створення'} картки`,
                description: `${errorMsg}${errorDetails ? ". Деталі: " + errorDetails : ""}`,
                status: "error", duration: 9000, isClosable: true, position: "top-right",
            });
        } finally { setIsSubmitting(false); }
    };

    const handleClear = (navigateOnEdit = true) => {
        const newInitialData = getInitialFormData();
        setFormData(newInitialData);
        if (isEditMode && navigateOnEdit) {
            navigate('/prehospital-care');
        }
        toast({ title: "Форму очищено.", status: "info", duration: 2000, isClosable: true, position: "top-right" });
    };

    const handleFillTestData = () => {
        const currentInternalId = formData.internalCardId;
        const currentTempPatientId = formData.patientInfo?.tempPatientId;
        const testData = getPreHospitalTestData(currentInternalId, currentTempPatientId);
        setFormData(testData);
        toast({ title: "Заповнено тестовими даними.", status: "info", duration: 2000, isClosable: true, position: "top-right" });
    };

    // Стилі для акордеону та міток
    const accordionItemBaseStyle = {
        border: 'none',
        bg: contentBg,
        borderRadius: "2xl", // Збільшено заокруглення
        boxShadow: "xl",    // Виразніша тінь
        mb: 8,              // Збільшено відступ між секціями
        overflow: "hidden"
    };
    const accordionButtonBaseStyle = (colorScheme = brandColorScheme) => ({
        bg: useColorModeValue(`${colorScheme}.50`, `${colorScheme}.800`),
        color: useColorModeValue(`${colorScheme}.700`, `${colorScheme}.200`),
        py: '18px', // Збільшено вертикальний padding
        px: 6,
        fontWeight: "semibold",
        fontSize: "xl",
        textAlign: "left",
        justifyContent: "space-between",
        borderBottomWidth: "1px",
        borderBottomColor: "transparent",
        _hover: {
            bg: useColorModeValue(`${colorScheme}.100`, `${colorScheme}.700`),
        },
        _expanded: {
            bg: useColorModeValue(`${colorScheme}.600`, `${colorScheme}.500`),
            color: useColorModeValue('white', 'gray.100'), // Змінено на світліший колір для темного режиму
            borderBottomColor: useColorModeValue(`${colorScheme}.300`, `${colorScheme}.600`),
        },
    });
    const formLabelBaseStyle = {
        fontSize: "md",
        fontWeight: "medium",
        color: formLabelColor,
        mb: 2,
    };
    const dynamicListItemStyle = {
        p: 6, // Збільшено padding
        borderWidth:"1px",
        borderColor: mainBorderColor,
        borderRadius:"xl", // Збільшено заокруглення
        mb: 6, // Збільшено відступ
        bg: contentBg, // Ефект "картки на панелі"
        boxShadow:"lg" // Виразніша тінь
    };


    if (isLoading) {
        return (
            <Flex justify="center" align="center" minHeight="calc(100vh - 150px)" bg={pageBg}>
                <VStack spacing={4}>
                    <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color={`${brandColorScheme}.500`} />
                    <Text fontSize="xl" color={useColorModeValue("gray.600", "gray.300")}>Завантаження картки...</Text>
                </VStack>
            </Flex>
        );
    }
    
    const calculateGcsTotal = (gcsE, gcsV, gcsM) => {
        const e = parseInt(gcsE, 10) || 0;
        const v = parseInt(gcsV, 10) || 0;
        const m = parseInt(gcsM, 10) || 0;
        if (e === 0 && v === 0 && m === 0 && !gcsE && !gcsV && !gcsM) return '';
        return e + v + m;
    };


    return (
        <Container maxW="container.2xl" py={{base: 6, md: 10}} px={{ base: 3, md: 6 }} bg={pageBg}> {/* Збільшено py */}
             <VStack spacing={10} align="stretch"> {/* Збільшено основний spacing */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ base: "stretch", md: "center" }}
                    gap={4}
                    p={{base: 4, md: 6}}
                    bg={contentBg}
                    borderRadius="2xl" // Збільшено
                    boxShadow="xl"
                >
                    <Heading as="h1" size="xl" color={mainHeadingColor} textAlign={{ base: "center", md: "left" }}>
                        {isEditMode ? `Редагування Картки № ${formData.internalCardId || recordId}` : "Нова Догоспітальна Картка"}
                    </Heading>
                    <Button
                        leftIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/trauma-journal')}
                        variant="outline"
                        colorScheme={neutralColorScheme}
                        size="md" // Залишено md для меншої нав'язливості
                        w={{base: "full", md: "auto"}}
                    >
                        До Журналу
                    </Button>
                </Flex>

                {!isEditMode && formData.internalCardId && (
                    <Tag size="lg" variant="solid" colorScheme={brandColorScheme} alignSelf="center" py={2} px={4} borderRadius="lg" boxShadow="md"> {/* borderRadius lg */}
                        ID нової картки: <Text as="strong" ml={1.5}>{formData.internalCardId}</Text>
                    </Tag>
                )}

                <Accordion allowMultiple defaultIndex={isEditMode ? undefined : [0]} width="100%">
                    {/* --- 1. ІНЦИДЕНТ ТА ЧАС --- */}
                    <AccordionItem sx={accordionItemBaseStyle}>
                        <h2>
                            <AccordionButton sx={accordionButtonBaseStyle(brandColorScheme)}>
                                <HStack spacing={4}><Icon as={TimeIcon} boxSize={6}/> <Box>1. Інцидент та Час</Box></HStack> {/* Збільшено spacing, boxSize */}
                                <AccordionIcon boxSize={7}/> {/* Збільшено boxSize */}
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={8} px={{base:4, md:6}} bg={subtlePaneBg}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <FormControl isRequired>
                                    <FormLabel sx={formLabelBaseStyle}>Дата та час інциденту</FormLabel>
                                    <Input bg={inputBg} type="datetime-local" value={formData.incidentDateTime || ''} onChange={(e) => handleInputChange('incidentDateTime', e.target.value)} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel sx={formLabelBaseStyle}>Причина виклику / Тип інциденту</FormLabel>
                                    <Input bg={inputBg} placeholder="Напр., ДТП, падіння, вибух" value={formData.reasonForCall || ''} onChange={(e) => handleInputChange('reasonForCall', e.target.value)} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel sx={formLabelBaseStyle}>Час прибуття на місце</FormLabel>
                                    <InputGroup>
                                        <Input bg={inputBg} type="datetime-local" value={formData.teamArrivalTimeScene || ''} onChange={(e) => handleInputChange('teamArrivalTimeScene', e.target.value)} />
                                        <InputRightElement>
                                            <Tooltip label="Поточний час" placement="top">
                                                <IconButton icon={<TimeIcon />} size="sm" variant="ghost" onClick={() => handleInputChange('teamArrivalTimeScene', getCurrentDateTimeLocal())} aria-label="Встановити поточний час"/>
                                            </Tooltip>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel sx={formLabelBaseStyle}>Час контакту з пацієнтом</FormLabel>
                                     <InputGroup>
                                        <Input bg={inputBg} type="datetime-local" value={formData.patientContactTime || ''} onChange={(e) => handleInputChange('patientContactTime', e.target.value)} />
                                        <InputRightElement>
                                             <Tooltip label="Поточний час" placement="top">
                                                <IconButton icon={<TimeIcon />} size="sm" variant="ghost" onClick={() => handleInputChange('patientContactTime', getCurrentDateTimeLocal())} aria-label="Встановити поточний час"/>
                                            </Tooltip>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                            </SimpleGrid>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* --- 2. ІНФОРМАЦІЯ ПРО ПАЦІЄНТА --- */}
                    <AccordionItem sx={accordionItemBaseStyle}>
                        <h2>
                            <AccordionButton sx={accordionButtonBaseStyle(patientInfoColorScheme)}>
                                <HStack spacing={4}><Icon as={QuestionOutlineIcon} boxSize={6}/> <Box>2. Інформація про Пацієнта</Box></HStack>
                                <AccordionIcon boxSize={7}/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={8} px={{base:4, md:6}} bg={subtlePaneBg}>
                            <Checkbox
                                isChecked={formData.patientInfo?.isUnknown || false}
                                onChange={(e) => handleInputChange('patientInfo.isUnknown', e.target.checked)}
                                mb={6}
                                colorScheme={patientInfoColorScheme} // Змінено colorScheme
                                size="lg"
                            >
                                <Text fontSize="md" fontWeight="medium">Пацієнт невідомий</Text> {/* Додано fontWeight */}
                                {formData.patientInfo?.isUnknown && formData.patientInfo?.tempPatientId &&
                                    <Tag size="md" ml={3} colorScheme="orange" variant="outline" py={1} px={2} borderRadius="lg">ID: {formData.patientInfo.tempPatientId}</Tag>
                                }
                            </Checkbox>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                <FormControl isDisabled={formData.patientInfo?.isUnknown} isRequired={!formData.patientInfo?.isUnknown}>
                                    <FormLabel sx={formLabelBaseStyle}>Прізвище</FormLabel>
                                    <Input bg={inputBg} value={formData.patientInfo?.lastName || ''} onChange={(e) => handleInputChange('patientInfo.lastName', e.target.value)} />
                                </FormControl>
                                <FormControl isDisabled={formData.patientInfo?.isUnknown} isRequired={!formData.patientInfo?.isUnknown}>
                                    <FormLabel sx={formLabelBaseStyle}>Ім'я</FormLabel>
                                    <Input bg={inputBg} value={formData.patientInfo?.firstName || ''} onChange={(e) => handleInputChange('patientInfo.firstName', e.target.value)} />
                                </FormControl>
                                <FormControl isDisabled={formData.patientInfo?.isUnknown}>
                                    <FormLabel sx={formLabelBaseStyle}>По батькові</FormLabel>
                                    <Input bg={inputBg} value={formData.patientInfo?.middleName || ''} onChange={(e) => handleInputChange('patientInfo.middleName', e.target.value)} />
                                </FormControl>
                                <FormControl isDisabled={formData.patientInfo?.isUnknown}>
                                    <FormLabel sx={formLabelBaseStyle}>Дата народження</FormLabel>
                                    <Input bg={inputBg} type="date" value={formData.patientInfo?.dateOfBirth || ''} onChange={(e) => handleInputChange('patientInfo.dateOfBirth', e.target.value)} max={new Date().toISOString().split("T")[0]} />
                                </FormControl>
                                <FormControl> {/* Не isDisabled, бо орієнтовний вік можна вказати для невідомого */}
                                    <FormLabel sx={formLabelBaseStyle}>
                                        Орієнтовний вік (років)
                                        {formData.patientInfo?.dateOfBirth && (
                                            <Tooltip label="Розраховано автоматично на основі дати народження" placement="top" openDelay={300}>
                                                <Icon as={QuestionOutlineIcon} ml={1.5} color="gray.500" boxSize={4}/>
                                            </Tooltip>
                                        )}
                                    </FormLabel>
                                    <Input bg={inputBg} type="number"
                                        placeholder={calculatedAge ? "Авто" : "Введіть вік"}
                                        value={calculatedAge || formData.patientInfo?.ageYears || ''}
                                        onChange={(e) => handleInputChange('patientInfo.ageYears', e.target.value)}
                                        isReadOnly={!!formData.patientInfo?.dateOfBirth}
                                        // isDisabled={formData.patientInfo?.isUnknown && !formData.patientInfo?.dateOfBirth} - Закоментовано, щоб можна було вводити для невідомого
                                    />
                                </FormControl>
                                <FormControl isDisabled={formData.patientInfo?.isUnknown} isRequired={!formData.patientInfo?.isUnknown}>
                                    <FormLabel sx={formLabelBaseStyle}>Стать</FormLabel>
                                    <Select bg={inputBg} placeholder="Оберіть стать" value={formData.patientInfo?.gender || ''} onChange={(e) => handleInputChange('patientInfo.gender', e.target.value)}>
                                        {constants.genders.map(gender => <option key={gender} value={gender}>{gender}</option>)}
                                    </Select>
                                </FormControl>
                                <FormControl isDisabled={formData.patientInfo?.isUnknown}>
                                    <FormLabel sx={formLabelBaseStyle}>Контактний телефон</FormLabel>
                                    <Input bg={inputBg} value={formData.patientInfo?.contactPhone || ''} onChange={(e) => handleInputChange('patientInfo.contactPhone', e.target.value)} placeholder="Пацієнта або родичів"/>
                                </FormControl>
                                <FormControl gridColumn={{ base: "span 1", md: "span 2" }} isDisabled={formData.patientInfo?.isUnknown}>
                                    <FormLabel sx={formLabelBaseStyle}>Орієнтовна адреса / Звідки</FormLabel>
                                    <Input bg={inputBg} value={formData.patientInfo?.addressRough || ''} onChange={(e) => handleInputChange('patientInfo.addressRough', e.target.value)} placeholder="Якщо відомо"/>
                                </FormControl>
                            </SimpleGrid>
                            <VStack spacing={5} mt={8} align="stretch"> {/* Збільшено spacing */}
                                <Textarea bg={inputBg} placeholder="Коротко: алергії (якщо є критичні)..." value={formData.patientInfo?.allergiesShort || ''} onChange={(e) => handleInputChange('patientInfo.allergiesShort', e.target.value)} />
                                <Textarea bg={inputBg} placeholder="Коротко: постійний прийом важливих ліків..." value={formData.patientInfo?.medicationsShort || ''} onChange={(e) => handleInputChange('patientInfo.medicationsShort', e.target.value)} />
                                <Textarea bg={inputBg} placeholder="Коротко: супутні захворювання (діабет, серцеві, епілепсія тощо)..." value={formData.patientInfo?.medicalHistoryShort || ''} onChange={(e) => handleInputChange('patientInfo.medicalHistoryShort', e.target.value)} />
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* --- 3. СКАРГИ, ТРІАЖ, MARCH --- */}
                    <AccordionItem sx={accordionItemBaseStyle}>
                        <h2>
                            <AccordionButton sx={accordionButtonBaseStyle(brandColorScheme)}>
                                 <HStack spacing={4}><Icon as={AddIcon} transform="rotate(45deg)" boxSize={6}/> <Box>3. Скарги, Тріаж та Огляд (MARCH)</Box></HStack>
                                <AccordionIcon boxSize={7}/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={8} px={{base:4, md:6}} bg={subtlePaneBg}>
                            <FormControl mb={6}>
                                <FormLabel sx={formLabelBaseStyle}>Скарги пацієнта / Свідків</FormLabel>
                                <Textarea bg={inputBg} placeholder="Опишіть основні скарги..." value={formData.complaints || ''} onChange={(e) => handleInputChange('complaints', e.target.value)} />
                            </FormControl>
                            <Divider my={8} borderColor={mainBorderColor}/>
                            <Heading size="lg" mb={6} color={sectionTitleColor(brandColorScheme)} fontWeight="semibold">Тріаж</Heading> {/* fontWeight semibold, mb 6 */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                                <FormControl isRequired>
                                    <FormLabel sx={formLabelBaseStyle}>Категорія тріажу</FormLabel>
                                    <Select bg={inputBg} placeholder="Оберіть категорію" value={formData.triageCategory || ''} onChange={(e) => handleInputChange('triageCategory', e.target.value)}>
                                        {constants.triageCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel sx={formLabelBaseStyle}>Час тріажу (HH:mm)</FormLabel>
                                    <InputGroup>
                                        <Input bg={inputBg} type="time" value={formData.triageTimestamp || ''} onChange={(e) => handleInputChange('triageTimestamp', e.target.value)} />
                                         <InputRightElement>
                                            <Tooltip label="Поточний час" placement="top"><IconButton icon={<TimeIcon />} size="sm" variant="ghost" onClick={() => handleInputChange('triageTimestamp', getCurrentTime())} aria-label="Встановити поточний час"/></Tooltip>
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                            </SimpleGrid>
                            <Divider my={8} borderColor={mainBorderColor}/>
                            <Heading size="lg" mb={6} color={sectionTitleColor(brandColorScheme)} fontWeight="semibold">Огляд за MARCH</Heading> {/* fontWeight semibold, mb 6 */}
                            <VStack spacing={5} align="stretch">
                                {Object.entries(constants.marchSurveyFields).map(([key, label]) => (
                                     <FormControl key={key} isRequired={constants.marchRequiredFields.includes(key)}>
                                        <FormLabel sx={formLabelBaseStyle}>{label}</FormLabel>
                                        {key === 'airwayManagement' ? (
                                            <Select bg={inputBg} placeholder="Оберіть метод або опишіть" value={formData.marchSurvey?.[key] || ''} onChange={(e) => handleInputChange(`marchSurvey.${key}`, e.target.value)}>
                                                {constants.airwayManagementOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                <option value="Інше (описати нижче)">Інше (описати в нотатках MARCH)</option>
                                            </Select>
                                        ) : (
                                            <Textarea bg={inputBg} placeholder={constants.marchPlaceholders[key] || "Опис..."} value={formData.marchSurvey?.[key] || ''} onChange={(e) => handleInputChange(`marchSurvey.${key}`, e.target.value)} />
                                        )}
                                    </FormControl>
                                ))}
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* --- 4. ЖИТТЄВІ ПОКАЗНИКИ --- */}
                    <AccordionItem sx={accordionItemBaseStyle}>
                        <h2>
                            <AccordionButton sx={accordionButtonBaseStyle(patientInfoColorScheme)}>
                                <HStack spacing={4}><Icon as={TimeIcon} boxSize={6}/> <Box>4. Життєві Показники</Box></HStack>
                                <AccordionIcon boxSize={7}/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={6} px={{base:4, md:6}} bg={subtlePaneBg}>
                            {(formData.vitalSignsLog || []).map((vs, index) => (
                                <Box key={index} sx={dynamicListItemStyle}>
                                    <Flex justifyContent="space-between" alignItems="center" mb={5}> {/* mb 5 */}
                                        <Text fontWeight="semibold" fontSize="lg" color={sectionTitleColor(patientInfoColorScheme)}>Замір #{index + 1}</Text> {/* fontSize lg */}
                                        <IconButton icon={<DeleteIcon />} size="md" variant="ghost" colorScheme="red" onClick={() => removeFromArray('vitalSignsLog', index)} aria-label="Видалити замір" /> {/* size md */}
                                    </Flex>
                                    <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg:6 }} spacingX={5} spacingY={4}>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Час</FormLabel><Input bg={inputBg} type="time" value={vs.timestamp || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'timestamp', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>АТ сист.</FormLabel><Input bg={inputBg} type="number" placeholder="мм.рт.ст" value={vs.sbp || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'sbp', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>АТ діаст.</FormLabel><Input bg={inputBg} type="number" placeholder="мм.рт.ст" value={vs.dbp || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'dbp', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>ЧСС</FormLabel><Input bg={inputBg} type="number" placeholder="уд/хв" value={vs.hr || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'hr', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>ЧД</FormLabel><Input bg={inputBg} type="number" placeholder="в хв" value={vs.rr || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'rr', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>SpO2</FormLabel><InputGroup><Input bg={inputBg} type="number" placeholder="%" value={vs.spo2 || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'spo2', e.target.value)} /></InputGroup></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>ШКГ (E)</FormLabel><Input bg={inputBg} type="number" min="1" max="4" value={vs.gcsE || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'gcsE', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>ШКГ (V)</FormLabel><Input bg={inputBg} type="number" min="1" max="5" value={vs.gcsV || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'gcsV', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>ШКГ (M)</FormLabel><Input bg={inputBg} type="number" min="1" max="6" value={vs.gcsM || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'gcsM', e.target.value)} /></FormControl>
                                        <FormControl>
                                            <FormLabel sx={formLabelBaseStyle}>ШКГ (Заг)</FormLabel>
                                            <Input bg={useColorModeValue("gray.100", "gray.600")} type="number" value={calculateGcsTotal(vs.gcsE, vs.gcsV, vs.gcsM)} isReadOnly placeholder="Авто" />
                                        </FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>t°C</FormLabel><Input bg={inputBg} type="number" step="0.1" placeholder="°C" value={vs.tempC || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'tempC', e.target.value)} /></FormControl>
                                        <FormControl><FormLabel sx={formLabelBaseStyle}>Біль (0-10)</FormLabel><Input bg={inputBg} type="number" min="0" max="10" value={vs.painScore || ''} onChange={(e) => updateInArray('vitalSignsLog', index, 'painScore', e.target.value)} /></FormControl>
                                    </SimpleGrid>
                                </Box>
                            ))}
                            <Button mt={6} size="md" variant="outline" colorScheme={patientInfoColorScheme} onClick={() => addToArray('vitalSignsLog', constants.vitalSignTemplate)} leftIcon={<AddIcon />}>Додати замір</Button>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* --- 5. ВИЯВЛЕНІ УШКОДЖЕННЯ --- */}
                    <AccordionItem sx={accordionItemBaseStyle}>
                        <h2>
                            <AccordionButton sx={accordionButtonBaseStyle(injuriesColorScheme)}>
                                <HStack spacing={4}><Icon as={WarningTwoIcon} boxSize={6}/> <Box>5. Виявлені Ушкодження</Box></HStack>
                                <AccordionIcon boxSize={7}/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={6} px={{base:4, md:6}} bg={subtlePaneBg}>
                             {(formData.suspectedInjuries || []).map((injury, index) => (
                                <Box key={index} sx={dynamicListItemStyle}>
                                    <Flex justifyContent="space-between" alignItems="center" mb={5}>
                                        <Text fontWeight="semibold" fontSize="lg" color={sectionTitleColor(injuriesColorScheme)}>Ушкодження #{index + 1}</Text>
                                        <IconButton icon={<DeleteIcon />} size="md" variant="ghost" colorScheme="red" onClick={() => removeFromArray('suspectedInjuries', index)} aria-label="Видалити ушкодження" />
                                    </Flex>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Частина тіла</FormLabel>
                                            <Select bg={inputBg} placeholder="Оберіть" value={injury.bodyPart || ''} onChange={(e) => updateInArray('suspectedInjuries', index, 'bodyPart', e.target.value)}>
                                                {constants.bodyParts.map(part => <option key={part} value={part}>{part}</option>)}
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Тип ушкодження</FormLabel>
                                            <Select bg={inputBg} placeholder="Оберіть" value={injury.typeOfInjury || ''} onChange={(e) => updateInArray('suspectedInjuries', index, 'typeOfInjury', e.target.value)}>
                                                {constants.injuryTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                    <FormControl mt={4}><FormLabel sx={formLabelBaseStyle}>Детальний опис</FormLabel><Textarea bg={inputBg} value={injury.description || ''} onChange={(e) => updateInArray('suspectedInjuries', index, 'description', e.target.value)} placeholder="Розмір, глибина, наявність кровотечі, деформація..." /></FormControl>
                                </Box>
                            ))}
                            <Button mt={6} size="md" variant="outline" colorScheme={injuriesColorScheme} onClick={() => addToArray('suspectedInjuries', constants.injuryTemplate)} leftIcon={<AddIcon />}>Додати ушкодження</Button>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* --- 6. ПРОВЕДЕНІ ВТРУЧАННЯ --- */}
                     <AccordionItem sx={accordionItemBaseStyle}>
                        <h2>
                            <AccordionButton sx={accordionButtonBaseStyle(interventionsColorScheme)}>
                                 <HStack spacing={4}><Icon as={CheckCircleIcon} boxSize={6}/> <Box>6. Проведені Втручання</Box></HStack>
                                <AccordionIcon boxSize={7}/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={6} px={{base:4, md:6}} bg={subtlePaneBg}>
                            {(formData.interventionsPerformed || []).map((intervention, index) => (
                                <Box key={index} sx={dynamicListItemStyle}>
                                    <Flex justifyContent="space-between" alignItems="center" mb={5}>
                                        <Text fontWeight="semibold" fontSize="lg" color={sectionTitleColor(interventionsColorScheme)}>Втручання #{index + 1}</Text>
                                        <IconButton icon={<DeleteIcon />} size="md" variant="ghost" colorScheme="red" onClick={() => removeFromArray('interventionsPerformed', index)} aria-label="Видалити втручання" />
                                    </Flex>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Тип втручання</FormLabel>
                                            <Select bg={inputBg} placeholder="Оберіть" value={intervention.type || ''} onChange={(e) => updateInArray('interventionsPerformed', index, 'type', e.target.value)}>
                                                {constants.interventionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Час (HH:mm)</FormLabel>
                                            <InputGroup>
                                                <Input bg={inputBg} type="time" value={intervention.timestamp || ''} onChange={(e) => updateInArray('interventionsPerformed', index, 'timestamp', e.target.value)} />
                                                <InputRightElement><Tooltip label="Поточний час" placement="top"><IconButton icon={<TimeIcon />} size="sm" variant="ghost" onClick={() => updateInArray('interventionsPerformed', index, 'timestamp', getCurrentTime())} aria-label="Встановити поточний час"/></Tooltip></InputRightElement>
                                            </InputGroup>
                                        </FormControl>
                                    </SimpleGrid>
                                    <FormControl mt={4}><FormLabel sx={formLabelBaseStyle}>Деталі / Результат</FormLabel><Textarea bg={inputBg} value={intervention.details || ''} onChange={(e) => updateInArray('interventionsPerformed', index, 'details', e.target.value)} placeholder="Напр., Джгут САТ на праве стегно, кровотеча зупинена. NaCl 0.9% 500 мл в/в." /></FormControl>
                                </Box>
                            ))}
                            <Button mt={6} size="md" variant="outline" colorScheme={interventionsColorScheme} onClick={() => addToArray('interventionsPerformed', constants.interventionTemplate)} leftIcon={<AddIcon />}>Додати втручання</Button>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* --- 7. ВВЕДЕНІ МЕДИКАМЕНТИ --- */}
                    <AccordionItem sx={accordionItemBaseStyle}>
                         <h2>
                            <AccordionButton sx={accordionButtonBaseStyle(medicationsColorScheme)}>
                                 <HStack spacing={4}><Icon as={ChatIcon} boxSize={6}/> <Box>7. Введені Медикаменти</Box></HStack>
                                <AccordionIcon boxSize={7}/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={6} px={{base:4, md:6}} bg={subtlePaneBg}>
                            {(formData.medicationsAdministered || []).map((med, index) => (
                                <Box key={index} sx={dynamicListItemStyle}>
                                    <Flex justifyContent="space-between" alignItems="center" mb={5}>
                                        <Text fontWeight="semibold" fontSize="lg" color={sectionTitleColor(medicationsColorScheme)}>Медикамент #{index + 1}</Text>
                                        <IconButton icon={<DeleteIcon />} size="md" variant="ghost" colorScheme="red" onClick={() => removeFromArray('medicationsAdministered', index)} aria-label="Видалити медикамент" />
                                    </Flex>
                                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg:5 }} spacing={5} alignItems="flex-end">
                                        <FormControl gridColumn={{base: "span 1", sm: "span 2", md: "span 1"}} isRequired><FormLabel sx={formLabelBaseStyle}>Назва</FormLabel><Input bg={inputBg} value={med.name || ''} onChange={(e) => updateInArray('medicationsAdministered', index, 'name', e.target.value)} /></FormControl>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Доза</FormLabel><Input bg={inputBg} type="text" value={med.dose || ''} onChange={(e) => updateInArray('medicationsAdministered', index, 'dose', e.target.value)} /></FormControl>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Од.</FormLabel>
                                            <Select bg={inputBg} value={med.unit || ''} onChange={(e) => updateInArray('medicationsAdministered', index, 'unit', e.target.value)}>
                                                {constants.medicationUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Шлях</FormLabel>
                                            <Select bg={inputBg} value={med.route || ''} onChange={(e) => updateInArray('medicationsAdministered', index, 'route', e.target.value)}>
                                                {constants.medicationRoutes.map(r => <option key={r} value={r}>{r}</option>)}
                                            </Select>
                                        </FormControl>
                                        <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Час</FormLabel>
                                            <InputGroup>
                                                <Input bg={inputBg} type="time" value={med.timestamp || ''} onChange={(e) => updateInArray('medicationsAdministered', index, 'timestamp', e.target.value)} />
                                                <InputRightElement><Tooltip label="Поточний час" placement="top"><IconButton icon={<TimeIcon />} size="sm" variant="ghost" onClick={() => updateInArray('medicationsAdministered', index, 'timestamp', getCurrentTime())} aria-label="Встановити поточний час"/></Tooltip></InputRightElement>
                                            </InputGroup>
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>
                            ))}
                            <Button mt={6} size="md" variant="outline" colorScheme={medicationsColorScheme} onClick={() => addToArray('medicationsAdministered', constants.medicationTemplate)} leftIcon={<AddIcon />}>Додати медикамент</Button>
                        </AccordionPanel>
                    </AccordionItem>

                    {/* --- 8. ТРАНСПОРТУВАННЯ, РЕЗУЛЬТАТ, НОТАТКИ --- */}
                    <AccordionItem sx={accordionItemBaseStyle}>
                        <h2>
                             <AccordionButton sx={accordionButtonBaseStyle(transportColorScheme)}>
                                 <HStack spacing={4}><Icon as={ArrowForwardIcon} boxSize={6}/> <Box>8. Транспортування, Результат та Нотатки</Box></HStack>
                                <AccordionIcon boxSize={7}/>
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={8} px={{base:4, md:6}} bg={subtlePaneBg}>
                             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <FormControl><FormLabel sx={formLabelBaseStyle}>ЗОЗ призначення</FormLabel><Input bg={inputBg} value={formData.transportation?.destinationFacilityName || ''} onChange={(e) => handleInputChange('transportation.destinationFacilityName', e.target.value)} placeholder="Назва лікарні"/></FormControl>
                                <FormControl><FormLabel sx={formLabelBaseStyle}>Транспорт</FormLabel>
                                    <Select bg={inputBg} placeholder="Оберіть" value={formData.transportation?.transportMode || ''} onChange={(e) => handleInputChange('transportation.transportMode', e.target.value)}>
                                        {constants.transportModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                    </Select>
                                </FormControl>
                                <FormControl><FormLabel sx={formLabelBaseStyle}>Час виїзду з місця</FormLabel>
                                     <InputGroup>
                                        <Input bg={inputBg} type="datetime-local" value={formData.transportation?.departureTimeFromScene || ''} onChange={(e) => handleInputChange('transportation.departureTimeFromScene', e.target.value)} />
                                        <InputRightElement><Tooltip label="Поточний час" placement="top"><IconButton icon={<TimeIcon />} size="sm" variant="ghost" onClick={() => handleInputChange('transportation.departureTimeFromScene', getCurrentDateTimeLocal())} aria-label="Встановити поточний час"/></Tooltip></InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                <FormControl isRequired><FormLabel sx={formLabelBaseStyle}>Результат на догоспітальному етапі</FormLabel>
                                    <Select bg={inputBg} placeholder="Оберіть" value={formData.outcomePreHospital || ''} onChange={(e) => handleInputChange('outcomePreHospital', e.target.value)}>
                                        {constants.patientOutcomePreHospital.map(outcome => <option key={outcome} value={outcome}>{outcome}</option>)}
                                    </Select>
                                </FormControl>
                            </SimpleGrid>
                            <FormControl mt={6}>
                                <FormLabel sx={formLabelBaseStyle}>Стан пацієнта під час транспортування</FormLabel>
                                <Textarea bg={inputBg} value={formData.transportation?.patientConditionDuringTransport || ''} onChange={(e) => handleInputChange('transportation.patientConditionDuringTransport', e.target.value)} placeholder="Стабільний, погіршення, покращення, СЛР в дорозі..."/>
                            </FormControl>
                             <FormControl mt={6}> {/* mt 6 */}
                                <FormLabel sx={formLabelBaseStyle}>Загальні нотатки по етапу</FormLabel>
                                <Textarea bg={inputBg} value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Будь-яка додаткова важлива інформація..."/>
                            </FormControl>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>


                <Divider my={10} borderColor={mainBorderColor} />

               <Flex
                    justifyContent={{base: "stretch", sm: "flex-end"}}
                    direction={{base: "column-reverse", sm: "row"}}
                    gap={4}
                    p={{base: 4, md: 6}}
                    bg={contentBg}
                    borderRadius="2xl" // Збільшено
                    boxShadow="xl"    // Збільшено
                >
                    {!isEditMode && <Button onClick={handleFillTestData} colorScheme={highlightColorScheme} variant="outline" isDisabled={isSubmitting} size="lg" w={{base: "full", sm: "auto"}}>Тестові дані</Button>}
                    <Button onClick={() => handleClear()} colorScheme={neutralColorScheme} variant="outline" isDisabled={isSubmitting} size="lg" w={{base: "full", sm: "auto"}}>
                        {isEditMode ? "Скасувати зміни" : "Очистити форму"}
                    </Button>
                    <Button
                        onClick={handleSave}
                        colorScheme={brandColorScheme}
                        isLoading={isSubmitting}
                        loadingText={isEditMode ? "Оновлення..." : "Збереження..."}
                        size="lg"
                        px={isEditMode ? 8 : 10}
                        w={{base: "full", sm: "auto"}}
                        _hover={{ bg: useColorModeValue(`${brandColorScheme}.700`, `${brandColorScheme}.400`)}} // Трохи темніший/світліший hover
                    >
                        {isEditMode ? "Оновити Картку" : "Зберегти Картку"}
                    </Button>
                </Flex>
            </VStack>
        </Container>
    );
}

export default PreHospitalCareSection;