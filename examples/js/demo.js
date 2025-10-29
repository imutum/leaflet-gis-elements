/**
 * Demo 页面主脚本
 * 初始化地图和所有控件
 */

(function (window) {
    'use strict';

    function DemoApp() {
        this.map = null;
        this.controller = null;
        this.exportPreview = null;
        this.exporter = null;
        this.uiController = null;
    }

    /**
     * 初始化应用
     */
    DemoApp.prototype.init = function () {
        this.initMap();
        this.initControls();
        this.initExport();
        this.initUI();
        this.showAllControls();

        console.log('Demo 应用已加载');
        console.log('控制器:', this.controller);

        // 暴露到全局以便调试
        window.demoApp = this;
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
        var controls = config.controls;

        this.controller = new L.GISElements.MapController(this.map, {
            mapInfo: Object.assign({}, controls.mapInfo, {
                title: '',
                subtitle: '',
                author: '',
                organization: '',
                dataSource: '',
                projection: 'WGS84 / EPSG:4326',
                scale: '1:100000',
                notes: ''
            }),
            northArrow: controls.northArrow,
            scaleBar: controls.scaleBar,
            legend: Object.assign({}, controls.legend, {
                layers: config.sampleLayers
            }),
            graticule: controls.graticule
        });
    };

    /**
     * 初始化导出功能
     */
    DemoApp.prototype.initExport = function () {
        var config = window.DemoConfig.export;

        // 创建导出预览控件
        this.exportPreview = new L.Control.ExportPreview({
            position: 'topright',
            format: config.format,
            quality: config.quality,
            filename: config.filename,
            scale: config.scale,
            autoCalculateBounds: config.autoCalculateBounds
        });

        var exportControl = this.exportPreview.createControl();
        exportControl.addTo(this.map);

        // 获取底层的 MapExporter 实例
        this.exporter = exportControl.options.control.exporter;

        // 设置初始值
        if (this.exporter) {
            this.exporter.setScale(config.scale);
            this.exporter.setQuality(config.quality);
            this.exporter.setFilename(config.filename);
        }

        // 暴露到全局
        window.controller = this.controller;
        window.exportPreview = this.exportPreview;
        window.exporter = this.exporter;
    };

    /**
     * 初始化UI控制器
     */
    DemoApp.prototype.initUI = function () {
        var exportControl = this.exportPreview.createControl();
        this.uiController = new window.UIController(this.controller, exportControl, this.exporter);
        this.uiController.init();
    };

    /**
     * 显示所有控件
     */
    DemoApp.prototype.showAllControls = function () {
        this.controller.show('mapInfo');
        this.controller.show('northArrow');
        this.controller.show('scaleBar');
        this.controller.show('legend');
        this.controller.show('graticule');
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
