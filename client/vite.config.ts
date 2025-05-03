import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // server: {
  //   watch: {
  //     usePolling: true, // Ensures file change detection inside Docker
  //   },
  //   host: '0.0.0.0', // Allows external access
  //   strictPort: true,
  // }
})
