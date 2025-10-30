/**
 * UI 控制器 - 管理控制面板的交互逻辑
 */

(function (window) {
    'use strict';

    function UIController(mapController, exportControl, exporter) {
        this.controller = mapController;
        this.exportControl = exportControl;
        this.exporter = exporter;
        this.previewControl = exportControl.options.control;
    }

    /**
     * 初始化所有UI事件
     */
    UIController.prototype.init = function () {
        this.initStyleSelectors();
        this.bindMapInfoEvents();
        this.bindMapInfoFieldVisibilityEvents();
        this.bindGraticuleEvents();
        this.bindExportEvents();
        this.bindElementSizeEvents();
        this.bindExportConfigEvents();
        this.bindExportRecommendationEvents();
        this.bindElementVisibilityEvents();
    };

    /**
     * 初始化样式选择器
     */
    UIController.prototype.initStyleSelectors = function () {
        this._populateStyleSelect('mapInfoStyle', 'map-info');
        this._populateStyleSelect('northArrowStyle', 'north-arrow');
        this._populateStyleSelect('scaleBarStyle', 'scale-bar');
        this._populateStyleSelect('legendStyle', 'legend');
    };

    /**
     * 填充样式下拉框
     */
    UIController.prototype._populateStyleSelect = function (elementId, controlType) {
        var select = document.getElementById(elementId);
        if (!select) return;

        var styles = L.GISElements.StyleRegistry.list(controlType);
        var controlKey = controlType.replace(/-([a-z])/g, function (_, letter) {
            return letter.toUpperCase();
        });
        var currentStyle = this.controller.controls[controlKey] &&
            this.controller.controls[controlKey].getCurrentStyle();

        styles.forEach(function (style) {
            var option = document.createElement('option');
            option.value = style.id;
            option.textContent = style.name;
            if (style.id === currentStyle) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    };

    /**
     * 绑定地图注记相关事件
     */
    UIController.prototype.bindMapInfoEvents = function () {
        var self = this;

        this._bindSelect('mapInfoStyle', function (value) {
            self.controller.setStyle('mapInfo', value);
        });

        this._bindInput('mapTitle', function (value) {
            self.controller.controls.mapInfo.setTitle(value);
        });

        this._bindInput('mapSubtitle', function (value) {
            self.controller.controls.mapInfo.setSubtitle(value);
        });

        this._bindInput('mapAuthor', function (value) {
            self.controller.controls.mapInfo.setAuthor(value);
        });

        this._bindInput('mapOrganization', function (value) {
            self.controller.controls.mapInfo.setOrganization(value);
        });

        this._bindInput('mapDate', function (value) {
            self.controller.controls.mapInfo.setDate(value);
        }, 'change');

        // 设置默认日期为今天
        var dateInput = document.getElementById('mapDate');
        if (dateInput) {
            var today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            self.controller.controls.mapInfo.setDate(today);
        }

        this._bindInput('mapDataSource', function (value) {
            self.controller.controls.mapInfo.setDataSource(value);
        });

        this._bindInput('mapProjection', function (value) {
            self.controller.controls.mapInfo.setProjection(value);
        });

        this._bindInput('mapScaleText', function (value) {
            self.controller.controls.mapInfo.setScale(value);
        });

        this._bindInput('mapNotes', function (value) {
            self.controller.controls.mapInfo.setNotes(value);
        });
    };

    /**
     * 绑定地图注记字段显示控制
     */
    UIController.prototype.bindMapInfoFieldVisibilityEvents = function () {
        var self = this;
        var fieldMapping = {
            'showFieldTitle': 'title',
            'showFieldSubtitle': 'subtitle',
            'showFieldAuthor': 'author',
            'showFieldOrganization': 'organization',
            'showFieldDate': 'date',
            'showFieldDataSource': 'dataSource',
            'showFieldProjection': 'projection',
            'showFieldScale': 'scale',
            'showFieldNotes': 'notes'
        };

        Object.keys(fieldMapping).forEach(function (checkboxId) {
            var fieldName = fieldMapping[checkboxId];
            self._bindCheckbox(checkboxId, function (checked) {
                if (checked) {
                    self.controller.controls.mapInfo.showField(fieldName);
                } else {
                    self.controller.controls.mapInfo.hideField(fieldName);
                }
            });
        });
    };

    /**
     * 绑定格网相关事件
     */
    UIController.prototype.bindGraticuleEvents = function () {
        var self = this;

        this._bindSelect('graticuleInterval', function (value) {
            if (value === 'auto') {
                self.controller.controls.graticule.lngInterval = null;
                self.controller.controls.graticule.latInterval = null;
            } else {
                var interval = parseFloat(value);
                self.controller.controls.graticule.setIntervals(interval, interval);
            }
            self.controller.controls.graticule.updateGraticule();
        });

        // 线条颜色
        var colorInput = document.getElementById('graticuleLineColor');
        var colorText = document.getElementById('graticuleLineColorText');
        if (colorInput && colorText) {
            colorInput.addEventListener('input', function (e) {
                colorText.value = e.target.value;
                self._updateGraticuleLineStyle();
            });
        }

        // 线条粗细
        this._bindRangeWithDisplay('graticuleLineWeight', 'graticuleLineWeightValue',
            function (value) { return value + 'px'; },
            function () { self._updateGraticuleLineStyle(); });

        // 透明度
        this._bindRangeWithDisplay('graticuleLineOpacity', 'graticuleLineOpacityValue',
            function (value) { return value; },
            function () { self._updateGraticuleLineStyle(); });

        // 线型
        this._bindSelect('graticuleLineStyle', function () {
            self._updateGraticuleLineStyle();
        });

        // 标签位置
        ['labelTop', 'labelBottom', 'labelLeft', 'labelRight'].forEach(function (id) {
            self._bindCheckbox(id, function () {
                self._updateLabelPositions();
            });
        });
    };

    /**
     * 更新经纬线样式
     */
    UIController.prototype._updateGraticuleLineStyle = function () {
        var color = document.getElementById('graticuleLineColor') ?
            document.getElementById('graticuleLineColor').value : '#666666';
        var weight = document.getElementById('graticuleLineWeight') ?
            parseFloat(document.getElementById('graticuleLineWeight').value) : 1;
        var opacity = document.getElementById('graticuleLineOpacity') ?
            parseFloat(document.getElementById('graticuleLineOpacity').value) : 0.5;
        var dashArray = document.getElementById('graticuleLineStyle') ?
            document.getElementById('graticuleLineStyle').value : null;

        var currentStyle = this.controller.controls.graticule.getCurrentStyleObject();

        currentStyle.meridian = Object.assign({}, currentStyle.meridian, {
            color: color,
            weight: weight,
            opacity: opacity,
            dashArray: dashArray || null
        });

        currentStyle.parallel = Object.assign({}, currentStyle.parallel, {
            color: color,
            weight: weight,
            opacity: opacity,
            dashArray: dashArray || null
        });

        this.controller.controls.graticule.updateGraticule();
    };

    /**
     * 更新标签位置
     */
    UIController.prototype._updateLabelPositions = function () {
        var positions = {
            top: document.getElementById('labelTop') ? document.getElementById('labelTop').checked : false,
            bottom: document.getElementById('labelBottom') ? document.getElementById('labelBottom').checked : false,
            left: document.getElementById('labelLeft') ? document.getElementById('labelLeft').checked : false,
            right: document.getElementById('labelRight') ? document.getElementById('labelRight').checked : false
        };
        this.controller.controls.graticule.setLabelPositions(positions);
    };

    /**
     * 绑定导出相关事件
     */
    UIController.prototype.bindExportEvents = function () {
        var self = this;

        // 导出按钮
        var exportButton = document.getElementById('exportMapButton');
        if (exportButton) {
            exportButton.addEventListener('click', function () {
                self._handleExport();
            });
        }

        // 预览按钮
        var previewButton = document.getElementById('previewExportButton');
        if (previewButton) {
            previewButton.addEventListener('click', function () {
                self._handlePreview();
            });
        }

        // 导出范围选择
        this._bindSelect('exportRange', function (value) {
            self._updateExportRange(value);
        });

        // 格式选择
        this._bindSelect('exportFormat', function (value) {
            self.previewControl.setFormat(value);
            self.exporter.setFormat(value);
        });
    };

    /**
     * 处理导出
     */
    UIController.prototype._handleExport = function () {
        var self = this;
        var options = this._collectExportOptions();

        // 配置导出器
        this._configureExporter(options);

        // 执行导出
        this.exporter.export().then(function () {
            console.log('地图导出成功');
        }).catch(function (error) {
            console.error('导出失败:', error);
            alert('导出失败：' + error.message);
        });
    };

    /**
     * 收集导出选项
     */
    UIController.prototype._collectExportOptions = function () {
        return {
            range: this._getElementValue('exportRange', 'graticule'),
            includeBasemap: this._getElementChecked('exportIncludeBasemap', true),
            includeMapInfo: this._getElementChecked('exportIncludeMapInfo', true),
            includeGraticule: this._getElementChecked('exportIncludeGraticule', true),
            includeLegend: this._getElementChecked('exportIncludeLegend', true),
            includeScaleBar: this._getElementChecked('exportIncludeScaleBar', true),
            includeNorthArrow: this._getElementChecked('exportIncludeNorthArrow', true),
            format: this._getElementValue('exportFormat', 'png')
        };
    };

    /**
     * 配置导出器
     */
    UIController.prototype._configureExporter = function (options) {
        // 清空之前的配置
        this.exporter.clearUIElements();
        this.exporter.clearLayers();
        this.previewControl.clearWhitelist();

        // 添加UI元素到白名单
        var elementMapping = {
            includeMapInfo: '.leaflet-control-map-info',
            includeLegend: '.leaflet-control-legend',
            includeScaleBar: '.leaflet-control-scale-bar',
            includeNorthArrow: '.leaflet-control-north-arrow'
        };

        for (var option in elementMapping) {
            if (options[option]) {
                this.exporter.addUIElement(elementMapping[option]);
                this.previewControl.addUIElement(elementMapping[option]);
            }
        }

        // 处理格网
        if (options.includeGraticule) {
            this._addGraticuleToExport();
        }

        // 设置导出参数
        this.exporter.setFormat(options.format);
        this.exporter.setIncludeBasemap(options.includeBasemap);

        // 设置导出边界
        this._setExportBounds(options.range);
    };

    /**
     * 添加格网到导出
     */
    UIController.prototype._addGraticuleToExport = function () {
        this.exporter.addUIElement('.lge-graticule-frame');
        this.previewControl.addUIElement('.lge-graticule-frame');

        var graticuleControl = this.controller.controls.graticule;
        if (graticuleControl) {
            var self = this;
            graticuleControl.lines.forEach(function (line) {
                self.exporter.addLayer(line);
                self.previewControl.addLayer(line);
            });
            graticuleControl.labels.forEach(function (label) {
                self.exporter.addLayer(label);
                self.previewControl.addLayer(label);
            });
        }
    };

    /**
     * 设置导出边界
     */
    UIController.prototype._setExportBounds = function (range) {
        if (this.previewControl.exportBounds) {
            this.exporter.setExportBounds(this.previewControl.exportBounds);
            return;
        }

        var bounds = null;
        if (range === 'graticule') {
            bounds = this.previewControl.autoCalculateExportBounds();
        } else if (range === 'auto') {
            bounds = this.previewControl.autoCalculateAllElementsBounds();
        }

        if (bounds) {
            this.exporter.setExportBounds(bounds);
        } else if (range === 'viewport') {
            this.exporter.clearExportBounds();
        }
    };

    /**
     * 处理预览
     */
    UIController.prototype._handlePreview = function () {
        var exportRange = this._getElementValue('exportRange', 'graticule');

        var modeMapping = {
            'graticule': 'graticule',
            'auto': 'all',
            'viewport': 'viewport'
        };

        this.previewControl.setBoundsMode(modeMapping[exportRange]);
        this.previewControl.recalculateBounds();
        this.previewControl.togglePreview();
    };

    /**
     * 更新导出范围
     */
    UIController.prototype._updateExportRange = function (value) {
        var modeMapping = {
            'graticule': 'graticule',
            'auto': 'all',
            'viewport': 'viewport'
        };

        this.previewControl.setBoundsMode(modeMapping[value]);

        if (this.previewControl.previewVisible) {
            this.previewControl.recalculateBounds();
            this.previewControl.hidePreview();
            this.previewControl.showPreview();
        }
    };

    /**
     * 绑定元素尺寸控制
     */
    UIController.prototype.bindElementSizeEvents = function () {
        var self = this;

        this._bindNumberInput('northArrowSize', function (value) {
            self.controller.controls.northArrow.setSize(value);
        });

        this._bindNumberInput('scaleBarWidth', function (value) {
            self.controller.controls.scaleBar.setMaxWidth(value);
        });

        this._bindNumberInput('legendWidth', function (value) {
            self.controller.controls.legend.setMaxWidth(value);
        });

        this._bindNumberInput('legendHeight', function (value) {
            self.controller.controls.legend.setMaxHeight(value);
        });
    };

    /**
     * 绑定导出配置事件
     */
    UIController.prototype.bindExportConfigEvents = function () {
        var self = this;

        this._bindInput('exportFilename', function (value) {
            self.exporter.setFilename(value || 'thematic_map');
        });

        this._bindInput('exportQuality', function (value) {
            self.exporter.setQuality(parseFloat(value));
        });

        this._bindSelect('exportScale', function (value) {
            self.exporter.setScale(parseInt(value));
        });
    };

    /**
     * 绑定导出推荐更新
     */
    UIController.prototype.bindExportRecommendationEvents = function () {
        var self = this;
        var qualityInput = document.getElementById('exportQuality');
        if (qualityInput) {
            qualityInput.addEventListener('input', function (e) {
                self._updateQualityRecommendation(parseFloat(e.target.value));
            });
        }

        // 初始化显示
        this._updateQualityRecommendation(1.0);
    };

    /**
     * 更新质量推荐
     */
    UIController.prototype._updateQualityRecommendation = function (quality) {
        var rec = document.getElementById('qualityRecommendation');
        if (!rec) return;

        var text = '';
        var bgColor = '';

        if (quality >= 0.9) {
            text = '⭐ 当前：最高质量 - 适合印刷和正式出版';
            bgColor = '#e3f2fd';
        } else if (quality >= 0.7) {
            text = '👍 当前：高质量 - 适合网页展示和普通用途';
            bgColor = '#e8f5e9';
        } else if (quality >= 0.5) {
            text = '⚠️ 当前：中等质量 - 适合快速预览';
            bgColor = '#fff3e0';
        } else {
            text = '⚠️ 当前：低质量 - 仅用于草图，可能模糊';
            bgColor = '#ffebee';
        }

        rec.textContent = text;
        rec.style.background = bgColor;
    };

    /**
     * 绑定元素显示控制
     */
    UIController.prototype.bindElementVisibilityEvents = function () {
        var self = this;

        this._bindCheckbox('showMapInfo', function (checked) {
            self.controller[checked ? 'show' : 'hide']('mapInfo');
            self._toggleSettingsPanel('mapInfoSection', checked, 'showMapInfo');
        });

        this._bindCheckbox('showNorthArrow', function (checked) {
            self.controller[checked ? 'show' : 'hide']('northArrow');
            self._toggleSettingsPanel('northArrowSection', checked, 'showNorthArrow');
        });

        this._bindCheckbox('showScaleBar', function (checked) {
            self.controller[checked ? 'show' : 'hide']('scaleBar');
            self._toggleSettingsPanel('scaleBarSection', checked, 'showScaleBar');
        });

        this._bindCheckbox('showLegend', function (checked) {
            self.controller[checked ? 'show' : 'hide']('legend');
            self._toggleSettingsPanel('legendSection', checked, 'showLegend');
        });

        this._bindCheckbox('showGraticule', function (checked) {
            if (checked) {
                self.controller.show('graticule');
                self.controller.controls.graticule.enable();
            } else {
                self.controller.controls.graticule.disable();
            }
            self._toggleSettingsPanel('graticuleSection', checked, 'showGraticule');
        });

        this._bindCheckbox('showGraticuleLines', function (checked) {
            self.controller.controls.graticule[checked ? 'enable' : 'disable']();
        });

        this._bindCheckbox('showGraticuleFrame', function (checked) {
            self.controller.controls.graticule[checked ? 'enableFrame' : 'disableFrame']();
        });

        // 初始化时应用当前状态
        this._initializeSettingsState();
    };

    /**
     * 切换设置面板的启用/禁用状态
     */
    UIController.prototype._toggleSettingsPanel = function (sectionId, enabled, excludeCheckboxId) {
        // sectionId 是内容区域的 id（如 mapInfoSection）
        var contentSection = document.getElementById(sectionId);
        if (!contentSection) return;

        // 获取父级 .control-section 元素
        var controlSection = contentSection.parentElement;
        if (!controlSection || !controlSection.classList.contains('control-section')) return;

        var settingsContainer = contentSection.querySelector('.settings-container');
        if (!settingsContainer) {
            // 如果还没有设置容器，创建一个
            this._wrapSettingsInContainer(controlSection, excludeCheckboxId);
            settingsContainer = contentSection.querySelector('.settings-container');
        }

        if (settingsContainer) {
            if (enabled) {
                // 启用：显示设置区域，移除禁用样式
                settingsContainer.style.display = '';
                settingsContainer.classList.remove('settings-disabled');
                controlSection.classList.remove('section-collapsed');
            } else {
                // 禁用：隐藏设置区域，添加禁用样式
                settingsContainer.style.display = 'none';
                settingsContainer.classList.add('settings-disabled');
                controlSection.classList.add('section-collapsed');
            }
        }
    };

    /**
     * 将设置区域包装在容器中
     */
    UIController.prototype._wrapSettingsInContainer = function (section, excludeCheckboxId) {
        // 创建设置容器
        var container = document.createElement('div');
        container.className = 'settings-container';

        // 主复选框现在在h4标题中，所以只需要包装section内的内容div
        // 找到设置内容区域（h4的下一个兄弟元素）
        var h4 = section.querySelector('h4');
        var contentDiv = h4 ? h4.nextElementSibling : null;

        if (contentDiv && contentDiv.id) {
            // 将contentDiv的所有子元素移到容器中
            var children = Array.from(contentDiv.children);
            children.forEach(function (child) {
                container.appendChild(child);
            });

            // 将容器添加回contentDiv
            contentDiv.appendChild(container);
        }
    };

    /**
     * 初始化设置面板状态
     */
    UIController.prototype._initializeSettingsState = function () {
        var mappings = [
            { checkbox: 'showMapInfo', section: 'mapInfoSection' },
            { checkbox: 'showNorthArrow', section: 'northArrowSection' },
            { checkbox: 'showScaleBar', section: 'scaleBarSection' },
            { checkbox: 'showLegend', section: 'legendSection' },
            { checkbox: 'showGraticule', section: 'graticuleSection' }
        ];

        var self = this;
        mappings.forEach(function (mapping) {
            var checkbox = document.getElementById(mapping.checkbox);
            if (checkbox) {
                self._toggleSettingsPanel(mapping.section, checkbox.checked, mapping.checkbox);
            }
        });
    };

    // ========== 辅助方法 ==========

    UIController.prototype._bindInput = function (id, callback, event) {
        event = event || 'input';
        var element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, function (e) {
                callback(e.target.value);
            });
        }
    };

    UIController.prototype._bindSelect = function (id, callback) {
        this._bindInput(id, callback, 'change');
    };

    UIController.prototype._bindCheckbox = function (id, callback) {
        var element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function (e) {
                callback(e.target.checked);
            });
        }
    };

    UIController.prototype._bindNumberInput = function (id, callback) {
        var element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function (e) {
                var value = parseInt(e.target.value);
                if (!isNaN(value)) callback(value);
            });
        }
    };

    UIController.prototype._bindRangeWithDisplay = function (rangeId, displayId, formatter, callback) {
        var rangeInput = document.getElementById(rangeId);
        var displayElement = document.getElementById(displayId);

        if (rangeInput && displayElement) {
            rangeInput.addEventListener('input', function (e) {
                var value = e.target.value;
                displayElement.textContent = formatter(value);
                if (callback) callback(value);
            });
        }
    };

    UIController.prototype._getElementValue = function (id, defaultValue) {
        var element = document.getElementById(id);
        return element ? element.value : defaultValue;
    };

    UIController.prototype._getElementChecked = function (id, defaultValue) {
        var element = document.getElementById(id);
        return element ? element.checked : defaultValue;
    };

    // 暴露到全局
    window.UIController = UIController;

})(window);
