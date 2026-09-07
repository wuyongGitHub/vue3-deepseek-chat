import { defineStore } from "pinia";
import { ss, ls } from "@/utils/storage";

export type ThemeMode = 'light' | 'dark'

export function applyTheme(theme: ThemeMode) {
  const el = document.documentElement
  if (theme === 'dark') el.classList.add('dark')
  else el.classList.remove('dark')
}

function resolveInitTheme(): ThemeMode {
  const saved = ls.get('app-theme') as ThemeMode | undefined
  if (saved === 'light' || saved === 'dark') return saved
  return 'dark'
}

export interface AppState {
  siderCollapsed: boolean;
  theme: ThemeMode;
  token: string | undefined;
}

export const useAppStore = defineStore("app-store", {
  state: (): AppState => ({
    siderCollapsed: ss.get("siderCollapsedApp") ?? false,
    theme: resolveInitTheme(),
    token: ss.get("tokenApp"),
  }),
  actions: {
    setSiderCollapsed(collapsed: boolean) {
      this.siderCollapsed = collapsed;
      ss.set("siderCollapsedApp", this.siderCollapsed);
    },
    initTheme() {
      applyTheme(this.theme);
    },
    setTheme(theme: ThemeMode) {
      this.theme = theme;
      applyTheme(theme);
      ls.set('app-theme', theme);
    },
    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    },
    setToken(token: string) {
      this.token = token;
      ss.set("tokenApp", this.token);
    },
  },
});
