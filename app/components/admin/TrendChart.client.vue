<script setup lang="ts">
import VChart from 'vue-echarts'
import { use, type EChartsCoreOption } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])

/**
 * Tendencia de 30 días. Una métrica a la vez (citas o ingresos) con un solo eje:
 * evita la gráfica de doble eje, que confunde la lectura.
 */
const props = defineProps<{
  data: { date: string, count: number, revenue: number }[]
  metric: 'count' | 'revenue'
}>()

const colorMode = useColorMode()
const settings = useSettingsStore()

/** Lee los tokens CSS actuales para que la gráfica siga al tema y al acento. */
const palette = ref(readPalette())
function readPalette() {
  // Se resuelven a través de un elemento para expandir var() y color-mix() (el canvas no los entiende).
  const probe = document.createElement('span')
  probe.style.display = 'none'
  document.body.appendChild(probe)
  const v = (name: string) => {
    probe.style.color = `var(${name})`
    return getComputedStyle(probe).color
  }
  const result = { fg: v('--foreground'), muted: v('--muted'), border: v('--border'), surface: v('--surface'), accent: v('--accent-ink'), strong: v('--border-strong') }
  probe.remove()
  return result
}
watch([() => colorMode.value, () => settings.settings.accent], () => nextTick(() => (palette.value = readPalette())))

const today = computed(() => props.data.at(-1)?.date)

const option = computed((): EChartsCoreOption => {
  const p = palette.value
  const isCount = props.metric === 'count'
  const values = props.data.map(d => (isCount ? d.count : d.revenue))
  return {
    animationDuration: 500,
    animationEasing: 'cubicOut',
    grid: { left: 4, right: 8, top: 16, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: isCount ? 'shadow' : 'line', lineStyle: { color: p.strong }, shadowStyle: { color: p.muted, opacity: 0.08 } },
      backgroundColor: p.surface,
      borderColor: p.border,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: p.fg, fontFamily: 'Geist, sans-serif', fontSize: 12 },
      extraCssText: 'border-radius:10px;box-shadow:0 12px 32px -12px rgba(0,0,0,.4);',
      formatter: (params: { dataIndex: number }[]) => {
        const d = props.data[params[0]!.dataIndex]!
        const label = capitalize(formatDateLong(d.date))
        const value = isCount ? pluralize(d.count, 'cita') : formatPrice(d.revenue)
        return `<div style="color:${p.muted};margin-bottom:2px">${label}</div><div style="font-weight:600;font-variant-numeric:tabular-nums">${value}</div>`
      },
    },
    xAxis: {
      type: 'category',
      data: props.data.map(d => d.date),
      axisLine: { lineStyle: { color: p.border } },
      axisTick: { show: false },
      axisLabel: {
        color: p.muted,
        fontSize: 11,
        interval: 6,
        formatter: (v: string) => (v === today.value ? 'Hoy' : formatDateFns(v, 'd MMM').replace('.', '')),
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitNumber: 4,
      axisLabel: { color: p.muted, fontSize: 11, formatter: (v: number) => (isCount ? String(v) : formatCompactPrice(v)) },
      splitLine: { lineStyle: { color: p.border, type: [3, 4] } },
    },
    series: [
      isCount
        ? {
            type: 'bar',
            data: values.map((v, i) => ({ value: v, itemStyle: { color: props.data[i]!.date === today.value ? p.accent : p.fg, opacity: props.data[i]!.date === today.value ? 1 : 0.85 } })),
            barMaxWidth: 14,
            itemStyle: { borderRadius: [4, 4, 0, 0] },
            emphasis: { itemStyle: { opacity: 1 } },
          }
        : {
            type: 'line',
            data: values,
            smooth: 0.3,
            symbol: 'circle',
            symbolSize: 8,
            showSymbol: false,
            lineStyle: { width: 2, color: p.accent },
            itemStyle: { color: p.accent, borderColor: p.surface, borderWidth: 2 },
            areaStyle: { color: p.accent, opacity: 0.1 },
          },
    ],
  } as EChartsCoreOption
})
</script>

<template>
  <VChart :option="option" autoresize class="h-full w-full" role="img" :aria-label="metric === 'count' ? 'Citas por día, últimos 30 días' : 'Ingresos por día, últimos 30 días'" />
</template>
