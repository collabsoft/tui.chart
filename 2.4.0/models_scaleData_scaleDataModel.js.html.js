tui.util.defineNamespace("fedoc.content", {});
fedoc.content["models_scaleData_scaleDataModel.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>'use strict';\n\nvar scaleDataMaker = require('./scaleDataMaker');\nvar axisDataMaker = require('./axisDataMaker');\nvar predicate = require('../../helpers/predicate');\n\nvar ScaleDataModel = tui.util.defineClass(/** @lends ScaleDataModel.prototype */{\n    /**\n     * ScaleDataModel is scale model for scale data and axis data.\n     * @param {object} params - parameters\n     * @constructs ScaleDataModel\n     */\n    init: function(params) {\n        this.chartType = params.chartType;\n        this.seriesNames = params.seriesNames;\n        this.dataProcessor = params.dataProcessor;\n        this.boundsModel = params.boundsModel;\n        this.options = params.options;\n        this.theme = params.theme;\n        this.hasRightYAxis = !!params.hasRightYAxis;\n        this.prevValidLabelCount = null;\n\n        this.initScaleData(params.addedDataCount);\n        this.initForAutoTickInterval();\n    },\n\n    /**\n     * Initialize scale data.\n     * @param {?number} addedDataCount - increased added count by dynamic adding data\n     */\n    initScaleData: function(addedDataCount) {\n        this.scaleDataMap = {};\n        this.axisDataMap = {};\n        this.addedDataCount = addedDataCount;\n    },\n\n    /**\n     * Initialize for auto tick interval.\n     */\n    initForAutoTickInterval: function() {\n        this.firstTickCount = null;\n    },\n\n    /**\n     * Pick limit option.\n     * @param {{min: ?number, max: ?number}} axisOptions - axis options\n     * @returns {{min: ?number, max: ?number}}\n     * @private\n     */\n    _pickLimitOption: function(axisOptions) {\n        axisOptions = axisOptions || {};\n\n        return {\n            min: axisOptions.min,\n            max: axisOptions.max\n        };\n    },\n\n    /**\n     * Create base scale data.\n     * @param {{\n     *      chartType: string,\n     *      areaType: string,\n     *      valueType: string\n     * }} typeMap - type map\n     * @param {{\n     *      type: string,\n     *      stackType: string,\n     *      diverging: boolean\n     * }} baseOptions - base options\n     * @param {object} axisOptions - axis options\n     * @param {object} additionalOptions - additional options\n     * @returns {{limit: {min: number, max: number}, step: number}}\n     * @private\n     */\n    _createBaseScaleData: function(typeMap, baseOptions, axisOptions, additionalOptions) {\n        var chartType = typeMap.chartType;\n        var isVertical = typeMap.areaType !== 'xAxis';\n        var baseValues = this.dataProcessor.createBaseValuesForLimit(\n            chartType, additionalOptions.isSingleYAxis, baseOptions.stackType, typeMap.valueType\n        );\n        var baseSize = this.boundsModel.getBaseSizeForLimit(isVertical);\n        var options = tui.util.extend(baseOptions, {\n            isVertical: isVertical,\n            limitOption: this._pickLimitOption(axisOptions),\n            tickCounts: additionalOptions.tickCounts\n        });\n\n        if (predicate.isBubbleChart(chartType)) {\n            options.overflowItem = this.dataProcessor.findOverflowItem(chartType, typeMap.valueType);\n        }\n\n        return scaleDataMaker.makeScaleData(baseValues, baseSize, chartType, options);\n    },\n\n    /**\n     * Create scale labels.\n     * @param {{limit: {min: number, max: number}, step: number}} baseScaleData - base scale data\n     * @param {{\n     *      chartType: string,\n     *      areaType: string,\n     *      valueType: string\n     * }} typeMap - type map\n     * @param {{\n     *      type: string,\n     *      stackType: string,\n     *      diverging: boolean\n     * }} baseOptions - base options\n     * @param {string} dateFormat - date format\n     * @returns {Array.&lt;string>}\n     * @private\n     */\n    _createScaleLabels: function(baseScaleData, typeMap, baseOptions, dateFormat) {\n        var formatFunctions = this.dataProcessor.getFormatFunctions();\n        var options = tui.util.extend(baseOptions, {\n            dateFormat: dateFormat\n        });\n\n        return scaleDataMaker.createFormattedLabels(baseScaleData, typeMap, options, formatFunctions);\n    },\n\n    /**\n     * Create scale.\n     * @param {object} axisOptions - axis options\n     * @param {{chartType: string, areaType: string}} typeMap - type map\n     * @param {?object} additionalOptions - additional options\n     * @returns {object}\n     * @private\n     */\n    _createScaleData: function(axisOptions, typeMap, additionalOptions) {\n        var seriesOptions = this.options.series;\n        var chartType = typeMap.chartType || this.chartType;\n        var baseOptions, baseScaleData;\n\n        typeMap.chartType = chartType;\n        seriesOptions = seriesOptions[chartType] || seriesOptions;\n        baseOptions = {\n            stackType: additionalOptions.stackType || seriesOptions.stackType,\n            diverging: seriesOptions.diverging,\n            type: axisOptions.type\n        };\n        baseScaleData = this._createBaseScaleData(typeMap, baseOptions, axisOptions, additionalOptions);\n\n        return tui.util.extend(baseScaleData, {\n            labels: this._createScaleLabels(baseScaleData, typeMap, baseOptions, axisOptions.dateFormat),\n            axisOptions: axisOptions\n        });\n    },\n\n    /**\n     * Create value type axis data.\n     * @param {{labels: Array.&lt;string>, limit: {min: number, max: number}, step: number}} scaleData - scale data\n     * @param {object} labelTheme - label theme\n     * @param {boolean} aligned - aligned tick and label\n     * @param {boolean} isVertical - whether vertical or not\n     * @param {boolean} isPositionRight - whether right position or not\n     * @returns {{\n     *      labels: Array.&lt;string>,\n     *      tickCount: number,\n     *      validTickCount: number,\n     *      isLabelAxis: boolean,\n     *      limit: {min: number, max: number},\n     *      isVertical: boolean\n     * }}\n     * @private\n     */\n    _createValueAxisData: function(scaleData, labelTheme, aligned, isVertical, isPositionRight) {\n        var hasCategories = this.dataProcessor.hasCategories();\n        var isCoordinateLineType = !isVertical &amp;&amp; !hasCategories &amp;&amp; aligned;\n        var labels = scaleData.labels;\n        var limit = scaleData.limit;\n        var step = scaleData.step;\n        var tickCount = labels.length;\n        var values, additional;\n\n        var axisData = axisDataMaker.makeValueAxisData({\n            labels: labels,\n            tickCount: labels.length,\n            limit: limit,\n            step: step,\n            options: scaleData.axisOptions,\n            labelTheme: labelTheme,\n            isVertical: !!isVertical,\n            isPositionRight: !!isPositionRight,\n            aligned: aligned\n        });\n\n        if (isCoordinateLineType) {\n            values = this.dataProcessor.getValues(this.chartType, 'x');\n            additional = axisDataMaker.makeAdditionalDataForCoordinateLineType(labels, values, limit, step, tickCount);\n            tui.util.extend(axisData, additional);\n        }\n\n        return axisData;\n    },\n\n    /**\n     * Create label type axis data.\n     * @param {object} axisOptions - options for axis\n     * @param {object} labelTheme - label theme\n     * @param {boolean} aligned - aligned tick and label\n     * @param {boolean} isVertical - whether vertical or not\n     * @param {boolean} isPositionRight - whether right position or not\n     * @returns {{\n     *      labels: Array.&lt;string>,\n     *      tickCount: number,\n     *      validTickCount: number,\n     *      isLabelAxis: boolean,\n     *      options: object,\n     *      isVertical: boolean,\n     *      isPositionRight: boolean,\n     *      aligned: boolean\n     * }}\n     * @private\n     */\n    _createLabelAxisData: function(axisOptions, labelTheme, aligned, isVertical, isPositionRight) {\n        return axisDataMaker.makeLabelAxisData({\n            labels: this.dataProcessor.getCategories(isVertical),\n            options: axisOptions,\n            labelTheme: labelTheme,\n            isVertical: !!isVertical,\n            isPositionRight: !!isPositionRight,\n            aligned: aligned,\n            addedDataCount: this.options.series.shifting ? this.addedDataCount : 0\n        });\n    },\n\n    /**\n     * Create axis data.\n     * @param {object} scaleData - scale data\n     * @param {object} axisOptions - axis options\n     * @param {object} labelTheme - them for label\n     * @param {boolean} isVertical - whether vertical or not\n     * @param {boolean} isPositionRight - whether right position or not\n     * @returns {object}\n     * @private\n     */\n    _createAxisData: function(scaleData, axisOptions, labelTheme, isVertical, isPositionRight) {\n        var aligned = predicate.isLineTypeChart(this.chartType, this.seriesNames);\n        var axisData;\n\n        if (scaleData) {\n            axisData = this._createValueAxisData(scaleData, labelTheme, aligned, isVertical, isPositionRight);\n        } else {\n            axisData = this._createLabelAxisData(axisOptions, labelTheme, aligned, isVertical, isPositionRight);\n        }\n\n        return axisData;\n    },\n\n    /**\n     * Create axes data.\n     * @returns {object.&lt;string, object>}\n     * @private\n     */\n    _createAxesData: function() {\n        var scaleDataMap = this.scaleDataMap;\n        var options = this.options;\n        var theme = this.theme;\n        var yAxisOptions = tui.util.isArray(options.yAxis) ? options.yAxis : [options.yAxis];\n        var dataMap = {};\n\n        dataMap.xAxis = this._createAxisData(scaleDataMap.xAxis, options.xAxis, theme.xAxis.label);\n        dataMap.yAxis = this._createAxisData(scaleDataMap.yAxis, yAxisOptions[0], theme.yAxis.label, true);\n\n        if (this.hasRightYAxis) {\n            dataMap.rightYAxis = this._createAxisData(\n                scaleDataMap.rightYAxis, yAxisOptions[1], theme.yAxis.label, true, true\n            );\n            dataMap.rightYAxis.aligned = dataMap.xAxis.aligned;\n        }\n\n        return dataMap;\n    },\n\n    /**\n     * Add scale.\n     * @param {string} axisName - axis name\n     * @param {options} axisOptions - axis options\n     * @param {{chartType: string, areaType: string}} typeMap - type map\n     * @param {object} additionalOptions - additional parameters\n     */\n    addScale: function(axisName, axisOptions, typeMap, additionalOptions) {\n        typeMap = typeMap || {};\n        additionalOptions = additionalOptions || {};\n        typeMap.areaType = typeMap.areaType || axisName;\n        typeMap.chartType = additionalOptions.chartType || typeMap.chartType;\n\n        this.scaleDataMap[axisName] = this._createScaleData(axisOptions, typeMap, additionalOptions);\n    },\n\n    /**\n     * Set axis data map.\n     */\n    setAxisDataMap: function() {\n        this.axisDataMap = this._createAxesData();\n    },\n\n    /**\n     * Update x axis data for auto tick interval.\n     * @param {?boolean} addingDataMode - whether adding data mode or not\n     */\n    updateXAxisDataForAutoTickInterval: function(prevXAxisData, addingDataMode) {\n        var shiftingOption = this.options.series.shifting;\n        var xAxisData = this.axisDataMap.xAxis;\n        var seriesWidth = this.boundsModel.getDimension('series').width;\n        var addedCount = this.addedDataCount;\n\n        if (shiftingOption || !prevXAxisData) {\n            axisDataMaker.updateLabelAxisDataForAutoTickInterval(xAxisData, seriesWidth, addedCount, addingDataMode);\n        } else {\n            axisDataMaker.updateLabelAxisDataForStackingDynamicData(xAxisData, prevXAxisData, this.firstTickCount);\n        }\n\n        if (!this.firstTickCount) {\n            this.firstTickCount = xAxisData.tickCount;\n        }\n    },\n\n    /**\n     * Update x axis data for label.\n     * @param {?boolean} addingDataMode - whether adding data mode or not\n     */\n    updateXAxisDataForLabel: function(addingDataMode) {\n        var axisData = this.axisDataMap.xAxis;\n        var labels = axisData.labels;\n        var dimensionMap = this.boundsModel.getDimensionMap(['series', 'yAxis']);\n        var isLabelAxis = axisData.isLabelAxis;\n        var theme = this.theme.xAxis.label;\n        var validLabels, validLabelCount, additionalData;\n\n        if (addingDataMode) {\n            labels = labels.slice(0, labels.length - 1);\n        }\n\n        validLabels = tui.util.filter(labels, function(label) {\n            return !!label;\n        });\n\n        if (!tui.util.isNull(this.prevValidLabelCount)) {\n            validLabelCount = this.prevValidLabelCount;\n        } else {\n            validLabelCount = validLabels.length;\n        }\n\n        if (this.options.yAxis.isCenter) {\n            validLabelCount += 1;\n            dimensionMap.yAxis.width = 0;\n        }\n\n        if (axisData.options.rotateLabel === false) {\n            additionalData = axisDataMaker.makeAdditionalDataForMultilineLabels(\n                labels, validLabelCount, theme, isLabelAxis, dimensionMap\n            );\n        } else {\n            additionalData = axisDataMaker.makeAdditionalDataForRotatedLabels(\n                validLabels, validLabelCount, theme, isLabelAxis, dimensionMap\n            );\n        }\n\n        this.prevValidLabelCount = validLabelCount;\n\n        tui.util.extend(axisData, additionalData);\n    },\n\n    /**\n     * Find limit from limitMap by seriesIndex\n     * @param {object} limitMap - limit map\n     * @param {number} seriesIndex - series index\n     * @param {boolean} isVertical - whether vertical or not\n     * @returns {boolean}\n     * @private\n     */\n    _findLimit: function(limitMap, seriesIndex, isVertical) {\n        var limit;\n\n        if (seriesIndex === 0) {\n            limit = isVertical ? limitMap.yAxis : limitMap.xAxis;\n        } else {\n            limit = limitMap.rightYAxis ? limitMap.rightYAxis : limitMap.yAxis;\n        }\n\n        return limit;\n    },\n\n    /**\n     * Make limit map.\n     * @param {Array.&lt;string>} seriesNames - series names like bar, column, line, area\n     * @param {boolean} isVertical - whether vertical or not\n     * @returns {{\n     *      xAxis: ?{min: number, max: number},\n     *      yAxis: ?{min: number, max: number},\n     *      rightYAxis: ?{min: number, max: number},\n     *      legend: ?{min: number, max: number},\n     *      bar: ?{min: number, max: number}\n     * }}\n     * @private\n     */\n    makeLimitMap: function(seriesNames, isVertical) {\n        var self = this;\n        var scaleDataMap = this.scaleDataMap;\n        var limitMap = {};\n\n        if (scaleDataMap.xAxis) {\n            limitMap.xAxis = scaleDataMap.xAxis.limit;\n        }\n\n        if (scaleDataMap.yAxis) {\n            limitMap.yAxis = scaleDataMap.yAxis.limit;\n        }\n\n        if (scaleDataMap.rightYAxis) {\n            limitMap.rightYAxis = scaleDataMap.rightYAxis.limit;\n        }\n\n        if (scaleDataMap.legend) {\n            limitMap.legend = scaleDataMap.legend.limit;\n        }\n\n        tui.util.forEachArray(seriesNames, function(seriesName, index) {\n            limitMap[seriesName] = self._findLimit(limitMap, index, isVertical);\n        });\n\n        return limitMap;\n    }\n});\n\nmodule.exports = ScaleDataModel;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"