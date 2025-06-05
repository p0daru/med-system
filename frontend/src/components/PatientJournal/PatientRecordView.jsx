// frontend/src/components/PatientJournal/PatientRecordView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Heading, Text, Spinner, VStack, HStack, Button, Divider,
    Alert, AlertIcon, AlertTitle, AlertDescription, Icon,
    SimpleGrid, Card, CardHeader, CardBody, Flex, useToast, IconButton, useDisclosure,
    Avatar, Tag
} from '@chakra-ui/react';
import {
    ArrowBackIcon, EditIcon, DeleteIcon, TimeIcon, InfoOutlineIcon, AtSignIcon,
    ViewIcon, WarningIcon, AddIcon, CheckCircleIcon, QuestionOutlineIcon, ArrowForwardIcon,
    SunIcon, BellIcon, StarIcon
} from '@chakra-ui/icons';
import { getTraumaRecordById, deleteTraumaRecord as apiDeleteTraumaRecord } from '../../services/traumaRecord.api';
import ConfirmationModal from '../UI/ConfirmationModal';
import { format, parseISO, differenceInYears } from 'date-fns';
import { uk } from 'date-fns/locale';

import {
    GENDER_OPTIONS, AIRWAY_STATUS_OPTIONS, BREATHING_RATE_OPTIONS, OXYGEN_SATURATION_OPTIONS,
    BREATHING_QUALITY_OPTIONS, CHEST_EXCURSION_OPTIONS, AUSCULTATION_LUNGS_OPTIONS,
    PULSE_RATE_OPTIONS, PULSE_QUALITY_OPTIONS, PULSE_LOCATION_OPTIONS, CAPILLARY_REFILL_TIME_OPTIONS,
    SKIN_STATUS_OPTIONS, EXTERNAL_BLEEDING_OPTIONS, GCS_EYE_OPTIONS, GCS_VERBAL_OPTIONS,
    GCS_MOTOR_OPTIONS, PUPIL_REACTION_OPTIONS, MOTOR_SENSORY_STATUS_OPTIONS, BODY_TEMPERATURE_OPTIONS,
    TRANSPORTATION_METHOD_OPTIONS, TRIAGE_CATEGORIES_OPTIONS, SCENE_TYPE_OPTIONS,
    MEDICATION_ROUTE_OPTIONS, EFFECTIVENESS_OPTIONS
} from '../PatientCard/patientCardConstants';

const mapStatusToDisplay = (statusKey) => {
    const statusMap = {
        Pending: 'Очікує', PreHospitalActive: 'Долікарняний (Активна)', PreHospitalFinalized: 'Долікарняний (Завершено)',
        HospitalCareActive: 'Госпітальний (Активна)', HospitalCareFinalized: 'Госпітальний (Завершено)',
        Closed: 'Закрита', Archived: 'Архівна',
    };
    return statusMap[statusKey] || statusKey || 'Невідомий';
};

const getStatusColorScheme = (statusKey) => {
    const colorMap = {
        PreHospitalActive: 'yellow', PreHospitalFinalized: 'green',
        HospitalCareActive: 'blue', HospitalCareFinalized: 'teal',
        Closed: 'gray', Archived: 'purple', Pending: 'orange',
    };
    return colorMap[statusKey] || 'gray';
}

const getTriageColorScheme = (triageCategory) => {
    // Assuming TRIAGE_CATEGORIES_OPTIONS has a 'colorScheme' or similar, or we map it here
    const foundOption = TRIAGE_CATEGORIES_OPTIONS.find(opt => opt.value === triageCategory);
    if (foundOption && foundOption.color) {
        // Extract base color for scheme (e.g., "green.500" -> "green")
        return foundOption.color.split('.')[0];
    }
    return 'gray';
};


const formatDateAndTimeDetails = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), "dd.MM.yyyy HH:mm", { locale: uk });
    } catch (e) { return 'Невірна дата'; }
};

