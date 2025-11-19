/**
 * 经纬度格网控件（重构版）
 * 继承自L.GISElements.StylableControl
 * 
 * 功能：
 * 1. 绘制经纬度网格线
 * 2. 显示经纬度标签
 * 3. 可拖动、可调整大小的边框
 * 4. 支持样式切换
 */

// 确保命名空间已初始化
L.GISElements = L.GISElements || {};

class GraticuleControl extends L.GISElements.StylableControl {
    constructor(options = {}) {
        super({
            position: options.position || 'topleft',
            draggable: false,  // 边框自己处理拖动
            storageKey: 'graticulePosition',
            style: options.style || 'simple'
        });

        // 格网配置
        this.interval = options.interval || null;
        this.lngInterval = options.lngInterval || null;
        this.latInterval = options.latInterval || null;
        this.showLabels = options.showLabels !== false;

        // 标签位置配置
        this.labelPositions = options.labelPositions || {
            top: true,      // 顶部标签（经度）
            bottom: true,   // 底部标签（经度）
            left: true,     // 左侧标签（纬度）
            right: true     // 右侧标签（纬度）
        };

        // 边框配置
        this.frameEnabled = options.frameEnabled !== false;
        this.frameDraggable = options.frameDraggable !== false;
        this.frameResizable = options.frameResizable !== false;

        // 加载保存的边框位置和大小，如果没有则使用默认值
        const savedFrameRect = this._loadFrameRect();
        this.frameRect = savedFrameRect || options.frameRect || {
            left: 100,
            top: 100,
            width: 400,
            height: 300
        };

        // 状态
        this.enabled = options.enabled !== false;
        this.lines = [];
        this.labels = [];
        this.frame = null;

        // 拖动和调整大小管理器
        this.frameDraggableManager = null;
        this.frameResizableManager = null;
    }

    /**
     * 获取容器CSS类名
     */
    getContainerClass() {
        return 'lge-control-graticule';
    }

    /**
     * 获取默认样式集合
     */
    getDefaultStyles() {
        return L.GISElements.StyleRegistry.getStyles('graticule');
    }

    /**
     * 获取默认样式名称
     */
    getDefaultStyleName() {
        return 'simple';
    }

    /**
     * 样式初始化
     */
    onStyleInit(map, container) {
        // 监听地图事件
        this._updateHandler = () => this.updateGraticule();
        map.on('move', this._updateHandler);
        map.on('zoom', this._updateHandler);

        // 初始绘制
        if (this.enabled) {
            this.updateGraticule();
        }
    }

    /**
     * 渲染格网（实现基类要求的方法）
     */
    render() {
        this.updateGraticule();
    }

    /**
     * 更新格网
     */
    updateGraticule() {
        if (!this.map) return;

        // 清除旧格网和边框
        this._clearLinesAndLabels();
        this._clearFrame();

        // 只有启用时才绘制
        if (this.enabled) {
            this._drawGraticule();
        }
    }

    /**
     * 绘制格网（使用当前样式）
     * @private
     */
    _drawGraticule() {
        const style = this.getCurrentStyleObject();
        if (!style) return;

        // 计算间隔
        const zoom = this.map.getZoom();
        const lngInterval = this.lngInterval || this._calculateInterval(zoom);
        const latInterval = this.latInterval || this._calculateInterval(zoom);

        // 获取边框对应的地理范围
        const bounds = this._getFrameLatLngBounds();

        // 绘制经线（使用样式）
        this._drawMeridians(bounds, lngInterval, style.meridian);

        // 绘制纬线（使用样式）
        this._drawParallels(bounds, latInterval, style.parallel);

        // 绘制边框
        if (this.frameEnabled) {
            this._drawFrame(style.frame);
        }
    }

    /**
     * 只重绘格网线和标签（不重新创建边框）
     * @private
     */
    _redrawLinesOnly() {
        const style = this.getCurrentStyleObject();
        if (!style) return;

        // 计算间隔
        const zoom = this.map.getZoom();
        const lngInterval = this.lngInterval || this._calculateInterval(zoom);
        const latInterval = this.latInterval || this._calculateInterval(zoom);

        // 获取边框对应的地理范围
        const bounds = this._getFrameLatLngBounds();

        // 绘制经线（使用样式）
        this._drawMeridians(bounds, lngInterval, style.meridian);

        // 绘制纬线（使用样式）
        this._drawParallels(bounds, latInterval, style.parallel);
    }

