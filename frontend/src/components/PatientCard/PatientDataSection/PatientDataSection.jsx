// PatientDataSection/PatientDataSection.jsx
import React from 'react';
import {
    Box, Checkbox, FormControl, FormLabel, Input, Radio, RadioGroup,
    Select, Stack, VStack, Heading, SimpleGrid, Text, FormHelperText
} from '@chakra-ui/react';
// Імпортуємо константи
import constants from '../patientCardConstants.json'; // Переконайтесь, що шлях правильний

function PatientDataSection({
    formData,
    handleChange,
    handleRadioChange,
    handleCheckboxChange
}) {

    // Перевіряємо, чи вибране значення formData.arrivalSource є в масиві міток первинних пунктів
    const arrivedFromPrimaryPoint = constants.primaryArrivalPointLabels.includes(formData.arrivalSource);

    return (
        <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg" mb={4}>
                1. Загальна інформація про постраждалого
            </Heading>

            {/* --- 12.1 --- */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={3}>1.1 Ідентифікація та основні дані</Text>
                <VStack spacing={4} align="stretch">
                    <Checkbox
                        name="isUnknown"
                        isChecked={formData.isUnknown}
                        onChange={handleCheckboxChange}
                    >
                        Невідомий (відсутні ідентифікуючі дані)
                    </Checkbox>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl>
                            <FormLabel>Стать</FormLabel>
                            <RadioGroup
                                name="gender"
                                value={formData.gender} // Значення буде "Чоловіча" або "Жіноча"
                                onChange={(value) => handleRadioChange('gender', value)}
                            >
                                <Stack direction="row" spacing={5}>
                                    {/* Генеруємо Radio з констант */}
                                    {constants.genders.map((genderLabel) => (
                                        // Використовуємо мітку як value і як текст
                                        <Radio key={genderLabel} value={genderLabel}>
                                            {genderLabel}
                                        </Radio>
                                    ))}
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Категорія</FormLabel>
                            <RadioGroup
                                name="category"
                                value={formData.category} // Значення буде "Цивільний", "Військовослужбовець", ...
                                onChange={(value) => handleRadioChange('category', value)}
                            >
                                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                                    {/* Генеруємо Radio з констант */}
                                    {constants.categories.map((categoryLabel) => (
                                         // Використовуємо мітку як value і як текст
                                        <Radio key={categoryLabel} value={categoryLabel}>
                                            {categoryLabel}
                                        </Radio>
                                    ))}
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isDisabled={formData.isUnknown}>
                            <FormLabel>ПІБ</FormLabel> {/* Один інпут */}
                            <Input
                                name="fullName" // Ім'я поля в стані
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Прізвище Ім'я [По-батькові]"
                            />
                            {/* <FormHelperText>Вкажіть за наявності</FormHelperText> */}
                        </FormControl>
                       

                        <FormControl isDisabled={formData.isUnknown}>
                            <FormLabel>Дата народження</FormLabel>
                            <Input
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </FormControl>

                        <FormControl isDisabled={formData.isUnknown || formData.category !== "Військовослужбовець"}>
                            <FormLabel>ID військовослужбовця</FormLabel> {/* Змінено Label */}
                            <Input
                                name="militaryId"
                                value={formData.militaryId}
                                onChange={handleChange}
                                placeholder="Номер жетону"
                            />
                        </FormControl>
                    </SimpleGrid>


                  
                </VStack>
            </Box>

            {/* --- 12.2 --- */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={3}>1.2 Додаткова інформація</Text>
                <VStack spacing={4} align="stretch">
                    {/* Умова перевіряє рівність мітці */}
                    {formData.category === "Військовослужбовець" && (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                                <FormLabel>Військове звання</FormLabel>
                                <Select
                                    name="militaryRank"
                                    value={formData.militaryRank} // Значення буде "Солдат", "Сержант", ...
                                    onChange={handleChange}
                                    placeholder="Виберіть звання"
                                >
                                    {/* Генеруємо Options з констант */}
                                    {constants.militaryRanks.map(rankLabel => (
                                        // Використовуємо мітку як value і як текст
                                        <option key={rankLabel} value={rankLabel}>
                                            {rankLabel}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Військова частина</FormLabel>
                                <Input name="militaryUnit" value={formData.militaryUnit} onChange={handleChange} placeholder="Номер або назва частини"/>
                            </FormControl>
                        </SimpleGrid>
                    )}
                    <FormControl>
                        <FormLabel>Наявність алергії</FormLabel>
                        <RadioGroup
                            name="allergyPresence"
                            value={formData.allergyPresence} // Значення буде "Ні", "Невідомо", "Так"
                            onChange={(value) => handleRadioChange('allergyPresence', value)}
                        >
                            <Stack direction="row" spacing={5}>
                                {/* Генеруємо Radio з констант */}
                                {constants.allergyOptions.map(optionLabel => (
                                    // Використовуємо мітку як value і як текст
                                    <Radio key={optionLabel} value={optionLabel}>
                                        {optionLabel}
                                    </Radio>
                                ))}
                            </Stack>
                        </RadioGroup>
                    </FormControl>
                    {/* Умова перевіряє рівність мітці */}
                    {formData.allergyPresence === "Так" && (
                        <FormControl isRequired>
                            <FormLabel>Алерген</FormLabel>
                            <Input name="allergyDetails" value={formData.allergyDetails} onChange={handleChange} placeholder="ЛЗ та реакція"/>
                        </FormControl>
                    )}
                </VStack>
            </Box>

            {/* --- 12.3 --- */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={3}>1.3 Обставини та прибуття</Text>
                <VStack spacing={4} align="stretch">
                    {/* Інпути дати/часу залишаються */}
                     <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                        <FormLabel>Події</FormLabel>
                            <Stack direction={{ base: 'column', sm: 'column' }}>
                                 <FormLabel>Дата події</FormLabel>
                                    <Input name="eventDate" type="date" value={formData.eventDate} onChange={handleChange}/>
                                <FormLabel>Час події</FormLabel>
                                <Input name="eventTime" type="time" value={formData.eventTime} onChange={handleChange}/>
                            </Stack>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Прибуття до мед. підрозділу</FormLabel>
                            <Stack direction={{ base: 'column', sm: 'column' }}>
                                <FormLabel>Дата</FormLabel>
                                <Input name="arrivalDate" type="date" value={formData.arrivalDate} onChange={handleChange}/>
                                <FormLabel>Час</FormLabel>
                                <Input name="arrivalTime" type="time" value={formData.arrivalTime} onChange={handleChange}/>
                            </Stack>
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                            <FormLabel>Тип транспорту</FormLabel>
                            <Select
                                name="transportType"
                                value={formData.transportType} // Значення буде "Casevac", "MMPM", ...
                                onChange={handleChange}
                                placeholder="Виберіть тип"
                            >
                                {/* Генеруємо Options з констант */}
                                {constants.transportTypes.map(typeLabel => (
                                    // Використовуємо мітку як value і як текст
                                    <option key={typeLabel} value={typeLabel}>
                                        {typeLabel}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Звідки прибув постраждалий</FormLabel>
                            <Select
                                name="arrivalSource"
                                value={formData.arrivalSource} // Значення буде "Місце події", ...
                                onChange={handleChange}
                                placeholder="Виберіть джерело"
                            >
                                {/* Генеруємо Options з констант */}
                                {constants.arrivalSources.map(sourceLabel => (
                                    // Використовуємо мітку як value і як текст
                                    <option key={sourceLabel} value={sourceLabel}>
                                        {sourceLabel}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </SimpleGrid>

                    {/* Перевіряємо, чи вибране джерело НЕ є одним з первинних пунктів */}
                    {!arrivedFromPrimaryPoint && formData.arrivalSource && (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Категорія мед. підрозділу (звідки прибув)</FormLabel>
                                <Select
                                    name="medicalRole"
                                    value={formData.medicalRole} // Значення буде "Роль 1", ...
                                    onChange={handleChange}
                                    placeholder="Виберіть роль"
                                >
                                    {/* Генеруємо Options з констант */}
                                    {constants.medicalRoles.map(roleLabel => (
                                        // Використовуємо мітку як value і як текст
                                        <option key={roleLabel} value={roleLabel}>
                                            {roleLabel}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Найменування мед. підрозділу (звідки прибув)</FormLabel>
                                <Input name="medicalUnitName" value={formData.medicalUnitName} onChange={handleChange} placeholder="Введіть найменування"/>
                            </FormControl>
                        </SimpleGrid>
                    )}
                </VStack>
            </Box>

            {/* --- 12.4 --- */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={3}>1.4 Медичне сортування</Text>
                <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Сортувальна категорія (START / jumpSTART)</FormLabel>
                        <Select
                            name="triageCategory"
                            value={formData.triageCategory} // Значення буде "T1 / Негайна (Червоний)", ...
                            onChange={handleChange}
                            placeholder="Виберіть категорію"
                        >
                            {/* Генеруємо Options з констант */}
                            {constants.triageCategories.map(categoryLabel => (
                                // Використовуємо мітку як value і як текст
                                <option key={categoryLabel} value={categoryLabel}>
                                    {categoryLabel}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    
                </VStack>

                
            </Box>
        </VStack>
    );
}

export default PatientDataSection;