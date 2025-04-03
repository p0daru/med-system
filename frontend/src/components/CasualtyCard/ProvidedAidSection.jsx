// src/components/CasualtyCard/ProvidedAidSection.jsx
import React, { useCallback } from 'react';
import {
    Box, Heading, Checkbox, SimpleGrid, Input, Select, Button, IconButton, HStack, Text, VStack, Divider, FormControl, FormLabel, Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';
// Не імпортуємо константи тут, оскільки отримуємо їх через пропси

function ProvidedAidSection({ data, setFormData, isDisabled, COMMON_FLUIDS, FLUID_ROUTES }) {

    // Безпечний доступ до масивів даних
    const fluidsGivenData = Array.isArray(data?.fluidsGiven) ? data.fluidsGiven : [];
    const aidCirculationData = data?.aidCirculation || {};
    const aidAirwayData = data?.aidAirway || {};
    const aidBreathingData = data?.aidBreathing || {};

    // --- Helper Functions ---
    const getCurrentTime = useCallback(() => new Date().toTimeString().slice(0, 5), []);

    // --- Handlers ---
    const handleCheckboxChange = useCallback((section, field) => {
        setFormData(prevData => {
            const currentSectionData = prevData[section] || {};
            return {
                ...prevData,
                [section]: {
                    ...currentSectionData,
                    [field]: !currentSectionData[field] // Toggle boolean
                }
            };
        });
    }, [setFormData]);

    const handleFluidChange = useCallback((id, field, value) => {
        setFormData(prevData => {
            const updatedFluids = (prevData.fluidsGiven || []).map(f => {
                if (f.id === id) {
                    const updatedFluid = { ...f, [field]: value };
                    // Clear 'nameOther' if 'name' is changed FROM 'Інше...'
                    if (field === 'name' && f.name === 'Інше...' && value !== 'Інше...') {
                         updatedFluid.nameOther = '';
                    }
                    // Clear 'nameOther' if 'name' is set TO anything other than 'Інше...'
                    if (field === 'name' && value !== 'Інше...') {
                         updatedFluid.nameOther = '';
                     }
                    return updatedFluid;
                }
                return f;
            });
            return { ...prevData, fluidsGiven: updatedFluids };
        });
    }, [setFormData]);

    const addFluidRow = useCallback(() => {
        setFormData(prevData => ({
            ...prevData,
            fluidsGiven: [
                ...(Array.isArray(prevData?.fluidsGiven) ? prevData.fluidsGiven : []),
                {
                    id: crypto.randomUUID(),
                    time: getCurrentTime(),
                    name: '',
                    volume: '', // Changed from 'amount' in thought process to match user code 'volume'
                    route: '',
                    nameOther: '' // Add nameOther field
                }
            ]
        }));
    }, [setFormData, getCurrentTime]);

    const deleteFluidRow = useCallback((idToDelete) => {
         setFormData(prevData => ({
             ...prevData,
             fluidsGiven: (prevData.fluidsGiven || []).filter(f => f.id !== idToDelete)
         }));
    }, [setFormData]);

    return (
        <Box>
            <Heading size="sm" mb={3}>5. Надана Допомога (MARCH)</Heading>

             {/* --- C - Circulation (Масивна кровотеча) --- */}
             <Box mb={3}>
                 <Heading size="xs" mb={2} color="red.600">C - Circulation (Масивна кровотеча)</Heading>
                 <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                     <Checkbox isChecked={aidCirculationData.tourniquetJunctional} onChange={() => handleCheckboxChange('aidCirculation', 'tourniquetJunctional')} isDisabled={isDisabled}>Вузловий турнікет</Checkbox>
                     <Checkbox isChecked={aidCirculationData.tourniquetTruncal} onChange={() => handleCheckboxChange('aidCirculation', 'tourniquetTruncal')} isDisabled={isDisabled}>Турнікет на тулуб</Checkbox>
                     <Checkbox isChecked={aidCirculationData.dressingHemostatic} onChange={() => handleCheckboxChange('aidCirculation', 'dressingHemostatic')} isDisabled={isDisabled}>Гемостат. пов'язка</Checkbox>
                     <Checkbox isChecked={aidCirculationData.dressingPressure} onChange={() => handleCheckboxChange('aidCirculation', 'dressingPressure')} isDisabled={isDisabled}>Тиснуча пов'язка</Checkbox>
                     <Checkbox isChecked={aidCirculationData.dressingOther} onChange={() => handleCheckboxChange('aidCirculation', 'dressingOther')} isDisabled={isDisabled}>Інша пов'язка</Checkbox>
                 </SimpleGrid>
             </Box>
             <Divider my={3} borderColor="gray.200"/>

            {/* --- A - Airway (Дихальні шляхи) --- */}
             <Box mb={3}>
                 <Heading size="xs" mb={2} color="orange.500">A - Airway (Дихальні шляхи)</Heading>
                 <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    <Checkbox isChecked={aidAirwayData.npa} onChange={() => handleCheckboxChange('aidAirway', 'npa')} isDisabled={isDisabled}>Назофаринг. повітровід</Checkbox>
                    <Checkbox isChecked={aidAirwayData.supraglottic} onChange={() => handleCheckboxChange('aidAirway', 'supraglottic')} isDisabled={isDisabled}>Надгорт. повітровід</Checkbox>
                    <Checkbox isChecked={aidAirwayData.etTube} onChange={() => handleCheckboxChange('aidAirway', 'etTube')} isDisabled={isDisabled}>Ендотрах. трубка</Checkbox>
                    <Checkbox isChecked={aidAirwayData.cric} onChange={() => handleCheckboxChange('aidAirway', 'cric')} isDisabled={isDisabled}>Крікотиреотомія</Checkbox>
                 </SimpleGrid>
             </Box>
            <Divider my={3} borderColor="gray.200"/>

             {/* --- B - Breathing (Дихання) --- */}
             <Box mb={4}>
                 <Heading size="xs" mb={2} color="blue.500">B - Breathing (Дихання)</Heading>
                 <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                     <Checkbox isChecked={aidBreathingData.o2} onChange={() => handleCheckboxChange('aidBreathing', 'o2')} isDisabled={isDisabled}>Кисень (O2)</Checkbox>
                     <Checkbox isChecked={aidBreathingData.needleDecompression} onChange={() => handleCheckboxChange('aidBreathing', 'needleDecompression')} isDisabled={isDisabled}>Голкова декомпресія</Checkbox>
                     <Checkbox isChecked={aidBreathingData.chestTube} onChange={() => handleCheckboxChange('aidBreathing', 'chestTube')} isDisabled={isDisabled}>Дренаж плевральний</Checkbox>
                     <Checkbox isChecked={aidBreathingData.occlusiveDressing} onChange={() => handleCheckboxChange('aidBreathing', 'occlusiveDressing')} isDisabled={isDisabled}>Оклюз. наліпка</Checkbox>
                 </SimpleGrid>
             </Box>
             <Divider my={3} borderColor="gray.200"/>

             {/* --- C - Інфузійна терапія / Кров --- */}
            <Box>
                <HStack justify="space-between" mb={2}>
                    <Heading size="xs" color="red.600">C - Інфузійна терапія / Продукти крові</Heading>
                     <Button leftIcon={<AddIcon />} colorScheme="pink" variant="outline" size="xs" onClick={addFluidRow} isDisabled={isDisabled}>
                        Додати Рідину/Кров
                    </Button>
                </HStack>
                 <VStack spacing={3} align="stretch">
                     {fluidsGivenData.length === 0 && !isDisabled && (
                        <Text color="gray.500" fontSize="sm" textAlign="center" py={2}>Немає записів. Натисніть "+ Додати Рідину/Кров", щоб додати.</Text>
                     )}
                     {/* Використовуємо передані через пропси списки */}
                    {(fluidsGivenData).map((fluid) => {
                        const showOtherNameInput = fluid.name === 'Інше...';
                        return (
                            <Box key={fluid.id} borderWidth={1} borderRadius="md" p={2} borderColor="gray.100" >
                                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={2} alignItems="flex-end"> {/* Align to bottom for delete button */}
                                    {/* Час */}
                                    <FormControl>
                                        <FormLabel fontSize="xs" mb={0}>Час</FormLabel>
                                        <HStack spacing={1}>
                                            <Input type="time" size="xs" value={fluid.time || ''} onChange={(e) => handleFluidChange(fluid.id, 'time', e.target.value)} isDisabled={isDisabled} />
                                            <Tooltip label="Поточний час" fontSize="xs">
                                                <IconButton aria-label="Set current time" size="xs" icon={<TimeIcon />} onClick={() => handleFluidChange(fluid.id, 'time', getCurrentTime())} isDisabled={isDisabled} variant="outline"/>
                                            </Tooltip>
                                        </HStack>
                                    </FormControl>
                                    {/* Назва */}
                                    <FormControl gridColumn={showOtherNameInput ? { base: "span 2", md: "span 1" } : { base: "span 2", md: "span 1" }}> {/* Span 1 by default */}
                                        <FormLabel fontSize="xs" mb={0}>Назва</FormLabel>
                                        <Select name="name" size="xs" value={fluid.name || ''} onChange={(e) => handleFluidChange(fluid.id, 'name', e.target.value)} isDisabled={isDisabled} placeholder="– Оберіть –">
                                            {(COMMON_FLUIDS || []).map(opt => opt && <option key={`fluid-${fluid.id}-${opt}`} value={opt}>{opt}</option>)}
                                        </Select>
                                    </FormControl>
                                    {/* Об'єм */}
                                    <FormControl gridColumn={{ base: "span 1" }}>
                                        <FormLabel fontSize="xs" mb={0}>Об'єм (мл)</FormLabel>
                                        <Input name="volume" size="xs" value={fluid.volume || ''} onChange={(e) => handleFluidChange(fluid.id, 'volume', e.target.value)} isDisabled={isDisabled} placeholder="500" type="number" />
                                    </FormControl>
                                    {/* Шлях */}
                                    <FormControl gridColumn={{ base: "span 1" }}>
                                        <FormLabel fontSize="xs" mb={0}>Шлях</FormLabel>
                                        <Select name="route" size="xs" value={fluid.route || ''} onChange={(e) => handleFluidChange(fluid.id, 'route', e.target.value)} isDisabled={isDisabled} placeholder="–">
                                            {(FLUID_ROUTES || []).map(opt => opt && <option key={`route-${fluid.id}-${opt}`} value={opt}>{opt}</option>)}
                                        </Select>
                                    </FormControl>
                                    {/* Видалити */}
                                    <Box textAlign="right">
                                        <IconButton aria-label="Видалити рідину" icon={<DeleteIcon />} size="xs" colorScheme="red" variant="ghost" onClick={() => deleteFluidRow(fluid.id)} isDisabled={isDisabled} />
                                    </Box>
                                </SimpleGrid>
                                {/* --- Поле "Інше" для Назви --- */}
                                {showOtherNameInput && (
                                     <FormControl mt={2}>
                                         <FormLabel fontSize="xs" mb={0}>Вкажіть назву <Text as="span" color="red.500">*</Text></FormLabel>
                                         <Input
                                             size="xs"
                                             name="nameOther"
                                             placeholder="Введіть назву рідини/крові..."
                                             value={fluid.nameOther || ''}
                                             onChange={(e) => handleFluidChange(fluid.id, 'nameOther', e.target.value)}
                                             isDisabled={isDisabled}
                                         />
                                     </FormControl>
                                 )}
                            </Box>
                        )
                    })}
                </VStack>
            </Box>
        </Box>
    );
}

export default ProvidedAidSection;