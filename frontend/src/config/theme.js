// src/theme.js
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools'; // Helper for light/dark mode styles

// 1. Define Color Palette
const colors = {
  // // Brand color (Teal/Green from "Completed" heading)
  brand: {
    50: '#E6FFFA', // Lightest
    100: '#B2F5EA',
    200: '#81E6D9',
    300: '#4FD1C5',
    400: '#38B2AC',
    500: '#319795', // Main brand color (guess)
    600: '#2C7A7B', // Darker shade
    700: '#285E61',
    800: '#234E52',
    900: '#1D4044', // Darkest
  },
  // Highlight color (Yellow for selected row and download button)
  highlight: {
    50: '#FFFAF0',
    100: '#FEFCBF',
    200: '#FEF9C3', // Background for selected row (guess)
    300: '#FDE68A', // Potential button background (guess)
    400: '#FCD34D', // Darker button background / hover (guess)
    // ... add darker shades if needed for text on highlight bg
  },

  // Background colors
  bg: {
    page: { // Base background for the entire page area
      light: 'gray.50', // Very light grey
      dark: 'gray.900', // Dark grey for dark mode
    },
    content: { // Background for main content cards/areas
      light: 'white',
      dark: 'gray.800',
    },
    sidebar: { // Background for the sidebar
      light: 'white',
      dark: 'gray.800', // Can be same as content or slightly different
    },
  },
   // Sidebar Active State Colors
   sidebarActive: {
       bg: {
           light: 'blue.50', // Very light blue
           dark: 'blue.800', // Darker blue
       },
       color: {
           light: 'blue.700',
           dark: 'blue.100',
       }
   }
};


// 2. Define Fonts
const fonts = {
  heading: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  body: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
};

// 3. Define Global Styles
const styles = {
  global: (props) => ({
    body: {
      bg: mode(colors.bg.page.light, colors.bg.page.dark)(props),
      color: mode('gray.800', 'whiteAlpha.900')(props),
      lineHeight: 'base',
    },
    // Style links globally if needed
    // 'a': {
    //   color: mode('brand.600', 'brand.300')(props),
    //   _hover: {
    //     textDecoration: 'underline',
    //   },
    // }
  }),
};

