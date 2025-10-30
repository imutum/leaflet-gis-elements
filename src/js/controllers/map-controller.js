/**
 * 地图控制器
 * 统一管理所有地图控件（指北针、比例尺、图例等）
 * 提供显示/隐藏、样式切换、位置重置等功能
 */

class MapController {
    constructor(map, options = {}) {
        this.map = map;
        this.options = options;

        // 控件实例
        this.controls = {
            northArrow: null,
            scaleBar: null,
            legend: null,
            graticule: null,
            mapInfo: null,
            exportPreview: null
        };

        // Leaflet控件引用
        this.leafletControls = {
            northArrow: null,
            scaleBar: null,
            legend: null,
            graticule: null,
            mapInfo: null,
            exportPreview: null
        };

        // 控件可见性状态
        const autoShow = options.autoShow !== false; // 默认自动显示
        this.visibility = {
            northArrow: autoShow,
            scaleBar: autoShow,
            legend: autoShow,
            graticule: autoShow,
            mapInfo: autoShow,
            exportPreview: autoShow
        };

        // 初始化
        this._init();
    }

    /**
     * 初始化控制器
     * @private
     */
    _init() {
        this._createControls();
    }

    /**
     * 创建所有控件
     * @private
     */
    _createControls() {
        // 创建指北针
        const northArrowOptions = this.options.northArrow || {};
        this.controls.northArrow = new L.Control.NorthArrow({
            position: northArrowOptions.position || 'topleft',
            style: northArrowOptions.style || 'gis',
            size: northArrowOptions.size || 80,
            draggable: northArrowOptions.draggable !== false
        });
        this.leafletControls.northArrow = this.controls.northArrow.createControl();

        if (this.visibility.northArrow) {
            this.leafletControls.northArrow.addTo(this.map);
        }

        // 创建比例尺
        const scaleBarOptions = this.options.scaleBar || {};
        this.controls.scaleBar = new L.Control.ScaleBar({
            position: scaleBarOptions.position || 'bottomleft',
            style: scaleBarOptions.style || 'gis',
            maxWidth: scaleBarOptions.maxWidth || 150,
            draggable: scaleBarOptions.draggable !== false
        });
        this.leafletControls.scaleBar = this.controls.scaleBar.createControl();

        if (this.visibility.scaleBar) {
            this.leafletControls.scaleBar.addTo(this.map);
        }

        // 创建图例
        const legendOptions = this.options.legend || {};
        this.controls.legend = new L.Control.Legend({
            position: legendOptions.position || 'bottomright',
            style: legendOptions.style || 'gis',
            layers: legendOptions.layers || [],
            draggable: legendOptions.draggable !== false
        });
        this.leafletControls.legend = this.controls.legend.createControl();

        if (this.visibility.legend) {
            this.leafletControls.legend.addTo(this.map);
        }

        // 创建经纬度格网
        const graticuleOptions = this.options.graticule || {};
        this.controls.graticule = new L.Control.Graticule({
            position: graticuleOptions.position || 'topleft',
            style: graticuleOptions.style || 'simple',
            interval: graticuleOptions.interval || null,
            lngInterval: graticuleOptions.lngInterval || null,
            latInterval: graticuleOptions.latInterval || null,
            showLabels: graticuleOptions.showLabels !== false,
            enabled: graticuleOptions.enabled !== false,
            frameEnabled: graticuleOptions.frameEnabled !== false,
            frameDraggable: graticuleOptions.frameDraggable !== false,
            frameResizable: graticuleOptions.frameResizable !== false,
            draggable: graticuleOptions.draggable !== false
        });
        this.leafletControls.graticule = this.controls.graticule.createControl();

        if (this.visibility.graticule) {
            this.leafletControls.graticule.addTo(this.map);
        }

        // 创建地图注记
        const mapInfoOptions = this.options.mapInfo || {};
        this.controls.mapInfo = new L.Control.MapInfo({
            position: mapInfoOptions.position || 'topleft',
            style: mapInfoOptions.style || 'professional',
            title: mapInfoOptions.title || '',
            subtitle: mapInfoOptions.subtitle || '',
            author: mapInfoOptions.author || '',
            organization: mapInfoOptions.organization || '',
            date: mapInfoOptions.date || '',
            dataSource: mapInfoOptions.dataSource || '',
            projection: mapInfoOptions.projection || 'WGS84 / EPSG:4326',
            scale: mapInfoOptions.scale || '1:100000',
            notes: mapInfoOptions.notes || '',
            draggable: mapInfoOptions.draggable !== false
        });
        this.leafletControls.mapInfo = this.controls.mapInfo.createControl();

        if (this.visibility.mapInfo) {
            this.leafletControls.mapInfo.addTo(this.map);
        }

        // 创建导出预览控件
        const exportOptions = this.options.exportPreview || {};
        this.controls.exportPreview = new L.Control.ExportPreview({
            position: exportOptions.position || 'topright',
            format: exportOptions.format || 'png',
            quality: exportOptions.quality || 1.0,
            filename: exportOptions.filename || 'map',
            scale: exportOptions.scale || 2,
            autoCalculateBounds: exportOptions.autoCalculateBounds !== false
        });
        this.leafletControls.exportPreview = this.controls.exportPreview.createControl();

        if (this.visibility.exportPreview) {
            this.leafletControls.exportPreview.addTo(this.map);
        }
    }


