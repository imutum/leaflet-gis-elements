/**
 * 指北针控件
 * 继承自L.GISElements.StylableControl，提供指北针显示功能
 */

// 确保命名空间已初始化
L.GISElements = L.GISElements || {};

class NorthArrowControl extends L.GISElements.StylableControl {
    constructor(options = {}) {
        super({
            position: options.position || 'topleft',
            draggable: options.draggable !== false,
            storageKey: 'northArrowPosition',
            dragThreshold: 5,
            styles: options.styles,
            style: options.style || 'gis'
        });

        this.size = options.size || 80;
    }

    /**
     * 获取容器类名
     */
    getContainerClass() {
        return 'lge-control-north-arrow';
    }

    /**
     * 获取默认样式集合
     */
    getDefaultStyles() {
        return L.GISElements.StyleRegistry.getStyles('north-arrow');
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
        container.style.width = this.size + 'px';
        container.style.height = this.size + 'px';
        container.style.background = 'transparent';
    }

    /**
     * 渲染指北针内容
     */
    render() {
        if (!this.container) return;

        const style = this.getCurrentStyleObject();
        if (!style) {
            console.warn(`指北针样式 "${this.currentStyle}" 不存在`);
            return;
        }

        // 生成SVG
        const svgContent = typeof style.svg === 'function'
            ? style.svg(this.size)
            : style.svg;

        // 完全清空旧内容，确保旧样式的类名被完全移除
        this.container.innerHTML = '';

        // 重新应用容器尺寸样式，确保切换样式时不丢失
        this.container.style.width = this.size + 'px';
        this.container.style.height = this.size + 'px';
        this.container.style.background = 'transparent';

        // 创建新内容
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'lge-north-arrow-content';
        contentWrapper.title = style.name;
        contentWrapper.innerHTML = svgContent;
        this.container.appendChild(contentWrapper);
    }

    /**
     * 设置大小
     */
    setSize(size) {
        this.size = size;
        if (this.container) {
            this.container.style.width = size + 'px';
            this.container.style.height = size + 'px';
            this.render();
        }
    }

    /**
     * 获取大小
     */
    getSize() {
        return this.size;
    }

    /**
     * 获取配置信息
     */
    getOptions() {
        return {
            size: this.size
        };
    }
}

// 导出到 L.Control 命名空间
L.Control.NorthArrow = NorthArrowControl;

// 工厂方法
L.control.northArrow = function (options) {
    const control = new L.Control.NorthArrow(options);
    return control.createControl();
};

