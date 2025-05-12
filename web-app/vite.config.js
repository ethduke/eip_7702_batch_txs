import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  define: {
    // Enable global access to env vars with import.meta.env
    'import.meta.env.HOODI_RPC_URL': JSON.stringify(process.env.VITE_HOODI_RPC_URL),
    'import.meta.env.HOODI_CHAIN_ID': process.env.VITE_HOODI_CHAIN_ID ? parseInt(process.env.VITE_HOODI_CHAIN_ID) : 560048,
    'import.meta.env.PRIVATE_KEY': JSON.stringify(process.env.VITE_PRIVATE_KEY)
  }
})