    /**
     * 显示指定控件
     * @param {string} controlName - 控件名称
     */
    show(controlName) {
        const control = this.leafletControls[controlName];
        if (control && !this.visibility[controlName]) {
            control.addTo(this.map);
            this.visibility[controlName] = true;
        }
    }

    /**
     * 隐藏指定控件
     * @param {string} controlName - 控件名称
     */
    hide(controlName) {
        const control = this.leafletControls[controlName];
        if (control && this.visibility[controlName]) {
            this.map.removeControl(control);
            this.visibility[controlName] = false;
        }
    }

    /**
     * 切换控件显示状态
     * @param {string} controlName - 控件名称
     */
    toggle(controlName) {
        if (this.visibility[controlName]) {
            this.hide(controlName);
        } else {
            this.show(controlName);
        }
    }

    /**
     * 设置控件样式
     * @param {string} controlName - 控件名称
     * @param {string} styleName - 样式名称
     */
    setStyle(controlName, styleName) {
        // 格网控件和导出控件没有样式切换功能
        if (controlName === 'graticule' || controlName === 'exportPreview') {
            return;
        }
        const control = this.controls[controlName];
        if (control && typeof control.setStyle === 'function') {
            control.setStyle(styleName);
        }
    }

    /**
     * 设置控件标题（快捷方法）
     * @param {string} controlName - 控件名称（通常是 'mapInfo'）
     * @param {string} title - 标题文本
     */
    setTitle(controlName, title) {
        const control = this.controls[controlName];
        if (control && typeof control.setTitle === 'function') {
            control.setTitle(title);
        }
    }

    /**
     * 设置控件副标题（快捷方法）
     * @param {string} controlName - 控件名称（通常是 'mapInfo'）
     * @param {string} subtitle - 副标题文本
     */
    setSubtitle(controlName, subtitle) {
        const control = this.controls[controlName];
        if (control && typeof control.setSubtitle === 'function') {
            control.setSubtitle(subtitle);
        }
    }

    /**
     * 设置控件大小（快捷方法）
     * @param {string} controlName - 控件名称（如 'northArrow'）
     * @param {number} size - 大小值（像素）
     */
    setSize(controlName, size) {
        const control = this.controls[controlName];
        if (control && typeof control.setSize === 'function') {
            control.setSize(size);
        }
    }

    /**
     * 设置控件宽度（快捷方法）
     * @param {string} controlName - 控件名称（如 'scaleBar', 'legend'）
     * @param {number} width - 宽度值（像素）
     */
    setWidth(controlName, width) {
        const control = this.controls[controlName];
        if (control) {
            if (typeof control.setMaxWidth === 'function') {
                control.setMaxWidth(width);
            } else if (typeof control.setWidth === 'function') {
                control.setWidth(width);
            }
        }
    }

    /**
     * 设置图例图层（快捷方法，替代 updateLegendLayers）
     * @param {string} controlName - 控件名称（通常是 'legend'）
     * @param {Array} layers - 图层数组
     */
    setLayers(controlName, layers) {
        const control = this.controls[controlName];
        if (control && typeof control.setLayers === 'function') {
            control.setLayers(layers);
        }
    }

    /**
     * 添加图层到图例（快捷方法）
     * @param {string} controlName - 控件名称（通常是 'legend'）
     * @param {Object} layer - 图层对象
     */
    addLayer(controlName, layer) {
        const control = this.controls[controlName];
        if (control && typeof control.addLayer === 'function') {
            control.addLayer(layer);
        }
    }

    /**
     * 从图例移除图层（快捷方法）
     * @param {string} controlName - 控件名称（通常是 'legend'）
     * @param {string} layerName - 图层名称
     */
    removeLayer(controlName, layerName) {
        const control = this.controls[controlName];
        if (control && typeof control.removeLayer === 'function') {
            control.removeLayer(layerName);
        }
    }

    /**
     * 获取导出器实例（快捷访问）
     * @returns {MapExporter} 导出器实例
     */
    getExporter() {
        if (this.controls.exportPreview) {
            return this.controls.exportPreview.exporter;
        }
        return null;
    }

