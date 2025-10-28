/**
 * 经纬度格网控件
 * 在地图上显示经纬度网格线和标注
 * 支持可视化矩形边框，可拖动和调整大小
 */

class GraticuleControl {
    constructor(options = {}) {
        // 格网配置
        this.interval = options.interval || null;
        this.lngInterval = options.lngInterval || options.interval || null;
        this.latInterval = options.latInterval || options.interval || null;
        this.showLabels = options.showLabels !== false;

        // 经线样式
        this.meridianColor = options.meridianColor || options.color || '#666';
        this.meridianWeight = options.meridianWeight || options.weight || 1;
        this.meridianOpacity = options.meridianOpacity || options.opacity || 0.5;
        this.meridianDashArray = options.meridianDashArray || null; // 线型，如 '5, 5' 表示虚线

        // 纬线样式
        this.parallelColor = options.parallelColor || options.color || '#666';
        this.parallelWeight = options.parallelWeight || options.weight || 1;
        this.parallelOpacity = options.parallelOpacity || options.opacity || 0.5;
        this.parallelDashArray = options.parallelDashArray || null;

        // 标签样式
        this.labelFontSize = options.labelFontSize || 11; // 字体大小（px）
        this.labelFontFamily = options.labelFontFamily || 'Arial, sans-serif'; // 字体类型

        // 兼容旧API
        this.color = options.color || '#666';
        this.weight = options.weight || 1;
        this.opacity = options.opacity || 0.5;

        // 格网窗格配置
        this.frameEnabled = options.frameEnabled !== false; // 是否显示边框
        this.frameColor = options.frameColor || '#333';
        this.frameWeight = options.frameWeight || 2;
        this.frameOpacity = options.frameOpacity || 0.8;
        this.frameDraggable = options.frameDraggable !== false;
        this.frameResizable = options.frameResizable !== false;

        // 格网线和标注
        this.lines = [];
        this.labels = [];
        this.frame = null; // 矩形边框（HTML元素）

        // 拖动和调整大小管理器
        this.frameDraggableManager = null;
        this.frameResizableManager = null;

        // 是否启用
        this.enabled = options.enabled !== false;

        // 使用常量配置（如果可用）
        const defaults = window.Constants ? window.Constants.GRATICULE_DEFAULTS : {};

        // 边框位置和大小（相对于地图容器的像素坐标）
        this.frameRect = options.frameRect || {
            left: defaults.FRAME_LEFT || 100,
            top: defaults.FRAME_TOP || 100,
            width: defaults.FRAME_WIDTH || 400,
            height: defaults.FRAME_HEIGHT || 300
        };

        // 地图引用
        this.map = null;
    }

    /**
     * 添加到地图
     */
    addTo(map) {
        this.map = map;

        // 监听地图事件（仅用于更新格网线和标签）
        this._updateHandler = () => this.updateGraticule();
        map.on('move', this._updateHandler);
        map.on('zoom', this._updateHandler);

        // 初始绘制
        if (this.enabled) {
            this.updateGraticule();
        }

        return this;
    }

    /**
     * 从地图移除
     */
    remove() {
        if (this._updateHandler && this.map) {
            this.map.off('move', this._updateHandler);
            this.map.off('zoom', this._updateHandler);
            this._updateHandler = null;
        }

        // 清理所有格网元素和事件监听器
        this.clearGraticule();

        this.map = null;
        return this;
    }

    /**
     * 更新格网
     * @param {boolean} updateFrame - 是否更新边框，默认true
     */
    updateGraticule(updateFrame = true) {
        if (!this.map) return;

        // 只清除格网线和标签，保留边框和管理器
        this._clearLinesAndLabels();

        // 只有启用时才绘制
        if (this.enabled) {
            // 绘制边框（只在需要更新边框时）
            if (this.frameEnabled && updateFrame) {
                this._clearFrame();
                this._drawFrame();
            } else if (!this.frameEnabled && this.frame) {
                // 如果禁用边框但边框仍存在，清除它
                this._clearFrame();
            } else if (this.frameEnabled && !this.frame) {
                // 如果启用边框但边框不存在，创建它
                this._drawFrame();
            } else if (this.frame) {
                // 边框已存在且不需要重建，只更新位置和大小
                this.frame.style.left = this.frameRect.left + 'px';
                this.frame.style.top = this.frameRect.top + 'px';
                this.frame.style.width = this.frameRect.width + 'px';
                this.frame.style.height = this.frameRect.height + 'px';

                // 更新调整大小控制点位置
                if (this.frameResizableManager) {
                    this.frameResizableManager.updateHandlePositions();
                }
            }

            // 绘制格网线和标签
            const zoom = this.map.getZoom();
            const lngInterval = this.lngInterval || this._calculateInterval(zoom);
            const latInterval = this.latInterval || this._calculateInterval(zoom);

            // 经线样式
            const meridianOptions = {
                color: this.meridianColor,
                weight: this.meridianWeight,
                opacity: this.meridianOpacity
            };
            if (this.meridianDashArray) {
                meridianOptions.dashArray = this.meridianDashArray;
            }

            // 纬线样式
            const parallelOptions = {
                color: this.parallelColor,
                weight: this.parallelWeight,
                opacity: this.parallelOpacity
            };
            if (this.parallelDashArray) {
                parallelOptions.dashArray = this.parallelDashArray;
            }

            // 使用边框对应的地理范围作为绘制区域
            const bounds = this._getFrameLatLngBounds();

            this._drawMeridians(bounds, lngInterval, meridianOptions);
            this._drawParallels(bounds, latInterval, parallelOptions);
        } else {
            // 如果禁用，清除边框
            if (this.frame) {
                this._clearFrame();
            }
        }
    }

