<template>
  <button
    class="theme-slider"
    :class="{ 'is-dark': isDark }"
    role="switch"
    :aria-checked="isDark"
    :aria-label="isDark ? '切换到白天模式' : '切换到黑夜模式'"
    title="切换主题"
    @click="appStore.toggleTheme()"
  >
    <span class="groove">
      <span class="knob">
        <span class="sun-ico"><Sunny /></span>
        <span class="moon-ico"><Moon /></span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useAppStore } from '@/store'

const appStore = useAppStore()
const isDark = computed(() => appStore.theme === 'dark')
</script>

<style scoped lang="scss">
.theme-slider {
  position: relative;
  width: 120px;
  height: 32px;
  display: flex;
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg-hover);
  padding: 3px;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  transition: background 0.3s ease;

  .groove {
    position: relative;
    width: 100%;
    height: 100%;
  }

  // 玻璃球滑块：白天=太阳，黑夜=月亮，由 knob 上叠加图标翻转显隐
  .knob {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: radial-gradient(circle at 32% 26%, #ffffff, #b9c6d8);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.75);
    transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;

    .sun-ico,
    .moon-ico {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.25s ease, transform 0.3s ease;
    }
    .sun-ico {
      color: #f6a821;
      opacity: 1;
    }
    .moon-ico {
      color: #7b61ff;
      opacity: 0;
      transform: rotate(90deg) scale(0.4);
    }
  }

  svg {
    width: 17px;
    height: 17px;
  }

  // 黑夜：玻璃球滑到右侧变暗并显示月亮，营造“暗夜”
  &.is-dark {
    background: rgba(18, 21, 29, 0.35);
    .knob {
      transform: translateX(100%);
      background: radial-gradient(circle at 32% 26%, #f2f2ff, #262c3d);
      .sun-ico {
        opacity: 0;
        transform: rotate(-90deg) scale(0.4);
      }
      .moon-ico {
        opacity: 1;
        transform: rotate(0) scale(1);
      }
    }
  }
}
</style>
