/**
 * Leaflet经典样式
 * Leaflet地图库风格的经典指北针
 */

(function () {
    'use strict';

    const NorthArrowLeafletStyle = {
        name: 'Leaflet经典',
        svg: (size = 80) => `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 50 82">
                <!-- 白色圆形背景 -->
                <circle cx="25" cy="41" r="24" fill="white" stroke="black" stroke-width="1"/>
                
                <!-- 字母 N -->
                <text x="25" y="20" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="black" font-weight="bold">N</text>
                
                <!-- 红色北向箭头 -->
                <polygon points="25,25 20,50 25,47 30,50" fill="red"/>
                
                <!-- 白色南向箭头 -->
                <polygon points="25,55 20,50 25,52 30,50" fill="white" stroke="black" stroke-width="0.5"/>
            </svg>
        `
    };

    // 注册到全局样式对象
    if (!window.NorthArrowStyles) {
        window.NorthArrowStyles = {};
    }
    window.NorthArrowStyles['leaflet'] = NorthArrowLeafletStyle;

})();

