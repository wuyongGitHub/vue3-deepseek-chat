<template>
  <div class="flex w-full mb-6 msg-row" :class="[inversion ? 'justify-end' : 'justify-start']">
    <!-- AI 头像（左侧） -->
    <template v-if="!inversion">
      <div class="avatar-bubble mr-3 mt-4 shrink-0" title="DeepSeek">
        <svg class="brand-mark" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5 21 19H3L12 2.5Z" fill="var(--brand)" />
          <path d="M12 9v7M12 12.5l-3.2 6h6.4L12 12.5Z" fill="var(--brand-2)" opacity="0.9" />
        </svg>
      </div>
    </template>

    <div class="max-w-[78%] overflow-hidden text-sm">
      <div class="text-xs msg-time" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}
      </div>
      <div class="flex items-end mt-1.5" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :reasoning="reasoning"
          :loading="loading"
          :as-raw-text="asRawText"
        />
      </div>
    </div>

    <!-- 用户头像（右侧） -->
    <template v-if="inversion">
      <div class="avatar-bubble avatar-user ml-3 mt-4 shrink-0" title="我">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.95" />
          <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5v.5H4V20Z" fill="#fff" opacity="0.95" />
        </svg>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import TextComponent from './Text.vue'
import { ref } from 'vue'

const props = defineProps<{
  dateTime?: string
  text?: string
  reasoning?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
}>()
const asRawText = ref(props.inversion)
</script>

<style scoped lang="scss">
.avatar-bubble {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg-strong);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  color: var(--text-secondary);

  .brand-mark {
    filter: drop-shadow(0 0 5px color-mix(in srgb, var(--brand) 45%, transparent));
  }
}
.avatar-user {
  background-image: linear-gradient(135deg, var(--brand), var(--brand-2));
  border: none;
}
.msg-time {
  color: var(--text-tertiary);
}
</style>
