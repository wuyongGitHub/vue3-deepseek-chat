<template>
  <div class="h-full flex flex-col relative">
    <!-- 顶部会话标题 -->
    <header class="chat-header h-56px shrink-0 flex items-center justify-center">
      <div class="chat-title" v-if="dataSources.length">{{ currentChatHistory?.title }}</div>
      <div v-else class="text-sm text-center text-tertiary">新建的对话会展示在这里</div>
    </header>

    <!-- 消息滚动区 -->
    <main class="overflow-hidden flex-1 min-h-0">
      <el-scrollbar ref="scrollRef">
        <div id="scroll-box" class="chat-scroll-box w-full max-w-3xl mx-auto px-6 py-6 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <!-- 空状态：玻璃检测智能工作台首页 -->
          <div v-if="!dataSources.length" class="welcome pt-8 md:pt-16 pb-12">
            <div class="welcome-mark">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2.5 21 19H3L12 2.5Z" fill="var(--brand)" />
                <path d="M12 9v7M12 12.5l-3.2 6h6.4L12 12.5Z" fill="var(--brand-2)" opacity="0.9" />
              </svg>
            </div>
            <h1 class="welcome-title">聚玻明视 AI</h1>
            <p class="welcome-tagline">玻璃检测 · 数据分析 · 技术知识</p>
            <p class="welcome-desc">我可以帮你分析玻璃缺陷、检测数据，以及生产过程中的质量问题。</p>

            <div class="welcome-block">
              <div class="welcome-section-title">常用能力</div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="c in capabilities"
                  :key="c.title"
                  class="cap-card"
                  @click="useCapability(c)"
                >
                  <span class="cap-icon"><el-icon :size="20"><component :is="c.icon" /></el-icon></span>
                  <span class="cap-title">{{ c.title }}</span>
                  <span class="cap-desc">{{ c.desc }}</span>
                </button>
              </div>
            </div>

            <div class="welcome-block">
              <div class="welcome-section-title">你可能想问</div>
              <div class="flex flex-col gap-0.5">
                <button
                  v-for="s in suggestions"
                  :key="s.text"
                  class="ask-item"
                  @click="useSuggestion(s)"
                >
                  <span class="ask-dot" />
                  <span class="ask-text">{{ s.text }}</span>
                </button>
              </div>
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
              :intent="item.intent"
              :chart="item.chart"
              :images="item.images"
              :files="item.files"
              :inversion="item.inversion"
              :error="item.error"
              :loading="item.loading"
              :backend="backend" />
          </div>
        </div>
      </el-scrollbar>
    </main>

    <!-- 输入区（悬浮玻璃） -->
    <footer class="shrink-0">
      <div class="composer-wrap max-w-3xl mx-auto px-6 pb-6 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        <div class="glass-strong rounded-[18px] px-5 py-4 composer">
          <!-- 附件预览：图片缩略 / 文档卡片（仿 ChatGPT / 通义千问） -->
          <div v-if="attachments.length" class="attach-preview-row">
            <transition-group name="attach">
              <div v-for="a in attachments" :key="a.uid" class="attach-chip">
                <img
                  v-if="a.kind === 'image'"
                  :src="a.thumbUrl"
                  class="attach-chip-thumb"
                  alt=""
                />
                <span v-else class="attach-chip-fileicon">
                  <el-icon :size="18"><Document /></el-icon>
                </span>
                <div class="attach-chip-meta">
                  <div class="attach-chip-name" :title="a.name">{{ a.name }}</div>
                  <div class="attach-chip-size">{{ formatSize(a.size) }}</div>
                </div>
                <button
                  class="attach-chip-remove"
                  type="button"
                  :disabled="loading"
                  @click="removeAttachment(a.uid)"
                >
                  <el-icon :size="12"><Close /></el-icon>
                </button>
              </div>
            </transition-group>
          </div>

          <el-input
            v-model="prompt"
            class="composer-input"
            :autosize="{ minRows: 2, maxRows: 5 }"
            type="textarea"
            resize="none"
            :placeholder="backend === 'agent'
              ? '描述你的问题，可上传或粘贴图片与文档（Shift + Enter 换行）'
              : '发送消息，Shift + Enter 换行'"
            @keydown.enter.exact.prevent="handleSubmit"
            @paste="onPaste"
          />
          <div class="flex items-center justify-between pt-2">
            <!-- 左侧：输入能力（图片 / 文档） -->
            <div class="flex items-center gap-1">
              <template v-if="backend === 'agent'">
                <button
                  class="attach-btn"
                  type="button"
                  title="上传图片（可多选）"
                  :disabled="loading"
                  @click="imageInput?.click()">
                  <el-icon :size="17"><Picture /></el-icon>
                </button>
                <button
                  class="attach-btn"
                  type="button"
                  title="上传文档（可多选）"
                  :disabled="loading"
                  @click="fileInput?.click()">
                  <el-icon :size="17"><Document /></el-icon>
                </button>
              </template>
              <span class="text-xs text-tertiary composer-tip">{{ composerTip }}</span>
            </div>
            <!-- 右侧：模型 / Agent 切换 + 发送 -->
            <div class="flex items-center gap-2">
              <div class="backend-switch">
                <button
                  class="backend-chip"
                  :class="{ active: backend === 'deepseek' }"
                  @click="switchBackend('deepseek')">DeepSeek</button>
                <button
                  class="backend-chip"
                  :class="{ active: backend === 'agent' }"
                  @click="switchBackend('agent')">玻璃智能体</button>
              </div>
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
                :disabled="!canSend"
                :icon="Position"
                @click="handleSubmit" />
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- 隐藏文件选择器：多图 / 多文档 -->
    <input
      ref="imageInput"
      type="file"
      hidden
      multiple
      accept="image/jpeg,image/png,image/webp,image/bmp,image/gif"
      @change="onPickImages"
    />
    <input
      ref="fileInput"
      type="file"
      hidden
      multiple
      accept=".md,.txt,.pdf,.docx,.pptx,.xlsx"
      @change="onPickFiles"
    />

    <!-- 右侧悬浮：回到顶部 / 到底部 -->
    <div v-if="dataSources.length" class="scroll-actions">
      <button class="scroll-btn" title="回到顶部" @click="scrollToTopAnimated">
        <el-icon :size="18"><Top /></el-icon>
      </button>
      <button class="scroll-btn" title="到底部" @click="scrollToBottomAnimated">
        <el-icon :size="18"><Bottom /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Position, CloseBold, Top, Bottom, Picture, Document, Close, Search, DataAnalysis, Reading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import Message from './components/Message/index.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { chatCompletions } from '@/api/chat'
