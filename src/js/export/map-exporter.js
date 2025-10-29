/**
 * 地图导出器
 * 负责将地图导出为图片
 * 
 * 依赖: html2canvas, SVGFixer, BoundsCalculator, ExportConfig
 */

L.GISElements = L.GISElements || {};

class MapExporter {
    constructor(map, options = {}) {
        this.map = map;
        this.config = L.GISElements.ExportConfig;

        // 导出配置
        this.format = options.format || this.config.DEFAULTS.FORMAT;
        this.quality = options.quality || this.config.DEFAULTS.QUALITY;
        this.filename = options.filename || this.config.DEFAULTS.FILENAME;
        this.scale = options.scale || this.config.DEFAULTS.SCALE;
        this.backgroundColor = options.backgroundColor || this.config.DEFAULTS.BACKGROUND_COLOR;
        this.includeBasemap = options.includeBasemap !== false;

        // 导出边界(null表示导出整个视口)
        this.exportBounds = null;

        // 白名单
        this.layers = new Set();
        this.uiElements = new Set();

        // 状态
        this.isExporting = false;
        this.loadingOverlay = null;

        // 工具类
        this.svgFixer = new L.GISElements.SVGFixer(map);
        this.boundsCalculator = new L.GISElements.BoundsCalculator(map);
    }

    // ==================== 白名单管理 ====================

    addLayer(layer) {
        this.layers.add(layer);
        return this;
    }

    removeLayer(layer) {
        this.layers.delete(layer);
        return this;
    }

    clearLayers() {
        this.layers.clear();
        return this;
    }

    addUIElement(elementOrSelector) {
        this.uiElements.add(elementOrSelector);
        return this;
    }

    removeUIElement(elementOrSelector) {
        this.uiElements.delete(elementOrSelector);
        return this;
    }

    clearUIElements() {
        this.uiElements.clear();
        return this;
    }

    // ==================== 边界管理 ====================

    setExportBounds(rect) {
        this.exportBounds = rect;
        return this;
    }

    setExportBoundsFromLatLng(latLngBounds) {
        this.exportBounds = latLngBounds
            ? this.boundsCalculator.fromLatLngBounds(latLngBounds)
            : null;
        return this;
    }

    clearExportBounds() {
        this.exportBounds = null;
        return this;
    }

    // ==================== 配置管理 ====================

    setFormat(format) {
        this.format = format;
        return this;
    }

    setQuality(quality) {
        this.quality = Math.max(0, Math.min(1, quality));
        return this;
    }

    setFilename(filename) {
        this.filename = filename;
        return this;
    }

    setScale(scale) {
        this.scale = Math.max(1, scale);
        return this;
    }

    setIncludeBasemap(include) {
        this.includeBasemap = Boolean(include);
        return this;
    }

    configure(config) {
        if (config.format) this.setFormat(config.format);
        if (config.quality !== undefined) this.setQuality(config.quality);
        if (config.filename) this.setFilename(config.filename);
        if (config.scale !== undefined) this.setScale(config.scale);
        if (config.backgroundColor) this.backgroundColor = config.backgroundColor;
        if (config.includeBasemap !== undefined) this.setIncludeBasemap(config.includeBasemap);
        if (config.exportBounds !== undefined) this.setExportBounds(config.exportBounds);
        return this;
    }

    getConfig() {
        return {
            format: this.format,
            quality: this.quality,
            filename: this.filename,
            scale: this.scale,
            backgroundColor: this.backgroundColor,
            includeBasemap: this.includeBasemap,
            exportBounds: this.exportBounds,
            layerCount: this.layers.size,
            uiElementCount: this.uiElements.size
        };
    }

    // ==================== 导出主流程 ====================

    async export() {
        if (this.isExporting) {
            throw new Error('导出正在进行中');
        }

        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas库未加载');
        }

        this.isExporting = true;
        this._showLoading();

