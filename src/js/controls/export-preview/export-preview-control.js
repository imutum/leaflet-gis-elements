/**
 * 导出预览控件
 * 职责: UI管理、预览边框、触发导出
 */

L.GISElements = L.GISElements || {};

class ExportPreviewControl extends L.GISElements.StylableControl {
    constructor(options = {}) {
        super({
            position: options.position || 'topright',
            draggable: false,
            storageKey: 'exportPreviewPosition',
            style: options.style || 'default'
        });

        // 配置
        this.config = L.GISElements.ExportConfig;
        this.exportOptions = {
            format: options.format || this.config.DEFAULTS.FORMAT,
            quality: options.quality || this.config.DEFAULTS.QUALITY,
            filename: options.filename || this.config.DEFAULTS.FILENAME,
            scale: options.scale || this.config.DEFAULTS.SCALE
        };

        // 边界设置
        this.exportBounds = options.exportBounds || null;
        this.autoCalculateBounds = options.autoCalculateBounds !== false;
        this.boundsMode = options.boundsMode || 'graticule'; // 'graticule' | 'all' | 'viewport'

        // 白名单
        this.layers = new Set();
        this.uiElements = new Set();

        // 预览状态
        this.previewVisible = false;
        this.previewBorder = null;
        this.borderDraggable = null;
        this.borderResizable = null;

        // 工具类(将在onStyleInit中初始化)
        this.exporter = null;
        this.boundsCalculator = null;
    }

    getContainerClass() {
        return 'leaflet-control-export-preview';
    }

    getDefaultStyles() {
        return L.GISElements.StyleRegistry.getStyles('export-preview');
    }

    getDefaultStyleName() {
        return 'default';
    }

    onStyleInit(map, container) {
        // 初始化工具类
        this.exporter = new L.GISElements.MapExporter(map, this.exportOptions);
        this.boundsCalculator = new L.GISElements.BoundsCalculator(map);
    }

    render() {
        // 导出预览控件不渲染UI，所有操作通过公开方法调用
        // 按钮等UI应在示例代码中实现
    }

    // ==================== 预览边框管理 ====================

    showPreview() {
        if (this.previewVisible) return;

        // 自动计算边界
        if (this.autoCalculateBounds && !this.exportBounds) {
            this.exportBounds = this._calculateBounds();
        }

        // 使用默认边界
        if (!this.exportBounds) {
            this.exportBounds = this.config.BOUNDS.DEFAULT_PREVIEW;
        }

        this._createPreviewBorder();
        this.previewVisible = true;
    }

    hidePreview() {
        if (!this.previewVisible) return;
        this._destroyPreviewBorder();
        this.previewVisible = false;
    }

    togglePreview() {
        this.previewVisible ? this.hidePreview() : this.showPreview();
    }

    /**
     * 根据模式计算边界
     * @private
     */
    _calculateBounds() {
        switch (this.boundsMode) {
            case 'graticule':
                return this.boundsCalculator.calculateGraticuleBounds();
            case 'all':
                return this.boundsCalculator.calculateAllElementsBounds();
            case 'viewport':
                return this.boundsCalculator.getViewportBounds();
            default:
                return null;
        }
    }

