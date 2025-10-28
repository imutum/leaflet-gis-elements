/**
 * 指北针控件
 * 继承自StylableControl，提供指北针显示功能
 */

class NorthArrowControl extends StylableControl {
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
        return 'leaflet-control-north-arrow';
    }

    /**
     * 获取默认样式集合
     */
    getDefaultStyles() {
        return window.NorthArrowStyles || {};
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

        // 清空旧内容
        const existingContent = this.container.querySelector('.north-arrow-content');
        if (existingContent) {
            existingContent.remove();
        }

        // 创建新内容
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'north-arrow-content';
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
}

// 导出到全局
window.NorthArrowControl = NorthArrowControl;