import { agentChatStream, agentChatUpload } from '@/api/agent'
import { useChat } from './hooks/useChat'
import { useScroll } from './hooks/useScroll'
import { useChatStore, useAppStore } from '@/store'
import { useRoute } from 'vue-router'
import { useReadStream } from './hooks/useReadStream'
import { setPendingSubmit, takePendingSubmit, type PendingAttachment } from './hooks/useComposer'

interface Suggestion {
  category: '问答' | '数据'
  text: string
}

const suggestions: Suggestion[] = [
  { category: '问答', text: '气泡和结石怎么区分？判定标准是什么？' },
  { category: '问答', text: '检测电子玻璃表面划伤用什么光源？' },
  { category: '数据', text: '最近一个月各厂家的检出率对比' },
]

// 欢迎页「常用能力」卡片
interface Capability {
  icon: unknown
  title: string
  desc: string
  prompt?: string
  action?: 'upload'
}

const capabilities: Capability[] = [
  { icon: Search, title: '缺陷分析', desc: '分析玻璃缺陷', prompt: '帮我分析这批玻璃的缺陷类型与成因' },
  { icon: DataAnalysis, title: '数据分析', desc: '检查检出趋势', prompt: '近一个月生产整体情况' },
  { icon: Reading, title: '技术问答', desc: '标准 / 工艺知识', prompt: '气泡和结石怎么区分？判定标准是什么？' },
  { icon: Document, title: '报告分析', desc: '上传报告分析', action: 'upload' },
]

// 与后端 glass-inspection-agent-server app/main.py 保持一致的支持范围
const IMAGE_EXT_SET = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'])
const DOC_EXT_SET = new Set(['.md', '.txt', '.pdf', '.docx', '.pptx', '.xlsx'])

let controller = new AbortController()
const chatStore = useChatStore()
const appStore = useAppStore()
const route = useRoute()

