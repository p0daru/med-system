// frontend/src/config/theme.js
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// --- 1. Define New Color Palette ---
const colors = {
  // Primary teal/blue-green
  primary: {
    50: '#E0F7F7',
    100: '#B3ECEC',
    200: '#80E0E0',
    300: '#4DD5D5',
    400: '#26CBCB',
    500: '#00C2C2', // Base - Adjust this hex code as needed
    600: '#00AEAE',
    700: '#009393',
    800: '#007979',
    900: '#005F5F',
  },
  // Accent green (for Pulse card)
  accentGreen: {
    50: '#E6F5E8',
    100: '#C1E6C7',
    200: '#9BD7A5',
    300: '#74C884',
    400: '#4DB962',
    500: '#34B4B4', // Match the specific green #34B4B4
    600: '#289E4A',
    700: '#1F883D',
    800: '#167231',
    900: '#0E5C24',
  },
  // Background and Surface Colors
  bg: {
    light: '#F8F9FA', // Very light gray for body background
    dark: '#1A202C', // Standard dark
    cardLight: '#FFFFFF', // White cards in light mode
    cardDark: '#2D3748', // Darker cards in dark mode
  },
  // Text Colors
  text: {
    light: '#2D3748', // Dark gray text for light mode
    dark: '#E2E8F0', // Light gray text for dark mode
    secondaryLight: '#718096', // Medium gray for secondary text
    secondaryDark: '#A0AEC0',
  },
  // Border Color
  border: {
    light: '#E2E8F0',
    dark: '#4A5568',
  },
  // Use existing gray scale or customize if needed
  gray: { // Using default Chakra gray, adjust if needed
    // ... default gray scale ...
  },
};

