import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/AI_Othello/' // リポジトリ名に完全に一致させる（大文字小文字も含めて）
})
