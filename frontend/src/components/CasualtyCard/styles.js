// src/components/CasualtyCard/styles.js

import { background } from "@chakra-ui/react";

///// ====== VitalSignsSection =====/////
export const vitalSectionStyles = {
    // Стилі для HStack з кнопкою "Додати"
    headerHStack: {
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3, // Відступ знизу
    },
    // Стилі для кнопки "Додати Запис"
    addVitalButton: {
        size: "xs",
        colorScheme: "blue",
        variant: "outline",
    },
    // Стилі для VStack, що містить список рядків
    listVStack: {
        spacing: 2, // Вертикальний відступ між рядками
        align: "stretch", // Розтягнути елементи по ширині
    },
    // Стилі для тексту, коли немає записів
    noEntriesText: {
        fontSize: "sm",
        textAlign: "center",
        py: 2, // Вертикальний паддінг
        // Колір буде залежати від isDisabled, тому встановлюється в компоненті
    }
};

// VitalSignsRow
export const vitalRowStyles = {
    // Базові стилі для контейнера Box рядка
    containerBoxBase: {
        borderWidth: "1px",
        borderRadius: "15px", // 15px
        p: 2,
        mb: 2,
        // borderColor встановлюється в компоненті залежно від hasErrors
    },
    // Стилі для SimpleGrid всередині рядка
    grid: {
        spacing: 3, // Горизонтальний відступ між елементами
        alignItems: "flex-start", // Вирівнювання по верху (важливо для повідомлень помилок)
        // columns встановлюється в компоненті (бо він адаптивний)
    },
    // Стилі для FormLabel
    formLabel: {
        fontSize: "xs",
        mb: 1, // Маленький відступ знизу
        whiteSpace: "nowrap", // Запобігаємо переносу тексту мітки
    },
    // Базовий розмір для Input та Select
    inputSize: {
        size: "xs",
    },
    // Стилі для Input часу
    timeInput: {
        pt: "5px", // Маленький відступ зверху для кращого вигляду часу
    },
    // Стилі для HStack навколо Input часу та кнопки
    timeHStack: {
        spacing: 1,
    },
    // Стилі для кнопки "Поточний час"
    timeButton: {
        size: "xs",
        variant: "outline",
        // icon та aria-label встановлюються як пропси
    },
    // Стилі для Select (розмір вже в inputSize)
    select: {
        // Додаткові стилі для select, якщо потрібно
    },
    // Стилі для Tooltip
    tooltip: {
        fontSize: "xs",
    },
    // Стилі для повідомлення помилки
    errorMessage: {
        fontSize: "xs",
        // Додаткові стилі, якщо потрібно (наприклад, color)
    },
    // Стилі для контейнера кнопки видалення
    deleteButtonContainer: {
        alignSelf: "flex-end", // Притиснути до нижнього краю контейнера грід-елемента
        textAlign: "right", // Вирівняти саму кнопку вправо
        // pb встановлюється в компоненті залежно від hasErrors
        // gridColumn встановлюється в компоненті (бо він адаптивний)
    },
    // Стилі для кнопки видалення
    deleteButton: {
        size: "md", // Трохи більша для зручності натискання
        colorScheme: "red",
        variant: "ghost",
        // icon та aria-label встановлюються як пропси
    }
};


//////===== ProvidedAidSection =====/////
export const providedAidStyles = {
    marchGroupContainer: {
        mb: 3, // Відступ знизу для груп MARCH
    },
    marchHeading: {
        size: "xs",
        mb: 2,
        // color встановлюється в компоненті
    },
    marchGrid: {
        columns: { base: 2, md: 3 },
        spacing: 3,
    },
    marchCheckbox: {
        // Додаткові стилі для Checkbox, якщо потрібно
        // size: 'sm' // Наприклад
    },
    divider: {
        my: 3,
        borderColor: "gray.200",
    },
    fluidsHeaderHStack: {
        justify: "space-between",
        mb: 2,
    },
    fluidsHeading: {
        size: "xs",
        color: "red.600",
    },
    addFluidButton: {
        size: "xs",
        colorScheme: "pink",
        variant: "outline",
        my: 2, // Зменшив відступ кнопки
    },
    fluidsListVStack: {
        spacing: 3,
        align: "stretch",
    },
    noFluidsText: {
        color: "gray.500",
        fontSize: "sm",
        textAlign: "center",
        py: 2,
    }
};

// Стилі для рядка рідини (FluidRow)
export const fluidRowStyles = {
    containerBox: {
        borderWidth: 1,
        borderRadius: "md",
        p: 2,
        borderColor: "gray.100", // Базовий колір, може бути змінений за помилкою
    },
    grid: {
        columns: { base: 2, md: 5 },
        spacing: 2,
        alignItems: "flex-end", // Вирівнювання по низу
    },
    formLabel: {
        fontSize: "xs",
        mb: 0, // Прибрати відступ для компактності
    },
    inputSize: {
        size: "xs",
    },
    timeHStack: {
        spacing: 1,
    },
    timeButton: {
        size: "xs",
        variant: "outline",
    },
    tooltip: {
        fontSize: "xs",
    },
    deleteButtonContainer: {
        textAlign: "right",
    },
    deleteButton: {
        size: "sm", // Зробимо трохи більшою ніж xs
        colorScheme: "red",
        variant: "ghost",
    },
    otherNameControl: {
        mt: 2, // Відступ зверху для поля "Інше"
    },
    requiredIndicator: {
        color: "red.500",
        ml: 1, // Невеликий відступ для зірочки
    },
     errorMessage: {
        fontSize: "xs",
        mt: 1,
    }
};


