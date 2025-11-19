/**
 * 图例控件
 * 继承自L.GISElements.StylableControl，提供图例显示功能
 */

// 确保命名空间已初始化
L.GISElements = L.GISElements || {};

class LegendControl extends L.GISElements.StylableControl {
    constructor(options = {}) {
        super({
            position: options.position || 'bottomright',
            draggable: options.draggable !== false,
            storageKey: 'legendPosition',
            dragThreshold: 5,
            styles: options.styles,
            style: options.style || 'gis'
        });

        // 图例配置
        this.maxWidth = options.maxWidth || 300;
        this.maxHeight = options.maxHeight || 400;
        this.layers = options.layers || [];
    }

    /**
     * 获取容器类名
     */
    getContainerClass() {
        return 'lge-control-legend';
    }

    /**
     * 获取默认样式集合
     */
    getDefaultStyles() {
        return L.GISElements.StyleRegistry.getStyles('legend');
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
        container.style.maxWidth = this.maxWidth + 'px';
        container.style.maxHeight = this.maxHeight + 'px';
    }

    /**
     * 渲染图例内容
     */
    render() {
        if (!this.container) return;

        const style = this.getCurrentStyleObject();
        if (!style) {
            console.warn(`图例样式 "${this.currentStyle}" 不存在`);
            return;
        }

        const html = style.renderContainer(this.layers);

        // 完全清空旧内容，确保旧样式的类名被完全移除
        this.container.innerHTML = '';

        // 重新应用容器尺寸样式，确保切换样式时不丢失
        this.container.style.maxWidth = this.maxWidth + 'px';
        this.container.style.maxHeight = this.maxHeight + 'px';

        // 创建新内容
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'legend-content';
        // 确保包装元素不限制尺寸
        contentWrapper.style.width = '100%';
        contentWrapper.style.height = '100%';
        contentWrapper.style.maxWidth = 'inherit';
        contentWrapper.style.maxHeight = 'inherit';
        contentWrapper.style.boxSizing = 'border-box';
        contentWrapper.innerHTML = html;
        this.container.appendChild(contentWrapper);
    }

    /**
     * 设置图层数据
     */
    setLayers(layers) {
        this.layers = layers || [];
        this.render();
    }

    /**
     * 添加图层
     */
    addLayer(layer) {
        this.layers.push(layer);
        this.render();
    }

    /**
     * 移除图层
     */
    removeLayer(layerName) {
        this.layers = this.layers.filter(l => l.name !== layerName);
        this.render();
    }

    /**
     * 清空所有图层
     */
    clearLayers() {
        this.layers = [];
        this.render();
    }

    /**
     * 更新图例
     */
    update() {
        this.render();
    }

    /**
     * 设置最大宽度
     */
    setMaxWidth(maxWidth) {
        this.maxWidth = maxWidth;
        if (this.container) {
            this.container.style.maxWidth = maxWidth + 'px';
        }
    }

    /**
     * 设置最大高度
     */
    setMaxHeight(maxHeight) {
        this.maxHeight = maxHeight;
        if (this.container) {
            this.container.style.maxHeight = maxHeight + 'px';
        }
    }

    /**
     * 获取最大宽度
     */
    getMaxWidth() {
        return this.maxWidth;
    }

    /**
     * 获取最大高度
     */
    getMaxHeight() {
        return this.maxHeight;
    }

    /**
     * 获取配置信息
     */
    getOptions() {
        return {
            maxWidth: this.maxWidth,
            maxHeight: this.maxHeight,
            layers: this.layers
        };
    }
}

// 导出到 L.Control 命名空间
L.Control.Legend = LegendControl;

// 工厂方法
L.control.legend = function (options) {
    const control = new L.Control.Legend(options);
    return control.createControl();
};

