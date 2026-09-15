<template>
  <el-dialog
    :model-value="appStore.settingVisible"
    title="设置"
    class="setting-dialog"
    :close-on-click-modal="true"
    append-to-body
    @update:model-value="onClose"
  >
    <div class="setting-body">
      <!-- 外观 -->
      <div class="setting-group">
        <div class="group-title">外观</div>

        <div class="setting-item">
          <div class="item-info">
            <div class="item-label">主题</div>
            <div class="item-desc">切换浅色 / 深色模式</div>
          </div>
          <el-radio-group :model-value="appStore.theme" size="small" @change="onThemeChange">
            <el-radio-button value="light">浅色</el-radio-button>
            <el-radio-button value="dark">深色</el-radio-button>
          </el-radio-group>
        </div>

        <div class="setting-item">
          <div class="item-info">
            <div class="item-label">字体大小</div>
            <div class="item-desc">聊天正文的字号</div>
          </div>
          <el-radio-group :model-value="appStore.fontSize" size="small" @change="onFontSizeChange">
            <el-radio-button value="small">小</el-radio-button>
            <el-radio-button value="medium">中</el-radio-button>
            <el-radio-button value="large">大</el-radio-button>
          </el-radio-group>
        </div>

        <div class="setting-item">
          <div class="item-info">
            <div class="item-label">聊天气泡密度</div>
            <div class="item-desc">消息之间的间距</div>
          </div>
          <el-radio-group :model-value="appStore.bubbleDensity" size="small" @change="onDensityChange">
            <el-radio-button value="compact">紧凑</el-radio-button>
            <el-radio-button value="comfortable">舒适</el-radio-button>
            <el-radio-button value="loose">宽松</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 对话 -->
      <div class="setting-group">
        <div class="group-title">对话</div>

        <div class="setting-item">
          <div class="item-info">
            <div class="item-label">默认开启上下文</div>
            <div class="item-desc">多轮对话时携带历史消息</div>
          </div>
          <el-switch :model-value="chatStore.usingContext" @change="onContextChange" />
        </div>

        <div class="setting-item">
          <div class="item-info">
            <div class="item-label">默认后端模型</div>
            <div class="item-desc">新会话默认使用的模型</div>
          </div>
          <el-radio-group :model-value="appStore.backend" size="small" @change="onBackendChange">
            <el-radio-button value="deepseek">DeepSeek</el-radio-button>
            <el-radio-button value="agent">玻璃智能体</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 数据 -->
      <div class="setting-group">
        <div class="group-title">数据</div>

        <div class="data-actions">
          <el-dropdown @command="onExportCommand">
            <el-button size="small">
              导出聊天记录
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="html">导出 HTML（客户查看）</el-dropdown-item>
                <el-dropdown-item command="json">导出 JSON（备份导入）</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button size="small" @click="importInput?.click()">导入聊天记录</el-button>
          <el-button size="small" type="danger" plain @click="onClearChats">清空聊天记录</el-button>
        </div>
        <div class="reset-row">
          <el-button size="small" type="danger" plain @click="onResetAll">恢复默认设置</el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="onClose">关闭</el-button>
    </template>

    <input ref="importInput" type="file" accept=".json,application/json" hidden @change="onImport" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { ArrowDown } from '@element-plus/icons-vue'
import { useAppStore, useChatStore } from '@/store'
import { buildChatHtml, buildChatJson } from '@/utils/exportChat'
import type { ThemeMode, FontSize, BubbleDensity, BackendType } from '@/store'

const appStore = useAppStore()
const chatStore = useChatStore()
const importInput = ref<HTMLInputElement>()

function onClose() {
  appStore.closeSetting()
}

function onThemeChange(v: string | number | boolean | undefined) {
  appStore.setTheme(v as ThemeMode)
}
function onFontSizeChange(v: string | number | boolean | undefined) {
  appStore.setFontSize(v as FontSize)
}
function onDensityChange(v: string | number | boolean | undefined) {
  appStore.setBubbleDensity(v as BubbleDensity)
}
function onBackendChange(v: string | number | boolean | undefined) {
  appStore.setBackend(v as BackendType)
}
function onContextChange(v: string | number | boolean | undefined) {
  chatStore.setUsingContext(Boolean(v))
}

function timestamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function onExportCommand(command: string | number | object) {
  if (command === 'json') onExportJson()
  else if (command === 'html') onExportHtml()
}

function onExportJson() {
  downloadFile(buildChatJson(chatStore.$state), `聚玻明视聊天备份_${timestamp()}.json`, 'application/json')
  ElMessage.success('已导出 JSON 备份')
}

function onExportHtml() {
  downloadFile(buildChatHtml(chatStore.$state), `聚玻明视聊天记录_${timestamp()}.html`, 'text/html')
  ElMessage.success('已导出 HTML 聊天记录')
}

function onImport(e: Event) {
  const el = e.target as HTMLInputElement
  const file = el.files?.[0]
  el.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result)) as Chat.ChatState
      chatStore.importChats(data)
      ElMessage.success('导入成功')
    } catch {
      ElMessage.error('导入失败：备份文件格式不正确')
    }
  }
  reader.onerror = () => ElMessage.error('读取文件失败')
  reader.readAsText(file)
}

function onClearChats() {
  ElMessageBox.confirm('确定要清空所有本地聊天记录吗？此操作不可恢复。', '清空聊天记录', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      chatStore.clearChats()
      ElMessage.success('已清空聊天记录')
    })
    .catch(() => {})
}

function onResetAll() {
  ElMessageBox.confirm('将恢复所有设置为默认值，并清空本地聊天记录。是否继续？', '恢复默认设置', {
    confirmButtonText: '恢复',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      appStore.setTheme('dark')
      appStore.setBackend('agent')
      appStore.setFontSize('medium')
      appStore.setBubbleDensity('comfortable')
      chatStore.setUsingContext(true)
      chatStore.clearChats()
      ElMessage.success('已恢复默认设置')
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
.setting-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 2px 4px 8px;
}
.setting-group {
  margin-bottom: 6px;
}
.group-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text-tertiary);
  margin: 16px 0 6px;
}
.setting-group:first-child .group-title {
  margin-top: 0;
}
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.item-label {
  font-size: 14px;
  color: var(--text-primary);
}
.item-desc {
  font-size: 12px;
  color: var(--text-tertiary);
}
.data-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 0 4px;
}
.reset-row {
  padding: 10px 0 2px;
}

@media (max-width: 600px) {
  .setting-body {
    max-height: 65vh;
  }
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .item-info {
    max-width: 100%;
  }
  .data-actions {
    gap: 8px;
  }
}
</style>

<!-- 弹窗 append-to-body 后脱离组件作用域，需用全局样式覆盖宽度与背景 -->
<style lang="scss">
.setting-dialog {
  --el-dialog-width: 500px;
  max-width: calc(100vw - 24px);
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
@media (max-width: 600px) {
  .setting-dialog {
    --el-dialog-width: calc(100vw - 24px);
    --el-dialog-margin-top: 5vh;
  }
}
</style>
