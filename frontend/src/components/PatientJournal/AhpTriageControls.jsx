import React from 'react';
import {
    Box, Heading, VStack, HStack, Button, Select, Text, useColorModeValue,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    List, ListItem, OrderedList, Spinner, Flex, Kbd, Circle,
    Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { TRIAGE_CATEGORIES_OPTIONS } from '../PatientCard/patientCardConstants'; // Переконайтесь, що шлях правильний
import { AHP_CRITERIA_NAMES } from './triageService'; // Шлях до вашого triageService

function AhpTriageControls({
    records, // Потрібен для перевірки, чи є пацієнти для тріажу
    triageCategoryForAHP,
    onTriageCategoryForAHPChange,
    onRunAhpTriage,
    isAhpLoading,
    ahpResults, // Об'єкт, що містить rankedAhpPatients, criteriaWeights, consistencyOk, consistencyRatio
    disclosureAhpModal, // { isOpen, onOpen, onClose }
    getPatientDisplayName, // Функція для відображення імені пацієнта
    styles // Основний об'єкт стилів з PatientJournal
}) {
    const { rankedPatients = [], criteriaWeights = [], consistencyOk = true, consistencyRatio = null } = ahpResults || {};

    const canRunAhp = triageCategoryForAHP && triageCategoryForAHP !== 'black' && triageCategoryForAHP !== 'unknown';

    const selectedCategoryLabel = TRIAGE_CATEGORIES_OPTIONS.find(opt => opt.value === triageCategoryForAHP)?.label || triageCategoryForAHP;

    return (
        <>
            <Box
                flex={{ lg: 2 }} // Адаптуйте flex, якщо потрібно
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={styles.borderColor}
                bg={styles.cardBg}
                boxShadow="sm"
            >
                <Heading as="h3" size="sm" mb={4} color={styles.textColor}>Пріоритезація МАІ</Heading>
                <VStack spacing={3} align="stretch">
                    <HStack>
                        <Text fontSize="sm" color={styles.subtleText} whiteSpace="nowrap" flexShrink={0} mr={2}>
                            Категорія:
                        </Text>
                        <Select
                            size="sm"
                            value={triageCategoryForAHP}
                            onChange={(e) => onTriageCategoryForAHPChange(e.target.value)}
                            bg={styles.cardBg} borderColor={styles.borderColor} borderRadius="md"
                            flexGrow={1}
                        >
                            {TRIAGE_CATEGORIES_OPTIONS.filter(opt => opt.value !== 'unknown' && opt.value !== 'black').map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label.split('(')[1]?.replace(')', '').trim() || opt.label}
                                </option>
                            ))}
                        </Select>
                    </HStack>
                    <Button
                        size="sm"
                        colorScheme={styles.secondaryAccentColor?.split('.')[0] || 'teal'}
                        onClick={onRunAhpTriage}
                        isLoading={isAhpLoading}
                        loadingText="Тріаж..."
                        borderRadius="md"
                        w="100%"
                        isDisabled={!canRunAhp || isAhpLoading}
                    >
                        Запустити Тріаж МАІ
                    </Button>
                </VStack>
            </Box>

            <Modal isOpen={disclosureAhpModal.isOpen} onClose={disclosureAhpModal.onClose} size="2xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Результати Тріажу МАІ для категорії "{selectedCategoryLabel}"
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {isAhpLoading && <Flex justify="center" align="center" minH="200px"><Spinner size="xl" color={styles.primaryAccentColor} /></Flex>}
                        
                        {!isAhpLoading && !consistencyOk && (
                             <Alert status="warning" borderRadius="md" mb={4}>
                                <AlertIcon />
                                <Box>
                                <AlertTitle>Увага: Низька узгодженість!</AlertTitle>
                                <AlertDescription>
                                    Матриця порівняння критеріїв МАІ може бути неузгодженою.
                                    Це означає, що експертні оцінки важливості критеріїв можуть бути суперечливими.
                                    Результати тріажу слід інтерпретувати з особливою обережністю.
                                    Рекомендується переглянути налаштування ваг критеріїв.
                                    {consistencyRatio !== null && ` (CR = ${consistencyRatio.toFixed(3)})`}
                                </AlertDescription>
                                </Box>
                            </Alert>
                        )}

                        {!isAhpLoading && criteriaWeights.length > 0 && (
                             <Box mb={4} p={3} borderWidth="1px" borderRadius="md" borderColor={styles.borderColor}>
                                <Text fontWeight="bold" mb={1}>Ваги критеріїв (ω), використані для розрахунку:</Text>
                                <List spacing={1} fontSize="sm">
                                    {AHP_CRITERIA_NAMES.map((name, index) => (
                                        <ListItem key={name} display="flex" justifyContent="space-between">
                                            <Text>{name}:</Text>
                                            <Text fontWeight="medium">{(criteriaWeights[index] * 100 || 0).toFixed(2)}%</Text>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {!isAhpLoading && rankedPatients.length > 0 && (
                            <VStack align="stretch" spacing={3}>
                                <Text fontWeight="bold">Відранжований список пацієнтів (найвищий пріоритет зверху):</Text>
                                <OrderedList spacing={4} pl={0} styleType="none">
                                    {rankedPatients.map((patient, idx) => (
                                        <ListItem
                                            key={patient._id || patient.cardId}
                                            p={3}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            borderColor={idx === 0 ? (styles.primaryAccentColor || "purple.500") : styles.borderColor}
                                            bg={idx === 0 ? useColorModeValue("purple.50", "rgba(159, 122, 234, 0.1)") : undefined}
                                        >
                                            <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={2}>
                                                <HStack spacing={3} alignItems="center">
                                                    <Circle size="24px" bg={idx === 0 ? (styles.primaryAccentColor || "purple.500") : "gray.500"} color="white" fontSize="sm" fontWeight="bold">
                                                        {patient.ahpRank}
                                                    </Circle>
                                                    <Box>
                                                        <Text fontWeight="medium" color={styles.headingColor}>
                                                            {getPatientDisplayName(patient, true)}
                                                        </Text>
                                                        <Text fontSize="xs" color={styles.subtleText}>
                                                            ID: {patient.cardId || 'N/A'}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Text fontSize="sm" color={styles.subtleText} fontWeight="medium" whiteSpace="nowrap" >
                                                    Пріоритет: <Kbd>{patient.ahpGlobalPriority?.toFixed(4) || 'N/A'}</Kbd>
                                                </Text>
                                            </Flex>
                                        </ListItem>
                                    ))}
                                </OrderedList>
                            </VStack>
                        )}
                        {!isAhpLoading && rankedPatients.length === 0 && records.filter(r => r.triageCategory?.toLowerCase() === triageCategoryForAHP.toLowerCase()).length === 0 && (
                            <Text color={styles.subtleText} textAlign="center" py={5}>
                                Немає пацієнтів у вибраній категорії для відображення результатів тріажу.
                            </Text>
                        )}
                         {!isAhpLoading && rankedPatients.length === 0 && records.filter(r => r.triageCategory?.toLowerCase() === triageCategoryForAHP.toLowerCase()).length > 0 && (
                            <Text color={styles.subtleText} textAlign="center" py={5}>
                                Розрахунок МАІ не дав результатів для пацієнтів цієї категорії. Можливо, недостатньо даних.
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" variant="ghost" onClick={disclosureAhpModal.onClose}>
                            Закрити
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default AhpTriageControls;