    /**
     * 获取边框对应的地理坐标范围
     * @private
     */
    _getFrameLatLngBounds() {
        if (!this.map) return this.map.getBounds();

        const topLeft = this.map.containerPointToLatLng([this.frameRect.left, this.frameRect.top]);
        const bottomRight = this.map.containerPointToLatLng([
            this.frameRect.left + this.frameRect.width,
            this.frameRect.top + this.frameRect.height
        ]);

        return L.latLngBounds(bottomRight, topLeft);
    }

    /**
     * 绘制经线
     * @private
     */
    _drawMeridians(bounds, interval, style) {
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();

        const startLng = Math.ceil(west / interval) * interval;

        for (let lng = startLng; lng <= east; lng += interval) {
            // 添加统一的CSS类名，方便导出控制
            const lineStyle = { ...style, className: 'lge-graticule-line' };
            const line = L.polyline([
                [south, lng],
                [north, lng]
            ], lineStyle).addTo(this.map);

            this.lines.push(line);

            // 添加标签
            if (this.showLabels) {
                const labelStyle = this.getCurrentStyleObject().label;
                if (this.labelPositions.top) {
                    this._addLabel(lng, north, this._formatLng(lng), 'longitude', 'top', labelStyle);
                }
                if (this.labelPositions.bottom) {
                    this._addLabel(lng, south, this._formatLng(lng), 'longitude', 'bottom', labelStyle);
                }
            }
        }
    }

    /**
     * 绘制纬线
     * @private
     */
    _drawParallels(bounds, interval, style) {
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();

        const startLat = Math.ceil(south / interval) * interval;

        for (let lat = startLat; lat <= north; lat += interval) {
            if (lat < -90 || lat > 90) continue;

            // 添加统一的CSS类名，方便导出控制
            const lineStyle = { ...style, className: 'lge-graticule-line' };
            const line = L.polyline([
                [lat, west],
                [lat, east]
            ], lineStyle).addTo(this.map);

            this.lines.push(line);

            // 添加标签
            if (this.showLabels) {
                const labelStyle = this.getCurrentStyleObject().label;
                if (this.labelPositions.left) {
                    this._addLabel(west, lat, this._formatLat(lat), 'latitude', 'left', labelStyle);
                }
                if (this.labelPositions.right) {
                    this._addLabel(east, lat, this._formatLat(lat), 'latitude', 'right', labelStyle);
                }
            }
        }
    }

    /**
     * 添加标签
     * @private
     */
    _addLabel(lng, lat, text, type, position, style) {
        const label = L.marker([lat, lng], {
            icon: L.divIcon({
                className: `lge-graticule-label lge-graticule-label-${type} lge-graticule-label-${position}`,
                html: `<span style="font-size: ${style.fontSize}px; font-family: ${style.fontFamily}; color: ${style.color};">${text}</span>`,
                iconSize: null
            }),
            interactive: false,
            zIndexOffset: 1000
        }).addTo(this.map);

        this.labels.push(label);
    }

    /**
     * 绘制边框
     * @private
     */
    _drawFrame(frameStyle) {
        const zIndex = L.GISElements.Constants ?
            L.GISElements.Constants.Z_INDEX.GRATICULE_FRAME : 400;

        this.frame = document.createElement('div');
        this.frame.className = 'lge-graticule-frame';
        this.frame.style.cssText = `
            position: absolute;
            left: ${this.frameRect.left}px;
            top: ${this.frameRect.top}px;
            width: ${this.frameRect.width}px;
            height: ${this.frameRect.height}px;
            border: ${frameStyle.weight}px solid ${frameStyle.color};
            opacity: ${frameStyle.opacity};
            box-sizing: border-box;
            pointer-events: auto;
            z-index: ${zIndex};
        `;

        this.map.getContainer().appendChild(this.frame);

        // 使边框可拖动
        if (this.frameDraggable && L.GISElements.Draggable) {
            this._makeFrameDraggable();
        }

        // 使边框可调整大小
        if (this.frameResizable && L.GISElements.Resizable) {
            this._makeFrameResizable(frameStyle.color);
        }
    }

