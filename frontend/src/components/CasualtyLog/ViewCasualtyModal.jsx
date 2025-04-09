// src/components/CasualtyLog/ViewCasualtyModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    Button, VStack, Text, Spinner, Box, Heading, SimpleGrid, Tag, Divider,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td, HStack, Badge
} from '@chakra-ui/react';
import { format, parseISO, isValid } from 'date-fns';
import { uk } from 'date-fns/locale';

// Імпортуємо стилі
import * as styles from './ViewCasualtyModal.styles.js';

// --- Helper Functions (скопійовано з CasualtyLog) ---
const formatLogDateTime = (isoString) => {
    if (!isoString) return '-';
    try {
        const date = parseISO(isoString);
        if (!isValid(date)) return '-';
        return format(date, 'dd.MM.yyyy HH:mm', { locale: uk });
    } catch (e) { return 'Помилка'; }
};

const getPriorityColorScheme = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'невідкладна': return 'red';
        case 'пріоритетна': return 'orange';
        case 'звичайна': return 'green';
        default: return 'gray';
    }
};
// --- End Helper Functions ---

function ViewCasualtyModal({ isOpen, onClose, cardData }) {
    const navigate = useNavigate();

    const handleEditClick = () => {
        if (cardData?._id) {
            onClose(); // Закриваємо модалку перед переходом
            navigate(`/casualty/${cardData._id}`);
        }
    };

    // Визначення назв кінцівок для турнікетів
    const limbLabels = {
        rightArm: "Пр. рука",
        leftArm: "Лів. рука",
        rightLeg: "Пр. нога",
        leftLeg: "Лів. нога"
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            {/* Застосовуємо стилі до ModalOverlay */}
            <ModalOverlay {...styles.modalOverlayStyles} />
            <ModalContent>
                <ModalHeader>
                    Деталі Картки: {cardData?.patientFullName || (cardData?.individualNumber || 'N/A')}
                </ModalHeader>
                <ModalCloseButton />
                {/* Застосовуємо стилі до ModalBody */}
                <ModalBody {...styles.modalBodyStyles}>
                    {cardData ? (
                        // Залишаємо spacing і align тут для ясності структури
                        <VStack spacing={5} align="stretch">
                            {/* --- Секція 1 --- */}
                            {/* Застосовуємо стилі до Box */}
                            <Box {...styles.sectionBoxStyles}>
                                {/* Застосовуємо стилі до Heading */}
                                <Heading {...styles.sectionHeadingStyles}>1. Дані постраждалого</Heading>
                                {/* Застосовуємо стилі до SimpleGrid, залишаючи columns */}
                                <SimpleGrid columns={{ base: 1, md: 2 }} {...styles.dataGridStyles}>
                                    {/* Застосовуємо стилі до Text */}
                                    <Text sx={styles.dataTextStyles}><strong>ПІБ:</strong> {cardData.patientFullName || '-'}</Text>
                                    <Text sx={styles.dataTextStyles}><strong>ID Бійця:</strong> {cardData.individualNumber || '-'}</Text>
                                    <Text sx={styles.dataTextStyles}><strong>Стать:</strong> {cardData.gender || '-'}</Text>
                                    <Text sx={styles.dataTextStyles}><strong>Підрозділ:</strong> {cardData.unit || '-'}</Text>
                                    <Text sx={styles.dataTextStyles}><strong>Рід військ:</strong> {cardData.branchOfService || '-'}</Text>
                                    <Text sx={styles.dataTextStyles}><strong>Дата/час поранення:</strong> {formatLogDateTime(cardData.injuryDateTime)}</Text>
                                    <Text sx={styles.dataTextStyles}><strong>Пріоритет евакуації:</strong> <Tag size="sm" colorScheme={getPriorityColorScheme(cardData.evacuationPriority)}>{cardData.evacuationPriority || '-'}</Tag></Text>
                                    {cardData.last4SSN && <Text sx={styles.dataTextStyles}><strong>Ост. 4 НСС:</strong> {cardData.last4SSN}</Text>}
                                </SimpleGrid>
                                <Heading {...styles.subHeadingStyles}>Алергії:</Heading>
                                {cardData.allergies?.nka ? <Tag colorScheme="green" size="sm">Немає відомих алергій</Tag> : (
                                    <VStack {...styles.allergyListStyles}>
                                        {Object.entries(cardData.allergies?.known || {}).filter(([, value]) => value).length > 0
                                            ? Object.entries(cardData.allergies.known).filter(([, value]) => value).map(([key]) => <Text key={key}>- {key}</Text>)
                                            // Застосовуємо стилі до плейсхолдера
                                            : !cardData.allergies?.other && <Text sx={styles.italicPlaceholderStyles}>Не вказано</Text>
                                        }
                                        {cardData.allergies?.other && <Text><strong>Інше:</strong> {cardData.allergies.other}</Text>}
                                    </VStack>
                                )}
                            </Box>

                            {/* --- Секція 2 & 3 --- */}
                            <Box {...styles.sectionBoxStyles}>
                                <Heading {...styles.sectionHeadingStyles}>2. Інформація про поранення</Heading>
                                <Text sx={styles.dataTextStyles}><strong>Механізм:</strong> {cardData.mechanismOfInjury?.join(', ') || '-'} {cardData.mechanismOfInjuryOther ? `(${cardData.mechanismOfInjuryOther})` : ''}</Text>
                                <Text sx={styles.dataTextStyles}><strong>Опис:</strong> {cardData.injuryDescription || '-'}</Text>
                                <Divider my={3} />
                                <Heading {...styles.sectionHeadingStyles}>3. Турнікети</Heading>
                                <SimpleGrid columns={{ base: 1, sm: 2 }} {...styles.tourniquetGridStyles}>
                                    {Object.entries(cardData.tourniquets || {}).filter(([, data]) => data && (data.time || data.type)).length > 0 ?
                                       Object.entries(cardData.tourniquets || {}).map(([limb, data]) => (
                                            data && (data.time || data.type) ? (
                                               <Box key={limb} {...styles.tourniquetItemBoxStyles}>
                                                    <Text sx={styles.tourniquetLimbTextStyles}>{ limbLabels[limb] || limb }</Text>
                                                    <Text sx={styles.tourniquetDetailTextStyles}>Час: {data.time || '-'}</Text>
                                                    <Text sx={styles.tourniquetDetailTextStyles}>Тип: {data.type || '-'}</Text>
                                                </Box>
                                             ) : null
                                        )) : <Text sx={styles.noDataTextStyles}>Не застосовувались</Text>}
                                </SimpleGrid>
                            </Box>

                            {/* --- Секція 4: Вітальні знаки --- */}
                            <Box {...styles.sectionBoxStyles}>
                                <Heading {...styles.sectionHeadingStyles}>4. Життєві показники</Heading>
                                {(cardData.vitalSigns || []).length > 0 ? (
                                    <TableContainer>
                                        {/* Застосовуємо стилі до Table */}
                                        <Table {...styles.vitalsTableStyles}>
                                            <Thead><Tr><Th>Час</Th><Th>Пульс</Th><Th>АТ</Th><Th>ЧД</Th><Th>SpO2</Th><Th>AVPU</Th><Th>Біль</Th></Tr></Thead>
                                            <Tbody>
                                                {(cardData.vitalSigns || []).map((vs, index) => (
                                                    <Tr key={`vs-${index}`}><Td>{vs.time||'-'}</Td><Td>{vs.pulse||'-'}</Td><Td>{vs.bp||'-'}</Td><Td>{vs.rr||'-'}</Td><Td>{vs.spO2||'-'}</Td><Td>{vs.avpu||'-'}</Td><Td>{vs.pain||'-'}</Td></Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                ) : <Text sx={styles.noDataTextStyles}>Немає записів</Text>}
                            </Box>

                             {/* --- Секція 5: Надана допомога --- */}
                             <Box {...styles.sectionBoxStyles}>
                                 <Heading {...styles.sectionHeadingStyles}>5. Надана Допомога (MARCH)</Heading>
                                 {/* Залишаємо spacing/align для VStack */}
                                 <VStack align="stretch" spacing={2}>
                                      {/* Застосовуємо стилі до заголовків MARCH, залишаючи color і mt */}
                                      <Text sx={styles.marchTitleStyles} color="red.600">C - Circulation:</Text>
                                     <HStack {...styles.marchTagContainerStyles}>
                                          {cardData.aidCirculation?.tourniquetJunctional && <Tag size="sm" colorScheme="red">Вузловий турнікет</Tag>}
                                          {/* ... інші теги Circulation ... */}
                                          {!Object.values(cardData.aidCirculation || {}).some(v => v) && <Text sx={styles.noDataTextStyles} fontSize="xs">Не застосовано</Text>}
                                     </HStack>
                                      <Text sx={styles.marchTitleStyles} color="orange.500" mt={1}>A - Airway:</Text>
                                     <HStack {...styles.marchTagContainerStyles}>
                                         {cardData.aidAirway?.npa && <Tag size="sm" colorScheme="orange">Назофаринг. повітровід</Tag>}
                                         {/* ... інші теги Airway ... */}
                                         {!Object.values(cardData.aidAirway || {}).some(v => v) && <Text sx={styles.noDataTextStyles} fontSize="xs">Не застосовано</Text>}
                                     </HStack>
                                      <Text sx={styles.marchTitleStyles} color="blue.500" mt={1}>B - Breathing:</Text>
                                     <HStack {...styles.marchTagContainerStyles}>
                                          {cardData.aidBreathing?.o2 && <Tag size="sm" colorScheme="blue">Кисень (O2)</Tag>}
                                          {/* ... інші теги Breathing ... */}
                                          {!Object.values(cardData.aidBreathing || {}).some(v => v) && <Text sx={styles.noDataTextStyles} fontSize="xs">Не застосовано</Text>}
                                     </HStack>
                                     <Text sx={styles.marchTitleStyles} color="red.600" mt={1}>C - Інфузійна терапія:</Text>
                                     {(cardData.fluidsGiven || []).length > 0 ? (
                                         <VStack {...styles.marchItemListStyles}>
                                             {(cardData.fluidsGiven || []).map((f, idx) => (
                                                 <Text key={`fluid-${idx}`} sx={styles.marchItemTextStyles}>{f.time} - {f.name} ({f.volume} мл) - {f.route}</Text>
                                             ))}
                                         </VStack>
                                     ) : <Text sx={styles.noDataTextStyles} fontSize="xs">Не застосовано</Text>}
                                 </VStack>
                             </Box>

                             {/* --- Секція 6: Ліки та HE --- */}
                            <Box {...styles.sectionBoxStyles}>
                                 <Heading {...styles.sectionHeadingStyles}>6. Ліки та Інше (H+E)</Heading>
                                 <Text sx={styles.marchTitleStyles} mb={1}>Введені ліки:</Text>
                                 {(cardData.medicationsGiven || []).length > 0 ? (
                                     <VStack {...styles.marchItemListStyles}>
                                         {(cardData.medicationsGiven || []).map((m, idx) => (
                                             <Text key={`med-${idx}`} sx={styles.marchItemTextStyles}>{m.time} - {m.name} - {m.dosage} - {m.route}</Text>
                                         ))}
                                     </VStack>
                                 ) : <Text sx={styles.noDataTextStyles} fontSize="xs">Немає записів</Text>}
                                 <Text sx={styles.marchTitleStyles} mt={2} mb={1}>Інша допомога (H+E):</Text>
                                  <HStack {...styles.marchTagContainerStyles}>
                                      {cardData.aidHypothermiaOther?.combatPillPack && <Tag size="sm">Pill Pack</Tag>}
                                      {/* ... інші теги HE ... */}
                                      {!Object.values(cardData.aidHypothermiaOther || {}).some(v => v) && <Text sx={styles.noDataTextStyles} fontSize="xs">Не застосовано</Text>}
                                  </HStack>
                            </Box>

                            {/* --- Секція 7 & 8 & Адмін --- */}
                            <Box {...styles.sectionBoxStyles}>
                                 <Heading {...styles.sectionHeadingStyles}>7. Нотатки</Heading>
                                 <Text sx={styles.notesTextStyles}>{cardData.notes || <Text as="span" sx={styles.italicPlaceholderStyles}>Немає</Text>}</Text>
                                 <Divider my={3}/>
                                 <Heading {...styles.sectionHeadingStyles}>8. Дані особи, що надала допомогу</Heading>
                                 <Text sx={styles.dataTextStyles}><strong>ПІБ:</strong> {cardData.providerFullName || '-'}</Text>
                                 <Text sx={styles.dataTextStyles}><strong>НСС:</strong> {cardData.providerLast4SSN || '-'}</Text>
                                 <Divider my={3}/>
                                 <Heading {...styles.sectionHeadingStyles}>Адмін. Інформація</Heading>
                                 <Text sx={styles.adminInfoTextStyles}><strong>Створено:</strong> {formatLogDateTime(cardData.createdAt)}</Text>
                                 <Text sx={styles.adminInfoTextStyles}><strong>Оновлено:</strong> {formatLogDateTime(cardData.updatedAt)}</Text>
                                 <Text sx={styles.adminInfoTextStyles}><strong>Записав:</strong> {cardData.recordedBy || '-'}</Text>
                                 <Text sx={styles.adminInfoTextStyles}><strong>ID Запису:</strong> {cardData._id}</Text>
                            </Box>

                        </VStack>
                    ) : (
                        <VStack justify="center" align="center" minHeight="200px">
                            <Spinner size="lg" color="blue.500"/>
                            <Text mt={2}>Завантаження деталей...</Text>
                        </VStack>
                    )}
                </ModalBody>
                {/* Застосовуємо стилі до ModalFooter */}
                <ModalFooter {...styles.modalFooterStyles}>
                    {/* Застосовуємо стилі до Button */}
                    <Button {...styles.footerButtonStyles} colorScheme='gray' variant='outline' mr={3} onClick={onClose}>Закрити</Button>
                    <Button {...styles.footerButtonStyles} colorScheme='blue' variant='solid' onClick={handleEditClick} isDisabled={!cardData?._id}>Редагувати</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ViewCasualtyModal;