        try {
            // 1. 准备环境
            const snapshot = this._prepareEnvironment();

            // 2. 等待渲染
            await this._waitForRender();

            // 3. 截取地图
            const canvas = await this._captureMap();

            // 4. 裁剪
            const finalCanvas = this.exportBounds
                ? this._cropCanvas(canvas, this.exportBounds)
                : canvas;

            // 5. 恢复环境
            this._restoreEnvironment(snapshot);

            // 6. 下载
            this._downloadCanvas(finalCanvas);

            this._log('info', '导出成功');
        } catch (error) {
            this._log('error', '导出失败', error);
            throw error;
        } finally {
            this.isExporting = false;
            this._hideLoading();
        }
    }

    // ==================== 环境准备 ====================

    /**
     * 准备导出环境
     * @private
     */
    _prepareEnvironment() {
        const snapshot = {
            hiddenElements: [],
            removedLayers: [],
            tempLayers: []
        };

        // 隐藏不需要的元素
        this._hideUnwantedElements(snapshot);

        // 管理图层
        this._manageLayers(snapshot);

        return snapshot;
    }

    /**
     * 隐藏不需要的元素
     * @private
     */
    _hideUnwantedElements(snapshot) {
        const mapContainer = this.map.getContainer();
        const allElements = mapContainer.querySelectorAll('*');
        const selectors = this.config.SELECTORS;

        allElements.forEach(el => {
            // 底图处理
            if (!this.includeBasemap && this._isTileElement(el)) {
                this._hideElement(el, snapshot);
                return;
            }

            // 跳过必要的pane和容器
            if (this._isEssentialPane(el)) {
                return;
            }

            // 检查白名单
            if (!this._isWhitelisted(el)) {
                this._hideElement(el, snapshot);
            }
        });

        this._log('info', `隐藏了 ${snapshot.hiddenElements.length} 个元素`);
    }

    /**
     * 管理图层
     * @private
     */
    _manageLayers(snapshot) {
        // 移除不在白名单的图层
        this.map.eachLayer(layer => {
            // 跳过瓦片层和渲染器
            if (layer instanceof L.TileLayer ||
                layer instanceof L.Renderer ||
                this._isRenderer(layer)) {
                return;
            }

            if (!this.layers.has(layer)) {
                this.map.removeLayer(layer);
                snapshot.removedLayers.push(layer);
            }
        });

        // 添加白名单中不在地图上的图层
        this.layers.forEach(layer => {
            if (!this.map.hasLayer(layer)) {
                layer.addTo(this.map);
                snapshot.tempLayers.push(layer);
            }
        });

        this._log('info', `移除 ${snapshot.removedLayers.length} 个图层, 临时添加 ${snapshot.tempLayers.length} 个图层`);
    }

    /**
     * 恢复环境
     * @private
     */
    _restoreEnvironment(snapshot) {
        // 恢复隐藏的元素
        snapshot.hiddenElements.forEach(({ element, display }) => {
            element.style.display = display;
        });

        // 移除临时图层
        snapshot.tempLayers.forEach(layer => {
            this.map.removeLayer(layer);
        });

        // 恢复被移除的图层
        snapshot.removedLayers.forEach(layer => {
            layer.addTo(this.map);
        });
    }

    // ==================== 元素判断辅助方法 ====================

    _isTileElement(el) {
        return el.classList.contains('leaflet-tile-pane') ||
            el.closest('.leaflet-tile-pane');
    }

    _isEssentialPane(el) {
        const essentialPanes = [
            'leaflet-pane',
            'leaflet-layer',
            'leaflet-tile-container',
            'leaflet-overlay-pane',
            'leaflet-shadow-pane',
            'leaflet-marker-pane',
            'leaflet-tooltip-pane',
            'leaflet-popup-pane'
        ];

        return essentialPanes.some(className =>
            el.classList.contains(className) || el.closest(`.${className}`)
        );
    }

    _isRenderer(layer) {
        return (layer._container &&
            (layer._container.tagName === 'svg' ||
                layer._container.tagName === 'CANVAS'));
    }

    _isWhitelisted(element) {
        for (const item of this.uiElements) {
            if (typeof item === 'string') {
                try {
                    if (element.matches(item) || element.closest(item)) {
                        return true;
                    }
                } catch (e) {
                    // 忽略无效选择器
                }
            } else if (item instanceof HTMLElement) {
                if (element === item || element.closest(el => el === item)) {
                    return true;
                }
            }
        }
        return false;
    }

    _hideElement(el, snapshot) {
        if (el.style.display !== 'none') {
            snapshot.hiddenElements.push({
                element: el,
                display: el.style.display
            });
            el.style.display = 'none';
        }
    }

    // ==================== 渲染和截图 ====================

    /**
     * 等待渲染完成
     * @private
     */
    _waitForRender() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(resolve, this.config.RENDER_WAIT_TIME);
                });
            });
        });
    }

    /**
     * 截取地图
     * @private
     */
    async _captureMap() {
        const mapElement = this.map.getContainer();

        const canvas = await html2canvas(mapElement, {
            ...this.config.HTML2CANVAS,
            backgroundColor: this.backgroundColor,
            scale: this.scale,
            onclone: (clonedDoc) => {
                this.svgFixer.fixAll(clonedDoc);
            }
        });

        return canvas;
    }

    /**
     * 裁剪Canvas
     * @private
     */
    _cropCanvas(sourceCanvas, rect) {
        const scale = this.scale;
        const x = Math.max(0, rect.left * scale);
        const y = Math.max(0, rect.top * scale);
        const width = Math.min(sourceCanvas.width - x, rect.width * scale);
        const height = Math.min(sourceCanvas.height - y, rect.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceCanvas, x, y, width, height, 0, 0, width, height);

        return canvas;
    }

    /**
     * 下载Canvas
     * @private
     */
    _downloadCanvas(canvas) {
        const mimeType = this.format === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, this.quality);

        const link = document.createElement('a');
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, -5);
        link.download = `${this.filename}_${timestamp}.${this.format}`;
        link.href = dataUrl;
        link.click();
    }

    // ==================== UI辅助 ====================

    _showLoading() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 8px;
                text-align: center;
                font-family: sans-serif;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <p style="margin: 0; color: #333;">正在导出地图...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;

        this.loadingOverlay = overlay;
        document.body.appendChild(overlay);
    }

    _hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
            this.loadingOverlay = null;
        }
    }

    _log(level, message, data = null) {
        if (!this.config.DEBUG && level === 'info') return;

        const prefix = '[MapExporter]';
        const methods = { info: 'log', warn: 'warn', error: 'error' };
        const method = methods[level] || 'log';

        console[method](prefix, message, data || '');
    }
}

// 导出 (保持向后兼容)
L.GISElements.MapExporter = MapExporter;

