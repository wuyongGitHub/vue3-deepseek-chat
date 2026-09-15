<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { Menu, MoreFilled } from "@element-plus/icons-vue";
import Sider from "./sider/index.vue";
import SettingDialog from "./SettingDialog.vue";
import { useAppStore, useChatStore } from "@/store";

const appStore = useAppStore();
const chatStore = useChatStore();

// 移动端断点：<768px 视为手机
const isMobile = useMediaQuery("(max-width: 767px)");

// 侧边栏自动收起采用「滞后区间」：宽度低于 960 才自动收起，高于 1024 才自动展开，
// 中间区间保持现状。这样能避免滚动条出现/消失（约 15px）或窗口在断点附近波动时，
// 自动收起状态来回横跳，导致「点了收起又立刻弹回来」。
const SIDER_NARROW_BREAKPOINT = 960;
const SIDER_WIDE_BREAKPOINT = 1024;

let lastNarrow: boolean | null = null;
let rafId = 0;

function syncViewport() {
  const width = document.documentElement.clientWidth;
  let next: boolean | null = null;
  if (width < SIDER_NARROW_BREAKPOINT) next = true;
  else if (width > SIDER_WIDE_BREAKPOINT) next = false;
  // 仅在真正跨越滞后区间时才切换，中间抖动一律忽略
  if (next !== null && next !== lastNarrow) {
    lastNarrow = next;
    appStore.applyViewportSider(next);
  }
}

function onResize() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(syncViewport);
}

// 首屏立即按真实视口初始化，避免展开状态闪一下
syncViewport();

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  cancelAnimationFrame(rafId);
});

// 移动端「更多」菜单动作
function handleNewChat() {
  chatStore.createNewChat();
}
function handleSetting() {
  appStore.openSetting();
}
</script>

<template>
  <div class="app-layout h-full flex flex-col relative overflow-hidden transition-all">
    <!-- 玻璃背景层 -->
    <div class="app-backdrop" />

    <!-- 移动端顶部栏 -->
    <header v-if="isMobile" class="mobile-topbar">
      <button class="mobile-menu-btn" title="打开会话列表" @click="appStore.toggleMobileSider()">
        <el-icon :size="20"><Menu /></el-icon>
      </button>
      <div class="mobile-brand">
        <svg class="mobile-brand-mark" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5 21 19H3L12 2.5Z" fill="var(--brand)" />
          <path d="M12 9v7M12 12.5l-3.2 6h6.4L12 12.5Z" fill="var(--brand-2)" opacity="0.9" />
        </svg>
        <span>聚玻明视 · AI助手</span>
      </div>
      <el-dropdown trigger="click">
        <button class="mobile-menu-btn" title="更多">
          <el-icon :size="18"><MoreFilled /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleNewChat">新建对话</el-dropdown-item>
            <el-dropdown-item @click="appStore.toggleTheme()">切换主题</el-dropdown-item>
            <el-dropdown-item @click="handleSetting">设置</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </header>

    <div class="relative z-10 flex flex-1 min-h-0 app-body">
      <!-- 桌面端固定侧边栏 -->
      <Sider v-if="!isMobile" />

      <div class="flex-1 min-w-0 h-full p-4 chat-main">
        <div class="glass-strong chat-frame h-full rounded-2xl overflow-hidden">
          <!-- 懒加载路由：异步 chunk 下载/解析期间展示占位，避免聊天区空白 -->
          <Suspense>
            <RouterView v-slot="{ Component, route }">
              <component :is="Component" :key="route.fullPath" />
            </RouterView>
            <template #fallback>
              <div class="chat-loading">
                <span class="chat-loading-orb"></span>
                <span>正在加载内容...</span>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>

    <!-- 移动端抽屉侧边栏：与顶栏平级，保证覆盖层级高于顶栏 -->
    <div v-if="isMobile" class="mobile-sider" :class="{ 'is-open': appStore.mobileSiderOpen }">
      <div class="mobile-sider-mask" @click="appStore.closeMobileSider()" />
      <div class="mobile-sider-drawer">
        <Sider />
      </div>
    </div>
    <!-- <Permission :visible="needPermission" /> -->

    <!-- 全局设置弹窗 -->
    <SettingDialog />
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  color: var(--text-primary);
  background: transparent;
}
.chat-frame {
  position: relative;
}

/* 懒加载路由占位：居中轻量加载提示，避免白屏 */
.chat-loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 13px;
}
.chat-loading-orb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  border-top-color: var(--brand);
  animation: chat-loading-spin 0.8s linear infinite;
}
@keyframes chat-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 移动端顶部栏 ===== */
.mobile-topbar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  padding: 0 12px;
  flex-shrink: 0;
}
.mobile-menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }
}
.mobile-brand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: var(--text-primary);
  overflow: hidden;
  white-space: nowrap;
}
.mobile-brand-mark {
  flex-shrink: 0;
}

/* ===== 移动端抽屉侧边栏 ===== */
.mobile-sider {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
}
.mobile-sider-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.mobile-sider-drawer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: min(82vw, 320px);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.mobile-sider.is-open {
  pointer-events: auto;
  .mobile-sider-mask {
    opacity: 1;
  }
  .mobile-sider-drawer {
    transform: translateX(0);
  }
}

/* 移动端聊天区收紧内边距 */
@media (max-width: 767px) {
  .chat-main {
    padding: 6px !important;
  }
}
</style>
