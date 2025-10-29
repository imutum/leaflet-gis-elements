/**
 * 格网简单样式
 * 清晰的经纬度网格
 */

(function () {
    'use strict';

    const GraticuleSimpleStyle = {
        name: '简单样式',

        // 经线样式
        meridian: {
            color: '#666',
            weight: 1,
            opacity: 0.5,
            dashArray: null
        },

        // 纬线样式
        parallel: {
            color: '#666',
            weight: 1,
            opacity: 0.5,
            dashArray: null
        },

        // 边框样式
        frame: {
            color: '#333',
            weight: 2,
            opacity: 0.8
        },

        // 标签样式
        label: {
            fontSize: 11,
            fontFamily: 'Arial, sans-serif',
            color: '#333'
        }
    };

    // 注册到 L.GISElements.StyleRegistry
    L.GISElements.StyleRegistry.register('graticule', 'simple', GraticuleSimpleStyle);

})();