    /**
     * 创建预览边框
     * @private
     */
    _createPreviewBorder() {
        const cfg = this.config;
        const zIndex = L.GISElements.Constants?.Z_INDEX.EXPORT_PREVIEW || 500;

        this.previewBorder = document.createElement('div');
        this.previewBorder.className = 'lge-export-preview-border';
        this.previewBorder.style.cssText = `
            position: absolute;
            left: ${this.exportBounds.left}px;
            top: ${this.exportBounds.top}px;
            width: ${this.exportBounds.width}px;
            height: ${this.exportBounds.height}px;
            border: ${cfg.PREVIEW.BORDER_WIDTH}px dashed ${cfg.PREVIEW.BORDER_COLOR};
            background-color: ${this._hexToRgba(cfg.PREVIEW.BORDER_COLOR, cfg.PREVIEW.BACKGROUND_ALPHA)};
            box-sizing: border-box;
            pointer-events: auto;
            z-index: ${zIndex};
            cursor: move;
        `;

        // 提示文本
        const hint = document.createElement('div');
        hint.textContent = cfg.PREVIEW.HINT_TEXT;
        hint.style.cssText = `
            position: absolute;
            top: -25px;
            left: 0;
            background: ${cfg.PREVIEW.BORDER_COLOR};
            color: #fff;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 3px;
            white-space: nowrap;
        `;
        this.previewBorder.appendChild(hint);

        this.map.getContainer().appendChild(this.previewBorder);

        // 启用拖动和调整大小
        this._enableDragging();
        this._enableResizing();
    }

    /**
     * 销毁预览边框
     * @private
     */
    _destroyPreviewBorder() {
        if (this.borderDraggable) {
            this.borderDraggable.destroy();
            this.borderDraggable = null;
        }

        if (this.borderResizable) {
            this.borderResizable.destroy();
            this.borderResizable = null;
        }

        if (this.previewBorder) {
            this.previewBorder.remove();
            this.previewBorder = null;
        }
    }

    /**
     * 启用拖动
     * @private
     */
    _enableDragging() {
        if (!L.GISElements.Draggable) return;

        let dragStartBounds = null;

        this.borderDraggable = new L.GISElements.Draggable(this.previewBorder, {
            threshold: 5,
            onDragStart: () => {
                dragStartBounds = { ...this.exportBounds };
                this.previewBorder.style.opacity = '0.7';
                if (this.map.dragging) this.map.dragging.disable();
            },
            onDragging: (delta) => {
                // 手动计算并应用新位置
                this.exportBounds.left = dragStartBounds.left + delta.x;
                this.exportBounds.top = dragStartBounds.top + delta.y;

                this.previewBorder.style.left = this.exportBounds.left + 'px';
                this.previewBorder.style.top = this.exportBounds.top + 'px';

                // 更新控制点位置
                if (this.borderResizable) {
                    this.borderResizable.updateHandlePositions();
                }

                this.exporter?.setExportBounds(this.exportBounds);
            },
            onDragEnd: () => {
                this.previewBorder.style.opacity = '1';
                if (this.map.dragging) this.map.dragging.enable();
                this.exporter?.setExportBounds(this.exportBounds);
            }
        });

        this.borderDraggable.enable();
    }

    /**
     * 启用调整大小
     * @private
     */
    _enableResizing() {
        if (!L.GISElements.Resizable) return;

        this.borderResizable = new L.GISElements.Resizable(this.previewBorder, {
            minWidth: this.config.BOUNDS.MIN_WIDTH,
            minHeight: this.config.BOUNDS.MIN_HEIGHT,
            handleColor: this.config.PREVIEW.BORDER_COLOR,
            onResizing: (bounds) => {
                this.exportBounds = bounds;
                this.exporter?.setExportBounds(bounds);
            },
            getBounds: () => this.exportBounds,
            setBounds: (bounds) => {
                this.exportBounds = bounds;
                this._updateBorderStyle(bounds);
                this.exporter?.setExportBounds(bounds);
            }
        });

        this.borderResizable.enable();
    }

    /**
     * 同步边界
     * @private
     */
    _syncBounds() {
        this.exportBounds = {
            left: parseInt(this.previewBorder.style.left) || 0,
            top: parseInt(this.previewBorder.style.top) || 0,
            width: parseInt(this.previewBorder.style.width) || 100,
            height: parseInt(this.previewBorder.style.height) || 100
        };
        this.exporter?.setExportBounds(this.exportBounds);

        // 更新调整大小控制点的位置
        if (this.borderResizable) {
            this.borderResizable.updateHandlePositions();
        }
    }

