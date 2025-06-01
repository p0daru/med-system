// frontend/src/components/UI/ConfirmationModal.jsx
import React from 'react';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Text,
    Icon, // Для можливого додавання іконки
    HStack // Для кнопок
} from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons'; // Приклад іконки

/**
 * Компонент модального вікна для підтвердження дії.
 *
 * @param {object} props - Пропси компонента.
 * @param {boolean} props.isOpen - Стан видимості модального вікна (контролюється useDisclosure).
 * @param {Function} props.onClose - Функція для закриття модального вікна.
 * @param {Function} props.onConfirm - Функція, що викликається при підтвердженні дії.
 * @param {string} props.title - Заголовок модального вікна.
 * @param {string|React.ReactNode} props.body - Тіло (основний текст) модального вікна.
 * @param {string} [props.confirmButtonText="Так, підтвердити"] - Текст кнопки підтвердження.
 * @param {string} [props.cancelButtonText="Скасувати"] - Текст кнопки скасування.
 * @param {string} [props.confirmButtonColorScheme="red"] - Колірна схема кнопки підтвердження (наприклад, "red" для видалення).
 * @param {boolean} [props.isConfirmLoading=false] - Стан завантаження для кнопки підтвердження.
 * @param {React.ReactNode} [props.icon] - Іконка, яка може відображатися поруч із заголовком.
 */
function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    body,
    confirmButtonText = "Так, підтвердити",
    cancelButtonText = "Скасувати",
    confirmButtonColorScheme = "red", // За замовчуванням для небезпечних дій
    isConfirmLoading = false,
    icon = <Icon as={WarningTwoIcon} w={6} h={6} color="red.500" mr={3} /> // Іконка за замовчуванням
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom" size={{ base: "sm", md: "md" }}>
            <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
            <ModalContent borderRadius="lg" boxShadow="xl">
                <ModalHeader display="flex" alignItems="center">
                    {icon}
                    {title}
                </ModalHeader>
                <ModalCloseButton _focus={{ boxShadow: "outline" }} />
                <ModalBody>
                    {typeof body === 'string' ? <Text>{body}</Text> : body}
                </ModalBody>

                <ModalFooter borderTopWidth="1px" borderColor="gray.200" pt={3} pb={4} px={6}>
                    <HStack spacing={3} width="100%" justifyContent="flex-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            isDisabled={isConfirmLoading}
                            minW="100px"
                            _focus={{ boxShadow: "outline" }}
                        >
                            {cancelButtonText}
                        </Button>
                        <Button
                            colorScheme={confirmButtonColorScheme}
                            onClick={onConfirm}
                            isLoading={isConfirmLoading}
                            loadingText="Обробка..."
                            minW="120px"
                            _focus={{ boxShadow: "outline" }}
                        >
                            {confirmButtonText}
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ConfirmationModal;