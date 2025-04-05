// src/components/CasualtyCard/PatientDataSection/PatientDataSection.jsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
    styled, Box, SimpleGrid, FormControl, FormLabel, Input, Select, RadioGroup, Radio, Stack, Text, Divider, FormErrorMessage, Checkbox, Heading, Textarea, Collapse, HStack, VStack, Flex, Tooltip, Icon // Added Tooltip, Icon
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons'; // Import icon for tooltips
import * as styles from './PatientData.styles';

// Helper for required indicator
const RequiredAsterisk = () => <Text as="span" {...styles.patientDataStyles.requiredAsterisk}>*</Text>;

// Helper for Tooltip Icon
const TooltipIcon = ({ label }) => (
    <Tooltip label={label} placement="top" hasArrow bg="gray.700" color="white" p={2} borderRadius="md">
        <Icon as={InfoOutlineIcon} {...styles.patientDataStyles.tooltipIcon} />
    </Tooltip>
);

function PatientDataSection({ isDisabled, constants }) {
    const { control, register, watch, setValue, formState: { errors } } = useFormContext();

    // --- Watch values ---
    const isUnknown = watch('isUnknown');
    const category = watch('category');
    const allergyStatus = watch('allergyStatus');
    const arrivalSource = watch('arrivalSource');

    const isMilitary = category === 'військовослужбовець';
    const showAllergyDetails = allergyStatus === 'так';

    // Determine if the 'arrivalMedicalRole' field should be shown (as per 12.3)
    // It's shown ONLY if arrivalSource is selected and it's NOT 'місце події' or 'пункт збору поранених'
    const showMedicalRoleField = arrivalSource && !['місце події', 'пункт збору поранених'].includes(arrivalSource);

    // --- Event Handlers ---
    const handleUnknownChange = (e) => {
        const checked = e.target.checked;
        setValue('isUnknown', checked, { shouldValidate: true, shouldDirty: true });
        if (checked) {
            // Clear identifying fields when unknown is checked
            setValue('patientFullName', '', { shouldDirty: true });
            setValue('militaryId', '', { shouldDirty: true });
            setValue('dateOfBirth', '', { shouldDirty: true });
            setValue('gender', undefined, { shouldDirty: true }); // Reset gender
            // Optionally clear military rank/unit if category is also cleared or reset
            if (category === 'військовослужбовець') {
                 setValue('militaryRank', '', { shouldDirty: true });
                 setValue('militaryUnit', '', { shouldDirty: true });
            }
        }
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setValue('category', newCategory, { shouldValidate: true, shouldDirty: true });
        // Clear military fields if category is not military
        if (newCategory !== 'військовослужбовець') {
            setValue('militaryRank', '', { shouldDirty: true });
            setValue('militaryUnit', '', { shouldDirty: true });
            // Keep militaryId potentially, or clear: setValue('militaryId', '', { shouldDirty: true });
        }
        // Re-validate dependent fields if necessary
    };

    const handleAllergyStatusChange = (value) => {
        setValue('allergyStatus', value, { shouldValidate: true, shouldDirty: true });
        // Clear details if status is not 'yes'
        if (value !== 'так') {
            setValue('allergyDetails', '', { shouldDirty: true });
        }
    };

     const handleArrivalSourceChange = (e) => {
        const newSource = e.target.value;
        setValue('arrivalSource', newSource, { shouldValidate: true, shouldDirty: true });
        // Clear medical role if it should no longer be shown
        if (!newSource || ['місце події', 'пункт збору поранених'].includes(newSource)) {
             setValue('arrivalMedicalRole', '', { shouldDirty: true });
        }
     };
    // --- End Handlers ---

    // Ensure constants are available or provide defaults
    const categoryOptions = constants?.CATEGORY_OPTIONS || ['цивільний', 'військовослужбовець', 'полонений'];
    const genderOptions = constants?.GENDER_OPTIONS || ['Ч', 'Ж'];
    const militaryRanks = constants?.MILITARY_RANKS || [];
    const allergyStatusOptions = constants?.ALLERGY_STATUS_OPTIONS || ['ні', 'невідомо', 'так'];
    const transportTypes = constants?.TRANSPORT_TYPES || ['Casevac', 'MMPM', 'Medevac'];
    const arrivalSources = constants?.ARRIVAL_SOURCES || ['місце події', 'пункт збору поранених', 'роль 1', 'роль 2', 'роль 3', 'роль 4']; // Assuming roles are directly in arrival sources OR handled differently
    const medicalRoles = constants?.MEDICAL_ROLES || ['роль 1', 'роль 2', 'роль 3', 'роль 4'];
    const triageCategories = constants?.TRIAGE_CATEGORIES || [];


    return (
        <Box {...styles.patientDataStyles.sectionContainer}>
            {/* --- Block 1.1: Identification --- */}
            <Heading {...styles.patientDataStyles.blockHeading} mt={0}>1.1 Ідентифікація</Heading>
            <Box {...styles.patientDataStyles.unknownCheckboxContainer}>
                 <Checkbox
                    id="isUnknown"
                    {...register('isUnknown')}
                    isChecked={isUnknown}
                    onChange={handleUnknownChange}
                    isDisabled={isDisabled}
                    size="lg"
                    {...styles.patientDataStyles.checkbox}
                 >
                    <Text fontWeight="medium">Постраждалий невідомий</Text>
                    <TooltipIcon label="Відмітка встановлюється у випадку відсутності будь-яких ідентифікуючих даних." />
                 </Checkbox>
            </Box>

            <SimpleGrid {...styles.patientDataStyles.grid}>
                {/* Category (1.1) */}
                <FormControl id="category" isRequired isInvalid={!!errors.category}>
                    <FormLabel {...styles.patientDataStyles.formLabel}>Категорія <RequiredAsterisk /></FormLabel>
                    <Select placeholder="Оберіть..." isDisabled={isDisabled} {...register('category', { required: "Оберіть категорію" })} onChange={handleCategoryChange} {...styles.patientDataStyles.inputStyles} sx={styles.patientDataStyles.selectPlaceholder}>
                        {categoryOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                    </Select>
                    <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.category?.message}</FormErrorMessage>
                </FormControl>

                {/* Gender (1.1) */}
                 <FormControl as="fieldset" id="gender" isRequired={!isUnknown} isInvalid={!!errors.gender}>
                    <FormLabel as="legend" {...styles.patientDataStyles.formLabel}>Стать {!isUnknown && <RequiredAsterisk />}</FormLabel>
                    <Controller name="gender" control={control} rules={{ required: !isUnknown ? 'Оберіть стать' : false }} render={({ field }) => (
                        <RadioGroup {...field} isDisabled={isDisabled || isUnknown} {...styles.patientDataStyles.radioGroup}>
                            <HStack spacing={5}>
                                {genderOptions.map(opt => (<Radio key={opt} value={opt} {...styles.patientDataStyles.radio}>{opt === 'Ч' ? 'Чоловіча' : 'Жіноча'}</Radio>))}
                            </HStack>
                        </RadioGroup>
                    )}/>
                    <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.gender?.message}</FormErrorMessage>
                 </FormControl>

                {/* Full Name (1.1) */}
                 <FormControl id="patientFullName" isRequired={!isUnknown} isInvalid={!!errors.patientFullName} {...styles.patientDataStyles.fullWidth}>
                     <FormLabel {...styles.patientDataStyles.formLabel}>Прізвище, Ім'я, По батькові {!isUnknown && <RequiredAsterisk />}</FormLabel>
                     <Input placeholder={isUnknown ? 'Невідомо' : "Введіть повне ім'я"} isDisabled={isDisabled || isUnknown} {...register('patientFullName', { required: !isUnknown ? "ПІБ є обов'язковим" : false })} {...styles.patientDataStyles.inputStyles}/>
                     <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.patientFullName?.message}</FormErrorMessage>
                 </FormControl>

                 {/* ID / Personal Number (1.1, Conditional required) */}
                 <FormControl id="militaryId" isRequired={isMilitary && !isUnknown} isInvalid={!!errors.militaryId}>
                     <FormLabel {...styles.patientDataStyles.formLabel}>
                         ID / Особистий номер {isMilitary && !isUnknown && <RequiredAsterisk />}
                         <TooltipIcon label="Особистий номер військовослужбовця (за наявності)" />
                     </FormLabel>
                     <Input placeholder={!isMilitary ? 'Не застосовується' : isUnknown ? 'Невідомо' : "Введіть номер"} isDisabled={isDisabled || isUnknown || !isMilitary} {...register('militaryId', { required: isMilitary && !isUnknown ? "ID є обов'язковим" : false })} {...styles.patientDataStyles.inputStyles}/>
                     <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.militaryId?.message}</FormErrorMessage>
                 </FormControl>

                 {/* Date of Birth (1.1) */}
                 <FormControl id="dateOfBirth" isRequired={!isUnknown} isInvalid={!!errors.dateOfBirth}>
                     <FormLabel {...styles.patientDataStyles.formLabel}>Дата народження {!isUnknown && <RequiredAsterisk />}</FormLabel>
                     <Input type="date" isDisabled={isDisabled || isUnknown} max={new Date().toISOString().split("T")[0]} {...register('dateOfBirth', { required: !isUnknown ? 'Вкажіть дату народження' : false, valueAsDate: true })} {...styles.patientDataStyles.inputStyles}/>
                     <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.dateOfBirth?.message}</FormErrorMessage>
                 </FormControl>
            </SimpleGrid>

            <Divider {...styles.patientDataStyles.divider} />

            {/* --- Block 1.2: Military Status & Allergies --- */}
            <Heading {...styles.patientDataStyles.blockHeading}>1.2 Військовий Статус & Алергії</Heading>
            <VStack spacing={6} align="stretch">

                {/* Military Details Block (1.2, collapses) */}
                <Collapse in={isMilitary} animateOpacity unmountOnExit>
                    <Box {...styles.patientDataStyles.militaryGroupContainer}>
                        <Heading {...styles.patientDataStyles.militaryGroupHeading}>Дані військовослужбовця</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={4}>
                            {/* Military Rank (1.2) */}
                            <FormControl id="militaryRank" isRequired={isMilitary} isInvalid={!!errors.militaryRank}>
                                <FormLabel {...styles.patientDataStyles.formLabel}>Військове звання {isMilitary && <RequiredAsterisk />}</FormLabel>
                                <Select placeholder="Оберіть звання..." isDisabled={isDisabled || !isMilitary} {...register('militaryRank', { required: isMilitary ? "Оберіть звання" : false })} {...styles.patientDataStyles.inputStyles} sx={styles.patientDataStyles.selectPlaceholder}>
                                    {militaryRanks.map(rank => (<option key={rank} value={rank}>{rank}</option>))}
                                </Select>
                                <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.militaryRank?.message}</FormErrorMessage>
                            </FormControl>
                            {/* Military Unit (1.2) */}
                            <FormControl id="militaryUnit" isRequired={isMilitary} isInvalid={!!errors.militaryUnit}>
                                <FormLabel {...styles.patientDataStyles.formLabel}>Військова частина {isMilitary && <RequiredAsterisk />}</FormLabel>
                                <Input placeholder="Напр., в/ч А0000" isDisabled={isDisabled || !isMilitary} {...register('militaryUnit', { required: isMilitary ? "Вкажіть в/ч" : false })} {...styles.patientDataStyles.inputStyles}/>
                                <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.militaryUnit?.message}</FormErrorMessage>
                            </FormControl>
                        </SimpleGrid>
                    </Box>
                </Collapse>

                {/* Allergy Block (1.2) */}
                <Box {...styles.patientDataStyles.allergyGroupContainer}>
                     <VStack align="start" spacing={4}>
                        {/* Allergy Status (1.2) */}
                        <FormControl as="fieldset" id="allergyStatus" isRequired isInvalid={!!errors.allergyStatus}>
                            <FormLabel as="legend" {...styles.patientDataStyles.formLabel}>Наявність алергії <RequiredAsterisk /></FormLabel>
                            <Controller name="allergyStatus" control={control} rules={{ required: 'Вкажіть статус алергії' }} render={({ field: { onChange, value, ...restField } }) => (
                                <RadioGroup value={value} onChange={(val) => { onChange(val); handleAllergyStatusChange(val); }} isDisabled={isDisabled} {...restField} {...styles.patientDataStyles.radioGroup}>
                                    <HStack spacing={5}>
                                        {allergyStatusOptions.map(opt => (
                                            <Radio key={opt} value={opt} {...styles.patientDataStyles.radio}>
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </Radio>
                                        ))}
                                    </HStack>
                                </RadioGroup>
                            )}/>
                            <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.allergyStatus?.message}</FormErrorMessage>
                        </FormControl>

                        {/* Allergy Details (1.2, collapses) */}
                        <Collapse in={showAllergyDetails} animateOpacity unmountOnExit style={{ width: '100%' }}>
                            <FormControl id="allergyDetails" isRequired={showAllergyDetails} isInvalid={!!errors.allergyDetails}>
                                <FormLabel {...styles.patientDataStyles.formLabel}>
                                    Вкажіть алерген(и) {showAllergyDetails && <RequiredAsterisk />}
                                    <TooltipIcon label="Вказується алергія переважно на лікарські засоби або інші відомі речовини." />
                                </FormLabel>
                                <Textarea
                                    placeholder="Напр., Пеніцилін (анафілаксія), йод (висип)..."
                                    isDisabled={isDisabled}
                                    {...register('allergyDetails', { required: showAllergyDetails ? 'Вкажіть деталі алергії' : false })}
                                    minH="80px"
                                    {...styles.patientDataStyles.inputStyles}
                                    size="md"
                                 />
                                <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.allergyDetails?.message}</FormErrorMessage>
                            </FormControl>
                        </Collapse>
                    </VStack>
                </Box>
            </VStack>

            <Divider {...styles.patientDataStyles.divider} />

            {/* --- Block 1.3: Event & Arrival Circumstances --- */}
            <Heading {...styles.patientDataStyles.blockHeading}>1.3 Обставини Події та Прибуття</Heading>
             <SimpleGrid {...styles.patientDataStyles.grid}>
                 {/* Event Date & Time (1.3) */}
                 <FormControl isRequired isInvalid={!!errors.injuryDate || !!errors.injuryTime} {...styles.patientDataStyles.fullWidth}>
                     <FormLabel {...styles.patientDataStyles.formLabel}>
                         Дата та час події <RequiredAsterisk />
                         <TooltipIcon label="Час та дата отримання травми/поранення або виникнення захворювання." />
                    </FormLabel>
                     <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
                         <FormControl isInvalid={!!errors.injuryDate} flex={1}>
                             <FormLabel htmlFor="injuryDate" srOnly>Дата події</FormLabel>
                             <Input id="injuryDate" type="date" isDisabled={isDisabled} max={new Date().toISOString().split("T")[0]} {...register('injuryDate', { required: 'Дата події' })} {...styles.patientDataStyles.inputStyles}/>
                             <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.injuryDate?.message}</FormErrorMessage>
                         </FormControl>
                         <FormControl isInvalid={!!errors.injuryTime} flex={1}>
                              <FormLabel htmlFor="injuryTime" srOnly>Час події</FormLabel>
                             <Input id="injuryTime" type="time" isDisabled={isDisabled} {...register('injuryTime', { required: 'Час події', pattern: { value: /^([01]\d|2[0-3]):([0-5]\d)$/, message: 'Формат HH:MM' } })} {...styles.patientDataStyles.inputStyles}/>
                             <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.injuryTime?.message}</FormErrorMessage>
                         </FormControl>
                     </Flex>
                 </FormControl>

                 {/* Arrival Date & Time (1.3) */}
                 <FormControl isRequired isInvalid={!!errors.arrivalDate || !!errors.arrivalTime} {...styles.patientDataStyles.fullWidth}>
                     <FormLabel {...styles.patientDataStyles.formLabel}>
                         Дата та час прибуття до мед. підрозділу <RequiredAsterisk />
                         <TooltipIcon label="Час та дата прибуття до поточного медичного підрозділу." />
                    </FormLabel>
                      <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
                         <FormControl isInvalid={!!errors.arrivalDate} flex={1}>
                            <FormLabel htmlFor="arrivalDate" srOnly>Дата прибуття</FormLabel>
                            <Input id="arrivalDate" type="date" isDisabled={isDisabled} max={new Date().toISOString().split("T")[0]} {...register('arrivalDate', { required: 'Дата прибуття' })} {...styles.patientDataStyles.inputStyles}/>
                            <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.arrivalDate?.message}</FormErrorMessage>
                         </FormControl>
                         <FormControl isInvalid={!!errors.arrivalTime} flex={1}>
                            <FormLabel htmlFor="arrivalTime" srOnly>Час прибуття</FormLabel>
                            <Input id="arrivalTime" type="time" isDisabled={isDisabled} {...register('arrivalTime', { required: 'Час прибуття', pattern: { value: /^([01]\d|2[0-3]):([0-5]\d)$/, message: 'Формат HH:MM' } })} {...styles.patientDataStyles.inputStyles}/>
                            <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.arrivalTime?.message}</FormErrorMessage>
                         </FormControl>
                     </Flex>
                 </FormControl>

                {/* Transport Type (1.3) */}
                 <FormControl id="transportType" isRequired isInvalid={!!errors.transportType}>
                     <FormLabel {...styles.patientDataStyles.formLabel}>
                         Тип транспорту <RequiredAsterisk />
                         <TooltipIcon label="Транспорт, яким постраждалого було доставлено." />
                     </FormLabel>
                     <Select placeholder="Оберіть..." isDisabled={isDisabled} {...register('transportType', { required: "Оберіть тип транспорту" })} {...styles.patientDataStyles.inputStyles} sx={styles.patientDataStyles.selectPlaceholder}>
                        {transportTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                    </Select>
                    <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.transportType?.message}</FormErrorMessage>
                 </FormControl>

                {/* Arrival Source (1.3) */}
                 <FormControl id="arrivalSource" isRequired isInvalid={!!errors.arrivalSource}>
                     <FormLabel {...styles.patientDataStyles.formLabel}>
                        Звідки прибув <RequiredAsterisk />
                        <TooltipIcon label="Місце, з якого постраждалий прибув до цього підрозділу (місце події, пункт збору, або попередній етап мед. допомоги)." />
                     </FormLabel>
                     {/* Use Controller to handle the change and clear dependent field */}
                     <Controller
                        name="arrivalSource"
                        control={control}
                        rules={{ required: "Вкажіть джерело" }}
                        render={({ field }) => (
                             <Select
                                {...field}
                                placeholder="Оберіть джерело..."
                                isDisabled={isDisabled}
                                onChange={(e) => {
                                    field.onChange(e); // RHF's internal handler
                                    handleArrivalSourceChange(e); // Custom handler to clear Role
                                }}
                                {...styles.patientDataStyles.inputStyles}
                                sx={styles.patientDataStyles.selectPlaceholder}
                            >
                               {arrivalSources.map(source => (<option key={source} value={source}>{source}</option>))}
                           </Select>
                        )}
                     />
                    <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.arrivalSource?.message}</FormErrorMessage>
                 </FormControl>

                 {/* Medical Role Category (1.3, conditional) */}
                 <Collapse in={showMedicalRoleField} animateOpacity unmountOnExit style={{ gridColumn: 'span 1', width: '100%' }}>
                     <FormControl id="arrivalMedicalRole" isRequired={showMedicalRoleField} isInvalid={!!errors.arrivalMedicalRole}>
                         <FormLabel {...styles.patientDataStyles.formLabel}>
                             Категорія мед. підтримки (Роль) {showMedicalRoleField && <RequiredAsterisk />}
                             <TooltipIcon label="Зазначається тільки якщо постраждалий прибув з іншого мед. підрозділу (роль 1-4)." />
                         </FormLabel>
                         <Select placeholder="Оберіть роль..." isDisabled={isDisabled || !showMedicalRoleField} {...register('arrivalMedicalRole', { required: showMedicalRoleField ? "Оберіть роль мед. підтримки" : false })} {...styles.patientDataStyles.inputStyles} sx={styles.patientDataStyles.selectPlaceholder}>
                            {medicalRoles.map(role => (<option key={role} value={role}>{role}</option>))}
                        </Select>
                        <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.arrivalMedicalRole?.message}</FormErrorMessage>
                     </FormControl>
                </Collapse>

                {/* Make space if the medical role is not shown, or place arrival facility name correctly */}
                {!showMedicalRoleField && <Box display={{ base: 'none', md: 'block' }}></Box> } {/* Spacer Cell if Role is hidden */}


                 {/* Arrival Medical Facility Name (1.3, spans 2 cols) */}
                 <FormControl id="arrivalMedicalFacilityName" isRequired isInvalid={!!errors.arrivalMedicalFacilityName} {...styles.patientDataStyles.fullWidth}>
                    <FormLabel {...styles.patientDataStyles.formLabel}>
                        Найменування мед. підрозділу (куди прибув) <RequiredAsterisk />
                        <TooltipIcon label="Повна або скорочена назва поточного медичного підрозділу." />
                    </FormLabel>
                    <Input placeholder="Введіть назву" isDisabled={isDisabled} {...register('arrivalMedicalFacilityName', { required: 'Вкажіть назву мед. підрозділу' })} {...styles.patientDataStyles.inputStyles}/>
                    <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.arrivalMedicalFacilityName?.message}</FormErrorMessage>
                 </FormControl>
            </SimpleGrid>

            <Divider {...styles.patientDataStyles.divider} />

            {/* --- Block 1.4: Triage Category --- */}
            <Heading {...styles.patientDataStyles.blockHeading}>1.4 Сортування</Heading>
            <SimpleGrid columns={1} spacing={4} mb={6}>
                 <FormControl id="triageCategory" isRequired isInvalid={!!errors.triageCategory}>
                    <FormLabel htmlFor="triageCategory" {...styles.patientDataStyles.formLabel}>
                        Сортувальна категорія <RequiredAsterisk />
                        <TooltipIcon label="Категорія за результатами медичного сортування (напр., за алгоритмами START / jumpSTART)." />
                    </FormLabel>
                    <Select placeholder="Оберіть категорію..." isDisabled={isDisabled} {...register('triageCategory', { required: 'Оберіть сортувальну категорію' })} {...styles.patientDataStyles.inputStyles} sx={styles.patientDataStyles.selectPlaceholder}>
                        {triageCategories.map(cat => (cat && <option key={cat} value={cat}>{cat}</option>))}
                    </Select>
                    <FormErrorMessage {...styles.patientDataStyles.errorMessage}>{errors.triageCategory?.message}</FormErrorMessage>
                 </FormControl>
            </SimpleGrid>
        </Box>
    );
}

export default PatientDataSection;