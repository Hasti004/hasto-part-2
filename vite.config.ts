import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// pt-2 runs on 5174 so the old site at 5173 can stay live in parallel.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
})
