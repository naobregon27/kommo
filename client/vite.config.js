import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  esbuild: {
    loader: 'jsx',
    include: /\.(jsx|js)$/,
    exclude: [],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://crm-server-q3jg.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
