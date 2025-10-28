/**
 * 罗盘样式
 * 传统罗盘风格的指北针
 */

(function () {
    'use strict';

    const NorthArrowCompassStyle = {
        name: '罗盘样式',
        svg: (size = 80) => `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
                <!-- 外圆 -->
                <circle cx="50" cy="50" r="48" fill="white" stroke="#333" stroke-width="2"/>
                
                <!-- 刻度线 -->
                <line x1="50" y1="5" x2="50" y2="15" stroke="#333" stroke-width="2"/>
                <line x1="50" y1="85" x2="50" y2="95" stroke="#333" stroke-width="1"/>
                <line x1="95" y1="50" x2="85" y2="50" stroke="#333" stroke-width="1"/>
                <line x1="5" y1="50" x2="15" y2="50" stroke="#333" stroke-width="1"/>
                
                <!-- 北向箭头 -->
                <polygon points="50,15 42,50 50,45 58,50" fill="#d32f2f"/>
                
                <!-- 南向箭头 -->
                <polygon points="50,85 42,50 50,55 58,50" fill="#666"/>
                
                <!-- 中心圆 -->
                <circle cx="50" cy="50" r="6" fill="#333"/>
                
                <!-- N标记 -->
                <text x="50" y="25" font-family="Georgia, serif" font-size="16" text-anchor="middle" fill="#333" font-weight="bold">N</text>
            </svg>
        `
    };

    // 注册到全局样式对象
    if (!window.NorthArrowStyles) {
        window.NorthArrowStyles = {};
    }
    window.NorthArrowStyles['compass'] = NorthArrowCompassStyle;

})();

