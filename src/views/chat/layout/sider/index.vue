<template>
  <div
    class="h-full relative transition-all duration-300 ease"
    :class="{ 'w-68px': collapsed, 'w-260px': !collapsed }"
  >
    <!-- 展开态玻璃面板 -->
    <Transition name="slide-fade">
      <aside
        v-show="!collapsed"
        class="glass absolute top-0 left-0 z-10 w-260px h-full flex flex-col rounded-none overflow-hidden sider-panel"
      >
        <header class="flex justify-between items-center px-4 pt-4 pb-2 shrink-0">
          <div class="flex items-center gap-2.5">
            <!-- 棱镜 Logo -->
            <svg class="brand-mark" width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2.5 21 19H3L12 2.5Z"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
                fill="url(#brandGrad)"
              />
              <path d="M12 9v7M12 12.5l-3.5 6.5h7L12 12.5Z" stroke="rgba(255,255,255,.85)" stroke-width="1.2" fill="none" />
              <defs>
                <linearGradient id="brandGrad" x1="3" y1="19" x2="21" y2="2.5" gradientUnits="userSpaceOnUse">
                  <stop stop-color="var(--brand)" />
                  <stop offset="1" stop-color="var(--brand-2)" />
                </linearGradient>
              </defs>
            </svg>
            <span class="text-lg font-bold tracking-wide brand-text">DeepSeek</span>
          </div>
          <button class="glass-icon-btn" title="收起侧边栏" @click="changeCollapsed">
            <el-icon :size="18"><Fold /></el-icon>
          </button>
        </header>

        <div class="px-4 py-1 shrink-0">
          <el-button class="new-chat-btn" type="primary" :icon="Plus" round @click="handleAdd">
            新建会话
          </el-button>
        </div>

        <div class="flex-1 min-h-0 mt-2 overflow-hidden">
          <List />
        </div>

        <footer class="px-3 py-3 border-t shrink-0 chat-side-footer">
          <div class="flex items-center justify-center">
            <ThemeToggle />
          </div>
        </footer>
      </aside>
    </Transition>

    <!-- 收起态迷你轨道 -->
    <Transition name="slide2-fade">
      <aside
        v-show="collapsed"
        class="glass absolute top-0 left-0 z-9 w-68px h-full flex flex-col items-center py-4 sider-panel-collapsed"
      >
        <button class="glass-icon-btn mb-4" title="展开侧边栏" @click="changeCollapsed">
          <el-icon :size="18"><Expand /></el-icon>
        </button>
        <button class="glass-icon-btn mb-2" title="新建会话" @click="handleAdd">
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
import { computed } from "vue";
import { Fold, Expand, Plus, Sunny, Moon } from "@element-plus/icons-vue";
import List from "./List.vue";
import ThemeToggle from "./ThemeToggle.vue";
import { useChatStore } from "@/store";
import { useAppStore } from "@/store";

const appStore = useAppStore();
const chatStore = useChatStore();
const collapsed = computed(() => appStore.siderCollapsed);
const isDark = computed(() => appStore.theme === 'dark');

function handleAdd() {
  chatStore.createNewChat();
}
function changeCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value);
}
</script>

<style scoped lang="scss">
.brand-text {
  background: linear-gradient(90deg, var(--brand), var(--brand-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.brand-mark {
  color: var(--brand);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--brand) 45%, transparent));
}
.glass-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--glass-border);
  transition: all 0.2s ease;
  &:hover {
    background: var(--list-hover);
    color: var(--brand);
  }
}
.sider-panel {
  border-right: 1px solid var(--glass-border);
}
.sider-panel-collapsed {
  border-right: 1px solid var(--glass-border);
}
.chat-side-footer {
  border-color: var(--glass-border);
}
:deep(.new-chat-btn) {
  width: 100%;
  color: #fff;
  border: none;
  background-image: linear-gradient(90deg, var(--brand), var(--brand-2));
  box-shadow: 0 6px 18px color-mix(in srgb, var(--brand) 35%, transparent);
  &:hover,
  &:focus {
    background-image: linear-gradient(90deg, var(--brand-2), var(--brand));
    opacity: 0.95;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-192px);
  opacity: 0;
}
.slide2-fade-enter-active,
.slide2-fade-leave-active {
  transition: all 0.3s ease;
}
.slide2-fade-leave-to,
.slide2-fade-enter-from {
  opacity: 0;
}
</style>
