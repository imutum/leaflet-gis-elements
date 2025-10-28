/**
 * 地图导出器（模块化版本）
 * 独立的导出管理器，完全解耦于控件系统
 * 
 * 特点：
 * - 独立于所有控件和地图控制器
 * - 支持动态添加/移除要导出的图层和UI元素
 * - 支持设置导出边界
 * - 只导出明确添加的内容（白名单机制）
 * 
 * 依赖: html2canvas (需在HTML中引入)
 */

class MapExporter {
    constructor(map, options = {}) {
        this.map = map;

        // 导出配置
        this.format = options.format || 'png'; // 'png', 'jpg'
        this.quality = options.quality || 1.0; // 0-1
        this.filename = options.filename || 'map_export';
        this.scale = options.scale || 2; // 导出分辨率倍数
        this.backgroundColor = options.backgroundColor || '#ffffff';

        // 导出边界（null表示导出整个视口）
        this.exportBounds = null;

        // 要导出的图层集合（Leaflet图层对象）
        this.layers = new Set();

        // 要导出的UI元素集合（DOM选择器或元素）
        this.uiElements = new Set();

        // 状态标志
        this.isExporting = false;
        this.loadingOverlay = null;

        // 预览边框配置
        this.previewEnabled = options.previewEnabled !== false; // 是否显示预览边框
        this.previewBorder = null; // 预览边框元素
        this.previewHandles = []; // 预览边框调整控制点
        this.autoCalculateBounds = options.autoCalculateBounds !== false; // 是否自动计算边界

        // 修复配置
        this.fixGraticuleLines = options.fixGraticuleLines !== false; // 是否修复格网线位置
    }

    /**
     * 添加要导出的图层
     * @param {L.Layer} layer - Leaflet图层对象
     */
    addLayer(layer) {
        this.layers.add(layer);
        return this;
    }

    /**
     * 移除导出图层
     * @param {L.Layer} layer - Leaflet图层对象
     */
    removeLayer(layer) {
        this.layers.delete(layer);
        return this;
    }

    /**
     * 清空所有导出图层
     */
    clearLayers() {
        this.layers.clear();
        return this;
    }

    /**
     * 添加要导出的UI元素
     * @param {string|HTMLElement} elementOrSelector - DOM元素或选择器
     */
    addUIElement(elementOrSelector) {
        this.uiElements.add(elementOrSelector);
        return this;
    }

    /**
     * 移除导出的UI元素
     * @param {string|HTMLElement} elementOrSelector - DOM元素或选择器
     */
    removeUIElement(elementOrSelector) {
        this.uiElements.delete(elementOrSelector);
        return this;
    }

    /**
     * 清空所有导出的UI元素
     */
    clearUIElements() {
        this.uiElements.clear();
        return this;
    }

    /**
     * 设置导出边界（像素坐标）
     * @param {Object} rect - {left, top, width, height} 或 null（导出整个视口）
     */
    setExportBounds(rect) {
        this.exportBounds = rect;
        return this;
    }

    /**
     * 设置导出边界（地理坐标）
     * @param {L.LatLngBounds} latLngBounds - Leaflet边界对象
     */
    setExportBoundsFromLatLng(latLngBounds) {
        if (!latLngBounds) {
            this.exportBounds = null;
            return this;
        }

        // 将地理坐标转换为像素坐标
        const nw = this.map.latLngToContainerPoint(latLngBounds.getNorthWest());
        const se = this.map.latLngToContainerPoint(latLngBounds.getSouthEast());

        this.exportBounds = {
            left: nw.x,
            top: nw.y,
            width: se.x - nw.x,
            height: se.y - nw.y
        };

        return this;
    }

    /**
     * 清除导出边界（导出整个视口）
     */
    clearExportBounds() {
        this.exportBounds = null;
        return this;
    }

    /**
     * 设置导出格式
     * @param {string} format - 'png' 或 'jpg'
     */
    setFormat(format) {
        this.format = format;
        return this;
    }

