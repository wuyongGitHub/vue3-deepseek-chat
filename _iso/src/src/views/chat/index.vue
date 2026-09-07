<template>
  <div class="h-full flex flex-col">
    <!-- 顶部会话标题 -->
    <header class="h-56px shrink-0 flex items-center justify-center">
      <div class="chat-title" v-if="dataSources.length">{{ currentChatHistory?.title }}</div>
      <div v-else class="text-sm text-center text-tertiary">新建的对话会展示在这里</div>
    </header>

    <!-- 消息滚动区 -->
    <main class="overflow-hidden flex-1 min-h-0">
      <el-scrollbar ref="scrollRef">
        <div id="scroll-box" class="w-full max-w-3xl mx-auto px-6 py-4">
          <!-- 空状态 -->
          <div v-if="!dataSources.length" class="flex flex-col items-center text-center pt-20 pb-10">
            <div class="empty-orb">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--brand)" stroke-width="1.4" />
                <circle cx="12" cy="12" r="4" fill="var(--brand)" opacity="0.55" />
                <circle cx="12" cy="12" r="13.5" stroke="var(--brand)" stroke-width="0.8" opacity="0.4" stroke-dasharray="3 6" />
              </svg>
            </div>
            <h2 class="mt-6 text-2xl font-bold hero-title">我是 聚玻明视AI助手，很高兴见到你</h2>
            <p class="mt-3 text-sm hero-sub">我可以帮你写代码、读文件、构思创意内容，请把你的任务交给我吧～</p>
            <div class="mt-8 flex flex-wrap justify-center gap-2 max-w-xl hero-chips">
              <span
                v-for="t in suggestions"
                :key="t"
                class="px-4 py-2 text-sm rounded-full cursor-pointer chip-item"
                @click="useSuggestion(t)"
              >{{ t }}</span>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-else>
            <Message
              v-for="(item, index) of dataSources"
              :key="index"
              :date-time="item.dateTime"
              :text="item.text"
              :reasoning="item.reasoning"
              :inversion="item.inversion"
              :error="item.error"
              :loading="item.loading" />
          </div>
        </div>
      </el-scrollbar>
    </main>

    <!-- 输入区（悬浮玻璃） -->
    <footer class="shrink-0">
      <div class="max-w-3xl mx-auto px-6 pb-6">
        <div class="glass-strong rounded-2xl px-4 py-3 composer">
          <el-input
            v-model="prompt"
            class="composer-input"
            :autosize="{ minRows: 2, maxRows: 5 }"
            type="textarea"
            resize="none"
            placeholder="发送消息，Shift + Enter 换行"
            @keydown.enter.exact.prevent="handleSubmit"
          />
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-tertiary composer-tip">{{ usingContext ? '已开启上下文' : '' }}</span>
            <div class="flex items-center">
              <el-button
                v-if="loading"
                type="primary"
                circle
                class="lens-btn"
                :icon="CloseBold"
                @click="handleStop" />
              <el-button
                v-else
                type="primary"
                circle
                class="lens-btn"
                :disabled="!prompt || !prompt.trim()"
                :icon="Position"
                @click="handleSubmit" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Position, CloseBold } from '@element-plus/icons-vue'
import Message from './components/Message/index.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { chatCompletions } from '@/api/chat'
import { useChat } from './hooks/useChat'
import { useScroll } from './hooks/useScroll'
import { useChatStore } from '@/store'
import { useRoute } from 'vue-router'
import { useReadStream } from './hooks/useReadStream'
import { ss } from "@/utils/storage";

const suggestions = [
  '帮我写一段 Vue3 组合式 API 的示例代码',
  '用通俗的语言解释什么是毛玻璃 UI',
  '把这段英文翻译成中文',
]

let controller = new AbortController()
const chatStore = useChatStore()
const route = useRoute()

// 会话方法
const { addChat, updateChat } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { handleStreamResponse } = useReadStream()
const { uuid } = route.params as { uuid: string }
// 输入框
const prompt = ref<string>('')
const loading = ref<boolean>(false)
// 对话信息
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)

// 是否开启多轮对话，开启后会带上之前的聊天信息
const usingContext = computed<boolean>(() => chatStore.usingContext)