// --- 2. Theme Configuration ---
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// --- 3. Component Styles ---
const components = {
  Button: {
    baseStyle: {
      borderRadius: 'xl', // Even more rounded
      fontWeight: 'medium',
    },
    variants: {
      solid: (props) => ({
        bg: mode('primary.500', 'primary.300')(props),
        color: mode('white', 'gray.900')(props),
        _hover: {
          bg: mode('primary.600', 'primary.400')(props),
          _disabled: { // Ensure disabled hover looks right
             bg: mode('primary.500', 'primary.300')(props),
          }
        },
        _active: {
          bg: mode('primary.700', 'primary.500')(props),
        },
      }),
      ghost: (props) => ({
         color: mode('text.secondaryLight', 'text.secondaryDark')(props),
         _hover: {
             bg: mode('gray.100', 'gray.700')(props)
         },
         _active: {
             bg: mode('gray.200', 'gray.600')(props)
         }
      }),
      // Add other variants if needed (outline, etc.) based on primary color
       outline: (props) => ({
         borderColor: mode('primary.500', 'primary.300')(props),
         color: mode('primary.600', 'primary.200')(props),
         _hover: {
             bg: mode('primary.50', 'primary.800')(props),
         }
      }),
    },
    // defaultProps: { variant: 'solid' } // Optional: set default
  },
  Input: {
    variants: {
      outline: (props) => ({ // Style the default outline variant
        field: {
          borderRadius: 'lg', // Slightly less round than buttons? Or use 'xl'
          borderColor: mode('border.light', 'border.dark')(props),
          bg: mode('white', 'gray.700')(props), // White bg for input
          _hover: {
            borderColor: mode('gray.300', 'gray.600')(props),
          },
          _focusVisible: {
            borderColor: mode('primary.500', 'primary.300')(props),
            boxShadow: `0 0 0 1px ${mode(colors.primary[500], colors.primary[300])(props)}`,
            bg: mode('white', 'gray.700')(props), // Keep bg on focus
          },
        },
      }),
      // Add 'filled' or others if needed
    },
    defaultProps: {
      variant: 'outline', // Make outline the default
    },
  },
  // Style other form elements similarly if needed (Select, Textarea)
  Select: {
    variants: { // Copy Input styles or customize
      outline: (props) => ({
        field: {
          borderRadius: 'lg',
          borderColor: mode('border.light', 'border.dark')(props),
          bg: mode('white', 'gray.700')(props),
          _hover: {
            borderColor: mode('gray.300', 'gray.600')(props),
          },
          _focusVisible: {
            borderColor: mode('primary.500', 'primary.300')(props),
            boxShadow: `0 0 0 1px ${mode(colors.primary[500], colors.primary[300])(props)}`,
          },
        },
         icon: {
             color: mode('gray.500', 'gray.400')(props),
          }
      }),
    },
    defaultProps: {
      variant: 'outline',
    },
  },
  Textarea: {
     variants: {
      outline: (props) => ({
          borderRadius: 'lg',
          borderColor: mode('border.light', 'border.dark')(props),
          bg: mode('white', 'gray.700')(props),
          _hover: {
            borderColor: mode('gray.300', 'gray.600')(props),
          },
          _focusVisible: {
            borderColor: mode('primary.500', 'primary.300')(props),
            boxShadow: `0 0 0 1px ${mode(colors.primary[500], colors.primary[300])(props)}`,
            bg: mode('white', 'gray.700')(props),
          },
       }),
     },
     defaultProps: {
      variant: 'outline',
    },
  },
  // Define Card styles (using Box as base)
  Card: { // Assuming you'll use <Card> or <Box as={Card}>
      baseStyle: (props) => ({
          p: { base: 4, md: 6 }, // Default padding
          borderRadius: 'xl', // Rounded corners
          bg: mode('bg.cardLight', 'bg.cardDark')(props), // White/dark background
          boxShadow: 'sm', // Subtle shadow
          borderWidth: '1px',
          borderColor: mode('border.light', 'border.dark')(props),
      }),
      // Add variants if needed (e.g., pulse card)
       variants: {
          pulse: (props) => ({ // Specific variant for the green pulse card
             bg: mode('accentGreen.500', 'accentGreen.600')(props),
             color: 'white', // White text on the green background
             // Adjust icon color etc. if needed within the component using this variant
          }),
          // Add other variants like 'messages', 'appointments' if they need distinct styles
       }
  },
  // Adjust Heading defaults
  Heading: {
       baseStyle: (props) => ({
          color: mode('text.light', 'text.dark')(props), // Use defined text colors
          fontWeight: 'semibold', // Or 'bold' depending on preference
       })
   },
   // Style Menu for user dropdown
   Menu: {
       baseStyle: (props) => ({
           list: { // Style the dropdown list
              borderRadius: 'lg',
              borderWidth: '1px',
              borderColor: mode('border.light', 'border.dark')(props),
              bg: mode('bg.cardLight', 'bg.cardDark')(props),
              boxShadow: 'md',
           },
           item: { // Style individual menu items
               bg: 'transparent',
               _hover: {
                   bg: mode('gray.100', 'gray.700')(props),
               },
               _focus: {
                    bg: mode('gray.100', 'gray.700')(props),
               },
               // Adjust padding etc. if needed
           }
       })
   }
};

// --- 4. Global Styles ---
const styles = {
  global: (props) => ({
    body: {
      bg: mode('bg.light', 'bg.dark')(props), // Use defined bg colors
      color: mode('text.light', 'text.dark')(props), // Use defined text colors
      lineHeight: 'base', // Reset or adjust line height
    },
    // Keep scrollbar styles or adjust colors
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      background: mode('gray.100', 'gray.700')(props), // Lighter track
    },
    '::-webkit-scrollbar-thumb': {
      background: mode('primary.300', 'primary.600')(props), // Use primary color
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: mode('primary.400', 'primary.500')(props),
    }
  }),
};

// --- 5. Radii ---
const radii = {
     sm: '0.2rem',
     md: '0.375rem', // Chakra default
     lg: '0.75rem', // More rounded large
     xl: '1rem',   // Very rounded extra large
     full: '9999px', // Circle
};

// --- 6. Export Theme ---
const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  radii, // Add custom radii
  // fonts: { heading: `'Inter', sans-serif`, body: `'Inter', sans-serif` }, // Example: Add Inter font
});

export default theme;