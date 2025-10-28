/**
 * 地图导出控件
 * 支持将专题图保存为图片，可选择导出区域和包含的元素
 * 
 * 依赖: html2canvas (需在HTML中引入)
 */

class ExportControl extends BaseMapControl {
    constructor(options = {}) {
        super({
            position: options.position || 'topright',
            draggable: false,
            storageKey: null // 导出控件不需要保存位置
        });

        // 导出配置
        this.exportArea = options.exportArea || 'graticule'; // 'graticule', 'viewport', 'auto'
        this.format = options.format || 'png'; // 'png', 'jpg'
        this.quality = options.quality || 1.0; // 0-1
        this.filename = options.filename || 'thematic_map';

        // 要排除的元素选择器
        this.excludeSelectors = options.excludeSelectors || [
            '.leaflet-control-zoom',      // 缩放栏
            '.control-panel',              // 设置面板
            '.toggle-panel',               // 切换按钮
            '.leaflet-control-attribution', // 版权信息
            '.leaflet-control-export'      // 导出按钮自身
        ];

        // 要包含的控件（即使在排除区域外）- 白名单
        this.includeControls = options.includeControls || [
            '.leaflet-control-legend',      // 图例
            '.leaflet-control-scale-bar',   // 比例尺
            '.leaflet-control-north-arrow',  // 指北针
            '.leaflet-control-graticule',   // 格网拖动框
            '.graticule-frame',             // 格网边框
            '.graticule-label'              // 格网标签
        ];

        this.isExporting = false;

        // 预览边框
        this.previewBorder = null;
        this.previewBounds = null; // 用于保存预览边界

        // 拖动和调整大小管理器
        this.previewDraggableManager = null;
        this.previewResizableManager = null;
    }

    /**
     * 获取容器类名
     */
    getContainerClass() {
        return 'leaflet-control-export';
    }

    /**
     * 渲染控件
     */
    render() {
        this.container.innerHTML = `
            <div class="export-buttons">
                <button class="export-preview-button" title="显示导出预览">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="4 4"></rect>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
                <button class="export-button" title="导出地图">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
            </div>
        `;

        // 绑定点击事件
        const exportButton = this.container.querySelector('.export-button');
        exportButton.addEventListener('click', () => this.export());

        const previewButton = this.container.querySelector('.export-preview-button');
        previewButton.addEventListener('click', () => this.togglePreview());

        return this.container;
    }

    /**
     * 切换预览边框
     */
    togglePreview() {
        if (this.previewBorder) {
            this._hidePreviewBorder();
            const button = this.container.querySelector('.export-preview-button');
            if (button) {
                button.style.backgroundColor = '';
                button.style.color = '';
            }
        } else {
            this._showPreviewBorder();
            const button = this.container.querySelector('.export-preview-button');
            if (button) {
                button.style.backgroundColor = '#ff6b6b';
                button.style.color = '#fff';
            }
        }
    }

