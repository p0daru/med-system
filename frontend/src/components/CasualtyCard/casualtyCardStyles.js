// src/styles/casualtyCardStyles.js

// Common styles reused across components
export const commonStyles = {
    // Style for disabled input fields (timestamps, recordedBy)
    disabledInput: {
      bg: "gray.100",
      color: "gray.700",
      cursor: "not-allowed",
      opacity: 0.8,
    },
    // Style for the red asterisk indicating required fields
    requiredAsterisk: {
      as: "span",
      color: "red.500",
      ml: 1, // Optional: add a small margin
    },
    // Common FormLabel style
    formLabelSm: {
      fontSize: "sm",
      mb: 1,
    },
    formLabelXs: {
      fontSize: "xs",
      mb: 0,
    },
    // Common Input/Select size
    inputSm: {
      size: "sm",
    },
    inputXs: {
      size: "xs",
    },
    // Common heading size
    headingSm: {
      size: "sm",
      mb: 2,
    },
    headingXs: {
      size: "xs",
      mb: 2,
    },
    // Common container box for sections within forms
    sectionBox: {
      borderWidth: 1,
      borderRadius: "md",
      p: 4,
      borderColor: "gray.200",
    },
    // Divider style
    divider: {
      my: 4,
      borderColor: "gray.200",
    },
    // Style for delete IconButtons
    deleteButton: {
      size:"xs",
      colorScheme:"red",
      variant:"ghost",
    },
      // Style for add IconButtons/Buttons
    addButtonXs: {
      variant:"outline",
      size:"xs",
    },
      // Style for setting current time
    currentTimeButton: {
       size:"xs",
       variant:"outline",
    },
     // Tooltip style
     tooltipXs: {
      fontSize:"xs",
    },
  };
  
  // Styles for CasualtyCard.jsx
  export const casualtyCardStyles = {
    loadingBox: {
      textAlign: "center",
      mt: "20",
    },
    loadingSpinner: {
      size: "xl",
      color: "blue.500",
      thickness: "4px",
    },
    loadingText: {
      mt: 4,
      fontSize: "lg",
      color: "gray.600",
    },
    fetchErrorVStack: {
      spacing: 4,
      align: "center",
      mt: 10,
    },
    fetchErrorAlert: {
      status: "error",
      variant: "subtle",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      height: "200px",
      borderRadius: "md",
    },
    fetchErrorAlertIcon: {
      boxSize: "40px",
      mr: 0,
    },
    fetchErrorAlertTitle: {
      mt: 4,
      mb: 1,
      fontSize: "lg",
    },
    fetchErrorAlertDescription: {
      maxWidth: "sm",
    },
    fetchErrorReturnButton: {
      colorScheme: "gray",
      mt: 4,
    },
    formContainer: {
      borderWidth: "1px",
      borderRadius: "lg",
      p: { base: 3, sm: 4, md: 6 }, // Responsive padding
      boxShadow: "md",
      mb: 10, // Margin bottom
    },
    nonCriticalErrorAlert: {
      status: "warning",
      mb: 4,
      borderRadius: "md",
      variant: "left-accent",
    },
    nonCriticalErrorBox: {
      flex: "1",
    },
    nonCriticalErrorTitle: {
      fontSize: "sm",
    },
    nonCriticalErrorDescription: {
      display: "block",
      fontSize: "xs",
    },
    formSectionsVStack: {
      spacing: 5,
      align: "stretch",
    },
    formSectionsDivider: {
       borderColor:"gray.200",
    },
    actionButtonsHStack: {
      pt: 4,
      spacing: 4,
      justify: "space-between",
    },
    testDataButton: {
      variant: "outline",
      colorScheme: "teal",
      size: "sm",
    },
    backToListButton: {
      variant: "outline",
      colorScheme: "gray",
      size: "md",
    },
    submitButton: {
      type: "submit",
      colorScheme: "blue",
      size: "md",
    },
  };
  
  // Styles for AdministrativeDataSection.jsx
  export const adminDataStyles = {
    notesControl: {
      id: "notes",
      mb: 6,
    },
    section8Heading: {
      ...commonStyles.headingSm, // Reuse common style
    },
    providerGrid: {
      columns: { base: 1, md: 2 },
      spacing: 4,
      mb: 6,
    },
    adminInfoHeading: {
       ...commonStyles.headingSm, // Reuse common style
    },
    adminInfoVStack: {
      spacing: 4,
      align: "stretch",
    },
    timestampsGrid: {
      columns: { base: 1, md: 2 },
      spacing: 4,
    },
    // Combined styles for various labels in this section
    label: {
      ...commonStyles.formLabelSm, // Reuse common style
    },
  };
  
  // Styles for InjuryMechanismSection.jsx
  export const injuryMechanismStyles = {
    section2Heading: {
      size: "md",
      mb: 4,
    },
    mainVStack: {
      align: "stretch",
      spacing: 4,
    },
    mechanismLabel: {
      fontSize: "sm",
      fontWeight: "bold",
    },
    checkboxStack: {
      spacing: [1, 3],
      direction: ['column', 'row'],
      wrap: "wrap",
    },
    otherMechanismLabel: {
      fontSize: "sm",
    },
     // injuryDescriptionLabel: { // If uncommented
     //   fontSize: "sm",
     //   fontWeight: "bold",
     // },
  };
  
  // Styles for MedicationsSection.jsx
  export const medicationsStyles = {
    section6Container: {
       mb:4,
    },
    headingHStack: {
       justify:"space-between",
       mb:2,
    },
    section6Heading: {
       ...commonStyles.headingSm,
    },
    addMedButton: {
       ...commonStyles.addButtonXs, // Reuse common style
       colorScheme:"purple",
    },
    medListVStack: {
       spacing:3,
       align:"stretch",
    },
    noEntriesText: {
       color:"gray.500",
       fontSize:"sm",
       textAlign:"center",
       py:2,
    },
    medRowBox: {
       borderWidth:1,
       borderRadius:"md",
       p:2,
       borderColor:"gray.100",
    },
    medFieldsGrid: {
       columns:{ base: 2, md: 5 },
       spacing:2,
       alignItems:"flex-end",
    },
    timeInputHStack: {
        spacing:1,
    },
    otherMedNameControl: {
      mt:2,
    },
    sectionHEDivider: {
       ...commonStyles.divider, // Reuse common style
    },
    sectionHEContainer: {
       mt:2,
    },
    sectionHEHeading: {
       ...commonStyles.headingXs,
    },
    heCheckboxesGrid: {
        columns:{ base: 2, md: 3 },
        spacingX:4,
        spacingY:3,
        alignItems:"start",
    },
    hypoPreventionVStack: {
       align:"stretch",
       spacing:1.5,
    },
  };
  
  // Styles for PatientDataSection.jsx
  export const patientDataStyles = {
    section1Heading: {
      size: "sm",
      mb: 3,
      borderBottomWidth: 1,
      pb: 1,
      borderColor: "gray.200",
    },
    patientInfoGrid: {
      columns: { base: 1, sm: 2, md: 3 },
      spacing: 4,
      mb: 4,
    },
    genderRadioStack: {
      direction: 'row',
      spacing: 4,
    },
    allergiesControl: {
       gridColumn:"1 / -1",
    },
    allergiesLabel: {
       fontSize:"md",
       mb:2,
       fontWeight:"medium",
    },
    allergiesContainerBox: {
       ...commonStyles.sectionBox, // Reuse common style
    },
    allergiesVStack: {
       align:"stretch",
       spacing:3,
    },
    nkaCheckbox: {
       colorScheme:"green",
       size:"md",
    },
    nkaLabelText: {
       fontWeight:"bold",
       fontSize:"sm",
    },
    knownAllergiesLabelText: {
       fontSize:"sm",
       fontWeight:"medium",
       // color handled conditionally in component
    },
    knownAllergiesBox: {
        pl:2,
    },
    knownAllergensGrid: {
       columns:{ base: 2, sm: 3, md: 4, lg: 5 },
       spacingX:4,
       spacingY:1.5,
    },
    knownAllergenCheckbox: {
       size:"sm",
    },
    otherAllergiesTextarea: {
       size:"sm",
       rows:2,
       mt:1,
    },
     // Combined styles for various labels in this section
     label: {
      ...commonStyles.formLabelSm, // Reuse common style
    },
  };
  
  // Styles for ProvidedAidSection.jsx
  export const providedAidStyles = {
    section5Heading: {
       size: "sm",
       mb: 3,
    },
    marchSectionBox: {
       mb:3,
    },
    circulationHeading: {
       ...commonStyles.headingXs,
       color:"red.600",
    },
    airwayHeading: {
       ...commonStyles.headingXs,
       color:"orange.500",
    },
    breathingHeading: {
      ...commonStyles.headingXs,
      color:"blue.500",
    },
    marchCheckboxGrid: {
        columns:{ base: 2, md: 3 },
        spacing:3,
    },
    marchDivider: {
       my:3,
       borderColor:"gray.200",
    },
    fluidsHeadingHStack: {
      justify:"space-between",
      mb:2,
    },
    fluidsHeading: { // Specific heading for Fluids/Blood subsection if needed
       ...commonStyles.headingXs,
       color:"red.600", // Matches Circulation color
    },
    addFluidButton: {
       ...commonStyles.addButtonXs,
       colorScheme:"pink",
    },
    fluidListVStack: {
       spacing:3,
       align:"stretch",
    },
     noEntriesText: { // Same as in Meds
       color:"gray.500",
       fontSize:"sm",
       textAlign:"center",
       py:2,
    },
     fluidRowBox: { // Same structure as Meds
       borderWidth:1,
       borderRadius:"md",
       p:2,
       borderColor:"gray.100",
    },
    fluidFieldsGrid: { // Same structure as Meds
       columns:{ base: 2, md: 5 },
       spacing:2,
       alignItems:"flex-end",
    },
     timeInputHStack: { // Same as Meds
        spacing:1,
    },
      otherFluidNameControl: { // Same as Meds
      mt:2,
    },
  };
  
  // Styles for TourniquetSection.jsx
  export const tourniquetStyles = {
    // Note: Section number updated to 3 based on overall structure
    section3Heading: {
      size: "sm",
      mb: 3,
    },
    limbsGrid: {
      columns: { base: 1, sm: 2, md: 4 },
      spacing: 4,
    },
    // Styles for the TourniquetLimb sub-component
    limbContainer: {
      borderWidth: 1,
      p: 3,
      borderRadius: "md",
    },
    limbLabel: {
      fontWeight: "bold",
      mb: 2,
    },
    limbFormControl: {
      mb: 2,
    },
    limbLabelXs: { // For Type/Time labels
      ...commonStyles.formLabelXs,
    },
  };
  
  // Styles for VitalSignsSection.jsx
  export const vitalSignsStyles = {
    // Note: Section number assumed to be 4 based on overall structure
    section4Heading: {
      size: "sm",
       // mb handled by HStack
    },
    headingHStack: {
       justify:"space-between",
       mb:2,
    },
    addVitalButton: {
      ...commonStyles.addButtonXs,
       colorScheme:"teal",
    },
    vitalListVStack: {
       spacing:3,
       align:"stretch",
       // divider handled inline
    },
    noEntriesText: { // Same as in Meds/Fluids
       color:"gray.500",
       fontSize:"sm",
       textAlign:"center",
       p:2,
    },
    vitalRowBox: {
       py:2, // Padding top/bottom for spacing between entries
    },
    vitalFieldsGrid: {
       columns:{ base: 2, sm: 4, md: 8 },
       spacing:2,
       alignItems:"center",
    },
    timeInputHStack: { // Same as Meds/Fluids
        spacing:1,
    },
    vitalLabel: { // For Pulse, BP, etc.
      ...commonStyles.formLabelXs,
      ml: 1, // Specific margin for these labels
    },
    deleteButtonBox: {
       textAlign:"right",
       alignSelf:"end",
       pb:1, // Align button better with inputs
       // gridColumn handled inline
    },
  };