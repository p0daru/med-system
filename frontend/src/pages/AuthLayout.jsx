// frontend/src/pages/AuthLayout.jsx
import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const animatedTexts = [
    {
        line1: "Ласкаво просимо в нову еру екстреної допомоги.",
        line2: "Де дані передаються так само швидко, як від них залежить життя."
    },
    {
        line1: "Щороку понад 4.4 мільйона людей гине від травм.",
        line2: "Джерело: Всесвітня організація охорони здоров'я"
    },
    {
        line1: "Ефективна догоспітальна допомога може запобігти до 40% цих смертей.",
        line2: "Швидкі та точні дані – це ключ."
    },
    {
        line1: "Давайте змінимо статистику. Разом.",
        line2: "Один запис за раз."
    }
];

const AuthLayout = ({ children }) => {
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex(prevIndex => (prevIndex + 1) % animatedTexts.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Flex minH="100vh" w="full" bg="gray.50">
            {/* Ліва, брендована та АНІМОВАНА частина */}
            <Flex
                w={{ base: 0, md: '55%' }} // На мобільних ховаємо (ширина 0)
                bgGradient="linear(to-br, blue.50, red.50)"
                display={{ base: 'none', md: 'flex' }} // Також ховаємо через display
                alignItems="center"
                justifyContent="center"
                p={12}
                direction="column"
            >
                <VStack spacing={8} textAlign="center" color="gray.800">
                    <Heading as="h1" size="3xl" letterSpacing="tight" color="gray.700">
                        TRAUMA RECORDS
                    </Heading>
                    <Box h="120px">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={textIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.7, ease: "easeInOut" }}
                            >
                                <Text fontSize="2xl" color="gray.600">{animatedTexts[textIndex].line1}</Text>
                                <Text fontSize="md" color="red.500" fontWeight="medium" mt={2}>{animatedTexts[textIndex].line2}</Text>
                            </motion.div>
                        </AnimatePresence>
                    </Box>
                </VStack>
            </Flex>

            {/* Права частина з формою */}
            <Flex
                w={{ base: '100%', md: '45%' }} // На мобільних займає всю ширину
                align="center"
                justify="center"
                p={{ base: 6, sm: 8, md: 12 }}
                bg="white"
            >
                <Box w="full" maxW="md">
                    {children} {/* Тут буде рендеритися або LoginPage, або RegisterPage */}
                </Box>
            </Flex>
        </Flex>
    );
};

export default AuthLayout;