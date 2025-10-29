/**
 * 坐标转换工具模块
 * 负责绝对像素坐标与相对比例之间的转换
 */

// 初始化 L.GISElements 命名空间
L.GISElements = L.GISElements || {};

L.GISElements.Coordinate = {
    /**
     * 将绝对像素坐标转换为相对比例
     * @param {number} absoluteX - 绝对X坐标（像素）
     * @param {number} absoluteY - 绝对Y坐标（像素）
     * @param {HTMLElement} mapContainer - 地图容器元素
     * @returns {{ratioX: number, ratioY: number}} 相对比例（0-1）
     */
    absoluteToRelative(absoluteX, absoluteY, mapContainer) {
        if (!mapContainer) {
            return { ratioX: 0, ratioY: 0 };
        }

        const mapRect = mapContainer.getBoundingClientRect();
        const ratioX = absoluteX / mapRect.width;
        const ratioY = absoluteY / mapRect.height;

        return {
            ratioX: Math.max(0, Math.min(1, ratioX)),
            ratioY: Math.max(0, Math.min(1, ratioY))
        };
    },

    /**
     * 将相对比例转换为绝对像素坐标
     * @param {number} ratioX - 相对X比例（0-1）
     * @param {number} ratioY - 相对Y比例（0-1）
     * @param {HTMLElement} mapContainer - 地图容器元素
     * @param {HTMLElement} controlElement - 控件元素
     * @returns {{x: number, y: number}} 绝对像素坐标
     */
    relativeToAbsolute(ratioX, ratioY, mapContainer, controlElement) {
        if (!mapContainer || !controlElement) {
            return { x: 0, y: 0 };
        }

        const mapRect = mapContainer.getBoundingClientRect();
        const controlRect = controlElement.getBoundingClientRect();

        const absoluteX = ratioX * mapRect.width;
        const absoluteY = ratioY * mapRect.height;

        return {
            x: Math.max(0, Math.min(absoluteX, mapRect.width - controlRect.width)),
            y: Math.max(0, Math.min(absoluteY, mapRect.height - controlRect.height))
        };
    },

    /**
     * 约束位置在地图范围内
     * @param {number} x - X坐标（像素）
     * @param {number} y - Y坐标（像素）
     * @param {HTMLElement} mapContainer - 地图容器元素
     * @param {HTMLElement} controlElement - 控件元素
     * @returns {{x: number, y: number}} 约束后的坐标
     */
    constrainPosition(x, y, mapContainer, controlElement) {
        if (!mapContainer || !controlElement) {
            return { x, y };
        }

        const mapRect = mapContainer.getBoundingClientRect();
        const controlRect = controlElement.getBoundingClientRect();

        const maxLeft = mapRect.width - controlRect.width;
        const maxTop = mapRect.height - controlRect.height;

        return {
            x: Math.max(0, Math.min(x, maxLeft)),
            y: Math.max(0, Math.min(y, maxTop))
        };
    }
};

