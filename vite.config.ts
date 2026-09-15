import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from "unocss/vite";
// import { pathResolve } from './build/utils';
import path from 'path'
// https://vite.dev/config/
export default defineConfig( (env) => {
  const viteEnv = loadEnv(env.mode, process.cwd())
  return {
    plugins: [
      vue(),
      UnoCSS(),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: false })],
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'css' })],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '#': path.resolve(__dirname, './src/types'),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    optimizeDeps: {
      // 懒加载路由 /chat（chat/index.vue）依赖链里的大库，默认不会被 Vite 启动时预打包。
      // 移动端首次访问 /chat 时才会触发 optimizeDeps 重扫 + esbuild 预打包并 full-reload，
      // 若此时 HMR/WebSocket 未就绪就会一直白屏，刷新后才恢复。这里显式提前预打包规避。
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'element-plus',
        '@element-plus/icons-vue',
        'axios',
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/features',
        'echarts/renderers',
        'markdown-it',
        '@vscode/markdown-it-katex',
        'katex',
        'highlight.js',
      ],
    },
    server: {
      port: 3002, // 端口号
      host: true, // 监听所有地址
      open: false, // 关闭自动打开：dev server 重启时会重新激活浏览器窗口，导致最小化后被弹回
      hmr: true, // 开启热更新
      cors: true, // 跨域允许
      proxy:{
        '/api': {
          target: viteEnv.VITE_APP_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // 玻璃检测智能体服务代理（无鉴权，独立地址）
        '/agent': {
          target: viteEnv.VITE_AGENT_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/agent/, ''),
        }
      } // 跨域处理, see：https://cn.vitejs.dev/config/server-options.html#server-proxy
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // 把体积大、变更不频繁的第三方库拆成独立 chunk，便于浏览器长期缓存，
          // 二次刷新时大库直接命中缓存，显著缩短白屏时间
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('echarts') || id.includes('zrender')) return 'echarts'
            if (id.includes('element-plus') || id.includes('@element-plus')) return 'element-plus'
            if (id.includes('highlight.js') || id.includes('markdown-it') || id.includes('katex') || id.includes('mermaid')) return 'markdown'
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vueuse') || id.includes('@vue/')) return 'vue'
            return undefined
          },
        },
      },
    },
  }
})
