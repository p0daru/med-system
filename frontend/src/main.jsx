// frontend/src/main.jsx
 import React from 'react';
 import ReactDOM from 'react-dom/client';
 import App from './App.jsx';
 import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
 import { BrowserRouter } from 'react-router-dom';
 import theme from './config/theme';

 ReactDOM.createRoot(document.getElementById('root')).render(
   <React.StrictMode>
     <BrowserRouter basename="/med-system/">
       <ChakraProvider theme={theme}>
         <ColorModeScript initialColorMode={theme.config.initialColorMode} />
         <App />
       </ChakraProvider>
     </BrowserRouter>
   </React.StrictMode>
 );