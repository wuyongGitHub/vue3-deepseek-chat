import { defineStore } from "pinia";
import { ss, ls } from "@/utils/storage";

export type ThemeMode = 'light' | 'dark'
/** 对话后端：DeepSeek（OpenAI 兼容，纯文本流式） / 玻璃智能体（FastAPI + LangGraph，支持多模态） */
export type BackendType = 'agent' | 'deepseek'
/** 聊天正文字号档位 */
export type FontSize = 'small' | 'medium' | 'large'
/** 聊天气泡密度档位 */
export type BubbleDensity = 'compact' | 'comfortable' | 'loose'

export function applyTheme(theme: ThemeMode) {
  const el = document.documentElement
  if (theme === 'dark') el.classList.add('dark')
  else el.classList.remove('dark')
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small: '14px',
  medium: '15px',
  large: '16px',
}

const BUBBLE_DENSITY_MAP: Record<BubbleDensity, string> = {
  compact: '16px',
  comfortable: '24px',
  loose: '32px',
}

/** 应用聊天正文字号（写入 CSS 变量 --chat-font-size） */
export function applyFontSize(size: FontSize) {
  document.documentElement.style.setProperty('--chat-font-size', FONT_SIZE_MAP[size])
}

/** 应用聊天气泡间距（写入 CSS 变量 --msg-gap） */
export function applyBubbleDensity(density: BubbleDensity) {
  document.documentElement.style.setProperty('--msg-gap', BUBBLE_DENSITY_MAP[density])
}

function resolveInitTheme(): ThemeMode {
  const saved = ls.get('app-theme') as ThemeMode | undefined
  if (saved === 'light' || saved === 'dark') return saved
  return 'dark'
}

export interface AppState {
  /** 用户手动设置的侧边栏状态（持久化，作为宽屏下的偏好） */
  siderCollapsed: boolean;
  /** 视口自动强制收起（窗口变窄时驱动，仅存内存、不持久化） */
  siderAutoCollapsed: boolean;
  /** 移动端抽屉侧边栏是否打开（仅存内存、不持久化） */
  mobileSiderOpen: boolean;
  theme: ThemeMode;
  backend: BackendType;
  /** 聊天正文字号 */
  fontSize: FontSize;
  /** 聊天气泡密度 */
  bubbleDensity: BubbleDensity;
  /** 设置弹窗是否打开（仅内存态） */
  settingVisible: boolean;
  token: string | undefined;
}

export const useAppStore = defineStore("app-store", {
  state: (): AppState => ({
    siderCollapsed: ss.get("siderCollapsedApp") ?? false,
    siderAutoCollapsed: false,
    mobileSiderOpen: false,
    theme: resolveInitTheme(),
    backend: (ls.get("chat-backend") as BackendType) ?? "agent",
    fontSize: (ls.get("app-font-size") as FontSize) ?? "medium",
    bubbleDensity: (ls.get("app-bubble-density") as BubbleDensity) ?? "comfortable",
    settingVisible: false,
    token: ss.get("tokenApp"),
  }),
  getters: {
    /** 实际生效的收起状态：用户偏好 或 窗口变窄时的自动收起 */
    siderCollapsedEffective: (state): boolean =>
      state.siderCollapsed || state.siderAutoCollapsed,
  },
  actions: {
    setSiderCollapsed(collapsed: boolean) {
      this.siderCollapsed = collapsed;
      ss.set("siderCollapsedApp", this.siderCollapsed);
    },
    /** 切换侧边栏（用户手动触发）：更新持久化偏好，并解除视口自动收起 */
    toggleSiderCollapsed() {
      const effective = this.siderCollapsed || this.siderAutoCollapsed;
      this.siderAutoCollapsed = false;
      this.setSiderCollapsed(!effective);
    },
    /** 视口状态驱动：窗口变窄自动收起，变宽后回落到用户偏好 */
    applyViewportSider(narrow: boolean) {
      this.siderAutoCollapsed = narrow;
    },
    openMobileSider() {
      this.mobileSiderOpen = true;
    },
    closeMobileSider() {
      this.mobileSiderOpen = false;
    },
    toggleMobileSider() {
      this.mobileSiderOpen = !this.mobileSiderOpen;
    },
    initTheme() {
      applyTheme(this.theme);
      applyFontSize(this.fontSize);
      applyBubbleDensity(this.bubbleDensity);
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
    setBackend(backend: BackendType) {
      this.backend = backend;
      ls.set("chat-backend", backend);
    },
    setFontSize(size: FontSize) {
      this.fontSize = size;
      ls.set("app-font-size", size);
      applyFontSize(size);
    },
    setBubbleDensity(density: BubbleDensity) {
      this.bubbleDensity = density;
      ls.set("app-bubble-density", density);
      applyBubbleDensity(density);
    },
    openSetting() {
      this.settingVisible = true;
    },
    closeSetting() {
      this.settingVisible = false;
    },
  },
});
