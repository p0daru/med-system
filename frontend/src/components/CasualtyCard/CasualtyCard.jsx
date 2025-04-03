// src/components/CasualtyCard/CasualtyCard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Heading, VStack, Divider, Button, useToast, Spinner, Text, Alert, AlertIcon, AlertTitle, AlertDescription, HStack
} from '@chakra-ui/react';
import { QuestionOutlineIcon } from '@chakra-ui/icons'; // Іконка для кнопки тестування

// Import Child Components
// PatientDataSection and TourniquetSection now import constants directly
import PatientDataSection from './PatientDataSection';
import InjuryMechanismSection from './InjuryMechanismSection';
import TourniquetSection from './TourniquetSection';
import VitalSignsSection from './VitalSignsSection';
import ProvidedAidSection from './ProvidedAidSection';
import MedicationsSection from './MedicationsSection';
import AdministrativeDataSection from './AdministrativeDataSection';

// Import API & Utils
import { createInjured, getInjuredById, updateInjured } from '../../services/injuredApi';
import constants from '../../constants/constants.json';
// --- Імпортуємо генератор тестових даних ---
import { generateCasualtyCardData } from '../../utils/mockDataGenerator'; // Перевірте шлях

// --- Helper Functions ---
const getISOFromDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    try {
        // Ensure time has seconds for Date constructor consistency, pad if needed
        const timeParts = timeStr.split(':');
        const hours = timeParts[0]?.padStart(2, '0') || '00';
        const minutes = timeParts[1]?.padStart(2, '0') || '00';
        const seconds = '00'; // Assume 00 seconds
        const paddedTime = `${hours}:${minutes}:${seconds}`;

        const d = new Date(`${dateStr}T${paddedTime}`);
        // Check if the date is valid
        if (isNaN(d.getTime())) {
             console.error("Invalid date created:", `${dateStr}T${paddedTime}`);
             return null;
        }
        return d.toISOString();
    } catch (e) {
        console.error("Error creating ISO date from:", dateStr, timeStr, e);
        return null;
    }
};

const getDateAndTimeFromISO = (isoString) => {
    if (!isoString) return { date: '', time: '' };
    try {
        const dateObj = new Date(isoString);
        if (isNaN(dateObj.getTime())) throw new Error('Invalid Date object from ISO string');
        const date = dateObj.toISOString().split('T')[0];
        // Format time as HH:MM
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        return { date, time };
    } catch (e) {
        console.error("Error parsing ISO date:", isoString, e);
        return { date: '', time: '' };
    }
};


// --- Initial State ---
const defaultKnownAllergies = Object.fromEntries(
    constants.commonAllergens.map(a => [a, false])
);

const initialDataState = {
     // Section 1: Patient Data
     individualNumber: '', // Usually assigned by backend on create
     patientFullName: '',
     last4SSN: '',
     gender: '',
     injuryDate: '',
     injuryTime: '',
     branchOfService: '',
     branchOfServiceOther: '', // For "Інше" branch
     unit: '',
     allergies: {
        known: { ...defaultKnownAllergies },
        other: '',
        nka: false
    },
     evacuationPriority: 'Пріоритетна', // Default value

     // Section 2: Injury Info
     mechanismOfInjury: [],
     mechanismOfInjuryOther: '',
     injuryDescription: '',

     // Section 3: Tourniquets (updated structure)
     tourniquets: {
         rightArm: { time: '', type: '', typeOther: '' },
         leftArm:  { time: '', type: '', typeOther: '' },
         rightLeg: { time: '', type: '', typeOther: '' },
         leftLeg:  { time: '', type: '', typeOther: '' }
     },

     // Section 4: Vital Signs
     vitalSigns: [], // Array of { time, pulse, bp, rr, spO2, avpu, pain, id }

     // Section 5: Provided Aid
     aidCirculation: {
         tourniquetJunctional: false,
         tourniquetTruncal: false,
         dressingHemostatic: false,
         dressingPressure: false,
         dressingOther: false
     },
     aidAirway: {
         intact: false,
         npa: false,
         cric: false,
         etTube: false,
         supraglottic: false
     },
     aidBreathing: {
         o2: false,
         needleDecompression: false,
         chestTube: false,
         occlusiveDressing: false
     },
     fluidsGiven: [], // Array of { time, name, amount, route, id }

     // Section 6: Medications & Other Aid
     medicationsGiven: [], // Array of { time, name, dose, route, id, nameOther }
     aidHypothermiaOther: {
         combatPillPack: false,
         eyeShieldRight: false,
         eyeShieldLeft: false,
         splinting: false,
         hypothermiaPrevention: false,
         hypothermiaPreventionType: '',
         hypothermiaPreventionTypeOther: ''
     },

     // Section 7: Notes
     notes: '',

     // Section 8: Provider Data
     providerFullName: '',
     providerLast4SSN: '',

     // --- API/Backend Fields (not directly in form, but needed for submission/loading) ---
     injuryDateTime: null, // Stored as ISO string by API
     recordedBy: '', // Might be set on backend or based on logged-in user
};