// 会话方法
const { addChat, updateChat } = useChat()
const { scrollRef, scrollToBottom, scrollToTop, scrollToBottomIfAtBottom, scrollToTopAnimated, scrollToBottomAnimated } = useScroll()
const { handleStreamResponse } = useReadStream()
const { uuid } = route.params as { uuid: string }
// 输入框
const prompt = ref<string>('')
const loading = ref<boolean>(false)
// 待发送附件（图片 + 文档）
const attachments = ref<PendingAttachment[]>([])
const imageInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()
// 对话信息
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)

// 是否开启多轮对话，开启后会带上之前的聊天信息
const usingContext = computed<boolean>(() => chatStore.usingContext)
// 当前后端模型类型
const backend = computed(() => appStore.backend)

// 快捷指令填充输入框
function useSuggestion(s: Suggestion) {
  prompt.value = s.text
  handleSubmit()
}

// 常用能力卡片：有默认问题的直接提问；「报告分析」切换到智能体并唤起文件选择
function useCapability(c: Capability) {
  if (c.action === 'upload') {
    appStore.setBackend('agent')
    ElMessage.info('已切换到「玻璃智能体」，请上传报告文件')
    fileInput.value?.click()
    return
  }
  if (c.prompt) {
    prompt.value = c.prompt
    handleSubmit()
  }
}
async function handleSubmit() {
  if (!+uuid || +uuid === 0) {
    chatStore.addHistory({
      title: '新建会话',
      uuid: Date.now(),
      isEdit: false,
      visible: false,
    })
    // 暂存文字与附件，路由跳转重建组件后由 onMounted 恢复并自动发送
    setPendingSubmit({ prompt: prompt.value, attachments: [...attachments.value] })
    return
  }
  onConversation()
}

// 发送按钮是否可用：输入了文字，或已添加图片/文档附件
const canSend = computed(() => {
  if (loading.value) return false
  return prompt.value.trim() !== '' || attachments.value.length > 0
})

// 输入区底部提示文案
const composerTip = computed(() => (usingContext.value ? '已开启上下文' : ''))

async function onConversation() {
  if (loading.value) return
  const message = prompt.value.trim()
  const pendingAtts = [...attachments.value]
  if (!message && pendingAtts.length === 0) return

  // 流式输出信号
  controller = new AbortController()
  const conversationList = dataSources.value.filter(item => item.text).map(item => ({
    role: item.inversion ? 'user' : 'assistant',
    content: item.text,
  } as Chat.ConversationMessage))

  // 把附件图片压缩成缩略 dataURL 用于气泡展示（切换会话后仍可见）；文档仅记元数据
  const imageThumbs = (
    await Promise.all(
      pendingAtts.filter(a => a.kind === 'image').map(a => compressImageToDataUrl(a.file)),
    )
  ).filter((r): r is string => !!r)
  const fileMetas = pendingAtts.filter(a => a.kind === 'file').map(a => ({ name: a.name, size: a.size }))

  // 添加用户消息到对话框（文字 + 多图 + 多文件）
  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: message,
    images: imageThumbs.length ? imageThumbs : undefined,
    files: fileMetas.length ? fileMetas : undefined,
    inversion: true,
    error: false,
  })
  // 释放本地预览 URL 并清空输入与附件
  pendingAtts.forEach(a => a.thumbUrl && URL.revokeObjectURL(a.thumbUrl))
  attachments.value = []
  prompt.value = ''
  scrollToBottom()
  loading.value = true
  // 添加AI初始对话 思考信息
  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: '',
    reasoning: '',
    loading: true,
    inversion: false,
    error: false,
  })
  scrollToBottom()
  // 开始发起请求：玻璃智能体带附件走多模态上传；纯文本沿用 SSE 流式
  if (backend.value === 'agent') {
    if (pendingAtts.length) {
      await onAgentUploadConversation(message, pendingAtts)
    } else {
      await onAgentConversation(message)
    }
  } else {
    await onDeepseekConversation(message, conversationList)
  }
}

// ===================== 多模态附件 =====================

/** 根据扩展名归类附件：图片（视觉）或文档（文件问答） */
function classifyFile(file: File): PendingAttachment['kind'] | null {
  const extDot = `.${(file.name.split('.').pop() || '').toLowerCase()}`
  if (IMAGE_EXT_SET.has(extDot) || file.type.startsWith('image/')) return 'image'
  if (DOC_EXT_SET.has(extDot)) return 'file'
  return null
}