    /**
     * 设置导出质量（仅jpg有效）
     * @param {number} quality - 0-1之间
     */
    setQuality(quality) {
        this.quality = Math.max(0, Math.min(1, quality));
        return this;
    }

    /**
     * 设置导出文件名
     * @param {string} filename - 文件名前缀
     */
    setFilename(filename) {
        this.filename = filename;
        return this;
    }

    /**
     * 设置导出分辨率倍数
     * @param {number} scale - 分辨率倍数（如2表示2倍）
     */
    setScale(scale) {
        this.scale = Math.max(1, scale);
        return this;
    }

    /**
     * 自动计算导出边界（包含格网边框和刻度标签）
     * 导出边界应该包围刻度标签，而刻度标签包围格网边框
     * @returns {Object|null} {left, top, width, height} 或 null
     */
    autoCalculateExportBounds() {
        if (!this.map) return null;

        // 查找所有格网相关元素
        const graticuleFrame = document.querySelector('.graticule-frame');
        const graticuleLabels = document.querySelectorAll('.graticule-label');

        if (!graticuleFrame && graticuleLabels.length === 0) {
            console.warn('未找到格网边框或标签，无法自动计算边界');
            return null;
        }

        const mapContainer = this.map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        // 1. 首先获取格网边框范围（如果有）
        if (graticuleFrame) {
            const frameRect = graticuleFrame.getBoundingClientRect();
            minX = Math.min(minX, frameRect.left - mapRect.left);
            minY = Math.min(minY, frameRect.top - mapRect.top);
            maxX = Math.max(maxX, frameRect.right - mapRect.left);
            maxY = Math.max(maxY, frameRect.bottom - mapRect.top);
        }

        // 2. 然后扩展到包含所有刻度标签（标签在格网边框外围）
        graticuleLabels.forEach(label => {
            const labelRect = label.getBoundingClientRect();
            minX = Math.min(minX, labelRect.left - mapRect.left);
            minY = Math.min(minY, labelRect.top - mapRect.top);
            maxX = Math.max(maxX, labelRect.right - mapRect.left);
            maxY = Math.max(maxY, labelRect.bottom - mapRect.top);
        });

        // 3. 添加外边距（导出边框与刻度标签之间的间距）
        const padding = 10;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // 确保在地图容器范围内
        minX = Math.max(0, minX);
        minY = Math.max(0, minY);
        maxX = Math.min(mapContainer.offsetWidth, maxX);
        maxY = Math.min(mapContainer.offsetHeight, maxY);

        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * 显示预览边框
     */
    showPreviewBorder() {
        // 隐藏已有的预览边框
        this.hidePreviewBorder();

        // 自动计算边界（如果启用）
        if (this.autoCalculateBounds && !this.exportBounds) {
            this.exportBounds = this.autoCalculateExportBounds();
        }

        if (!this.exportBounds) {
            console.warn('没有设置导出边界，无法显示预览');
            return;
        }

        // 创建预览边框
        this.previewBorder = document.createElement('div');
        this.previewBorder.className = 'export-preview-border';
        this.previewBorder.style.position = 'absolute';
        this.previewBorder.style.left = this.exportBounds.left + 'px';
        this.previewBorder.style.top = this.exportBounds.top + 'px';
        this.previewBorder.style.width = this.exportBounds.width + 'px';
        this.previewBorder.style.height = this.exportBounds.height + 'px';
        this.previewBorder.style.border = '2px dashed #ff6b6b';
        this.previewBorder.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
        this.previewBorder.style.boxSizing = 'border-box';
        this.previewBorder.style.pointerEvents = 'auto';
        this.previewBorder.style.zIndex = '500';
        this.previewBorder.style.cursor = 'move';

        // 添加到地图容器
        this.map.getContainer().appendChild(this.previewBorder);

        // 添加提示文本
        const hint = document.createElement('div');
        hint.className = 'export-preview-hint';
        hint.innerHTML = '导出边框（包围刻度，可拖动调整）';
        hint.style.position = 'absolute';
        hint.style.top = '-25px';
        hint.style.left = '0';
        hint.style.background = '#ff6b6b';
        hint.style.color = '#fff';
        hint.style.padding = '2px 8px';
        hint.style.fontSize = '12px';
        hint.style.borderRadius = '3px';
        hint.style.whiteSpace = 'nowrap';
        this.previewBorder.appendChild(hint);

        // 使预览边框可拖动
        this._makePreviewBorderDraggable();

        // 添加调整大小的控制点
        this._addPreviewResizeHandles();

        return this;
    }

    /**
     * 隐藏预览边框
     */
    hidePreviewBorder() {
        if (this.previewBorder) {
            if (this.previewBorder.parentNode) {
                this.previewBorder.parentNode.removeChild(this.previewBorder);
            }
            this.previewBorder = null;
        }

        // 移除所有调整控制点
        this.previewHandles.forEach(handle => {
            if (handle.parentNode) {
                handle.parentNode.removeChild(handle);
            }
        });
        this.previewHandles = [];

        return this;
    }

    /**
     * 使预览边框可拖动
     * @private
     */
    _makePreviewBorderDraggable() {
        if (!this.previewBorder) return;

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            this.exportBounds.left = startLeft + deltaX;
            this.exportBounds.top = startTop + deltaY;

            // 更新预览边框位置
            this.previewBorder.style.left = this.exportBounds.left + 'px';
            this.previewBorder.style.top = this.exportBounds.top + 'px';

            // 更新控制点位置
            this._updatePreviewHandles();

            e.preventDefault();
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                this.previewBorder.style.opacity = '1';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        };

        const onMouseDown = (e) => {
            // 不干扰调整大小控制点
            if (e.target.classList.contains('export-preview-handle')) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = this.exportBounds.left;
            startTop = this.exportBounds.top;

            this.previewBorder.style.opacity = '0.7';

            e.stopPropagation();
            e.preventDefault();

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        this.previewBorder.addEventListener('mousedown', onMouseDown);
    }

    /**
     * 添加预览边框的调整控制点
     * @private
     */
    _addPreviewResizeHandles() {
        const corners = [
            { position: 'topleft', x: 0, y: 0 },
            { position: 'topright', x: 1, y: 0 },
            { position: 'bottomleft', x: 0, y: 1 },
            { position: 'bottomright', x: 1, y: 1 }
        ];

        corners.forEach(corner => {
            const handle = document.createElement('div');
            handle.className = 'export-preview-handle export-preview-handle-' + corner.position;
            handle.style.position = 'absolute';
            handle.style.width = '12px';
            handle.style.height = '12px';
            handle.style.background = '#fff';
            handle.style.border = '2px solid #ff6b6b';
            handle.style.borderRadius = '50%';
            handle.style.cursor = corner.position.includes('topleft') || corner.position.includes('bottomright') ? 'nwse-resize' : 'nesw-resize';
            handle.style.zIndex = '501';

            // 计算控制点位置
            const left = this.exportBounds.left + corner.x * this.exportBounds.width - 6;
            const top = this.exportBounds.top + corner.y * this.exportBounds.height - 6;
            handle.style.left = left + 'px';
            handle.style.top = top + 'px';

            this.map.getContainer().appendChild(handle);
            this._makePreviewHandleDraggable(handle, corner);
            this.previewHandles.push(handle);
        });
    }

    /**
     * 使预览控制点可拖动
     * @private
     */
    _makePreviewHandleDraggable(handle, corner) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startBounds = null;

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // 根据拖动的角点更新边框
            if (corner.position === 'topleft') {
                this.exportBounds.left = startBounds.left + deltaX;
                this.exportBounds.top = startBounds.top + deltaY;
                this.exportBounds.width = startBounds.width - deltaX;
                this.exportBounds.height = startBounds.height - deltaY;
            } else if (corner.position === 'topright') {
                this.exportBounds.top = startBounds.top + deltaY;
                this.exportBounds.width = startBounds.width + deltaX;
                this.exportBounds.height = startBounds.height - deltaY;
            } else if (corner.position === 'bottomleft') {
                this.exportBounds.left = startBounds.left + deltaX;
                this.exportBounds.width = startBounds.width - deltaX;
                this.exportBounds.height = startBounds.height + deltaY;
            } else if (corner.position === 'bottomright') {
                this.exportBounds.width = startBounds.width + deltaX;
                this.exportBounds.height = startBounds.height + deltaY;
            }

            // 确保最小尺寸
            if (this.exportBounds.width < 100) {
                this.exportBounds.width = 100;
                if (corner.position.includes('left')) {
                    this.exportBounds.left = startBounds.left + startBounds.width - 100;
                }
            }
            if (this.exportBounds.height < 100) {
                this.exportBounds.height = 100;
                if (corner.position.includes('top')) {
                    this.exportBounds.top = startBounds.top + startBounds.height - 100;
                }
            }

            // 更新预览边框
            this.previewBorder.style.left = this.exportBounds.left + 'px';
            this.previewBorder.style.top = this.exportBounds.top + 'px';
            this.previewBorder.style.width = this.exportBounds.width + 'px';
            this.previewBorder.style.height = this.exportBounds.height + 'px';

            // 更新控制点位置
            this._updatePreviewHandles();

            e.preventDefault();
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                handle.style.transform = 'scale(1)';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        };

