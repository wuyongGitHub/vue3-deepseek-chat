/**
 * 统一 ECharts 视觉风格：以"缺省补齐"的方式为后端生成的 option 叠加通用样式，
 * 不覆盖后端已显式配置的数值/格式化器，保证各图表类型观感一致且更精致。
 */

export const CHART_FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"

type AnyObj = Record<string, any>

function isObj(v: unknown): v is AnyObj {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function clone<T>(v: T): T {
  try {
    return typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v))
  } catch {
    // 响应式 Proxy / 不可克隆对象降级为 JSON 拷贝
    return JSON.parse(JSON.stringify(v))
  }
}

/** 递归补齐：patch 中的字段仅在 target 缺失（或为 null）时写入；两者都是普通对象时逐层下探。 */
function fill(target: AnyObj, patch: AnyObj) {
  for (const key of Object.keys(patch)) {
    const pv = patch[key]
    if (pv === undefined) continue
    if (!(key in target) || target[key] === null || target[key] === undefined) {
      target[key] = clone(pv)
    } else if (isObj(target[key]) && isObj(pv)) {
      fill(target[key], pv)
    }
  }
  return target
}

function axisList(option: AnyObj, key: 'xAxis' | 'yAxis'): AnyObj[] {
  const raw = option[key]
  if (!raw) return []
  return Array.isArray(raw) ? raw : [raw]
}

/** 折线/柱状等坐标轴图：细轴 + 浅灰刻度文字 + 虚线网格，更轻量精致 */
function styleAxes(option: AnyObj) {
  axisList(option, 'xAxis').forEach(ax => {
    fill(ax, {
      axisLine: { show: true, lineStyle: { color: '#E2E8F0', width: 1 } },
      axisTick: { show: false },
      axisLabel: { color: '#64748B', fontSize: 11, margin: 10 },
    })
  })
  axisList(option, 'yAxis').forEach((ax, idx) => {
    // 次 y 轴（双轴图的右侧 % 轴）已有主色轴线，跳过网格线避免重叠
    const secondAxis = Array.isArray(option.yAxis) && idx === 1
    fill(ax, {
      axisLabel: { color: '#64748B', fontSize: 11 },
      axisLine: { show: false },
    })
    if (!secondAxis && (ax.type === 'value' || ax.type === undefined)) {
      fill(ax, {
        splitLine: { show: true, lineStyle: { color: '#EEF2F7', type: 'dashed', width: 1 } },
      })
    }
  })
}

function styleTooltip(option: AnyObj) {
  const tip = option.tooltip
  if (!tip) return
  fill(tip, {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: '#0F172A', fontSize: 12 },
    extraCssText: 'box-shadow:0 6px 18px rgba(15,23,42,.10);border-radius:10px;',
  })
  // 坐标轴触发时默认给出淡灰参考线；已配置或非坐标轴类（饼/雷达等）不干预
  if (tip.trigger === 'axis' && !tip.axisPointer) {
    tip.axisPointer = {
      type: 'line',
      lineStyle: { color: 'rgba(148,163,184,.45)', type: 'dashed', width: 1 },
    }
  }
}

/** 全局风格化入口：直接返回加工后的新 option（不改原对象） */
export function withChartStyle<T extends AnyObj>(option: T): T {
  if (!isObj(option)) return option
  const opt = clone(option) as AnyObj

  fill(opt, {
    backgroundColor: 'transparent',
    animationDuration: 500,
    animationEasing: 'cubicOut',
    textStyle: { fontFamily: CHART_FONT, color: '#1E293B' },
    title: {
      textStyle: { fontFamily: CHART_FONT, fontWeight: 600, color: '#0F172A' },
      subtextStyle: { fontFamily: CHART_FONT, color: '#94A3B8' },
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      textStyle: { color: '#0F172A', fontSize: 12 },
      extraCssText: 'box-shadow:0 6px 18px rgba(15,23,42,.10);border-radius:10px;',
    },
    legend: {
      icon: 'roundRect',
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 14,
      textStyle: { color: '#64748B', fontSize: 11 },
      inactiveColor: '#CBD5E1',
    },
  })

  styleTooltip(opt)
  styleAxes(opt)

  return opt as T
}

export default withChartStyle
