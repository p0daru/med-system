// src/components/CasualtyCard/TourniquetSection.jsx
import React from 'react'; // Removed useEffect, useMemo, useForm, FormProvider
// No need for RHF hooks here directly if TourniquetLimb handles registration/context
import { Box, SimpleGrid } from '@chakra-ui/react';

// Import styles, child component, and constants (assuming constants passed via props)
import { tourniqSecStyles as styles } from '../styles'; // Verify path
import TourniquetLimb from './TourniquetLimb'; // Assuming TourniquetLimb is adapted
// import { TOURNIQUET_TYPES } from '../../../constants/constants'; // Use prop instead

// REMOVE 'data' and 'setFormData' props
// ADD 'constants' prop
function TourniquetSection({ isDisabled, constants }) {

    // --- NO Local RHF Setup ---
    // --- NO Sync Effects ---

    // Get types from constants prop, provide fallback
    const tourniquetTypesList = constants?.tourniquetTypes || [];

    // --- Rendering ---
    // NO FormProvider wrapper needed here
    return (
        <Box>
            {/* The Heading is commented out in original, keeping it that way */}
            {/* <Heading size="sm" mb={3}>3. Турнікети</Heading> */}
            <SimpleGrid {...styles.grid}>
                {/* Render TourniquetLimb for each limb */}
                {/* Pass necessary props: limb name, label, isDisabled, and types list */}
                {/* TourniquetLimb component itself MUST use useFormContext() */}
                <TourniquetLimb
                    limb="rightArm"
                    label="Права рука"
                    isDisabled={isDisabled}
                    tourniquetTypesList={tourniquetTypesList}
                />
                <TourniquetLimb
                    limb="leftArm"
                    label="Ліва рука"
                    isDisabled={isDisabled}
                    tourniquetTypesList={tourniquetTypesList}
                />
                <TourniquetLimb
                    limb="rightLeg"
                    label="Права нога"
                    isDisabled={isDisabled}
                    tourniquetTypesList={tourniquetTypesList}
                />
                <TourniquetLimb
                    limb="leftLeg"
                    label="Ліва нога"
                    isDisabled={isDisabled}
                    tourniquetTypesList={tourniquetTypesList}
                />
            </SimpleGrid>
        </Box>
    );
}

export default TourniquetSection;