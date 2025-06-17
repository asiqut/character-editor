import { defineConfig } from 'vite'

export default defineConfig({
  base: '/character-editor/', // Укажите имя вашего репозитория
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
