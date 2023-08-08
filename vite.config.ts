import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { ViteAliases } from 'vite-aliases'
// import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import * as path from 'path'


export default defineConfig({

  assetsInclude: ['**/*.yml'],

  plugins: [
    vue(),
    // ViteAliases(),
    // createSvgIconsPlugin({ 
    //     iconDirs: [path.resolve(process.cwd(), 'src/assets/content/icons/svg')],
    //   // 指定symbolId格式 
    //     symbolId: 'icon-[dir]-[name]',
    // }), 
  ],

  server: {
    port: 9527,
    open: true,
    host: '0.0.0.0',
    hmr: true
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '@/style/var/index.scss' as *;`,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "comps": path.resolve(__dirname, "src/components"),
    }
  },
})
