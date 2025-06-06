import React, { useState } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Link as ChakraLink, Text,
    InputGroup, InputLeftElement, InputRightElement, IconButton, Icon
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register } from '../services/traumaRecord.api';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast({ 
                title: 'Пароль занадто короткий', 
                description: 'Пароль має містити щонайменше 6 символів.', 
                status: 'error', 
                duration: 5000, 
                isClosable: true, 
                position: 'top'
            });
            return;
        }
        setIsLoading(true);
        try {
            await register({ username, password });
            toast({ 
                title: 'Реєстрація успішна!', 
                description: "Тепер ви можете увійти, використовуючи свої дані.", 
                status: 'success', 
                duration: 5000, 
                isClosable: true, 
                position: 'top'
            });
            navigate('/login');
        } catch (error) {
            toast({ 
                title: 'Помилка реєстрації', 
                description: error.response?.data?.message || 'Щось пішло не так', 
                status: 'error', 
                duration: 5000, 
                isClosable: true, 
                position: 'top'
            });
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                    <Heading 
                        as="h2" 
                        size="xl" 
                        color="gray.700"
                        fontWeight="semibold"
                        mb={2}
                    >
                        Створити акаунт
                    </Heading>
                    <Text fontSize="md" color="gray.500" mb={4} textAlign="center">
                        Приєднайтеся до нас і почніть покращувати збір даних!
                    </Text>
                    <FormControl isRequired>
                        <FormLabel color="gray.600" fontWeight="normal">Ім'я користувача (логін)</FormLabel>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" children={<Icon as={FiUser} color="gray.400" />} />
                            <Input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value.toLowerCase())} 
                                placeholder="ваше унікальне ім'я" 
                                size="lg" 
                                border="1px solid"
                                borderColor="gray.200" 
                                _hover={{ borderColor: "gray.300" }}
                                _focus={{ 
                                    borderColor: "gray.500", 
                                    boxShadow: "0 0 0 1px gray.500" 
                                }}
                                borderRadius="md"
                                bg="gray.50"
                            />
                        </InputGroup>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel color="gray.600" fontWeight="normal">Пароль</FormLabel>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" children={<Icon as={FiLock} color="gray.400" />} />
                            <Input 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Мінімум 6 символів" 
                                size="lg" 
                                border="1px solid"
                                borderColor="gray.200" 
                                _hover={{ borderColor: "gray.300" }}
                                _focus={{ 
                                    borderColor: "gray.500", 
                                    boxShadow: "0 0 0 1px gray.500" 
                                }}
                                borderRadius="md"
                                bg="gray.50"
                            />
                            <InputRightElement width="4.5rem">
                                <IconButton 
                                    h="1.75rem" 
                                    size="sm"
                                    aria-label="Показати/Сховати пароль" 
                                    variant="ghost" 
                                    icon={showPassword ? <FiEyeOff /> : <FiEye />} 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    color="gray.500"
                                />
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                    <MotionButton 
                        type="submit" 
                        colorScheme="gray" 
                        bg="gray.700"
                        _hover={{ bg: "gray.800", boxShadow: 'md' }}
                        width="full" 
                        size="lg" 
                        isLoading={isLoading} 
                        whileHover={{ scale: 1.01 }} 
                        whileTap={{ scale: 0.99 }}
                        borderRadius="md"
                        fontWeight="semibold"
                        color="white"
                    >
                        Зареєструватися
                    </MotionButton>
                    <Text fontSize="sm" color="gray.600" mt={4}>
                        Вже маєте акаунт?{' '}
                        <ChakraLink 
                            as={RouterLink} 
                            to="/login" 
                            color="gray.700" 
                            fontWeight="bold"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            Увійти
                        </ChakraLink>
                    </Text>
                </VStack>
            </form>
        </motion.div>
    );
};

export default RegisterPage;