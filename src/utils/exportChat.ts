import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
import MdLinkAttributes from 'markdown-it-link-attributes'
import withChartStyle from '@/utils/chartTheme'
import { buildChartHtml, ECHARTS_CDN, ECHARTS_RENDER_SCRIPT, type ChartExportData } from '@/utils/exportHtml'

/**
 * 聊天记录导出工具：生成自包含 HTML（供客户直接打开查看）与 JSON 备份（供导入恢复）
 */

const mdi = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      return `<pre><code class="hljs language-${language}">${hljs.highlight(code, { language: language! }).value}</code></pre>`
    }
    return `<pre><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`
  },
}).use(MdLinkAttributes, { attrs: { target: '_blank', rel: 'noopener' } })

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  return mdi.render(text)
}

/** 复现 Chart.vue 的 getExportData：把后端 chart 配置转成可导出的图表数据（option 已叠加统一主题） */
function formatChartValue(v: any): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number') return v.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  return String(v)
}

function chartSpan(c: Record<string, any>): number {
  return c && typeof c === 'object' && c.option != null ? Number(c.span) || 12 : 12
}

function buildChartExportData(option: Record<string, any>): ChartExportData {
  const isDashboard = option?.layout === 'dashboard'
  if (isDashboard) {
    const kpis = (option?.kpis || []).map((k: any) => ({
      label: String(k?.label ?? ''),
      value: formatChartValue(k?.value),
      unit: k?.unit ? String(k.unit) : undefined,
    }))
    const charts = (option?.charts || []).map((c: any) => {
      const raw = c && typeof c === 'object' && c.option != null ? c.option : c
      return { option: raw ? withChartStyle(raw) : raw, span: chartSpan(c) }
    })
    return { title: option?.title, kpis, charts }
  }
  return { charts: [{ option: withChartStyle(option), span: 12 }] }
}

/** 用户消息：纯文本（保留换行）+ 附件 */
function renderUserMessage(chat: Chat.Chat): string {
  const parts: string[] = []
  const text = chat.text?.trim()
  if (text) {
    parts.push(`<div class="user-text">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`)
  }
  if (chat.images?.length) {
    const imgs = chat.images.map((src) => `<img class="msg-image" src="${src}" alt="图片" />`).join('')
    parts.push(`<div class="msg-images">${imgs}</div>`)
  }
  if (chat.files?.length) {
    const files = chat.files
      .map((f) => `<div class="msg-file"><span class="file-icon">📎</span>${escapeHtml(f.name || '附件')}</div>`)
      .join('')
    parts.push(`<div class="msg-files">${files}</div>`)
  }
  return parts.join('')
}

/** AI 消息：深度思考（折叠）+ markdown 正文 */
function renderAssistantMessage(chat: Chat.Chat): string {
  const parts: string[] = []
  if (chat.reasoning) {
    parts.push(
      `<details class="reasoning"><summary>深度思考</summary><div class="reasoning-body markdown-body">${renderMarkdown(chat.reasoning)}</div></details>`
    )
  }
  if (chat.text) {
    parts.push(`<div class="assistant-text markdown-body">${renderMarkdown(chat.text)}</div>`)
  }
  if (chat.chart && typeof chat.chart === 'object' && Object.keys(chat.chart).length > 0) {
    parts.push(buildChartHtml(buildChartExportData(chat.chart)))
  }
  if (chat.error) {
    parts.push(`<div class="msg-error">⚠ 回复出错</div>`)
  }
  if (chat.loading && !chat.text && !chat.reasoning) {
    parts.push(`<div class="msg-loading">…</div>`)
  }
  return parts.join('')
}

/** 单条消息：角色标签 + 时间 + 内容（id 用于目录锚点定位） */
function renderMessage(chat: Chat.Chat, id: string): string {
  const isUser = !!chat.inversion
  const role = isUser ? '用户' : '助手'
  const time = chat.dateTime ? `<span class="msg-time">${escapeHtml(chat.dateTime)}</span>` : ''
  const body = isUser ? renderUserMessage(chat) : renderAssistantMessage(chat)
  return `<div class="msg ${isUser ? 'msg-user' : 'msg-assistant'}" id="${id}">
    <div class="msg-meta">${role}${time}</div>
    <div class="msg-body">${body}</div>
  </div>`
}

