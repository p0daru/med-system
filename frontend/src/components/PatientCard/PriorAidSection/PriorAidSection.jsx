// PriorAidSection/PriorAidSection.jsx
import React from 'react';
import {
    Box, Checkbox, FormControl, FormLabel, Input, Radio, RadioGroup, Select,
    Stack, VStack, Heading, SimpleGrid, Text, Grid, GridItem, Tooltip, FormHelperText, Textarea
} from '@chakra-ui/react';
// Імпортуємо стилі (переконайтесь, що шлях './PriorAidSection.styles.js' правильний)
import { styles } from './PriorAidSection.styles';
// Імпортуємо константи (переконайтесь, що шлях правильний)
import constants from '../patientCardConstants'; // Виправлено імпорт

// --- Компонент ---
function PriorAidSection({ formData, handleNestedStateChange }) {

    // --- Обробники змін ---
    const handleInputChange = (e) => {
        handleNestedStateChange(e.target.name, e.target.value);
    };
    const handleCheckboxChangeDirect = (e) => {
        handleNestedStateChange(e.target.name, e.target.checked);
    };
    const handleRadioChangeDirect = (name, value) => {
        handleNestedStateChange(name, value);
    };

    // --- Умови та безпечний доступ до даних ---
    const isAidTimeDisabled = formData.priorAid?.aidProvider === 'Невідомо' || formData.priorAid?.aidProvider === 'Не надавалась' || !formData.priorAid?.aidProvider;
    const aidData = formData.priorAid || {};
    const vitals = aidData.vitalSigns || {};
    const interventions = aidData.interventions || {};
    const tourniquets = aidData.tourniquets || {};
    const medications = aidData.medications || {};
    // Використовуємо константи напряму
    const aidProvidersList = constants.priorAid?.aidProviders || [];
    const medicationRoutesList = constants.priorAid?.medicationRoutes || [];
    const tourniquetLimbKeysList = constants.priorAid?.tourniquetLimbKeys || [];
    const medicationKeysList = constants.priorAid?.medicationKeys || [];

    return (
        <Box borderWidth="1px" borderRadius="lg" p={5} mt={6}>
            <Heading as="h3" size="lg" mb={5}>
                2. Попередньо надана допомога (до ролі 1)
            </Heading>
            <VStack spacing={6} align="stretch">

                {/* --- 2.1 & 2.2 Інформація про надання допомоги --- */}
                <Box>
                     <Text sx={styles.sectionTitle}>2.1 & 2.2 Загальні дані про допомогу</Text>
                     <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={2}>
                        <FormControl id="aidProvider">
                            <FormLabel>Ким надана (2.2)</FormLabel> {/* Додано номер підпункту */}
                            <RadioGroup name="priorAid.aidProvider" value={aidData.aidProvider || ''} onChange={(value) => handleRadioChangeDirect('priorAid.aidProvider', value)}>
                                <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} wrap="wrap">
                                    {aidProvidersList.map(provider => (<Radio key={provider} value={provider}>{provider}</Radio>))}
                                </Stack>
                            </RadioGroup>
                            <FormHelperText>ОСД - само-, НП - не мед. працівник</FormHelperText>
                        </FormControl>
                        <FormControl id="aidTime" isDisabled={isAidTimeDisabled}>
                            <FormLabel>Час надання (2.1)</FormLabel>
                            <Input name="priorAid.aidTime" type="time" value={aidData.aidTime || ''} onChange={handleInputChange} />
                        </FormControl>
                        <FormControl id="aidDate" isDisabled={isAidTimeDisabled}>
                            <FormLabel>Дата надання (2.1)</FormLabel>
                            <Input name="priorAid.aidDate" type="date" value={aidData.aidDate || ''} onChange={handleInputChange} />
                        </FormControl>
                    </SimpleGrid>
                </Box>

                {/* --- 2.3 Життєві показники --- */}
                 <Box>
                    <Text sx={styles.sectionTitle}>2.3 Життєві показники</Text>
                    <FormControl as="fieldset" mt={2}>
                         <SimpleGrid columns={{ base: 2, sm: 3, lg: 6 }} spacing={4}>
                            <FormControl id="respiratoryRate">
                                <FormLabel>ЧД</FormLabel>
                                <Tooltip label="Частота дихання (вдихів/хв)" placement="top" hasArrow><Input name="priorAid.vitalSigns.respiratoryRate" value={vitals.respiratoryRate || ''} onChange={handleInputChange} placeholder="-" /></Tooltip>
                            </FormControl>
                            <FormControl id="spo2">
                                <FormLabel>SpO₂ (%)</FormLabel>
                                <Tooltip label="Сатурація кисню" placement="top" hasArrow><Input name="priorAid.vitalSigns.spo2" value={vitals.spo2 || ''} onChange={handleInputChange} placeholder="-" /></Tooltip>
                            </FormControl>
                             <FormControl id="pulse">
                                <FormLabel>Пульс</FormLabel>
                                <Tooltip label="Частота пульсу (уд/хв)" placement="top" hasArrow><Input name="priorAid.vitalSigns.pulse" value={vitals.pulse || ''} onChange={handleInputChange} placeholder="-" /></Tooltip>
                            </FormControl>
                            <FormControl id="bloodPressure">
                                <FormLabel>АТ</FormLabel>
                                <Tooltip label="Артеріальний тиск (сис/діа)" placement="top" hasArrow><Input name="priorAid.vitalSigns.bloodPressure" value={vitals.bloodPressure || ''} onChange={handleInputChange} placeholder="-" /></Tooltip>
                            </FormControl>
                            <FormControl id="avpu">
                                <FormLabel>AVPU</FormLabel>
                                <Tooltip label="Рівень свідомості (Alert, Verbal, Pain, Unresponsive)" placement="top" hasArrow><Input name="priorAid.vitalSigns.avpu" value={vitals.avpu || ''} onChange={handleInputChange} placeholder="-" /></Tooltip>
                            </FormControl>
                            <FormControl id="painScale">
                                <FormLabel>Шк. болю</FormLabel>
                                <Tooltip label="Шкала болю (0-10)" placement="top" hasArrow><Input name="priorAid.vitalSigns.painScale" value={vitals.painScale || ''} onChange={handleInputChange} placeholder="-" /></Tooltip>
                            </FormControl>
                        </SimpleGrid>
                        <FormHelperText mt={2}>Вкажіть виміряні значення або прочерк "-".</FormHelperText>
                    </FormControl>
                </Box>

                {/* --- 2.4 Втручання (згруповані за ABCDE) --- */}
                <Box>
                    <Text sx={styles.sectionTitle}>2.4 Проведені втручання</Text>
                    <VStack spacing={4} align="stretch" mt={2}>
                        {/* --- A: Airway --- */}
                        <Box>
                            <Text sx={styles.subSectionTitle}>A: Дихальні шляхи</Text>
                            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                                <Checkbox name="priorAid.interventions.oropharyngealAirway" isChecked={interventions.oropharyngealAirway || false} onChange={handleCheckboxChangeDirect}>ОФП</Checkbox>
                                <Checkbox name="priorAid.interventions.nasopharyngealAirway" isChecked={interventions.nasopharyngealAirway || false} onChange={handleCheckboxChangeDirect}>НФП</Checkbox>
                                <Checkbox name="priorAid.interventions.supraglotticAirway" isChecked={interventions.supraglotticAirway || false} onChange={handleCheckboxChangeDirect}>НГП</Checkbox>
                                <Checkbox name="priorAid.interventions.endotrachealTube" isChecked={interventions.endotrachealTube || false} onChange={handleCheckboxChangeDirect}>ETT</Checkbox>
                                <Checkbox name="priorAid.interventions.cricothyrotomy" isChecked={interventions.cricothyrotomy || false} onChange={handleCheckboxChangeDirect}>Крікотиреотомія</Checkbox>
                            </SimpleGrid>
                        </Box>
                        {/* --- B: Breathing --- */}
                         <Box>
                            <Text sx={styles.subSectionTitle}>B: Дихання</Text>
                             <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                                <Checkbox name="priorAid.interventions.o2" isChecked={interventions.o2 || false} onChange={handleCheckboxChangeDirect}>O₂</Checkbox>
                                <Checkbox name="priorAid.interventions.bagValveMask" isChecked={interventions.bagValveMask || false} onChange={handleCheckboxChangeDirect}>Дихальний мішок</Checkbox>
                                <Checkbox name="priorAid.interventions.needleDecompression" isChecked={interventions.needleDecompression || false} onChange={handleCheckboxChangeDirect}>Голкова декомпресія</Checkbox>
                                <Checkbox name="priorAid.interventions.occlusiveDressing" isChecked={interventions.occlusiveDressing || false} onChange={handleCheckboxChangeDirect}>Оклюзійна наліпка</Checkbox>
                            </SimpleGrid>
                        </Box>
                         {/* --- C: Circulation --- */}
                         <Box>
                             <Text sx={styles.subSectionTitle}>C: Кровообіг</Text>
                              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                                <Checkbox name="priorAid.interventions.bandage" isChecked={interventions.bandage || false} onChange={handleCheckboxChangeDirect}>Пов'язка</Checkbox>
                                <Checkbox name="priorAid.interventions.tamponade" isChecked={interventions.tamponade || false} onChange={handleCheckboxChangeDirect}>Тампонування</Checkbox>
                                <Checkbox name="priorAid.interventions.ivAccess" isChecked={interventions.ivAccess || false} onChange={handleCheckboxChangeDirect}>Доступ в/в</Checkbox>
                                <Checkbox name="priorAid.interventions.ioAccess" isChecked={interventions.ioAccess || false} onChange={handleCheckboxChangeDirect}>Доступ в/к</Checkbox>
                            </SimpleGrid>
                        </Box>
                         {/* --- E: Exposure/Environment + Інше --- */}
                         <Box>
                            <Text sx={styles.subSectionTitle}>E: Інші заходи</Text>
                            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3} alignItems="center">
                                <Checkbox name="priorAid.interventions.hypothermiaPrevention" isChecked={interventions.hypothermiaPrevention || false} onChange={handleCheckboxChangeDirect}>Профілактика гіпотермії</Checkbox>
                                <Checkbox name="priorAid.interventions.immobilization" isChecked={interventions.immobilization || false} onChange={handleCheckboxChangeDirect}>Іммобілізація</Checkbox>
                                <Checkbox name="priorAid.interventions.eyeShield" isChecked={interventions.eyeShield || false} onChange={handleCheckboxChangeDirect}>Щиток на око</Checkbox>
                                <GridItem gridColumn={{ base: '1', md: '1 / -1' }} mt={{base: 2, md: 0}}>
                                   <Stack direction="row" align="center">
                                        <Checkbox name="priorAid.interventions.otherIntervention" isChecked={interventions.otherIntervention || false} onChange={handleCheckboxChangeDirect}>Інше:</Checkbox>
                                        <FormControl id="otherInterventionDetails" isDisabled={!interventions.otherIntervention} flexGrow={1}>
                                            <Input name="priorAid.interventions.otherInterventionDetails" value={interventions.otherInterventionDetails || ''} onChange={handleInputChange} placeholder="Вкажіть деталі" size="sm" />
                                        </FormControl>
                                    </Stack>
                                </GridItem>
                            </Grid>
                        </Box>
                    </VStack>
                </Box>

                {/* --- 2.5 Турнікети (ОКРЕМІ БЛОКИ ДЛЯ AT/BT) --- */}
                <Box>
                    <Text sx={styles.sectionTitle}>2.5 Турнікети</Text>
                    <Text fontSize="sm" mb={3} mt={2}>Вкажіть час (HH:MM) для відповідних дій:</Text>
                    {/* Таблиця для кінцівок */}
                    <Box overflowX="auto" pb={2}>
                        <Grid templateColumns="minmax(60px, auto) repeat(4, minmax(110px, 1fr))" gap={3} alignItems="center" mb={4} minW="550px">
                            <GridItem fontWeight="bold" textAlign="center">Лок.</GridItem>
                            <GridItem fontWeight="bold" textAlign="center">Накладання</GridItem>
                            <GridItem fontWeight="bold" textAlign="center">Зняття</GridItem>
                            <GridItem fontWeight="bold" textAlign="center">Конверсія</GridItem>
                            <GridItem fontWeight="bold" textAlign="center">Переміщення</GridItem>

                            {tourniquetLimbKeysList.map(limb => (
                                <React.Fragment key={limb.key}>
                                    <GridItem fontWeight="bold" textAlign="center">{limb.label}</GridItem>
                                    <GridItem><FormControl><Input size="sm" type="time" name={`priorAid.tourniquets.${limb.key}.appliedTime`} value={tourniquets[limb.key]?.appliedTime || ''} onChange={handleInputChange} /></FormControl></GridItem>
                                    <GridItem><FormControl><Input size="sm" type="time" name={`priorAid.tourniquets.${limb.key}.removedTime`} value={tourniquets[limb.key]?.removedTime || ''} onChange={handleInputChange} /></FormControl></GridItem>
                                    <GridItem><FormControl><Input size="sm" type="time" name={`priorAid.tourniquets.${limb.key}.convertedTime`} value={tourniquets[limb.key]?.convertedTime || ''} onChange={handleInputChange} /></FormControl></GridItem>
                                    <GridItem><FormControl><Input size="sm" type="time" name={`priorAid.tourniquets.${limb.key}.relocatedTime`} value={tourniquets[limb.key]?.relocatedTime || ''} onChange={handleInputChange} /></FormControl></GridItem>
                                </React.Fragment>
                            ))}
                        </Grid>
                    </Box>
                    {/* Окремі блоки для AT / BT */}
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={0}>
                        <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                           <Text fontWeight="semibold" mb={2}>AT (Абдомінальний)</Text>
                           <Stack direction={{base: "column", sm: "row"}} spacing={3}>
                               <FormControl id="atAppliedTime">
                                    <FormLabel fontSize="sm">Час накладання</FormLabel>
                                    <Input size="sm" type="time" name="priorAid.tourniquets.abdominalTourniquet.appliedTime" value={tourniquets.abdominalTourniquet?.appliedTime || ''} onChange={handleInputChange} />
                               </FormControl>
                               <FormControl id="atRemovedTime">
                                    <FormLabel fontSize="sm">Час зняття</FormLabel>
                                    <Input size="sm" type="time" name="priorAid.tourniquets.abdominalTourniquet.removedTime" value={tourniquets.abdominalTourniquet?.removedTime || ''} onChange={handleInputChange} />
                               </FormControl>
                               {/* Тут немає полів для конверсії/переміщення */}
                           </Stack>
                        </Box>
                         <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                           <Text fontWeight="semibold" mb={2}>BT (Вузловий)</Text>
                            <Stack direction={{base: "column", sm: "row"}} spacing={3}>
                               <FormControl id="btAppliedTime">
                                    <FormLabel fontSize="sm">Час накладання</FormLabel>
                                    <Input size="sm" type="time" name="priorAid.tourniquets.junctionalTourniquet.appliedTime" value={tourniquets.junctionalTourniquet?.appliedTime || ''} onChange={handleInputChange} />
                               </FormControl>
                               <FormControl id="btRemovedTime">
                                    <FormLabel fontSize="sm">Час зняття</FormLabel>
                                    <Input size="sm" type="time" name="priorAid.tourniquets.junctionalTourniquet.removedTime" value={tourniquets.junctionalTourniquet?.removedTime || ''} onChange={handleInputChange} />
                               </FormControl>
                                {/* Тут немає полів для конверсії/переміщення */}
                           </Stack>
                        </Box>
                    </SimpleGrid>
                </Box>

                 {/* --- 2.6 Лікарські засоби --- */}
                <Box>
                     <Text sx={styles.sectionTitle}>2.6 Лікарські засоби</Text>
                     <VStack spacing={4} align="stretch" mt={2}>
                        {/* Цикл рендерингу для кожного препарату */}
                        {medicationKeysList.map(medKey => {
                             const medData = medications[medKey] || { given: false, details: {} };
                             const medDetails = medData.details || {};
                             const isGiven = medData.given;
                             let medLabel = '';
                             switch (medKey) {
                                 case 'pillPack': medLabel = 'Набір ЛЗ (pill pack)'; break;
                                 case 'tranexamicAcid': medLabel = 'Транексамова к-та'; break;
                                 case 'analgesic': medLabel = 'Анальгетик'; break;
                                 case 'antibiotic': medLabel = 'Антибіотик'; break;
                                 default: medLabel = medKey;
                             }

                            return (
                                <Box key={medKey} sx={styles.medicationRow}>
                                    <SimpleGrid columns={{ base: 1, lg: 4 }} spacing={3} alignItems="center">
                                        <Checkbox
                                            gridColumn={{ base: '1/-1', lg: '1' }}
                                            name={`priorAid.medications.${medKey}.given`}
                                            isChecked={isGiven}
                                            onChange={handleCheckboxChangeDirect}
                                            mb={{ base: 2, lg: 0 }}
                                            fontWeight="medium"
                                        >
                                            {medLabel}
                                        </Checkbox>
                                        <FormControl id={`${medKey}Dose`} gridColumn={{ base: '1/-1', lg: '2' }} isDisabled={!isGiven}>
                                            <Input size="sm" name={`priorAid.medications.${medKey}.details.dose`} value={medDetails.dose || ''} onChange={handleInputChange} placeholder="Доза/Назва"/>
                                        </FormControl>
                                        <FormControl id={`${medKey}Route`} gridColumn={{ base: '1/-1', lg: '3' }} isDisabled={!isGiven}>
                                            {medKey === 'pillPack' ? (
                                                 <Input size="sm" name={`priorAid.medications.${medKey}.details.route`} value={medDetails.route || ''} onChange={handleInputChange} placeholder="Шлях"/>
                                            ) : (
                                                <Select size="sm" name={`priorAid.medications.${medKey}.details.route`} value={medDetails.route || ''} onChange={handleInputChange} placeholder="Шлях">
                                                     {medicationRoutesList.map(route => <option key={route} value={route}>{route}</option>)}
                                                </Select>
                                            )}
                                        </FormControl>
                                        <FormControl id={`${medKey}Time`} gridColumn={{ base: '1/-1', lg: '4' }} isDisabled={!isGiven}>
                                            <Input size="sm" type="time" name={`priorAid.medications.${medKey}.details.time`} value={medDetails.time || ''} onChange={handleInputChange} />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>
                            );
                        })}

                        {/* Загальне поле для нотаток до медикаментів */}
                        <FormControl id="medicationNotes" mt={3}>
                            <FormLabel>Нотатки щодо медикаментів:</FormLabel>
                            <Textarea
                                name="priorAid.medicationNotes"
                                value={aidData.medicationNotes || ''}
                                onChange={handleInputChange}
                                placeholder="Зазначте додаткову інформацію (напр., конкретна назва анальгетика/антибіотика, реакції)..."
                                size="sm"
                                rows={2}
                            />
                        </FormControl>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
}

export default PriorAidSection;