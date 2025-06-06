// src/theme.js
import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// Helper function to generate alpha colors (якщо потрібно, але Chakra має whiteAlpha/blackAlpha)
const alpha = (color, opacity) => {
  if (!color.startsWith('#') || color.length !== 7) return color; // Повертаємо як є, якщо не HEX
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const colors = {
  brand: { // Сучасний, насичений, але не кричущий синій
    50: '#EBF8FF', // blue.50
    100: '#BEE3F8', // blue.100
    200: '#90CDF4', // blue.200
    300: '#63B3ED', // blue.300 (Для акцентів в темній темі)
    400: '#4299E1', // blue.400
    500: '#3182CE', // blue.500 (Основний)
    600: '#2B6CB0', // blue.600 (Для hover, активних станів)
    700: '#2C5282', // blue.700
    800: '#2A4365', // blue.800
    900: '#1A365D', // blue.900
  },
  // Функціональні кольори
  success: { 50: '#F0FFF4', 100: '#C6F6D5', 500: '#38A169', 600: '#2F855A' }, // green
  warning: { 50: '#FFFFF0', 100: '#FEFCBF', 500: '#D69E2E', 600: '#B7791F' }, // yellow
  error: { 50: '#FFF5F5', 100: '#FED7D7', 500: '#E53E3E', 600: '#C53030' },   // red
  info: { 50: '#EBF8FF', 100: '#BEE3F8', 500: '#3182CE', 600: '#2B6CB0' },     // blue (може бути той самий brand)

  // Професійні відтінки сірого
  gray: {
    50: '#F9FAFB',    // Дуже світлий, майже білий (фон сторінки)
    100: '#F3F4F6',   // Світлий фон для секцій, карток
    200: '#E5E7EB',   // Тонкі рамки, розділювачі
    300: '#D1D5DB',   // Неактивний текст, плейсхолдери
    400: '#9CA3AF',   // Вторинний текст
    500: '#6B7280',   // Текст середньої насиченості, іконки
    600: '#4B5563',   // Основний текст (темна тема)
    700: '#374151',   // Основний текст (світла тема), заголовки
    800: '#1F2937',   // Дуже темний, фон контенту (темна тема)
    900: '#111827',   // Фон сторінки (темна тема)
  },

  // Фони
  bg: {
    page: { light: 'gray.50', dark: 'gray.900' },
    content: { light: 'white', dark: 'gray.800' }, // Картки, модалки
    subtle: { light: 'gray.100', dark: 'gray.700' }, // Легкі фони, hover
    disabled: { light: 'gray.100', dark: 'gray.700' },
    overlay: { light: 'blackAlpha.600', dark: 'blackAlpha.700' }, // Для модалок
  },
  // Текстові кольори (семантичні)
  text: {
    primary: { light: 'gray.700', dark: 'gray.100' },
    secondary: { light: 'gray.500', dark: 'gray.400' },
    placeholder: { light: 'gray.400', dark: 'gray.500' },
    disabled: { light: 'gray.400', dark: 'gray.500' },
    link: { light: 'brand.500', dark: 'brand.300' },
    error: { light: 'error.600', dark: 'error.300' },
  },
  // Кольори рамок (семантичні)
  border: {
    primary: { light: 'gray.200', dark: 'gray.700' }, // Розділювачі
    input: { light: 'gray.300', dark: 'gray.600' }, // Рамка інпутів
    focused: { light: 'brand.500', dark: 'brand.300' },
    error: { light: 'error.500', dark: 'error.300' },
  }
};

const fonts = {
  heading: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
};

// Глобальні стилі
const styles = {
  global: (props) => ({
    body: {
      bg: mode(colors.bg.page.light, colors.bg.page.dark)(props),
      color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
      fontSize: { base: '15px', md: '16px' }, // Адаптивний базовий розмір
      lineHeight: '1.65', // Покращена читабельність
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    '*::placeholder': {
      color: mode(colors.text.placeholder.light, colors.text.placeholder.dark)(props),
    },
    '*, *::before, *::after': {
      borderColor: mode(colors.border.primary.light, colors.border.primary.dark)(props),
    },
    // Скролбари
    '::-webkit-scrollbar': { width: '8px', height: '8px' },
    '::-webkit-scrollbar-track': { bg: mode('gray.100', 'gray.800')(props) },
    '::-webkit-scrollbar-thumb': {
      bg: mode('gray.300', 'gray.600')(props),
      borderRadius: '8px',
      '&:hover': { bg: mode('gray.400', 'gray.500')(props) }
    },
  }),
};

// Радіуси заокруглення
const radii = {
  none: '0',
  sm: '0.25rem', // 4px (теги, дрібні елементи)
  md: '0.5rem',  // 8px (кнопки, інпути, чекбокси)
  lg: '0.75rem', // 12px (картки, акордеони)
  xl: '1rem',   // 16px (модальні вікна)
  full: '9999px',
};

// Тіні
const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 2px 4px -1px rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)', // Легка тінь для інтерактивних елементів
  md: '0 4px 8px -2px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.04)', // Для карток, акордеонів
  lg: '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.05)', // Більш виразна
  xl: '0 20px 25px -5px rgba(0,0,0,0.07), 0 8px 10px -6px rgba(0,0,0,0.05)', // Для модалок, дроверів
  // Тінь для фокусу
  outline: (props) => `0 0 0 3px ${mode(alpha(colors.brand[500], 0.3), alpha(colors.brand[300], 0.4))(props)}`,
  // Тіні для темної теми можуть бути світлішими або менш насиченими
  'dark-md': '0 4px 8px -2px rgba(0,0,0,0.15), 0 2px 4px -2px rgba(0,0,0,0.1)',
  'dark-lg': '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -4px rgba(0,0,0,0.15)',
};

