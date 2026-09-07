<template>
  <el-scrollbar class="px-2">
    <div class="flex flex-col gap-1">
      <template v-if="!dataSources.length">
        <div class="flex flex-col items-center mt-6 text-center py-6 text-sm list-empty">
          <span>暂无会话，点击「新建会话」开始对话</span>
        </div>
      </template>
      <template v-else>
        <div
          v-for="item in dataSources"
          :key="item.uuid"
          class="group relative h-40px px-3 text-sm rounded-xl flex items-center break-all cursor-pointer chat-list-item"
          :class="isActive(item.uuid) && ['is-active']"
          @click="handleSelect(item)"
        >
          <div class="overflow-hidden flex-1 whitespace-nowrap list-title">
            {{ item.title }}
          </div>
          <div
            class="w-24px h-24px absolute right-8px top-50% -translate-y-1/2 flex items-center justify-center z-1 opacity-0 group-hover:opacity-100 rounded-lg list-item-more"
            :class="isActive(item.uuid) && ['opacity-100']"
            @click.stop="(e) => ((buttonRef = e.currentTarget), (currentItem = item), (visible = !visible))"
          >
            <el-icon :size="16"><MoreFilled /></el-icon>
          </div>
          <div
            class="w-36px pointer-events-none absolute right-0 top-0 bottom-0 rounded-r-xl fade-mask"
            :class="isActive(item.uuid) && ['fade-mask-active']"
          ></div>
        </div>
      </template>
      <el-popover
        virtual-triggering
        ref="popoverRef"
        placement="bottom-start"
        :visible="visible"
        :virtual-ref="buttonRef"
      >
        <div>
          <el-button link type="danger" @click="handleDelete">删除该会话</el-button>
        </div>
      </el-popover>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChatStore } from '@/store'
import { MoreFilled } from '@element-plus/icons-vue'
import { onClickOutside } from '@vueuse/core'

const chatStore = useChatStore()
const dataSources = computed(() => chatStore.history)

const buttonRef = ref<EventTarget | null>()
const currentItem = ref<Chat.History | null>(null)
const visible = ref(false)
const popoverRef = ref()

onClickOutside(popoverRef, () => (visible.value = false))
function isActive(uuid: number) {
  return chatStore.active === uuid
}
async function handleSelect({ uuid }: Chat.History) {
  if (isActive(uuid)) return

  if (chatStore.active) chatStore.updateHistory(chatStore.active, { isEdit: false })
  await chatStore.setActive(uuid)
}
function handleDelete() {
  if (currentItem.value?.uuid) {
    chatStore.deleteHistory(currentItem.value.uuid)
    visible.value = false
  }
}
</script>

<style scoped lang="scss">
.chat-list-item {
  color: var(--text-primary);
  transition: background 0.2s ease;
  &:hover {
    background: var(--list-hover);
  }
  &.is-active {
    background: var(--list-active);
    box-shadow: inset 2px 0 0 0 var(--brand);
  }
  .list-title {
    transition: color 0.2s ease;
  }
  .list-item-more {
    color: var(--text-secondary);
    &:hover {
      background: var(--glass-bg-hover);
    }
  }
}
.fade-mask {
  background: linear-gradient(90deg, transparent, var(--glass-bg-strong));
  opacity: 0;
  transition: opacity 0.2s ease;
}
.group:hover .fade-mask,
.fade-mask-active {
  opacity: 1;
}
.list-empty {
  color: var(--text-tertiary);
}
</style>
