<template>
  <div class="flex w-full msg-row" :class="[inversion ? 'justify-end' : 'justify-start']">
    <!-- AI 头像（左侧） -->
    <template v-if="!inversion">
      <div class="avatar-bubble mr-3 mt-1 shrink-0" title="聚玻明视 AI">
        <svg class="brand-mark" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5 21 19H3L12 2.5Z" fill="var(--brand)" />
          <path d="M12 9v7M12 12.5l-3.2 6h6.4L12 12.5Z" fill="var(--brand-2)" opacity="0.9" />
        </svg>
      </div>
    </template>

    <div class="msg-content max-w-[85%] overflow-hidden text-sm">
      <div class="msg-meta" :class="[inversion ? 'justify-end' : 'justify-start']">
        <span v-if="!inversion" class="msg-author">聚玻明视 AI</span>
        <span class="msg-time">{{ dateTime }}</span>
        <span v-if="intent && !inversion" class="intent-badge">{{ intentLabel }}</span>
      </div>
      <!-- 用户消息附件：多图（可点击放大）+ 多文档 -->
      <div
        v-if="inversion && ((images && images.length) || (files && files.length))"
        class="msg-attachments"
      >
        <div v-if="images && images.length" class="attach-images">
          <el-image
            v-for="(img, i) in images"
            :key="i"
            class="attach-img"
            :src="img"
            :preview-src-list="images"
            :initial-index="i"
            fit="contain"
            preview-teleported
          />
        </div>
        <div v-if="files && files.length" class="attach-files">
          <div v-for="(f, i) in files" :key="i" class="attach-file" :title="f.name">
            <el-icon :size="22" class="attach-file-icon"><Document /></el-icon>
            <span class="attach-file-name">{{ f.name }}</span>
            <span v-if="f.size" class="attach-file-size">{{ formatSize(f.size) }}</span>
          </div>
        </div>
      </div>
      <div v-if="!inversion || text" class="flex items-end mt-1.5" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :reasoning="reasoning"
          :loading="loading"
          :as-raw-text="asRawText"
          :backend="backend"
        />
      </div>
      <Chart ref="chartRef" v-if="!inversion && chart" :option="chart" />
      <div v-if="!inversion && !loading && (text || chart)" class="msg-actions">
        <div class="ai-disclaimer">
          <el-icon :size="12"><InfoFilled /></el-icon>
          <span>此内容由AI生成，请谨慎辨别</span>
        </div>
        <div class="action-group">
          <button class="action-btn" title="复制" @click="handleCopy">
            <el-icon :size="15"><CopyDocument /></el-icon>
          </button>
          <button class="action-btn" title="下载" @click="handleDownload">
            <el-icon :size="15"><Download /></el-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- 用户头像（右侧） -->
    <template v-if="inversion">
      <div class="avatar-bubble avatar-user ml-3 mt-1 shrink-0" title="我">
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
import Chart from './Chart.vue'
import { Download, Document, InfoFilled, CopyDocument } from '@element-plus/icons-vue'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { buildExportHtml, buildChartHtml, downloadHtml } from '@/utils/exportHtml'
import { copyToClip } from '@/utils/copy'

const props = defineProps<{
  dateTime?: string
  text?: string
  reasoning?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  intent?: string
  chart?: any
  images?: string[]
  files?: Chat.AttachmentFile[]
  backend?: string
}>()
const asRawText = ref(props.inversion)
const textRef = ref()
const chartRef = ref()

// 附件大小格式化
function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const intentLabel = computed(() => {
  const map: Record<string, string> = { qa: '知识问答', data: '数据分析', chat: '闲聊' }
  return map[props.intent || ''] || props.intent || ''
})

// 复制整条 AI 回复
async function handleCopy() {
  const text = (props.text || '').trim()
  if (!text) return
  await copyToClip(text)
  ElMessage.success('已复制')
}

// 下载单条 AI 回复为自包含 HTML（图表用 ECharts 动态渲染，保留交互与排版）
function handleDownload() {
  const html = textRef.value?.getRenderedTextHtml?.() || ''
  const data = chartRef.value?.getExportData?.()
  const chartHtml = buildChartHtml(data)
  const body = html + chartHtml
  if (!body) return
  const hasChart = !!(data && data.charts && data.charts.length)
  const title = (props.text || '').slice(0, 30)
  downloadHtml(`AI回复_${formatTimestamp()}.html`, buildExportHtml(title, body, hasChart))
}

function formatTimestamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`
}
</script>

<style scoped lang="scss">
/* 消息行间距（可在设置中调整气泡密度） */
.msg-row {
  margin-bottom: var(--msg-gap, 24px);
}
.avatar-bubble {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);

  .brand-mark {
    filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--brand) 25%, transparent));
  }
}
.avatar-user {
  background-image: linear-gradient(135deg, var(--brand), var(--brand-2));
  border: none;
}
.msg-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.msg-author {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}
.msg-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* ===== 用户消息附件区（多图 + 多文件） ===== */
.msg-attachments {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin: 6px 0 4px;
}
.attach-images {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  max-width: 100%;
}
.attach-img {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  cursor: zoom-in;
  background: var(--glass-bg);
}
.attach-files {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 100%;
}
.attach-file {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 440px;
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-secondary);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.attach-file-icon {
  flex-shrink: 0;
  color: var(--brand);
}
.attach-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.attach-file-size {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--text-tertiary);
}

/* 移动端：隐藏两侧头像，避免挤压聊天内容；附件图片略小 */
@media (max-width: 767px) {
  .avatar-bubble {
    display: none;
  }
  .attach-img {
    width: 84px;
    height: 84px;
  }
}
.intent-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 2px;
  font-size: 11px;
  line-height: 18px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  &::before {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--brand);
    opacity: 0.7;
  }
}

.ai-disclaimer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  line-height: 16px;
  color: var(--text-tertiary);
}

.msg-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
}
.action-group {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.msg-row:hover .action-group {
  opacity: 1;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  transition: all 0.2s ease;
  &:hover {
    color: var(--brand);
    background: var(--bg-hover);
  }
}

/* 移动端：气泡占用更多可用宽度 */
@media (max-width: 767px) {
  .msg-content {
    max-width: 92% !important;
  }
  .action-group {
    opacity: 1;
  }
}
</style>