    /**
     * 使边框可拖动
     * @private
     */
    _makeFrameDraggable() {
        let dragStartRect = null;

        this.frameDraggableManager = new L.GISElements.Draggable(this.frame, {
            threshold: 5,
            onDragStart: (e) => {
                dragStartRect = { ...this.frameRect };
                if (this.map.dragging) this.map.dragging.disable();
                this.frame.style.cursor = 'grabbing';
                this.frame.style.opacity = '0.6';
                e.stopPropagation();
                e.preventDefault();
            },
            onDragging: (delta) => {
                this.frameRect.left = dragStartRect.left + delta.x;
                this.frameRect.top = dragStartRect.top + delta.y;
                this.frame.style.left = this.frameRect.left + 'px';
                this.frame.style.top = this.frameRect.top + 'px';

                if (this.frameResizableManager) {
                    this.frameResizableManager.updateHandlePositions();
                }

                // 重新绘制格网线和标签（不重新创建边框）
                this._clearLinesAndLabels();
                this._redrawLinesOnly();
            },
            onDragEnd: () => {
                this.frame.style.cursor = 'move';
                const frameStyle = this.getCurrentStyleObject().frame;
                this.frame.style.opacity = frameStyle.opacity;
                if (this.map.dragging) this.map.dragging.enable();

                // 保存边框位置和大小
                this._saveFrameRect();
            }
        });

        this.frameDraggableManager.enable();
        this.frame.style.cursor = 'move';
    }

    /**
     * 使边框可调整大小
     * @private
     */
    _makeFrameResizable(handleColor) {
        const minSize = L.GISElements.Constants ?
            L.GISElements.Constants.MIN_FRAME_WIDTH : 100;

        this.frameResizableManager = new L.GISElements.Resizable(this.frame, {
            minWidth: minSize,
            minHeight: minSize,
            handleColor: handleColor,
            onResizeStart: () => {
                this.frame.style.opacity = '0.6';
                if (this.map.dragging) this.map.dragging.disable();
            },
            onResizing: () => {
                this.frameRect.left = parseInt(this.frame.style.left) || 0;
                this.frameRect.top = parseInt(this.frame.style.top) || 0;
                this.frameRect.width = parseInt(this.frame.style.width) || this.frame.offsetWidth;
                this.frameRect.height = parseInt(this.frame.style.height) || this.frame.offsetHeight;

                // 重新绘制格网线和标签（不重新创建边框）
                this._clearLinesAndLabels();
                this._redrawLinesOnly();
            },
            onResizeEnd: () => {
                const frameStyle = this.getCurrentStyleObject().frame;
                this.frame.style.opacity = frameStyle.opacity;
                if (this.map.dragging) this.map.dragging.enable();

                // 保存边框位置和大小
                this._saveFrameRect();
            },
            getBounds: () => this.frameRect,
            setBounds: (bounds) => {
                this.frameRect = bounds;
                this.frame.style.left = bounds.left + 'px';
                this.frame.style.top = bounds.top + 'px';
                this.frame.style.width = bounds.width + 'px';
                this.frame.style.height = bounds.height + 'px';
            }
        });

        this.frameResizableManager.enable();
    }

    /**
     * 清除格网线和标签（不清除边框）
     * @private
     */
    _clearLinesAndLabels() {
        this.lines.forEach(line => {
            if (this.map) this.map.removeLayer(line);
        });
        this.lines = [];

        this.labels.forEach(label => {
            if (this.map) this.map.removeLayer(label);
        });
        this.labels = [];
    }

    /**
     * 清除边框
     * @private
     */
    _clearFrame() {
        if (this.frameDraggableManager) {
            this.frameDraggableManager.destroy();
            this.frameDraggableManager = null;
        }

        if (this.frameResizableManager) {
            this.frameResizableManager.destroy();
            this.frameResizableManager = null;
        }

        if (this.frame && this.frame.parentNode) {
            this.frame.parentNode.removeChild(this.frame);
        }
        this.frame = null;
    }

    /**
     * 计算合适的间隔
     * @private
     */
    _calculateInterval(zoom) {
        if (zoom >= 17) return 0.001;
        if (zoom >= 15) return 0.005;
        if (zoom >= 13) return 0.01;
        if (zoom >= 11) return 0.05;
        if (zoom >= 9) return 0.1;
        if (zoom >= 7) return 0.5;
        if (zoom >= 5) return 1;
        if (zoom >= 3) return 5;
        return 10;
    }