function addAttachments(files: File[]) {
  for (const file of files) {
    const kind = classifyFile(file)
    if (!kind) {
      ElMessage.warning(
        `暂不支持该格式：${file.name}（图片 jpg/png/webp/bmp/gif；文档 md/txt/pdf/docx/pptx/xlsx）`,
      )
      continue
    }
    const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const item: PendingAttachment = { uid, kind, name: file.name, size: file.size, type: file.type, file }
    if (kind === 'image') {
      item.thumbUrl = URL.createObjectURL(file)
    }
    attachments.value.push(item)
  }
}

function onPickImages(e: Event) {
  const el = e.target as HTMLInputElement
  const files = Array.from(el.files || [])
  el.value = ''
  addAttachments(files)
}

function onPickFiles(e: Event) {
  const el = e.target as HTMLInputElement
  const files = Array.from(el.files || [])
  el.value = ''
  addAttachments(files)
}

/** 根据 MIME 推断图片扩展名（粘贴的图片可能没有文件名） */
function guessImageExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/gif': 'gif',
  }
  return map[mime] || ''
}

/** 粘贴：从剪贴板提取图片 / 文件并加入附件 */
function onPaste(e: ClipboardEvent) {
  if (loading.value) return
  const items = e.clipboardData?.items
  if (!items) return

  const files: File[] = []
  for (const item of Array.from(items)) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (!file) continue
    if (!file.name) {
      const ext = guessImageExt(file.type)
      files.push(new File([file], `粘贴图片_${Date.now()}${ext ? `.${ext}` : ''}`, { type: file.type }))
    } else {
      files.push(file)
    }
  }
  if (!files.length) return

  // 附件仅「玻璃智能体」支持，粘贴时自动切换后端
  e.preventDefault()
  if (backend.value !== 'agent') {
    appStore.setBackend('agent')
    ElMessage.info('已切换到「玻璃智能体」以支持图片 / 文档')
  }
  addAttachments(files)
}

function removeAttachment(uid: string) {
  const idx = attachments.value.findIndex(a => a.uid === uid)
  if (idx !== -1) {
    const [removed] = attachments.value.splice(idx, 1)
    if (removed?.thumbUrl) URL.revokeObjectURL(removed.thumbUrl)
  }
}

/**
 * 把图片文件压缩为缩略 dataURL（长边上限 + JPEG），用于消息气泡与本地历史展示，
 * 避免把原图塞进 localStorage 导致容量溢出。
 */
function compressImageToDataUrl(file: File, maxSide = 1024, quality = 0.82): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onerror = () => resolve(null)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => resolve(null)
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
        const width = Math.max(1, Math.round(img.naturalWidth * scale))
        const height = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0, width, height)
        try {
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          resolve(null)
        }
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/** 附件字节数格式化 */
function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/** 切换后端：DeepSeek（纯文本）与玻璃智能体（支持图片/文档） */
function switchBackend(target: 'agent' | 'deepseek') {
  if (target === 'deepseek' && attachments.value.length) {
    ElMessage.warning('图片/文档附件由「玻璃智能体」处理，请先发送或移除当前附件')
    return
  }
  appStore.setBackend(target)
}

// 玻璃智能体多模态上传（POST /api/chat/upload，非流式，一次返回意图/答案/图表）
async function onAgentUploadConversation(message: string, atts: PendingAttachment[]) {
  try {
    const threadId = String(chatStore.active ?? Date.now())
    const images = atts.filter(a => a.kind === 'image').map(a => a.file)
    const files = atts.filter(a => a.kind === 'file').map(a => a.file)
    const response = await agentChatUpload(message, threadId, { images, files }, controller.signal)
    if (!response.ok) {
      let detail = ''
      try {
        detail = ((await response.json()) as any)?.detail || ''
      } catch {
        /* ignore */
      }
      throw new Error(`HTTP ${response.status}${detail ? `：${detail}` : ''}`)
    }
    const data = await response.json()
    const updates: Chat.Chat = { inversion: false, error: false, loading: false }
    if (data?.intent) updates.intent = data.intent
    updates.text = data?.answer || ''
    if (data?.chart) updates.chart = data.chart
    updateChat(+uuid, dataSources.value.length - 1, updates)
    loading.value = false
  } catch (error: any) {
    handleStreamError(error)
  }
}

