// frontend/src/pages/SplashScreen.jsx
import React, { useState, useEffect } from 'react';
import { VStack, Heading, Text, Center, Spinner } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

// Фрази, які будуть змінюватися
const facts = [
    { text: "Every year, injuries claim over 4.4 million lives worldwide.", source: "WHO" },
    { text: "Effective pre-hospital care can prevent up to 40% of these deaths.", source: "Medical Research" },
    { text: "Timely data saves lives.", source: "" },
    { text: "Let's change the statistics. Together.", source: "" }
];

const SplashScreen = ({ onAnimationComplete }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // Якщо це остання фраза, чекаємо і завершуємо анімацію
        if (index === facts.length - 1) {
            const finalTimeout = setTimeout(() => {
                onAnimationComplete();
            }, 4000); // Даємо час прочитати останню фразу
            return () => clearTimeout(finalTimeout);
        }

        // Таймер для зміни фраз
        const intervalId = setInterval(() => {
            setIndex(prevIndex => prevIndex + 1);
        }, 4000); // Змінюємо фразу кожні 4 секунди

        return () => clearInterval(intervalId);
    }, [index, onAnimationComplete]);

    return (
        <Center h="100vh" w="100vw" bg="gray.700" color="gray.600" p={5}>
            <VStack spacing={8}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <Heading as="h1" size="2xl" textAlign="center" color="white" textShadow="0 0 10px rgba(185, 134, 134, 0.5)">
                        Hello!
                    </Heading>
                    <Text fontSize="lg" mt={2} textAlign="center" maxW="lg">
                        Welcome to the world where trauma no longer has power over human health.
                    </Text>
                </motion.div>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                        style={{ textAlign: 'center' }}
                    >
                        <Text fontSize="xl" fontStyle="italic" color="white">
                            "{facts[index].text}"
                        </Text>
                        {facts[index].source && (
                             <Text fontSize="sm" color="white" mt={1}>
                                – {facts[index].source}
                            </Text>
                        )}
                    </motion.div>
                </AnimatePresence>

                <Spinner size="md" color="red.500" />
            </VStack>
        </Center>
    );
};

export default SplashScreen;