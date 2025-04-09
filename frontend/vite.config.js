// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Рядок '/api' буде замінено на target
      '/api': {
        target: 'http://localhost:5001', // Ваш бек-енд сервер
        changeOrigin: true, // Необхідно для віртуальних хостів
        // secure: false,      // Якщо ваш бек-енд працює на http
        // rewrite: (path) => path.replace(/^\/api/, '') // Якщо бек-енд маршрути НЕ починаються з /api
      }
    }
  },
  base: '/med-system/'
})