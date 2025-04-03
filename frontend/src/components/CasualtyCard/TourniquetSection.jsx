// src/components/CasualtyCard/TourniquetSection.jsx
import React, { useCallback } from 'react';
import { Box, Heading, SimpleGrid, FormControl, FormLabel, Input, Select, Text } from '@chakra-ui/react';

// Імпортуємо константи
import constants from '../../constants/constants.json';

// --- Компонент для однієї кінцівки ---
function TourniquetLimb({ limb, label, data, setFormData, isDisabled, tourniquetTypesList }) { // Додано tourniquetTypesList

    // Визначаємо, чи показувати поле для введення "Інше"
    const showTypeOtherInput = data?.type === 'Інше';

    // Обробник змін для полів цієї кінцівки
    const handleChange = useCallback((e) => {
        const { name, value } = e.target; // name буде 'time', 'type', або 'typeOther'

        setFormData(prevData => {
            const currentLimbData = prevData.tourniquets?.[limb] || {};
            const updatedLimbData = {
                ...currentLimbData,
                [name]: value
            };

            // Якщо змінили тип НЕ на "Інше", очищаємо поле typeOther
            if (name === 'type' && value !== 'Інше') {
                updatedLimbData.typeOther = '';
            }

            return {
                ...prevData,
                tourniquets: {
                    ...prevData.tourniquets,
                    [limb]: updatedLimbData
                }
            };
        });
    }, [limb, setFormData]);


    return (
        // Обгортаємо в Box для кращої структури при появі поля "Інше"
        <Box borderWidth={1} p={3} borderRadius="md">
            <Text fontWeight="bold" mb={2}>{label}</Text>

            <FormControl mb={2}>
                <FormLabel fontSize="xs">Тип</FormLabel>
                {/* Замінюємо Input на Select */}
                <Select
                    size="sm"
                    name="type"
                    value={data?.type || ''}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    placeholder="Оберіть тип..."
                >
                    {/* Генеруємо опції зі списку */}
                    {tourniquetTypesList.map(typeOption => (
                        <option key={typeOption} value={typeOption}>{typeOption}</option>
                    ))}
                </Select>
            </FormControl>

            {/* Умовне поле для введення тексту, якщо вибрано "Інше" */}
            {showTypeOtherInput && (
                <FormControl mb={2}>
                    <FormLabel fontSize="xs">Вкажіть тип <Text as="span" color="red.500">*</Text></FormLabel>
                    <Input
                        size="sm"
                        name="typeOther" // Нове поле для збереження значення "Інше"
                        value={data?.typeOther || ''}
                        onChange={handleChange}
                        isDisabled={isDisabled}
                        placeholder="Введіть тип турнікета..."
                    />
                </FormControl>
            )}

            <FormControl>
                <FormLabel fontSize="xs">Час накладання (ГГ:ХХ)</FormLabel>
                <Input
                    size="sm"
                    type="time"
                    name="time"
                    value={data?.time || ''}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    pattern="[0-9]{2}:[0-9]{2}"
                />
            </FormControl>
        </Box>
    );
}

// --- Основний компонент секції ---
function TourniquetSection({ data, setFormData, isDisabled }) {
    // Переконуємось, що data.tourniquets існує
    const tourniquetsData = data?.tourniquets || {};

    return (
        <Box>
            <Heading size="sm" mb={3}>3. Турнікети</Heading> {/* Оновлено нумерацію */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                <TourniquetLimb
                    limb="rightArm"
                    label="Права рука"
                    data={tourniquetsData.rightArm} // Безпечний доступ
                    setFormData={setFormData}
                    isDisabled={isDisabled}
                    tourniquetTypesList={constants.tourniquetTypes} // Передаємо список типів
                />
                <TourniquetLimb
                    limb="leftArm"
                    label="Ліва рука"
                    data={tourniquetsData.leftArm} // Безпечний доступ
                    setFormData={setFormData}
                    isDisabled={isDisabled}
                    tourniquetTypesList={constants.tourniquetTypes} // Передаємо список типів
                />
                <TourniquetLimb
                    limb="rightLeg"
                    label="Права нога"
                    data={tourniquetsData.rightLeg} // Безпечний доступ
                    setFormData={setFormData}
                    isDisabled={isDisabled}
                    tourniquetTypesList={constants.tourniquetTypes} // Передаємо список типів
                />
                <TourniquetLimb
                    limb="leftLeg"
                    label="Ліва нога"
                    data={tourniquetsData.leftLeg} // Безпечний доступ
                    setFormData={setFormData}
                    isDisabled={isDisabled}
                    tourniquetTypesList={constants.tourniquetTypes} // Передаємо список типів
                />
            </SimpleGrid>
        </Box>
    );
}

export default TourniquetSection;