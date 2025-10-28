/**
 * 地图控件基类
 * 提供拖动、位置保存等基础功能
 * 所有地图控件都应继承此类
 */

class BaseMapControl {
    constructor(options = {}) {
        // 基本配置
        this.position = options.position || 'topleft';
        this.draggable = options.draggable !== false;
        this.storageKey = options.storageKey || 'control-position';
        this.dragThreshold = options.dragThreshold || 5;

        // 状态
        this.map = null;
        this.container = null;
        this.isDragging = false;
        this.savedPosition = null;

        // 事件处理器
        this._dragHandlers = null;

        // 加载保存的位置
        this._loadSavedPosition();
    }

    /**
     * 创建Leaflet控件
     * @returns {L.Control}
     */
    createControl() {
        const self = this;

        const Control = L.Control.extend({
            options: { position: self.position },

            onAdd: function (map) {
                self.map = map;
                self.container = self._createContainer();

                // 初始化控件
                self._initControl();

                // 应用保存的位置
                if (self.savedPosition) {
                    self._applyRelativePosition();
                }

                // 绑定拖动事件
                if (self.draggable) {
                    self._bindDragEvents();
                }

                // 阻止地图事件传播
                L.DomEvent.disableClickPropagation(self.container);
                L.DomEvent.disableScrollPropagation(self.container);

                return self.container;
            },

            onRemove: function (map) {
                self._cleanup();
            }
        });

        return new Control();
    }

    /**
     * 创建容器元素
     * @private
     */
    _createContainer() {
        const container = L.DomUtil.create('div', this.getContainerClass());

        if (this.draggable) {
            container.style.cursor = 'move';
        }

        return container;
    }

    /**
     * 初始化控件
     * @private
     */
    _initControl() {
        this.onInit(this.map, this.container);
    }

    /**
     * 加载保存的位置
     * @private
     */
    _loadSavedPosition() {
        this.savedPosition = L.GISElements.Storage.load(this.storageKey);
    }

    /**
     * 应用相对定位
     * @private
     */
    _applyRelativePosition() {
        if (!this.container || !this.savedPosition || !this.map) return;

        setTimeout(() => {
            if (this.container.parentNode && this.map) {
                this._moveToMapContainer();

                const mapContainer = this.map.getContainer();
                const absolutePos = L.GISElements.Coordinate.relativeToAbsolute(
                    this.savedPosition.ratioX,
                    this.savedPosition.ratioY,
                    mapContainer,
                    this.container
                );

                this.container.style.position = 'absolute';
                this.container.style.left = absolutePos.x + 'px';
                this.container.style.top = absolutePos.y + 'px';
                this.container.style.zIndex = '1000';
            }
        }, 0);
    }

    /**
     * 将容器移动到地图容器
     * @private
     */
    _moveToMapContainer() {
        if (!this.container || !this.map) return;

        const mapContainer = this.map.getContainer();
        const parent = this.container.parentNode;

        if (parent && parent !== mapContainer) {
            parent.removeChild(this.container);
        }

        if (this.container.parentNode !== mapContainer) {
            mapContainer.appendChild(this.container);
        }
    }

    /**
     * 绑定拖动事件
     * @private
     */
    _bindDragEvents() {
        if (!this.container) return;

        let startX, startY, startLeft, startTop;
        let hasMoved = false;
        let isAbsolutePositioned = false;

        const onMouseDown = (e) => {
            if (e.button !== 0) return;

            this.isDragging = false;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;

            const mapContainer = this.map.getContainer();
            const mapRect = mapContainer.getBoundingClientRect();
            const containerRect = this.container.getBoundingClientRect();

            startLeft = containerRect.left - mapRect.left;
            startTop = containerRect.top - mapRect.top;
            isAbsolutePositioned = this.container.style.position === 'absolute';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            this.onDragStart && this.onDragStart(e);
        };

        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (Math.abs(deltaX) > this.dragThreshold || Math.abs(deltaY) > this.dragThreshold) {
                if (!this.isDragging) {
                    this.isDragging = true;

                    if (!isAbsolutePositioned) {
                        this._moveToMapContainer();
                        this.container.style.position = 'absolute';
                        this.container.style.left = startLeft + 'px';
                        this.container.style.top = startTop + 'px';
                        this.container.style.zIndex = '1000';
                        isAbsolutePositioned = true;
                    }

                    this.onDragBegin && this.onDragBegin();
                }

                hasMoved = true;
                const newLeft = startLeft + deltaX;
                const newTop = startTop + deltaY;

                const mapContainer = this.map.getContainer();
                const finalPosition = L.GISElements.Coordinate.constrainPosition(
                    newLeft, newTop, mapContainer, this.container
                );

                this.container.style.left = finalPosition.x + 'px';
                this.container.style.top = finalPosition.y + 'px';

                this.onDragging && this.onDragging(finalPosition);
                e.preventDefault();
            }
        };