    /**
     * 快速导出地图
     * @param {Object} options - 导出选项
     * @param {Array<string>} options.includeControls - 包含的控件名称数组
     * @param {Array<string>} options.excludeControls - 排除的控件名称数组
     * @param {string} options.format - 导出格式 (png/jpg)
     * @param {number} options.quality - 导出质量 (0.1-1.0)
     * @param {number} options.scale - 分辨率倍数 (1-4)
     * @param {string} options.filename - 文件名
     * @param {boolean} options.includeBasemap - 是否包含底图
     * @returns {Promise} 导出结果
     */
    exportMap(options = {}) {
        const exporter = this.getExporter();
        if (!exporter) {
            console.error('导出控件未初始化');
            return Promise.reject(new Error('导出控件未初始化'));
        }

        // 清空之前的配置
        exporter.clearUIElements();
        exporter.clearLayers();

        // 确定要导出的控件
        let controlsToExport = [];
        if (options.includeControls) {
            controlsToExport = options.includeControls;
        } else if (options.excludeControls) {
            // 排除指定控件，导出其他所有控件
            const allControls = ['northArrow', 'scaleBar', 'legend', 'graticule', 'mapInfo'];
            controlsToExport = allControls.filter(name => !options.excludeControls.includes(name));
        } else {
            // 默认导出所有可见控件（除了exportPreview本身）
            controlsToExport = Object.keys(this.visibility)
                .filter(name => name !== 'exportPreview' && this.visibility[name]);
        }

        // 控件到CSS选择器的映射
        const selectorMap = {
            northArrow: '.leaflet-control-north-arrow',
            scaleBar: '.leaflet-control-scale-bar',
            legend: '.leaflet-control-legend',
            mapInfo: '.leaflet-control-map-info'
        };

        // 添加UI控件到导出器
        controlsToExport.forEach(controlName => {
            if (controlName === 'graticule') {
                // 格网需要特殊处理
                this._addGraticuleToExporter(exporter);
            } else if (selectorMap[controlName]) {
                exporter.addUIElement(selectorMap[controlName]);
            }
        });

        // 设置导出参数
        if (options.format) exporter.setFormat(options.format);
        if (options.quality !== undefined) exporter.setQuality(options.quality);
        if (options.scale) exporter.setScale(options.scale);
        if (options.filename) exporter.setFilename(options.filename);
        if (options.includeBasemap !== undefined) exporter.setIncludeBasemap(options.includeBasemap);

        // 执行导出
        return exporter.export();
    }

    /**
     * 添加格网到导出器
     * @private
     */
    _addGraticuleToExporter(exporter) {
        exporter.addUIElement('.lge-graticule-frame');

        const graticuleControl = this.controls.graticule;
        if (graticuleControl) {
            graticuleControl.lines.forEach(line => {
                exporter.addLayer(line);
            });
            graticuleControl.labels.forEach(label => {
                exporter.addLayer(label);
            });
        }
    }

    /**
     * 重置控件位置
     * @param {string} controlName - 控件名称
     */
    resetPosition(controlName) {
        const control = this.controls[controlName];
        if (control && typeof control.resetPosition === 'function') {
            control.resetPosition();

            // 使用通知工具类显示消息
            if (L.GISElements.Notification) {
                L.GISElements.Notification.success(`${this._getControlDisplayName(controlName)}位置已重置`);
            }
        }
    }

    /**
     * 重置所有控件位置
     */
    resetAllPositions() {
        Object.keys(this.controls).forEach(controlName => {
            this.resetPosition(controlName);
        });
    }

    /**
     * 更新图例图层
     * @param {Array} layers - 图层数组
     */
    updateLegendLayers(layers) {
        if (this.controls.legend) {
            this.controls.legend.setLayers(layers);
        }
    }

    /**
     * 添加图例图层
     * @param {Object} layer - 图层对象
     */
    addLegendLayer(layer) {
        if (this.controls.legend) {
            this.controls.legend.addLayer(layer);
        }
    }

    /**
     * 移除图例图层
     * @param {string} layerName - 图层名称
     */
    removeLegendLayer(layerName) {
        if (this.controls.legend) {
            this.controls.legend.removeLayer(layerName);
        }
    }

    /**
     * 获取控件显示名称
     * @private
     */
    _getControlDisplayName(controlName) {
        const names = {
            northArrow: '指北针',
            scaleBar: '比例尺',
            legend: '图例',
            graticule: '经纬度格网',
            mapInfo: '地图注记',
            exportPreview: '导出预览'
        };
        return names[controlName] || controlName;
    }

    /**
     * 获取指定控件实例
     * @param {string} controlName - 控件名称
     * @returns {Object} 控件实例
     */
    getControl(controlName) {
        return this.controls[controlName];
    }

    /**
     * 销毁控制器
     */
    destroy() {
        Object.keys(this.leafletControls).forEach(controlName => {
            const control = this.leafletControls[controlName];
            if (control) {
                this.map.removeControl(control);
            }
        });
    }
}

// 初始化 L.GISElements 命名空间
L.GISElements = L.GISElements || {};

// 导出到 L.GISElements 命名空间
L.GISElements.MapController = MapController;


