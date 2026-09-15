<template>
  <div :class="wrapClass">
    <div ref="textRef" class="leading-relaxed break-words">
      <!-- AI 消息 -->
      <div v-if="!inversion">
        <template v-if="!asRawText">
          <!-- 深度思考：X 光透视 + 网格纹理（等待阶段在跳动圆点后显示随机提示） -->
          <div v-if="reasoning || loading" class="reasoning-wrap mb-2">
            <button class="reasoning-toggle" @click="changeShowReasoning">
              <span class="toggle-icon" :class="{ 'is-open': showReasoning }">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="reasoning-label">深度思考</span>
              <span class="reasoning-status">
                <span v-if="loading" class="thinking-dots"><i></i><i></i><i></i></span>
                <svg v-else :class="{ 'is-open': showReasoning }" class="reasoning-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span v-if="showWaitingTip" class="waiting-tip-text">{{ waitingText }}</span>
              </span>
            </button>
            <div v-if="showReasoning && reasoning" class="reasoning-body markdown-body" v-html="reasoningVal" />
          </div>
          <div v-if="textVal" class="markdown-body" :class="{ 'markdown-body-generate': loading }" v-html="textVal" />
        </template>
        <div v-else class="whitespace-pre-wrap" v-text="textVal" />
      </div>
      <!-- 用户消息 -->
      <div v-else class="whitespace-pre-wrap" v-text="textVal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUpdated, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import MdKatex from '@vscode/markdown-it-katex'
import 'katex/dist/katex.min.css'
import MdLinkAttributes from 'markdown-it-link-attributes'
import MdMermaid from 'mermaid-it-markdown'
import hljs from 'highlight.js/lib/common'
import { copyToClip } from '@/utils/copy'

const props = defineProps<{
  inversion?: boolean
  error?: boolean
  text?: string
  reasoning?: string
  loading?: boolean
  asRawText?: boolean
  backend?: string
}>()

const showReasoning = ref(false)
function changeShowReasoning() {
  showReasoning.value = !showReasoning.value
}

// 等待过程中的随机提示
const WAITING_TIPS = [
  '美好的答案，值得片刻的等待。',
  '正在为你编织灵感，请给它一点时间。',
  '好饭不怕晚，我正在努力思考中...',
  '正在穿越数据的星海，马上为你带回答案。',
  '慢一点，是为了给你更准确的拥抱。',
  '大脑正在高速运转，CPU都快冒烟啦，稍等！',
  '正在疯狂翻书找答案，别催别催，马上就好~',
  '正在把散落的思绪拼凑起来，请稍安勿躁。',
  '正在努力理解你的深意，给我几秒钟冷静一下。',
  '正在和服务器进行一场激烈的谈判...',
  '正在深度分析您的请求，以确保回复的准确性。',
  '正在检索海量信息，为您筛选最优解。',
  '复杂问题需要更多思考时间，请稍候。',
  '正在生成专业报告，质量优先，请耐心等待。',
  '思考中...',
  '灵感加载中...',
  '正在生成...',
  '稍候片刻',
]
const waitingText = ref(WAITING_TIPS[Math.floor(Math.random() * WAITING_TIPS.length)])

// 等待提示显示时机：
// - 玻璃智能体（agent）：最终答案输出前一直显示（节点过程照常展示）
// - DeepSeek：正文与思考内容都未出现时才显示
const showWaitingTip = computed(() => {
  if (!props.loading || props.text) return false
  if (props.backend === 'agent') return true
  return !props.reasoning
})
const mdi = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi
  .use(MdLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } })
  .use(MdKatex)
  .use(MdMermaid)

const wrapClass = computed(() => {
  if (props.inversion) {
    // 用户消息：浅灰气泡，右对齐
    return ['text-wrap', 'min-w-20px', 'rounded-2xl', 'px-4 py-2.5', 'leading-relaxed', 'bubble-user', { 'text-red-300': props.error }]
  }
  // AI 消息：去卡片化，纯文本展示
  return ['text-wrap', 'min-w-20px', 'leading-relaxed', 'bubble-ai', { 'bubble-error': props.error }]
})

