import React from 'react';
import { Box, Heading, HStack, Tooltip, IconButton, Button, Flex } from '@chakra-ui/react';
import { RepeatIcon, AddIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

function PatientJournalHeader({ loading, onRefresh, styles }) {
    return (
        <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={3}>
            <Heading {...styles.pageTitle} mb={{ base: 2, md: 0 }}>
                Журнал Пацієнтів
            </Heading>
            <HStack spacing={2}>
                <Tooltip label="Оновити журнал" placement="bottom" openDelay={300}>
                    <IconButton
                        icon={<RepeatIcon />}
                        aria-label="Оновити журнал"
                        onClick={onRefresh}
                        isLoading={loading}
                        colorScheme={styles.secondaryAccentColor?.split('.')[0] || 'teal'}
                        variant="outline"
                        {...styles.actionButton}
                    />
                </Tooltip>
                <Button
                    as={RouterLink}
                    to="/prehospital-care"
                    colorScheme={styles.primaryAccentColor?.split('.')[0] || 'purple'}
                    leftIcon={<AddIcon />}
                    {...styles.actionButton}
                >
                    Нова Картка
                </Button>
            </HStack>
        </Flex>
    );
}

export default PatientJournalHeader;