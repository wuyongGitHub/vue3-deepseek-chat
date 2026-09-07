<template>
  <div :class="wrapClass">
    <div ref="textRef" class="leading-relaxed break-words">
      <!-- AI 消息 -->
      <div v-if="!inversion">
        <template v-if="!asRawText">
          <!-- 深度思考：X 光透视 + 网格纹理 -->
          <div v-if="reasoning" class="reasoning-wrap mb-2">
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
              </span>
            </button>
            <div v-if="showReasoning" class="reasoning-body markdown-body" v-html="reasoningVal" />
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
import hljs from 'highlight.js'
import { copyToClip } from '@/utils/copy'

const props = defineProps<{
  inversion?: boolean
  error?: boolean
  text?: string
  reasoning?: string
  loading?: boolean
  asRawText?: boolean
}>()

const showReasoning = ref(true)
function changeShowReasoning() {
  showReasoning.value = !showReasoning.value
}
const mdi = new MarkdownIt({
  html: false,
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
  const base = ['text-wrap', 'min-w-20px', 'rounded-2xl', 'px-4 py-2.5', 'text-[15px]', 'leading-relaxed']
  if (props.inversion) {
    // 用户气泡：渐变 + 玻璃高光
    return [...base, 'bubble-user', 'bubble-shine', { 'text-red-300': props.error }]
  }
  // AI 气泡：磨砂玻璃 + 左上高光
  return [...base, 'bubble-ai', props.error ? 'bubble-error' : 'bubble-shine']
})

const textVal = computed(() => {
  const value = props.text ?? ''
  if (!props.asRawText) {
    const escapedText = escapeBrackets(escapeDollarNumber(value))
    return mdi.render(escapedText)
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
/* ===== 用户气泡 ===== */
.bubble-user {
  background-image: var(--bubble-user);
  color: var(--bubble-user-text);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--brand) 30%, transparent);
}

/* ===== AI 气泡（磨砂玻璃） ===== */
.bubble-ai {
  background-color: var(--bubble-ai);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  backdrop-filter: blur(16px) saturate(140%);
  color: var(--bubble-ai-text);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
.bubble-error {
  color: #ef4444;
}

/* 左上角玻璃高光：模拟光源打在玻璃边缘 */
.bubble-shine {
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 88px;
    height: 44px;
    border-radius: 50% 0 80% 0 / 100% 0 80% 0;
    background: radial-gradient(circle at 20% 10%, var(--bubble-ai-highlight), transparent 65%);
    opacity: 0.7;
    pointer-events: none;
  }
}

/* ===== 深度思考：X 光透视 + 网格 ===== */
.reasoning-wrap {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.reasoning-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  color: var(--text-secondary);
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--reasoning-line);
  background: color-mix(in srgb, var(--reasoning-line) 26%, transparent);
  transition: all 0.2s ease;
  &:hover {
    background: color-mix(in srgb, var(--reasoning-line) 45%, transparent);
    color: var(--text-primary);
  }
}
.reasoning-label {
  font-weight: 600;
  letter-spacing: 0.4px;
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