const formatDateSimple = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), "dd.MM.yyyy", { locale: uk });
    } catch (e) { return 'Невірна дата'; }
};

const findLabel = (optionsArray, value) => {
    if (value === undefined || value === null) return 'N/A';
    const foundOption = optionsArray.find(option => option.value === value);
    return foundOption ? foundOption.label : String(value);
};

const calculateGcsTotal = (eye, verbal, motor) => {
    const e = parseInt(eye, 10);
    const v = parseInt(verbal, 10);
    const m = parseInt(motor, 10);
    if (!isNaN(e) && !isNaN(v) && !isNaN(m)) { return e + v + m; }
    return 'N/A';
};

const DataField = ({ label, value, children, icon, highlight = false }) => {
    if ((value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) && !children) {
        return null;
    }
    let displayValue = value;
    if (typeof value === 'boolean') {
        displayValue = value ? "Так" : "Ні";
    }

    return (
        <HStack spacing={3} alignItems="flex-start" w="100%" py={1.5}>
            {icon && <Icon as={icon} color="gray.500" mt={1} boxSize={5} />}
            <Text fontWeight="medium" as="span" minW={{ base: "100px", sm: "120px", md: "160px" }} color="gray.600" flexShrink={0}>{label}:</Text>
            {children ? (
                <Box flex="1" fontWeight={highlight ? "bold" : "normal"} color={highlight ? "blackAlpha.900" : "gray.800"} textAlign="left" wordBreak="break-word">
                    {children}
                </Box>
            ) : (
                <Text as="span" whiteSpace="pre-wrap" flex="1" fontWeight={highlight ? "bold" : "normal"} color={highlight ? "blackAlpha.900" : "gray.800"} textAlign="left" wordBreak="break-word">
                    {String(displayValue)}
                </Text>
            )}
        </HStack>
    );
};