// 给 markdown 表格单元格补充 data-label（移动端「表格 → 数据卡片」用）
function addTableDataLabels(html: string): string {
  if (!html.includes('<table')) return html
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    doc.querySelectorAll('table').forEach((table) => {
      const headers: string[] = []
      table.querySelectorAll('thead th').forEach((th) => headers.push((th.textContent || '').trim()))
      if (!headers.length) return
      table.querySelectorAll('tbody tr').forEach((tr) => {
        tr.querySelectorAll('td').forEach((td, i) => {
          if (headers[i]) td.setAttribute('data-label', headers[i])
        })
      })
    })
    return doc.body.innerHTML
  } catch {
    return html
  }
}

const textVal = computed(() => {
  const value = props.text ?? ''
  if (!props.asRawText) {
    const escapedText = escapeBrackets(escapeDollarNumber(value))
    return addTableDataLabels(mdi.render(escapedText))
  }
  return value
})
const reasoningVal = computed(() => {
  const value = props.reasoning ?? ''
  if (!props.asRawText) {
    const escapedText = escapeBrackets(escapeDollarNumber(value))
    return mdi.render(escapedText)
  }
  return value
})

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">复制代码</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

function escapeBrackets(text: string) {
  const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g
  return text.replace(pattern, (match, codeBlock, squareBracket, roundBracket) => {
    if (codeBlock) return codeBlock
    else if (squareBracket) return `$$${squareBracket}$$`
    else if (roundBracket) return `$${roundBracket}$`
    return match
  })
}
function escapeDollarNumber(text: string) {
  let escapedText = ''

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i]
    const nextChar = text[i + 1] || ' '

    if (char === '$' && nextChar >= '0' && nextChar <= '9') char = '\\$'

    escapedText += char
  }

  return escapedText
}
const textRef = ref<HTMLElement>()

// 暴露给父组件：获取渲染后的正文 HTML（用于下载导出）
defineExpose({
  getRenderedTextHtml: () => textVal.value,
})

function addCopyEvents() {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.nextElementSibling?.textContent
        if (code) {
          copyToClip(code).then(() => {
            btn.textContent = '复制成功'
            setTimeout(() => {
              btn.textContent = '复制代码'
            }, 1000)
          })
        }
      })
    })
  }
}

function removeCopyEvents() {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach(btn => {
      btn.removeEventListener('click', () => {})
    })
  }
}
onMounted(() => {
  addCopyEvents()
})

onUpdated(() => {
  addCopyEvents()
})

onUnmounted(() => {
  removeCopyEvents()
})
</script>

<style scoped lang="scss">
/* ===== 聊天正文字号（可在设置中调整） ===== */
.text-wrap {
  font-size: var(--chat-font-size, 15px);
}

/* ===== 用户气泡（浅灰，克制） ===== */
.bubble-user {
  background-color: var(--bubble-user);
  color: var(--bubble-user-text);
  border-radius: 14px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

/* ===== AI 消息（无卡片，纯文本） ===== */
.bubble-ai {
  background: transparent;
  color: var(--bubble-ai-text);
}
.bubble-error {
  color: #ef4444;
}

/* ===== 等待随机提示（跟随跳动圆点之后） ===== */
.waiting-tip-text {
  margin-left: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.2px;
}

/* ===== 深度思考：X 光透视 + 网格 ===== */
.reasoning-wrap {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.reasoning-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  user-select: none;
  color: var(--text-tertiary);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  transition: all 0.2s ease;
  &:hover {
    background: var(--bg-hover);
    color: var(--text-secondary);
  }
}
.reasoning-label {
  font-weight: 500;
  letter-spacing: 0.2px;
}
.reasoning-status {
  display: inline-flex;
  align-items: center;
}
.reasoning-chevron {
  transition: transform 0.25s ease;
  &.is-open {
    transform: rotate(180deg);
  }
}
.toggle-icon {
  display: inline-flex;
  transition: transform 0.25s ease;
  &.is-open {
    transform: rotate(90deg);
  }
}

.reasoning-body {
  margin-top: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  background-color: var(--reasoning-bg);
  background-image: linear-gradient(var(--reasoning-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--reasoning-grid) 1px, transparent 1px);
  background-size: 16px 16px;
  border-left: 2px solid var(--reasoning-line);
  border-radius: 10px;
  overflow: hidden;
  max-height: 420px;
  overflow-y: auto;
}

/* 思考中的跳动圆点 */
.thinking-dots {
  display: inline-flex;
  gap: 3px;
  margin-left: 4px;
  i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--brand);
    animation: thinking 1.2s infinite ease-in-out;
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}
@keyframes thinking {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
<style lang="scss">
@import url('./style.scss');
</style>
