/**
 * 风格注册器
 * 统一管理所有控件的风格
 * 每个风格文件加载时会自动注册到这里
 */

window.StyleRegistry = (function () {
    // 风格存储：{控件类型: {风格ID: 风格对象}}
    const styles = {
        'scale-bar': {},
        'legend': {}
    };

    return {
        /**
         * 注册风格
         * @param {string} controlType - 控件类型 ('scale-bar' 或 'legend')
         * @param {string} styleId - 风格ID
         * @param {object} styleObject - 风格对象
         */
        register(controlType, styleId, styleObject) {
            if (!styles[controlType]) {
                styles[controlType] = {};
            }
            styles[controlType][styleId] = styleObject;
            console.log(`✓ 已注册 ${controlType} 风格: ${styleId} (${styleObject.name})`);
        },

        /**
         * 获取指定类型的所有风格
         * @param {string} controlType - 控件类型
         * @returns {object} 风格集合
         */
        getStyles(controlType) {
            return styles[controlType] || {};
        },

        /**
         * 获取指定风格对象
         * @param {string} controlType - 控件类型
         * @param {string} styleId - 风格ID
         * @returns {object|null} 风格对象
         */
        getStyle(controlType, styleId) {
            return styles[controlType]?.[styleId] || null;
        },

        /**
         * 检查风格是否已注册
         * @param {string} controlType - 控件类型
         * @param {string} styleId - 风格ID
         * @returns {boolean}
         */
        hasStyle(controlType, styleId) {
            return !!styles[controlType]?.[styleId];
        },

        /**
         * 列出所有已注册的风格
         * @param {string} controlType - 控件类型（可选）
         * @returns {object} 风格列表
         */
        list(controlType) {
            if (controlType) {
                const typeStyles = styles[controlType] || {};
                return Object.keys(typeStyles).map(id => ({
                    id,
                    name: typeStyles[id].name
                }));
            }

            const result = {};
            for (const type in styles) {
                result[type] = Object.keys(styles[type]).map(id => ({
                    id,
                    name: styles[type][id].name
                }));
            }
            return result;
        }
    };
})();

// 兼容旧版本接口
window.ScaleBarStyles = new Proxy({}, {
    get(target, prop) {
        return window.StyleRegistry.getStyle('scale-bar', prop);
    }
});

window.LegendStyles = new Proxy({}, {
    get(target, prop) {
        return window.StyleRegistry.getStyle('legend', prop);
    }
});