function PatientRecordView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

    useEffect(() => {
        const fetchRecordData = async () => {
            if (id) {
                setLoading(true);
                try {
                    const response = await getTraumaRecordById(id);
                    setRecord(response.data);
                    setError(null);
                } catch (err) {
                    console.error("Error fetching trauma record:", err);
                    const errorMessage = err.response?.data?.message || err.message || "Не вдалося завантажити дані картки.";
                    setError(errorMessage);
                    toast({ title: "Помилка завантаження", description: errorMessage, status: "error", duration: 5000, isClosable: true });
                } finally { setLoading(false); }
            }
        };
        fetchRecordData();
    }, [id, toast]);

    const handleDelete = async () => {
        try {
            await apiDeleteTraumaRecord(id);
            toast({ title: "Запис видалено", status: "success", duration: 3000, isClosable: true });
            navigate('/trauma-journal');
        } catch (err) {
            toast({ title: "Помилка видалення", description: err.response?.data?.message || err.message, status: "error", duration: 5000, isClosable: true });
        } finally { onDeleteModalClose(); }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minHeight="calc(100vh - 150px)" /* Adjust based on header/footer height */ >
                <Spinner size="xl" thickness="4px" color="blue.500" /* Changed to a neutral blue or could be gray */ />
                <Text ml={4} fontSize="lg" color="gray.600">Завантаження даних картки...</Text>
            </Flex>
        );
    }

    if (error) {
        return (
            <Box py={10}>
                <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" minHeight="200px" p={6} borderRadius="md" bg="red.50" borderColor="red.200" borderWidth="1px">
                    <AlertIcon boxSize="40px" mr={0} color="red.500" />
                    <AlertTitle mt={4} mb={1} fontSize="xl" color="red.700">Помилка завантаження!</AlertTitle>
                    <AlertDescription maxWidth="sm" color="red.600">{error}</AlertDescription>
                    <Button as={RouterLink} to="/trauma-journal" leftIcon={<ArrowBackIcon />} mt={6} colorScheme="gray">
                        Повернутися до Журналу
                    </Button>
                </Alert>
            </Box>
        );
    }

    if (!record) {
        return (
            <Box py={10}>
                <Alert status="warning" p={4} borderRadius="md" bg="yellow.50" borderColor="yellow.200" borderWidth="1px" alignItems="center">
                    <AlertIcon color="yellow.500"/>
                    <Text color="yellow.700" ml={2}>Дані картки не знайдено або не вдалося завантажити.</Text>
                    <Button as={RouterLink} to="/trauma-journal" leftIcon={<ArrowBackIcon />} ml="auto" colorScheme="gray" size="sm">
                        До Журналу
                    </Button>
                </Alert>
            </Box>
        );
    }
    
    const {
        cardId, incidentDateTime, arrivalDateTime, medicalTeamResponsible, status, createdAt, updatedAt,
        patientInfo, sceneTypeValue, sceneTypeOther, catastrophicHemorrhageControlled, catastrophicHemorrhageDetails,
        airwayStatus, breathingRate, breathingSaturation, breathingQuality, chestExcursion, auscultationLungs,
        pulseRate, pulseQuality, pulseLocation, bloodPressureSystolic, bloodPressureDiastolic, capillaryRefillTime,
        skinStatus, externalBleeding, glasgowComaScaleEye, glasgowComaScaleVerbal, glasgowComaScaleMotor,
        pupilReaction, motorSensoryStatus, neurologicalStatusDetails, bodyTemperature,
        medicationsAdministered = [], proceduresPerformed: interventions = [], ivAccessDetails,
        transportationMethod, transportationOtherDetails, destinationFacility, triageCategory, rtsScore, 
    } = record;

    const gcsTotal = calculateGcsTotal(glasgowComaScaleEye, glasgowComaScaleVerbal, glasgowComaScaleMotor);
    const patientDisplayName = patientInfo?.patientFullName || "Пацієнт";
    let patientAgeDisplay = "N/A";
    if (patientInfo?.patientDateOfBirth) {
        try {
            const age = differenceInYears(new Date(), parseISO(patientInfo.patientDateOfBirth));
            patientAgeDisplay = `${age} р. (${formatDateSimple(patientInfo.patientDateOfBirth)})`;
        } catch (e) { patientAgeDisplay = formatDateSimple(patientInfo.patientDateOfBirth) || 'N/A'; }
    } else if (patientInfo?.patientApproximateAge) {
        patientAgeDisplay = `~${patientInfo.patientApproximateAge} р.`;
    }

    return (
        <Box maxWidth="2000px" mx="auto">
            {/* Header */}
            <Flex mb={8} alignItems="center" justifyContent="space-between" wrap="wrap" pb={4} borderBottomWidth="1px" borderColor="gray.200">
                <HStack spacing={{base: 2, md: 4}}>
                    <IconButton icon={<ArrowBackIcon />} aria-label="Назад до журналу" onClick={() => navigate('/trauma-journal')} variant="ghost" color="gray.700" size="md"/>
                    <Heading size={{base: "md", md: "lg"}} color="blackAlpha.800">Картка Пацієнта</Heading>
                </HStack>
                <HStack spacing={3} mt={{base: 3, md: 0}}>
                    <Button 
                        leftIcon={<EditIcon />} 
                        onClick={() => navigate(`/prehospital-care/${id}`)} 
                        size="sm" 
                        colorScheme="gray" 
                        variant="solid"
                        bg="gray.700" 
                        color="white" 
                        _hover={{ bg: "gray.600" }}
                        _active={{ bg: "gray.800" }}
                    >
                        Редагувати
                    </Button>
                    <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={onDeleteModalOpen} size="sm">Видалити</Button>
                </HStack>
            </Flex>

            {/* Patient Info & General Record Info */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
                <Card variant="outline" shadow="md" bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                    <CardHeader bg="gray.50" borderTopRadius="lg" borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}>
                        <HStack>
                            <Avatar name={patientDisplayName} bg="gray.200" color="gray.700" size="md" />
                            <Heading size="sm" color="gray.700">{patientDisplayName}</Heading>
                        </HStack>
                    </CardHeader>
                    <CardBody p={4}>
                        <DataField label="Вік/ДН" value={patientAgeDisplay} icon={InfoOutlineIcon} />
                        <DataField label="Стать" value={findLabel(GENDER_OPTIONS, patientInfo?.patientGender)} icon={InfoOutlineIcon} />
                    </CardBody>
                </Card>

                <Card variant="outline" shadow="md" bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                     <CardHeader bg="gray.50" borderTopRadius="lg" borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}>
                        <Heading size="sm" color="gray.700">Загальна Інформація</Heading>
                    </CardHeader>
                    <CardBody p={4}>
                        <DataField label="ID Картки" value={cardId} icon={InfoOutlineIcon} highlight/>
                        <DataField label="Статус" icon={ViewIcon}>
                            <Tag size="md" variant="subtle" colorScheme={getStatusColorScheme(status)}>{mapStatusToDisplay(status)}</Tag>
                        </DataField>
                        <DataField label="Відповідальний" value={medicalTeamResponsible} icon={AtSignIcon} />
                        <DataField label="Тріаж" icon={WarningIcon}>
                             <Tag size="md" variant="subtle" colorScheme={getTriageColorScheme(triageCategory)}>{findLabel(TRIAGE_CATEGORIES_OPTIONS, triageCategory)}</Tag>
                        </DataField>
                         <DataField label="RTS Score" value={rtsScore || 'N/A'} icon={StarIcon} />
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Інцидент та Оцінка Місця Події */}
            <Card variant="outline" mb={8} shadow="md" bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                <CardHeader bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}><Heading size="sm" color="gray.700">Інцидент та Місце Події</Heading></CardHeader>
                <CardBody p={4}>
                    <DataField label="Час інциденту" value={formatDateAndTimeDetails(incidentDateTime)} icon={TimeIcon} />
                    <DataField label="Час прибуття" value={formatDateAndTimeDetails(arrivalDateTime)} icon={TimeIcon} />
                    <DataField label="Тип місця події" value={findLabel(SCENE_TYPE_OPTIONS, sceneTypeValue)} icon={BellIcon} />
                    <DataField label="Інший тип місця" value={sceneTypeOther} icon={BellIcon} />
                    <Divider my={3} borderColor="gray.200"/>
                    <DataField label="Катастроф. кровотеча зупинена" value={catastrophicHemorrhageControlled} icon={WarningIcon} />
                    <DataField label="Деталі по кровотечі" value={catastrophicHemorrhageDetails} icon={WarningIcon} />
                </CardBody>
            </Card>

            {/* Первинний Огляд (ABCDE) */}
            <Card variant="outline" mb={8} shadow="md" bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                <CardHeader bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}><Heading size="sm" color="gray.700">Первинний Огляд (ABCDE)</Heading></CardHeader>
                <CardBody p={4}>
                    <Heading size="xs" color="gray.700" mb={2} textTransform="uppercase">A: Дихальні шляхи</Heading>
                    <DataField label="Статус ДШ" value={findLabel(AIRWAY_STATUS_OPTIONS, airwayStatus)} />
                    <Divider my={3} borderColor="gray.200"/>

                    <Heading size="xs" color="gray.700" my={2} textTransform="uppercase">B: Дихання</Heading>
                    <DataField label="ЧД" value={findLabel(BREATHING_RATE_OPTIONS, breathingRate) + (breathingRate && !BREATHING_RATE_OPTIONS.find(opt => opt.value === breathingRate) ? ` (${breathingRate}/хв)` : '')} />
                    <DataField label="SpO2" value={findLabel(OXYGEN_SATURATION_OPTIONS, breathingSaturation) + (breathingSaturation && !OXYGEN_SATURATION_OPTIONS.find(opt => opt.value === breathingSaturation) ? ` (${breathingSaturation}%)` : '')} />
                    <DataField label="Якість дихання" value={findLabel(BREATHING_QUALITY_OPTIONS, breathingQuality)} />
                    <DataField label="Екскурсія ГК" value={findLabel(CHEST_EXCURSION_OPTIONS, chestExcursion)} />
                    <DataField label="Аускультація" value={findLabel(AUSCULTATION_LUNGS_OPTIONS, auscultationLungs)} />
                    <Divider my={3} borderColor="gray.200"/>

                    <Heading size="xs" color="gray.700" my={2} textTransform="uppercase">C: Кровообіг</Heading>
                    <DataField label="ЧСС" value={findLabel(PULSE_RATE_OPTIONS, pulseRate) + (pulseRate && !PULSE_RATE_OPTIONS.find(opt => opt.value === pulseRate) ? ` (${pulseRate}/хв)` : '')} />
                    <DataField label="Якість пульсу" value={findLabel(PULSE_QUALITY_OPTIONS, pulseQuality)} />
                    <DataField label="Локалізація" value={findLabel(PULSE_LOCATION_OPTIONS, pulseLocation)} />
                    <DataField label="АТ" value={`${bloodPressureSystolic || 'N/A'} / ${bloodPressureDiastolic || 'N/A'} мм рт.ст.`} />
                    <DataField label="Капілярний тест" value={findLabel(CAPILLARY_REFILL_TIME_OPTIONS, capillaryRefillTime)} />
                    <DataField label="Шкіра" value={findLabel(SKIN_STATUS_OPTIONS, skinStatus)} />
                    <DataField label="Зовн. кровотеча" value={findLabel(EXTERNAL_BLEEDING_OPTIONS, externalBleeding)} />
                    <Divider my={3} borderColor="gray.200"/>
                    
                    <Heading size="xs" color="gray.700" my={2} textTransform="uppercase">D: Неврологія</Heading>
                    <Text fontWeight="medium" color="gray.500" mb={1} fontSize="sm">Шкала коми Глазго (GCS):</Text>
                    <Box pl={4} mb={2} borderLeft="2px solid" borderColor="gray.200">
                        <DataField label="Очі (E)" value={`${findLabel(GCS_EYE_OPTIONS, glasgowComaScaleEye)} (${glasgowComaScaleEye || 'N/A'})`} />
                        <DataField label="Верб. (V)" value={`${findLabel(GCS_VERBAL_OPTIONS, glasgowComaScaleVerbal)} (${glasgowComaScaleVerbal || 'N/A'})`} />
                        <DataField label="Рух. (M)" value={`${findLabel(GCS_MOTOR_OPTIONS, glasgowComaScaleMotor)} (${glasgowComaScaleMotor || 'N/A'})`} />
                        <DataField label="GCS Загалом" value={gcsTotal} highlight />
                    </Box>
                    <DataField label="Реакція зіниць" value={findLabel(PUPIL_REACTION_OPTIONS, pupilReaction)} />
                    <DataField label="Рух./Сенс. статус" value={findLabel(MOTOR_SENSORY_STATUS_OPTIONS, motorSensoryStatus)} />
                    <DataField label="Дод. неврол. дані" value={neurologicalStatusDetails} />
                    <Divider my={3} borderColor="gray.200"/>

                    <Heading size="xs" color="gray.700" my={2} textTransform="uppercase">E: Огляд / Температура</Heading>
                    <DataField label="t° тіла" value={findLabel(BODY_TEMPERATURE_OPTIONS, bodyTemperature) + (bodyTemperature && !BODY_TEMPERATURE_OPTIONS.find(opt => opt.value === bodyTemperature) ? ` (${bodyTemperature}°C)` : '')} icon={SunIcon}/>
                </CardBody>
            </Card>

            <Card variant="outline" mb={8} shadow="md" bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                <CardHeader bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}><Heading size="sm" color="gray.700">Маніпуляції та Медикаменти</Heading></CardHeader>
                <CardBody p={4}>
                    <Heading size="xs" color="gray.700" mb={3} textTransform="uppercase">Введені медикаменти</Heading>
                    {medicationsAdministered && medicationsAdministered.length > 0 ? (
                        medicationsAdministered.map((med, idx) => (
                            <Box key={`med-${idx}`} mb={3} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="gray.50">
                                <DataField label="Назва" value={med.name} icon={AddIcon}/>
                                <DataField label="Доза" value={med.dosage} />
                                <DataField label="Шлях" value={findLabel(MEDICATION_ROUTE_OPTIONS, med.route)} />
                                <DataField label="Час" value={med.time} />
                                {med.effectiveness && <DataField label="Ефект" value={findLabel(EFFECTIVENESS_OPTIONS, med.effectiveness)} />}
                            </Box>
                        ))
                    ) : <Text color="gray.500" fontStyle="italic" fontSize="sm">Медикаменти не вводились.</Text>}
                    
                    <Divider my={4} borderColor="gray.200" />
                    <Heading size="xs" color="gray.700" my={2} textTransform="uppercase">Проведені маніпуляції</Heading>
                     {interventions && interventions.length > 0 ? (
                        interventions.map((proc, idx) => (
                            <Box key={`proc-${idx}`} mb={3} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="gray.50">
                                <DataField label="Тип" value={proc.name} icon={CheckCircleIcon}/>
                                <DataField label="Деталі" value={proc.details} />
                                <DataField label="Час" value={proc.time} />
                                {proc.effectiveness && <DataField label="Ефект" value={findLabel(EFFECTIVENESS_OPTIONS, proc.effectiveness)} />}
                            </Box>
                        ))
                    ) : <Text color="gray.500" fontStyle="italic" fontSize="sm">Маніпуляції не проводились.</Text>}

                    <Divider my={4} borderColor="gray.200" />
                    <DataField label="Деталі в/в доступу" value={ivAccessDetails} icon={InfoOutlineIcon}/>
                </CardBody>
            </Card>

            <Card variant="outline" mb={8} shadow="md" bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                <CardHeader bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}><Heading size="sm" color="gray.700">Транспортування</Heading></CardHeader>
                <CardBody p={4}>
                    <DataField label="Метод" value={findLabel(TRANSPORTATION_METHOD_OPTIONS, transportationMethod)} icon={ArrowForwardIcon}/>
                    <DataField label="Інші деталі" value={transportationOtherDetails} icon={ArrowForwardIcon}/>
                    <DataField label="Заклад" value={destinationFacility} icon={ArrowForwardIcon}/>
                </CardBody>
            </Card>
            
            <Card variant="outline" mb={8} shadow="md" bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                <CardHeader bg="gray.50" borderBottomWidth="1px" borderColor="gray.200" py={3} px={4}><Heading size="sm" color="gray.700">Службова Інформація</Heading></CardHeader>
                <CardBody p={4}>
                    <DataField label="Створено" value={formatDateAndTimeDetails(createdAt)} icon={TimeIcon}/>
                    <DataField label="Оновлено" value={formatDateAndTimeDetails(updatedAt)} icon={TimeIcon}/>
                </CardBody>
            </Card>

            <ConfirmationModal
                isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} onConfirm={handleDelete}
                title="Підтвердити Видалення"
                body={`Ви дійсно бажаєте видалити картку для ${patientDisplayName} (ID: ${cardId})? Цю дію неможливо буде скасувати.`}
                confirmButtonColorScheme="red" confirmButtonText="Видалити" cancelButtonText="Скасувати"
            />
        </Box>
    );
}

export default PatientRecordView;