// 快捷指令填充输入框
function useSuggestion(t: string) {
  prompt.value = t
  handleSubmit()
}
async function handleSubmit() {
  if (!+uuid || +uuid === 0) {
    chatStore.addHistory({
      title: '新建会话',
      uuid: Date.now(),
      isEdit: false,
      visible: false,
    })
    ss.set('chatSubmitPrompt', prompt.value)
    return
  }
  onConversation()
}
async function onConversation() {
  let message = prompt.value
  if (loading.value) return
  if (!message || message.trim() === '') return
  // 流式输出信号
  controller = new AbortController()
  const conversationList = dataSources.value.filter(item => item.text).map(item => ({
    role: item.inversion ? 'user' : 'assistant',
    content: item.text,
  } as Chat.ConversationMessage))
  // 添加用户消息到对话框
  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: message,
    inversion: true,
    error: false,
  })
  scrollToBottom()
  loading.value = true
  prompt.value = ''
  // 添加AI初始对话 思考信息
  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: '',
    reasoning: '思考中...',
    loading: true,
    inversion: false,
    error: false,
  })
  scrollToBottom()
  // 开始发起请求
  try {
    const paramMsg = []
    if (usingContext.value) {
      // AI回复
      paramMsg.push(...conversationList)
    }
    paramMsg.push({ role: 'user', content: message })
    const response: any = await chatCompletions(controller.signal, paramMsg)
    await handleStreamResponse(response, (jsonData: any) => {
      const contentText = jsonData.choices[0]?.delta?.content
      if (contentText) {
        updateChat(+uuid, dataSources.value.length - 1, {
          text: contentText ?? '',
          inversion: false,
          error: false,
          loading: true,
        })
        scrollToBottomIfAtBottom()
      }
      // 思考信息
      const reasoning = jsonData.choices[0].delta.reasoning_content
      if (reasoning) {
        updateChat(+uuid, dataSources.value.length - 1, {
          reasoning: reasoning ?? '',
          reasoningTime: new Date().toLocaleString(),
          inversion: false,
          error: false,
          loading: true,
        })
        scrollToBottomIfAtBottom()
      }
    })
    updateChat(+uuid, dataSources.value.length - 1, {
      inversion: false,
      error: false,
      loading: false,
    })
    loading.value = false
    console.log('Stream ended')
  } catch (error: any) {
    console.log(error)
    loading.value = false
    if (error instanceof DOMException && error.name === 'AbortError') {
      updateChat(+uuid, dataSources.value.length - 1, {
        text: '\n\n用户手动中断。',
        inversion: false,
        error: false,
        loading: false,
      })
    } else {
      updateChat(+uuid, dataSources.value.length - 1, {
        text: '\n\n服务器异常，请稍后再试。',
        inversion: false,
        error: true,
        loading: false,
      })
    }
  }
}
function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}
onMounted(() => {
  if (!route.params.uuid) {
    chatStore.active = 1002
  }
  const promptValue = ss.get('chatSubmitPrompt')
  if (promptValue) {
    prompt.value = promptValue
    ss.set('chatSubmitPrompt', '')
    onConversation()
  }
  scrollToBottom()
})
onUnmounted(() => {
  if (loading.value) controller.abort()
})
</script>

<style scoped lang="scss">
.chat-title {
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.text-tertiary {
  color: var(--text-tertiary);
}

.hero-title {
  color: var(--text-primary);
}
.hero-sub {
  color: var(--text-secondary);
}
.hero-chips {
  color: var(--text-secondary);
}
.chip-item {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  &:hover {
    background: var(--glass-bg-hover);
    border-color: var(--brand);
    color: var(--brand);
    transform: translateY(-1px);
  }
}
.empty-orb {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  animation: orb-float 6s ease-in-out infinite;
  svg {
    filter: drop-shadow(0 0 12px color-mix(in srgb, var(--brand) 50%, transparent));
  }
}
@keyframes orb-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 输入区 */
.composer {
  transition: box-shadow 0.2s ease, background-color 0.3s ease;
  &:focus-within {
    box-shadow: 0 8px 30px color-mix(in srgb, var(--brand) 22%, transparent), var(--glass-shadow);
    border-color: color-mix(in srgb, var(--brand) 45%, transparent);
  }
}
.composer-tip {
  color: var(--text-tertiary);
}
:deep(.composer-input) {
  .el-textarea__inner {
    background: transparent;
    color: var(--text-primary);
    box-shadow: none;
    border: none;
    padding: 2px 2px;
    font-size: 15px;
    line-height: 1.6;
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}
:deep(.composer-input) .el-textarea__inner {
  caret-color: var(--brand);
}

/* 圆形透镜发送按钮 */
.lens-btn {
  --el-button-size: 46px;
  width: 46px;
  height: 46px;
  border: none;
  background-image: linear-gradient(135deg, var(--brand), var(--brand-2));
  box-shadow: 0 6px 16px color-mix(in srgb, var(--brand) 40%, transparent),
    inset 0 0 0 1px color-mix(in srgb, #fff 35%, transparent);
  overflow: hidden;
  position: relative;
  color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(.is-disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 10px 24px color-mix(in srgb, var(--brand) 55%, transparent);
  }
  &:active:not(.is-disabled) {
    transform: translateY(0) scale(0.97);
  }

  // 光扫过动画（悬停时出现一道掠光）
  &::after {
    content: '';
    position: absolute;
    top: -20%;
    left: -70%;
    width: 40%;
    height: 140%;
    background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    transform: skewX(-20deg) translateX(-120%);
    transition: none;
  }
  &:hover::after {
    animation: lens-sweep 0.7s ease forwards;
  }
  &:disabled {
    background-image: linear-gradient(135deg, #a9c6d6, #8fb0c4);
    color: rgba(255, 255, 255, 0.8);
  }
}
@keyframes lens-sweep {
  to {
    transform: skewX(-20deg) translateX(420%);
  }
}
</style>
