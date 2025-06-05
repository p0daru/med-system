// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Link as ChakraLink, Text, HStack, Divider,
    InputGroup, InputLeftElement, InputRightElement, IconButton, Flex, Icon
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { login } from '../services/traumaRecord.api';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MotionButton = motion(Button);

const LoginPage = ({ onLoginSuccess }) => {
    // Стан для форми входу
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
                title: 'Помилка входу', description: error.response?.data?.message || 'Щось пішло не так',
                status: 'error', duration: 5000, isClosable: true, position: 'top'
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={6}>
                                <Heading as="h2" size="xl" color="gray.700">Вхід в систему</Heading>
                                
                                <FormControl isRequired>
                                    <FormLabel>Ім'я користувача</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" children={<Icon as={FiUser} color="gray.300" />} />
                                        <Input 
                                            type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                            placeholder="наприклад, admin" size="lg" 
                                            focusBorderColor="red.400"
                                        />
                                    </InputGroup>
                                </FormControl>
                                
                                <FormControl isRequired>
                                    <FormLabel>Пароль</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" children={<Icon as={FiLock} color="gray.300" />} />
                                        <Input
                                            type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" size="lg"
                                            focusBorderColor="red.400"
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
                                                variant="ghost"
                                                icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <MotionButton
                                    type="submit" colorScheme="red" width="full" size="lg" isLoading={isLoading}
                                    whileHover={{ scale: 1.02, boxShadow: 'lg' }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Увійти
                                </MotionButton>

                                <Text fontSize="sm">
                                    Немає акаунту?{' '}
                                    <ChakraLink as={RouterLink} to="/register" color="red.500" fontWeight="bold">
                                        Зареєструватися
                                    </ChakraLink>
                                </Text>
                                
                                {import.meta.env.DEV && (
                                    <VStack w="full" pt={4}>
                                        <Divider />
                                        <Text fontSize="xs" color="gray.500">Швидкий вхід (Only4Devs)</Text>
                                        <HStack width="full">
                                            {['admin', 'doctor', 'medic'].map(role => (
                                                <MotionButton 
                                                    key={role} size="sm" flex="1" variant="outline"
                                                    onClick={() => handleQuickLogin(role, 'password123')}
                                                    whileHover={{ scale: 1.1, bg: 'gray.100' }}
                                                    whileTap={{ scale: 0.9 }} textTransform="capitalize"
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