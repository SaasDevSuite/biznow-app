import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setup-test.ts',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
})