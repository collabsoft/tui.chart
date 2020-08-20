import { BubblePoint, ObjectTypeDatetimePoint, Point } from '@t/options';
import { TooltipDataValue } from '@t/components/tooltip';
import { isObject } from '@src/helpers/utils';

function isBubblePointType(value: ObjectTypeDatetimePoint | Point): value is BubblePoint {
  return value.hasOwnProperty('r');
}

export function getValueString(value: TooltipDataValue) {
  if (isObject(value)) {
    return `(${value.x}, ${value.y})` + (isBubblePointType(value) ? `, r: ${value.r}` : '');
  }

  return String(value);
}
