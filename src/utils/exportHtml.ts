/**
 * 导出 HTML 下载工具
 * 把单条 AI 回复（markdown 渲染后的 HTML）打包成自包含的 HTML 文档，
 * 内联样式，浏览器可直接打开，离线可用。
 */

// 内联样式：精简版 Markdown 排版 + highlight.js 语法高亮（浅色主题）
const EXPORT_CSS = `
:root {
  --color-fg-default: #24292f;
  --color-fg-muted: #57606a;
  --color-canvas-default: #ffffff;
  --color-canvas-subtle: #f6f8fa;
  --color-border-default: #d0d7de;
  --color-border-muted: hsla(210, 18%, 87%, 1);
  --color-neutral-muted: rgba(175, 184, 193, 0.2);
  --color-accent-fg: #0969da;
  --color-attention-subtle: #fff8c5;
  --color-danger-fg: #cf222e;
}
* { box-sizing: border-box; }
html { overflow-x: hidden; }
body {
  margin: 0;
  padding: 32px 20px 64px;
  background: var(--color-canvas-default);
  color: var(--color-fg-default);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  overflow-x: hidden;
}
.markdown-body {
  max-width: 900px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 24px 0 16px;
  font-weight: 600;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 2em; padding-bottom: .3em; border-bottom: 1px solid var(--color-border-muted); }
.markdown-body h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid var(--color-border-muted); }
.markdown-body h3 { font-size: 1.25em; }
.markdown-body h4 { font-size: 1em; }
.markdown-body h5 { font-size: .875em; }
.markdown-body h6 { font-size: .85em; color: var(--color-fg-muted); }
.markdown-body p { margin: 0 0 10px; }
.markdown-body a { color: var(--color-accent-fg); text-decoration: none; }
.markdown-body a:hover { text-decoration: underline; }
.markdown-body strong { font-weight: 600; }
.markdown-body ul,
.markdown-body ol { padding-left: 2em; margin: 0 0 16px; }
.markdown-body li + li { margin-top: .25em; }
.markdown-body blockquote {
  margin: 0 0 16px;
  padding: 0 1em;
  color: var(--color-fg-muted);
  border-left: .25em solid var(--color-border-default);
}
.markdown-body code,
.markdown-body tt {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: var(--color-neutral-muted);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}
.markdown-body pre {
  margin: 0 0 16px;
  padding: 16px;
  overflow: auto;
  max-width: 100%;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--color-canvas-subtle);
  border-radius: 6px;
}
.markdown-body pre code {
  display: block;
  padding: 0;
  margin: 0;
  font-size: 100%;
  background: transparent;
  border: 0;
  overflow: visible;
  white-space: pre;
}
.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin-bottom: 16px;
}
.markdown-body table th,
.markdown-body table td { padding: 6px 13px; border: 1px solid var(--color-border-default); }
.markdown-body table th { font-weight: 600; }
.markdown-body table tr { background-color: var(--color-canvas-default); border-top: 1px solid var(--color-border-muted); }
.markdown-body table tr:nth-child(2n) { background-color: var(--color-canvas-subtle); }
.markdown-body img { max-width: 100%; box-sizing: content-box; background-color: var(--color-canvas-default); }
.markdown-body hr {
  height: .25em;
  padding: 0;
  margin: 24px 0;
  background-color: var(--color-border-default);
  border: 0;
}
.markdown-body > *:first-child { margin-top: 0 !important; }
.markdown-body > *:last-child { margin-bottom: 0 !important; }

/* highlight.js 语法高亮（浅色主题） */
.hljs { color: #383a42; background: #fafafa; }
.hljs-comment, .hljs-quote { color: #a0a1a7; font-style: italic; }
.hljs-doctag, .hljs-formula, .hljs-keyword { color: #a626a4; }
.hljs-deletion, .hljs-name, .hljs-section, .hljs-selector-tag, .hljs-subst { color: #e45649; }
.hljs-literal { color: #0184bb; }
.hljs-addition, .hljs-attribute, .hljs-meta .hljs-string, .hljs-regexp, .hljs-string { color: #50a14f; }
.hljs-attr, .hljs-number, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-pseudo, .hljs-template-variable, .hljs-type, .hljs-variable { color: #986801; }
.hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-symbol, .hljs-title { color: #4078f2; }
.hljs-built_in, .hljs-class .hljs-title, .hljs-title.class_ { color: #c18401; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: 700; }
.hljs-link { text-decoration: underline; }

/* 图表 / 报表（导出） */
.chart-section-title { font-size: 15px; font-weight: 600; margin: 20px 0 12px; }
.chart-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 16px; }
.chart-kpi-card { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border: 1px solid var(--color-border-default); border-radius: 12px; background: var(--color-canvas-subtle); }
.chart-kpi-label { font-size: 12px; color: var(--color-fg-muted); }
.chart-kpi-value { font-size: 22px; font-weight: 700; color: var(--color-fg-default); font-variant-numeric: tabular-nums; }
.chart-kpi-unit { margin-left: 4px; font-size: 12px; font-weight: 500; font-style: normal; color: var(--color-fg-muted); }
.chart-grid { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0 16px; }
.chart-item { flex: 0 0 100%; height: 320px; padding: 8px; border: 1px solid var(--color-border-default); border-radius: 12px; background: #fff; }
.chart-item.is-half { flex: 1 1 calc(50% - 6px); min-width: min(100%, 320px); }
@media (max-width: 767px) {
  .chart-item { height: 240px; }
  .chart-item, .chart-item.is-half { flex: 0 0 100%; min-width: 0; }
}
`

