/**
 * 通用拖动管理器
 * 提供元素拖动和调整大小的通用功能
 */

/**
 * 拖动管理器
 * 使任何元素可拖动
 */
class DraggableManager {
    /**
     * @param {HTMLElement} element - 要拖动的元素
     * @param {Object} options - 配置选项
     * @param {number} options.threshold - 拖动阈值（像素），默认5
     * @param {Function} options.onDragStart - 鼠标按下时的回调
     * @param {Function} options.onDragBegin - 开始拖动时的回调（超过阈值）
     * @param {Function} options.onDragging - 拖动中的回调 (delta, event)
     * @param {Function} options.onDragEnd - 拖动结束的回调
     * @param {HTMLElement} options.constrainTo - 约束拖动范围的父元素
     * @param {boolean} options.updatePosition - 是否自动更新元素位置，默认false
     */
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            threshold: options.threshold || 5,
            onDragStart: options.onDragStart || null,
            onDragBegin: options.onDragBegin || null,
            onDragging: options.onDragging || null,
            onDragEnd: options.onDragEnd || null,
            constrainTo: options.constrainTo || null,
            updatePosition: options.updatePosition !== undefined ? options.updatePosition : false
        };

        // 状态
        this.isDragging = false;
        this.startPos = { x: 0, y: 0 };
        this.startElementPos = { left: 0, top: 0 };
        this.hasMoved = false;

        // 事件处理器
        this._handlers = null;
        this._enabled = false;
    }

    /**
     * 启用拖动
     */
    enable() {
        if (this._enabled) return;

        const onMouseDown = (e) => {
            if (e.button !== 0) return; // 只响应左键

            this.isDragging = false;
            this.hasMoved = false;
            this.startPos = { x: e.clientX, y: e.clientY };

            // 记录元素初始位置
            if (this.options.updatePosition) {
                const rect = this.element.getBoundingClientRect();
                const parentRect = this.element.offsetParent
                    ? this.element.offsetParent.getBoundingClientRect()
                    : { left: 0, top: 0 };
                this.startElementPos = {
                    left: rect.left - parentRect.left,
                    top: rect.top - parentRect.top
                };
            }

            // 触发开始回调
            this.options.onDragStart && this.options.onDragStart(e);

            // 绑定移动和释放事件
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            e.stopPropagation();
        };

        const onMouseMove = (e) => {
            const delta = {
                x: e.clientX - this.startPos.x,
                y: e.clientY - this.startPos.y
            };

            // 检查是否超过阈值
            if (!this.isDragging &&
                (Math.abs(delta.x) > this.options.threshold ||
                    Math.abs(delta.y) > this.options.threshold)) {
                this.isDragging = true;
                this.options.onDragBegin && this.options.onDragBegin();
            }

            if (this.isDragging) {
                this.hasMoved = true;

                // 自动更新位置（如果启用）
                if (this.options.updatePosition) {
                    let newLeft = this.startElementPos.left + delta.x;
                    let newTop = this.startElementPos.top + delta.y;

                    // 约束范围
                    if (this.options.constrainTo) {
                        const constrained = this._constrainPosition(newLeft, newTop);
                        newLeft = constrained.left;
                        newTop = constrained.top;
                    }

                    this.element.style.left = newLeft + 'px';
                    this.element.style.top = newTop + 'px';
                }

                // 触发拖动回调
                this.options.onDragging && this.options.onDragging(delta, e);

                e.preventDefault();
            }
        };

        const onMouseUp = (e) => {
            if (this.isDragging && this.hasMoved) {
                this.options.onDragEnd && this.options.onDragEnd(e);
                e.preventDefault();
                e.stopPropagation();
            }

            this.isDragging = false;
            this.hasMoved = false;

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        this.element.addEventListener('mousedown', onMouseDown);
        this._handlers = { onMouseDown, onMouseMove, onMouseUp };
        this._enabled = true;
    }

    /**
     * 禁用拖动
     */
    disable() {
        if (!this._enabled || !this._handlers) return;

        this.element.removeEventListener('mousedown', this._handlers.onMouseDown);
        this._handlers = null;
        this._enabled = false;
    }

    /**
     * 约束位置在父元素范围内
     * @private
     */
    _constrainPosition(left, top) {
        const parent = this.options.constrainTo;
        const parentRect = parent.getBoundingClientRect();
        const elementRect = this.element.getBoundingClientRect();

        const maxLeft = parentRect.width - elementRect.width;
        const maxTop = parentRect.height - elementRect.height;

        return {
            left: Math.max(0, Math.min(left, maxLeft)),
            top: Math.max(0, Math.min(top, maxTop))
        };
    }

    /**
     * 销毁管理器
     */
    destroy() {
        this.disable();
        this.element = null;
        this.options = null;
    }

    /**
     * 检查是否已启用
     */
    isEnabled() {
        return this._enabled;
    }
}

