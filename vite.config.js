import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// TAILWIND CSS
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
})
