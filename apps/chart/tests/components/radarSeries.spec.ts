import RadarSeries from '@src/component/radarSeries';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { deepMergedCopy } from '@src/helpers/utils';
import { Options } from '@t/store/store';

let radarSeries;

const seriesData = [
  { name: 'han', data: [1, 2, 3, 4], color: '#aaaaaa' },
  { name: 'cho', data: [2, 1, 1, 3], color: '#bbbbbb' },
];

const chartState = {
  chart: { width: 200, height: 200 },
  layout: {
    plot: { width: 200, height: 200, x: 0, y: 0 },
  },
  scale: { yAxis: { limit: { min: 1, max: 4 }, stepSize: 1, stepCount: 1 } },
  series: {
    radar: {
      data: seriesData,
    },
  },
  axes: {
    xAxis: {},
    yAxis: {},
    radialAxis: {
      labels: ['0', '1', '2', '3', '4', '5'],
      axisSize: 50,
      centerX: 100,
      centerY: 100,
    },
  },
  categories: ['A', 'B', 'C', 'D'],
  options: {},
  legend: {
    data: [
      { label: 'han', active: true, checked: true },
      { label: 'cho', active: true, checked: true },
    ],
  },
  theme: {
    series: {
      radar: {
        areaOpacity: 0.3,
        colors: ['#aaaaaa', '#bbbbbb'],
        dot: {
          radius: 3,
        },
        hover: {
          dot: {
            radius: 4,
            borderWidth: 2,
          },
        },
        select: {
          dot: {
            radius: 4,
            borderWidth: 2,
          },
        },
      },
    },
  },
};

describe('radar series', () => {
  beforeEach(() => {
    radarSeries = new RadarSeries({
      store: {} as Store<Options>,
      eventBus: new EventEmitter(),
    });

    radarSeries.render(chartState);
  });
  const result = {
    models: {
      polygon: [
        {
          type: 'polygon',
          color: 'rgba(170, 170, 170, 1)',
          lineWidth: 2,
          points: [
            { x: 100, y: 90 },
            { x: 120, y: 100 },
            { x: 100, y: 130 },
            { x: 60, y: 100 },
          ],
          fillColor: 'rgba(170, 170, 170, 0)',
          distances: [10, 20, 30, 40],
          name: 'han',
        },
        {
          type: 'polygon',
          color: 'rgba(187, 187, 187, 1)',
          lineWidth: 2,
          points: [
            { x: 100, y: 80 },
            { x: 110, y: 100 },
            { x: 100, y: 110 },
            { x: 70, y: 100 },
          ],
          fillColor: 'rgba(187, 187, 187, 0)',
          distances: [20, 10, 10, 30],
          name: 'cho',
        },
      ],
      dot: [],
    },
    responders: [
      {
        type: 'circle',
        x: 100,
        y: 90,
        radius: 3,
        color: 'rgba(170, 170, 170, 1)',
        seriesIndex: 0,
        data: { label: 'han', color: '#aaaaaa', value: 1, category: 'A' },
        name: 'han',
        index: 0,
      },
      {
        type: 'circle',
        x: 120,
        y: 100,
        radius: 3,
        color: 'rgba(170, 170, 170, 1)',
        seriesIndex: 0,
        data: { label: 'han', color: '#aaaaaa', value: 2, category: 'B' },
        name: 'han',
        index: 1,
      },
      {
        type: 'circle',
        x: 100,
        y: 130,
        radius: 3,
        color: 'rgba(170, 170, 170, 1)',
        seriesIndex: 0,
        data: { label: 'han', color: '#aaaaaa', value: 3, category: 'C' },
        name: 'han',
        index: 2,
      },
      {
        type: 'circle',
        x: 60,
        y: 100,
        radius: 3,
        color: 'rgba(170, 170, 170, 1)',
        seriesIndex: 0,
        data: { label: 'han', color: '#aaaaaa', value: 4, category: 'D' },
        name: 'han',
        index: 3,
      },
      {
        type: 'circle',
        x: 100,
        y: 80,
        radius: 3,
        color: 'rgba(187, 187, 187, 1)',
        seriesIndex: 1,
        data: { label: 'cho', color: '#bbbbbb', value: 2, category: 'A' },
        name: 'cho',
        index: 0,
      },
      {
        type: 'circle',
        x: 110,
        y: 100,
        radius: 3,
        color: 'rgba(187, 187, 187, 1)',
        seriesIndex: 1,
        data: { label: 'cho', color: '#bbbbbb', value: 1, category: 'B' },
        name: 'cho',
        index: 1,
      },
      {
        type: 'circle',
        x: 100,
        y: 110,
        radius: 3,
        color: 'rgba(187, 187, 187, 1)',
        seriesIndex: 1,
        data: { label: 'cho', color: '#bbbbbb', value: 1, category: 'C' },
        name: 'cho',
        index: 2,
      },
      {
        type: 'circle',
        x: 70,
        y: 100,
        radius: 3,
        color: 'rgba(187, 187, 187, 1)',
        seriesIndex: 1,
        data: { label: 'cho', color: '#bbbbbb', value: 3, category: 'D' },
        name: 'cho',
        index: 3,
      },
    ],
  };

  ['models', 'responders'].forEach((modelName) => {
    it(`should make ${modelName} properly when calling render`, () => {
      expect(radarSeries[modelName]).toEqual(result[modelName]);
    });
  });

  it('should be render circle models, when "series.showDot" is true', () => {
    radarSeries.render(
      deepMergedCopy(chartState, {
        options: {
          series: {
            showDot: true,
          },
        },
      })
    );

    expect(radarSeries.models.dot).toEqual([
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 100,
        y: 90,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
      },
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 120,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
      },
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 100,
        y: 130,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
      },
      {
        type: 'circle',
        color: 'rgba(170, 170, 170, 1)',
        radius: 3,
        x: 60,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'han',
      },
      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 100,
        y: 80,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
      },
      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 110,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
      },

      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 100,
        y: 110,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
      },
      {
        type: 'circle',
        color: 'rgba(187, 187, 187, 1)',
        radius: 3,
        x: 70,
        y: 100,
        style: [{ strokeStyle: 'rgba(0, 0, 0, 0)' }],
        name: 'cho',
      },
    ]);
  });

  it('should be render filled polygon models, when "series.showArea" is true', () => {
    radarSeries.render(
      deepMergedCopy(chartState, {
        options: {
          series: {
            showArea: true,
          },
        },
      })
    );

    expect(radarSeries.models.polygon.map((m) => m.fillColor)).toEqual([
      'rgba(170, 170, 170, 0.3)',
      'rgba(187, 187, 187, 0.3)',
    ]);
  });
});