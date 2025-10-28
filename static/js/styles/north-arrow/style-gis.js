/**
 * GIS简约样式
 * ArcGIS风格的简约指北针
 */

(function () {
    'use strict';

    const NorthArrowGISStyle = {
        name: 'GIS简约',
        svg: (size = 80) => `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 50 82">
                <!-- 背景透明 -->
                <rect width="100%" height="100%" fill="none"/>
                
                <!-- 字母 N -->
                <text x="25" y="25" font-family="Times New Roman, serif" font-size="20" text-anchor="middle" fill="black">N</text>
                
                <!-- 黑色三角箭头 -->
                <polygon points="25,25 12,70 25,55 38,70" fill="black"/>
            </svg>
        `
    };

    // 注册到全局样式对象
    if (!window.NorthArrowStyles) {
        window.NorthArrowStyles = {};
    }
    window.NorthArrowStyles['gis'] = NorthArrowGISStyle;

})();

