// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import theme from './config/theme'; // Import the custom theme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/med-system/"> {/* Router needs to be outside ChakraProvider if using NavLink active styles */}
      <ChakraProvider theme={theme}> {/* Use your custom theme */}
         {/* Add ColorModeScript if you want persistence based on theme.config */}
         <ColorModeScript initialColorMode={theme.config.initialColorMode} />
         <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);