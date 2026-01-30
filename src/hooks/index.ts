import * as echarts from 'echarts/core';
import type { Ref, ShallowRef } from 'vue';
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

/**
 * eChart hook
 * @param domId
 */
export const useChart = (domId: string): ShallowRef<echarts.ECharts> => {
  let chartContainer: HTMLCanvasElement;
  const selfChart = shallowRef<echarts.ECharts | any>();
  const updateContainer = () => {
    selfChart.value.resize({
      width: chartContainer.clientWidth,
      height: chartContainer.clientHeight,
    });
  };

  onMounted(() => {
    if (!chartContainer) {
      chartContainer = document.getElementById(domId) as HTMLCanvasElement;
    }
    selfChart.value = echarts.init(chartContainer);
  });

  window.addEventListener('resize', updateContainer, false);

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainer);
  });

  return selfChart;
};

/**
 * counter utils
 * @param duration
 * @returns counter
 */
export const useCounter = (
  duration = 60,
): [Ref<number>, (callback?: () => void, validate?: () => boolean) => boolean] => {
  let intervalTimer: ReturnType<typeof setInterval>;
  onUnmounted(() => {
    clearInterval(intervalTimer);
  });
  const countDown = ref(0);

  return [
    countDown,
    (callback?: () => void, validate?: () => boolean) => {
      // 执行校验
      if (validate && !validate()) {
        return false;
      }

      // 执行回调
      if (callback) {
        callback();
      }

      // 启动倒计时
      countDown.value = duration;
      intervalTimer = setInterval(() => {
        if (countDown.value > 0) {
          countDown.value -= 1;
        } else {
          clearInterval(intervalTimer);
          countDown.value = 0;
        }
      }, 1000);

      return true;
    },
  ];
};

export * from './useCommonTable';
