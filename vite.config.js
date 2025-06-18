import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.psd'],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
