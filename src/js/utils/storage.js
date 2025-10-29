/**
 * 本地存储工具模块
 * 负责位置数据的保存和加载
 */

// 初始化 L.GISElements 命名空间
L.GISElements = L.GISElements || {};

L.GISElements.Storage = {
    /**
     * 保存位置到localStorage（保存相对比例）
     * @param {string} key - 存储键名
     * @param {{ratioX: number, ratioY: number}} position - 相对位置
     * @returns {boolean} 是否保存成功
     */
    save(key, position) {
        try {
            localStorage.setItem(key, JSON.stringify(position));
            return true;
        } catch (e) {
            console.warn(`无法保存位置 [${key}]:`, e);
            return false;
        }
    },

    /**
     * 从localStorage加载位置（加载相对比例）
     * @param {string} key - 存储键名
     * @returns {{ratioX: number, ratioY: number}|null} 相对位置或null
     */
    load(key) {
        try {
            const saved = localStorage.getItem(key);
            if (!saved) return null;

            const parsed = JSON.parse(saved);

            // 兼容旧版本的绝对坐标格式 {x, y}
            if ('x' in parsed && 'y' in parsed && !('ratioX' in parsed)) {
                console.warn(`检测到旧版本的绝对坐标 [${key}]，已忽略`);
                this.remove(key);
                return null;
            }

            // 验证数据格式
            if (typeof parsed.ratioX !== 'number' || typeof parsed.ratioY !== 'number') {
                console.warn(`无效的位置数据 [${key}]`);
                this.remove(key);
                return null;
            }

            return parsed;
        } catch (e) {
            console.warn(`无法加载位置 [${key}]:`, e);
            return null;
        }
    },

    /**
     * 移除存储的位置
     * @param {string} key - 存储键名
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`无法移除位置 [${key}]:`, e);
        }
    },

    /**
     * 清除所有控件位置
     * @param {string[]} keys - 键名数组
     */
    clearAll(keys) {
        keys.forEach(key => this.remove(key));
    }
};

