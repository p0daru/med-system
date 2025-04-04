// src/components/CasualtyCard/VitalSignsSection.jsx
import React from 'react';
import {
    Box, Heading, VStack, SimpleGrid, FormControl, FormLabel, Input, Select, Button, IconButton, HStack, Text, Divider, Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';

// Import styles
import { vitalSignsStyles, commonStyles } from './casualtyCardStyles';

function VitalSignsSection({ data, setFormData, isDisabled }) {

    const vitalSignsData = Array.isArray(data?.vitalSigns) ? data.vitalSigns : [];

    // Helper function to get current time HH:MM
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
                        time: getCurrentTime(), // Automatically set current time
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

    // Options for dropdowns
    const avpuOptions = ['', 'A', 'V', 'P', 'U'];
    const painOptions = ['', ...Array.from({ length: 11 }, (_, i) => i.toString())]; // 0-10

    return (
        <Box>
            {/* Apply heading HStack style */}
            <HStack {...vitalSignsStyles.headingHStack}>
                {/* Apply section heading style */}
                <Heading {...vitalSignsStyles.section4Heading}>3. Симптоми та Ознаки</Heading>
                 {/* Apply add vital button style */}
                 <Button
                    {...vitalSignsStyles.addVitalButton}
                    leftIcon={<AddIcon />}
                    onClick={addVitalRow}
                    isDisabled={isDisabled}
                 >
                    Додати Запис
                 </Button>
            </HStack>


            {/* Vital sign entries */}
            {/* Apply vital list VStack style, keep divider inline */}
            <VStack {...vitalSignsStyles.vitalListVStack} divider={<Divider />}>
                 {vitalSignsData.length === 0 && !isDisabled && (
                    // Apply no entries text style
                    <Text {...vitalSignsStyles.noEntriesText}>Натисніть "+ Додати Запис".</Text>
                 )}
                {vitalSignsData.map((vitalEntry) => (
                    // Apply vital row box style
                    <Box key={vitalEntry.id} {...vitalSignsStyles.vitalRowBox}>
                         {/* Apply vital fields grid style */}
                         <SimpleGrid {...vitalSignsStyles.vitalFieldsGrid}>
                            {/* Time */}
                            <FormControl id={`time-${vitalEntry.id}`} gridColumn={{ base: "span 2", sm: "span 1" }}>
                                 {/* Apply time input HStack style */}
                                 <HStack {...vitalSignsStyles.timeInputHStack}>
                                    {/* Apply common input style */}
                                    <Input pt="5px" type="time" {...commonStyles.inputSm} value={vitalEntry.time || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'time', e.target.value)} isDisabled={isDisabled} pattern="[0-9]{2}:[0-9]{2}" />
                                     {/* Apply common tooltip style */}
                                     <Tooltip label="Поточний час" {...commonStyles.tooltipXs}>
                                         {/* Apply current time button style */}
                                         <IconButton aria-label="Set current time" {...commonStyles.currentTimeButton} icon={<TimeIcon />} onClick={() => handleVitalChange(vitalEntry.id, 'time', getCurrentTime())} isDisabled={isDisabled}/>
                                     </Tooltip>
                                 </HStack>
                            </FormControl>
                             {/* Pulse */}
                             <FormControl id={`pulse-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                 {/* Apply vital label style */}
                                 <FormLabel {...vitalSignsStyles.vitalLabel}>Пульс</FormLabel>
                                 {/* Apply common input style */}
                                 <Input {...commonStyles.inputSm} name="pulse" value={vitalEntry.pulse || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'pulse', e.target.value)} isDisabled={isDisabled} placeholder="чсс" />
                             </FormControl>
                            {/* BP */}
                             <FormControl id={`bp-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                 {/* Apply vital label style */}
                                 <FormLabel {...vitalSignsStyles.vitalLabel}>АТ</FormLabel>
                                 {/* Apply common input style */}
                                 <Input {...commonStyles.inputSm} name="bp" value={vitalEntry.bp || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'bp', e.target.value)} isDisabled={isDisabled} placeholder="120/80" />
                             </FormControl>
                            {/* RR */}
                             <FormControl id={`rr-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                  {/* Apply vital label style */}
                                 <FormLabel {...vitalSignsStyles.vitalLabel}>ЧД</FormLabel>
                                  {/* Apply common input style */}
                                 <Input {...commonStyles.inputSm} name="rr" value={vitalEntry.rr || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'rr', e.target.value)} isDisabled={isDisabled} placeholder="чд" />
                             </FormControl>
                            {/* SpO2 */}
                             <FormControl id={`spO2-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                {/* Apply vital label style */}
                                <FormLabel {...vitalSignsStyles.vitalLabel}>SpO2%</FormLabel>
                                {/* Apply common input style */}
                                <Input {...commonStyles.inputSm} name="spO2" value={vitalEntry.spO2 || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'spO2', e.target.value)} isDisabled={isDisabled} placeholder="%" />
                             </FormControl>
                            {/* AVPU */}
                             <FormControl id={`avpu-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                {/* Apply vital label style */}
                                <FormLabel {...vitalSignsStyles.vitalLabel}>AVPU</FormLabel>
                                {/* Apply common input style (for Select) */}
                                <Select {...commonStyles.inputSm} name="avpu" value={vitalEntry.avpu || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'avpu', e.target.value)} isDisabled={isDisabled}>
                                    {avpuOptions.map(opt => <option key={`avpu-${opt}`} value={opt}>{opt || '–'}</option>)}
                                </Select>
                             </FormControl>
                            {/* Pain */}
                             <FormControl id={`pain-${vitalEntry.id}`} gridColumn={{ base: "span 1" }}>
                                {/* Apply vital label style */}
                                <FormLabel {...vitalSignsStyles.vitalLabel}>Біль</FormLabel>
                                {/* Apply common input style (for Select) */}
                                <Select {...commonStyles.inputSm} name="pain" value={vitalEntry.pain || ''} onChange={(e) => handleVitalChange(vitalEntry.id, 'pain', e.target.value)} isDisabled={isDisabled}>
                                    {painOptions.map(opt => <option key={`pain-${opt}`} value={opt}>{opt === '' ? '–' : opt}</option>)}
                                </Select>
                             </FormControl>
                            {/* Delete Button */}
                             {/* Apply delete button box style, keep gridColumn/alignSelf inline */}
                             <Box {...vitalSignsStyles.deleteButtonBox} gridColumn={{ base: "span 2", sm: "span 1" }}>
                                {/* Apply common delete button style */}
                                <IconButton aria-label="Видалити запис" icon={<DeleteIcon />} {...commonStyles.deleteButton} onClick={() => deleteVitalRow(vitalEntry.id)} isDisabled={isDisabled} />
                             </Box>
                         </SimpleGrid>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
}

export default VitalSignsSection;