    /**
     * 更新边框样式
     * @private
     */
    _updateBorderStyle(bounds) {
        if (!this.previewBorder) return;

        this.previewBorder.style.left = bounds.left + 'px';
        this.previewBorder.style.top = bounds.top + 'px';
        this.previewBorder.style.width = bounds.width + 'px';
        this.previewBorder.style.height = bounds.height + 'px';

        // 更新调整大小控制点的位置
        if (this.borderResizable) {
            this.borderResizable.updateHandlePositions();
        }
    }

    // ==================== 导出执行 ====================

    async export() {
        if (!this.exporter) {
            throw new Error('导出器未初始化');
        }

        try {
            // 配置导出器
            this.exporter.setExportBounds(this.exportBounds);
            this.exporter.clearLayers();
            this.exporter.clearUIElements();

            // 应用白名单
            this.layers.forEach(layer => this.exporter.addLayer(layer));
            this.uiElements.forEach(el => this.exporter.addUIElement(el));

            // 执行导出
            await this.exporter.export();

            // 成功提示
            L.GISElements.Notification?.success('地图导出成功');
        } catch (error) {
            console.error('[导出] 失败:', error);
            L.GISElements.Notification?.error('导出失败: ' + error.message);
            throw error;
        }
    }

    // ==================== 白名单管理 ====================

    addLayer(layer) {
        this.layers.add(layer);
        return this;
    }

    addUIElement(element) {
        this.uiElements.add(element);
        return this;
    }

    removeLayer(layer) {
        this.layers.delete(layer);
        return this;
    }

    removeUIElement(element) {
        this.uiElements.delete(element);
        return this;
    }

    clearWhitelist() {
        this.layers.clear();
        this.uiElements.clear();
        return this;
    }

    // ==================== 边界设置 ====================

    setExportBounds(rect) {
        this.exportBounds = rect;

        if (this.previewBorder) {
            this._updateBorderStyle(rect);
        }

        this.exporter?.setExportBounds(rect);
        return this;
    }

    setBoundsMode(mode) {
        this.boundsMode = mode;
        return this;
    }

    recalculateBounds() {
        this.exportBounds = this._calculateBounds();

        if (this.previewBorder && this.exportBounds) {
            this._updateBorderStyle(this.exportBounds);
        }

        return this;
    }

    /**
     * 自动计算格网边界（公开方法，兼容示例代码）
     * @public
     */
    autoCalculateExportBounds() {
        if (!this.boundsCalculator) {
            console.warn('BoundsCalculator 未初始化');
            return null;
        }
        return this.boundsCalculator.calculateGraticuleBounds();
    }

    /**
     * 自动计算所有元素边界（公开方法，兼容示例代码）
     * @public
     */
    autoCalculateAllElementsBounds() {
        if (!this.boundsCalculator) {
            console.warn('BoundsCalculator 未初始化');
            return null;
        }
        return this.boundsCalculator.calculateAllElementsBounds();
    }

    // ==================== 导出配置 ====================

    setFormat(format) {
        this.exportOptions.format = format;
        this.exporter?.setFormat(format);
        return this;
    }

    setQuality(quality) {
        this.exportOptions.quality = quality;
        this.exporter?.setQuality(quality);
        return this;
    }

    setFilename(filename) {
        this.exportOptions.filename = filename;
        this.exporter?.setFilename(filename);
        return this;
    }

    setScale(scale) {
        this.exportOptions.scale = scale;
        this.exporter?.setScale(scale);
        return this;
    }

    // ==================== 辅助方法 ====================

    _hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ==================== 销毁 ====================

    onDestroy() {
        this.hidePreview();
        this.clearWhitelist();
        this.exporter = null;
        this.boundsCalculator = null;
    }
}

// 导出
L.Control.ExportPreview = ExportPreviewControl;

L.control.exportPreview = function (options) {
    const control = new L.Control.ExportPreview(options);
    return control.createControl();
};
