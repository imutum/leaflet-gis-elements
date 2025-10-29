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
            mapInfo: null
        };

        // Leaflet控件引用
        this.leafletControls = {
            northArrow: null,
            scaleBar: null,
            legend: null,
            graticule: null,
            mapInfo: null
        };

        // 控件可见性状态
        this.visibility = {
            northArrow: true,
            scaleBar: true,
            legend: true,
            graticule: true,
            mapInfo: true
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
        this._bindUIEvents();
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
    }

    /**
     * 绑定UI事件
     * @private
     */
    _bindUIEvents() {
        // 查找UI元素并绑定事件
        this._bindControlEvent('northArrow', 'showNorthArrow', 'northArrowStyle');
        this._bindControlEvent('scaleBar', 'showScaleBar', 'scaleBarStyle');
        this._bindControlEvent('legend', 'showLegend', 'legendStyle');

        // 格网控件特殊处理（无UI控制面板）
        this._bindGraticuleEvents();

        // 绑定重置按钮
        this._bindResetButton('resetNorthArrowPosition', 'northArrow');
        this._bindResetButton('resetScaleBarPosition', 'scaleBar');
        this._bindResetButton('resetLegendPosition', 'legend');
        this._bindResetButton('resetGraticulePosition', 'graticule');
    }

    /**
     * 绑定控件事件
     * @private
     */
    _bindControlEvent(controlName, checkboxId, styleSelectId) {
        // 显示/隐藏复选框
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.show(controlName);
                } else {
                    this.hide(controlName);
                }
            });
            checkbox.checked = this.visibility[controlName];
        }

        // 样式切换下拉框
        const styleSelect = document.getElementById(styleSelectId);
        if (styleSelect && this.controls[controlName]) {
            styleSelect.addEventListener('change', (e) => {
                this.setStyle(controlName, e.target.value);
            });
            styleSelect.value = this.controls[controlName].getCurrentStyle();
        }
    }

    /**
     * 绑定格网控件事件
     * @private
     */
    _bindGraticuleEvents() {
        // 格网线显示/隐藏复选框
        const graticuleCheckbox = document.getElementById('showGraticule');
        if (graticuleCheckbox && this.controls.graticule) {
            graticuleCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.controls.graticule.enable();
                } else {
                    this.controls.graticule.disable();
                }
            });
            graticuleCheckbox.checked = this.controls.graticule.enabled;
        }

        // 格网边框显示/隐藏复选框
        const frameCheckbox = document.getElementById('showGraticuleFrame');
        if (frameCheckbox && this.controls.graticule) {
            frameCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.controls.graticule.enableFrame();
                } else {
                    this.controls.graticule.disableFrame();
                }
            });
            frameCheckbox.checked = this.controls.graticule.frameEnabled;
        }
    }

    /**
     * 绑定重置按钮
     * @private
     */
    _bindResetButton(buttonId, controlName) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                this.resetPosition(controlName);
            });
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
        // 格网控件没有样式切换功能
        if (controlName === 'graticule') {
            return;
        }
        const control = this.controls[controlName];
        if (control && typeof control.setStyle === 'function') {
            control.setStyle(styleName);
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
            mapInfo: '地图注记'
        };
        return names[controlName] || controlName;
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


