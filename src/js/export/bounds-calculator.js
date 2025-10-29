/**
 * 导出边界计算器
 * 专门负责计算地图导出的边界区域
 */

L.GISElements = L.GISElements || {};

class BoundsCalculator {
    constructor(map) {
        this.map = map;
    }

    /**
     * 自动计算包含格网和标签的边界
     */
    calculateGraticuleBounds(options = {}) {
        const { padding = 10 } = options;

        const graticuleFrame = document.querySelector('.lge-graticule-frame');
        const graticuleLabels = document.querySelectorAll('.lge-graticule-label');

        if (!graticuleFrame && graticuleLabels.length === 0) {
            return null;
        }

        const mapContainer = this.map.getContainer();
        const bounds = this._collectElementBounds(mapContainer, [
            { element: graticuleFrame },
            ...Array.from(graticuleLabels).map(label => ({
                element: label,
                useInnerSpan: true
            }))
        ]);

        return this._addPadding(bounds, padding, mapContainer);
    }

    /**
     * 自动计算包含所有GIS元素的边界
     */
    calculateAllElementsBounds(options = {}) {
        const { padding = 10, selectors = null } = options;

        const defaultSelectors = [
            '.lge-graticule-frame',
            '.lge-graticule-label',
            '.leaflet-control-legend',
            '.leaflet-control-scale-bar',
            '.leaflet-control-north-arrow',
            '.leaflet-control-map-info'
        ];

        const mapContainer = this.map.getContainer();
        const elements = (selectors || defaultSelectors)
            .flatMap(selector => Array.from(mapContainer.querySelectorAll(selector)))
            .filter(el => el.offsetParent !== null) // 过滤隐藏元素
            .map(element => ({
                element,
                useInnerSpan: element.classList.contains('lge-graticule-label')
            }));

        if (elements.length === 0) {
            return null;
        }

        const bounds = this._collectElementBounds(mapContainer, elements);
        return this._addPadding(bounds, padding, mapContainer);
    }

    /**
     * 从地理坐标转换为像素边界
     */
    fromLatLngBounds(latLngBounds) {
        const nw = this.map.latLngToContainerPoint(latLngBounds.getNorthWest());
        const se = this.map.latLngToContainerPoint(latLngBounds.getSouthEast());

        return {
            left: nw.x,
            top: nw.y,
            width: se.x - nw.x,
            height: se.y - nw.y
        };
    }

    /**
     * 获取完整视口边界
     */
    getViewportBounds() {
        const container = this.map.getContainer();
        return {
            left: 0,
            top: 0,
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    }

    /**
     * 收集元素边界
     * @private
     */
    _collectElementBounds(mapContainer, elements) {
        const mapRect = mapContainer.getBoundingClientRect();
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        elements.forEach(({ element, useInnerSpan }) => {
            if (!element) return;

            const targetElement = useInnerSpan
                ? (element.querySelector('span') || element)
                : element;

            const rect = targetElement.getBoundingClientRect();
            minX = Math.min(minX, rect.left - mapRect.left);
            minY = Math.min(minY, rect.top - mapRect.top);
            maxX = Math.max(maxX, rect.right - mapRect.left);
            maxY = Math.max(maxY, rect.bottom - mapRect.top);
        });

        return { minX, minY, maxX, maxY };
    }

    /**
     * 添加边距并规范化
     * @private
     */
    _addPadding(bounds, padding, mapContainer) {
        const { minX, minY, maxX, maxY } = bounds;

        return {
            left: Math.max(0, minX - padding),
            top: Math.max(0, minY - padding),
            width: Math.min(mapContainer.offsetWidth, maxX + padding) - Math.max(0, minX - padding),
            height: Math.min(mapContainer.offsetHeight, maxY + padding) - Math.max(0, minY - padding)
        };
    }
}

L.GISElements.BoundsCalculator = BoundsCalculator;

