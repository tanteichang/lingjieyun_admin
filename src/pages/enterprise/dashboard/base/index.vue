<template>
  <div class="dashboard-page">
    <section class="metric-grid">
      <article v-for="item in metricCards" :key="item.title" class="metric-card">
        <div class="metric-card__header">
          <span class="metric-card__title">{{ item.title }}</span>
          <span class="metric-card__badge">今日</span>
        </div>
        <div class="metric-card__value">{{ item.value }}</div>
        <div class="metric-card__meta">
          <span>昨日 {{ item.yesterday }}</span>
          <span class="metric-card__trend">
            周环比
            <span class="metric-card__ratio" :class="[`metric-card__ratio--${item.trend}`]">{{ item.ratio }}</span>
            <t-icon :name="item.trend === 'up' ? 'caret-up-small' : 'caret-down-small'" size="18px" />
          </span>
        </div>
        <div class="metric-card__footer">
          <span>{{ item.footerLabel }}</span>
          <strong>{{ item.footerValue }}</strong>
        </div>
      </article>
    </section>

    <section class="shortcut-grid">
      <button
        v-for="item in shortcutItems"
        :key="item.label"
        type="button"
        class="shortcut-card"
        @click="handleNavigate(item.route)"
      >
        <span class="shortcut-card__icon" :style="{ '--shortcut-color': item.color, '--shortcut-bg': item.bgColor }">
          <t-icon :name="item.icon" size="30px" />
        </span>
        <span class="shortcut-card__label">{{ item.label }}</span>
      </button>
    </section>

    <section class="dashboard-grid dashboard-grid--top">
      <article class="panel">
        <div class="panel__header">
          <h3 class="panel__title">待办事项</h3>
        </div>
        <div class="todo-grid">
          <button
            v-for="item in pendingItems"
            :key="item.label"
            type="button"
            class="todo-item"
            @click="handleNavigate(item.route)"
          >
            <span class="todo-item__icon" :style="{ '--todo-color': item.color, '--todo-bg': item.bgColor }">
              <t-icon :name="item.icon" size="24px" />
            </span>
            <span class="todo-item__content">
              <span class="todo-item__label">{{ item.label }}</span>
              <strong class="todo-item__value">{{ item.value }}</strong>
            </span>
          </button>
        </div>
      </article>

      <article class="panel">
        <div class="panel__header">
          <h3 class="panel__title">任务活跃排行</h3>
          <div class="period-switch">
            <button
              v-for="option in periodOptions"
              :key="option.value"
              type="button"
              class="period-switch__item"
              :class="[{ 'period-switch__item--active': activeRankingPeriod === option.value }]"
              @click="activeRankingPeriod = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div class="ranking-table">
          <div class="ranking-table__header">
            <span>排名</span>
            <span>任务名称</span>
            <span>所属企业</span>
            <span>报名人数</span>
            <span>实付金额</span>
          </div>
          <div
            v-for="item in currentRankingList"
            :key="`${activeRankingPeriod}-${item.rank}`"
            class="ranking-table__row"
          >
            <span>{{ item.rank }}</span>
            <span>{{ item.taskName }}</span>
            <span>{{ item.company }}</span>
            <span>{{ item.applicants }}</span>
            <span>{{ formatAmount(item.amount) }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="dashboard-grid dashboard-grid--bottom">
      <article class="panel">
        <div class="panel__header panel__header--align-start">
          <div>
            <h3 class="panel__title">结算账单</h3>
          </div>
          <div class="period-switch">
            <button
              v-for="option in periodOptions"
              :key="`settlement-${option.value}`"
              type="button"
              class="period-switch__item"
              :class="[{ 'period-switch__item--active': activeSettlementPeriod === option.value }]"
              @click="activeSettlementPeriod = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div ref="settlementChartRef" class="chart chart--line" />
      </article>

      <article class="panel recruit-panel">
        <div class="panel__header">
          <h3 class="panel__title">招募成员</h3>
          <div class="period-switch">
            <button
              v-for="option in periodOptions"
              :key="`recruit-${option.value}`"
              type="button"
              class="period-switch__item"
              :class="[{ 'period-switch__item--active': activeRecruitPeriod === option.value }]"
              @click="activeRecruitPeriod = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div class="recruit-chart" @click="handleRecruitAreaClick">
          <div ref="recruitChartRef" class="chart chart--donut" />
          <div class="recruit-legend" @click="clearRecruitHighlight">
            <div
              v-for="item in recruitLegend"
              :key="item.label"
              class="recruit-legend__item"
              :class="{ 'recruit-legend__item--active': item.key === currentRecruitSummary.activeKey }"
              @click.stop="handleRecruitHighlight(item.key)"
            >
              <span class="recruit-legend__dot" :style="{ backgroundColor: item.color }" />
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { LineChart, PieChart } from 'echarts/charts';
import { GraphicComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import type { ECharts, EChartsCoreOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'DashboardBase',
});

echarts.use([LineChart, PieChart, GraphicComponent, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

type PeriodKey = '7d' | '30d' | 'month' | 'year';
type TrendType = 'up' | 'down';
type RecruitKey = 'free' | 'directed';

interface MetricCard {
  title: string;
  value: string;
  yesterday: string;
  ratio: string;
  trend: TrendType;
  footerLabel: string;
  footerValue: string;
}

interface ShortcutItem {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  route?: string;
}

interface PendingItem {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  value: number;
  route?: string;
}

interface RankingItem {
  rank: number;
  taskName: string;
  company: string;
  applicants: number;
  amount: number;
}

interface SettlementTrend {
  labels: string[];
  bills: number[];
  settlements: number[];
  amounts: number[];
}

interface RecruitData {
  free: number;
  directed: number;
}

interface RecruitSummary {
  activeKey: RecruitKey | null;
  primaryLabel: string;
  rate: number;
  valueText: string;
}

const router = useRouter();

const periodOptions: Array<{ label: string; value: PeriodKey }> = [
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
];

const metricCards: MetricCard[] = [
  {
    title: '结算金额',
    value: '¥0.00',
    yesterday: '¥0.00',
    ratio: '0%',
    trend: 'up',
    footerLabel: '本月支付统计',
    footerValue: '¥0.00',
  },
  {
    title: '结算人数',
    value: '0',
    yesterday: '0',
    ratio: '0%',
    trend: 'up',
    footerLabel: '本月结算人数',
    footerValue: '2',
  },
  {
    title: '任务数',
    value: '0',
    yesterday: '0',
    ratio: '0%',
    trend: 'down',
    footerLabel: '本月任务数',
    footerValue: '16',
  },
  {
    title: '人员数',
    value: '0',
    yesterday: '0',
    ratio: '0%',
    trend: 'down',
    footerLabel: '本月人员数',
    footerValue: '28',
  },
];

const shortcutItems: ShortcutItem[] = [
  { label: '项目管理', icon: 'app', color: '#2F6BFF', bgColor: '#EEF4FF', route: '/project/list' },
  { label: '任务管理', icon: 'view-module', color: '#6E63FF', bgColor: '#F1EEFF', route: '/project/task' },
  { label: '人员管理', icon: 'usergroup', color: '#19B56B', bgColor: '#EAFBF3', route: '/talent/list' },
  { label: '发布项目', icon: 'add-circle', color: '#FF7A1A', bgColor: '#FFF3EB', route: '/project/publish' },
  { label: '交付物上传', icon: 'upload', color: '#8E59FF', bgColor: '#F4EEFF', route: '/project/deliveryUpload' },
  { label: '结算单上传', icon: 'file-add', color: '#FF4D4F', bgColor: '#FFF0F2', route: '/payment/upload' },
  { label: '账单支付', icon: 'creditcard', color: '#17B4D4', bgColor: '#EAFBFF', route: '/payment/pay' },
  { label: '支付记录', icon: 'bill', color: '#7A8194', bgColor: '#F2F4F7', route: '/payment/record' },
];

const pendingItems: PendingItem[] = [
  {
    label: '报名审核',
    icon: 'task-checked',
    color: '#2F6BFF',
    bgColor: '#EEF4FF',
    value: 0,
    route: '/project/registrationApproval',
  },
  { label: '成员申请', icon: 'user-add', color: '#6E63FF', bgColor: '#F1EEFF', value: 0 },
  {
    label: '交付物审核',
    icon: 'component-checkbox',
    color: '#15B97A',
    bgColor: '#EAFBF3',
    value: 0,
    route: '/project/deliveryApproval',
  },
  { label: '进行中任务', icon: 'play-circle', color: '#F4B400', bgColor: '#FFF7E5', value: 0, route: '/project/task' },
  { label: '结算单确认', icon: 'file', color: '#FF4D6D', bgColor: '#FFF0F2', value: 0, route: '/payment/upload' },
  { label: '账单待支付', icon: 'creditcard', color: '#17B4D4', bgColor: '#EAFBFF', value: 0, route: '/payment/pay' },
  { label: '已开票', icon: 'check-circle', color: '#1D9BF0', bgColor: '#EEF8FF', value: 0 },
  { label: '待开发票', icon: 'bill', color: '#FF8A00', bgColor: '#FFF5E8', value: 0 },
  { label: '提现中', icon: 'money', color: '#F4B400', bgColor: '#FFF7E5', value: 1, route: '/payment/record' },
];

const rankingMap: Record<PeriodKey, RankingItem[]> = {
  '7d': [
    { rank: 1, taskName: '安卓系统开发', company: '广州市际网络科技有限公司', applicants: 36, amount: 3600 },
    { rank: 2, taskName: 'UI/UX设计', company: '广州菱铄星光科技有限公司', applicants: 20, amount: 3600 },
    { rank: 3, taskName: '后端开发', company: '广州创显科教科技有限公司', applicants: 16, amount: 3600 },
    { rank: 4, taskName: '后台系统测试', company: '广州吉虎礼物科技有限公司', applicants: 12, amount: 3600 },
  ],
  '30d': [
    { rank: 1, taskName: '安卓系统开发', company: '广州市际网络科技有限公司', applicants: 82, amount: 8600 },
    { rank: 2, taskName: '产品经理', company: '广州菱铄星光科技有限公司', applicants: 56, amount: 6800 },
    { rank: 3, taskName: '后端开发', company: '广州创显科教科技有限公司', applicants: 48, amount: 7200 },
    { rank: 4, taskName: '前端开发', company: '广州吉虎礼物科技有限公司', applicants: 42, amount: 6500 },
  ],
  month: [
    { rank: 1, taskName: '安卓系统开发', company: '广州市际网络科技有限公司', applicants: 69, amount: 7600 },
    { rank: 2, taskName: 'UI/UX设计', company: '广州菱铄星光科技有限公司', applicants: 44, amount: 5200 },
    { rank: 3, taskName: '后端开发', company: '广州创显科教科技有限公司', applicants: 39, amount: 6200 },
    { rank: 4, taskName: '运营策划', company: '广州吉虎礼物科技有限公司', applicants: 35, amount: 4800 },
  ],
  year: [
    { rank: 1, taskName: '安卓系统开发', company: '广州市际网络科技有限公司', applicants: 208, amount: 22800 },
    { rank: 2, taskName: '企业数字化升级', company: '广州菱铄星光科技有限公司', applicants: 186, amount: 19600 },
    { rank: 3, taskName: '后端开发', company: '广州创显科教科技有限公司', applicants: 164, amount: 18200 },
    { rank: 4, taskName: '数据治理项目', company: '广州吉虎礼物科技有限公司', applicants: 152, amount: 17100 },
  ],
};

const settlementTrendMap: Record<PeriodKey, SettlementTrend> = {
  '7d': {
    labels: makeRecentDayLabels(7),
    bills: [0, 2, 0, 0, 4, 0, 1],
    settlements: [0, 1, 0, 0, 2, 0, 1],
    amounts: [0, 68, 0, 0, 227.9, 0, 46.5],
  },
  '30d': {
    labels: makeRecentDayLabels(30),
    bills: [0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
    settlements: [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    amounts: [0, 0, 0, 0, 0, 42, 31, 0, 26, 0, 0, 48, 0, 0, 227.9, 0, 0, 0, 0, 0, 0, 0, 166.3, 0, 0, 0, 0, 0, 0, 36.8],
  },
  month: {
    labels: makeMonthLabels(),
    bills: [0, 1, 0, 2, 1, 0, 3, 0, 0, 4, 0, 2, 0, 5, 1, 0, 2, 0, 6, 0, 2, 0, 1],
    settlements: [0, 1, 0, 1, 1, 0, 2, 0, 0, 2, 0, 1, 0, 3, 1, 0, 1, 0, 3, 0, 1, 0, 1],
    amounts: [0, 24, 0, 66, 32, 0, 88, 0, 0, 128, 0, 56, 0, 176, 38, 0, 68, 0, 226.2, 0, 74, 0, 48],
  },
  year: {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    bills: [3, 2, 5, 4, 6, 5, 7, 4, 6, 8, 7, 9],
    settlements: [1, 1, 2, 2, 3, 2, 4, 2, 3, 4, 3, 5],
    amounts: [88, 66, 128, 116, 162, 138, 218, 126, 172, 236, 208, 277],
  },
};

const recruitMap: Record<PeriodKey, RecruitData> = {
  '7d': { free: 25, directed: 7 },
  '30d': { free: 81, directed: 19 },
  month: { free: 103, directed: 29 },
  year: { free: 458, directed: 142 },
};

const activeRankingPeriod = ref<PeriodKey>('7d');
const activeSettlementPeriod = ref<PeriodKey>('7d');
const activeRecruitPeriod = ref<PeriodKey>('7d');
const selectedRecruitKey = ref<RecruitKey | null>(null);
const settlementChartRef = ref<HTMLDivElement>();
const recruitChartRef = ref<HTMLDivElement>();
let settlementChart: ECharts | null = null;
let recruitChart: ECharts | null = null;
let preventRecruitClear = false;

const currentRankingList = computed(() => rankingMap[activeRankingPeriod.value]);
const currentRecruitData = computed(() => recruitMap[activeRecruitPeriod.value]);
const recruitLegend = computed(() => [
  { key: 'free' as const, label: '自由招募', color: '#1E5BFF' },
  { key: 'directed' as const, label: '定向招募', color: '#F67ADF' },
]);
const currentRecruitSummary = computed<RecruitSummary>(() => {
  const { free, directed } = currentRecruitData.value;
  const total = free + directed;
  const autoKey: RecruitKey = free >= directed ? 'free' : 'directed';
  const activeKey = selectedRecruitKey.value ?? autoKey;
  const primaryValue = activeKey === 'free' ? free : directed;

  return {
    activeKey,
    primaryLabel: activeKey === 'free' ? '自由招募' : '定向招募',
    rate: total > 0 ? primaryValue / total : 0,
    valueText: formatPercent(total > 0 ? primaryValue / total : 0),
  };
});

function makeRecentDayLabels(count: number) {
  return Array.from({ length: count }, (_, index) => {
    return dayjs()
      .subtract(count - index - 1, 'day')
      .format('MM-DD');
  });
}

function makeMonthLabels() {
  const total = dayjs().date();
  return Array.from({ length: total }, (_, index) => dayjs().startOf('month').add(index, 'day').format('MM-DD'));
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function handleNavigate(route?: string) {
  if (!route) return;
  router.push(route);
}

function getSettlementOption(): EChartsCoreOption {
  const trend = settlementTrendMap[activeSettlementPeriod.value];
  const maxCount = Math.max(...trend.bills, ...trend.settlements, 1);
  const maxAmount = Math.max(...trend.amounts, 1);

  return {
    color: ['#2F6BFF', '#F5A623', '#9A7CFF'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(31, 41, 55, 0.92)',
      borderWidth: 0,
      padding: [10, 12],
      textStyle: {
        color: '#FFFFFF',
        fontSize: 12,
      },
      formatter(params: unknown) {
        const items = (Array.isArray(params) ? params : [params]) as Array<{
          seriesName: string;
          value: number | string;
          marker: string;
          axisValueLabel?: string;
        }>;
        const lines = items.map((item) => {
          const isAmount = item.seriesName === '结算金额';
          const value = isAmount ? formatAmount(Number(item.value)) : item.value;
          return `${item.marker}${item.seriesName}: ${value}`;
        });
        return [items[0]?.axisValueLabel || '', ...lines].join('<br/>');
      },
    },
    legend: {
      top: 0,
      left: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 18,
      textStyle: {
        color: '#667085',
        fontSize: 13,
      },
      data: ['账单数', '结算人数', '结算金额'],
    },
    grid: {
      left: 46,
      right: 52,
      top: 52,
      bottom: 28,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trend.labels,
      axisLine: {
        lineStyle: {
          color: '#E4E7EC',
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#98A2B3',
        fontSize: 12,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '账单数/结算人数',
        min: 0,
        max: Math.max(8, Math.ceil(maxCount + 1)),
        nameTextStyle: {
          color: '#2F6BFF',
          padding: [0, 0, 8, 0],
        },
        axisLabel: {
          color: '#98A2B3',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: '#EEF2F7',
          },
        },
      },
      {
        type: 'value',
        name: '结算金额',
        min: 0,
        max: Math.max(240, Math.ceil(maxAmount / 20) * 20),
        nameTextStyle: {
          color: '#2F6BFF',
          padding: [0, 0, 8, 0],
        },
        axisLabel: {
          color: '#98A2B3',
          fontSize: 12,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: '账单数',
        type: 'line',
        smooth: true,
        data: trend.bills,
        yAxisIndex: 0,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#FFFFFF',
        },
      },
      {
        name: '结算人数',
        type: 'line',
        smooth: true,
        data: trend.settlements,
        yAxisIndex: 0,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#FFFFFF',
        },
      },
      {
        name: '结算金额',
        type: 'line',
        smooth: true,
        data: trend.amounts,
        yAxisIndex: 1,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#FFFFFF',
        },
      },
    ],
  };
}

function getRecruitOption(): EChartsCoreOption {
  const { free, directed } = currentRecruitData.value;

  return {
    color: ['#1E5BFF', '#F67ADF'],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(31, 41, 55, 0.92)',
      borderWidth: 0,
      padding: [10, 12],
      textStyle: {
        color: '#FFFFFF',
        fontSize: 12,
      },
      formatter(params: unknown) {
        const item = params as { marker: string; name: string; value: number };
        return `${item.marker}${item.name}: ${item.value}`;
      },
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '39%',
        silent: true,
        style: {
          text: currentRecruitSummary.value.valueText,
          fill: '#101828',
          font: '700 24px TencentSansW7, PingFang SC, sans-serif',
          textAlign: 'center',
          textVerticalAlign: 'middle',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '51%',
        silent: true,
        style: {
          text: currentRecruitSummary.value.primaryLabel,
          fill: '#667085',
          font: '13px PingFang SC, sans-serif',
          textAlign: 'center',
          textVerticalAlign: 'middle',
        },
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['64%', '82%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        startAngle: 90,
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderWidth: 0,
        },
        emphasis: {
          scale: false,
        },
        data: [
          {
            value: free,
            name: '自由招募',
            itemStyle: {
              opacity: currentRecruitSummary.value.activeKey === 'free' ? 1 : 0.45,
            },
          },
          {
            value: directed,
            name: '定向招募',
            itemStyle: {
              opacity: currentRecruitSummary.value.activeKey === 'directed' ? 1 : 0.45,
            },
          },
        ],
      },
    ],
  };
}

function updateSettlementChart() {
  if (!settlementChart) return;
  settlementChart.setOption(getSettlementOption(), true);
  settlementChart.resize();
}

function updateRecruitChart() {
  if (!recruitChart) return;
  recruitChart.setOption(getRecruitOption(), true);
  recruitChart.resize();
}

function handleRecruitHighlight(key: RecruitKey) {
  selectedRecruitKey.value = key;
  updateRecruitChart();
}

function clearRecruitHighlight() {
  if (selectedRecruitKey.value === null) return;
  selectedRecruitKey.value = null;
  updateRecruitChart();
}

function handleRecruitAreaClick() {
  if (preventRecruitClear) {
    preventRecruitClear = false;
    return;
  }
  clearRecruitHighlight();
}

function initSettlementChart() {
  if (!settlementChartRef.value) return;
  settlementChart = echarts.init(settlementChartRef.value);
  updateSettlementChart();
}

function initRecruitChart() {
  if (!recruitChartRef.value) return;
  recruitChart = echarts.init(recruitChartRef.value);
  recruitChart.on('click', (params: { name?: string }) => {
    if (params.name === '自由招募') {
      preventRecruitClear = true;
      handleRecruitHighlight('free');
      return;
    }
    if (params.name === '定向招募') {
      preventRecruitClear = true;
      handleRecruitHighlight('directed');
      return;
    }
    clearRecruitHighlight();
  });
  updateRecruitChart();
}

function handleResize() {
  settlementChart?.resize();
  recruitChart?.resize();
}

onMounted(() => {
  nextTick(() => {
    initSettlementChart();
    initRecruitChart();
  });
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  settlementChart?.dispose();
  settlementChart = null;
  recruitChart?.dispose();
  recruitChart = null;
});

watch(activeSettlementPeriod, () => {
  updateSettlementChart();
});

watch(activeRecruitPeriod, () => {
  selectedRecruitKey.value = null;
  updateRecruitChart();
});
</script>
<style lang="less" scoped>
.dashboard-page {
  --dashboard-panel-bg: #fff;
  --dashboard-border: #edf2f7;
  --dashboard-text: #101828;
  --dashboard-subtext: #667085;
  --dashboard-muted: #98a2b3;
  --dashboard-blue: #2f6bff;
  --dashboard-shadow: 0 8px 24px rgb(15 23 42 / 4%);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-grid,
.shortcut-grid,
.dashboard-grid {
  display: grid;
  gap: 16px;
}

.metric-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card,
.panel,
.shortcut-card {
  background: var(--dashboard-panel-bg);
  border: 1px solid var(--dashboard-border);
  border-radius: 0;
  box-shadow: var(--dashboard-shadow);
}

.metric-card {
  overflow: hidden;
}

.metric-card__header,
.metric-card__footer,
.metric-card__value,
.metric-card__meta {
  padding-right: 24px;
  padding-left: 24px;
}

.metric-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
}

.metric-card__title {
  color: var(--dashboard-text);
  font-size: 16px;
  font-weight: 600;
}

.metric-card__badge {
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  background: #f2f4f7;
  color: var(--dashboard-subtext);
  font-size: 12px;
  line-height: 24px;
}

.metric-card__value {
  padding-top: 14px;
  color: #2d3139;
  font-family: 'TencentSansW7', 'PingFang SC', sans-serif;
  font-size: 30px;
  line-height: 1.2;
}

.metric-card__meta {
  display: flex;
  gap: 28px;
  padding-top: 18px;
  padding-bottom: 20px;
  color: var(--dashboard-subtext);
  font-size: 14px;
}

.metric-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.metric-card__ratio--up {
  color: #ff7a1a;
}

.metric-card__ratio--down {
  color: #14b8a6;
}

.metric-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  border-top: 1px solid var(--dashboard-border);
  color: var(--dashboard-subtext);
  font-size: 14px;
}

.metric-card__footer strong {
  color: #344054;
  font-weight: 500;
}

.shortcut-grid {
  grid-template-columns: repeat(8, minmax(0, 1fr));
}

.shortcut-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 124px;
  padding: 20px 12px;
  color: var(--dashboard-text);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.shortcut-card:hover,
.todo-item:hover {
  border-color: #d0d5dd;
  transform: translateY(-1px);
}

.shortcut-card__icon,
.todo-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: var(--shortcut-color);
}

.shortcut-card__icon {
  width: 48px;
  height: 48px;
  background: var(--shortcut-bg);
}

.shortcut-card__label {
  margin-top: 16px;
  font-size: 15px;
  font-weight: 600;
}

.dashboard-grid--top {
  grid-template-columns: minmax(0, 1.04fr) minmax(0, 1fr);
}

.dashboard-grid--bottom {
  grid-template-columns: minmax(0, 1.7fr) minmax(360px, 1fr);
}

.panel {
  padding: 22px 24px 24px;
}

.panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel__header--align-start {
  align-items: flex-start;
}

.panel__title {
  margin: 0;
  color: var(--dashboard-text);
  font-size: 18px;
  font-weight: 700;
}

.panel__subtext {
  margin: 8px 0 0;
  color: var(--dashboard-blue);
  font-size: 14px;
}

.period-switch {
  display: inline-flex;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  overflow: hidden;
  flex-wrap: wrap;
}

.period-switch__item {
  min-width: 60px;
  height: 30px;
  padding: 0 14px;
  border: 0;
  border-left: 1px solid #d0d5dd;
  background: #fff;
  color: #344054;
  font-size: 14px;
  cursor: pointer;
}

.period-switch__item:first-child {
  border-left: 0;
}

.period-switch__item--active {
  background: #eff4ff;
  color: var(--dashboard-blue);
  box-shadow: inset 0 0 0 1px var(--dashboard-blue);
}

.todo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px 32px;
  margin-top: 40px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.todo-item__icon {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  background: var(--todo-bg);
  color: var(--todo-color);
  border-radius: 12px;
}

.todo-item__content {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item__label {
  color: var(--dashboard-subtext);
  font-size: 14px;
}

.todo-item__value {
  color: #2d3139;
  font-family: 'TencentSansW7', 'PingFang SC', sans-serif;
  font-size: 18px;
}

.ranking-table {
  margin-top: 28px;
}

.ranking-table__header,
.ranking-table__row {
  display: grid;
  grid-template-columns: 88px minmax(150px, 1.05fr) minmax(220px, 1.35fr) 110px 110px;
  align-items: center;
  column-gap: 14px;
}

.ranking-table__header {
  padding: 0 4px 16px;
  color: var(--dashboard-text);
  font-size: 14px;
  font-weight: 600;
}

.ranking-table__row {
  min-height: 60px;
  padding: 0 4px;
  border-top: 1px solid var(--dashboard-border);
  color: var(--dashboard-subtext);
  font-size: 14px;
}

.ranking-table__row span:last-child {
  color: #344054;
}

.chart--line {
  width: 100%;
  height: 360px;
  margin-top: 10px;
}

.recruit-panel {
  display: flex;
  flex-direction: column;
}

.recruit-chart {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 360px;
  padding: 8px 0 4px;
}

.chart--donut {
  width: 100%;
  max-width: 220px;
  height: 220px;
}

.recruit-legend {
  display: flex;
  gap: 36px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2px;
}

.recruit-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--dashboard-subtext);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.55;
  transition:
    opacity 0.2s ease,
    color 0.2s ease;
}

.recruit-legend__item--active {
  color: #344054;
  opacity: 1;
}

.recruit-legend__dot {
  width: 12px;
  height: 3px;
  border-radius: 999px;
}

@media (max-width: 1600px) {
  .shortcut-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1360px) {
  .metric-grid,
  .dashboard-grid--top,
  .dashboard-grid--bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid--top > :first-child,
  .dashboard-grid--bottom > :first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 960px) {
  .metric-grid,
  .shortcut-grid,
  .dashboard-grid--top,
  .dashboard-grid--bottom,
  .todo-grid {
    grid-template-columns: 1fr;
  }

  .ranking-table {
    overflow-x: auto;
  }

  .ranking-table__header,
  .ranking-table__row {
    min-width: 720px;
  }

  .chart--line {
    height: 300px;
  }
}
</style>
