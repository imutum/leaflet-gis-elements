/**
 * Demo 页面主脚本
 * 初始化地图与示例功能
 *
 * 结构按照“配置 -> UI 创建 -> UI 交互 -> 前端功能逻辑”拆分
 */

(function (window) {
    'use strict';

    // ==================== 前端配置 ====================

    function getDemoConfig() {
        return window.DemoConfig;
    }

    // ==================== 前端 UI 创建 ====================

    function createMap(config) {
        const map = L.map('map').setView(config.map.center, config.map.zoom);

        L.tileLayer(config.basemap.url, {
            attribution: config.basemap.attribution,
            maxZoom: config.map.maxZoom
        }).addTo(map);

        return map;
    }

    function createController(map, config) {
        return new L.GISElements.MapController(map, {
            autoShow: true,
            mapInfo: {
                position: config.controls.mapInfo.position,
                style: config.controls.mapInfo.style,
                draggable: config.controls.mapInfo.draggable,
                title: '',
                subtitle: '',
                author: '',
                organization: '',
                dataSource: '',
                projection: 'WGS84 / EPSG:4326',
                scale: '1:100000',
                notes: ''
            },
            northArrow: config.controls.northArrow,
            scaleBar: config.controls.scaleBar,
            legend: Object.assign({}, config.controls.legend, {
                layers: config.sampleLayers
            }),
            graticule: config.controls.graticule,
            exportPreview: config.export
        });
    }

    function createUIBindings(controller) {
        const bindings = new window.UIBindings(controller);
        bindings.init();
        return bindings;
    }

    // ==================== 前端功能代码逻辑 ====================

    function DemoApp() {
        this.map = null;
        this.controller = null;
        this.uiBindings = null;
    }

    DemoApp.prototype.init = function () {
        const config = getDemoConfig();

        this.map = createMap(config);
        this.controller = createController(this.map, config);
        this.uiBindings = createUIBindings(this.controller);

        this.exposeForDebug();

        console.log('✓ Demo 应用已加载');
        console.log('✓ 地图控制器:', this.controller);
    };

    DemoApp.prototype.exposeForDebug = function () {
        window.demoApp = this;
        window.controller = this.controller;
    };

    // ==================== 前端 UI 交互 ====================

    window.togglePanel = function () {
        const panel = document.getElementById('controlPanel');
        if (panel) {
            panel.classList.toggle('panel-hidden');
        }
    };

    window.toggleSection = function (sectionId) {
        const section = document.getElementById(sectionId);
        const toggle = document.getElementById(sectionId.replace('Section', 'Toggle'));

        if (section && toggle) {
            const isHidden = section.style.display === 'none';
            section.style.display = isHidden ? 'block' : 'none';
            toggle.textContent = isHidden ? '▼' : '▶';
        }
    };

    // ==================== 启动入口 ====================

    function initDemo() {
        if (typeof L === 'undefined') {
            console.error('Leaflet 库未加载');
            return;
        }
        if (typeof L.GISElements === 'undefined') {
            console.error('LeafletGISElements 库未加载');
            return;
        }
        if (typeof window.DemoConfig === 'undefined') {
            console.error('DemoConfig 未加载');
            return;
        }

        const app = new DemoApp();
        app.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDemo);
    } else {
        initDemo();
    }

})(window);
