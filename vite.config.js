import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/ctg-raizes/',
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: '0.0.0.0', // gemini - Força o Vite a escutar todas as interfaces de rede, não só o localhost
    strictPort: true, // gemini - Impede o Vite de mudar de porta caso a 8004 balance
    cors: true,       // gemini - Libera compartilhamento de recursos entre o domínio e a porta
    port: 8004,
    allowedHosts: [
      'if4health.charqueadas.ifsul.edu.br',
      'extensao.charqueadas.ifsul.edu.br'      
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Vite v8 usa oxc por padrão (mais rápido que esbuild/terser)
    target: 'es2015',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Separa vendor libs em chunks dedicados para melhor cache e lazy loading
        manualChunks(id) {
          // jspdf só é usado em Relatorios — ficará em chunk separado
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/jspdf-autotable')) {
            return 'vendor-pdf'
          }
          // React core
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react'
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // Ícones lucide
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
        },
      },
    },
  },
})