    /**
     * 显示预览边框
     * @private
     */
    _showPreviewBorder() {
        // 计算导出边界
        const bounds = this._autoCalculateExportBounds();
        if (!bounds) {
            console.warn('无法计算导出边界');
            return;
        }

        this.previewBounds = bounds;

        // 使用常量获取配置
        const borderColor = window.Constants ? window.Constants.COLORS.PREVIEW_BORDER : '#ff6b6b';
        const zIndex = window.Constants ? window.Constants.Z_INDEX.EXPORT_PREVIEW : 500;

        // 创建预览边框
        this.previewBorder = document.createElement('div');
        this.previewBorder.className = 'export-preview-border';
        this.previewBorder.style.position = 'absolute';
        this.previewBorder.style.left = bounds.left + 'px';
        this.previewBorder.style.top = bounds.top + 'px';
        this.previewBorder.style.width = bounds.width + 'px';
        this.previewBorder.style.height = bounds.height + 'px';
        this.previewBorder.style.border = `2px dashed ${borderColor}`;
        this.previewBorder.style.backgroundColor = `rgba(255, 107, 107, 0.1)`;
        this.previewBorder.style.boxSizing = 'border-box';
        this.previewBorder.style.pointerEvents = 'auto';
        this.previewBorder.style.zIndex = zIndex.toString();
        this.previewBorder.style.cursor = 'move';

        // 添加提示文本
        const hint = document.createElement('div');
        hint.innerHTML = '📦 导出预览（可拖动调整大小）';
        hint.style.position = 'absolute';
        hint.style.top = '-28px';
        hint.style.left = '0';
        hint.style.background = borderColor;
        hint.style.color = '#fff';
        hint.style.padding = '4px 10px';
        hint.style.fontSize = '12px';
        hint.style.borderRadius = '4px';
        hint.style.whiteSpace = 'nowrap';
        hint.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        hint.style.fontWeight = '500';
        this.previewBorder.appendChild(hint);

        // 添加到地图容器
        this.map.getContainer().appendChild(this.previewBorder);

        // 使用 DraggableManager 添加拖动功能
        if (window.DraggableManager) {
            this.previewDraggableManager = new DraggableManager(this.previewBorder, {
                threshold: window.Constants ? window.Constants.DRAG_THRESHOLD : 5,
                onDragStart: () => {
                    this.previewBorder.style.opacity = '0.7';
                },
                onDragging: (delta) => {
                    this.previewBounds.left = parseInt(this.previewBorder.style.left) || 0;
                    this.previewBounds.top = parseInt(this.previewBorder.style.top) || 0;
                    this.previewBounds.left += delta.x;
                    this.previewBounds.top += delta.y;

                    this.previewBorder.style.left = this.previewBounds.left + 'px';
                    this.previewBorder.style.top = this.previewBounds.top + 'px';

                    // 更新调整大小控制点位置
                    if (this.previewResizableManager) {
                        this.previewResizableManager.updateHandlePositions();
                    }
                },
                onDragEnd: () => {
                    this.previewBorder.style.opacity = '1';
                }
            });
            this.previewDraggableManager.enable();
        }

        // 使用 ResizableManager 添加调整大小功能
        if (window.ResizableManager) {
            const minSize = window.Constants ? window.Constants.MIN_FRAME_WIDTH : 100;

            this.previewResizableManager = new ResizableManager(this.previewBorder, {
                minWidth: minSize,
                minHeight: minSize,
                handleColor: borderColor,
                onResizeStart: () => {
                    // 添加调整大小视觉反馈
                    this.previewBorder.style.opacity = '0.7';
                },
                onResizing: () => {
                    // 从元素样式更新 previewBounds
                    this.previewBounds.left = parseInt(this.previewBorder.style.left) || 0;
                    this.previewBounds.top = parseInt(this.previewBorder.style.top) || 0;
                    this.previewBounds.width = parseInt(this.previewBorder.style.width) || this.previewBorder.offsetWidth;
                    this.previewBounds.height = parseInt(this.previewBorder.style.height) || this.previewBorder.offsetHeight;
                },
                onResizeEnd: () => {
                    // 恢复视觉反馈
                    this.previewBorder.style.opacity = '1';
                },
                getBounds: () => this.previewBounds,
                setBounds: (bounds) => {
                    this.previewBounds = bounds;
                    this.previewBorder.style.left = bounds.left + 'px';
                    this.previewBorder.style.top = bounds.top + 'px';
                    this.previewBorder.style.width = bounds.width + 'px';
                    this.previewBorder.style.height = bounds.height + 'px';
                }
            });
            this.previewResizableManager.enable();
        }
    }

