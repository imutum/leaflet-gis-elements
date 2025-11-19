/**
 * GIS专业样式
 * ArcGIS风格的专业指北针
 */

(function () {
    'use strict';

    const NorthArrowGISStyle = {
        name: 'GIS专业',
        svg: (size = 80) => `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 63">
                <!-- 背景透明 -->
                <rect width="100%" height="100%" fill="none"/>
                
                <!-- 字母 N -->
                <text x="25" y="15" font-family="Times New Roman, serif" font-size="20" text-anchor="middle" fill="black">N</text>
                
                <!-- 黑色三角箭头 -->
                <polygon points="25,18 12,63 25,48 38,63" fill="black"/>
            </svg>
        `
    };

    // 注册到 L.GISElements.StyleRegistry
    L.GISElements.StyleRegistry.register('north-arrow', 'gis', NorthArrowGISStyle);

})();