/**
 * 调整大小管理器
 * 为元素添加可调整大小的控制点
 */
class ResizableManager {
    /**
     * @param {HTMLElement} element - 要调整大小的元素
     * @param {Object} options - 配置选项
     * @param {Array<string>} options.handles - 控制点位置，默认四个角
     * @param {number} options.minWidth - 最小宽度，默认100
     * @param {number} options.minHeight - 最小高度，默认100
     * @param {string} options.handleColor - 控制点颜色，默认#333
     * @param {number} options.handleSize - 控制点大小，默认12
     * @param {Function} options.onResizeStart - 开始调整大小的回调
     * @param {Function} options.onResizing - 调整大小中的回调
     * @param {Function} options.onResizeEnd - 调整大小结束的回调
     * @param {Function} options.getBounds - 获取当前边界的回调 (返回 {left, top, width, height})
     * @param {Function} options.setBounds - 设置边界的回调 (接收 {left, top, width, height})
     */
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            handles: options.handles || ['topleft', 'topright', 'bottomleft', 'bottomright'],
            minWidth: options.minWidth || 100,
            minHeight: options.minHeight || 100,
            handleColor: options.handleColor || '#333',
            handleSize: options.handleSize || 12,
            onResizeStart: options.onResizeStart || null,
            onResizing: options.onResizing || null,
            onResizeEnd: options.onResizeEnd || null,
            getBounds: options.getBounds || null,
            setBounds: options.setBounds || null
        };

        // 控制点配置
        this.handleConfigs = {
            topleft: { x: 0, y: 0, cursor: 'nwse-resize' },
            topright: { x: 1, y: 0, cursor: 'nesw-resize' },
            bottomleft: { x: 0, y: 1, cursor: 'nesw-resize' },
            bottomright: { x: 1, y: 1, cursor: 'nwse-resize' },
            top: { x: 0.5, y: 0, cursor: 'ns-resize' },
            bottom: { x: 0.5, y: 1, cursor: 'ns-resize' },
            left: { x: 0, y: 0.5, cursor: 'ew-resize' },
            right: { x: 1, y: 0.5, cursor: 'ew-resize' }
        };

        // 状态
        this.handles = [];
        this._enabled = false;
    }

    /**
     * 启用调整大小
     */
    enable() {
        if (this._enabled) return;

        this.options.handles.forEach(position => {
            const config = this.handleConfigs[position];
            if (!config) {
                console.warn(`未知的控制点位置: ${position}`);
                return;
            }

            const handle = this._createHandle(position, config);
            this._makeHandleDraggable(handle, position, config);
            this.handles.push({ position, element: handle, draggable: handle._draggable });
        });

        this._enabled = true;
        this._updateHandlePositions();
    }

    /**
     * 禁用调整大小
     */
    disable() {
        if (!this._enabled) return;

        this.handles.forEach(({ element, draggable }) => {
            if (draggable) {
                draggable.destroy();
            }
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        this.handles = [];
        this._enabled = false;
    }

    /**
     * 更新控制点位置
     */
    updateHandlePositions() {
        this._updateHandlePositions();
    }

    /**
     * 创建控制点元素
     * @private
     */
    _createHandle(position, config) {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${position}`;
        handle.style.cssText = `
            position: absolute;
            width: ${this.options.handleSize}px;
            height: ${this.options.handleSize}px;
            background: #fff;
            border: 2px solid ${this.options.handleColor};
            border-radius: 50%;
            cursor: ${config.cursor};
            z-index: 1001;
            pointer-events: auto;
        `;

        // 添加到与element相同的父容器
        const parent = this.element.parentNode || document.body;
        parent.appendChild(handle);

        return handle;
    }

    /**
     * 使控制点可拖动
     * @private
     */
    _makeHandleDraggable(handle, position, config) {
        let startBounds = null;

        const draggable = new DraggableManager(handle, {
            threshold: 0,
            onDragStart: (e) => {
                // 获取当前边界
                startBounds = this.options.getBounds
                    ? this.options.getBounds()
                    : this._getDefaultBounds();

                // 添加拖动视觉反馈
                handle.style.transform = 'scale(1.3)';
                handle.style.transition = 'transform 0.1s';

                this.options.onResizeStart && this.options.onResizeStart(position);

                e.stopPropagation();
                e.preventDefault();
            },
            onDragging: (delta) => {
                const newBounds = this._calculateNewBounds(position, startBounds, delta);

                // 应用新边界
                if (this.options.setBounds) {
                    this.options.setBounds(newBounds);
                } else {
                    this._applyDefaultBounds(newBounds);
                }

                // 更新所有控制点位置
                this._updateHandlePositions();

                this.options.onResizing && this.options.onResizing(newBounds);
            },
            onDragEnd: () => {
                // 恢复视觉反馈
                handle.style.transform = 'scale(1)';

                this.options.onResizeEnd && this.options.onResizeEnd();
            }
        });

        draggable.enable();
        handle._draggable = draggable; // 保存引用以便后续销毁
    }

    /**
     * 计算新的边界
     * @private
     */
    _calculateNewBounds(position, startBounds, delta) {
        const newBounds = { ...startBounds };

        // 根据拖动的控制点位置计算新边界
        switch (position) {
            case 'topleft':
                newBounds.left = startBounds.left + delta.x;
                newBounds.top = startBounds.top + delta.y;
                newBounds.width = startBounds.width - delta.x;
                newBounds.height = startBounds.height - delta.y;
                break;
            case 'topright':
                newBounds.top = startBounds.top + delta.y;
                newBounds.width = startBounds.width + delta.x;
                newBounds.height = startBounds.height - delta.y;
                break;
            case 'bottomleft':
                newBounds.left = startBounds.left + delta.x;
                newBounds.width = startBounds.width - delta.x;
                newBounds.height = startBounds.height + delta.y;
                break;
            case 'bottomright':
                newBounds.width = startBounds.width + delta.x;
                newBounds.height = startBounds.height + delta.y;
                break;
            case 'top':
                newBounds.top = startBounds.top + delta.y;
                newBounds.height = startBounds.height - delta.y;
                break;
            case 'bottom':
                newBounds.height = startBounds.height + delta.y;
                break;
            case 'left':
                newBounds.left = startBounds.left + delta.x;
                newBounds.width = startBounds.width - delta.x;
                break;
            case 'right':
                newBounds.width = startBounds.width + delta.x;
                break;
        }

        // 确保最小尺寸
        if (newBounds.width < this.options.minWidth) {
            if (position.includes('left')) {
                newBounds.left = startBounds.left + startBounds.width - this.options.minWidth;
            }
            newBounds.width = this.options.minWidth;
        }

        if (newBounds.height < this.options.minHeight) {
            if (position.includes('top')) {
                newBounds.top = startBounds.top + startBounds.height - this.options.minHeight;
            }
            newBounds.height = this.options.minHeight;
        }

        return newBounds;
    }

    /**
     * 更新所有控制点位置
     * @private
     */
    _updateHandlePositions() {
        const bounds = this.options.getBounds
            ? this.options.getBounds()
            : this._getDefaultBounds();

        this.handles.forEach(({ position, element }) => {
            const config = this.handleConfigs[position];
            const left = bounds.left + config.x * bounds.width - this.options.handleSize / 2;
            const top = bounds.top + config.y * bounds.height - this.options.handleSize / 2;

            element.style.left = left + 'px';
            element.style.top = top + 'px';
        });
    }

    /**
     * 获取默认边界（从element的样式）
     * @private
     */
    _getDefaultBounds() {
        return {
            left: parseInt(this.element.style.left) || 0,
            top: parseInt(this.element.style.top) || 0,
            width: parseInt(this.element.style.width) || this.element.offsetWidth,
            height: parseInt(this.element.style.height) || this.element.offsetHeight
        };
    }

    /**
     * 应用默认边界（更新element的样式）
     * @private
     */
    _applyDefaultBounds(bounds) {
        this.element.style.left = bounds.left + 'px';
        this.element.style.top = bounds.top + 'px';
        this.element.style.width = bounds.width + 'px';
        this.element.style.height = bounds.height + 'px';
    }

    /**
     * 销毁管理器
     */
    destroy() {
        this.disable();
        this.element = null;
        this.options = null;
    }

    /**
     * 检查是否已启用
     */
    isEnabled() {
        return this._enabled;
    }
}

// 初始化 L.GISElements 命名空间
L.GISElements = L.GISElements || {};

// 导出到 L.GISElements 命名空间
L.GISElements.Draggable = DraggableManager;
L.GISElements.Resizable = ResizableManager;