// Стилі компонентів
const components = {
  Button: {
    baseStyle: (props) => ({
      fontWeight: 'semibold',
      borderRadius: radii.md,
      transitionProperty: 'common',
      transitionDuration: 'fast',
      _focusVisible: { boxShadow: shadows.outline(props) },
      _disabled: { opacity: 0.6, cursor: 'not-allowed' }
    }),
    sizes: {
      lg: { h: '3rem', fontSize: 'md', px: '1.5rem' },        // 48px
      md: { h: '2.75rem', fontSize: 'sm', px: '1.25rem' },    // 44px
      sm: { h: '2.25rem', fontSize: 'xs', px: '1rem' },      // 36px
    },
    variants: {
      solid: (props) => ({
        bg: mode(`${props.colorScheme}.500`, `${props.colorScheme}.300`)(props),
        color: (props.colorScheme === 'gray' || props.colorScheme === 'warning') ?
               mode('gray.800', 'gray.800')(props) :
               mode('white', 'gray.900')(props),
        _hover: {
          bg: mode(`${props.colorScheme}.600`, `${props.colorScheme}.400`)(props),
          _disabled: { bg: mode(`${props.colorScheme}.500`, `${props.colorScheme}.300`)(props) }
        },
        _active: { bg: mode(`${props.colorScheme}.700`, `${props.colorScheme}.500`)(props) }
      }),
      outline: (props) => ({
        borderWidth: '1.5px', // Трохи товстіша рамка для чіткості
        borderColor: mode(
            props.colorScheme === 'gray' ? colors.border.input.light : `${props.colorScheme}.500`,
            props.colorScheme === 'gray' ? colors.border.input.dark : `${props.colorScheme}.300`
        )(props),
        color: mode(
            props.colorScheme === 'gray' ? colors.text.primary.light : `${props.colorScheme}.600`,
            props.colorScheme === 'gray' ? colors.text.primary.dark : `${props.colorScheme}.200`
        )(props),
        _hover: {
          bg: mode(alpha(colors[props.colorScheme]?.[50] || colors.gray[50], 0.6), alpha(colors[props.colorScheme]?.[900] || colors.gray[900], 0.15))(props),
        }
      }),
      ghost: (props) => ({
        color: mode(
            props.colorScheme === 'gray' ? colors.text.secondary.light : `${props.colorScheme}.600`,
            props.colorScheme === 'gray' ? colors.text.secondary.dark : `${props.colorScheme}.200`
        )(props),
        _hover: {
          bg: mode(alpha(colors[props.colorScheme]?.[50] || colors.gray[50], 0.7), alpha(colors[props.colorScheme]?.[800] || colors.gray[800], 0.15))(props),
        }
      }),
    },
    defaultProps: { colorScheme: 'brand', size: 'md' }
  },

  Input: { // Також для NumberInput, PasswordInput
    baseStyle: (props) => ({
      field: {
        width: '100%',
        minWidth: 0,
        outline: 0,
        position: 'relative',
        appearance: 'none',
        transitionProperty: 'common',
        transitionDuration: 'fast',
        borderRadius: radii.md,
        bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
        color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
        _autofill: {
           boxShadow: `0 0 0px 1000px ${mode(colors.brand[50], colors.gray[700])(props)} inset !important`,
           WebkitTextFillColor: `${mode(colors.gray[800], 'white')(props)} !important`,
        }
      },
    }),
    sizes: {
      lg: { field: { h: '3rem', fontSize: 'md', px: 4 } },
      md: { field: { h: '2.75rem', fontSize: 'sm', px: 3 } }, // 44px
      sm: { field: { h: '2.25rem', fontSize: 'xs', px: 3 } },
    },
    variants: {
      outline: (props) => ({
        field: {
          borderWidth: '1px',
          borderColor: mode(colors.border.input.light, colors.border.input.dark)(props),
          _hover: { borderColor: mode('gray.400', 'gray.500')(props) },
          _focusVisible: {
            zIndex: 1, // Щоб тінь була поверх інших елементів
            borderColor: mode(colors.border.focused.light, colors.border.focused.dark)(props),
            boxShadow: shadows.outline(props)
          },
          _invalid: {
            borderColor: mode(colors.border.error.light, colors.border.error.dark)(props),
            boxShadow: `0 0 0 1px ${mode(colors.border.error.light, colors.border.error.dark)(props)}`
          },
          _disabled: {
            opacity: 0.5,
            bg: mode(colors.bg.disabled.light, colors.bg.disabled.dark)(props),
            borderColor: mode(colors.border.input.light, colors.border.input.dark)(props),
          }
        }
      }),
      filled: (props) => ({ // Без видимої рамки, з фоном
        field: {
          borderWidth: '1px',
          borderColor: 'transparent',
          bg: mode(colors.bg.subtle.light, colors.bg.subtle.dark)(props),
          _hover: { bg: mode('gray.200', 'gray.600')(props) },
          _focusVisible: {
            zIndex: 1,
            bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
            borderColor: mode(colors.border.focused.light, colors.border.focused.dark)(props),
            boxShadow: shadows.outline(props)
          },
          _invalid: {
            borderColor: mode(colors.border.error.light, colors.border.error.dark)(props),
            bg: mode(alpha(colors.error[50], 0.7), alpha(colors.error[900] || '#1A202C', 0.2))(props),
          },
        }
      }),
    },
    defaultProps: { variant: 'outline', size: 'md' }
  },

  Textarea: { // Успадковує багато від Input
    baseStyle: (props) => ({
        paddingY: '0.5rem', // Трохи більше вертикального падінгу
        minHeight: '5rem',  // Мінімальна висота
        lineHeight: 'short',
        borderRadius: radii.md,
        bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
        color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
        transitionProperty: 'common',
        transitionDuration: 'fast',
    }),
    variants: { // Можна скопіювати з Input
      outline: (props) => ({
        borderWidth: '1px',
        borderColor: mode(colors.border.input.light, colors.border.input.dark)(props),
        _hover: { borderColor: mode('gray.400', 'gray.500')(props) },
        _focusVisible: {
          zIndex: 1,
          borderColor: mode(colors.border.focused.light, colors.border.focused.dark)(props),
          boxShadow: shadows.outline(props)
        },
      }),
    },
    defaultProps: { variant: 'outline', size: 'md' }
  },

  Select: { // Схоже на Input
     baseStyle: (props) => ({
        field: { // Стилі з Input.baseStyle.field
            width: '100%', minWidth: 0, outline: 0, position: 'relative', appearance: 'none',
            transitionProperty: 'common', transitionDuration: 'fast',
            borderRadius: radii.md,
            bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
            color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
        },
        icon: { // Стрілка
            color: mode(colors.text.secondary.light, colors.text.secondary.dark)(props),
            fontSize: '1.25rem', // Трохи більша стрілка
            insetEnd: '0.75rem', // Відступ стрілки
        }
    }),
    sizes: { // З Input.sizes, але з урахуванням padding для іконки
      lg: { field: { h: '3rem', fontSize: 'md', paddingInlineEnd: '2.5rem', paddingInlineStart: '1rem'} },
      md: { field: { h: '2.75rem', fontSize: 'sm', paddingInlineEnd: '2.5rem', paddingInlineStart: '0.75rem'} },
    },
    variants: { // З Input.variants.outline
        outline: (props) => ({
            field: {
                borderWidth: '1px',
                borderColor: mode(colors.border.input.light, colors.border.input.dark)(props),
                _hover: { borderColor: mode('gray.400', 'gray.500')(props) },
                _focusVisible: {
                    zIndex: 1,
                    borderColor: mode(colors.border.focused.light, colors.border.focused.dark)(props),
                    boxShadow: shadows.outline(props)
                },
            }
        })
    },
     defaultProps: { variant: 'outline', size: 'md' }
  },

  Checkbox: {
      baseStyle: (props) => ({
          control: {
              borderRadius: radii.sm, // 4px
              borderWidth: '1.5px',
              borderColor: mode(colors.border.input.light, colors.border.input.dark)(props),
              transitionProperty: 'common', transitionDuration: 'fast',
              _checked: {
                  bg: mode('brand.500', 'brand.300')(props),
                  borderColor: mode('brand.500', 'brand.300')(props),
                  color: mode('white', 'gray.900')(props),
                  _hover: {
                     bg: mode('brand.600', 'brand.400')(props),
                     borderColor: mode('brand.600', 'brand.400')(props),
                  }
              },
              _focusVisible: { boxShadow: shadows.outline(props) },
              _disabled: {
                bg: mode(colors.bg.disabled.light, colors.bg.disabled.dark)(props),
                borderColor: mode(colors.border.input.light, colors.border.input.dark)(props),
              }
          },
          label: {
              fontWeight: 'medium', marginLeft: 2,
              color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
          }
      }),
      defaultProps: { colorScheme: 'brand', size: 'md' }
  },

  Accordion: {
    baseStyle: (props) => ({
        container: { // AccordionItem
             border: 'none',
             bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
             borderRadius: radii.lg, // 12px
             boxShadow: mode(shadows.md, shadows['dark-md'])(props),
             overflow: 'hidden',
             '&:not(:last-of-type)': { // Відступ між айтемами акордеону
                 marginBottom: 4, // Або 6
             }
        },
        button: {
            fontWeight: 'semibold', fontSize: 'md',
            py: 4, px: 5, // 16px, 20px
            color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
            textAlign: 'left',
            borderBottomWidth: '1px',
            borderColor: 'transparent', // Початково прозора
             _hover: { bg: mode(colors.bg.subtle.light, colors.bg.subtle.dark)(props) },
            _expanded: {
                bg: mode(alpha(colors.brand[50], 0.7), alpha(colors.brand[800], 0.25))(props),
                color: mode(colors.brand[600], colors.brand[200])(props),
                borderColor: mode(colors.border.primary.light, colors.border.primary.dark)(props), // Показуємо рамку при розгортанні
            },
            // Якщо кнопка не розгорнута і це НЕ останній елемент перед розгорнутою панеллю, додати рамку
            // Це складніше зробити тут, легше керувати `borderBottomColor` в AccordionItem
        },
        panel: {
            pt: 2, pb: 5, px: 5,
            // Фон панелі може бути ледь помітно іншим для глибини
            bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
        },
        icon: {
            fontSize: '1.25em',
            color: mode(colors.text.secondary.light, colors.text.secondary.dark)(props),
        }
    })
  },

  Table: { // Більш сучасний вигляд таблиць
    baseStyle: { table: { borderCollapse: 'separate', borderSpacing: 0, width: '100%' } },
    variants: {
      simple: (props) => ({
        th: {
          color: mode(colors.text.secondary.light, colors.text.secondary.dark)(props),
          fontWeight: 'semibold', textTransform: 'none', letterSpacing: 'normal',
          borderBottomWidth: '1.5px', // Чіткіша лінія
          borderColor: mode(colors.border.primary.light, colors.border.primary.dark)(props),
          fontSize: 'sm', py: 3, px: 4, textAlign: 'left',
        },
        td: {
          borderBottomWidth: '1px',
          borderColor: mode(colors.border.primary.light, colors.border.primary.dark)(props),
          py: 3, px: 4, fontSize: 'sm',
        },
      }),
      striped: (props) => ({
        th: { /* як в simple */
            color: mode(colors.text.secondary.light, colors.text.secondary.dark)(props),
            fontWeight: 'semibold', textTransform: 'none', letterSpacing: 'normal',
            borderBottomWidth: '1.5px', borderColor: mode(colors.border.primary.light, colors.border.primary.dark)(props),
            fontSize: 'sm', py: 3, px: 4, textAlign: 'left',
        },
        tbody: {
          tr: {
            '&:nth-of-type(odd) td': {
              bg: mode(colors.bg.subtle.light, alpha(colors.gray[700], 0.4))(props),
            },
            td: {
                borderBottomWidth: '1px',
                borderColor: mode(colors.border.primary.light, colors.border.primary.dark)(props),
                py: 3, px: 4, fontSize: 'sm',
            }
          },
        },
      }),
    },
    defaultProps: { variant: 'simple', size: 'md' },
  },

  Heading: {
      baseStyle: (props) => ({
          fontFamily: 'heading',
          fontWeight: 'semibold',
          color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
          lineHeight: '1.35',
      }),
      sizes: { // DeHealth-like sizes
          '2xl': { fontSize: { base: '1.875rem', md: '2.25rem'} }, // ~30px -> 36px
          'xl': { fontSize: { base: '1.5rem', md: '1.875rem'} },    // ~24px -> 30px
          'lg': { fontSize: { base: '1.25rem', md: '1.5rem'} },     // ~20px -> 24px
          'md': { fontSize: '1.125rem' },                             // ~18px
          'sm': { fontSize: '1rem' },                                 // ~16px
          'xs': { fontSize: '0.875rem' },                             // ~14px
      }
  },

  Text: {
      baseStyle: (props) => ({
           fontFamily: 'body',
           color: mode(colors.text.primary.light, colors.text.primary.dark)(props),
           lineHeight: '1.7',
      }),
       variants: {
           secondary: (props) => ({ color: mode(colors.text.secondary.light, colors.text.secondary.dark)(props) }),
           subtle: (props) => ({ color: mode('gray.400', 'gray.500')(props) }), // Ще світліший
           caption: (props) => ({ fontSize: 'xs', color: mode(colors.text.secondary.light, colors.text.secondary.dark)(props) })
       }
  },

  Tag: {
      baseStyle: (props) => ({
           borderRadius: radii.sm, // 4px, більш прямокутні
           fontWeight: 'medium',
           lineHeight: 1.2,
           px: 2.5, py: 0.5, // Компактніші
      }),
      variants: {
        subtle: (props) => ({ // Основний варіант
            bg: mode(`${props.colorScheme}.50`, alpha(colors[props.colorScheme]?.[700] || colors.gray[700], 0.15))(props),
            color: mode(`${props.colorScheme}.600`, `${props.colorScheme}.200`)(props),
        }),
        solid: (props) => ({
            bg: mode(`${props.colorScheme}.500`, `${props.colorScheme}.300`)(props),
            color: (props.colorScheme === 'gray' || props.colorScheme === 'warning') ?
                   mode('gray.800', 'gray.800')(props) :
                   mode('white', 'gray.900')(props),
        }),
      },
      defaultProps: { variant: 'subtle', colorScheme: 'gray', size: 'md' }
  },

  Card: { // Chakra UI Card component
    baseStyle: (props) => ({
        container: {
            bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
            borderRadius: radii.lg, // 12px
            boxShadow: mode(shadows.md, shadows['dark-md'])(props),
            overflow: 'hidden', // Для заокруглення
        },
        header: { p: { base: 4, md: 5 }, borderBottomWidth: '1px' },
        body: { p: { base: 4, md: 5 } },
        footer: { p: { base: 4, md: 5 }, borderTopWidth: '1px' },
    }),
    defaultProps: { variant: 'outline' } // outline додає тонку рамку
  },

  Modal: {
    baseStyle: (props) => ({
        overlay: {
            bg: mode(colors.bg.overlay.light, colors.bg.overlay.dark)(props),
            backdropFilter: 'blur(3px)', // Ефект "матового скла"
        },
        dialog: {
            bg: mode(colors.bg.content.light, colors.bg.content.dark)(props),
            borderRadius: radii.xl, // 16px
            boxShadow: mode(shadows.xl, shadows['dark-lg'])(props),
            my: { base: 8, md: 16 }, // Відступи зверху/знизу
            maxH: "calc(100vh - 4rem)", // Обмеження висоти
            display: "flex",
            flexDirection: "column",
        },
        header: {
            fontWeight: 'semibold', fontSize: 'lg',
            py: 4, px: 6, flexShrink: 0,
            borderBottomWidth: '1px',
        },
        body: {
            py: 5, px: 6,
            flexGrow: 1,
            overflowY: 'auto', // Скрол для тіла, якщо контент великий
        },
        footer: {
            py: 4, px: 6, flexShrink: 0,
            borderTopWidth: '1px',
            justifyContent: 'flex-end',
            '> button:not(:last-of-type)': { marginEnd: 3 }
        },
        closeButton: {
            top: 4, right: 4, borderRadius: radii.md,
            _hover: { bg: mode('gray.100', 'gray.700')(props) },
            _focusVisible: { boxShadow: shadows.outline(props) }
        }
    })
  },

  Alert: { // Для тостів та повідомлень
    baseStyle: (props) => ({
        container: {
            borderRadius: radii.md, // 8px
            px: 4, py: 3,
            boxShadow: mode(shadows.lg, shadows['dark-lg'])(props), // Тінь для "плаваючих" алертов
        },
        icon: { marginEnd: 3, w: 5, h: 5, flexShrink: 0 },
        title: { fontWeight: 'semibold', mb: 1, lineHeight: 1.3 },
        description: { lineHeight: 1.5 },
    }),
    defaultProps: { variant: 'subtle' } // subtle є хорошим варіантом
  },

  Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                transform: 'scale(0.85) translateY(-24px)',
                color: 'gray.600',
              },
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label': {
              transform: 'scale(0.85) translateY(-24px)',
            },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: 'absolute',
              backgroundColor: 'white',
              pointerEvents: 'none',
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: 'left top',
              color: 'gray.400',
            },
          },
        },
      },
    },
};

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  radii,
  shadows,
  // Семантичні токени - це хороший підхід, але для початку можна обійтися без них,
  // якщо тема добре налаштована через mode()
});

export default theme;