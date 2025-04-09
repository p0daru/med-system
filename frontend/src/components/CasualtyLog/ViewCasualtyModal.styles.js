// src/components/CasualtyLog/ViewCasualtyModal.styles.js

// Стилі для обгортки модального вікна
export const modalOverlayStyles = {
    bg: 'blackAlpha.300',       // Напівпрозорий чорний фон
    backdropFilter: 'blur(5px)' // Ефект розмиття
};

// Стилі для "тіла" модального вікна
export const modalBodyStyles = {
    pb: 6, // Нижній відступ
   
};

// Стилі для "футера" модального вікна
export const modalFooterStyles = {
    borderTopWidth: "1px",
    borderColor: "gray.200",
    pt: 3 // Верхній відступ
};

// Базові стилі для секційного контейнера <Box>
export const sectionBoxStyles = {
    borderWidth: 1,
    p: 3, // Внутрішній відступ
    borderRadius: "md",
    borderColor: "gray.200"

};

// Стилі для основного заголовка секції <Heading>
export const sectionHeadingStyles = {
    size: "sm",
    mb: 2, // Нижній відступ
};

// Стилі для підзаголовка (напр., "Алергії:")
export const subHeadingStyles = {
    size: "xs",
    mt: 3, // Верхній відступ
    mb: 1, // Нижній відступ
};

// Стилі для сітки даних (напр., дані пацієнта)
export const dataGridStyles = {
    columns: { base: 1, md: 2 }, // Залишимо це на компоненті для гнучкості
    spacing: 2,
    fontSize: "sm"
};

// Стилі для тексту з даними всередині сітки/стеку
export const dataTextStyles = {
    fontSize: "sm" // Основний розмір тексту
    // Можна додати інші стилі, наприклад, line-height
};

// Стилі для тексту з адмін. інформацією
export const adminInfoTextStyles = {
    fontSize: "xs"
};

// Стилі для списку алергій <VStack>
export const allergyListStyles = {
    align: "start",
    pl: 2, // Відступ зліва
    spacing: 0.5,
    fontSize: "sm"
};

// Стилі для плейсхолдера "Не вказано"
export const italicPlaceholderStyles = {
    fontStyle: "italic",
    color: "gray.500"
};

// Стилі для тексту нотаток
export const notesTextStyles = {
    fontSize: "sm",
    whiteSpace: "pre-wrap", // Збереження переносів рядків
    // bg: "gray.50",         // Світлий фон
    p: 2,
    borderRadius: "sm"
};

// Стилі для сітки турнікетів
export const tourniquetGridStyles = {
    columns: { base: 1, sm: 2 }, // Залишимо на компоненті
    spacing: 2,
};

// Стилі для контейнера одного турнікету <Box>
export const tourniquetItemBoxStyles = {
    p: 2,
    borderWidth: 1,
    borderRadius: "sm",
    borderColor: "gray.100",
};

// Стилі для назви кінцівки турнікету
export const tourniquetLimbTextStyles = {
    fontSize: "sm",
    fontWeight: "bold"
};

// Стилі для деталей турнікету (час, тип)
export const tourniquetDetailTextStyles = {
    fontSize: "xs"
};

// Стилі для тексту "Не застосовувались" / "Немає записів"
export const noDataTextStyles = {
    fontSize: "sm",
    color: "gray.500"
};

// Стилі для таблиці вітальних знаків
export const vitalsTableStyles = {
    variant: "simple",
    size: "xs"
};

// Стилі для заголовків MARCH
export const marchTitleStyles = {
    fontSize: "xs",
    fontWeight: "bold",
    // color: "...", // Колір динамічний, залишаємо на компоненті
    mt: 1 // Відступ зверху для A і B
};

// Стилі для контейнера тегів MARCH
export const marchTagContainerStyles = {
    wrap: "wrap",
    spacing: 2
};

// Стилі для списків рідин/ліків
export const marchItemListStyles = {
    align: "stretch",
    pl: 2,
    spacing: 1
};

// Стилі для елементів списку рідин/ліків
export const marchItemTextStyles = {
    fontSize: "xs"
};

// Стилі для кнопок у футері
export const footerButtonStyles = {
    size: "sm"
    // variant/colorScheme залишаємо на компоненті
};

// Стилі для тексту в контейнері "Немає даних" (якщо потрібні специфічні)
// export const loadingVStackStyles = {
//     justify: "center",
//     align: "center",
//     minHeight: "200px"
// };