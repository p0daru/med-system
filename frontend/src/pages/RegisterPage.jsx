// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Link as ChakraLink, Text,
    InputGroup, InputLeftElement, InputRightElement, IconButton, Icon
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { register } from '../services/traumaRecord.api'; // Використовуємо функцію register
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
            toast({ title: 'Пароль занадто короткий', description: 'Пароль має містити щонайменше 6 символів.', status: 'error', duration: 5000, isClosable: true, });
            return;
        }
        setIsLoading(true);
        try {
            await register({ username, password });
            toast({ title: 'Реєстрація успішна!', description: "Тепер ви можете увійти, використовуючи свої дані.", status: 'success', duration: 5000, isClosable: true, });
            navigate('/login');
        } catch (error) {
            toast({ title: 'Помилка реєстрації', description: error.response?.data?.message || 'Щось пішло не так', status: 'error', duration: 5000, isClosable: true, });
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}>
            <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                    <Heading as="h2" size="xl" color="gray.700">Створення акаунту</Heading>
                    <FormControl isRequired>
                        <FormLabel>Ім'я користувача (логін)</FormLabel>
                        <InputGroup>
                            <InputLeftElement children={<Icon as={FiUser} color="gray.300" />} />
                            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="наприклад, user123" size="lg" focusBorderColor="red.400" />
                        </InputGroup>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Пароль</FormLabel>
                        <InputGroup>
                            <InputLeftElement children={<Icon as={FiLock} color="gray.300" />} />
                            <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Мінімум 6 символів" size="lg" focusBorderColor="red.400" />
                            <InputRightElement>
                                <IconButton aria-label="Показати/Сховати пароль" variant="ghost" icon={showPassword ? <FiEyeOff /> : <FiEye />} onClick={() => setShowPassword(!showPassword)} />
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                    <MotionButton type="submit" colorScheme="red" width="full" size="lg" isLoading={isLoading} whileHover={{ scale: 1.02, boxShadow: 'lg' }} whileTap={{ scale: 0.98 }}>
                        Зареєструватися
                    </MotionButton>
                    <Text fontSize="sm">
                        Вже маєте акаунт?{' '}
                        <ChakraLink as={RouterLink} to="/login" color="red.500" fontWeight="bold">Увійти</ChakraLink>
                    </Text>
                </VStack>
            </form>
        </motion.div>
    );
};

export default RegisterPage;