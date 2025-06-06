import React, { useState } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Link as ChakraLink, Text, HStack, Divider,
    InputGroup, InputLeftElement, InputRightElement, IconButton, Icon
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login } from '../services/traumaRecord.api';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await login({ username, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setIsLoading(false);
            if (onLoginSuccess) onLoginSuccess();
        } catch (error) {
            toast({
                title: 'Помилка входу',
                description: error.response?.data?.message || 'Щось пішло не так',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            });
            setIsLoading(false);
        }
    };

    const handleQuickLogin = (user, pass) => {
        setUsername(user);
        setPassword(pass);
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
                        fontWeight="semibold" // Трохи менша жирність
                        mb={2}
                    >
                        Вхід в систему
                    </Heading>
                    <Text fontSize="md" color="gray.500" mb={4} textAlign="center">
                        Будь ласка, увійдіть, щоб продовжити.
                    </Text>
                    
                    <FormControl isRequired>
                        <FormLabel color="gray.600" fontWeight="normal">Ім'я користувача</FormLabel>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" children={<Icon as={FiUser} color="gray.400" />} />
                            <Input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                placeholder="ваше ім'я користувача" 
                                size="lg" 
                                border="1px solid" // Тонка рамка
                                borderColor="gray.200" 
                                _hover={{ borderColor: "gray.300" }}
                                _focus={{ 
                                    borderColor: "gray.500", // Темніший акцент при фокусі
                                    boxShadow: "0 0 0 1px gray.500" 
                                }}
                                borderRadius="md" 
                                bg="gray.50" // Легкий фон для поля
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
                                placeholder="••••••••" 
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
                                    aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
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
                        colorScheme="gray" // Використовуємо сірий колір, як на фото RHODE
                        bg="gray.700" // Темно-сірий фон кнопки
                        _hover={{ bg: "gray.800", boxShadow: 'md' }}
                        width="full" 
                        size="lg" 
                        isLoading={isLoading}
                        whileHover={{ scale: 1.01 }} 
                        whileTap={{ scale: 0.99 }}
                        borderRadius="md" // М'які заокруглення
                        fontWeight="semibold"
                        color="white" // Білий текст на кнопці
                    >
                        Увійти
                    </MotionButton>

                    <Text fontSize="sm" color="gray.600" mt={4}>
                        Немає акаунту?{' '}
                        <ChakraLink 
                            as={RouterLink} 
                            to="/register" 
                            color="gray.700" // Колір посилання як основний сірий
                            fontWeight="bold"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            Зареєструватися
                        </ChakraLink>
                    </Text>
                    
                    {import.meta.env.DEV && (
                        <VStack w="full" pt={4}>
                            <Divider borderColor="gray.200" />
                            <Text fontSize="xs" color="gray.500">Швидкий вхід (Тільки для розробників)</Text>
                            <HStack width="full">
                                {['admin', 'doctor', 'medic'].map(role => (
                                    <MotionButton 
                                        key={role} 
                                        size="sm" 
                                        flex="1" 
                                        variant="outline"
                                        borderColor="gray.200"
                                        color="gray.600"
                                        _hover={{ bg: 'gray.100', borderColor: 'gray.300' }}
                                        onClick={() => handleQuickLogin(role, 'password123')}
                                        whileHover={{ scale: 1.05 }} 
                                        whileTap={{ scale: 0.95 }} 
                                        textTransform="capitalize"
                                        borderRadius="md"
                                    >
                                        {role}
                                    </MotionButton>
                                ))}
                            </HStack>
                        </VStack>
                    )}
                </VStack>
            </form>
        </motion.div>
    );
};

export default LoginPage;