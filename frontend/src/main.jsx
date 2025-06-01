
 // Скрипт для відновлення шляху після перенаправлення з 404.html на GitHub Pages
 (function() {
   const ss = window.sessionStorage;
   const redirectPath = ss.getItem('ghPages_redirect_path');
   
   if (redirectPath) {
     ss.removeItem('ghPages_redirect_path'); // Видаляємо, щоб не спрацювало знову
     
     // ВАЖЛИВО: basePath ПОВИНЕН ТОЧНО ВІДПОВІДАТИ значенню 'base' у vite.config.js!
     const basePath = '/med-system';
     
     // Новий шлях для history.replaceState буде basePath + відновлений шлях
     // Наприклад, /med-system + /patients/123?tab=details#info
     const newPath = (basePath || '') + redirectPath;
     
     console.log('GH Pages Redirect: Restoring path to', newPath);
     window.history.replaceState(null, '', newPath);
   }
 })();

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import theme from './config/theme'; // Переконайтесь, що цей файл існує та експортує тему

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