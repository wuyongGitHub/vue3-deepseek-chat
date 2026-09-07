<script setup lang="ts">
// import { computed } from "vue";
// // import { NLayout, NLayoutContent } from 'naive-ui'
// import { useRouter } from 'vue-router'
import Sider from "./sider/index.vue";
// import Permission from './Permission.vue'
// import { useAppStore } from "@/store";

// const router = useRouter()
// const appStore = useAppStore();
// const chatStore = useChatStore()
// const authStore = useAuthStore()

// router.replace({ name: 'Chat', params: { uuid: chatStore.active } })

// const collapsed = computed(() => appStore.siderCollapsed);

// const needPermission = computed(() => !!authStore.session?.auth && !authStore.token)

// const getMobileClass = computed(() => {
//   if (isMobile.value)
//     return ['rounded-none', 'shadow-none']
//   return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
// })

// const getContainerClass = computed(() => {
//   return ["h-full", { "pl-260px": !collapsed.value }];
// });
</script>

<template>
  <div class="app-layout h-full relative overflow-hidden transition-all">
    <!-- 玻璃背景层 -->
    <div class="app-backdrop" />
    <div class="relative z-10 flex h-full">
      <Sider />
      <div class="flex-1 min-w-0 h-full p-4">
        <div class="glass-strong chat-frame h-full rounded-2xl overflow-hidden">
          <RouterView v-slot="{ Component, route }">
            <component :is="Component" :key="route.fullPath" />
          </RouterView>
        </div>
      </div>
    </div>
    <!-- <Permission :visible="needPermission" /> -->
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
</style>
