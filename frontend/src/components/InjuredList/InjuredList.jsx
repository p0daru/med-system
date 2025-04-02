import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Text,
  Tag, // Для статусу
  Icon,
  Tooltip // Для підказок на кнопках
} from '@chakra-ui/react';
import { FaEye } from 'react-icons/fa'; // Іконка перегляду

function InjuredList({ injuredList, onViewDetails }) {

  // Функція для отримання кольору тегу статусу
  const getStatusColorScheme = (status) => {
    switch (status) {
      case 'Stable': return 'green';
      case 'Serious': return 'orange';
      case 'Critical': return 'red';
      case 'Evacuated': return 'blue';
      case 'Deceased (KIA)': return 'gray';
      case 'Treated': return 'teal';
      default: return 'gray';
    }
  };

  if (!injuredList || injuredList.length === 0) {
    return <Text>Немає записів для відображення.</Text>;
  }

  return (
    <TableContainer borderWidth="1px" borderRadius="md">
      <Table variant="simple" size="md">
        <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
          <Tr>
            <Th>Ім'я / Позивний</Th>
            <Th>Підрозділ</Th>
            <Th>Статус</Th>
            <Th>Пріоритет евак.</Th>
            <Th>Дата події</Th>
            <Th>Дії</Th>
          </Tr>
        </Thead>
        <Tbody>
          {injuredList.map((injured) => (
            <Tr key={injured._id} _hover={{ bg: 'gray.100', _dark: { bg: 'gray.600' } }}>
              <Td>
                <Text fontWeight="medium">{injured.name}</Text>
                {injured.callSign && <Text fontSize="sm" color="gray.500">{injured.callSign}</Text>}
              </Td>
              <Td>{injured.unit || '-'}</Td>
              <Td>
                <Tag size="sm" colorScheme={getStatusColorScheme(injured.medicalStatus)}>
                    {injured.medicalStatus || 'Невідомо'}
                </Tag>
              </Td>
              <Td>{injured.evacuationPriority || 'Не вказано'}</Td>
              <Td>
                {injured.incidentTimestamp
                  ? new Date(injured.incidentTimestamp).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '-'}
              </Td>
              <Td>
                 <Tooltip label="Переглянути деталі" placement="top">
                     <Button
                       variant="ghost"
                       colorScheme="blue"
                       size="sm"
                       onClick={() => onViewDetails(injured._id)}
                       aria-label="Переглянути деталі"
                     >
                       <Icon as={FaEye} />
                     </Button>
                 </Tooltip>
                 {/* Кнопки Edit/Delete можна додати пізніше на сторінці деталей */}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default InjuredList;