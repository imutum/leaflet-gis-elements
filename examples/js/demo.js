/**
 * Demo 页面主脚本
 * 初始化地图和所有控件
 */

(function (window) {
    'use strict';

    function DemoApp() {
        this.map = null;
        this.controller = null;
        this.uiBindings = null;
    }

    /**
     * 初始化应用
     */
    DemoApp.prototype.init = function () {
        this.initMap();
        this.initControls();
        this.initUI();

        console.log('✓ Demo 应用已加载');
        console.log('✓ 地图控制器:', this.controller);
        console.log('✓ 使用简化的UI绑定架构（统一调用MapController高级API）');

        // 暴露到全局以便调试
        window.demoApp = this;
        window.controller = this.controller;
    };

    /**
     * 初始化地图
     */
    DemoApp.prototype.initMap = function () {
        var config = window.DemoConfig;
        var center = config.map.center;
        var zoom = config.map.zoom;

        this.map = L.map('map').setView(center, zoom);

        // 添加底图
        L.tileLayer(config.basemap.url, {
            attribution: config.basemap.attribution,
            maxZoom: config.map.maxZoom
        }).addTo(this.map);
    };

    /**
     * 初始化控件
     */
    DemoApp.prototype.initControls = function () {
        var config = window.DemoConfig;

        // 使用统一的MapController管理所有控件（包括导出控件）
        this.controller = new L.GISElements.MapController(this.map, {
            autoShow: true, // 自动显示所有控件
            mapInfo: {
                position: config.controls.mapInfo.position,
                style: config.controls.mapInfo.style,
                draggable: config.controls.mapInfo.draggable,
                // 空值字段，由用户填写
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
            exportPreview: config.export // 导出控件配置
        });
    };

    /**
     * 初始化UI绑定（直接调用MapController高级API）
     */
    DemoApp.prototype.initUI = function () {
        // 使用统一的UIBindings，所有功能都通过MapController高级API实现
        this.uiBindings = new window.UIBindings(this.controller);
        this.uiBindings.init();
    };

    // 全局函数：切换控制面板
    window.togglePanel = function () {
        var panel = document.getElementById('controlPanel');
        if (panel) {
            panel.classList.toggle('panel-hidden');
        }
    };

    // 全局函数：切换区域折叠
    window.toggleSection = function (sectionId) {
        var section = document.getElementById(sectionId);
        var toggle = document.getElementById(sectionId.replace('Section', 'Toggle'));

        if (section && toggle) {
            if (section.style.display === 'none') {
                section.style.display = 'block';
                toggle.textContent = '▼';
            } else {
                section.style.display = 'none';
                toggle.textContent = '▶';
            }
        }
    };

    // DOM 加载完成后初始化
    function initDemo() {
        // 检查依赖是否加载
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

        var app = new DemoApp();
        app.init();
    }

    // 使用多种方式确保 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDemo);
    } else {
        // DOM 已经加载完成
        initDemo();
    }

})(window);