    /**
     * 隐藏预览边框
     * @private
     */
    _hidePreviewBorder() {
        // 清理拖动管理器
        if (this.previewDraggableManager) {
            this.previewDraggableManager.destroy();
            this.previewDraggableManager = null;
        }

        // 清理调整大小管理器
        if (this.previewResizableManager) {
            this.previewResizableManager.destroy();
            this.previewResizableManager = null;
        }

        // 移除预览边框
        if (this.previewBorder) {
            if (this.previewBorder.parentNode) {
                this.previewBorder.parentNode.removeChild(this.previewBorder);
            }
            this.previewBorder = null;
        }
    }

    /**
     * 计算格网范围边界
     * @private
     */
    _calculateGraticuleBounds() {
        if (!this.map) return null;

        const mapContainer = this.map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        // 查找所有格网相关元素
        const graticuleFrame = document.querySelector('.graticule-frame');
        const graticuleLabels = document.querySelectorAll('.graticule-label');

        if (!graticuleFrame && graticuleLabels.length === 0) {
            console.warn('[格网范围] 未找到格网元素');
            return null;
        }

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        // 如果有边框，使用边框作为基础
        if (graticuleFrame) {
            const frameRect = graticuleFrame.getBoundingClientRect();
            minX = Math.min(minX, frameRect.left - mapRect.left);
            minY = Math.min(minY, frameRect.top - mapRect.top);
            maxX = Math.max(maxX, frameRect.right - mapRect.left);
            maxY = Math.max(maxY, frameRect.bottom - mapRect.top);
        }

        // 扩展到包含所有标签
        graticuleLabels.forEach(label => {
            const labelRect = label.getBoundingClientRect();
            minX = Math.min(minX, labelRect.left - mapRect.left);
            minY = Math.min(minY, labelRect.top - mapRect.top);
            maxX = Math.max(maxX, labelRect.right - mapRect.left);
            maxY = Math.max(maxY, labelRect.bottom - mapRect.top);
        });

        // 添加边距
        const padding = 10;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(mapContainer.offsetWidth, maxX + padding);
        maxY = Math.min(mapContainer.offsetHeight, maxY + padding);

        console.log(`[格网范围] left=${minX.toFixed(0)}, top=${minY.toFixed(0)}, width=${(maxX - minX).toFixed(0)}, height=${(maxY - minY).toFixed(0)}`);

        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * 计算视口范围边界（整个地图容器）
     * @private
     */
    _calculateViewportBounds() {
        if (!this.map) return null;

        const mapContainer = this.map.getContainer();
        console.log('[视口范围] 使用整个视口');

        return {
            left: 0,
            top: 0,
            width: mapContainer.offsetWidth,
            height: mapContainer.offsetHeight
        };
    }

    /**
     * 自动计算包含所有要素的范围边界
     * 包含格网边框、格网标签以及所有白名单控件（图例、指北针、比例尺等）
     * @private
     */
    _calculateAutoElementsBounds() {
        if (!this.map) return null;

        const mapContainer = this.map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        let hasElements = false;
        let elementCount = 0;

        console.log('[自动范围] 开始计算包含所有要素的范围');
        console.log(`[自动范围] 白名单控件: ${this.includeControls.join(', ')}`);

        // 遍历所有白名单控件（已包含格网边框和标签）
        this.includeControls.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && element.offsetParent !== null) { // 确保元素可见
                    const rect = element.getBoundingClientRect();
                    const relativeRect = {
                        left: rect.left - mapRect.left,
                        top: rect.top - mapRect.top,
                        right: rect.right - mapRect.left,
                        bottom: rect.bottom - mapRect.top
                    };

                    minX = Math.min(minX, relativeRect.left);
                    minY = Math.min(minY, relativeRect.top);
                    maxX = Math.max(maxX, relativeRect.right);
                    maxY = Math.max(maxY, relativeRect.bottom);
                    hasElements = true;
                    elementCount++;

                    console.log(`[自动范围] 控件 ${selector}: left=${relativeRect.left.toFixed(1)}, top=${relativeRect.top.toFixed(1)}, right=${relativeRect.right.toFixed(1)}, bottom=${relativeRect.bottom.toFixed(1)}`);
                }
            });
        });

        console.log(`[自动范围] 共找到 ${elementCount} 个可见控件`);

        if (!hasElements) {
            console.warn('[自动范围] 未找到任何可见要素，使用整个视口');
            return this._calculateViewportBounds();
        }

        // 添加边距
        const padding = 20;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(mapContainer.offsetWidth, maxX + padding);
        maxY = Math.min(mapContainer.offsetHeight, maxY + padding);

        const result = {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };

        console.log(`[自动范围] 最终计算结果: left=${result.left.toFixed(0)}, top=${result.top.toFixed(0)}, width=${result.width.toFixed(0)}, height=${result.height.toFixed(0)}`);

        return result;
    }

    /**
     * 根据导出区域类型计算边界
     * @private
     */
    _autoCalculateExportBounds() {
        console.log(`[导出边界] 计算导出范围，类型: ${this.exportArea}`);

        if (this.exportArea === 'graticule') {
            return this._calculateGraticuleBounds();
        } else if (this.exportArea === 'viewport') {
            return this._calculateViewportBounds();
        } else if (this.exportArea === 'auto') {
            return this._calculateAutoElementsBounds();
        }

        // 默认使用格网范围
        return this._calculateGraticuleBounds();
    }


    /**
     * 导出地图
     */
    async export() {
        if (this.isExporting) {
            console.warn('导出正在进行中...');
            return;
        }

        // 检查html2canvas是否可用
        if (typeof html2canvas === 'undefined') {
            alert('错误：html2canvas库未加载。请在HTML中引入：\n<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>');
            return;
        }

        this.isExporting = true;

        // 隐藏预览边框（导出时不需要）
        const hadPreview = !!this.previewBorder;
        if (hadPreview) {
            this._hidePreviewBorder();
        }

        this._showLoading();

        try {
            // 1. 获取导出区域（优先使用预览边界）
            const exportBounds = this._getExportBounds();

            // 2. 临时隐藏不需要的元素
            const hiddenElements = this._hideExcludedElements();

            // 3. 等待地图渲染完成
            await this._waitForMapRender();

            // 4. 截取地图
            const canvas = await this._captureMap();

            // 5. 如果需要裁剪到特定区域
            const finalCanvas = exportBounds ?
                this._cropCanvas(canvas, exportBounds) : canvas;

            // 6. 恢复隐藏的元素
            this._restoreElements(hiddenElements);

            // 7. 下载图片
            this._downloadCanvas(finalCanvas);

            console.log('地图导出成功');
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败: ' + error.message);
        } finally {
            this.isExporting = false;
            this._hideLoading();
        }
    }

    /**
     * 获取导出区域的边界
     */
    _getExportBounds() {
        // 优先使用预览边界（如果已设置）
        if (this.previewBounds) {
            console.log('[导出边界] 使用预览边界');
            return this.previewBounds;
        }

        // 根据导出区域类型计算边界
        return this._autoCalculateExportBounds();
    }

    /**
     * 临时隐藏排除的元素
     */
    _hideExcludedElements() {
        const hidden = [];

        this.excludeSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.style.display !== 'none') {
                    hidden.push({
                        element: el,
                        display: el.style.display
                    });
                    el.style.display = 'none';
                }
            });
        });

        return hidden;
    }

    /**
     * 恢复隐藏的元素
     */
    _restoreElements(hiddenElements) {
        hiddenElements.forEach(item => {
            item.element.style.display = item.display;
        });
    }

    /**
     * 等待地图渲染完成
     */
    _waitForMapRender() {
        return new Promise(resolve => {
            // 强制浏览器完成布局和绘制
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // 额外等待以确保所有元素都已正确定位
                    setTimeout(resolve, 200);
                });
            });
        });
    }

    /**
     * 截取地图
     */
    async _captureMap() {
        const mapElement = this.map.getContainer();

        const canvas = await html2canvas(mapElement, {
            useCORS: true,              // 允许跨域图片
            allowTaint: false,          // 不允许污染画布
            backgroundColor: '#ffffff', // 背景色
            scale: 2,                   // 提高分辨率（2倍）
            logging: false,             // 关闭日志（可改为true进行调试）
            imageTimeout: 0,            // 图片加载超时
            removeContainer: false,     // 不移除容器
            ignoreElements: (element) => {
                // 忽略调整大小的控制点（在导出时不需要）
                if (element.classList && element.classList.contains('resize-handle')) {
                    return true;
                }
                return false;
            },
            onclone: (clonedDoc, clonedElement) => {
                // 修复格网线（SVG路径）位置
                this._fixGraticuleLinesInClone(clonedDoc, clonedElement);
            }
        });

        return canvas;
    }

    /**
     * 修复克隆文档中格网线（SVG路径）的位置
     * Leaflet的SVG路径在overlay-pane中，使用transform定位
     * html2canvas无法正确处理这些transform，需要手动修复
     */
    _fixGraticuleLinesInClone(clonedDoc, clonedElement) {
        // 查找原始和克隆的overlay-pane
        const originalOverlayPane = this.map.getPane('overlayPane');
        const clonedOverlayPane = clonedDoc.querySelector('.leaflet-overlay-pane');

        if (!originalOverlayPane || !clonedOverlayPane) {
            console.log('[导出调试] 未找到overlay-pane，跳过格网线修复');
            return;
        }

        // 查找SVG元素
        const originalSvg = originalOverlayPane.querySelector('svg');
        const clonedSvg = clonedOverlayPane.querySelector('svg');

        if (!originalSvg || !clonedSvg) {
            console.log('[导出调试] 未找到SVG元素，跳过格网线修复');
            return;
        }

        console.log('[导出调试] 开始修复格网线位置');

        // 获取地图容器位置（作为参考系）
        const mapContainer = this.map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        // 直接使用getBoundingClientRect获取SVG的实际渲染位置
        const originalSvgRect = originalSvg.getBoundingClientRect();

        // 计算SVG相对于地图容器的位置
        const svgLeftInMap = originalSvgRect.left - mapRect.left;
        const svgTopInMap = originalSvgRect.top - mapRect.top;

        console.log('[导出调试] SVG实际渲染位置:', {
            left: svgLeftInMap.toFixed(2),
            top: svgTopInMap.toFixed(2),
            width: originalSvgRect.width.toFixed(2),
            height: originalSvgRect.height.toFixed(2)
        });

        // 修复克隆的元素
        // 1. 清除overlay-pane的transform
        clonedOverlayPane.style.transform = 'none';
        clonedOverlayPane.style.webkitTransform = 'none';
        clonedOverlayPane.style.msTransform = 'none';

        // 2. 设置SVG的绝对位置（使用实际渲染位置）
        clonedSvg.style.position = 'absolute';
        clonedSvg.style.left = svgLeftInMap + 'px';
        clonedSvg.style.top = svgTopInMap + 'px';
        clonedSvg.style.transform = 'none';
        clonedSvg.style.webkitTransform = 'none';
        clonedSvg.style.msTransform = 'none';

        console.log('[导出调试] 格网线位置修复完成');
    }

    /**
     * 修复克隆文档中格网边框的位置
     * 确保边框使用绝对定位，不受transform影响
     */
    _fixGraticuleFrameInClone(clonedDoc, clonedElement) {
        // 查找原始和克隆的格网边框
        const originalFrame = document.querySelector('.graticule-frame');
        const clonedFrame = clonedDoc.querySelector('.graticule-frame');

        if (!originalFrame || !clonedFrame) {
            console.log('[导出调试] 未找到格网边框，跳过边框修复');
            return;
        }

        console.log('[导出调试] 开始修复格网边框位置');

        // 获取地图容器位置
        const mapContainer = this.map.getContainer();
        const mapRect = mapContainer.getBoundingClientRect();

        // 获取原始边框的实际位置
        const originalFrameRect = originalFrame.getBoundingClientRect();

        // 计算边框相对于地图容器的位置
        const frameLeftInMap = originalFrameRect.left - mapRect.left;
        const frameTopInMap = originalFrameRect.top - mapRect.top;

        console.log('[导出调试] 边框原始位置:', {
            left: originalFrame.style.left,
            top: originalFrame.style.top
        });
        console.log('[导出调试] 边框实际位置:', {
            left: frameLeftInMap.toFixed(2),
            top: frameTopInMap.toFixed(2)
        });

        // 确保克隆的边框使用正确的绝对定位
        clonedFrame.style.position = 'absolute';
        clonedFrame.style.left = frameLeftInMap + 'px';
        clonedFrame.style.top = frameTopInMap + 'px';
        clonedFrame.style.width = originalFrameRect.width + 'px';
        clonedFrame.style.height = originalFrameRect.height + 'px';

        // 清除可能的transform
        clonedFrame.style.transform = 'none';
        clonedFrame.style.webkitTransform = 'none';
        clonedFrame.style.msTransform = 'none';

        console.log('[导出调试] 格网边框位置修复完成');
    }

    /**
     * 裁剪Canvas到指定边界
     */
    _cropCanvas(sourceCanvas, bounds) {
        if (!bounds) return sourceCanvas;

        // 如果是地理坐标边界，转换为像素坐标
        let pixelBounds;
        if (bounds.getNorthWest && bounds.getSouthEast) {
            // 是Leaflet的LatLngBounds对象
            const nw = this.map.latLngToContainerPoint(bounds.getNorthWest());
            const se = this.map.latLngToContainerPoint(bounds.getSouthEast());
            pixelBounds = {
                left: nw.x,
                top: nw.y,
                width: se.x - nw.x,
                height: se.y - nw.y
            };
        } else {
            // 是像素坐标对象 {left, top, width, height}
            pixelBounds = bounds;
        }

        // 考虑scale因子
        const scale = sourceCanvas.width / this.map.getContainer().offsetWidth;

        const x = Math.max(0, pixelBounds.left * scale);
        const y = Math.max(0, pixelBounds.top * scale);
        const width = Math.min(sourceCanvas.width - x, pixelBounds.width * scale);
        const height = Math.min(sourceCanvas.height - y, pixelBounds.height * scale);

        // 创建新的Canvas并裁剪
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;

        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(
            sourceCanvas,
            x, y, width, height,  // 源区域
            0, 0, width, height   // 目标区域
        );

        return croppedCanvas;
    }

    /**
     * 下载Canvas为图片
     */
    _downloadCanvas(canvas) {
        const mimeType = this.format === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, this.quality);

        // 创建下载链接
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `${this.filename}_${timestamp}.${this.format}`;
        link.href = dataUrl;
        link.click();
    }

    /**
     * 显示加载提示
     */
    _showLoading() {
        // 创建加载遮罩
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
     */
    _hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
            this.loadingOverlay = null;
        }
    }

    /**
     * 设置导出区域
     */
    setExportArea(area) {
        this.exportArea = area;

        // 如果预览边框正在显示，重新计算并更新预览
        if (this.previewBorder) {
            // 清除当前预览边界，强制重新计算
            this.previewBounds = null;

            // 隐藏旧的预览
            this._hidePreviewBorder();

            // 显示新的预览
            this._showPreviewBorder();

            // 更新按钮状态
            const button = this.container.querySelector('.export-preview-button');
            if (button) {
                button.style.backgroundColor = '#ff6b6b';
                button.style.color = '#fff';
            }
        }
    }

    /**
     * 设置导出格式
     */
    setFormat(format) {
        this.format = format;
    }

    /**
     * 设置导出质量
     */
    setQuality(quality) {
        this.quality = Math.max(0, Math.min(1, quality));
    }

    /**
     * 设置文件名
     */
    setFilename(filename) {
        this.filename = filename;
    }
}