// DeepSeek（OpenAI 兼容）对话
async function onDeepseekConversation(message: string, conversationList: Chat.ConversationMessage[]) {
  try {
    const paramMsg: Chat.ConversationMessage[] = []
    if (usingContext.value) {
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
  } catch (error: any) {
    handleStreamError(error)
  }
}

// 玻璃检测智能体对话（SSE，逐节点推送）
async function onAgentConversation(message: string) {
  try {
    const threadId = String(chatStore.active ?? Date.now())
    const response = await agentChatStream(message, threadId, controller.signal)
    await handleStreamResponse(response, (jsonData: any) => {
      for (const node of Object.keys(jsonData)) {
        const payload = jsonData[node] || {}
        const updates: Chat.Chat = { inversion: false, error: false, loading: true }
        let needUpdate = false

        // 意图标签
        if (payload.intent) {
          updates.intent = payload.intent
          needUpdate = true
        }
        // 最终回复（markdown 正文）
        if (payload.final_answer) {
          updates.text = payload.final_answer
          needUpdate = true
        }
        // 图表配置
        if (payload.chart_config) {
          updates.chart = payload.chart_config
          needUpdate = true
        }

        // 其余字段 → 思考过程（router 路由识别属系统过程信息，默认隐藏）
        const rest: Record<string, any> = {}
        for (const key of Object.keys(payload)) {
          if (['intent', 'final_answer', 'chart_config'].includes(key)) continue
          rest[key] = payload[key]
        }
        if (Object.keys(rest).length > 0 && node !== 'router') {
          updates.reasoning = formatAgentNode(node, rest)
          updates.reasoningTime = new Date().toLocaleString()
          needUpdate = true
        }

        if (needUpdate) {
          updateChat(+uuid, dataSources.value.length - 1, updates)
          scrollToBottomIfAtBottom()
        }
      }
    })
    updateChat(+uuid, dataSources.value.length - 1, {
      inversion: false,
      error: false,
      loading: false,
    })
    loading.value = false
  } catch (error: any) {
    handleStreamError(error)
  }
}

// 把智能体各节点帧格式化为「思考过程」文本
function formatAgentNode(node: string, payload: any): string {
  const nodeLabels: Record<string, string> = {
    router: '路由识别',
    data_parse: '参数解析',
    data_execute: '数据执行',
    data_analyze: '数据分析',
    report_generate: '报告生成',
  }
  const label = nodeLabels[node] || node
  const summary: string[] = []
  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value)) {
      summary.push(`${key}: ${value.length} 条`)
    } else if (value !== null && typeof value === 'object') {
      summary.push(`${key}: ${JSON.stringify(value)}`)
    } else {
      summary.push(`${key}: ${value}`)
    }
  }
  return `· ${label}：${summary.join('，')}\n`
}

// 流式错误统一处理
function handleStreamError(error: any) {
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
  const pending = takePendingSubmit()
  if (pending) {
    prompt.value = pending.prompt
    attachments.value = pending.attachments
    if (prompt.value.trim() || attachments.value.length) {
      onConversation()
      return
    }
  }
  // 有历史消息回到底部；新建对话（空会话）回到顶部
  if (dataSources.value.length) {
    scrollToBottom()
  } else {
    scrollToTop()
  }
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
  letter-spacing: 0.2px;
  color: var(--text-primary);
}
.text-tertiary {
  color: var(--text-tertiary);
}

/* ===== 欢迎页（玻璃检测智能工作台） ===== */
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}
.welcome-mark {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
}
.welcome-title {
  margin-top: 20px;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.3px;
}
.welcome-tagline {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}
.welcome-desc {
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary);
  max-width: 420px;
}
.welcome-block {
  width: 100%;
  margin-top: 32px;
}
.welcome-section-title {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  letter-spacing: 0.3px;
}
.cap-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 16px;
  text-align: left;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    border-color: color-mix(in srgb, var(--brand) 35%, transparent);
    background: var(--bg-hover);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
}
.cap-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--brand);
  background: var(--primary-light);
}
.cap-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.cap-desc {
  font-size: 13px;
  color: var(--text-tertiary);
}
.ask-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  text-align: left;
  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  transition: background-color 0.2s ease;
  &:hover {
    background: var(--bg-hover);
  }
}
.ask-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
  opacity: 0.6;
}
.ask-text {
  font-size: 15px;
  line-height: 1.6;
}