    /**
     * 获取边框对应的地理坐标范围
     */
    _getFrameLatLngBounds() {
        if (!this.map) return this.map.getBounds();

        // 将像素坐标转换为地理坐标
        const container = this.map.getContainer();
        const topLeft = this.map.containerPointToLatLng([this.frameRect.left, this.frameRect.top]);
        const bottomRight = this.map.containerPointToLatLng([
            this.frameRect.left + this.frameRect.width,
            this.frameRect.top + this.frameRect.height
        ]);

        return L.latLngBounds(bottomRight, topLeft);
    }

    /**
     * 绘制边框（内层边框 - 格网边框）
     * 这是被刻度标签包围的边框，用于格网线的显示范围
     */
    _drawFrame() {
        // 使用常量获取 Z-Index（如果可用）
        const zIndex = window.Constants ? window.Constants.Z_INDEX.GRATICULE_FRAME : 400;

        // 创建HTML边框元素（内层 - 格网边框）
        this.frame = document.createElement('div');
        this.frame.className = 'graticule-frame';
        this.frame.style.position = 'absolute';
        this.frame.style.left = this.frameRect.left + 'px';
        this.frame.style.top = this.frameRect.top + 'px';
        this.frame.style.width = this.frameRect.width + 'px';
        this.frame.style.height = this.frameRect.height + 'px';
        this.frame.style.border = `${this.frameWeight}px solid ${this.frameColor}`;
        this.frame.style.opacity = this.frameOpacity;
        this.frame.style.boxSizing = 'border-box';
        this.frame.style.pointerEvents = 'auto';
        this.frame.style.zIndex = zIndex.toString();

        // 添加到地图容器
        this.map.getContainer().appendChild(this.frame);

        // 使用 DraggableManager 添加拖动功能
        if (this.frameDraggable && window.DraggableManager) {
            // 保存拖动开始时的位置
            let dragStartRect = null;

            this.frameDraggableManager = new DraggableManager(this.frame, {
                threshold: window.Constants ? window.Constants.DRAG_THRESHOLD : 5,
                onDragStart: (e) => {
                    // 记录拖动开始时的边框位置
                    dragStartRect = { ...this.frameRect };

                    // 禁用地图拖动
                    if (this.map.dragging) {
                        this.map.dragging.disable();
                    }
                    // 添加视觉反馈
                    this.frame.style.cursor = 'grabbing';
                    this.frame.style.opacity = '0.6';
                    e.stopPropagation();
                    e.preventDefault();
                },
                onDragging: (delta) => {
                    // 使用拖动开始时的位置加上累计偏移量
                    this.frameRect.left = dragStartRect.left + delta.x;
                    this.frameRect.top = dragStartRect.top + delta.y;

                    this.frame.style.left = this.frameRect.left + 'px';
                    this.frame.style.top = this.frameRect.top + 'px';

                    // 更新调整大小控制点位置
                    if (this.frameResizableManager) {
                        this.frameResizableManager.updateHandlePositions();
                    }

                    // 重新绘制格网（但不重建边框）
                    this.updateGraticule(false);
                },
                onDragEnd: () => {
                    // 恢复视觉反馈
                    this.frame.style.cursor = 'move';
                    this.frame.style.opacity = this.frameOpacity;

                    // 重新启用地图拖动
                    if (this.map.dragging) {
                        this.map.dragging.enable();
                    }
                }
            });
            this.frameDraggableManager.enable();
            this.frame.style.cursor = 'move';
        }

        // 使用 ResizableManager 添加调整大小功能
        if (this.frameResizable && window.ResizableManager) {
            const minSize = window.Constants ? window.Constants.MIN_FRAME_WIDTH : 100;
            const handleColor = this.frameColor;

            this.frameResizableManager = new ResizableManager(this.frame, {
                minWidth: minSize,
                minHeight: minSize,
                handleColor: handleColor,
                onResizeStart: () => {
                    // 添加调整大小视觉反馈
                    this.frame.style.opacity = '0.6';

                    // 禁用地图拖动
                    if (this.map.dragging) {
                        this.map.dragging.disable();
                    }
                },
                onResizing: () => {
                    // 从元素样式更新 frameRect
                    this.frameRect.left = parseInt(this.frame.style.left) || 0;
                    this.frameRect.top = parseInt(this.frame.style.top) || 0;
                    this.frameRect.width = parseInt(this.frame.style.width) || this.frame.offsetWidth;
                    this.frameRect.height = parseInt(this.frame.style.height) || this.frame.offsetHeight;

                    // 重新绘制格网（但不重建边框）
                    this.updateGraticule(false);
                },
                onResizeEnd: () => {
                    // 恢复视觉反馈
                    this.frame.style.opacity = this.frameOpacity;

                    // 重新启用地图拖动
                    if (this.map.dragging) {
                        this.map.dragging.enable();
                    }
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
    }


    /**
     * 绘制经线
     */
    _drawMeridians(bounds, interval, styleOptions) {
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();

        const startLng = Math.ceil(west / interval) * interval;

        for (let lng = startLng; lng <= east; lng += interval) {
            // 绘制经线（只在边框内）
            const line = L.polyline([
                [south, lng],
                [north, lng]
            ], styleOptions).addTo(this.map);

            this.lines.push(line);

            // 添加标注（在边框外）
            if (this.showLabels) {
                // 顶部标签
                this._addLabel(lng, north, this._formatLng(lng), 'longitude', 'top');
                // 底部标签
                this._addLabel(lng, south, this._formatLng(lng), 'longitude', 'bottom');
            }
        }
    }

    /**
     * 绘制纬线
     */
    _drawParallels(bounds, interval, styleOptions) {
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();

        const startLat = Math.ceil(south / interval) * interval;

        for (let lat = startLat; lat <= north; lat += interval) {
            if (lat < -90 || lat > 90) continue;

            // 绘制纬线（只在边框内）
            const line = L.polyline([
                [lat, west],
                [lat, east]
            ], styleOptions).addTo(this.map);

            this.lines.push(line);

            // 添加标注（在边框外）
            if (this.showLabels) {
                // 左侧标签
                this._addLabel(west, lat, this._formatLat(lat), 'latitude', 'left');
                // 右侧标签
                this._addLabel(east, lat, this._formatLat(lat), 'latitude', 'right');
            }
        }
    }

    /**
     * 添加标注
     */
    _addLabel(lng, lat, text, type, position) {
        const label = L.marker([lat, lng], {
            icon: L.divIcon({
                className: `graticule-label graticule-label-${type} graticule-label-${position}`,
                html: `<span style="font-size: ${this.labelFontSize}px; font-family: ${this.labelFontFamily};">${text}</span>`,
                iconSize: null
            }),
            interactive: false,
            zIndexOffset: 1000
        }).addTo(this.map);

        this.labels.push(label);
    }

    /**
     * 清除格网线和标签（不清除边框）
     * @private
     */
    _clearLinesAndLabels() {
        // 移除所有线条
        this.lines.forEach(line => {
            if (this.map) {
                this.map.removeLayer(line);
            }
        });
        this.lines = [];

        // 移除所有标注
        this.labels.forEach(label => {
            if (this.map) {
                this.map.removeLayer(label);
            }
        });
        this.labels = [];
    }

    /**
     * 清除边框和管理器
     * @private
     */
    _clearFrame() {
        // 清理拖动管理器
        if (this.frameDraggableManager) {
            this.frameDraggableManager.destroy();
            this.frameDraggableManager = null;
        }

        // 清理调整大小管理器
        if (this.frameResizableManager) {
            this.frameResizableManager.destroy();
            this.frameResizableManager = null;
        }

        // 移除边框
        if (this.frame) {
            if (this.frame.parentNode) {
                this.frame.parentNode.removeChild(this.frame);
            }
            this.frame = null;
        }
    }

    /**
     * 清除格网（包括线条、标签和边框）
     */
    clearGraticule() {
        this._clearLinesAndLabels();
        this._clearFrame();
    }

    /**
     * 计算合适的间隔
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
     */
    _formatLng(lng) {
        const abs = Math.abs(lng);
        const dir = lng >= 0 ? 'E' : 'W';
        return `${abs.toFixed(3)}°${dir}`;
    }

    /**
     * 格式化纬度
     */
    _formatLat(lat) {
        const abs = Math.abs(lat);
        const dir = lat >= 0 ? 'N' : 'S';
        return `${abs.toFixed(3)}°${dir}`;
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
     * 设置经度间隔
     */
    setLngInterval(interval) {
        this.lngInterval = interval;
        this.updateGraticule();
    }

    /**
     * 设置纬度间隔
     */
    setLatInterval(interval) {
        this.latInterval = interval;
        this.updateGraticule();
    }

    /**
     * 同时设置经度和纬度间隔
     */
    setIntervals(lngInterval, latInterval) {
        this.lngInterval = lngInterval;
        this.latInterval = latInterval;
        this.updateGraticule();
    }

    /**
     * 获取当前经度间隔
     */
    getLngInterval() {
        return this.lngInterval || this._calculateInterval(this.map ? this.map.getZoom() : 0);
    }

    /**
     * 获取当前纬度间隔
     */
    getLatInterval() {
        return this.latInterval || this._calculateInterval(this.map ? this.map.getZoom() : 0);
    }

    /**
     * 启用格网线
     */
    enable() {
        this.enabled = true;
        this.updateGraticule();
    }

    /**
     * 禁用格网线
     */
    disable() {
        this.enabled = false;
        this.clearGraticule();
    }

    /**
     * 切换格网线显示状态
     */
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    /**
     * 显示格网线
     */
    showGraticule() {
        this.enable();
    }

    /**
     * 隐藏格网线
     */
    hideGraticule() {
        this.disable();
    }

    /**
     * 设置边框矩形（像素坐标）
     */
    setFrameRect(rect) {
        this.frameRect = rect;
        this.updateGraticule();
    }

    /**
     * 获取边框矩形（像素坐标）
     */
    getFrameRect() {
        return this.frameRect;
    }

    /**
     * 设置边框范围（兼容旧API，将地理坐标转换为像素坐标）
     */
    setFrameBounds(bounds) {
        if (!this.map) return;

        const topLeft = this.map.latLngToContainerPoint(bounds.getNorthWest());
        const bottomRight = this.map.latLngToContainerPoint(bounds.getSouthEast());

        this.frameRect = {
            left: topLeft.x,
            top: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };

        this.updateGraticule();
    }

    /**
     * 获取边框范围（兼容旧API，返回地理坐标）
     */
    getFrameBounds() {
        return this._getFrameLatLngBounds();
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
        this.updateGraticule();
    }

    /**
     * 设置经线样式
     */
    setMeridianStyle(options = {}) {
        if (options.color !== undefined) this.meridianColor = options.color;
        if (options.weight !== undefined) this.meridianWeight = options.weight;
        if (options.opacity !== undefined) this.meridianOpacity = options.opacity;
        if (options.dashArray !== undefined) this.meridianDashArray = options.dashArray;
        this.updateGraticule();
    }

    /**
     * 设置纬线样式
     */
    setParallelStyle(options = {}) {
        if (options.color !== undefined) this.parallelColor = options.color;
        if (options.weight !== undefined) this.parallelWeight = options.weight;
        if (options.opacity !== undefined) this.parallelOpacity = options.opacity;
        if (options.dashArray !== undefined) this.parallelDashArray = options.dashArray;
        this.updateGraticule();
    }

    /**
     * 设置标签样式
     */
    setLabelStyle(options = {}) {
        if (options.fontSize !== undefined) this.labelFontSize = options.fontSize;
        if (options.fontFamily !== undefined) this.labelFontFamily = options.fontFamily;
        this.updateGraticule();
    }

    /**
     * 获取经线样式
     */
    getMeridianStyle() {
        return {
            color: this.meridianColor,
            weight: this.meridianWeight,
            opacity: this.meridianOpacity,
            dashArray: this.meridianDashArray
        };
    }

    /**
     * 获取纬线样式
     */
    getParallelStyle() {
        return {
            color: this.parallelColor,
            weight: this.parallelWeight,
            opacity: this.parallelOpacity,
            dashArray: this.parallelDashArray
        };
    }

    /**
     * 获取标签样式
     */
    getLabelStyle() {
        return {
            fontSize: this.labelFontSize,
            fontFamily: this.labelFontFamily
        };
    }
}

// 导出到全局
window.GraticuleControl = GraticuleControl;