/** 图表导出数据（由 Chart 组件收集，option 已叠加统一主题） */
export interface ChartExportItem {
  option: Record<string, any>
  span: number
}
export interface ChartExportData {
  title?: string
  kpis?: Array<{ label: string; value: string; unit?: string }>
  charts: ChartExportItem[]
}

/** 根据图表导出数据生成 HTML 片段（图表以容器 + 内嵌 option 形式，交由 ECharts 动态渲染） */
export function buildChartHtml(data: ChartExportData | null | undefined): string {
  if (!data || !data.charts?.length) return ''
  const parts: string[] = []
  if (data.title) parts.push(`<div class="chart-section-title">${escapeHtml(data.title)}</div>`)
  if (data.kpis?.length) {
    parts.push(`<div class="chart-kpi-row">${data.kpis
      .map(
        k =>
          `<div class="chart-kpi-card"><span class="chart-kpi-label">${escapeHtml(k.label)}</span><span class="chart-kpi-value">${escapeHtml(k.value)}${k.unit ? `<i class="chart-kpi-unit">${escapeHtml(k.unit)}</i>` : ''}</span></div>`,
      )
      .join('')}</div>`)
  }
  parts.push(`<div class="chart-grid">${data.charts
    .map(c => {
      const cls = c.span === 6 ? 'chart-item is-half' : 'chart-item'
      return `<div class="${cls}" data-echarts="${escapeHtml(JSON.stringify(c.option ?? {}))}"></div>`
    })
    .join('')}</div>`)
  return parts.join('')
}

// ECharts CDN 与渲染脚本：导出的 HTML 打开后动态渲染图表，保留交互（tooltip / 缩放）与排版
export const ECHARTS_CDN = 'https://cdn.jsdelivr.net/npm/echarts@6.1.0/dist/echarts.min.js'
export const ECHARTS_RENDER_SCRIPT = `<script>
(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-echarts]'));
  if (!boxes.length) return;
  function init() {
    if (!window.echarts) return;
    boxes.forEach(function (box) {
      try {
        var inst = window.echarts.init(box);
        inst.setOption(JSON.parse(box.getAttribute('data-echarts')));
        box._ec = inst;
      } catch (e) {}
    });
    window.addEventListener('resize', function () {
      boxes.forEach(function (box) { if (box._ec) box._ec.resize(); });
    });
  }
  if (window.echarts) init();
  else window.addEventListener('load', init);
})();
</script>`

/** 组装一份自包含的 HTML 文档 */
export function buildExportHtml(title: string, bodyHtml: string, hasChart = false): string {
  // 去掉代码块里的「语言标签 + 复制代码」头部，导出后保持纯净
  const cleaned = bodyHtml.replace(/<div class="code-block-header">[\s\S]*?<\/div>/g, '')
  const chartScripts = hasChart ? `<script src="${ECHARTS_CDN}"></script>\n${ECHARTS_RENDER_SCRIPT}\n` : ''
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${EXPORT_CSS}</style>
</head>
<body>
<article class="markdown-body">
${cleaned}
</article>
${chartScripts}</body>
</html>`
}

/** 触发浏览器下载 HTML 文件 */
export function downloadHtml(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
