<template>
  <div
    class="sider-root h-full relative transition-all duration-300 ease"
    :class="{
      'w-72px': !isMobile && collapsed,
      'w-288px': !isMobile && !collapsed,
      'w-full': isMobile,
    }"
  >
    <!-- 展开态面板 -->
    <Transition name="slide-fade">
      <aside
        v-show="showExpanded"
        class="absolute top-0 left-0 z-10 w-288px h-full flex flex-col overflow-hidden sider-panel"
        :class="{ 'is-mobile': isMobile }"
      >
        <header class="flex justify-between items-start px-5 pt-5 pb-3 shrink-0">
          <div class="flex items-center gap-3">
            <div class="brand-logo">
              <svg class="brand-mark" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2.5 21 19H3L12 2.5Z"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linejoin="round"
                  fill="url(#brandGrad)"
                />
                <path d="M12 9v7M12 12.5l-3.5 6.5h7L12 12.5Z" stroke="rgba(255,255,255,.9)" stroke-width="1.2" fill="none" />
                <defs>
                  <linearGradient id="brandGrad" x1="3" y1="19" x2="21" y2="2.5" gradientUnits="userSpaceOnUse">
                    <stop stop-color="var(--brand)" />
                    <stop offset="1" stop-color="var(--brand-2)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="flex flex-col leading-tight">
              <span class="brand-name">聚玻明视</span>
              <span class="brand-sub">AI 智能助手</span>
            </div>
          </div>
          <button class="glass-icon-btn" :title="isMobile ? '关闭侧边栏' : '收起侧边栏'" @click="changeCollapsed">
            <el-icon :size="18"><Close v-if="isMobile" /><Fold v-else /></el-icon>
          </button>
        </header>

        <div class="px-5 py-1 shrink-0">
          <el-button class="new-chat-btn" type="primary" :icon="Plus" round @click="handleAdd">
            新建对话
          </el-button>
        </div>

        <div class="flex-1 min-h-0 mt-2 overflow-hidden">
          <List />
        </div>

        <footer class="px-3 py-2 border-t shrink-0 chat-side-footer">
          <div class="flex items-center justify-between gap-2">
            <button class="sider-footer-btn" title="设置" @click="onSetting">
              <el-icon :size="16"><Setting /></el-icon>
              <span>设置</span>
            </button>
            <ThemeToggle />
          </div>
        </footer>
      </aside>
    </Transition>

    <!-- 收起态迷你轨道 -->
    <Transition name="slide2-fade">
      <aside
        v-show="showCollapsed"
        class="absolute top-0 left-0 z-9 w-72px h-full flex flex-col items-center py-4 sider-panel-collapsed"
      >
        <button class="glass-icon-btn mb-4" title="展开侧边栏" @click="changeCollapsed">
          <el-icon :size="18"><Expand /></el-icon>
        </button>
        <button class="glass-icon-btn mb-2" title="新建对话" @click="handleAdd">
          <el-icon :size="20"><Plus /></el-icon>
        </button>
        <div class="flex-1"></div>
        <button class="glass-icon-btn" :title="isDark ? '切换至白天模式' : '切换至黑夜模式'" @click="appStore.toggleTheme()">
          <el-icon :size="18"><Sunny v-if="!isDark" /><Moon v-else /></el-icon>
        </button>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { Fold, Expand, Plus, Sunny, Moon, Close, Setting } from "@element-plus/icons-vue";
import List from "./List.vue";
import ThemeToggle from "./ThemeToggle.vue";
import { useChatStore, useAppStore } from "@/store";

const appStore = useAppStore();
const chatStore = useChatStore();

// 移动端断点：<768px 视为手机
const isMobile = useMediaQuery("(max-width: 767px)");

const collapsed = computed(() => appStore.siderCollapsedEffective);
const isDark = computed(() => appStore.theme === "dark");

// 移动端始终以「展开态抽屉」渲染，不显示迷你轨道
const showExpanded = computed(() => isMobile.value || !collapsed.value);
const showCollapsed = computed(() => !isMobile.value && collapsed.value);

// 移动端选择会话后自动关闭抽屉
watch(
  () => chatStore.active,
  () => {
    if (isMobile.value) appStore.closeMobileSider();
  }
);

function handleAdd() {
  chatStore.createNewChat();
  if (isMobile.value) appStore.closeMobileSider();
}

function onSetting() {
  appStore.openSetting();
}

function changeCollapsed() {
  if (isMobile.value) appStore.closeMobileSider();
  else appStore.toggleSiderCollapsed();
}
</script>

<style scoped lang="scss">
.sider-panel {
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
}
.sider-panel-collapsed {
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
}
.chat-side-footer {
  border-color: var(--border-light);
}

/* ===== 品牌区 ===== */
.brand-logo {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-light);
  border: 1px solid color-mix(in srgb, var(--brand) 18%, transparent);
}
.brand-mark {
  color: var(--brand);
}
.brand-name {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: var(--text-primary);
}
.brand-sub {
  margin-top: 1px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.glass-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  &:hover {
    background: var(--list-hover);
    color: var(--text-primary);
  }
}

.sider-footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 13px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    color: var(--text-primary);
    background: var(--list-hover);
  }
}

/* 新建对话按钮：品牌蓝作为唯二的强强调色之一 */
::v-deep(.new-chat-btn) {
  width: 100%;
  color: var(--brand-2);
  border: 1px solid color-mix(in srgb, var(--brand) 22%, transparent);
  background-color: var(--primary-light);
  box-shadow: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  &:hover,
  &:focus {
    color: var(--brand-2);
    background-color: color-mix(in srgb, var(--brand) 16%, transparent);
    border-color: color-mix(in srgb, var(--brand) 36%, transparent);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  // 过渡期间禁用交互：收起/展开两套面板的按钮位置重叠，
  // 连点/双击会在动画中误触反向按钮，导致「点收起又立刻弹回」
  pointer-events: none;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-180px);
  opacity: 0;
}
.slide2-fade-enter-active,
.slide2-fade-leave-active {
  transition: all 0.3s ease;
  pointer-events: none;
}
.slide2-fade-leave-to,
.slide2-fade-enter-from {
  opacity: 0;
}

/* 移动端：抽屉面板宽度跟随抽屉容器（由 Layout 控制为 85vw / 320px） */
@media (max-width: 767px) {
  .sider-panel {
    width: 100%;
  }
}
</style>
