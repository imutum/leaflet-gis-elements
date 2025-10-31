/**
 * UI绑定模块
 * 统一管理所有UI事件绑定，直接调用MapController高级API
 * 
 * 替代原有的：
 * - ui-controller.js (协调器)
 * - ui-controllers/style-controller.js
 * - ui-controllers/visibility-controller.js
 * - ui-controllers/mapinfo-controller.js
 * - ui-controllers/graticule-controller.js
 * - ui-controllers/export-controller.js
 */

(function (window) {
    'use strict';

    /**
     * UI绑定器
     * @param {MapController} controller - 地图控制器
     */
    function UIBindings(controller) {
        this.controller = controller;
        this.exporter = controller.getExporter();
    }

    /**
     * 初始化所有UI绑定
     */
    UIBindings.prototype.init = function () {
        this.syncInitialState();
        this.bindStyleControls();
        this.bindVisibilityControls();
        this.bindMapInfoControls();
        this.bindGraticuleControls();
        this.bindExportControls();

        console.log('✓ UI绑定完成 - 使用MapController高级API');
    };

    /**
     * 同步初始UI状态，使其与控制器当前配置保持一致
     */
    UIBindings.prototype.syncInitialState = function () {
        this.applyVisibilityDefaults();
        this.applyControlDefaults();
        this.applyExportDefaults();
    };

    /**
     * 应用控件显隐的默认状态
     */
    UIBindings.prototype.applyVisibilityDefaults = function () {
        const visibility = this.controller.visibility || {};
        this.setVisibilityDefaults('northArrow', visibility.northArrow, 'showNorthArrow', 'northArrowSection', 'northArrowToggle');
        this.setVisibilityDefaults('scaleBar', visibility.scaleBar, 'showScaleBar', 'scaleBarSection', 'scaleBarToggle');
        this.setVisibilityDefaults('legend', visibility.legend, 'showLegend', 'legendSection', 'legendToggle');
        this.setVisibilityDefaults('graticule', visibility.graticule, 'showGraticule', 'graticuleSection', 'graticuleToggle');
        this.setVisibilityDefaults('mapInfo', visibility.mapInfo, 'showMapInfo', 'mapInfoSection', 'mapInfoToggle');
    };

    /**
     * 根据控制器数据设置具体控件的默认值
     */
    UIBindings.prototype.applyControlDefaults = function () {
        const northArrow = this.controller.getControl('northArrow');
        const scaleBar = this.controller.getControl('scaleBar');
        const legend = this.controller.getControl('legend');
        const mapInfo = this.controller.getControl('mapInfo');

        if (northArrow) {
            const size = typeof northArrow.getSize === 'function' ? northArrow.getSize() : northArrow.size;
            if (typeof size === 'number' && !Number.isNaN(size)) {
                FormBinder.setValue('northArrowSize', size);
            }
        }

        if (scaleBar) {
            const maxWidth = typeof scaleBar.getMaxWidth === 'function' ? scaleBar.getMaxWidth() : scaleBar.maxWidth;
            if (typeof maxWidth === 'number' && !Number.isNaN(maxWidth)) {
                FormBinder.setValue('scaleBarWidth', maxWidth);
            }
        }

        if (legend) {
            const maxWidth = typeof legend.getMaxWidth === 'function' ? legend.getMaxWidth() : legend.maxWidth;
            const maxHeight = typeof legend.getMaxHeight === 'function' ? legend.getMaxHeight() : legend.maxHeight;

            if (typeof maxWidth === 'number' && !Number.isNaN(maxWidth)) {
                FormBinder.setValue('legendWidth', maxWidth);
            }

            if (typeof maxHeight === 'number' && !Number.isNaN(maxHeight)) {
                FormBinder.setValue('legendHeight', maxHeight);
            }
        }

        if (mapInfo) {
            const info = typeof mapInfo.getInfo === 'function' ? mapInfo.getInfo() : null;
            const showConfig = typeof mapInfo.getShowConfig === 'function' ? mapInfo.getShowConfig() : null;

            if (info) {
                FormBinder.setValue('mapTitle', info.title || '');
                FormBinder.setValue('mapSubtitle', info.subtitle || '');
                FormBinder.setValue('mapAuthor', info.author || '');
                FormBinder.setValue('mapOrganization', info.organization || '');
                FormBinder.setValue('mapDate', info.date || '');
                FormBinder.setValue('mapDataSource', info.dataSource || '');
                FormBinder.setValue('mapProjection', info.projection || '');
                FormBinder.setValue('mapScaleText', info.scale || '');
                FormBinder.setValue('mapNotes', info.notes || '');
            }

            if (showConfig) {
                const showFieldMap = {
                    title: 'showFieldTitle',
                    subtitle: 'showFieldSubtitle',
                    author: 'showFieldAuthor',
                    organization: 'showFieldOrganization',
                    date: 'showFieldDate',
                    dataSource: 'showFieldDataSource',
                    projection: 'showFieldProjection',
                    scale: 'showFieldScale',
                    notes: 'showFieldNotes'
                };

                Object.keys(showFieldMap).forEach(field => {
                    if (showConfig[field] !== undefined) {
                        FormBinder.setChecked(showFieldMap[field], !!showConfig[field]);
                    }
                });
            }
        }
    };

    /**
     * 同步导出控件的默认值
     */
    UIBindings.prototype.applyExportDefaults = function () {
        const exportControl = this.controller.getControl('exportPreview');
        const exporterConfig = this.exporter && typeof this.exporter.getConfig === 'function'
            ? this.exporter.getConfig()
            : null;

        if (exporterConfig) {
            if (exporterConfig.format) {
                FormBinder.setValue('exportFormat', exporterConfig.format);
            }

            if (exporterConfig.scale !== undefined) {
                FormBinder.setValue('exportScale', String(exporterConfig.scale));
            }

            if (exporterConfig.quality !== undefined) {
                FormBinder.setValue('exportQuality', exporterConfig.quality);
                const qualityValueLabel = document.getElementById('qualityValue');
                if (qualityValueLabel) {
                    qualityValueLabel.textContent = String(exporterConfig.quality);
                }
                this.updateQualityRecommendation(exporterConfig.quality);
            }

            if (exporterConfig.filename) {
                FormBinder.setValue('exportFilename', exporterConfig.filename);
            }

            if (exporterConfig.includeBasemap !== undefined) {
                FormBinder.setChecked('exportIncludeBasemap', exporterConfig.includeBasemap);
            }
        }

        if (exportControl) {
            const boundsModeToRange = {
                graticule: 'graticule',
                viewport: 'viewport',
                all: 'auto'
            };
            const rangeValue = boundsModeToRange[exportControl.boundsMode];
            if (rangeValue) {
                FormBinder.setValue('exportRange', rangeValue);
            }
        }

        const visibility = this.controller.visibility || {};
        const includeCheckboxMap = {
            exportIncludeMapInfo: visibility.mapInfo !== false,
            exportIncludeGraticule: visibility.graticule !== false,
            exportIncludeLegend: visibility.legend !== false,
            exportIncludeScaleBar: visibility.scaleBar !== false,
            exportIncludeNorthArrow: visibility.northArrow !== false
        };

        Object.keys(includeCheckboxMap).forEach(function (checkboxId) {
            FormBinder.setChecked(checkboxId, includeCheckboxMap[checkboxId]);
        });
    };

    /**
     * 设置控件的显示状态及对应的UI
     * @param {string} controlName
     * @param {boolean} visible
     * @param {string} checkboxId
     * @param {string} sectionId
     * @param {string} toggleId
     */
    UIBindings.prototype.setVisibilityDefaults = function (controlName, visible, checkboxId, sectionId, toggleId) {
        const isVisible = visible !== false;
        if (checkboxId) {
            FormBinder.setChecked(checkboxId, isVisible);
        }

        const section = sectionId ? document.getElementById(sectionId) : null;
        if (section) {
            section.style.display = isVisible ? 'block' : 'none';
        }

        const toggle = toggleId ? document.getElementById(toggleId) : null;
        if (toggle) {
            toggle.textContent = isVisible ? '▼' : '▶';
        }

        if (!isVisible) {
            this.controller.hide(controlName);
        }
    };

    // ==================== 1. 样式控制 ====================

    /**
     * 绑定所有样式切换控件
     */
    UIBindings.prototype.bindStyleControls = function () {
        const self = this;

        // 填充样式选择框
        this.populateStyleSelect('northArrowStyle', 'northArrow');
        this.populateStyleSelect('scaleBarStyle', 'scaleBar');
        this.populateStyleSelect('legendStyle', 'legend');
        this.populateStyleSelect('mapInfoStyle', 'mapInfo');

        // 绑定样式切换事件（使用高级API：controller.setStyle）
        FormBinder.bindSelect('northArrowStyle', function (styleName) {
            self.controller.setStyle('northArrow', styleName);
        });

        FormBinder.bindSelect('scaleBarStyle', function (styleName) {
            self.controller.setStyle('scaleBar', styleName);
        });

        FormBinder.bindSelect('legendStyle', function (styleName) {
            self.controller.setStyle('legend', styleName);
        });

        FormBinder.bindSelect('mapInfoStyle', function (styleName) {
            self.controller.setStyle('mapInfo', styleName);
        });
    };

    /**
     * 将驼峰格式转换为连字符格式
     * 例如：'northArrow' -> 'north-arrow'
     */
    UIBindings.prototype.camelToKebab = function (str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    };

    /**
     * 填充样式选择框
     */
    UIBindings.prototype.populateStyleSelect = function (selectId, controlType) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // 将驼峰格式转换为连字符格式（样式注册时使用的格式）
        const kebabControlType = this.camelToKebab(controlType);
        const styles = L.GISElements.StyleRegistry.list(kebabControlType);
        select.innerHTML = '';

        styles.forEach(function (styleObj) {
            const option = document.createElement('option');
            option.value = styleObj.id;
            option.textContent = styleObj.name;
            select.appendChild(option);
        });

        // 设置当前样式为选中
        const control = this.controller.getControl(controlType) || this.controller.controls[controlType];
        let currentStyle = null;

        if (control) {
            if (typeof control.getCurrentStyle === 'function') {
                currentStyle = control.getCurrentStyle();
            } else if (typeof control.getStyle === 'function') {
                currentStyle = control.getStyle();
            } else if (control.currentStyle) {
                currentStyle = control.currentStyle;
            }
        }

        if (currentStyle && styles.some(function (styleObj) { return styleObj.id === currentStyle; })) {
            select.value = currentStyle;
        }
    };

    // ==================== 2. 显示/隐藏控制 ====================

    /**
     * 绑定显示/隐藏控件
     */
    UIBindings.prototype.bindVisibilityControls = function () {
        const self = this;

        // 控件显隐切换（使用高级API：show/hide）
        FormBinder.bindCheckbox('showNorthArrow', function (checked) {
            checked ? self.controller.show('northArrow') : self.controller.hide('northArrow');
            self.toggleSection('northArrowSection', checked);
        });

        FormBinder.bindCheckbox('showScaleBar', function (checked) {
            checked ? self.controller.show('scaleBar') : self.controller.hide('scaleBar');
            self.toggleSection('scaleBarSection', checked);
        });

        FormBinder.bindCheckbox('showLegend', function (checked) {
            checked ? self.controller.show('legend') : self.controller.hide('legend');
            self.toggleSection('legendSection', checked);
        });

        FormBinder.bindCheckbox('showGraticule', function (checked) {
            checked ? self.controller.show('graticule') : self.controller.hide('graticule');
            self.toggleSection('graticuleSection', checked);
        });

        FormBinder.bindCheckbox('showMapInfo', function (checked) {
            checked ? self.controller.show('mapInfo') : self.controller.hide('mapInfo');
            self.toggleSection('mapInfoSection', checked);
        });

        // 尺寸调整（使用高级API：getControl）
        FormBinder.bindNumberInput('northArrowSize', function (value) {
            self.controller.getControl('northArrow').setSize(value);
        });

        FormBinder.bindNumberInput('scaleBarWidth', function (value) {
            self.controller.getControl('scaleBar').setMaxWidth(value);
        });

        FormBinder.bindNumberInput('legendWidth', function (value) {
            self.controller.getControl('legend').setMaxWidth(value);
        });

        FormBinder.bindNumberInput('legendHeight', function (value) {
            self.controller.getControl('legend').setMaxHeight(value);
        });
    };

    /**
     * 切换区域显示
     */
    UIBindings.prototype.toggleSection = function (sectionId, show) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = show ? 'block' : 'none';
        }
    };

    // ==================== 3. 地图注记控制 ====================

    /**
     * 绑定地图注记控件
     */
    UIBindings.prototype.bindMapInfoControls = function () {
        const self = this;
        const mapInfoControl = this.controller.getControl('mapInfo');

        // 绑定字段输入（使用高级API：getControl）
        FormBinder.bindInput('mapTitle', mapInfoControl, 'setTitle');
        FormBinder.bindInput('mapSubtitle', mapInfoControl, 'setSubtitle');
        FormBinder.bindInput('mapAuthor', mapInfoControl, 'setAuthor');
        FormBinder.bindInput('mapOrganization', mapInfoControl, 'setOrganization');
        FormBinder.bindInput('mapDate', mapInfoControl, 'setDate');
        FormBinder.bindInput('mapDataSource', mapInfoControl, 'setDataSource');
        FormBinder.bindInput('mapProjection', mapInfoControl, 'setProjection');
        FormBinder.bindInput('mapScaleText', mapInfoControl, 'setScale');
        FormBinder.bindInput('mapNotes', mapInfoControl, 'setNotes');

        // 字段显示控制
        const fieldCheckboxes = {
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

        Object.keys(fieldCheckboxes).forEach(function (checkboxId) {
            const fieldName = fieldCheckboxes[checkboxId];
            FormBinder.bindCheckbox(checkboxId, function (checked) {
                mapInfoControl.setFieldVisibility(fieldName, checked);
            });
        });
    };

    // ==================== 4. 经纬网控制 ====================

    /**
     * 绑定经纬网控件
     */
    UIBindings.prototype.bindGraticuleControls = function () {
        const self = this;
        const graticuleControl = this.controller.getControl('graticule');

        // 经纬线显示控制
        FormBinder.bindCheckbox('showGraticuleLines', function (checked) {
            graticuleControl.setLinesVisible(checked);
        });

        // 边框显示控制
        FormBinder.bindCheckbox('showGraticuleFrame', function (checked) {
            graticuleControl.setFrameVisible(checked);
        });

        // 间隔设置
        const intervalSelect = document.getElementById('graticuleInterval');
        if (intervalSelect) {
            intervalSelect.addEventListener('change', function (e) {
                const value = e.target.value;
                if (value === 'auto') {
                    graticuleControl.setInterval(null);
                } else {
                    graticuleControl.setInterval(parseFloat(value));
                }
            });
        }

        // 经纬线样式
        FormBinder.bindInput('graticuleLineColor', function (value) {
            const textInput = document.getElementById('graticuleLineColorText');
            if (textInput) textInput.value = value;
            graticuleControl.setLineColor(value);
        }, 'change');

        FormBinder.bindRange('graticuleLineWeight', 'graticuleLineWeightValue',
            function (value) { return value + 'px'; },
            function (value) {
                graticuleControl.setLineWeight(parseFloat(value));
            }
        );

        FormBinder.bindRange('graticuleLineOpacity', 'graticuleLineOpacityValue',
            function (value) { return value; },
            function (value) {
                graticuleControl.setLineOpacity(parseFloat(value));
            }
        );

        const lineStyleSelect = document.getElementById('graticuleLineStyle');
        if (lineStyleSelect) {
            lineStyleSelect.addEventListener('change', function (e) {
                graticuleControl.setLineDashArray(e.target.value);
            });
        }

        // 标注位置控制
        const labelPositions = ['labelTop', 'labelBottom', 'labelLeft', 'labelRight'];
        labelPositions.forEach(function (posId) {
            FormBinder.bindCheckbox(posId, function (checked) {
                const position = posId.replace('label', '').toLowerCase();
                graticuleControl.setLabelPosition(position, checked);
            });
        });
    };

    // ==================== 5. 导出控制 ====================

    /**
     * 绑定导出控件
     */
    UIBindings.prototype.bindExportControls = function () {
        const self = this;
        const exportControl = this.controller.getControl('exportPreview');

        // 导出按钮
        FormBinder.bindButton('exportMapButton', function () {
            self.handleExport();
        });

        // 预览按钮
        FormBinder.bindButton('previewExportButton', function () {
            self.handlePreview();
        });

        // 导出范围选择
        FormBinder.bindSelect('exportRange', function (value) {
            const modeMapping = {
                'graticule': 'graticule',
                'viewport': 'viewport',
                'auto': 'all'
            };
            exportControl.setBoundsMode(modeMapping[value]);
        });

        // 格式选择
        FormBinder.bindSelect('exportFormat', function (value) {
            exportControl.setFormat(value);
        });

        // 分辨率倍数
        FormBinder.bindSelect('exportScale', function (value) {
            self.exporter.setScale(parseInt(value));
        });

        // 质量调整
        const qualityInput = document.getElementById('exportQuality');
        if (qualityInput) {
            qualityInput.addEventListener('input', function (e) {
                const quality = parseFloat(e.target.value);
                self.exporter.setQuality(quality);
                self.updateQualityRecommendation(quality);
            });
        }

        // 初始化质量推荐
        this.updateQualityRecommendation(1.0);
    };

    /**
     * 处理导出（使用高级API：controller.exportMap）
     */
    UIBindings.prototype.handleExport = function () {
        const options = this.collectExportOptions();

        // 构建控件列表
        const includeControls = [];
        if (options.includeMapInfo) includeControls.push('mapInfo');
        if (options.includeNorthArrow) includeControls.push('northArrow');
        if (options.includeScaleBar) includeControls.push('scaleBar');
        if (options.includeLegend) includeControls.push('legend');
        if (options.includeGraticule) includeControls.push('graticule');

        // 🎯 使用MapController的高级API：exportMap()
        this.controller.exportMap({
            includeControls: includeControls,
            includeBasemap: options.includeBasemap,
            format: options.format,
            quality: parseFloat(FormBinder.getValue('exportQuality', 1.0)),
            scale: parseInt(FormBinder.getValue('exportScale', 2)),
            filename: FormBinder.getValue('exportFilename', 'map')
        }).then(function () {
            console.log('✓ 地图导出成功');
        }).catch(function (error) {
            console.error('✗ 导出失败:', error);
            alert('导出失败：' + error.message);
        });
    };

    /**
     * 处理预览
     */
    UIBindings.prototype.handlePreview = function () {
        const exportControl = this.controller.getControl('exportPreview');
        exportControl.recalculateBounds();
        exportControl.togglePreview();
    };

    /**
     * 收集导出选项
     */
    UIBindings.prototype.collectExportOptions = function () {
        return {
            range: FormBinder.getValue('exportRange', 'graticule'),
            includeBasemap: FormBinder.getChecked('exportIncludeBasemap', true),
            includeMapInfo: FormBinder.getChecked('exportIncludeMapInfo', true),
            includeGraticule: FormBinder.getChecked('exportIncludeGraticule', true),
            includeLegend: FormBinder.getChecked('exportIncludeLegend', true),
            includeScaleBar: FormBinder.getChecked('exportIncludeScaleBar', true),
            includeNorthArrow: FormBinder.getChecked('exportIncludeNorthArrow', true),
            format: FormBinder.getValue('exportFormat', 'png')
        };
    };

    /**
     * 更新质量推荐显示
     */
    UIBindings.prototype.updateQualityRecommendation = function (quality) {
        const rec = document.getElementById('qualityRecommendation');
        if (!rec) return;

        let text, bgColor;

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

    // 暴露到全局
    window.UIBindings = UIBindings;

})(window);

