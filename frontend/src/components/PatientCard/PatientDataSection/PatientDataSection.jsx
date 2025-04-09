// PatientDataSection/PatientDataSection.jsx
import React from 'react';
import {
    Box, Checkbox, FormControl, FormLabel, Input, Radio, RadioGroup,
    Select, Stack, VStack, Heading, SimpleGrid, Text, FormHelperText
} from '@chakra-ui/react';
// Імпортуємо константи
import constants from '../patientCardConstants';

function PatientDataSection({
    formData,
    handleChange,
    handleRadioChange, // Цей обробник тепер повинен скидати нерелевантні поля при зміні originType!
    handleCheckboxChange
}) {

    // Перевіряємо поточний тип джерела прибуття для умовного рендерингу
    const isLocationOrigin = formData.originType === 'location';
    const isMedicalUnitOrigin = formData.originType === 'medical_unit';

    return (
        <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg" mb={4}>
                1. Загальна Інформація про Пораненого
            </Heading>

            {/* --- 1.1 Ідентифікація та основні дані --- */}
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
                                value={formData.gender}
                                onChange={(value) => handleRadioChange('gender', value)}
                            >
                                <Stack direction="row" spacing={5}>
                                    {constants.genders.map((genderLabel) => (
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
                                value={formData.category}
                                onChange={(value) => handleRadioChange('category', value)}
                            >
                                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                                    {constants.categories.map((categoryLabel) => (
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
                            <FormLabel>ПІБ</FormLabel>
                            <Input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Прізвище Ім'я [По-батькові]"
                            />
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

                        {formData.category === "Військовослужбовець" && (
                            <FormControl isDisabled={formData.isUnknown}>
                                <FormLabel>ID військовослужбовця</FormLabel>
                                <Input
                                    name="militaryId"
                                    value={formData.militaryId}
                                    onChange={handleChange}
                                    placeholder="Номер жетону"
                                />
                            </FormControl>
                        )}
                    </SimpleGrid>
                </VStack>
            </Box>

            {/* --- 1.2 Додаткова інформація --- */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={3}>1.2 Додаткова інформація</Text>
                <VStack spacing={4} align="stretch">
                    {formData.category === "Військовослужбовець" && (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <FormControl>
                                <FormLabel>Військове звання</FormLabel>
                                <Select
                                    name="militaryRank"
                                    value={formData.militaryRank}
                                    onChange={handleChange}
                                    placeholder="Виберіть звання"
                                >
                                    {constants.militaryRanks.map(rankLabel => (
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
                            value={formData.allergyPresence}
                            onChange={(value) => handleRadioChange('allergyPresence', value)}
                        >
                            <Stack direction="row" spacing={5}>
                                {constants.allergyOptions.map(optionLabel => (
                                    <Radio key={optionLabel} value={optionLabel}>
                                        {optionLabel}
                                    </Radio>
                                ))}
                            </Stack>
                        </RadioGroup>
                    </FormControl>
                    {formData.allergyPresence === "Так" && (
                        <FormControl isRequired>
                            <FormLabel>Алерген</FormLabel>
                            <Input name="allergyDetails" value={formData.allergyDetails} onChange={handleChange} placeholder="ЛЗ та реакція"/>
                        </FormControl>
                    )}
                </VStack>
            </Box>

            {/* --- 1.3 Обставини та прибуття --- */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={3}>1.3 Обставини та прибуття</Text>
                <VStack spacing={4} align="stretch">
                    {/* Інпути дати/часу */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                            <FormLabel>Подія</FormLabel>
                            <Stack direction={{ base: 'column', sm: 'row' }} spacing={2}>
                                {/* <FormLabel >Час</FormLabel> */}
                                <Input name="eventTime" type="time" value={formData.eventTime} onChange={handleChange}/>
                                {/* <FormLabel >Дата</FormLabel> */}
                                <Input name="eventDate" type="date" value={formData.eventDate} onChange={handleChange}/>
                            </Stack>
                        </FormControl>
                        <FormControl>
                            <FormLabel>Прибуття</FormLabel>
                            <Stack direction={{ base: 'column', sm: 'row' }} spacing={2}>
                                {/* <FormLabel >Час</FormLabel> */}
                                <Input name="arrivalTime" type="time" value={formData.arrivalTime} onChange={handleChange}/>
                                {/* <FormLabel >Дата</FormLabel> */}
                                <Input name="arrivalDate" type="date" value={formData.arrivalDate} onChange={handleChange}/>
                            </Stack>
                        </FormControl>
                    </SimpleGrid>

                    {/* Тип транспорту */}
                    <FormControl>
                        <FormLabel>Тип транспорту</FormLabel>
                        <Select
                            name="transportType"
                            value={formData.transportType}
                            onChange={handleChange}
                            placeholder="Виберіть тип"
                        >
                            {constants.transportTypes.map(typeLabel => (
                                <option key={typeLabel} value={typeLabel}>
                                    {typeLabel}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    {/* ===== ПОКРАЩЕНИЙ БЛОК ІНФОРМАЦІЇ ПРО ПРИБУТТЯ ===== */}

                    {/* --- 1: Вибір типу джерела прибуття --- */}
                    <FormControl isRequired as="fieldset">
                        <FormLabel as="legend">
                            Звідки прибув постраждалий?
                        </FormLabel>
                        <RadioGroup
                            name="originType" // Керує вибором
                            value={formData.originType} // Значення зі стану ('location' або 'medical_unit')
                            // ВАЖЛИВО: батьківський handleRadioChange повинен очищати
                            // medicalUnitName/Role при виборі 'location'
                            // та arrivalLocationName при виборі 'medical_unit'
                            onChange={(value) => handleRadioChange('originType', value)}
                        >
                            <Stack direction={{ base: 'column', md: 'row' }} spacing={5}>
                                <Radio value="location">
                                    Місце події / Пункт збору
                                </Radio>
                                <Radio value="medical_unit">
                                    Медичний підрозділ
                                </Radio>
                            </Stack>
                        </RadioGroup>
                        <FormHelperText>
                            Оберіть тип місця, звідки прибув постраждалий.
                        </FormHelperText>
                    </FormControl>

                    {/* --- 2: Введення назви місця (якщо не мед. підрозділ) --- */}
                    {isLocationOrigin && (
                        <FormControl isRequired id="arrivalLocationName">
                            <FormLabel>Вкажіть місце події або пункт збору</FormLabel>
                            <Input
                                name="arrivalLocationName" // Нове поле стану
                                value={formData.arrivalLocationName}
                                onChange={handleChange}
                                placeholder="Напр., перехрестя вул. Центральної та Південної, або 'Пункт збору Альфа'"
                            />
                            <FormHelperText>
                                Введіть детальну назву або опис місця.
                            </FormHelperText>
                        </FormControl>
                    )}

                    {/* --- 3 і 4: Введення назви та ролі мед. підрозділу --- */}
                    {isMedicalUnitOrigin && (
                        // VStack для групування полів мед. підрозділу
                        <VStack spacing={4} align="stretch">
                            {/* --- 3: Назва мед. підрозділу --- */}
                            <FormControl isRequired id="medicalUnitName">
                                <FormLabel>Найменування медичного підрозділу</FormLabel>
                                <Input
                                    name="medicalUnitName" // Нове поле стану
                                    value={formData.medicalUnitName}
                                    onChange={handleChange}
                                    placeholder="Введіть повну або скорочену назву"
                                />
                                <FormHelperText>
                                    Наприклад, "Військовий госпіталь м. Київ" або "Стабпункт 5 ОШБр".
                                </FormHelperText>
                            </FormControl>

                            {/* --- 4: Роль мед. підрозділу --- */}
                            <FormControl isRequired id="medicalUnitRole">
                                <FormLabel>Категорія мед. підрозділу (Роль)</FormLabel>
                                <Select
                                    name="medicalRole" // Це поле стану вже мало існувати
                                    value={formData.medicalRole}
                                    onChange={handleChange}
                                    placeholder="Оберіть роль зі списку"
                                >
                                    {constants.medicalRoles.map(roleLabel => (
                                        <option key={roleLabel} value={roleLabel}>
                                            {roleLabel}
                                        </option>
                                    ))}
                                </Select>
                                <FormHelperText>
                                   Виберіть роль відповідно до класифікації медичної підтримки.
                                </FormHelperText>
                            </FormControl>
                        </VStack>
                    )}
                    {/* ===== КІНЕЦЬ ПОКРАЩЕНОГО БЛОКУ ===== */}

                </VStack>
            </Box>

            {/* --- 1.4 Медичне сортування --- */}
            <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={3}>1.4 Медичне сортування</Text>
                <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Сортувальна категорія (START / jumpSTART)</FormLabel>
                        <Select
                            name="triageCategory"
                            value={formData.triageCategory}
                            onChange={handleChange}
                            placeholder="Виберіть категорію"
                        >
                            {constants.triageCategories.map(categoryLabel => (
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