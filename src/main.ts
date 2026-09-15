import { createApp } from 'vue'
import { initRouter } from '@/router';
import { initStore, useAppStore } from './store'
import '@/styles/index.scss';
import App from './App.vue';
import "virtual:uno.css";

async function bootstrapApp() {
  const app = createApp(App);
  initStore(app);
  // 根据本地存储应用主题，保证切换状态一致
  useAppStore().initTheme();
  initRouter(app);
  app.mount('#app');
}
bootstrapApp();
