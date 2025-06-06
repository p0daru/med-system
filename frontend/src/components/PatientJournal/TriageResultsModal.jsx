import React from 'react';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, OrderedList, ListItem, Flex, Text, Circle, VStack, Heading, Icon, Box
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { WarningTwoIcon } from '@chakra-ui/icons';

const MotionListItem = motion(ListItem);

const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const TriageResultsModal = ({ isOpen, onClose, rankedPatients, getPatientDisplayName, styles }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
            <ModalContent bg={styles.cardBg} color={styles.textColor}>
                <ModalHeader>Результати тріажу (Метод Аналізу Ієрархії)</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {rankedPatients.length > 0 ? (
                        <OrderedList spacing={4} styleType="none" m={0}>
                            {rankedPatients.map((p, index) => (
                                <MotionListItem
                                    key={p.patientId}
                                    p={3}
                                    bg={index === 0 ? "purple.500" : (index === 1 ? "purple.400" : (index === 2 ? "purple.300" : styles.pageContainer.bg))}
                                    color={index < 3 ? "white" : styles.textColor}
                                    borderRadius="md"
                                    boxShadow="sm"
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ duration: 0.3, delay: index * 0.08 }}
                                >
                                    <Flex align="center" justify="space-between">
                                        <Flex align="center">
                                            <Circle
                                                size="40px"
                                                bg={index < 3 ? "white" : styles.primaryAccentColor}
                                                color={index < 3 ? styles.primaryAccentColor : "white"}
                                                fontWeight="bold"
                                                fontSize="lg"
                                                mr={4}
                                            >
                                                {index + 1}
                                            </Circle>
                                            <VStack align="flex-start" spacing={0}>
                                                <Box>{getPatientDisplayName(p.patient)}</Box>
                                                <Text
                                                    fontSize="xs"
                                                    opacity={0.8}
                                                >
                                                    ID: {p.cardId}
                                                </Text>
                                            </VStack>
                                        </Flex>
                                        <VStack spacing={0} align="flex-end">
                                            <Text fontSize="sm" opacity={0.8}>Пріоритет</Text>
                                            <Text fontWeight="bold" fontSize="lg">
                                                {p.finalPriority.toFixed(4)}
                                            </Text>
                                        </VStack>
                                    </Flex>
                                </MotionListItem>
                            ))}
                        </OrderedList>
                    ) : (
                        <Flex direction="column" align="center" justify="center" p={8} textAlign="center">
                             <Icon as={WarningTwoIcon} w={12} h={12} color="yellow.400" mb={4} />
                            <Heading size="md" mb={2}>Пацієнти не знайдені</Heading>
                            <Text color={styles.subtleText}>
                                У вибраній категорії немає пацієнтів для проведення тріажу.
                            </Text>
                        </Flex>
                    )}
                </ModalBody>
                <ModalFooter borderTopWidth="1px" borderColor={styles.borderColor}>
                    <Button onClick={onClose}>Закрити</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TriageResultsModal;