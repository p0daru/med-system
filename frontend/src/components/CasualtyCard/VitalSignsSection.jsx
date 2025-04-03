// src/components/CasualtyCard/VitalSignsSection.jsx
import React from 'react';
import {
    Box, Heading, VStack, SimpleGrid, FormControl, FormLabel, Input, Select, Button, IconButton, HStack, Text, Divider, Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons'; // Додано TimeIcon

function VitalSignsSection({ data, setFormData, isDisabled }) {

    const vitalSignsData = Array.isArray(data?.vitalSigns) ? data.vitalSigns : [];

    // Допоміжна функція отримання поточного часу HH:MM
    const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

    const handleVitalChange = (id, field, value) => {
        setFormData(prevData => ({
            ...prevData,
            vitalSigns: (prevData.vitalSigns || []).map(vs =>
                vs.id === id ? { ...vs, [field]: value } : vs
            )
        }));
    };

    const addVitalRow = () => {
        setFormData(prevData => {
            const currentVitals = Array.isArray(prevData?.vitalSigns) ? prevData.vitalSigns : [];
            return {
                ...prevData,
                vitalSigns: [
                    ...currentVitals,
                    {
                        id: crypto.randomUUID(),
                        time: getCurrentTime(), // Автоматично ставимо поточний час
                        pulse: '', bp: '', rr: '', spO2: '', avpu: '', pain: ''
                    }
                ]
            };
        });
    };

    const deleteVitalRow = (idToDelete) => {
        setFormData(prevData => ({
            ...prevData,
            vitalSigns: (prevData.vitalSigns || []).filter(vs => vs.id !== idToDelete)
        }));
    };

    // Опції для випадаючих списків
    const avpuOptions = ['', 'A', 'V', 'P', 'U'];
    const painOptions = ['', ...Array.from({ length: 11 }, (_, i) => i.toString())]; // 0-10

    return (
        <Box>
            <HStack justify="space-between" mb={2}>
                <Heading size="sm">3. Симптоми та Ознаки</Heading>
                 <Button
                    leftIcon={<AddIcon />}
                    colorScheme="teal"
                    variant="outline"
                    size="xs" // Менший розмір кнопки
                    onClick={addVitalRow}
                    isDisabled={isDisabled}
                 >
                    Додати Запис
                 </Button>
            </HStack>


            {/* Записи показників */}
            <VStack spacing={3} align="stretch" divider={<Divider />}>
                 {vitalSignsData.length === 0 && !isDisabled && (
                    <Text color="gray.500" fontSize="sm" textAlign="center" p={2}>Натисніть "+ Додати Запис".</Text>
                 )}
                {vitalSignsData.map((vitalEntry) => (
                    <Box key={vitalEntry.id} py={2}>
                         <SimpleGrid columns={{ base: 2, sm: 4, md: 8 }} spacing={2} alignItems="center">
                            {/* Час */}
                            <FormControl id={`time-${vitalEntry.id}`} gridColumn={{ base: "span 2", sm: "span 1" }}>
                                 <HStack spacing={1}>
                                    <Input pt="5px" type="time" size="sm" value={vitalEntry.time || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'time', e.target.value)} isDisabled={isDisabled} pattern="[0-9]{2}:[0-9]{2}" />
                                     <Tooltip label="Поточний час" fontSize="xs">
                                         <IconButton aria-label="Set current time" size="xs" icon={<TimeIcon />} onClick={() => handleVitalChange(vitalEntry.id, 'time', getCurrentTime())} isDisabled={isDisabled} variant="outline"/>
                                     </Tooltip>
                                 </HStack>
                            </FormControl>
                             {/* Пульс */}
                             <FormControl id={`pulse-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                 <FormLabel fontSize="xs" mb={0} ml={1}>Пульс</FormLabel>
                                 <Input name="pulse" size="sm" value={vitalEntry.pulse || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'pulse', e.target.value)} isDisabled={isDisabled} placeholder="чсс" />
                             </FormControl>
                            {/* АТ */}
                             <FormControl id={`bp-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                 <FormLabel fontSize="xs" mb={0} ml={1}>АТ</FormLabel>
                                 <Input name="bp" size="sm" value={vitalEntry.bp || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'bp', e.target.value)} isDisabled={isDisabled} placeholder="120/80" />
                             </FormControl>
                            {/* ЧД */}
                             <FormControl id={`rr-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                 <FormLabel fontSize="xs" mb={0} ml={1}>ЧД</FormLabel>
                                 <Input name="rr" size="sm" value={vitalEntry.rr || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'rr', e.target.value)} isDisabled={isDisabled} placeholder="чд" />
                             </FormControl>
                            {/* SpO2 */}
                             <FormControl id={`spO2-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                <FormLabel fontSize="xs" mb={0} ml={1}>SpO2%</FormLabel>
                                <Input name="spO2" size="sm" value={vitalEntry.spO2 || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'spO2', e.target.value)} isDisabled={isDisabled} placeholder="%" />
                             </FormControl>
                            {/* AVPU */}
                             <FormControl id={`avpu-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                <FormLabel fontSize="xs" mb={0} ml={1}>AVPU</FormLabel>
                                <Select name="avpu" size="sm" value={vitalEntry.avpu || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'avpu', e.target.value)} isDisabled={isDisabled}>
                                    {avpuOptions.map(opt => <option key={`avpu-${opt}`} value={opt}>{opt || '–'}</option>)}
                                </Select>
                             </FormControl>
                            {/* Біль */}
                             <FormControl id={`pain-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                <FormLabel fontSize="xs" mb={0} ml={1}>Біль</FormLabel>
                                <Select name="pain" size="sm" value={vitalEntry.pain || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'pain', e.target.value)} isDisabled={isDisabled}>
                                    {painOptions.map(opt => <option key={`pain-${opt}`} value={opt}>{opt === '' ? '–' : opt}</option>)}
                                </Select>
                             </FormControl>
                            {/* Кнопка Видалити */}
                             <Box textAlign="right" gridColumn={{ base: "span 2", sm: "span 1" }} alignSelf="end" pb={1}> {/* Кнопка в кінці */}
                                <IconButton aria-label="Видалити запис" icon={<DeleteIcon />} size="xs" colorScheme="red" variant="ghost" onClick={() => deleteVitalRow(vitalEntry.id)} isDisabled={isDisabled} />
                             </Box>
                         </SimpleGrid>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
}

export default VitalSignsSection;