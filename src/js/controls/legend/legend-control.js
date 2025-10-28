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
        return 'leaflet-control-legend';
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

        // 清空旧内容
        const existingContent = this.container.querySelector('.legend-content');
        if (existingContent) {
            existingContent.remove();
        }

        // 创建新内容
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'legend-content';
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
}

// 导出到 L.Control 命名空间
L.Control.Legend = LegendControl;

// 工厂方法
L.control.legend = function (options) {
    const control = new L.Control.Legend(options);
    return control.createControl();
};

