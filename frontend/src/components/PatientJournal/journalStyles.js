// frontend/src/components/PatientJournal/journalStyles.js
import { useColorModeValue } from '@chakra-ui/react';

export const useJournalStyles = () => {
    const primaryAccent = 'purple'; // Основний акцентний колір (наприклад, для кнопок дії)
    const secondaryAccent = 'blue';  // Другорядний акцентний колір (наприклад, для іконок, станів)

    const bgColor = useColorModeValue('gray.100', '#0F121F'); // Дуже темний фон, схожий на deHealth
    const cardBgColor = useColorModeValue('whiteAlpha.800', 'rgba(40, 43, 69, 0.65)'); // Напівпрозорий фон для картки
    const cardBorderColor = useColorModeValue('gray.200', 'rgba(100, 116, 139, 0.25)'); // Ледь помітний бордер
    const textColor = useColorModeValue('gray.800', 'gray.50'); // Основний колір тексту
    const headingColor = useColorModeValue('gray.700', 'gray.100'); // Колір заголовків
    const subtleTextColor = useColorModeValue('gray.500', 'gray.400'); // Для менш важливого тексту
    const inputBgColor = useColorModeValue('white', 'rgba(55, 58, 89, 0.7)'); // Фон для поля пошуку
    const inputFocusBorderColor = `${primaryAccent}.400`;

    return {
        // Загальні стилі сторінки
        pageContainer: {
            p: { base: 3, sm: 4, md: 6 }, // Адаптивні відступи
            bg: bgColor,
            minH: '100vh',
            color: textColor,
        },
        headerFlex: {
            mb: { base: 5, md: 7 },
            alignItems: { base: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { base: 'column', sm: 'row' },
            gap: 3,
        },
        pageTitle: {
            as: 'h1',
            fontSize: { base: 'xl', sm: '2xl', md: '3xl' },
            fontWeight: 'bold',
            color: headingColor,
            letterSpacing: 'tight',
        },

        // Поле пошуку
        searchInputGroup: {
            maxW: { base: '100%', sm: '320px' },
            w: '100%',
        },
        searchInput: {
            bg: inputBgColor,
            borderColor: cardBorderColor,
            borderRadius: 'lg', // Більш заокруглені кути
            color: textColor,
            _hover: {
                borderColor: 'gray.500',
            },
            _focus: {
                borderColor: inputFocusBorderColor,
                boxShadow: `0 0 0 1px ${inputFocusBorderColor}`,
                bg: 'rgba(40, 43, 69, 0.85)', // Темніший фон при фокусі в темній темі
            },
            _placeholder: { color: subtleTextColor },
        },

        // Кнопки дій у заголовку
        actionButtonsContainer: {
            spacing: { base: 2, sm: 3 },
        },
        actionButton: { // Загальний стиль для кнопок у заголовку
            borderRadius: 'lg',
            fontWeight: 'medium',
            size: { base: 'sm', md: 'md' },
        },
        
        // Стилі для карток пацієнтів
        recordCard: {
            bg: cardBgColor,
            backdropFilter: 'blur(12px) saturate(150%)', // Ефект скла
            WebkitBackdropFilter: 'blur(12px) saturate(150%)', // для Safari
            border: '1px solid',
            borderColor: cardBorderColor,
            borderRadius: 'xl', // 12px-16px
            p: { base: 3, md: 4 },
            boxShadow: useColorModeValue('md', '0 7px 20px -5px rgba(0,0,0,0.3)'),
            transition: 'all 0.25s cubic-bezier(0.68, -0.55, 0.27, 1.55)', // Плавний перехід
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: { base: '220px', md: '240px' }, // Мінімальна висота картки
            _hover: {
                transform: 'translateY(-4px) scale(1.01)',
                boxShadow: useColorModeValue('lg', `0 10px 25px -8px rgba(0,0,0,0.4), 0 0 0 1px ${secondaryAccent}.400`),
                borderColor: `${secondaryAccent}.400`,
            },
        },
        cardHeaderFlex: {
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
        },
        patientNameHeading: {
             as: 'h3', 
            fontSize: { base: 'md', md: 'lg' },
            fontWeight: 'semibold',
            color: headingColor,
            noOfLines: 2, 
            lineHeight: 'short',
        },
        cardIdText: {
            fontSize: 'xs',
            color: subtleTextColor,
            mt: 0.5,
        },
        cardIdKbd: {
            bg: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.15)',
            color: 'gray.300',
            px: '0.4em',
            py: '0.1em',
            fontSize: '0.85em',
            borderRadius: 'md',
        },
        triageCircle: { // Для візуального відображення тріажу
            size: { base: '30px', md: '32px' },
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: 'full',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: 2,
            flexShrink: 0,
            fontWeight: 'bold',
            // Динамічні кольори будуть застосовані в компоненті
        },
        triageCircleText: {
            fontSize: { base: 'xs', md: 'sm' },
            // Динамічний колір тексту
        },

        // Секція інформації на картці
        cardInfoVStack: {
            spacing: 1.5,
            align: 'flex-start',
            my: 2.5,
            flexGrow: 1, // Дозволяє цьому блоку рости
        },
        cardInfoHStack: {
            alignItems: 'center',
            spacing: 1.5,
        },
        cardInfoIcon: {
            boxSize: '0.9em',
            color: `${secondaryAccent}.300`, // Акцентний колір для іконок
        },
        cardInfoText: {
            fontSize: { base: 'xs', sm: 'sm' },
            color: subtleTextColor,
            display: 'flex',
            alignItems: 'baseline',
        },
        cardInfoData: {
            as: 'span',
            color: textColor,
            fontWeight: 'medium',
            ml: 1,
        },
        cardDescriptionText: {
            fontSize: { base: 'xs', sm: 'sm' },
            color: textColor,
            noOfLines: 3, // Важлива інформація, але коротко
            lineHeight: 'base',
            mt: 1,
            flexGrow: 1,
            opacity: 0.9
        },

        // Футер картки з кнопками дій
        cardFooterFlex: {
            mt: 'auto', // Притискає футер донизу
            pt: 2.5,
            borderTop: '1px solid',
            borderTopColor: cardBorderColor,
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        cardActionButton: { // Стилі для кнопок дій на картці
            size: 'sm',
            variant: 'ghost',
            isRound: true,
            color: subtleTextColor, // Нейтральний колір для іконок
            _hover: {
                bg: 'rgba(255, 255, 255, 0.08)',
                color: textColor, // Світліший колір при наведенні
            },
            // Специфічні colorScheme для кожної кнопки в JSX
        },

        // Стани (завантаження, помилка, порожньо)
        stateFlexBase: {
            justify: 'center',
            align: 'center',
            minHeight: 'calc(100vh - 280px)',
            textAlign: 'center',
            p: 4,
        },
        loadingStateFlex: {
            // Spinner та текст будуть стилізовані через VStack
        },
        errorStateFlex: { // Для помилки на всю сторінку
            // Icon, Heading, Text, Button стилізовані через VStack
        },
        errorBannerFlex: { // Для банера помилки, коли дані вже є
            p: 3,
            bg: useColorModeValue('red.50', `${primaryAccent}.800`), // Використовуємо основний акцент для помилки
            color: useColorModeValue('red.700', `${primaryAccent}.100`),
            borderRadius: 'md',
            alignItems: 'center',
            mb: 4,
            boxShadow: 'sm',
            borderLeft: '4px solid',
            borderColor: useColorModeValue('red.500', `${primaryAccent}.400`),
        },
        emptyStateFlex: {
             // VStack та його дочірні елементи стилізовані там
        },
        emptyStateVStack: {
            spacing: 3,
            maxW: 'sm',
            p: { base: 5, md: 7 },
            bg: cardBgColor, // Схожий стиль на картки
            borderRadius: 'xl',
            boxShadow: 'lg',
        },

        // Додаткові утиліти
        subtleText: subtleTextColor,
        headingColor: headingColor,
        primaryAccentColor: `${primaryAccent}.500`, // Для використання в компоненті
        secondaryAccentColor: `${secondaryAccent}.500`, // Для використання в компоненті
    };
};