/**
 * UI绑定模块
 * 统一管理所有UI事件绑定，直接调用MapController高级API
 *
 * 按照“UI创建 / UI交互 / UI绑定前端功能逻辑”拆分职责
 */

(function (window) {
    'use strict';

    /**
     * UI 创建工具：负责生成或更新 UI 所需的 DOM 状态
     */
    function UIBuilder() {
        this.defaultQuality = 1;
    }

    UIBuilder.prototype.setSectionVisibility = function (sectionId, visible) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = visible ? 'block' : 'none';
        }
    };

    UIBuilder.prototype.setToggleIndicator = function (toggleId, expanded) {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.textContent = expanded ? '▼' : '▶';
        }
    };

    UIBuilder.prototype.setText = function (elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    };

    UIBuilder.prototype.populateStyleSelect = function (selectId, controlType, controller) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const styles = L.GISElements.StyleRegistry.list(this.toKebab(controlType));
        select.innerHTML = '';

        styles.forEach(function (styleObj) {
            const option = document.createElement('option');
            option.value = styleObj.id;
            option.textContent = styleObj.name;
            select.appendChild(option);
        });

        const control = controller.getControl(controlType) || controller.controls[controlType];
        const currentStyle = UIBuilder.resolveStyle(control);

        if (currentStyle && styles.some(function (styleObj) { return styleObj.id === currentStyle; })) {
            select.value = currentStyle;
        }
    };

    UIBuilder.resolveStyle = function (control) {
        if (!control) return null;
        if (typeof control.getCurrentStyle === 'function') return control.getCurrentStyle();
        if (typeof control.getStyle === 'function') return control.getStyle();
        return control.currentStyle || null;
    };

    UIBuilder.prototype.toKebab = function (str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    };

    UIBuilder.prototype.updateQualityRecommendation = function (quality) {
        const rec = document.getElementById('qualityRecommendation');
        if (!rec) return;

        let text;
        let bgColor;

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
     * 初始状态同步：负责将控制器状态同步到 UI
     */
    function UIStateSynchronizer(controller, exporter, builder) {
        this.controller = controller;
        this.exporter = exporter;
        this.builder = builder;
    }

    UIStateSynchronizer.prototype.sync = function () {
        this.applyVisibilityDefaults();
        this.applyControlDefaults();
        this.applyExportDefaults();
    };

    UIStateSynchronizer.prototype.applyVisibilityDefaults = function () {
        const visibility = this.controller.visibility || {};
        this.setVisibility('northArrow', visibility.northArrow, 'showNorthArrow', 'northArrowSection', 'northArrowToggle');
        this.setVisibility('scaleBar', visibility.scaleBar, 'showScaleBar', 'scaleBarSection', 'scaleBarToggle');
        this.setVisibility('legend', visibility.legend, 'showLegend', 'legendSection', 'legendToggle');
        this.setVisibility('graticule', visibility.graticule, 'showGraticule', 'graticuleSection', 'graticuleToggle');
        this.setVisibility('mapInfo', visibility.mapInfo, 'showMapInfo', 'mapInfoSection', 'mapInfoToggle');
    };

    UIStateSynchronizer.prototype.setVisibility = function (controlName, visible, checkboxId, sectionId, toggleId) {
        const isVisible = visible !== false;

        if (checkboxId) {
            FormBinder.setChecked(checkboxId, isVisible);
        }
        if (sectionId) {
            this.builder.setSectionVisibility(sectionId, isVisible);
        }
        if (toggleId) {
            this.builder.setToggleIndicator(toggleId, isVisible);
        }
        if (!isVisible) {
            this.controller.hide(controlName);
        }
    };

    UIStateSynchronizer.prototype.applyControlDefaults = function () {
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

                Object.keys(showFieldMap).forEach(function (field) {
                    if (showConfig[field] !== undefined) {
                        FormBinder.setChecked(showFieldMap[field], !!showConfig[field]);
                    }
                });
            }
        }
    };

    UIStateSynchronizer.prototype.applyExportDefaults = function () {
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
                this.builder.setText('qualityValue', String(exporterConfig.quality));
                this.builder.updateQualityRecommendation(exporterConfig.quality);
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
     * UI 交互与事件绑定
     */
    function UIInteractionBinder(controller, exporter, builder) {
        this.controller = controller;
        this.exporter = exporter;
        this.builder = builder;
    }

    UIInteractionBinder.prototype.prepareUI = function () {
        this.builder.populateStyleSelect('northArrowStyle', 'northArrow', this.controller);
        this.builder.populateStyleSelect('scaleBarStyle', 'scaleBar', this.controller);
        this.builder.populateStyleSelect('legendStyle', 'legend', this.controller);
        this.builder.populateStyleSelect('mapInfoStyle', 'mapInfo', this.controller);
    };

    UIInteractionBinder.prototype.bindEvents = function () {
        this.bindStyleControls();
        this.bindVisibilityControls();
        this.bindMapInfoControls();
        this.bindGraticuleControls();
        this.bindExportControls();
    };

    UIInteractionBinder.prototype.bindStyleControls = function () {
        const controller = this.controller;

        FormBinder.bindSelect('northArrowStyle', function (styleName) {
            controller.setStyle('northArrow', styleName);
        });
        FormBinder.bindSelect('scaleBarStyle', function (styleName) {
            controller.setStyle('scaleBar', styleName);
        });
        FormBinder.bindSelect('legendStyle', function (styleName) {
            controller.setStyle('legend', styleName);
        });
        FormBinder.bindSelect('mapInfoStyle', function (styleName) {
            controller.setStyle('mapInfo', styleName);
        });
    };

    UIInteractionBinder.prototype.bindVisibilityControls = function () {
        const controller = this.controller;
        const builder = this.builder;

        FormBinder.bindCheckbox('showNorthArrow', function (checked) {
            checked ? controller.show('northArrow') : controller.hide('northArrow');
            builder.setSectionVisibility('northArrowSection', checked);
            builder.setToggleIndicator('northArrowToggle', checked);
        });

        FormBinder.bindCheckbox('showScaleBar', function (checked) {
            checked ? controller.show('scaleBar') : controller.hide('scaleBar');
            builder.setSectionVisibility('scaleBarSection', checked);
            builder.setToggleIndicator('scaleBarToggle', checked);
        });

        FormBinder.bindCheckbox('showLegend', function (checked) {
            checked ? controller.show('legend') : controller.hide('legend');
            builder.setSectionVisibility('legendSection', checked);
            builder.setToggleIndicator('legendToggle', checked);
        });

        FormBinder.bindCheckbox('showGraticule', function (checked) {
            checked ? controller.show('graticule') : controller.hide('graticule');
            builder.setSectionVisibility('graticuleSection', checked);
            builder.setToggleIndicator('graticuleToggle', checked);
        });

        FormBinder.bindCheckbox('showMapInfo', function (checked) {
            checked ? controller.show('mapInfo') : controller.hide('mapInfo');
            builder.setSectionVisibility('mapInfoSection', checked);
            builder.setToggleIndicator('mapInfoToggle', checked);
        });

        FormBinder.bindNumberInput('northArrowSize', function (value) {
            controller.getControl('northArrow').setSize(value);
        });
        FormBinder.bindNumberInput('scaleBarWidth', function (value) {
            controller.getControl('scaleBar').setMaxWidth(value);
        });
        FormBinder.bindNumberInput('legendWidth', function (value) {
            controller.getControl('legend').setMaxWidth(value);
        });
        FormBinder.bindNumberInput('legendHeight', function (value) {
            controller.getControl('legend').setMaxHeight(value);
        });
    };

    UIInteractionBinder.prototype.bindMapInfoControls = function () {
        const mapInfoControl = this.controller.getControl('mapInfo');

        FormBinder.bindInput('mapTitle', mapInfoControl, 'setTitle');
        FormBinder.bindInput('mapSubtitle', mapInfoControl, 'setSubtitle');
        FormBinder.bindInput('mapAuthor', mapInfoControl, 'setAuthor');
        FormBinder.bindInput('mapOrganization', mapInfoControl, 'setOrganization');
        FormBinder.bindInput('mapDate', mapInfoControl, 'setDate');
        FormBinder.bindInput('mapDataSource', mapInfoControl, 'setDataSource');
        FormBinder.bindInput('mapProjection', mapInfoControl, 'setProjection');
        FormBinder.bindInput('mapScaleText', mapInfoControl, 'setScale');
        FormBinder.bindInput('mapNotes', mapInfoControl, 'setNotes');

        const fieldCheckboxes = {
            showFieldTitle: 'title',
            showFieldSubtitle: 'subtitle',
            showFieldAuthor: 'author',
            showFieldOrganization: 'organization',
            showFieldDate: 'date',
            showFieldDataSource: 'dataSource',
            showFieldProjection: 'projection',
            showFieldScale: 'scale',
            showFieldNotes: 'notes'
        };

        Object.keys(fieldCheckboxes).forEach(function (checkboxId) {
            const fieldName = fieldCheckboxes[checkboxId];
            FormBinder.bindCheckbox(checkboxId, function (checked) {
                mapInfoControl.setFieldVisibility(fieldName, checked);
            });
        });
    };

    UIInteractionBinder.prototype.bindGraticuleControls = function () {
        const graticuleControl = this.controller.getControl('graticule');

        FormBinder.bindCheckbox('showGraticuleLines', function (checked) {
            graticuleControl.setLinesVisible(checked);
        });
        FormBinder.bindCheckbox('showGraticuleFrame', function (checked) {
            graticuleControl.setFrameVisible(checked);
        });

        const intervalSelect = document.getElementById('graticuleInterval');
        if (intervalSelect) {
            intervalSelect.addEventListener('change', function (event) {
                const value = event.target.value;
                if (value === 'auto') {
                    graticuleControl.setInterval(null);
                } else {
                    graticuleControl.setInterval(parseFloat(value));
                }
            });
        }

        FormBinder.bindInput('graticuleLineColor', function (value) {
            const textInput = document.getElementById('graticuleLineColorText');
            if (textInput) textInput.value = value;
            graticuleControl.setLineColor(value);
        }, 'change');

        FormBinder.bindRange('graticuleLineWeight', 'graticuleLineWeightValue',
            function (value) { return value + 'px'; },
            function (value) { graticuleControl.setLineWeight(parseFloat(value)); }
        );

        FormBinder.bindRange('graticuleLineOpacity', 'graticuleLineOpacityValue',
            function (value) { return value; },
            function (value) { graticuleControl.setLineOpacity(parseFloat(value)); }
        );

        const lineStyleSelect = document.getElementById('graticuleLineStyle');
        if (lineStyleSelect) {
            lineStyleSelect.addEventListener('change', function (event) {
                graticuleControl.setLineDashArray(event.target.value);
            });
        }

        const labelPositions = ['labelTop', 'labelBottom', 'labelLeft', 'labelRight'];
        labelPositions.forEach(function (posId) {
            FormBinder.bindCheckbox(posId, function (checked) {
                const position = posId.replace('label', '').toLowerCase();
                graticuleControl.setLabelPosition(position, checked);
            });
        });
    };

    UIInteractionBinder.prototype.bindExportControls = function () {
        const controller = this.controller;
        const exporter = this.exporter;
        const builder = this.builder;
        const self = this;
        const exportControl = controller.getControl('exportPreview');

        FormBinder.bindButton('exportMapButton', function () {
            self.handleExport();
        });

        FormBinder.bindButton('previewExportButton', function () {
            self.handlePreview();
        });

        FormBinder.bindSelect('exportRange', function (value) {
            const modeMapping = {
                graticule: 'graticule',
                viewport: 'viewport',
                auto: 'all'
            };
            exportControl.setBoundsMode(modeMapping[value]);
        });

        FormBinder.bindSelect('exportFormat', function (value) {
            exportControl.setFormat(value);
        });

        FormBinder.bindSelect('exportScale', function (value) {
            exporter.setScale(parseInt(value, 10));
        });

        const qualityInput = document.getElementById('exportQuality');
        if (qualityInput) {
            qualityInput.addEventListener('input', function (event) {
                const quality = parseFloat(event.target.value);
                exporter.setQuality(quality);
                builder.setText('qualityValue', String(quality));
                builder.updateQualityRecommendation(quality);
            });
        }

        const initialQuality = parseFloat(FormBinder.getValue('exportQuality', builder.defaultQuality));
        builder.setText('qualityValue', String(initialQuality));
        builder.updateQualityRecommendation(initialQuality);
    };

    UIInteractionBinder.prototype.collectExportOptions = function () {
        return {
            includeBasemap: FormBinder.getChecked('exportIncludeBasemap', true),
            includeMapInfo: FormBinder.getChecked('exportIncludeMapInfo', true),
            includeGraticule: FormBinder.getChecked('exportIncludeGraticule', true),
            includeLegend: FormBinder.getChecked('exportIncludeLegend', true),
            includeScaleBar: FormBinder.getChecked('exportIncludeScaleBar', true),
            includeNorthArrow: FormBinder.getChecked('exportIncludeNorthArrow', true),
            format: FormBinder.getValue('exportFormat', 'png'),
            quality: parseFloat(FormBinder.getValue('exportQuality', 1.0)),
            scale: parseInt(FormBinder.getValue('exportScale', 2), 10),
            filename: FormBinder.getValue('exportFilename', 'map')
        };
    };

    UIInteractionBinder.prototype.handleExport = function () {
        const options = this.collectExportOptions();
        const includeControls = [];

        if (options.includeMapInfo) includeControls.push('mapInfo');
        if (options.includeNorthArrow) includeControls.push('northArrow');
        if (options.includeScaleBar) includeControls.push('scaleBar');
        if (options.includeLegend) includeControls.push('legend');
        if (options.includeGraticule) includeControls.push('graticule');

        this.controller.exportMap({
            includeControls: includeControls,
            includeBasemap: options.includeBasemap,
            format: options.format,
            quality: options.quality,
            scale: options.scale,
            filename: options.filename
        }).then(function () {
            console.log('✓ 地图导出成功');
        }).catch(function (error) {
            console.error('✗ 导出失败:', error);
            alert('导出失败：' + error.message);
        });
    };

    UIInteractionBinder.prototype.handlePreview = function () {
        const exportControl = this.controller.getControl('exportPreview');
        exportControl.recalculateBounds();
        exportControl.togglePreview();
    };

    /**
     * UI 绑定入口
     */
    function UIBindings(controller) {
        this.controller = controller;
        this.exporter = controller.getExporter();
        this.builder = new UIBuilder();
        this.stateSynchronizer = new UIStateSynchronizer(controller, this.exporter, this.builder);
        this.interactions = new UIInteractionBinder(controller, this.exporter, this.builder);
    }

    UIBindings.prototype.init = function () {
        this.interactions.prepareUI();
        this.stateSynchronizer.sync();
        this.interactions.bindEvents();

        console.log('✓ UI绑定完成 - 模块化构建/交互/绑定已就绪');
    };

    window.UIBindings = UIBindings;

})(window);

