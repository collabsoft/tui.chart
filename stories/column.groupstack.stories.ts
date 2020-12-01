import ColumnChart from '@src/charts/columnChart';
import { lossDataForGroupStack, genderAgeGroupData } from './data';
import { ColumnChartOptions } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';
import { withKnobs, radios } from '@storybook/addon-knobs';
import '@src/css/chart.css';

export default {
  title: 'chart.Column.GroupStack',
  decorators: [withKnobs],
};

const width = 1000;
const height = 500;
const defaultOptions: ColumnChartOptions = {
  chart: {
    title: 'Population Distribution',
    width,
    height,
  },
};

function createChart(data, customOptions?: ColumnChartOptions) {
  const el = document.createElement('div');
  const options = deepMergedCopy(defaultOptions, customOptions || {});

  el.style.outline = '1px solid red';
  el.style.width = `${options?.chart?.width}px`;
  el.style.height = `${options?.chart?.height}px`;

  const chart = new ColumnChart({
    el,
    data,
    options,
  });

  return { el, chart };
}

export const positive = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const selectable = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      selectable: true,
    },
  });

  return el;
};

export const negative = () => {
  const { el } = createChart(lossDataForGroupStack, {
    series: {
      stack: true,
    },
  });

  return el;
};

export const diverging = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      diverging: true,
    },
  });

  return el;
};

export const dataLabels = () => {
  const { el } = createChart(genderAgeGroupData, {
    chart: {
      width: 1500,
      height,
      title: 'Monthly Revenue',
    },
    series: {
      stack: true,
      dataLabels: {
        visible: true,
        style: {
          textStrokeColor: 'rgba(255, 255, 255, 0.6)',
        },
      },
    },
  });

  return el;
};

export const theme = () => {
  const { el } = createChart(genderAgeGroupData, {
    series: {
      stack: true,
      selectable: true,
      eventDetectType: radios('eventDetectType', { point: 'point', grouped: 'grouped' }, 'grouped'),
    },
    theme: {
      series: {
        colors: ['#EDAE49', '#D1495B', '#00798C', '#30638E'],
        barWidth: 20,
        areaOpacity: 1,
        hover: {
          color: '#00ff00',
          borderColor: '#73C8E7',
          borderWidth: 4,
          shadowColor: 'rgba(0, 0, 0, 0.7)',
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          shadowBlur: 6,
          groupedRect: {
            color: '#F0DCBC',
            opacity: 0.5,
          },
        },
        select: {
          color: '#0000ff',
          borderColor: '#000000',
          borderWidth: 4,
          shadowColor: 'rgba(0, 0, 0, 0)',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 0,
          groupedRect: {
            color: '#74521A',
            opacity: 0.2,
          },
          restSeries: {
            areaOpacity: 0.5,
          },
          areaOpacity: 0.8,
        },
        connector: {
          color: '#031f4b',
          lineWidth: 2,
          dashSegments: [5, 10],
        },
      },
    },
  });

  return el;
};