/** 目录中的消息摘要（取首段文字，无文字时用类型占位） */
function messageSummary(chat: Chat.Chat): string {
  if (chat.inversion) {
    const text = chat.text?.trim()
    if (text) return text
    if (chat.images?.length) return `[图片 × ${chat.images.length}]`
    if (chat.files?.length) return `[附件 × ${chat.files.length}]`
    return ''
  }
  const text = chat.text?.trim()
  if (text) return text
  if (chat.reasoning?.trim()) return '[深度思考]'
  if (chat.chart && typeof chat.chart === 'object' && Object.keys(chat.chart).length > 0) return '[图表]'
  if (chat.error) return '[回复出错]'
  return ''
}

function truncateSummary(text: string, max = 18): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return ''
  return t.length > max ? `${t.slice(0, max)}…` : t
}

const TOC_MAX_MSG = 8
const TOC_EDGE = 3

/** 生成会话区块与左侧二级目录（会话标题 -> 消息摘要，消息过多时省略中间） */
function buildConversations(state: Chat.ChatState): { body: string; toc: string } {
  const items = state.chat.filter((item) => item.data.length > 0)
  const bodyParts: string[] = []
  const tocParts: string[] = []

  items.forEach(({ uuid, data }, ci) => {
    const title = state.history.find((h) => h.uuid === uuid)?.title?.trim() || '未命名会话'
    const convId = `conv-${ci}`
    const messages = data.map((msg, mi) => renderMessage(msg, `msg-${ci}-${mi}`)).join('')
    bodyParts.push(`<section class="conversation" id="${convId}">
        <h2 class="conv-title">${escapeHtml(title)}</h2>
        ${messages}
      </section>`)

    const msgItems: string[] = []
    data.forEach((msg, mi) => {
      const summary = truncateSummary(messageSummary(msg))
      if (!summary) return
      const prefix = msg.inversion ? '我' : 'AI'
      msgItems.push(`<li class="toc-msg ${msg.inversion ? 'is-user' : 'is-ai'}"><a href="#msg-${ci}-${mi}"><span class="toc-role">${prefix}</span><span class="toc-text">${escapeHtml(summary)}</span></a></li>`)
    })

    const msgList = msgItems.length > TOC_MAX_MSG
      ? [...msgItems.slice(0, TOC_EDGE), '<li class="toc-ellipsis">…</li>', ...msgItems.slice(-TOC_EDGE)].join('')
      : msgItems.join('')

    tocParts.push(`<li class="toc-conv">
      <a class="toc-conv-link" href="#${convId}">${escapeHtml(title)}</a>
      <ul class="toc-msg-list">${msgList}</ul>
    </li>`)
  })

  return {
    body: bodyParts.join(''),
    toc: tocParts.length
      ? `<aside class="toc" id="toc"><div class="toc-header"><span>目录</span><button class="toc-close" id="tocClose" type="button" aria-label="关闭目录">×</button></div><ul class="toc-list">${tocParts.join('')}</ul></aside>`
      : '',
  }
}

