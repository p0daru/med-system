// src/components/CasualtyCard/casualtyCardStyles.js

export const casualtyCardStyles = {
  formContainer: {
      maxWidth: "2000px",
      margin: "auto",
      p: { base: 4, md: 6 }, // Responsive padding
      borderWidth: "1px",
      borderRadius: "50px",
      boxShadow: "lg",
      // bg: "gray.300", // Slightly lighter background for contrast if needed
      color: "white",
  },
  loadingBox: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "40vh", // Ensure it takes up some space
      p: 6,
  },
  loadingSpinner: {
      size: "xl",
      thickness: "4px",
      speed: "0.65s",
      emptyColor: "gray.600",
      color: "blue.500",
      mb: 4,
  },
  loadingText: {
      fontSize: "lg",
      fontWeight: "medium",
      color: "gray.300",
  },
  fetchErrorVStack: {
      spacing: 4,
      align: "center",
      justify: "center",
      minHeight: "40vh",
      p: 6,
  },
  fetchErrorAlert: {
      status: "error",
      variant: "subtle",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      borderRadius: "md",
      maxWidth: "lg", // Limit width of alert
      bg: "red.900", // Darker red background
      color: "white",
  },
  fetchErrorAlertIcon: {
      boxSize: "40px",
      mr: 0,
      mb: 3,
  },
  fetchErrorAlertTitle: {
      mb: 1,
      fontSize: "lg",
      fontWeight: "bold",
  },
  fetchErrorAlertDescription: {
      maxWidth: "sm",
  },
  fetchErrorReturnButton: {
      colorScheme: "gray",
      mt: 4, // Add margin top
  },
  nonCriticalErrorAlert: {
      status: "warning",
      borderRadius: "md",
      mb: 4, // Margin bottom
      bg: "yellow.800", // Darker yellow
      color: "white",
  },
  nonCriticalErrorBox: {
      flex: "1",
      ml: 3, // Margin left for spacing from icon
  },
  nonCriticalErrorTitle: {
      fontWeight: "bold",
  },
  nonCriticalErrorDescription: {
      display: "block", // Ensure description takes full width
  },
  actionButtonsHStack: {
      mt: 6, // Margin top for separation
      justifyContent: "space-between", // Space out buttons/groups
      alignItems: "center",
      width: "100%",
      flexWrap: "wrap", // Allow wrapping on smaller screens
      gap: 2, // Add gap between items when wrapped
  },
  testDataButton: {
      colorScheme: "teal",
      variant: "outline",
      borderColor: "teal.400",
      color: "teal.300",
      _hover: { bg: "teal.800", color: "white" },
      _disabled: {
          borderColor: 'gray.600',
          color: 'gray.500',
          opacity: 0.6,
          cursor: 'not-allowed',
      },
  },
  clearFormButton: { // Style for the new clear button
      colorScheme: "orange",
      variant: "outline",
      borderColor: "orange.400",
      color: "orange.300",
      _hover: { bg: "orange.800", color: "white" },
      _disabled: {
          borderColor: 'gray.600',
          color: 'gray.500',
          opacity: 0.6,
          cursor: 'not-allowed',
      },
  },
  backToListButton: {
      colorScheme: "gray",
      variant: "outline",
      borderColor: "gray.500",
      color: "gray.300",
      _hover: { bg: "gray.600", color: "white" },
      _disabled: {
          borderColor: 'gray.600',
          color: 'gray.500',
          opacity: 0.6,
          cursor: 'not-allowed',
      },
  },
  submitButton: {
      colorScheme: "blue",
      _disabled: {
          bg: 'blue.800',
          color: 'gray.500',
          opacity: 0.6,
          cursor: 'not-allowed',
      },
  },
  // Add other shared styles if needed, e.g., for Accordion items/buttons
  accordionItem: {
      mb: 4,
      borderWidth: "1px",
      borderColor: "gray.600", // Darker border
      borderRadius: "30px",
      overflow: 'hidden', // Ensure corners are rounded
      bg: 'gray.750' // Slightly different bg for items? (optional)
  },
  accordionButton: {
      _hover: { bg: 'gray.600' },
      py: 3,
      px: 4,
      bg: 'gray.800', // Match form background or slightly different
  },
  accordionButtonHeading: {
      size: "md",
      fontWeight: "bold",
      color: "gray.200", // Lighter heading color
  },
  accordionPanel: {
      pb: 4,
      px: 4,
      pt: 3, // Slightly increased top padding
      borderTopWidth: "1px", // Add separator line
      borderColor: "gray.600",
      bg: 'gray.750' // Match item bg or slightly different
  },
  sectionDivider: {
      py: 3,
      borderColor: "gray.500", // Darker divider
  },
  sectionSubHeading: {
      py: 4, // Adjusted padding
      px: 0,
      size: "sm",
      fontWeight: "semibold",
      color: "gray.200", // Lighter subheading color
      mb: 2, // Add some margin bottom
  }
};

// Keep commonStyles if it's used by child components directly
// If not, consider merging relevant parts into casualtyCardStyles
export const commonStyles = {
  // Example: maybe input styles shared across sections?
  inputLabel: {
      fontSize: 'sm',
      fontWeight: 'medium',
      color: 'gray.300',
      mb: 1,
  },
  formControl: {
      mb: 4, // Standard margin bottom for form controls
  },
  // Add other common style definitions here...
};

