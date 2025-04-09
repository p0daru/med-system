// PriorAidSection/PriorAidSection.styles.js

export const styles = {
    // Стилі для заголовків секцій та підсекцій
    sectionTitle: {
      fontWeight: "bold",
      mb: 3,
      mt: 5, // Збільшено відступ зверху для розділення
      fontSize: "lg",
      borderBottom: "1px solid", // Додано підкреслення для візуального розділення
      borderColor: "gray.200",
      pb: 1, // Невеликий відступ під текстом
    },
    subSectionTitle: {
      fontWeight: "semibold",
      mb: 2,
      mt: 3,
      fontSize: "md",
      color: "gray.600", // Трохи приглушений колір
    },
  
    // Стиль для рядка медикаменту
    medicationRow: {
      p: 3, // Збільшено внутрішній відступ
      bg: "gray.50", // Постійний легкий фон для виділення
      borderRadius: "md",
      borderWidth: "1px", // Тонка рамка
      borderColor: "gray.100",
      // _hover: { bg: "gray.100" } // Можна залишити ховер або прибрати, якщо фон постійний
    },
  
    // Стиль для таблиці турнікетів (можна додати більше, якщо потрібно)
    tourniquetGrid: {
      // Тут можна додати специфічні стилі для Grid, якщо потрібно
    },
  };
  
  // Можна експортувати й інші константи або об'єкти стилів, якщо потрібно