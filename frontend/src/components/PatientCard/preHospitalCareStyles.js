// frontend/src/components/preHospitalCareStyles.js

export const mainBoxStyles = {
  p: { base: 2, md: 10 },
  bg: "white.50", // Світлий фон для основного контейнера
  // bg: "rgba(247, 250, 252, 0.7)", // Як варіант, для "скляного" ефекту, якщо фон сторінки інший
  // backdropFilter: "blur(5px)", // Доповнення до "скляного" ефекту
  borderRadius: "50px",
  shadow: "2xl", // Зробимо тінь трохи менш агресивною, ніж "2xl" для початку
  m: { base: 2, md: 5},
  borderWidth: "1px",
  borderColor: "white",
};

export const headerFlexStyles = {
  mb: 6,
  alignItems: "center",
  borderBottomWidth: "1px",
  borderColor: "gray.400", // Трохи світліше
  pb: 4,
};

export const headerTitleStyles = {
  as: "h2",
  size: { base: "lg", md: "xl" },
  color: "gray.600",
  fontWeight: "bold", // Змінено з semi-bold
};

export const cardIdTextStyles = {
  fontSize: { base: "lg", md: "2xl" },
  fontWeight: "bold",
  color: "gray.500", // Трохи світліше
  ml: 3,
};

export const accordionItemStyles = {
  borderWidth: "10px",
  borderColor: "gray.200",
  borderRadius: "20px", // Більше заокруглення
  mb: 6,
  bg: "white", // Зробимо фон акордеона білим для контрасту
  _hover: { shadow: "lg" }, // Більш виражена тінь при наведенні
  transition: "box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out",
  overflow: "hidden", // Щоб _expanded borderRadius працював правильно
};

export const accordionButtonStyles = {
  py: 4,
  borderRadius: "lg", // Початковий радіус, який зміниться при _expanded
  _hover: { bg: "gray.50" },
  _expanded: { 
    bg: 'gray.200', 
    color: 'black', 
    borderTopRadius:'20px', // Зберігаємо заокруглення зверху
    borderBottomRadius: '0' // Робимо нижню частину прямою для злиття з панеллю
  },
};

export const accordionButtonTextStyles = {
  flex: "1",
  textAlign: "left",
  fontWeight: "semibold", // Раніше було bold, зробимо трохи легше
  fontSize: "lg", // Раніше було xl, зробимо стандартним для підзаголовків
};

export const accordionPanelStyles = {
  pb: 6,
  pt: 5,
  bg: "white", // Явно вказуємо фон
  borderBottomRadius: "xl", // Заокруглення знизу
};

export const formControlLabelStyles = {
    fontWeight: "medium", // Стандартна жирність для лейблів
    mb: "0.5", // Невеликий відступ знизу
    color: "gray.700"
};

export const inputStyles = { // Загальні стилі для Input, Select, Textarea, NumberInput
    borderRadius: "md",
    borderColor: "gray.300",
    _hover: { borderColor: "gray.400" },
    _focus: { 
        borderColor: "gray.400", 
        boxShadow: `0 0 0 1px var(--chakra-colors-gray-400)` 
    },
};

export const nestedListBoxStyles = {
    borderWidth: "1px",
    borderColor: "gray.200",
    borderRadius: "lg",
    p: 4,
    bg: "gray.50", // Фон для вкладених списків
    shadow: "sm"
};

export const actionButtonsHStackStyles = {
    justifyContent: "flex-end",
    spacing: 4,
    mt: 10,
    py: 5,
    borderTopWidth: "1px",
    borderColor: "gray.300"
};

export const primaryButtonStyles = {
    colorScheme: "gray",
    color: "white",
    size: "lg",
    minW: "180px",
    borderRadius: "lg",
    boxShadow: "md",
    _hover: { boxShadow: "lg", bg: "gray.600" },
    _active: { bg: "gray.700" }
};

export const secondaryButtonStyles = { // Для "Очистити", "Тестові дані"
    size: {base: "sm", md: "md"},
    borderRadius: "lg",
    boxShadow: "sm",
    _hover: { boxShadow: "md" }
};