///===== PatientDataSection
export const patientDataStyles = {
    grid: {
        columns: { base: 1, md: 3 }, // Адаптивна сітка
        spacing: 4, // Відступи між елементами
        mb: 4, // Відступ знизу після сітки
    },
    formLabel: {
        fontSize: "sm", // Стандартний розмір мітки
        mb: 1, // Відступ знизу мітки
        fontWeight: "medium",
    },
    inputSize: {
        size: "sm", // Стандартний розмір полів вводу
    },
    requiredAsterisk: {
        color: "red.500",
        ml: 1,
    },
    divider: {
        my: 4, // Вертикальні відступи для розділювача
        borderColor: "gray.300",
    },
};

// Стилі для підсекції алергій
export const allergiesStyles = {
    containerFormControl: {
        gridColumn: "1 / -1", // Розтягнути на всі колонки
    },
    label: {
        fontSize: "md", // Трохи більша мітка для секції
        fontWeight: "semibold",
        mb: 2,
    },
    containerBox: {
        borderWidth: "1px",
        borderColor: "white.200",
        borderRadius: "md",
        // borderRadius: "20px",
        p: 3, // Паддінг всередині контейнера
    },
    vStack: {
        align: "stretch",
        spacing: 3, // Відступи між елементами всередині
    },
    nkaCheckbox: {
        fontWeight: "medium",
        size: "lg",
    },
    nkaLabelText: {
        fontSize: "sm",
    },
    knownAllergiesLabelText: {
        fontSize: "sm",
        fontWeight: "medium",
        // color встановлюється динамічно
    },
    knownAllergiesBox: {
        pl: 2, // Невеликий відступ зліва для відомих алергій
    },
    knownAllergensGrid: {
        columns: { base: 2, sm: 3 }, // Адаптивна сітка для чекбоксів
        spacing: 2,
    },
    knownAllergenCheckbox: {
        size: "lg", // Маленькі чекбокси
    },
    otherAllergiesTextarea: {
        size: "sm",
        fontSize: "sm",
        minHeight: "60px", // Мінімальна висота
    },
     errorMessage: { // Стиль для повідомлень помилок в алергіях
        fontSize: "xs",
        color: "red.500",
        mt: 1,
    },
};

// Стилі для RadioGroup Статі
export const genderRadioStyles = {
    stack: {
        direction: 'row', // Горизонтальне розташування
        spacing: 4, // Відступ між радіо-кнопками
    },
    radio: {
        size: 'sm', // Маленькі радіо-кнопки
        size: "lg",
    }
};

//// MECHANISM_SECTION 
export const mechSectionStyles = {
    containerVStack: {
        align: "stretch",
        spacing: 4,
    },
    formLabel: {
        fontSize: "sm",
        fontWeight: "bold",
        mb: 2, // Додамо невеликий відступ
    },
    checkboxGroupStack: {
        spacing: [2, 3], // Трохи збільшимо відступи
        direction: ['column', 'row'], // Адаптивний напрямок
        wrap: "wrap", // Дозволити перенос
        pl: 1, // Невеликий відступ зліва для групи
    },
    checkbox: {
        size: 'lg', // Розмір чекбоксів
    },
    otherInputLabel: {
        fontSize: "sm",
        // fontWeight не потрібен, бо він під основним
    },
    otherInput: {
        size: "sm",
    },
    descriptionTextarea: {
        size: "sm",
        rows: 3,
    },
     errorMessage: { // Стиль для повідомлень помилок
        fontSize: "xs",
        color: "red.500",
        mt: 1,
    }
};


//// TOURNIQUET
export const tourniqSecStyles = {
    grid: {
        columns: { base: 1, sm: 2, md: 4 },
        spacing: 4,
    },
};

export const tourniqLimbStyles = {
    containerBox: {
        borderWidth: 1,
        p: 3,
        borderRadius: "md",
        borderColor: "gray.200", // Базовий колір рамки
    },
    label: {
        fontWeight: "bold",
        mb: 2,
        fontSize: "sm", // Зробимо трохи меншим
    },
    formControl: {
        mb: 2, // Відступ знизу для FormControl
    },
    formLabel: {
        fontSize: "xs", // Маленька мітка
    },
    inputSize: {
        size: "sm", // Однаковий розмір для Select та Input
    },
    requiredIndicator: {
        color: "red.500",
        ml: 1,
    },
     // Стиль для повідомлень помилок (якщо валідація додасться пізніше)
     errorMessage: {
        fontSize: "xs",
        color: "red.500",
        mt: 1,
    }
};

