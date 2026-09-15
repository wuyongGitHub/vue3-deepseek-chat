<template>
  <!-- 看板容器：KPI 数字卡 + 多张子图 -->
  <div v-if="isDashboard" class="agent-dashboard">
    <div v-if="option.title" class="dashboard-title">{{ option.title }}</div>
    <div v-if="option.kpis?.length" class="kpi-row">
      <div v-for="k in option.kpis" :key="k.key" class="kpi-card">
        <span class="kpi-label">{{ k.label }}</span>
        <span class="kpi-value">{{ formatValue(k.value) }}<i v-if="k.unit" class="kpi-unit">{{ k.unit }}</i></span>
      </div>
    </div>
    <div class="agent-chart-grid">
      <div
        v-for="(c, i) in charts"
        :key="i"
        :ref="el => setEl(i, el)"
        class="agent-chart-item"
        :class="{ 'is-half': chartSpan(c) === 6 }"
      />
    </div>
  </div>

  <!-- 单图：标准 ECharts option -->
  <div v-else ref="chartRef" class="agent-chart" />
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import type { ECharts } from 'echarts/core'
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart, FunnelChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  DatasetComponent,
  VisualMapComponent,
  GraphicComponent,
  AriaComponent,
  TransformComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import withChartStyle from '@/utils/chartTheme'

// 按需注册图表类型与组件，避免全量引入 echarts 拖慢首屏
echarts.use([
  BarChart, LineChart, PieChart, RadarChart, ScatterChart, FunnelChart, GaugeChart,
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  DataZoomComponent, ToolboxComponent,
  MarkLineComponent, MarkPointComponent, MarkAreaComponent,
  DatasetComponent, VisualMapComponent, GraphicComponent,
  AriaComponent, TransformComponent,
  LabelLayout, UniversalTransition,
  CanvasRenderer,
])

const props = defineProps<{
  option: Record<string, any>
}>()

// 看板容器：layout === "dashboard"；单图：无 layout 字段
const isDashboard = computed(() => props.option?.layout === 'dashboard')

const charts = computed<Array<Record<string, any>>>(() => props.option?.charts || [])

// 看板子图项：后端可能返回 { option, span }（span 6=半行 / 12=整行），兼容纯 option
function chartSpan(c: Record<string, any>): number {
  return c && typeof c === 'object' && c.option != null ? Number(c.span) || 12 : 12
}

const chartRef = ref<HTMLDivElement>()
const els = ref<Array<HTMLElement | null>>([])
let singleChart: ECharts | null = null
let subCharts: ECharts[] = []

function setEl(i: number, el: unknown) {
  els.value[i] = el as HTMLElement | null
}

function formatValue(v: any): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'number') {
    return v.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  }
  return String(v)
}

function disposeAll() {
  singleChart?.dispose()
  singleChart = null
  subCharts.forEach(c => c?.dispose())
  subCharts = []
}

async function render() {
  await nextTick()
  disposeAll()

  if (isDashboard.value) {
    charts.value.forEach((c: any, i: number) => {
      const el = els.value[i]
      if (!el) return
      const inst = echarts.init(el as HTMLElement)
      // 兼容 { option, span } 包装与旧版纯 option；渲染前统一叠加视觉主题
      const opt = c && typeof c === 'object' && c.option != null ? c.option : c
      if (opt) inst.setOption(withChartStyle(opt), true)
      subCharts.push(inst)
    })
  } else {
    if (!chartRef.value) return
    singleChart = echarts.init(chartRef.value)
    singleChart.setOption(withChartStyle(props.option), true)
  }
}

function onResize() {
  singleChart?.resize()
  subCharts.forEach(c => c?.resize())
}

onMounted(() => {
  render()
  window.addEventListener('resize', onResize)
})

watch(() => props.option, render, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  disposeAll()
})

// 导出：收集标题 / KPI / 各子图（已叠加统一主题）的结构化数据，供下载时用 ECharts 复现
function getExportData() {
  if (isDashboard.value) {
    const kpis = (props.option?.kpis || []).map((k: any) => ({
      label: String(k?.label ?? ''),
      value: formatValue(k?.value),
      unit: k?.unit ? String(k.unit) : undefined,
    }))
    const exportCharts = charts.value.map((c: any) => {
      const raw = c && typeof c === 'object' && c.option != null ? c.option : c
      return { option: raw ? withChartStyle(raw) : raw, span: chartSpan(c) }
    })
    return { title: props.option?.title, kpis, charts: exportCharts }
  }

  return { charts: [{ option: withChartStyle(props.option), span: 12 }] }
}

defineExpose({ getExportData })
</script>

<style scoped lang="scss">
.agent-chart {
  width: 100%;
  height: 320px;
  margin-top: 12px;
  padding: 8px;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  box-sizing: border-box;
}

.agent-dashboard {
  margin-top: 12px;

  .dashboard-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .kpi-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--bg-surface);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);

    .kpi-label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .kpi-value {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.1;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .kpi-unit {
      margin-left: 4px;
      font-size: 12px;
      font-weight: 500;
      font-style: normal;
      color: var(--text-tertiary);
    }
  }

  // 看板图区：弹性流式排布。整行图独占一行；半行图天然两两并排，
  // 若只剩单个半行图则自动伸展铺满整行，避免右侧留白
  .agent-chart-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
  }

  .agent-chart-item {
    flex: 0 0 100%;
    height: 320px;
    padding: 8px;
    border-radius: 12px;
    background: var(--bg-surface);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    box-sizing: border-box;

    // 半行图：优先两两成行；容器过窄时自动折回单列
    &.is-half {
      flex: 1 1 calc(50% - 6px);
      min-width: min(100%, 320px);
    }
  }
}

/* 移动端：图表高度收敛，避免占据过多纵向空间 */
@media (max-width: 767px) {
  .agent-chart,
  .agent-chart-item {
    height: 240px;
  }
}
</style>
