/**
 * 可样式化控件基类
 * 继承自L.GISElements.BaseControl，提供样式管理功能
 */

// 确保命名空间已初始化
L.GISElements = L.GISElements || {};

class StylableControl extends L.GISElements.BaseControl {
    constructor(options = {}) {
        super(options);

        // 样式配置
        this.styles = options.styles || this.getDefaultStyles() || {};
        this.currentStyle = options.style || this.getDefaultStyleName();
    }

    /**
     * 控件初始化时调用（实现基类方法）
     */
    onInit(map, container) {
        super.onInit(map, container);

        // 调用子类的样式初始化
        this.onStyleInit(map, container);

        // 渲染初始样式
        this.render();
    }

    /**
     * 切换样式
     * @param {string} styleName - 样式名称
     */
    setStyle(styleName) {
        if (this.styles[styleName]) {
            this.currentStyle = styleName;
            this.render();
        } else {
            console.warn(`样式 "${styleName}" 不存在`);
        }
    }

    /**
     * 添加新样式
     * @param {string} name - 样式名称
     * @param {Object} style - 样式对象
     */
    addStyle(name, style) {
        this.styles[name] = style;
    }

    /**
     * 移除样式
     * @param {string} name - 样式名称
     */
    removeStyle(name) {
        if (this.styles[name]) {
            delete this.styles[name];

            if (this.currentStyle === name) {
                const availableStyles = Object.keys(this.styles);
                if (availableStyles.length > 0) {
                    this.setStyle(availableStyles[0]);
                }
            }
        }
    }

    /**
     * 获取所有样式列表
     * @returns {Array} 样式列表
     */
    getStylesList() {
        return Object.keys(this.styles).map(key => ({
            id: key,
            name: this.styles[key].name || key
        }));
    }

    /**
     * 获取当前样式名称
     * @returns {string}
     */
    getCurrentStyle() {
        return this.currentStyle;
    }

    /**
     * 获取当前样式对象
     * @returns {Object|null}
     */
    getCurrentStyleObject() {
        return this.styles[this.currentStyle] || null;
    }

    /**
     * 检查样式是否存在
     * @param {string} styleName
     * @returns {boolean}
     */
    hasStyle(styleName) {
        return !!this.styles[styleName];
    }

    // ==================== 子类必须实现的方法 ====================

    /**
     * 渲染控件内容
     */
    render() {
        throw new Error('子类必须实现 render() 方法');
    }

    // ==================== 子类可选实现的方法 ====================

    /**
     * 获取默认样式集合
     * @returns {Object}
     */
    getDefaultStyles() {
        return {};
    }

    /**
     * 获取默认样式名称
     * @returns {string}
     */
    getDefaultStyleName() {
        return 'default';
    }

    /**
     * 样式初始化时调用
     * @param {L.Map} map
     * @param {HTMLElement} container
     */
    onStyleInit(map, container) {
        // 子类可选实现
    }
}

// 导出到 L.GISElements 命名空间
L.GISElements.StylableControl = StylableControl;

