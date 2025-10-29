/**
 * 格网密集样式
 * 虚线网格，更加密集细腻
 */

(function () {
    'use strict';

    const GraticuleDenseStyle = {
        name: '密集样式',

        // 经线样式
        meridian: {
            color: '#888',
            weight: 0.5,
            opacity: 0.3,
            dashArray: '2, 2'  // 虚线
        },

        // 纬线样式
        parallel: {
            color: '#888',
            weight: 0.5,
            opacity: 0.3,
            dashArray: '2, 2'  // 虚线
        },

        // 边框样式
        frame: {
            color: '#444',
            weight: 1,
            opacity: 0.6
        },

        // 标签样式
        label: {
            fontSize: 10,
            fontFamily: 'Arial, sans-serif',
            color: '#666'
        }
    };

    // 注册到 L.GISElements.StyleRegistry
    L.GISElements.StyleRegistry.register('graticule', 'dense', GraticuleDenseStyle);

})();