    /**
     * 格式化经度
     * @private
     */
    _formatLng(lng) {
        const abs = Math.abs(lng);
        const dir = lng >= 0 ? 'E' : 'W';
        return `${abs.toFixed(3)}°${dir}`;
    }

    /**
     * 格式化纬度
     * @private
     */
    _formatLat(lat) {
        const abs = Math.abs(lat);
        const dir = lat >= 0 ? 'N' : 'S';
        return `${abs.toFixed(3)}°${dir}`;
    }

    /**
     * 加载保存的边框位置和大小
     * @private
     */
    _loadFrameRect() {
        try {
            const saved = localStorage.getItem('graticuleFrameRect');
            if (!saved) return null;

            const parsed = JSON.parse(saved);

            // 验证数据格式
            if (typeof parsed.left === 'number' &&
                typeof parsed.top === 'number' &&
                typeof parsed.width === 'number' &&
                typeof parsed.height === 'number') {
                return parsed;
            }

            return null;
        } catch (e) {
            console.warn('无法加载格网边框位置:', e);
            return null;
        }
    }

    /**
     * 保存边框位置和大小
     * @private
     */
    _saveFrameRect() {
        try {
            localStorage.setItem('graticuleFrameRect', JSON.stringify(this.frameRect));
        } catch (e) {
            console.warn('无法保存格网边框位置:', e);
        }
    }

    // ==================== 公共方法 ====================

    /**
     * 启用格网
     */
    enable() {
        this.enabled = true;
        this.updateGraticule();
    }

    /**
     * 禁用格网
     */
    disable() {
        this.enabled = false;
        this._clearLinesAndLabels();
        this._clearFrame();
    }

    /**
     * 切换格网显示
     */
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    /**
     * 启用边框
     */
    enableFrame() {
        this.frameEnabled = true;
        this.updateGraticule();
    }

    /**
     * 禁用边框
     */
    disableFrame() {
        this.frameEnabled = false;
        this._clearFrame();
    }

    /**
     * 设置间隔
     */
    setInterval(interval) {
        this.interval = interval;
        this.lngInterval = interval;
        this.latInterval = interval;
        this.updateGraticule();
    }

    /**
     * 设置经纬度间隔
     */
    setIntervals(lngInterval, latInterval) {
        this.lngInterval = lngInterval;
        this.latInterval = latInterval;
        this.updateGraticule();
    }

    /**
     * 获取经度间隔
     */
    getLngInterval() {
        return this.lngInterval || this._calculateInterval(this.map ? this.map.getZoom() : 0);
    }

    /**
     * 获取纬度间隔
     */
    getLatInterval() {
        return this.latInterval || this._calculateInterval(this.map ? this.map.getZoom() : 0);
    }

    /**
     * 设置边框矩形
     */
    setFrameRect(rect) {
        this.frameRect = rect;
        this._saveFrameRect();
        this.updateGraticule();
    }

    /**
     * 获取边框矩形
     */
    getFrameRect() {
        return this.frameRect;
    }

    /**
     * 设置标签位置配置
     * @param {Object} positions - 标签位置配置对象 { top, bottom, left, right }
     */
    setLabelPositions(positions) {
        this.labelPositions = { ...this.labelPositions, ...positions };
        if (this.enabled) {
            this.updateGraticule();
        }
        return this;
    }

    /**
     * 获取标签位置配置
     */
    getLabelPositions() {
        return { ...this.labelPositions };
    }

    /**
     * 重置边框位置和大小到默认值
     */
    resetFrameRect() {
        this.frameRect = {
            left: 100,
            top: 100,
            width: 400,
            height: 300
        };

        // 清除保存的位置
        try {
            localStorage.removeItem('graticuleFrameRect');
        } catch (e) {
            console.warn('无法清除保存的格网边框位置:', e);
        }

        // 重新绘制
        this.updateGraticule();
    }

    /**
     * 控件销毁
     */
    onDestroy() {
        if (this._updateHandler && this.map) {
            this.map.off('move', this._updateHandler);
            this.map.off('zoom', this._updateHandler);
        }

        this._clearLinesAndLabels();
        this._clearFrame();
    }
}

// 导出到 L.Control 命名空间
L.Control.Graticule = GraticuleControl;

// 工厂方法
L.control.graticule = function (options) {
    const control = new L.Control.Graticule(options);
    return control.createControl();
};