function buildCss(): string {
  return `
:root { color-scheme: light; }
html { scroll-behavior: smooth; overflow-x: hidden; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: #f4f6f9;
  color: #1f2937;
  line-height: 1.7;
  overflow-x: hidden;
}
.page-header {
  background: linear-gradient(135deg, #159ed9, #0f6f9e);
  color: #fff;
  padding: 32px 24px;
  text-align: center;
}
.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}
.page-header .meta {
  margin: 8px 0 0;
  font-size: 13px;
  opacity: 0.9;
}
.layout { padding-left: 260px; }
main {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

/* 目录开关按钮（移动端显示） */
.toc-toggle {
  position: fixed;
  left: 12px;
  top: 12px;
  z-index: 50;
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #159ed9;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
}
.toc-toggle .burger { position: relative; width: 18px; height: 2px; background: #fff; border-radius: 2px; }
.toc-toggle .burger::before,
.toc-toggle .burger::after {
  content: "";
  position: absolute;
  left: 0;
  width: 18px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}
.toc-toggle .burger::before { top: -6px; }
.toc-toggle .burger::after { top: 6px; }

/* 抽屉遮罩 */
.toc-mask {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(15, 23, 42, 0.4);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}
.toc-mask.show { opacity: 1; visibility: visible; }

/* 左侧二级目录（固定定位，不随页面滚动） */
.toc {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 40;
  width: 260px;
  height: 100vh;
  overflow-y: auto;
  padding: 20px 12px 40px;
  background: #f4f6f9;
}
.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  padding: 0 8px 12px;
}
.toc-close {
  display: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #eef2f7;
  color: #64748b;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.toc-list { list-style: none; margin: 0; padding: 0; }
.toc-conv { margin-bottom: 4px; }
.toc-conv-link {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toc-conv-link:hover { background: #eef6fb; color: #159ed9; }
.toc-msg-list { list-style: none; margin: 0; padding: 0 0 0 12px; border-left: 1px solid #e5e9f0; }
.toc-msg a {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
}
.toc-msg a:hover { background: #f1f5f9; color: #159ed9; }
.toc-role { flex-shrink: 0; font-size: 11px; line-height: 16px; padding: 0 4px; border-radius: 4px; }
.toc-msg.is-user .toc-role { color: #159ed9; background: #eef6fb; }
.toc-msg.is-ai .toc-role { color: #7c3aed; background: #f5f3ff; }
.toc-text { overflow: hidden; text-overflow: ellipsis; }
.toc-ellipsis { padding: 2px 8px; color: #cbd5e1; font-size: 13px; list-style: none; }
.conversation, .msg { scroll-margin-top: 16px; }
.conversation {
  background: #fff;
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.conv-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef0f3;
}
.msg { margin-bottom: 16px; }
.msg:last-child { margin-bottom: 0; }
.msg-meta {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.msg-time { opacity: 0.85; }
.msg-user .msg-meta { color: #159ed9; font-weight: 500; }
.msg-body { padding: 12px 16px; border-radius: 12px; }
.msg-user .msg-body {
  background: #eef6fb;
  color: #17212b;
  margin-left: 40px;
}
.msg-assistant .msg-body {
  background: #f8fafc;
  margin-right: 40px;
}
.user-text { white-space: pre-wrap; word-break: break-word; }
.msg-images { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.msg-image { max-width: 240px; max-height: 240px; border-radius: 8px; border: 1px solid #e2e8f0; }
.msg-files { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.msg-file { font-size: 13px; color: #334155; }
.file-icon { margin-right: 4px; }
.msg-error { color: #dc2626; font-size: 13px; margin-top: 6px; }
.msg-loading { color: #94a3b8; }

/* 深度思考折叠块 */
.reasoning {
  margin-bottom: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f1f5f9;
  overflow: hidden;
}
.reasoning summary {
  cursor: pointer;
  padding: 8px 12px;
  font-size: 13px;
  color: #64748b;
  user-select: none;
}
.reasoning-body {
  padding: 10px 14px;
  border-top: 1px solid #e2e8f0;
  font-size: 13px;
  color: #475569;
}

/* markdown 正文（精简） */
.markdown-body { word-break: break-word; overflow-wrap: anywhere; }
.markdown-body h1, .markdown-body h2, .markdown-body h3,
.markdown-body h4, .markdown-body h5, .markdown-body h6 {
  margin: 16px 0 8px;
  font-weight: 600;
  line-height: 1.4;
  color: #111827;
}
.markdown-body h1 { font-size: 20px; border-bottom: 1px solid #eef0f3; padding-bottom: 6px; }
.markdown-body h2 { font-size: 18px; }
.markdown-body h3 { font-size: 16px; }
.markdown-body p { margin: 8px 0; }
.markdown-body a { color: #159ed9; text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body ul, .markdown-body ol { padding-left: 22px; margin: 8px 0; }
.markdown-body li { margin: 4px 0; }
.markdown-body blockquote {
  margin: 8px 0;
  padding: 4px 12px;
  border-left: 3px solid #cbd5e1;
  color: #64748b;
  background: #f8fafc;
}
.markdown-body code {
  background: #eef2f7;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.markdown-body pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px 16px;
  border-radius: 10px;
  overflow-x: auto;
  max-width: 100%;
  margin: 10px 0;
}
.markdown-body pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 13px;
}
.markdown-body table {
  border-collapse: collapse;
  margin: 10px 0;
  width: 100%;
  max-width: 100%;
  display: block;
  overflow-x: auto;
  font-size: 14px;
}
.markdown-body th, .markdown-body td {
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  text-align: left;
}
.markdown-body th { background: #f1f5f9; font-weight: 600; }
.markdown-body img { max-width: 100%; border-radius: 8px; }
.markdown-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }

/* 图表 / 看板（导出） */
.chart-section-title { font-size: 15px; font-weight: 600; margin: 16px 0 12px; }
.chart-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
.chart-kpi-card { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
.chart-kpi-label { font-size: 12px; color: #94a3b8; }
.chart-kpi-value { font-size: 22px; font-weight: 700; color: #1f2937; font-variant-numeric: tabular-nums; }
.chart-kpi-unit { margin-left: 4px; font-size: 12px; font-weight: 500; font-style: normal; color: #94a3b8; }
.chart-grid { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0 16px; }
.chart-item { flex: 0 0 100%; height: 320px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-sizing: border-box; }
.chart-item.is-half { flex: 1 1 calc(50% - 6px); min-width: min(100%, 320px); }
@media (max-width: 767px) {
  .chart-item { height: 240px; }
  .chart-item, .chart-item.is-half { flex: 0 0 100%; min-width: 0; }
}

/* 代码高亮（精简深色主题） */
.hljs { color: #e2e8f0; }
.hljs-comment, .hljs-quote { color: #7dd3fc; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #f472b6; }
.hljs-string, .hljs-doctag, .hljs-regexp { color: #a5d6a7; }
.hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable, .hljs-tag .hljs-attr { color: #fbbf24; }
.hljs-title, .hljs-section, .hljs-selector-id { color: #93c5fd; }
.hljs-title.function_, .hljs-title.class_, .hljs-type { color: #fca5a5; }
.hljs-attr, .hljs-attribute, .hljs-name { color: #fdba74; }
.hljs-built_in, .hljs-builtin-name { color: #67e8f9; }
.hljs-meta { color: #94a3b8; }
.hljs-bullet, .hljs-symbol, .hljs-link { color: #f0abfc; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }

@media print {
  body { background: #fff; }
  .toc { display: none; }
  .conversation { box-shadow: none; border: 1px solid #e2e8f0; }
  .page-header { background: #159ed9; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
@media (max-width: 900px) {
  .layout { padding-left: 0; }
  .toc-toggle { display: inline-flex; }
  .toc-close { display: inline-flex; }
  .toc {
    width: 280px;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 2px 0 16px rgba(15, 23, 42, 0.18);
  }
  .toc.open { transform: translateX(0); }
}
@media (max-width: 640px) {
  .page-header { padding: 24px 16px; }
  .page-header h1 { font-size: 20px; }
  main { padding: 16px 12px 40px; }
  .conversation { padding: 16px 14px; border-radius: 10px; }
  .msg-user .msg-body { margin-left: 0; }
  .msg-assistant .msg-body { margin-right: 0; }
}
`.trim()
}