// --- Main Component ---
function CasualtyCard() {
    const { id } = useParams(); // Get ID from URL for editing
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const toast = useToast();

    const [formData, setFormData] = useState(initialDataState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(isEditMode); // Only load if editing
    const [fetchError, setFetchError] = useState(null);

    const isDisabled = isSubmitting || isLoadingData; // Disable form while loading or submitting

    // --- Data Population Logic ---
    const populateForm = useCallback((apiData) => {
        if (!apiData) {
            setFormData(initialDataState); // Reset to initial state if no data (e.g., new card)
            return;
        }

        // Convert ISO injuryDateTime back to date and time for the form inputs
        const { date: injDate, time: injTime } = getDateAndTimeFromISO(apiData.injuryDateTime);
        const defaultVitalSignEntry = { time: '', pulse: '', bp: '', rr: '', spO2: '', avpu: '', pain: '' };

        // --- Populate Allergies ---
        const apiAllergies = apiData.allergies || {};
        const populatedKnownAllergies = { ...initialDataState.allergies.known }; // Start with default keys
        if (typeof apiAllergies.known === 'object' && apiAllergies.known !== null) {
            Object.keys(apiAllergies.known).forEach(allergen => {
                if (allergen in populatedKnownAllergies) { // Check if the key exists in our list
                    populatedKnownAllergies[allergen] = !!apiAllergies.known[allergen];
                }
                // Note: Allergens from API not in our standard list won't be checked,
                // but should be present in apiAllergies.other if saved correctly.
            });
        }
        const populatedAllergies = {
             known: populatedKnownAllergies,
             other: apiAllergies.other ?? '',
             nka: apiAllergies.nka ?? false,
        };

        // --- Populate Branch of Service (handling "Інше") ---
        let populatedBranchOfService = apiData.branchOfService || '';
        let populatedBranchOfServiceOther = '';
        if (populatedBranchOfService && !constants.branchesOfService.includes(populatedBranchOfService)) {
             populatedBranchOfServiceOther = populatedBranchOfService; // The actual value goes here
             populatedBranchOfService = 'Інше';          // Set Select to "Інше"
        }

        // --- Populate Tourniquets (handling "Інше" for type) ---
        const populatedTourniquets = { ...initialDataState.tourniquets }; // Start with default structure
        const apiTourniquets = apiData.tourniquets || {};
        for (const limb of ['rightArm', 'leftArm', 'rightLeg', 'leftLeg']) {
            const limbData = apiTourniquets[limb] || {};
            let populatedType = limbData.type || '';
            let populatedTypeOther = '';
            if (populatedType && !constants.tourniquetTypes.includes(populatedType)) {
                populatedTypeOther = populatedType; // The actual value
                populatedType = 'Інше';          // Set Select to "Інше"
            }
            populatedTourniquets[limb] = {
                time: limbData.time || '',
                type: populatedType,
                typeOther: populatedTypeOther
            };
        }

        // --- Merge data ---
        // Start with initial state to ensure all fields exist, then merge API data
        const mergedData = {
            ...initialDataState,
            ...apiData, // Overwrite with fetched data
            // Overwrite specific fields handled above
            injuryDate: injDate,
            injuryTime: injTime,
            allergies: populatedAllergies,
            branchOfService: populatedBranchOfService,
            branchOfServiceOther: populatedBranchOfServiceOther,
            tourniquets: populatedTourniquets,
            // Ensure nested objects/arrays exist and add UI IDs if needed
            aidCirculation: { ...initialDataState.aidCirculation, ...(apiData.aidCirculation ?? {}) },
            aidAirway: { ...initialDataState.aidAirway, ...(apiData.aidAirway ?? {}) },
            aidBreathing: { ...initialDataState.aidBreathing, ...(apiData.aidBreathing ?? {}) },
            aidHypothermiaOther: { ...initialDataState.aidHypothermiaOther, ...(apiData.aidHypothermiaOther ?? {}) },
            // Ensure arrays are arrays and add unique IDs for list rendering in child components
            vitalSigns: (Array.isArray(apiData.vitalSigns) ? apiData.vitalSigns : []).map(vs => ({ ...defaultVitalSignEntry, ...vs, id: crypto.randomUUID() })),
            fluidsGiven: (Array.isArray(apiData.fluidsGiven) ? apiData.fluidsGiven : []).map(f => ({ ...f, id: crypto.randomUUID() })),
            medicationsGiven: (Array.isArray(apiData.medicationsGiven) ? apiData.medicationsGiven : []).map(m => ({ ...m, id: crypto.randomUUID() })),
        };

        // Clean up fields that shouldn't be in formData state
        delete mergedData.injuryDateTime; // Handled by injuryDate/Time
        delete mergedData._id; // API metadata
        delete mergedData.__v; // API metadata
        delete mergedData.id; // API metadata (if present)

        setFormData(mergedData);
    }, []); // No dependencies as initialDataState and constants are stable

    // --- Effect: Load Data on Edit ---
    useEffect(() => {
        if (isEditMode && id) {
            setIsLoadingData(true);
            setFetchError(null);
            getInjuredById(id)
                .then(data => {
                    if (!data) {
                         // Handle case where ID exists but no data is found
                         console.error(`No data found for casualty ID ${id}`);
                         throw new Error(`Не знайдено даних для картки з ID ${id}. Можливо, її було видалено.`);
                    }
                    console.log("Fetched data for edit:", data);
                    populateForm(data); // Populate the form with fetched data
                    // Store the fetched individualNumber if available (often generated on creation)
                    if (data.individualNumber) {
                         setFormData(prev => ({ ...prev, individualNumber: data.individualNumber }));
                    }
                })
                .catch(err => {
                    console.error("Error loading casualty data:", err);
                    setFetchError(err.message || 'Не вдалося завантажити дані картки.');
                    // Optionally navigate away or show a persistent error
                    // navigate('/'); // Example: redirect on fatal error
                })
                .finally(() => setIsLoadingData(false));
        } else {
            // If creating a new card, ensure form is reset
            populateForm(null);
        }
     }, [id, isEditMode, populateForm, navigate]); // Added navigate to dependencies

    // --- Save Handler ---
    const handleSave = async () => {
        setIsSubmitting(true);

        // --- Basic Validation ---
        if (!formData.patientFullName && !formData.last4SSN) {
            toast({ title: 'Помилка валідації', description: 'Вкажіть ПІБ або останні 4 цифри НСС.', status: 'warning', duration: 4000, isClosable: true });
            setIsSubmitting(false); return;
        }
        if (!formData.injuryDate || !formData.injuryTime) {
            toast({ title: 'Помилка валідації', description: 'Вкажіть дату та час поранення.', status: 'warning', duration: 4000, isClosable: true });
            setIsSubmitting(false); return;
        }
        // --- "Інше" Validation ---
        if (formData.branchOfService === 'Інше' && !formData.branchOfServiceOther?.trim()) {
            toast({ title: 'Помилка валідації', description: 'Будь ласка, вкажіть рід військ/службу в полі "Інше".', status: 'warning', duration: 4000, isClosable: true });
            setIsSubmitting(false); return;
        }
        let tourniquetValidationError = false;
        for (const limb in formData.tourniquets) {
            const limbData = formData.tourniquets[limb];
            if (limbData.type === 'Інше' && !limbData.typeOther?.trim()) {
                // Find the label for the limb (this assumes a consistent structure or requires passing labels back)
                const limbLabels = { rightArm: "Права рука", leftArm: "Ліва рука", rightLeg: "Права нога", leftLeg: "Ліва нога" };
                toast({
                    title: 'Помилка валідації',
                    description: `Будь ласка, вкажіть тип турнікета в полі "Інше" для кінцівки "${limbLabels[limb] || limb}".`,
                    status: 'warning',
                    duration: 5000,
                    isClosable: true
                });
                tourniquetValidationError = true;
                break;
            }
        }
        if (tourniquetValidationError) {
            setIsSubmitting(false); return;
        }
        // Add validation for other "Інше" fields if necessary (meds, fluids, hypothermia)

        // --- Prepare Data for Submission ---
        const injuryDateTimeISO = getISOFromDateTime(formData.injuryDate, formData.injuryTime);
        if (!injuryDateTimeISO && (formData.injuryDate || formData.injuryTime)) {
             toast({ title: 'Помилка дати/часу', description: 'Некоректний формат дати або часу поранення.', status: 'error', duration: 5000, isClosable: true });
             setIsSubmitting(false); return;
        }

        // Prepare allergies
        const allergiesToSubmit = {
            known: {}, // Start empty, add only true values unless NKA
            other: formData.allergies.other?.trim() || '',
            nka: formData.allergies.nka || false
        };
        if (allergiesToSubmit.nka) {
            allergiesToSubmit.known = {}; // Ensure known is empty if NKA is true
            allergiesToSubmit.other = ''; // Ensure other is empty if NKA is true
        } else {
            // Add only checked known allergies
            Object.keys(formData.allergies.known).forEach(key => {
                if (formData.allergies.known[key]) {
                    allergiesToSubmit.known[key] = true;
                }
            });
        }

        // Prepare branch of service
        const finalBranchOfService = formData.branchOfService === 'Інше'
            ? formData.branchOfServiceOther.trim() // Use the trimmed value from 'Other' field
            : formData.branchOfService;

        // Prepare tourniquets
        const tourniquetsToSubmit = {};
        for (const limb in formData.tourniquets) {
            const { type, typeOther, time } = formData.tourniquets[limb];
             // Only include the limb if time or type is specified
             if (time || type) {
                 tourniquetsToSubmit[limb] = {
                     time: time || '',
                     type: type === 'Інше' ? (typeOther?.trim() || 'Інше') : (type || '') // Use trimmed 'other' or the selected type
                 };
             }
        }

        // Prepare medications (handle 'Інше...')
        const medicationsToSubmit = formData.medicationsGiven
            .filter(med => med.name || med.dose || med.route) // Filter out completely empty entries
            .map(({ id, nameOther, ...rest }) => ({
                 ...rest,
                 name: rest.name === 'Інше...' ? (nameOther?.trim() || 'Інше...') : rest.name,
            }));

        // Prepare fluids (handle 'Інше...') - Assuming similar structure if needed
        // Example: Check if fluids have an 'Інше...' option and 'nameOther' field
         const fluidsToSubmit = formData.fluidsGiven
            .filter(fluid => fluid.name || fluid.amount || fluid.route) // Filter out empty entries
            .map(({ id, nameOther, ...rest }) => ({ // Assuming nameOther exists for fluids too
                ...rest,
                name: rest.name === 'Інше...' ? (nameOther?.trim() || 'Інше...') : rest.name,
            }));


        // Prepare hypothermia (handle 'Інше...')
        const hypothermiaType = formData.aidHypothermiaOther.hypothermiaPreventionType;
        const finalHypothermiaType = hypothermiaType === 'Інше...'
            ? (formData.aidHypothermiaOther.hypothermiaPreventionTypeOther?.trim() || 'Інше...')
            : hypothermiaType;


        // --- Construct final submission object ---
        const submissionData = {
            // Include all top-level fields from formData initially
            ...formData,
            // Overwrite fields needing specific preparation
            injuryDateTime: injuryDateTimeISO,
            allergies: allergiesToSubmit,
            branchOfService: finalBranchOfService,
            tourniquets: tourniquetsToSubmit,
            medicationsGiven: medicationsToSubmit,
             fluidsGiven: fluidsToSubmit, // Include prepared fluids
            // Prepare nested aidHypothermiaOther correctly
             aidHypothermiaOther: {
                 ...formData.aidHypothermiaOther,
                 hypothermiaPreventionType: finalHypothermiaType,
                 hypothermiaPreventionTypeOther: undefined // Remove the temporary 'other' field
             },
             // Clean vital signs (remove ID, filter empty)
            vitalSigns: formData.vitalSigns
                .map(({ id, ...rest }) => rest) // Remove UI ID
                .filter(vs => vs.time || vs.pulse || vs.bp || vs.rr || vs.spO2 || vs.avpu || vs.pain), // Keep only if at least one value exists

            // --- Remove UI-only or temporary fields ---
            injuryDate: undefined,
            injuryTime: undefined,
            individualNumber: undefined, // Let backend handle this if it's assigned server-side
            branchOfServiceOther: undefined, // Temporary field
            // Note: tourniquet typeOther fields are handled during tourniquetsToSubmit preparation
            // Note: medication/fluid nameOther fields are handled during their preparation
        };

        // Final cleanup: remove any top-level undefined keys
        Object.keys(submissionData).forEach(key => {
            if (submissionData[key] === undefined) {
                delete submissionData[key];
            }
            // Optional: remove empty strings or empty arrays if backend prefers null/absence
            // if (submissionData[key] === '') delete submissionData[key];
             // if (Array.isArray(submissionData[key]) && submissionData[key].length === 0) delete submissionData[key];
        });
        // Remove the 'id' field if it exists at the top level (might come from apiData merge)
        delete submissionData.id;

        console.log(`Submitting data (${isEditMode ? 'Update ID: ' + id : 'Create'}):`, JSON.stringify(submissionData, null, 2)); // Log formatted data

        // --- API Call ---
        try {
            let responseData;
            const successTitle = `Картку ${isEditMode ? 'оновлено' : 'створено'}`;

            if (isEditMode) {
                responseData = await updateInjured(id, submissionData);
            } else {
                responseData = await createInjured(submissionData);
            }

            toast({ title: successTitle, status: 'success', duration: 3000, isClosable: true });
            console.log("Server response:", responseData);

            // --- Post-Save Actions ---
            if (!isEditMode && responseData?._id) {
                // If created successfully and received an ID, navigate to the new card's edit page
                navigate(`/casualty/${responseData._id}`);
                // No need to call populateForm here as the page will reload/remount
            } else if (isEditMode) {
                // If updated, re-fetch the data to show the latest version
                // Adding a small delay can sometimes help ensure the server has processed the update
                setTimeout(() => {
                     getInjuredById(id).then(updatedData => {
                        if (updatedData) {
                           populateForm(updatedData);
                           // Update individualNumber if it changed/was added
                           if (updatedData.individualNumber) {
                               setFormData(prev => ({ ...prev, individualNumber: updatedData.individualNumber }));
                           }
                        } else {
                           // Handle case where data is unexpectedly missing after update
                           throw new Error("Дані не знайдено після оновлення.");
                        }
                     }).catch(err => {
                         console.error("Error re-fetching data after update:", err);
                         setFetchError('Помилка отримання оновлених даних. Оновіть сторінку.');
                     });
                 }, 150); // Small delay
            } else {
                // If created but no ID received (error case?), reset the form
                populateForm(null);
            }
        } catch (error) {
            console.error(`Error during ${isEditMode ? 'update' : 'create'}:`, error);
            const errorDesc = error.response?.data?.message || // Check for specific API error message
                              error.message || // General error message
                              `Не вдалося ${isEditMode ? 'оновити' : 'створити'} картку.`;
            toast({
                title: `Помилка ${isEditMode ? 'оновлення' : 'створення'}`,
                description: errorDesc,
                status: 'error',
                duration: 7000, // Longer duration for errors
                isClosable: true
            });
        } finally {
             // Ensure submission state is reset even after delay
             setTimeout(() => setIsSubmitting(false), 200);
        }
    };

    // --- Обробник для кнопки заповнення тестовими даними ---
    const handleFillWithTestData = useCallback(() => {
        if (isDisabled) return; // Не заповнювати, якщо форма заблокована
        console.log("Generating and setting test data...");
        const mockData = generateCasualtyCardData();
         // Переконуємось, що основні структури існують перед злиттям
         const currentData = { ...initialDataState, ...formData };
         const mergedData = {
             ...currentData, // Беремо поточні дані як базу
            ...mockData // Перезаписуємо згенерованими даними
        };
        setFormData(mergedData);
        toast({
            title: "Форму заповнено тестовими даними.",
            status: "info",
            duration: 2000,
            isClosable: true,
        });
    }, [setFormData, isDisabled, toast]); // Додаємо залежності


    // --- Render Logic ---
    if (isLoadingData) {
        return (
            <Box textAlign="center" mt="20">
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text mt={4} fontSize="lg" color="gray.600">Завантаження даних картки...</Text>
            </Box>
        );
    }

     // Show error primarily when editing, as creation starts with a blank slate
     // An error during initial load in edit mode is critical
    if (fetchError && isEditMode && !formData._id) { // Check if formData is populated as fallback
         return (
             <VStack spacing={4} align="center" mt={10}>
                 <Alert
                     status="error"
                     variant="subtle"
                     flexDirection="column"
                     alignItems="center"
                     justifyContent="center"
                     textAlign="center"
                     height="200px"
                     borderRadius="md"
                 >
                     <AlertIcon boxSize="40px" mr={0} />
                     <AlertTitle mt={4} mb={1} fontSize="lg">Помилка завантаження</AlertTitle>
                     <AlertDescription maxWidth="sm">{fetchError}</AlertDescription>
                 </Alert>
                 <Button onClick={() => navigate('/')} colorScheme="gray" mt={4}>
                     Повернутися до списку
                 </Button>
             </VStack>
         );
     }


    return (
        <Box
            as="form"
            onSubmit={(e) => { e.preventDefault(); handleSave(); }} // Handle form submission
            borderWidth="1px"
            borderRadius="lg"
            p={{ base: 3, sm: 4, md: 6 }} // Responsive padding
            boxShadow="md"
            mb={10} // Margin bottom
        >
            {/* --- Header --- */}
            <Heading as="h1" size="lg" mb={4} textAlign="center" color="gray.700">
                 {isEditMode ? 'Редагування Картки Пораненого' : 'Нова Картка Пораненого'}
                 {/* Display Card Number if available (usually after creation/on edit) */}
                 {isEditMode && formData.individualNumber && (
                     <Text fontSize="md" color="gray.500" mt={1} fontWeight="medium">
                         Номер картки: {formData.individualNumber}
                     </Text>
                 )}
            </Heading>

            {/* Display non-critical fetch error during edit (e.g., re-fetch after update failed) */}
             {fetchError && isEditMode && (
                 <Alert status="warning" mb={4} borderRadius="md" variant="left-accent">
                     <AlertIcon />
                     <Box flex="1">
                         <AlertTitle fontSize="sm">Попередження</AlertTitle>
                         <AlertDescription display="block" fontSize="xs">{fetchError}</AlertDescription>
                     </Box>
                 </Alert>
             )}

            {/* --- Form Sections --- */}
            <VStack spacing={5} divider={<Divider borderColor="gray.200" />} align="stretch">
                {/* --- Передача пропсів до дочірніх компонентів --- */}
                <PatientDataSection data={formData} setFormData={setFormData} isDisabled={isDisabled} />
                <InjuryMechanismSection data={formData} setFormData={setFormData} isDisabled={isDisabled} />
                 {/* Додайте пропси до InjuryMechanismSection, якщо потрібно константи механізмів */}
                <TourniquetSection data={formData} setFormData={setFormData} isDisabled={isDisabled} />
                <VitalSignsSection data={formData} setFormData={setFormData} isDisabled={isDisabled} />
                <ProvidedAidSection
                    data={formData} setFormData={setFormData} isDisabled={isDisabled}
                    FLUID_ROUTES={constants.fluidRoutes}
                    COMMON_FLUIDS={constants.commonFluids}
                />
                <MedicationsSection
                    data={formData} setFormData={setFormData} isDisabled={isDisabled}
                    MED_ROUTES={constants.medRoutes}
                    COMMON_MEDICATIONS={constants.commonMedications}
                />
                <AdministrativeDataSection data={formData} setFormData={setFormData} isDisabled={isDisabled}/>

                {/* --- Action Buttons --- */}
                <HStack pt={4} spacing={4} justify="space-between"> {/* Змінено justify */}
                     {/* --- Кнопка для тестових даних --- */}
                     <Button
                        leftIcon={<QuestionOutlineIcon />}
                        onClick={handleFillWithTestData}
                        isDisabled={isDisabled || isEditMode} // Блокуємо при завантаженні/збереженні та в режимі редагування (щоб випадково не перезаписати)
                        variant="outline"
                        colorScheme="teal"
                        size="sm" // Менший розмір для допоміжної кнопки
                     >
                         Тестові дані
                     </Button>
                    <HStack> {/* Групуємо основні кнопки */}
                        <Button
                            onClick={() => navigate('/')}
                            isDisabled={isSubmitting}
                            variant="outline"
                            colorScheme="gray"
                            size="md"
                        >
                            До списку карток
                        </Button>
                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={isSubmitting}
                            loadingText={isEditMode ? 'Оновлення...' : 'Збереження...'}
                            isDisabled={isDisabled}
                            size="md"
                        >
                            {isEditMode ? 'Оновити Картку' : 'Зберегти Картку'}
                        </Button>
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    );
}

export default CasualtyCard;