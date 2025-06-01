// frontend/src/components/PatientCard/HospitalCareSection.jsx
import React from 'react';
import { VStack, Heading, Text, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';
// import constants from './patientCardConstants'; // Може знадобитися для списків опцій

// Пропси: formDataSection (це буде formData.hospitalCare), handleInputChange
function HospitalCareSection({ formDataSection, handleInputChange }) {
    if (!formDataSection) return <Text>Дані для госпітального етапу не завантажені.</Text>;

    return (
        <VStack spacing={6} align="stretch">
            <Heading size="lg" mb={4} borderBottomWidth="1px" pb={2}>Госпітальний Етап</Heading>
            <Text color="gray.500" fontStyle="italic">
                Ця секція заповнюється медичним персоналом у лікувальному закладі.
            </Text>

            <FormControl>
                <FormLabel>Дата та час прибуття до лікарні</FormLabel>
                <Input
                    type="datetime-local"
                    value={formDataSection.arrivalAtHospitalDateTime || ''}
                    onChange={(e) => handleInputChange('arrivalAtHospitalDateTime', e.target.value)}
                />
            </FormControl>

            {/* Заглушка для Тріажу МАІ в лікарні */}
            <FormControl>
                <FormLabel>Результат Тріажу в лікарні (AHP - заглушка)</FormLabel>
                <Input
                    value={formDataSection.hospitalTriageResult?.categoryAHP || ''}
                    onChange={(e) => handleInputChange('hospitalTriageResult.categoryAHP', e.target.value)}
                    placeholder="Категорія за результатами детального тріажу"
                />
            </FormControl>
            <FormControl>
                <FormLabel>Деталі тріажу в лікарні</FormLabel>
                <Textarea
                    value={formDataSection.hospitalTriageResult?.details || ''}
                    onChange={(e) => handleInputChange('hospitalTriageResult.details', e.target.value)}
                    placeholder="Додаткові коментарі або обґрунтування категорії тріажу"
                />
            </FormControl>


            <FormControl>
                <FormLabel>Встановлені (підтверджені) діагнози</FormLabel>
                {/* Тут буде UI для додавання/редагування масиву confirmedDiagnoses */}
                <Textarea
                    value={formDataSection.confirmedDiagnoses?.map(d => d.description).join('\n') || ''} // Простий приклад
                    onChange={(e) => { /* Потрібна складніша логіка для масиву об'єктів */ }}
                    placeholder="Діагнози, встановлені в лікарні..."
                    isReadOnly // Поки що тільки для читання, потрібен UI для масиву
                />
            </FormControl>

            <FormControl>
                <FormLabel>План лікування</FormLabel>
                <Textarea
                    value={formDataSection.treatmentPlan || ''}
                    onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
                />
            </FormControl>

             <FormControl>
                <FormLabel>Статус пацієнта / Куди направлений</FormLabel>
                <Select
                    placeholder="Оберіть статус"
                    value={formDataSection.disposition?.status || ''}
                    onChange={(e) => handleInputChange('disposition.status', e.target.value)}
                >
                    {/* Додайте опції з constants.dispositionStatuses, якщо вони є */}
                    <option value="Виписаний">Виписаний</option>
                    <option value="Госпіталізований (Відділення)">Госпіталізований (Відділення)</option>
                    <option value="Переведений (Інша лікарня)">Переведений (Інша лікарня)</option>
                    <option value="Помер">Помер</option>
                </Select>
            </FormControl>
            {formDataSection.disposition?.status && formDataSection.disposition.status !== 'Помер' && (
                 <FormControl>
                    <FormLabel>Деталі направлення / Відділення</FormLabel>
                    <Input
                        value={formDataSection.disposition?.destinationDetails || ''}
                        onChange={(e) => handleInputChange('disposition.destinationDetails', e.target.value)}
                    />
                </FormControl>
            )}


            <FormControl>
                <FormLabel>Нотатки госпітального етапу</FormLabel>
                <Textarea
                    value={formDataSection.hospitalNotes || ''}
                    onChange={(e) => handleInputChange('hospitalNotes', e.target.value)}
                />
            </FormControl>

            {/* ... Додайте інші поля для госпітального етапу ... */}
            {/* Наприклад: secondarySurveyFindings, diagnosticTests, consultations, proceduresPerformedInHospital, medicationsInHospital, vitalSignsInHospital */}
        </VStack>
    );
}
export default HospitalCareSection;