/** 生成完整的自包含 HTML 文档 */
export function buildChatHtml(state: Chat.ChatState): string {
  const now = new Date().toLocaleString()
  const count = state.chat.filter((item) => item.data.length > 0).length
  const { body: conversations, toc } = buildConversations(state)
  const hasChart = state.chat.some((item) =>
    item.data.some((c) => !!c.chart && typeof c.chart === 'object' && Object.keys(c.chart).length > 0)
  )
  const chartScripts = hasChart ? `<script src="${ECHARTS_CDN}"></script>\n${ECHARTS_RENDER_SCRIPT}\n` : ''
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>聚玻明视 · 聊天记录</title>
<style>
${buildCss()}
</style>
</head>
<body>
<header class="page-header">
  <h1>聚玻明视 · 聊天记录</h1>
  <p class="meta">导出时间：${escapeHtml(now)} ｜ 共 ${count} 个会话</p>
</header>
<button class="toc-toggle" id="tocToggle" type="button" aria-label="打开目录"><span class="burger"></span></button>
<div class="toc-mask" id="tocMask"></div>
<div class="layout">
${toc}
<main>
${conversations || '<p class="empty" style="text-align:center;color:#94a3b8;padding:40px 0;">暂无聊天记录</p>'}
</main>
</div>
<script>
(function () {
  var toc = document.getElementById('toc');
  var mask = document.getElementById('tocMask');
  var toggle = document.getElementById('tocToggle');
  var closeBtn = document.getElementById('tocClose');
  if (!toc || !mask || !toggle || !closeBtn) return;
  function openToc() { toc.classList.add('open'); mask.classList.add('show'); }
  function closeToc() { toc.classList.remove('open'); mask.classList.remove('show'); }
  toggle.addEventListener('click', openToc);
  closeBtn.addEventListener('click', closeToc);
  mask.addEventListener('click', closeToc);
  var links = toc.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', closeToc);
  }
})();
</script>
${chartScripts}</body>
</html>`
}

/** 生成 JSON 备份字符串（供导入恢复） */
export function buildChatJson(state: Chat.ChatState): string {
  return JSON.stringify(state, null, 2)
}