// 4. Define Component Style Overrides
const components = {
  // --- General Components ---
  Button: {
    baseStyle: {
      borderRadius: 'lg', // Rounded corners like in the image
      fontWeight: 'medium',
    },
    variants: {
      // Custom variant for the download button
      download: (props) => ({
        bg: mode('highlight.300', 'highlight.400')(props), // Using highlight yellow
        color: 'gray.800', // Text color dark on yellow
        _hover: {
          bg: mode('highlight.400', 'highlight.500')(props),
        },
      }),
      // Adjust solid variant if needed
      solid: (props) => ({
         bg: mode(`${props.colorScheme}.500`, `${props.colorScheme}.300`)(props),
         // Add other solid styles if needed
      }),
      // Adjust ghost variant for action icons
      ghost: (props) => ({
          color: mode('gray.600', 'gray.400')(props),
          _hover: {
              bg: mode('gray.100', 'whiteAlpha.200')(props)
          }
      })
    },
     defaultProps: {
        // colorScheme: 'brand', // Set default color scheme if desired
     }
  },
  Input: { // Applies to Input, Textarea, Select placeholders potentially
    baseStyle: {
        field: { // Target the actual input field
             borderRadius: 'lg',
        }
    },
    variants: {
        outline: (props) => ({
            field: {
                bg: mode('white', 'gray.700')(props), // Background for input
                borderColor: mode('gray.300', 'gray.600')(props), // Border color
                 borderRadius: 'lg',
                _hover: {
                    borderColor: mode('gray.400', 'gray.500')(props),
                },
                _focusVisible: { // Style for focus
                     borderColor: mode('brand.500', 'brand.300')(props),
                     boxShadow: `0 0 0 1px ${mode(colors.brand[500], colors.brand[300])(props)}`,
                 }
            }
        })
    },
    defaultProps: {
        variant: 'outline', // Make outline the default
    }
  },
  Select: { // Similar styling for Select dropdown
     baseStyle: {
        field: {
             borderRadius: 'lg',
        }
    },
    variants: {
        outline: (props) => ({
            field: {
                bg: mode('white', 'gray.700')(props),
                borderColor: mode('gray.300', 'gray.600')(props),
                 borderRadius: 'lg',
                _hover: {
                    borderColor: mode('gray.400', 'gray.500')(props),
                },
            }
        })
    },
     defaultProps: {
        variant: 'outline',
    }
  },
  Checkbox: {
      baseStyle: {
          control: {
              borderRadius: 'md', // Slightly rounded checkbox square
              _checked: { // Style when checked
                  bg: 'brand.500',
                  borderColor: 'brand.500',
                  _hover: {
                     bg: 'brand.1000',
                     borderColor: 'brand.600',
                  }
              }
          }
      }
  },
  Table: {
    // Apply styles to the striped variant used in CasualtyListPage
    variants: {
      striped: (props) => ({
        thead: {
          th: {
            color: mode('gray.600', 'gray.400')(props),
            fontWeight: 'medium', // Header font weight
            textTransform: 'none', // Prevent uppercase default
            letterSpacing: 'normal',
            borderBottom: '1px',
            borderColor: mode('gray.100', 'gray.700')(props),
            fontSize: 'sm', // Match image font size
             // Add padding if needed
            // px: 4,
            // py: 3,
          },
        },
        tbody: {
          tr: {
            // Styling for selected row needs to be applied conditionally in the component
            // using state, but we can define the background color here
            // e.g., in component: <Tr bg={isSelected ? 'highlight.200' : undefined}>...</Tr>

            // Default row styles
             '&:nth-of-type(odd)': { // Striping
               'th, td': {
                 borderBottomWidth: '1px',
                 borderColor: mode('gray.100', 'gray.700')(props),
               },
               td: {
                 background: mode('gray.50', 'whiteAlpha.50')(props), // Very subtle striping
               },
             },
             '&:nth-of-type(even)': {
                 'th, td': {
                   borderBottomWidth: '1px',
                   borderColor: mode('gray.100', 'gray.700')(props),
                 },
             },
              td: {
                 fontSize: 'sm', // Match image font size
                 color: mode('gray.700', 'gray.200')(props),
                  // Add padding if needed
                 // px: 4,
                 // py: 3,
             }
          },
        },
      }),
    },
    defaultProps: {
      variant: 'striped', // Make striped the default for <Table>
      size: 'sm',         // Default size
      colorScheme: 'gray', // Base color scheme
    },
  },
  Heading: {
      baseStyle: (props) => ({
          fontFamily: 'heading',
          color: mode('gray.700', 'whiteAlpha.900')(props),
      }),
       // Example specific style for the "Completed" heading if needed
      // variants: {
      //     pageTitle: (props) => ({
      //         color: mode('brand.600', 'brand.300')(props),
      //         // add other styles
      //     })
      // }
  },
  Text: {
      baseStyle: (props) => ({
           fontFamily: 'body',
           color: mode('gray.700', 'gray.300')(props), // Default text color
      }),
       variants: {
           secondary: (props) => ({ // For lighter text like "256 items"
                color: mode('gray.500', 'gray.400')(props),
           })
       }
  },
  // Add other component overrides if necessary (e.g., Link, Tag)
  Tag: { // For Triage tags and notification badges
      baseStyle: {
           borderRadius: 'full', // Make notification badges circular
      },
       variants: {
           // Could define specific variants for triage colors if needed,
           // but using colorScheme prop might be sufficient
       },
       defaultProps: {
           // size: 'sm',
       }
  }
};

// 5. Define Theme Configuration
const config = {
  initialColorMode: 'light', // Start with light mode ('dark', 'system')
  useSystemColorMode: false, // Don't automatically use system preference for now
};

// 6. Extend the theme
const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
});

export default theme;