        const onMouseUp = (e) => {
            if (this.isDragging && hasMoved) {
                const mapContainer = this.map.getContainer();
                const mapRect = mapContainer.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();

                const absolutePos = {
                    x: containerRect.left - mapRect.left,
                    y: containerRect.top - mapRect.top
                };

                const relativePos = L.GISElements.Coordinate.absoluteToRelative(
                    absolutePos.x, absolutePos.y, mapContainer
                );

                L.GISElements.Storage.save(this.storageKey, relativePos);
                this.savedPosition = relativePos;

                this.onDragEnd && this.onDragEnd(absolutePos);

                e.preventDefault();
                e.stopPropagation();
            }

            this.isDragging = false;
            hasMoved = false;

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        this.container.addEventListener('mousedown', onMouseDown);
        this._dragHandlers = { onMouseDown, onMouseMove, onMouseUp };
    }

    /**
     * 重置位置
     */
    resetPosition() {
        if (this.container) {
            this.container.style.position = '';
            this.container.style.left = '';
            this.container.style.top = '';
            this.container.style.zIndex = '';

            if (this.map) {
                const mapContainer = this.map.getContainer();
                if (this.container.parentNode === mapContainer) {
                    const controlCorner = this._findControlCorner();
                    if (controlCorner) {
                        mapContainer.removeChild(this.container);
                        controlCorner.appendChild(this.container);
                    }
                }
            }
        }

        L.GISElements.Storage.remove(this.storageKey);
        this.savedPosition = null;
    }

    /**
     * 查找Leaflet控件容器
     * @private
     */
    _findControlCorner() {
        if (!this.map) return null;

        const parts = this.position.match(/(top|bottom)(left|right)/);
        if (!parts) return null;

        const verticalClass = 'leaflet-' + parts[1];
        const horizontalClass = 'leaflet-' + parts[2];

        return this.map.getContainer().querySelector(
            `.${verticalClass}.${horizontalClass}`
        );
    }

    /**
     * 显示容器
     */
    showContainer() {
        if (this.container) {
            this.container.style.display = '';
        }
    }

    /**
     * 隐藏容器
     */
    hideContainer() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * 切换容器显示状态
     */
    toggleContainer() {
        if (!this.container) return;

        if (this.container.style.display === 'none') {
            this.showContainer();
        } else {
            this.hideContainer();
        }
    }

    /**
     * 检查容器是否可见
     * @returns {boolean}
     */
    isContainerVisible() {
        if (!this.container) return false;
        return this.container.style.display !== 'none';
    }

    /**
     * 清理资源
     * @private
     */
    _cleanup() {
        if (this._dragHandlers && this.container) {
            const { onMouseDown, onMouseMove, onMouseUp } = this._dragHandlers;
            this.container.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this._dragHandlers = null;
        }

        this.onDestroy && this.onDestroy();

        this.map = null;
        this.container = null;
    }

    // ==================== 子类必须实现的方法 ====================

    /**
     * 获取容器的CSS类名
     * @returns {string}
     */
    getContainerClass() {
        throw new Error('子类必须实现 getContainerClass() 方法');
    }

    // ==================== 子类可选实现的钩子方法 ====================

    /**
     * 控件初始化时调用
     * @param {L.Map} map
     * @param {HTMLElement} container
     */
    onInit(map, container) {
        // 子类可选实现
    }

    /**
     * 控件销毁时调用
     */
    onDestroy() {
        // 子类可选实现
    }

    /**
     * 拖动开始时调用（鼠标按下）
     * @param {MouseEvent} e
     */
    onDragStart(e) {
        // 子类可选实现
    }

    /**
     * 拖动真正开始时调用（超过阈值）
     */
    onDragBegin() {
        // 子类可选实现
    }

    /**
     * 拖动中调用
     * @param {{x: number, y: number}} position
     */
    onDragging(position) {
        // 子类可选实现
    }

    /**
     * 拖动结束时调用
     * @param {{x: number, y: number}} position
     */
    onDragEnd(position) {
        // 子类可选实现
    }
}

// 初始化 L.GISElements 命名空间
L.GISElements = L.GISElements || {};

// 导出到 L.GISElements 命名空间
L.GISElements.BaseControl = BaseMapControl;