/* ===== 右侧悬浮：回到顶部 / 到底部 ===== */
.scroll-actions {
  position: absolute;
  right: 20px;
  bottom: 150px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}
.scroll-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  color: var(--text-secondary);
  box-shadow: var(--glass-shadow);
  transition: all 0.2s ease;
  &:hover {
    color: var(--brand);
    border-color: var(--brand);
    background: var(--glass-bg-hover);
    transform: translateY(-1px);
  }
}
/* 输入区 */
.composer {
  border: 1px solid var(--border-light);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.3s ease;
  &:focus-within {
    box-shadow: 0 6px 20px color-mix(in srgb, var(--brand) 12%, transparent);
    border-color: color-mix(in srgb, var(--brand) 38%, transparent);
  }
}
.composer-tip {
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* ===== 输入区附件预览（多图 + 多文档卡片） ===== */
.attach-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 10px;
}
.attach-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 260px;
  padding: 6px 8px;
  border-radius: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
.attach-chip-thumb {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 8px;
}
.attach-chip-fileicon {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--brand);
  background: color-mix(in srgb, var(--brand) 12%, transparent);
  border-radius: 8px;
}
.attach-chip-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.attach-chip-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 18px;
  color: var(--text-primary);
}
.attach-chip-size {
  font-size: 11px;
  line-height: 14px;
  color: var(--text-tertiary);
}
.attach-chip-remove {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-tertiary);
  background: transparent;
  transition: all 0.15s ease;
  &:hover {
    color: #ef4444;
    background: color-mix(in srgb, #ef4444 14%, transparent);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
/* 附件移除过渡 */
.attach-enter-active,
.attach-leave-active {
  transition: all 0.18s ease;
}
.attach-enter-from,
.attach-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* ===== 附件按钮（仿通义千问/DeepSeek 输入区左侧） ===== */
.attach-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
  transition: all 0.2s ease;
  &:hover {
    color: var(--brand);
    background: color-mix(in srgb, var(--brand) 12%, transparent);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}
.backend-switch {
  display: inline-flex;
  padding: 2px;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}
.backend-chip {
  padding: 2px 10px;
  font-size: 12px;
  line-height: 18px;
  border-radius: 999px;
  cursor: pointer;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  &.active {
    color: #fff;
    background-color: var(--brand);
  }
}
:deep(.composer-input) {
  .el-textarea__inner {
    background: transparent;
    color: var(--text-primary);
    box-shadow: none;
    border: none;
    padding: 4px 2px;
    font-size: 16px;
    line-height: 1.7;
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
  --el-button-size: 40px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background-color: var(--brand);
  box-shadow: none;
  color: #fff;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover:not(.is-disabled) {
    background-color: var(--primary-hover);
  }
  &:active:not(.is-disabled) {
    transform: scale(0.96);
  }
  &:disabled {
    background-color: var(--border);
    color: var(--text-tertiary);
  }
}

/* ===== 移动端适配 ===== */
@media (max-width: 767px) {
  .chat-header {
    display: none;
  }
  .chat-scroll-box {
    padding: 16px !important;
  }
  .composer-wrap {
    padding: 0 16px 12px !important;
  }
  .composer {
    border-radius: 16px;
    padding: 12px 14px;
    // 键盘出现时（聚焦输入）隐藏次要信息，扩大聊天空间
    &:focus-within {
      .backend-switch,
      .composer-tip {
        display: none;
      }
    }
  }
  // 小屏空间有限：隐藏次要状态提示，避免底部工具栏换行成两行
  .composer-tip {
    display: none;
  }
  .backend-chip {
    padding: 2px 8px;
    font-size: 11px;
  }
  .welcome {
    padding: 0 4px;
  }
  .welcome-title {
    font-size: 20px;
  }
  .welcome-desc {
    font-size: 14px;
  }
  .scroll-actions {
    right: 12px;
    bottom: 130px;
  }
}
</style>
