import { Point, Rect, BezierPoint, BoxSeriesDataType } from '../options';
import { CircleStyleName, RectStyleName } from '@src/brushes/basic';
import { TooltipData } from '@t/components/tooltip';
import { LineModel, LabelModel } from '@t/components/axis';
import { SectorStyle, SectorStyleName } from '@src/brushes/sector';
import { LegendData } from '@t/components/legend';
import { TreemapSeriesData } from '@t/store/store';
import Component from '@src/component/component';
import { BubbleDataLabel } from '@t/theme';

export type Nullable<T> = T | null;
export type StyleProp<T, K> = (T | K)[];
export type PointModel = Point & { value?: number; name?: string };

export type RespondersModel = {
  component: Component;
  detected: ResponderModel[];
}[];

export interface CircleStyle {
  strokeStyle?: string;
  lineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
}

export type ResponderModel =
  | CircleResponderModel
  | RectResponderModel
  | RectModel
  | BoxPlotResponderModel
  | SectorResponderModel
  | TreemapRectResponderModel
  | MarkerResponderModel
  | BulletResponderModel;

export type TreemapSeriesModels = { series: TreemapRectModel[]; layer: TreemapRectModel[] };

export type CircleModel = {
  type: 'circle';
  radius: number;
  color: string;
  style?: StyleProp<CircleStyle, CircleStyleName>;
  seriesIndex?: number;
  index?: number;
  angle?: {
    start: number;
    end: number;
  };
  name?: string;
  borderWidth?: number;
  borderColor?: string;
} & Point;

export type CircleResponderModel = {
  detectionSize?: number;
  data: TooltipData;
} & CircleModel;

export type ClipRectAreaModel = {
  type: 'clipRectArea';
} & Rect;

export type LinePointsModel = {
  type: 'linePoints';
  color: string;
  lineWidth: number;
  points: BezierPoint[];
  name?: string;
  seriesIndex?: number;
  dashSegments?: number[];
};

export type AreaPointsModel = Omit<LinePointsModel, 'type'> & {
  type: 'areaPoints';
  fillColor: string;
};

export type PathRectModel = {
  type: 'pathRect';
  radius?: number;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
} & Rect;

export type RectStyle = {
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
};

export type RectModel = {
  type: 'rect';
  color: string;
  borderColor?: string;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness?: number;
  value?: BoxSeriesDataType;
  name?: string;
  index?: number;
} & Rect;

export type TreemapRectModel = {
  type: 'rect';
  color: string;
  colorRatio?: number;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness?: number;
} & Rect &
  TreemapSeriesData;

export type HeatmapRectModels = {
  series: HeatmapRectModel[];
};

export type HeatmapRectModel = {
  type: 'rect';
  name: string;
  color: string;
  colorRatio: number;
  colorValue: number;
  style?: StyleProp<RectStyle, RectStyleName>;
  thickness: number;
} & Rect;

export type HeatmapRectResponderModel = HeatmapRectModel & {
  data?: { name?: string } & Partial<TooltipData>;
};

export type TreemapRectResponderModel = Omit<TreemapRectModel, 'data'> & {
  index?: number;
  data?: Partial<TooltipData>;
} & Rect;

export type RectResponderModel = Partial<RectModel> & {
  type: 'rect';
  index?: number;
  data?: { name?: string } & Partial<TooltipData>;
} & Rect &
  Partial<LegendData>;

export type AreaSeriesModels = {
  rect: ClipRectAreaModel[];
  series: (AreaPointsModel | LinePointsModel)[];
  dot: CircleModel[];
};

export type BoxSeriesModels = {
  clipRect?: ClipRectAreaModel[];
  series: RectModel[];
  connector?: LineModel[];
  label?: LabelModel[];
};

export type CircleSeriesModels = {
  series: CircleModel[];
};

export type ScatterSeriesModels = {
  series: ScatterSeriesModel[];
};

export type LineSeriesModels = {
  rect: ClipRectAreaModel[];
  series: LinePointsModel[];
  dot: CircleModel[];
};

export type StackTotalModel = Omit<RectModel, 'type' | 'color'> & {
  type: 'stackTotal';
  theme: BubbleDataLabel;
};

export type PieSeriesModels = Record<string, SectorModel[]>;

export type SectorModel = {
  type: 'sector';
  color: string;
  degree: {
    start: number;
    end: number;
  };
  radius: {
    inner: number;
    outer: number;
  };
  name?: string;
  value?: number;
  style?: StyleProp<SectorStyle, SectorStyleName>;
  clockwise: boolean;
  drawingStartAngle: number;
  totalAngle: number;
  alias?: string;
  percentValue?: number;
} & Point;

export type SectorResponderModel = {
  data: TooltipData;
  seriesIndex: number;
} & SectorModel;

export type PolygonModel = {
  type: 'polygon';
  points: Point[];
  color: string;
  lineWidth: number;
  fillColor?: string;
  distances?: number[];
  name?: string;
  dashSegments?: number[];
};

export type RadarSeriesModels = {
  polygon: PolygonModel[];
  dot: CircleModel[];
};

export type BoxPlotSeriesModel = RectModel | LineModel | CircleModel;
export type BoxPlotResponderTypes =
  | BoxPlotResponderModel
  | CircleResponderModel
  | RectResponderModel;

export type BoxPlotSeriesModels = {
  series: BoxPlotSeriesModel[];
};

export type LineResponderModel = {
  detectionSize?: number;
} & LineModel;

export type BoxPlotModel = {
  type: 'boxPlot';
  color: string;
  name: string;
  rect: RectModel;
  median: LineModel;
  upperWhisker: LineModel;
  lowerWhisker: LineModel;
  minimum: LineModel;
  maximum: LineModel;
  index?: number;
};

export type BoxPlotResponderModel = {
  data?: TooltipData;
} & BoxPlotModel &
  Point;

export type BulletRectModel = {
  modelType: 'bullet' | 'range';
} & RectModel;

type BulletModel = BulletRectModel | LineModel;

export type MarkerResponderModel = {
  data?: TooltipData;
} & LineModel &
  LineResponderModel;

export type BulletResponderModel = {
  data?: TooltipData;
} & BulletModel;

export type BulletSeriesModels = {
  series: BulletModel[];
};

export interface MouseEventType {
  responders: CircleResponderModel[] | RectResponderModel[];
  mousePosition: Point;
}

export type NestedPieSeriesModels = Record<string, SectorModel[]> & {
  selectedSeries: SectorModel[];
};

export type ScatterSeriesIconType =
  | 'circle'
  | 'rect'
  | 'triangle'
  | 'pentagon'
  | 'star'
  | 'diamond'
  | 'cross'
  | 'hexagon';

export interface ScatterSeriesModel {
  type: 'scatterSeries';
  iconType: ScatterSeriesIconType;
  x: number;
  y: number;
  borderColor: string;
  borderWidth: number;
  fillColor: string;
  size: number;
  index?: number;
  seriesIndex?: number;
  name?: string;
}