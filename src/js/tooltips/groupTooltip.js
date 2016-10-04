/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase');
var GroupTooltipPositionModel = require('./groupTooltipPositionModel');
var chartConst = require('../const');
var dom = require('../helpers/domHandler');
var renderUtil = require('../helpers/renderUtil');
var defaultTheme = require('../themes/defaultTheme');
var tooltipTemplate = require('./tooltipTemplate');

/**
 * @classdesc GroupTooltip component.
 * @class GroupTooltip
 */
var GroupTooltip = tui.util.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {
    /**
     * Group tooltip component.
     * @constructs GroupTooltip
     * @override
     */
    init: function() {
        this.prevIndex = null;
        TooltipBase.apply(this, arguments);
    },

    /**
     * Make tooltip html.
     * @param {string} category category
     * @param {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} items items data
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(category, items) {
        var template = tooltipTemplate.tplGroupItem,
            cssTextTemplate = tooltipTemplate.tplGroupCssText,
            colors = this._makeColors(this.theme),
            itemsHtml = tui.util.map(items, function(item, index) {
                return template(tui.util.extend({
                    cssText: cssTextTemplate({color: colors[index]})
                }, item));
            }).join('');

        return tooltipTemplate.tplGroup({
            category: category,
            items: itemsHtml
        });
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.align) {
            return;
        }

        if (this.isVertical) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION;
        } else {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION;
        }
    },

    /**
     * Render tooltip component.
     * @returns {HTMLElement}
     * @override
     */
    render: function(data) {
        var container = TooltipBase.prototype.render.call(this, data);
        var chartDimension = this.dimensionMap.chart;
        var bound = this.layout;

        this.positionModel = new GroupTooltipPositionModel(chartDimension, bound, this.isVertical, this.options);

        return container;
    },

    /**
     * Rerender.
     * @param {{checkedLegends: Array.<boolean>}} data rendering data
     * @override
     */
    rerender: function(data) {
        TooltipBase.prototype.rerender.call(this, data);
        this.prevIndex = null;

        if (data.checkedLegends) {
            this.theme = this._updateLegendTheme(data.checkedLegends);
        }
    },

    /**
     * Zoom.
     */
    zoom: function() {
        this.prevIndex = null;
        TooltipBase.prototype.zoom.call(this);
    },

    /**
     * Update legend theme.
     * @param {object | Array.<boolean>}checkedLegends checked legends
     * @returns {{colors: Array.<string>}} legend theme
     * @private
     */
    _updateLegendTheme: function(checkedLegends) {
        var colors = [];

        tui.util.forEachArray(this.dataProcessor.getOriginalLegendData(), function(item) {
            var _checkedLegends = checkedLegends[item.chartType] || checkedLegends;
            if (_checkedLegends[item.index]) {
                colors.push(item.theme.color);
            }
        });

        return {
            colors: colors
        };
    },

    /**
     * Make tooltip data.
     * @returns {Array.<object>} tooltip data
     * @override
     */
    _makeTooltipData: function() {
        var self = this;

        return tui.util.map(this.dataProcessor.getSeriesGroups(), function(seriesGroup, index) {
            return {
                category: self.dataProcessor.getCategory(index),
                values: seriesGroup.pluck('label')
            };
        });
    },

    /**
     * Make colors.
     * @param {object} theme tooltip theme
     * @returns {Array.<string>} colors
     * @private
     */
    _makeColors: function(theme) {
        var colorIndex = 0,
            legendLabels = this.dataProcessor.getLegendData(),
            defaultColors, colors, prevChartType;

        if (theme.colors) {
            return theme.colors;
        }

        defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);

        return tui.util.map(tui.util.pluck(legendLabels, 'chartType'), function(chartType) {
            var color;

            if (prevChartType !== chartType) {
                colors = theme[chartType] ? theme[chartType].colors : defaultColors;
                colorIndex = 0;
            }

            prevChartType = chartType;
            color = colors[colorIndex];
            colorIndex += 1;

            return color;
        });
    },

    /**
     * Make rendering data about legend item.
     * @param {Array.<string>} values values
     * @returns {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} legend item data.
     * @private
     */
    _makeItemRenderingData: function(values) {
        var dataProcessor = this.dataProcessor,
            suffix = this.suffix;

        return tui.util.map(values, function(value, index) {
            var legendLabel = dataProcessor.getLegendItem(index);

            return {
                value: value,
                legend: legendLabel.label,
                chartType: legendLabel.chartType,
                suffix: suffix
            };
        });
    },

    /**
     * Make tooltip.
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeGroupTooltipHtml: function(groupIndex) {
        var data = this.data[groupIndex],
            items = this._makeItemRenderingData(data.values);

        return this.templateFunc(data.category, items);
    },

    /**
     * Get tooltip sector element.
     * @returns {HTMLElement} sector element
     * @private
     */
    _getTooltipSectorElement: function() {
        var groupTooltipSector;

        if (!this.groupTooltipSector) {
            this.groupTooltipSector = groupTooltipSector = dom.create('DIV', 'tui-chart-group-tooltip-sector');
            dom.append(this.tooltipContainer, groupTooltipSector);
        }

        return this.groupTooltipSector;
    },

    /**
     * Make bound about tooltip sector of vertical type chart.
     * @param {number} height height
     * @param {{start: number, end: number}} range range
     * @param {boolean} isLine whether line or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeVerticalTooltipSectorBound: function(height, range, isLine) {
        var width;

        if (isLine) {
            width = 1;
            height += 6;
        } else {
            width = range.end - range.start;
        }

        return {
            dimension: {
                width: width,
                height: height
            },
            position: {
                left: range.start + chartConst.SERIES_EXPAND_SIZE,
                top: chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Make bound about tooltip sector of horizontal type chart.
     * @param {number} width width
     * @param {{start: number, end:number}} range range
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeHorizontalTooltipSectorBound: function(width, range) {
        return {
            dimension: {
                width: width,
                height: range.end - range.start
            },
            position: {
                left: chartConst.SERIES_EXPAND_SIZE,
                top: range.start + chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Make bound about tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {boolean} isLine whether line type or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeTooltipSectorBound: function(size, range, isVertical, isLine) {
        var bound;

        if (isVertical) {
            bound = this._makeVerticalTooltipSectorBound(size, range, isLine);
        } else {
            bound = this._makeHorizontalTooltipSectorBound(size, range);
        }

        return bound;
    },

    /**
     * Show tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {number} index index
     * @param {boolean} [isMoving] whether moving or not
     * @private
     */
    _showTooltipSector: function(size, range, isVertical, index, isMoving) {
        var groupTooltipSector = this._getTooltipSectorElement(),
            isLine = (range.start === range.end),
            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);

        if (isLine) {
            this.eventBus.fire('showGroupTooltipLine', bound);
        } else {
            renderUtil.renderDimension(groupTooltipSector, bound.dimension);
            renderUtil.renderPosition(groupTooltipSector, bound.position);
            dom.addClass(groupTooltipSector, 'show');
        }

        if (isMoving) {
            index -= 1;
        }

        this.eventBus.fire('showGroupAnimation', index);
    },

    /**
     * Hide tooltip sector.
     * @param {number} index index
     * @private
     */
    _hideTooltipSector: function(index) {
        var groupTooltipSector = this._getTooltipSectorElement();

        dom.removeClass(groupTooltipSector, 'show');
        this.eventBus.fire('hideGroupAnimation', index);
        this.eventBus.fire('hideGroupTooltipLine');
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     * @private
     */
    _showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;

        if (!tui.util.isNull(this.prevIndex)) {
            this.eventBus.fire('hideGroupAnimation', this.prevIndex);
        }

        elTooltip.innerHTML = this._makeGroupTooltipHtml(params.index);

        this._fireBeforeShowTooltipPublicEvent(params.index, params.range);

        dom.addClass(elTooltip, 'show');

        this._showTooltipSector(params.size, params.range, params.isVertical, params.index, params.isMoving);

        dimension = this.getTooltipDimension(elTooltip);
        position = this.positionModel.calculatePosition(dimension, params.range);

        this._moveToPosition(elTooltip, position, prevPosition);

        this._fireAfterShowTooltipPublicEvent(params.index, params.range, {
            element: elTooltip,
            position: position
        });

        this.prevIndex = params.index;
    },

    /**
     * To call beforeShowTooltip callback of public event.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @private
     */
    _fireBeforeShowTooltipPublicEvent: function(index, range) {
        this.eventBus.fire(chartConst.PUBLIC_EVENT_PREFIX + 'beforeShowTooltip', {
            chartType: this.chartType,
            index: index,
            range: range
        });
    },

    /**
     * To call afterShowTooltip callback of public event.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @param {object} additionParams addition parameters
     * @private
     */
    _fireAfterShowTooltipPublicEvent: function(index, range, additionParams) {
        this.eventBus.fire(chartConst.PUBLIC_EVENT_PREFIX + 'afterShowTooltip', tui.util.extend({
            chartType: this.chartType,
            index: index,
            range: range
        }, additionParams));
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {number} index index
     * @private
     */
    _hideTooltip: function(elTooltip, index) {
        this.prevIndex = null;
        this._hideTooltipSector(index);
        dom.removeClass(elTooltip, 'show');
        elTooltip.style.cssText = '';
    }
});

module.exports = GroupTooltip;
