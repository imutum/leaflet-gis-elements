/**
 * 比例尺控件
 * 继承自L.GISElements.StylableControl，提供比例尺显示和自动更新功能
 */

// 确保命名空间已初始化
L.GISElements = L.GISElements || {};

class ScaleBarControl extends L.GISElements.StylableControl {
    constructor(options = {}) {
        super({
            position: options.position || 'bottomleft',
            draggable: options.draggable !== false,
            storageKey: 'scaleBarPosition',
            dragThreshold: 5,
            styles: options.styles,
            style: options.style || 'gis'
        });

        // 比例尺配置
        this.maxWidth = options.maxWidth || 300;
        this.metric = options.metric !== false;
        this.imperial = options.imperial || false;
        this.updateWhenIdle = options.updateWhenIdle || false;

        // 比例尺数据
        this.scaleData = { meters: 0, width: 0, label: '' };

        // 事件处理器
        this._updateHandler = null;
    }

    /**
     * 获取容器类名
     */
    getContainerClass() {
        return 'lge-control-scale-bar';
    }

    /**
     * 获取默认样式集合
     */
    getDefaultStyles() {
        return L.GISElements.StyleRegistry.getStyles('scale-bar');
    }

    /**
     * 获取默认样式名称
     */
    getDefaultStyleName() {
        return 'gis';
    }

    /**
     * 样式初始化
     */
    onStyleInit(map, container) {
        // 监听地图事件
        const updateEvent = this.updateWhenIdle ? 'moveend' : 'move';
        this._updateHandler = () => this.update();

        map.on(updateEvent, this._updateHandler);
        map.on('zoom', this._updateHandler);

        // 初始更新
        this.update();
    }

    /**
     * 控件销毁
     */
    onDestroy() {
        if (this._updateHandler && this.map) {
            const updateEvent = this.updateWhenIdle ? 'moveend' : 'move';
            this.map.off(updateEvent, this._updateHandler);
            this.map.off('zoom', this._updateHandler);
        }
    }

    /**
     * 更新比例尺
     */
    update() {
        if (!this.map || !this.container) return;

        // 计算比例尺数据
        const bounds = this.map.getBounds();
        const centerLat = bounds.getCenter().lat;
        const halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180);
        const dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180;
        const size = this.map.getSize();

        let maxMeters = 0;
        if (size.x > 0) {
            maxMeters = dist * (this.maxWidth / size.x);
        }

        this.scaleData = this._getRoundNum(maxMeters);
        this.render();
    }

    /**
     * 渲染比例尺内容
     */
    render() {
        if (!this.container) return;

        const style = this.getCurrentStyleObject();
        if (!style) {
            console.warn(`比例尺样式 "${this.currentStyle}" 不存在`);
            return;
        }

        const html = style.render(this.scaleData);

        // 完全清空旧内容，确保旧样式的类名被完全移除
        this.container.innerHTML = '';

        // 创建新内容
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'scale-bar-content';
        contentWrapper.innerHTML = html;
        this.container.appendChild(contentWrapper);
    }

    /**
     * 设置最大宽度
     */
    setMaxWidth(maxWidth) {
        this.maxWidth = maxWidth;
        this.update();
    }

    /**
     * 获取最大宽度
     */
    getMaxWidth() {
        return this.maxWidth;
    }

    /**
     * 设置是否显示公制单位
     */
    setMetric(metric) {
        this.metric = metric;
        this.update();
    }

    /**
     * 设置是否显示英制单位
     */
    setImperial(imperial) {
        this.imperial = imperial;
        this.update();
    }

    /**
     * 设置是否在地图空闲时更新
     */
    setUpdateWhenIdle(updateWhenIdle) {
        if (this.updateWhenIdle !== updateWhenIdle) {
            this.updateWhenIdle = updateWhenIdle;

            // 重新绑定事件监听器
            if (this._updateHandler && this.map) {
                // 移除旧的事件监听器
                const oldEvent = !updateWhenIdle ? 'moveend' : 'move';
                this.map.off(oldEvent, this._updateHandler);

                // 绑定新的事件监听器
                const newEvent = updateWhenIdle ? 'moveend' : 'move';
                this.map.on(newEvent, this._updateHandler);
            }
        }
    }

    /**
     * 获取配置信息
     */
    getOptions() {
        return {
            maxWidth: this.maxWidth,
            metric: this.metric,
            imperial: this.imperial,
            updateWhenIdle: this.updateWhenIdle
        };
    }

    /**
     * 获取合适的距离和宽度
     * @private
     */
    _getRoundNum(meters) {
        const pow10 = Math.pow(10, (Math.floor(meters) + '').length - 1);
        let d = meters / pow10;

        if (d >= 10) {
            d = 10;
        } else if (d >= 5) {
            d = 5;
        } else if (d >= 3) {
            d = 3;
        } else {
            d = Math.round(d * 2) / 2;
            if (d < 1) d = 1;
        }

        const roundedMeters = pow10 * d;
        const ratio = roundedMeters / meters;
        const width = Math.round(this.maxWidth * ratio);

        // 生成标签
        let label;
        if (roundedMeters >= 1000) {
            const km = roundedMeters / 1000;
            label = (km % 1 === 0 ? km : km.toFixed(1)) + ' km';
        } else {
            label = (roundedMeters % 1 === 0 ? roundedMeters : roundedMeters.toFixed(1)) + ' m';
        }

        return { meters: roundedMeters, width: width, label: label };
    }
}

// 导出到 L.Control 命名空间
L.Control.ScaleBar = ScaleBarControl;

// 工厂方法
L.control.scaleBar = function (options) {
    const control = new L.Control.ScaleBar(options);
    return control.createControl();
};

