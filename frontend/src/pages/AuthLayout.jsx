import React from 'react';
import { Box, Flex, Text, VStack, Icon, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiZap, FiShield, FiGlobe, FiAward } from 'react-icons/fi';

// Варіанти анімації для Framer Motion (залишаємо)
const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const iconHover = {
    scale: 1.1,
    color: "white", // Змінимо колір іконки при наведенні
    transition: { type: "spring", stiffness: 300, damping: 10 }
};

const AuthLayout = ({ children }) => {
    return (
        // Головний контейнер - дуже світлий, чистий фон
        <Flex
            minH="100vh"
            w="full"
            align="center"
            justify="center"
            bg="#F8F9FA" // Дуже світлий, майже білий фон
            p={4} // Невеликий відступ від країв екрану
        >
            {/* Контейнер-рамка, візуально виділений - МАЙЖЕ НА ВЕСЬ ЕКРАН */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    width: '100%',
                    maxWidth: 'calc(100vw - 200px)', // Займає майже всю ширину (100vw - p*2)
                    height: 'auto',
                    minHeight: 'calc(100vh - 200px)', // Займає майже всю висоту (100vh - p*2)
                    display: 'flex',
                    borderRadius: '25px', // Сучасне заокруглення
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(38, 34, 34, 0.15), 0 0 20px rgba(220, 190, 190, 0.05)', // Більш виразна, але м'яка тінь
                    backgroundColor: 'white',
                    position: 'relative',
                }}
            >
                {/* Ліва половина для інформаційного блоку */}
                <Flex
                    w={{ base: '100%', md: '55%' }} // Злегка збільшуємо ліву частину
                    display={{ base: 'none', md: 'flex' }} // ХОВАЄМО НА МОБІЛЬНИХ
                    alignItems="center"
                    justifyContent="center"
                    // Сучасний градієнт
                    bg="linear-gradient(135deg,rgba(99, 133, 187, 0.32) 0%,rgb(0, 0, 0) 100%)" // Глибокий синьо-чорний градієнт
                    position="relative"
                    p={12}
                    zIndex="1"
                >
                    <VStack spacing={8} textAlign="center" color="white" px={8} maxWidth="900px">
                        <motion.div variants={itemVariants}>
                            <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="extrabold" letterSpacing="tight" lineHeight="shorter">
                                TRAUMA RECORDS SYSTEM
                            </Text>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="medium" maxWidth="800px" color="whiteAlpha.800">
                                Спрощуємо доступ до критичних даних, щоб Ви могли рятувати життя та покращувати якість медичної допомоги.
                            </Text>
                        </motion.div>

                        {/* Розділ "Ключові переваги" */}
                        <motion.div variants={itemVariants} style={{ width: '100%' }}>
                            <Box mt={10} p={8} bg="rgba(206, 197, 197, 0.1)" borderRadius="2xl" backdropFilter="blur(5px)" boxShadow="lg" borderWidth="1px" borderColor="whiteAlpha.300">
                                <Text fontSize="2xl" fontWeight="bold" mb={6} color="whiteAlpha.900">
                                    Наші переваги:
                                </Text>
                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                                    <VStack align="flex-start" spacing={3}>
                                        <motion.div whileHover={iconHover}>
                                            <Icon as={FiZap} w={10} h={10} color="whiteAlpha.900" />
                                        </motion.div>
                                        <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900">Миттєвий доступ</Text>
                                        <Text fontSize="md" color="whiteAlpha.700">
                                            Швидкий пошук та перегляд даних про травми в режимі реального часу.
                                        </Text>
                                    </VStack>
                                    <VStack align="flex-start" spacing={3}>
                                        <motion.div whileHover={iconHover}>
                                            <Icon as={FiShield} w={10} h={10} color="whiteAlpha.900" />
                                        </motion.div>
                                        <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900">Надійний захист</Text>
                                        <Text fontSize="md" color="whiteAlpha.700">
                                            Гарантуємо найвищий рівень безпеки та конфіденційності медичних записів.
                                        </Text>
                                    </VStack>
                                    <VStack align="flex-start" spacing={3}>
                                        <motion.div whileHover={iconHover}>
                                            <Icon as={FiGlobe} w={10} h={10} color="whiteAlpha.900" />
                                        </motion.div>
                                        <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900">Глобальний вплив</Text>
                                        <Text fontSize="md" color="whiteAlpha.700">
                                            Аналітика даних для покращення протоколів на національному та міжнародному рівнях.
                                        </Text>
                                    </VStack>
                                    <VStack align="flex-start" spacing={3}>
                                        <motion.div whileHover={iconHover}>
                                            <Icon as={FiAward} w={10} h={10} color="whiteAlpha.900" />
                                        </motion.div>
                                        <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900">Постійний розвиток</Text>
                                        <Text fontSize="md" color="whiteAlpha.700">
                                            Наша система постійно оновлюється та вдосконалюється згідно з новітніми стандартами.
                                        </Text>
                                    </VStack>
                                </SimpleGrid>
                            </Box>
                        </motion.div>
                        
                        {/* Додаткова цитата або контактна інформація */}
                        <motion.div variants={itemVariants}>
                            <Text fontSize="lg" mt={8} color="whiteAlpha.900" fontWeight="medium">
                                "Інновації у медицині починаються з якісних даних."
                            </Text>
                            <Text fontSize="md" mt={2} color="whiteAlpha.700">
                                — команда Trauma Records System
                            </Text>
                        </motion.div>
                    </VStack>
                </Flex>

                {/* Права половина для форми входу/реєстрації */}
                <Flex
                    w={{ base: '100%', md: '45%' }} // Трохи зменшуємо праву частину на десктопі
                    align="center"
                    justify="center"
                    p={{ base: 8, sm: 10, md: 16 }} // ЗБІЛЬШЕНО ВІДСТУПИ ДЛЯ ПРАВОЇ ЧАСТИНИ
                    bg="white"
                >
                    <Box w="full" maxW="md"> {/* Max width буде обмежений стилем motion.div у LoginPage */}
                        {children} {/* Тут буде рендеритися LoginPage або RegisterPage */}
                    </Box>
                </Flex>
            </motion.div>
        </Flex>
    );
};

export default AuthLayout;