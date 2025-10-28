/**
 * 简洁指针样式
 * 现代简约风格的指北针
 */

(function () {
    'use strict';

    const NorthArrowCompactStyle = {
        name: '简洁指针',
        svg: (size = 80) => `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 50 82">
                <!-- 半透明白色圆形背景 -->
                <circle cx="25" cy="41" r="22" fill="rgba(255, 255, 255, 0.9)" stroke="#333" stroke-width="2"/>
                
                <!-- 北向指针（红色） -->
                <path d="M 25 20 L 20 42 L 25 40 L 30 42 Z" fill="#d32f2f" stroke="#b71c1c" stroke-width="1"/>
                
                <!-- 南向指针（灰色） -->
                <path d="M 25 62 L 20 42 L 25 44 L 30 42 Z" fill="#757575" stroke="#424242" stroke-width="1"/>
                
                <!-- 中心点 -->
                <circle cx="25" cy="41" r="3" fill="#333"/>
                
                <!-- N标记 -->
                <text x="25" y="15" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#333" font-weight="bold">N</text>
            </svg>
        `
    };

    // 注册到全局样式对象
    if (!window.NorthArrowStyles) {
        window.NorthArrowStyles = {};
    }
    window.NorthArrowStyles['compact'] = NorthArrowCompactStyle;

})();