//// MEDICATION_SECTION
export const medicSecStyles = {
    medListVStack: {
        spacing: 3,
        align: "stretch",
    },
    noMedsText: {
        color: "gray.500", // Динамічний колір буде в компоненті
        fontSize: "sm",
        textAlign: "center",
        py: 2,
    },
    addMedButton: {
        size: "xs",
        colorScheme: "purple",
        variant: "outline",
    },
    headerHStack: { // Для кнопки Додати Ліки
        justify: "space-between",
        alignItems: "center",
        mb: 2,
    },
    divider: {
        my: 4,
        borderColor: "gray.200",
    },
    hAndESectionHeading: {
        size: "sm",
        mb: 3,
    },
    hAndEGrid: {
        columns: { base: 1, md: 2 },
        spacingX: 6,
        spacingY: 4,
        alignItems: "start",
    },
    hAndECheckbox: {
        size: "sm",
    },
    hAndEEyeLabel: {
        fontSize: "xs",
        mb: 1,
    },
    hAndEEyeSelect: {
        size: "xs",
    },
    notesControl: {
        // Стилі для FormControl нотаток, якщо потрібно
    },
    notesLabel: {
        fontWeight: "bold",
        mb: 3, // Збільшив відступ
    },
    notesTextarea: {
        size: "sm",
        rows: 3,
    }
};

export const medicationRowStyles = {
    containerBoxBase: {
        borderWidth: 1,
        borderRadius: "15px",
        p: 2,
        // borderColor встановлюється динамічно
    },
    grid: {
        columns: { base: 2, md: 5 },
        spacing: 2,
        alignItems: "flex-start", // Важливо для помилок під полями
    },
    formLabel: {
        fontSize: "xs",
        mb: 0, // Компактні мітки
    },
    inputSize: {
        size: "xs",
    },
    timeHStack: {
        spacing: 1,
    },
    timeButton: {
        size: "xs",
        variant: "outline",
    },
    tooltip: {
        fontSize: "xs",
    },
    dosageInputGroup: {
        size: "xs",
    },
    dosageInput: {
        borderRightRadius: 0,
    },
    dosageUnitAddon: {
        p: 0,
    },
    dosageUnitSelect: {
        size: "xs",
        borderLeftRadius: 0,
        borderLeft: "none",
        width: "80px", // Фіксована ширина для одиниць
    },
    otherNameControl: {
        mt: 2,
    },
    deleteButtonContainer: {
        textAlign: "right",
        // pt: 6, // Прибираємо фіксований відступ, alignSelf впорається
        alignSelf: 'flex-end', // Притискаємо до низу комірки
        pb: '4px', // Невеликий відступ знизу для кнопки
    },
    deleteButton: {
        size: "xs", // Зменшено для відповідності іншим елементам
        colorScheme: "red",
        variant: "ghost",
    },
     errorMessage: {
        fontSize: "xs",
        color: "red.500",
        mt: 1,
        minHeight: "1.2em", // Резервуємо місце, щоб не стрибало
    }
};

export const hypothermiaStyles = {
    containerVStackBase: {
        align: "stretch",
        spacing: 2,
        borderWidth: 0, // За замовчуванням без рамки
        p: 0, // За замовчуванням без паддінга
        borderRadius: "15px",
        // Динамічні стилі (borderWidth, p, borderColor) будуть в компоненті
    },
    mainCheckbox: {
        size: "sm",
        // fontWeight встановлюється динамічно
    },
    detailsVStack: {
        align: "stretch",
        spacing: 2,
        pl: 2, // Відступ зліва для вкладених елементів
        mt: 1,
    },
    selectControl: {
        // Якщо потрібні стилі для FormControl навколо Select
    },
    select: {
        size: "xs",
    },
    otherInputControl: {
        // Якщо потрібні стилі для FormControl навколо Input "Інше"
    },
    otherInput: {
        size: "xs",
    },
     errorMessage: {
        fontSize: "xs",
        color: "red.500",
        mt: 1,
    }
};

//// ADMIN_DATA_SECTION
export const adminDataSectionStyles = {
    sectionHeading: {
        size: "sm", // Зробимо меншим, як підзаголовок
        fontWeight: "semibold", // Напівжирний
        mb: 3,
    },
    providerGrid: {
        columns: { base: 1, md: 2 }, // Адаптивна сітка для провайдера
        spacing: 4,
    },
    formLabel: {
        fontSize: "sm", // Стандартний розмір мітки
        mb: 1,
    },
    inputSize: {
        size: "sm", // Стандартний розмір полів
    },
    divider: {
        my: 4,
        borderColor: "gray.200",
    },
    adminInfoVStack: {
        align: "stretch",
        spacing: 3,
    },
    timestampsGrid: {
        columns: { base: 1, md: 3 }, // Сітка для полів аудиту
        spacing: 4,
    },
    // Стилі для заблокованих полів аудиту
    readOnlyInput: {
        bg: "gray.100", // Фон для візуального відображення
        opacity: 0.7,
        cursor: "not-allowed",
        // Додаткові стилі, якщо потрібно
    }
};