        const onMouseDown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startBounds = { ...this.exportBounds };

            handle.style.transform = 'scale(1.3)';
            handle.style.transition = 'transform 0.1s';

            e.stopPropagation();
            e.preventDefault();

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        handle.addEventListener('mousedown', onMouseDown);
    }

    /**
     * 更新预览控制点位置
     * @private
     */
    _updatePreviewHandles() {
        const positions = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 }
        ];

        this.previewHandles.forEach((handle, index) => {
            const pos = positions[index];
            const left = this.exportBounds.left + pos.x * this.exportBounds.width - 6;
            const top = this.exportBounds.top + pos.y * this.exportBounds.height - 6;
            handle.style.left = left + 'px';
            handle.style.top = top + 'px';
        });
    }

    /**
     * 执行导出
     * @returns {Promise<void>}
     */
    async export() {
        if (this.isExporting) {
            console.warn('导出正在进行中...');
            return;
        }

        // 检查html2canvas是否可用
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas库未加载。请在HTML中引入：\n<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>');
        }

        // 自动计算边界（如果启用且没有设置边界）
        if (this.autoCalculateBounds && !this.exportBounds) {
            this.exportBounds = this.autoCalculateExportBounds();
            console.log('自动计算的导出边界:', this.exportBounds);
        }

        this.isExporting = true;

        // 隐藏预览边框（导出时不需要）
        const hadPreview = !!this.previewBorder;
        this.hidePreviewBorder();

        this._showLoading();

        try {
            // 1. 准备导出环境（隐藏不需要的元素）
            const hiddenElements = this._prepareExportEnvironment();

            // 2. 等待渲染完成
            await this._waitForRender();

            // 3. 截取地图
            const canvas = await this._captureMap();

            // 4. 裁剪到指定区域
            const finalCanvas = this.exportBounds ?
                this._cropCanvas(canvas, this.exportBounds) : canvas;

            // 5. 恢复环境
            this._restoreEnvironment(hiddenElements);

            // 6. 下载图片
            this._downloadCanvas(finalCanvas);

            console.log('地图导出成功');
        } catch (error) {
            console.error('导出失败:', error);
            throw error;
        } finally {
            this.isExporting = false;
            this._hideLoading();
        }
    }

    /**
     * 准备导出环境
     * @private
     */
    _prepareExportEnvironment() {
        const hidden = [];

        // 隐藏地图容器中的所有元素
        const mapContainer = this.map.getContainer();
        const allElements = mapContainer.querySelectorAll('*');

        allElements.forEach(el => {
            // 跳过地图瓦片和基础容器
            if (el.classList.contains('leaflet-tile-container') ||
                el.classList.contains('leaflet-pane') ||
                el.classList.contains('leaflet-layer') ||
                el.closest('.leaflet-tile-container') ||
                el.closest('.leaflet-pane')) {
                return;
            }

            // 检查是否在白名单中
            const isWhitelisted = this._isElementWhitelisted(el);

            if (!isWhitelisted && el.style.display !== 'none') {
                hidden.push({
                    element: el,
                    display: el.style.display
                });
                el.style.display = 'none';
            }
        });

        // 临时添加要导出的图层（如果不在地图上）
        const tempLayers = [];
        this.layers.forEach(layer => {
            if (!this.map.hasLayer(layer)) {
                layer.addTo(this.map);
                tempLayers.push(layer);
            }
        });

        return { hidden, tempLayers };
    }

    /**
     * 检查元素是否在白名单中
     * @private
     */
    _isElementWhitelisted(element) {
        // 自动包含格网标签（无论是否在白名单中）
        if (element.classList.contains('graticule-label') ||
            element.closest('.graticule-label')) {
            return true;
        }

        // 检查是否匹配白名单中的任何选择器或元素
        for (const item of this.uiElements) {
            if (typeof item === 'string') {
                // 选择器
                if (element.matches(item) || element.closest(item)) {
                    return true;
                }
            } else if (item instanceof HTMLElement) {
                // 直接元素比较
                if (element === item || element.closest((el) => el === item)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 恢复导出环境
     * @private
     */
    _restoreEnvironment({ hidden, tempLayers }) {
        // 恢复隐藏的元素
        hidden.forEach(item => {
            item.element.style.display = item.display;
        });

        // 移除临时添加的图层
        tempLayers.forEach(layer => {
            this.map.removeLayer(layer);
        });
    }

    /**
     * 等待渲染完成
     * @private
     */
    _waitForRender() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(resolve, 200);
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
            useCORS: true,
            allowTaint: false,
            backgroundColor: this.backgroundColor,
            scale: this.scale,
            logging: false,
            imageTimeout: 0,
            removeContainer: false,
            onclone: (clonedDoc, clonedElement) => {
                this._fixClonedElements(clonedDoc, clonedElement);
            }
        });

        return canvas;
    }

    /**
     * 修复克隆文档中的元素
     * @private
     */
    _fixClonedElements(clonedDoc, clonedElement) {
        // 修复格网标签位置（如果有）
        this._fixGraticuleLabels(clonedDoc);

        // 修复格网线位置（如果启用）
        if (this.fixGraticuleLines) {
            this._fixGraticuleLines(clonedDoc);
        } else {
            console.log('[格网线修复] 已禁用格网线位置修复');
        }

        // 修复SVG样式
        this._fixSVGStyles(clonedDoc);

        // 修复其他可能的样式问题
        this._fixTransforms(clonedDoc);
    }

    /**
     * 修复格网标签位置
     * @private
     */
    _fixGraticuleLabels(clonedDoc) {
        const originalLabels = document.querySelectorAll('.graticule-label');
        const clonedLabels = clonedDoc.querySelectorAll('.graticule-label');

        if (originalLabels.length === 0) return;

        const mapContainer = this.map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        originalLabels.forEach((originalLabel, index) => {
            if (index >= clonedLabels.length) return;

            const clonedLabel = clonedLabels[index];
            const clonedSpan = clonedLabel.querySelector('span');
            const originalSpan = originalLabel.querySelector('span');

            if (!clonedSpan || !originalSpan) return;

            // 获取原始标签的最终渲染位置
            const originalSpanRect = originalSpan.getBoundingClientRect();

            // 计算相对于地图容器的位置
            const spanLeftInMap = originalSpanRect.left - mapRect.left;
            const spanTopInMap = originalSpanRect.top - mapRect.top;

            // 转换为绝对定位
            clonedLabel.style.transform = 'none';
            clonedLabel.style.left = `${spanLeftInMap}px`;
            clonedLabel.style.top = `${spanTopInMap}px`;

            clonedSpan.style.transform = 'none';
            clonedSpan.style.position = 'static';
            clonedSpan.style.margin = '0';
        });
    }

    /**
     * 修复格网线位置
     * @private
     */
    _fixGraticuleLines(clonedDoc) {
        // html2canvas 对 Leaflet 的 transform 处理有问题
        // 策略：解析原始 overlay-pane 的 transform，计算 SVG 的最终位置

        const mapContainer = this.map.getContainer();
        const originalOverlayPane = mapContainer.querySelector('.leaflet-overlay-pane');
        const clonedOverlayPane = clonedDoc.querySelector('.leaflet-overlay-pane');

        if (!originalOverlayPane || !clonedOverlayPane) {
            console.log('[格网线修复] 未找到 overlay pane');
            return;
        }

        const originalSvg = originalOverlayPane.querySelector('svg');
        const clonedSvg = clonedOverlayPane.querySelector('svg');

        if (!originalSvg || !clonedSvg) {
            console.log('[格网线修复] 未找到 SVG 元素');
            return;
        }

        // 获取 overlay-pane 的 transform 偏移量
        const originalOverlayPaneStyle = window.getComputedStyle(originalOverlayPane);
        let transformOffsetX = 0;
        let transformOffsetY = 0;

        if (originalOverlayPaneStyle.transform && originalOverlayPaneStyle.transform !== 'none') {
            // 解析 transform matrix 或 translate3d
            const transform = originalOverlayPaneStyle.transform;
            console.log('[格网线修复] overlay-pane transform:', transform);

            // 尝试解析 matrix 或 matrix3d
            const matrixMatch = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
            if (matrixMatch) {
                const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
                if (values.length === 6) {
                    // 2D matrix: matrix(a, b, c, d, tx, ty)
                    transformOffsetX = values[4];
                    transformOffsetY = values[5];
                } else if (values.length === 16) {
                    // 3D matrix: matrix3d(...)
                    transformOffsetX = values[12];
                    transformOffsetY = values[13];
                }
            }
        }

        console.log('[格网线修复] overlay-pane transform 偏移:', {
            x: transformOffsetX,
            y: transformOffsetY
        });

        // 获取 SVG 的原始位置（style属性，不包含transform）
        const svgStyleLeft = parseFloat(originalSvg.style.left) || 0;
        const svgStyleTop = parseFloat(originalSvg.style.top) || 0;

        console.log('[格网线修复] SVG 原始位置:', {
            left: svgStyleLeft,
            top: svgStyleTop
        });

        // 计算 SVG 的最终绝对位置 = 原始位置 + overlay-pane transform 偏移
        const finalLeft = svgStyleLeft + transformOffsetX;
        const finalTop = svgStyleTop + transformOffsetY;

        console.log('[格网线修复] SVG 计算的最终位置:', {
            left: finalLeft,
            top: finalTop
        });

        // 清除 overlay-pane 的 transform
        clonedOverlayPane.style.transform = 'none';
        clonedOverlayPane.style.webkitTransform = 'none';
        clonedOverlayPane.style.msTransform = 'none';

        // 设置克隆 SVG 的位置（使用计算出的最终位置）
        clonedSvg.style.position = 'absolute';
        clonedSvg.style.left = `${finalLeft}px`;
        clonedSvg.style.top = `${finalTop}px`;
        clonedSvg.style.transform = 'none';
        clonedSvg.style.webkitTransform = 'none';
        clonedSvg.style.msTransform = 'none';
        clonedSvg.style.transformOrigin = 'none';

        // 同步尺寸属性
        if (originalSvg.hasAttribute('width')) {
            clonedSvg.setAttribute('width', originalSvg.getAttribute('width'));
        }
        if (originalSvg.hasAttribute('height')) {
            clonedSvg.setAttribute('height', originalSvg.getAttribute('height'));
        }
        if (originalSvg.hasAttribute('viewBox')) {
            clonedSvg.setAttribute('viewBox', originalSvg.getAttribute('viewBox'));
        }

        console.log('[格网线修复] 完成，最终应用位置:', {
            left: finalLeft,
            top: finalTop
        });
    }

    /**
     * 修复SVG样式
     * @private
     */
    _fixSVGStyles(clonedDoc) {
        const svgElements = clonedDoc.querySelectorAll('svg path, svg rect, svg circle, svg line');

        svgElements.forEach(clonedElement => {
            const tagName = clonedElement.tagName.toLowerCase();
            const selector = `${tagName}[d="${clonedElement.getAttribute('d') || ''}"]`;

            const originalElement = document.querySelector(selector) ||
                Array.from(document.querySelectorAll(tagName))
                    .find(el => {
                        const attrs = ['d', 'x', 'y', 'width', 'height', 'cx', 'cy', 'r'];
                        return attrs.every(attr =>
                            el.getAttribute(attr) === clonedElement.getAttribute(attr)
                        );
                    });

            if (originalElement) {
                const computedStyle = window.getComputedStyle(originalElement);
                ['stroke', 'strokeWidth', 'strokeOpacity', 'fill', 'fillOpacity'].forEach(prop => {
                    const value = computedStyle[prop];
                    if (value && value !== 'none') {
                        clonedElement.style[prop] = value;
                    }
                });
            }
        });
    }

    /**
     * 修复transform相关问题
     * @private
     */
    _fixTransforms(clonedDoc) {
        // html2canvas对某些transform支持不好，这里可以添加额外的修复逻辑
        // 目前主要在 _fixGraticuleLabels 中处理
    }

    /**
     * 裁剪Canvas
     * @private
     */
    _cropCanvas(sourceCanvas, rect) {
        if (!rect) return sourceCanvas;

        // 考虑scale因子
        const scale = this.scale;

        const x = Math.max(0, rect.left * scale);
        const y = Math.max(0, rect.top * scale);
        const width = Math.min(sourceCanvas.width - x, rect.width * scale);
        const height = Math.min(sourceCanvas.height - y, rect.height * scale);

        // 创建新Canvas
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;

        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(
            sourceCanvas,
            x, y, width, height,
            0, 0, width, height
        );

        return croppedCanvas;
    }

    /**
     * 下载Canvas
     * @private
     */
    _downloadCanvas(canvas) {
        const mimeType = this.format === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, this.quality);

        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `${this.filename}_${timestamp}.${this.format}`;
        link.href = dataUrl;
        link.click();
    }

    /**
     * 显示加载提示
     * @private
     */
    _showLoading() {
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'export-loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="export-loading-content">
                <div class="export-spinner"></div>
                <p>正在导出地图...</p>
            </div>
        `;
        document.body.appendChild(this.loadingOverlay);
    }

    /**
     * 隐藏加载提示
     * @private
     */
    _hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
            this.loadingOverlay = null;
        }
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        return {
            format: this.format,
            quality: this.quality,
            filename: this.filename,
            scale: this.scale,
            backgroundColor: this.backgroundColor,
            exportBounds: this.exportBounds,
            previewEnabled: this.previewEnabled,
            autoCalculateBounds: this.autoCalculateBounds,
            layerCount: this.layers.size,
            uiElementCount: this.uiElements.size
        };
    }

    /**
     * 批量配置
     * @param {Object} config - 配置对象
     */
    configure(config) {
        if (config.format) this.setFormat(config.format);
        if (config.quality !== undefined) this.setQuality(config.quality);
        if (config.filename) this.setFilename(config.filename);
        if (config.scale !== undefined) this.setScale(config.scale);
        if (config.backgroundColor) this.backgroundColor = config.backgroundColor;
        if (config.exportBounds !== undefined) this.setExportBounds(config.exportBounds);
        if (config.previewEnabled !== undefined) this.previewEnabled = config.previewEnabled;
        if (config.autoCalculateBounds !== undefined) this.autoCalculateBounds = config.autoCalculateBounds;
        return this;
    }

    /**
     * 启用自动计算边界
     */
    enableAutoCalculate() {
        this.autoCalculateBounds = true;
        return this;
    }

    /**
     * 禁用自动计算边界
     */
    disableAutoCalculate() {
        this.autoCalculateBounds = false;
        return this;
    }

    /**
     * 启用预览边框
     */
    enablePreview() {
        this.previewEnabled = true;
        return this;
    }

    /**
     * 禁用预览边框
     */
    disablePreview() {
        this.previewEnabled = false;
        return this;
    }
}

