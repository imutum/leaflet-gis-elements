/**
 * 模块加载顺序管理
 * 
 * 此文件定义了所有模块的加载顺序
 * 在HTML中只需引入此文件即可自动加载所有依赖
 */

(function () {
    'use strict';

    // 模块加载顺序
    const modules = [
        // 1. 常量配置（最先加载，其他模块可能依赖）
        'core/constants.js',

        // 2. 核心工具
        'core/utils/storage.js',
        'core/utils/coordinate.js',
        'core/utils/draggable.js',

        // 3. 样式注册器（需要在样式文件之前加载）
        'style-registry.js',

        // 4. 控件基类
        'core/base-control.js',
        'core/stylable-control.js',
        'core/map-exporter.js',

        // 5. 控件样式定义
        'styles/north-arrow/style-gis.js',
        'styles/north-arrow/style-leaflet.js',
        'styles/north-arrow/style-compact.js',
        'styles/north-arrow/style-compass.js',
        'styles/scale-bar/style-leaflet.js',
        'styles/scale-bar/style-gis.js',
        'styles/scale-bar/style-minimal.js',
        'styles/scale-bar/style-double.js',
        'styles/scale-bar/style-striped.js',
        'styles/legend/style-gis.js',
        'styles/legend/style-modern.js',
        'styles/graticule/style-simple.js',
        'styles/graticule/style-dense.js',

        // 6. 控件实现
        'controls/north-arrow/north-arrow-control.js',
        'controls/scale-bar/scale-bar-control.js',
        'controls/legend/legend-control.js',
        'controls/graticule/graticule-control.js',
        'controls/graticule/graticule-style-panel.js',
        'controls/export/export-control.js',

        // 7. 主控制器
        'map-controller.js',

        // 8. 统一入口
        'leaflet-gis-elements-main.js'
    ];

    const baseUrl = getScriptPath();

    /**
     * 获取当前脚本的基础路径
     */
    function getScriptPath() {
        const scripts = document.getElementsByTagName('script');
        const currentScript = scripts[scripts.length - 1];
        const src = currentScript.src;
        return src.substring(0, src.lastIndexOf('/') + 1);
    }

    /**
     * 动态加载脚本
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = baseUrl + src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load: ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * 顺序加载所有模块
     */
    async function loadAllModules() {
        console.log('开始加载 LeafletGISElements 模块...');
        const startTime = Date.now();

        for (const module of modules) {
            try {
                await loadScript(module);
            } catch (error) {
                console.error(`模块加载失败: ${module}`, error);
            }
        }

        const elapsed = Date.now() - startTime;
        console.log(`✓ 所有模块加载完成 (${elapsed}ms)`);

        // 触发自定义事件
        window.dispatchEvent(new Event('leaflet-gis-elements-loaded'));
        // 向后兼容（保留旧事件名）
        window.dispatchEvent(new Event('drag-elements-loaded'));
    }

    // 开始加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllModules);
    } else {
        loadAllModules();
    }

})();

