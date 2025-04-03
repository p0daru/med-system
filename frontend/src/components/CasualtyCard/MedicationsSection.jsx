// src/components/CasualtyCard/MedicationsSection.jsx
import React, { useCallback } from 'react';
import {
    Box, Heading, Checkbox, SimpleGrid, Input, Select, Button, IconButton, HStack, Text, VStack, Divider, FormControl, FormLabel, Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';

// Імпортуємо константи напряму, оскільки тип гіпотермії використовується лише тут
import constants from '../../constants/constants.json';

// Приймаємо списки ліків та шляхів як пропси з CasualtyCard.jsx
function MedicationsSection({ data, setFormData, isDisabled, COMMON_MEDICATIONS, MED_ROUTES }) {

    // Безпечний доступ до даних
    const medicationsGivenData = Array.isArray(data?.medicationsGiven) ? data.medicationsGiven : [];
    const aidHypothermiaOtherData = data?.aidHypothermiaOther || {};
    const hypothermiaPreventionTypes = constants.hypothermiaPreventionTypes || []; // Використовуємо з constants

    // --- Helper Functions ---
    const getCurrentTime = useCallback(() => new Date().toTimeString().slice(0, 5), []);

    // --- Handlers ---
    const handleMedChange = useCallback((id, field, value) => {
        setFormData(prevData => {
            const updatedMeds = (prevData.medicationsGiven || []).map(med => {
                if (med.id === id) {
                    const updatedMed = { ...med, [field]: value };
                     // Clear 'nameOther' if 'name' is changed FROM 'Інше...' or TO something else than 'Інше...'
                     if (field === 'name' && value !== 'Інше...') {
                        updatedMed.nameOther = '';
                    }
                    return updatedMed;
                }
                return med;
            });
            return { ...prevData, medicationsGiven: updatedMeds };
        });
    }, [setFormData]);

    const addMedRow = useCallback(() => {
        setFormData(prevData => ({
            ...prevData,
            medicationsGiven: [
                ...(Array.isArray(prevData?.medicationsGiven) ? prevData.medicationsGiven : []),
                {
                    id: crypto.randomUUID(),
                    time: getCurrentTime(),
                    name: '',
                    dosage: '', // Note: Check if your data model uses 'dose' or 'dosage'
                    route: '',
                    nameOther: '' // Add nameOther field
                }
            ]
        }));
    }, [setFormData, getCurrentTime]);

    const deleteMedRow = useCallback((idToDelete) => {
        setFormData(prevData => ({
            ...prevData,
            medicationsGiven: (prevData.medicationsGiven || []).filter(med => med.id !== idToDelete)
        }));
    }, [setFormData]);

    const handleHypothermiaOtherChange = useCallback((field) => {
        setFormData(prevData => {
            const currentAidData = prevData.aidHypothermiaOther || {};
            const isCheckingHypothermia = field === 'hypothermiaPrevention' && !currentAidData[field];
            const isUncheckingHypothermia = field === 'hypothermiaPrevention' && currentAidData[field];

            return {
                ...prevData,
                aidHypothermiaOther: {
                    ...currentAidData,
                    [field]: !currentAidData[field], // Toggle the checkbox
                    // If unchecking hypothermiaPrevention, clear its type fields
                    ...(isUncheckingHypothermia && {
                        hypothermiaPreventionType: '',
                        hypothermiaPreventionTypeOther: ''
                    })
                }
            };
        });
    }, [setFormData]);

    const handleHypothermiaTypeChange = useCallback((e) => {
        const { value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            aidHypothermiaOther: {
                ...(prevData.aidHypothermiaOther || {}),
                hypothermiaPreventionType: value,
                // Clear 'Other' field if selection is not 'Інше...'
                ...(value !== 'Інше...' && { hypothermiaPreventionTypeOther: '' })
            }
        }));
    }, [setFormData]);

    const handleHypothermiaTypeOtherChange = useCallback((e) => {
        const { value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            aidHypothermiaOther: {
                ...(prevData.aidHypothermiaOther || {}),
                hypothermiaPreventionTypeOther: value
            }
        }));
     }, [setFormData]);

   return (
       <Box>
           {/* --- Розділ 6: Ліки --- */}
           <Box mb={4}>
                <HStack justify="space-between" mb={2}>
                    <Heading size="sm">6. Ліки</Heading>
                    <Button leftIcon={<AddIcon />} colorScheme="purple" variant="outline" size="xs" onClick={addMedRow} isDisabled={isDisabled}>
                        Додати Ліки
                    </Button>
                </HStack>
                <VStack spacing={3} align="stretch">
                    {medicationsGivenData.length === 0 && !isDisabled && (
                        <Text color="gray.500" fontSize="sm" textAlign="center" py={2}>Немає записів. Натисніть "+ Додати Ліки", щоб додати.</Text>
                    )}
                    {/* Використовуємо передані через пропси списки */}
                    {medicationsGivenData.map((med) => {
                        const showOtherNameInput = med.name === 'Інше...';
                        return(
                            <Box key={med.id} borderWidth={1} borderRadius="md" p={2} borderColor="gray.100">
                                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={2} alignItems="flex-end">
                                    {/* Час */}
                                    <FormControl>
                                        <FormLabel fontSize="xs" mb={0}>Час</FormLabel>
                                        <HStack spacing={1}>
                                            <Input type="time" size="xs" value={med.time || ''} onChange={(e) => handleMedChange(med.id, 'time', e.target.value)} isDisabled={isDisabled} />
                                            <Tooltip label="Поточний час" fontSize="xs">
                                                <IconButton aria-label="Set current time" size="xs" icon={<TimeIcon />} onClick={() => handleMedChange(med.id, 'time', getCurrentTime())} isDisabled={isDisabled} variant="outline"/>
                                            </Tooltip>
                                        </HStack>
                                    </FormControl>
                                    {/* Назва */}
                                    <FormControl gridColumn={showOtherNameInput ? { base: "span 2", md: "span 1" } : { base: "span 2", md: "span 1" }}>
                                        <FormLabel fontSize="xs" mb={0}>Назва</FormLabel>
                                        <Select name="name" size="xs" value={med.name || ''} onChange={(e) => handleMedChange(med.id, 'name', e.target.value)} isDisabled={isDisabled} placeholder="– Оберіть –">
                                            {(COMMON_MEDICATIONS || []).map(opt => opt && <option key={`med-${med.id}-${opt}`} value={opt}>{opt}</option>)}
                                        </Select>
                                    </FormControl>
                                     {/* Доза */}
                                     <FormControl>
                                         <FormLabel fontSize="xs" mb={0}>Доза (мг/мкг/мл)</FormLabel> {/* Уточнено одиниці */}
                                         <Input name="dosage" size="xs" value={med.dosage || ''} onChange={(e) => handleMedChange(med.id, 'dosage', e.target.value)} isDisabled={isDisabled} placeholder="100 мг" />
                                     </FormControl>
                                     {/* Шлях */}
                                     <FormControl>
                                         <FormLabel fontSize="xs" mb={0}>Шлях</FormLabel>
                                         <Select name="route" size="xs" value={med.route || ''} onChange={(e) => handleMedChange(med.id, 'route', e.target.value)} isDisabled={isDisabled} placeholder="–">
                                             {(MED_ROUTES || []).map(opt => opt && <option key={`medroute-${med.id}-${opt}`} value={opt}>{opt}</option>)}
                                         </Select>
                                     </FormControl>
                                     {/* Видалити */}
                                     <Box textAlign="right">
                                         <IconButton aria-label="Видалити ліки" icon={<DeleteIcon />} size="xs" colorScheme="red" variant="ghost" onClick={() => deleteMedRow(med.id)} isDisabled={isDisabled}/>
                                     </Box>
                                </SimpleGrid>
                                {/* --- Поле "Інше" для Назви Ліків --- */}
                                {showOtherNameInput && (
                                     <FormControl mt={2}>
                                         <FormLabel fontSize="xs" mb={0}>Вкажіть назву ліків <Text as="span" color="red.500">*</Text></FormLabel>
                                         <Input
                                             size="xs"
                                             name="nameOther"
                                             placeholder="Введіть назву..."
                                             value={med.nameOther || ''}
                                             onChange={(e) => handleMedChange(med.id, 'nameOther', e.target.value)}
                                             isDisabled={isDisabled}
                                         />
                                     </FormControl>
                                )}
                            </Box>
                        )
                    })}
                </VStack>
           </Box>
            <Divider my={4} borderColor="gray.200"/>

           {/* --- Розділ H+E (Гіпотермія + Інше) --- */}
           <Box mt={2}>
               <Heading size="xs" mb={2}>H+E (Гіпотермія / Інше)</Heading>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacingX={4} spacingY={3} alignItems="start"> {/* alignItems="start" */}
                    <Checkbox gridColumn={{ base: "span 2", md: "span 1" }} isChecked={aidHypothermiaOtherData.combatPillPack} onChange={() => handleHypothermiaOtherChange('combatPillPack')} isDisabled={isDisabled}>Набір таблеток (Pill Pack)</Checkbox>
                    <Checkbox gridColumn={{ base: "span 1" }} isChecked={aidHypothermiaOtherData.eyeShieldRight} onChange={() => handleHypothermiaOtherChange('eyeShieldRight')} isDisabled={isDisabled}>Щиток на око (П)</Checkbox>
                    <Checkbox gridColumn={{ base: "span 1" }} isChecked={aidHypothermiaOtherData.eyeShieldLeft} onChange={() => handleHypothermiaOtherChange('eyeShieldLeft')} isDisabled={isDisabled}>Щиток на око (Л)</Checkbox>
                    <Checkbox gridColumn={{ base: "span 1" }} isChecked={aidHypothermiaOtherData.splinting} onChange={() => handleHypothermiaOtherChange('splinting')} isDisabled={isDisabled}>Шина</Checkbox>

                    {/* Попередження гіпотермії та вибір типу */}
                    <VStack gridColumn={{ base: "span 2", md: "span 1" }} align="stretch" spacing={1.5}>
                         <Checkbox isChecked={aidHypothermiaOtherData.hypothermiaPrevention} onChange={() => handleHypothermiaOtherChange('hypothermiaPrevention')} isDisabled={isDisabled}>Попередження гіпотермії</Checkbox>
                        {/* Показуємо вибір типу, тільки якщо попередження гіпотермії відмічено */}
                        {aidHypothermiaOtherData.hypothermiaPrevention && (
                           <FormControl id="hypothermiaPreventionType">
                               <Select
                                   name="hypothermiaPreventionType"
                                   size="xs"
                                   value={aidHypothermiaOtherData.hypothermiaPreventionType || ''}
                                   onChange={handleHypothermiaTypeChange}
                                   isDisabled={isDisabled}
                                   placeholder="– Оберіть тип –"
                               >
                                   {/* Використовуємо список з constants */}
                                   {hypothermiaPreventionTypes.map(opt => opt && (
                                       <option key={`hypo-type-${opt}`} value={opt}>{opt}</option>
                                   ))}
                               </Select>
                           </FormControl>
                        )}
                    </VStack>

                     {/* Поле "Інше" для типу гіпотермії */}
                    {aidHypothermiaOtherData.hypothermiaPrevention && aidHypothermiaOtherData.hypothermiaPreventionType === 'Інше...' && (
                         <FormControl gridColumn={{ base: "span 2", md: "span 1" }} id="hypothermiaPreventionTypeOther">
                             {/* <FormLabel fontSize="xs" mb={0}>Уточніть тип</FormLabel> */}
                             <Input
                                name="hypothermiaPreventionTypeOther"
                                size="xs"
                                placeholder="Уточніть тип попередження..."
                                value={aidHypothermiaOtherData.hypothermiaPreventionTypeOther || ''}
                                onChange={handleHypothermiaTypeOtherChange}
                                isDisabled={isDisabled}
                             />
                         </FormControl>
                     )}
                </SimpleGrid>
           </Box>

       </Box>
   );
}

export default MedicationsSection;