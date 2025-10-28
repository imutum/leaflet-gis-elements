/**
 * LeafletGISElements - 统一模块入口
 * 
 * 导出所有公共API和控件类
 * 使用方式：
 *   const leafletGIS = window.LeafletGISElements;
 *   const controller = leafletGIS.createController(map, options);
 */

(function (window) {
    'use strict';

    /**
     * LeafletGISElements 模块
     */
    const LeafletGISElements = {
        // 版本信息
        version: '1.0.0',

        // 核心控制器
        MapController: window.MapController,

        // 控件类
        controls: {
            BaseControl: window.BaseControl,
            StylableControl: window.StylableControl,
            LegendControl: window.LegendControl,
            ScaleBarControl: window.ScaleBarControl,
            NorthArrowControl: window.NorthArrowControl,
            GraticuleControl: window.GraticuleControl,
            ExportControl: window.ExportControl
        },

        // 工具类
        utils: {
            CoordinateConverter: window.CoordinateConverter,
            StorageManager: window.StorageManager,
            MapExporter: window.MapExporter
        },

        // 样式注册器
        StyleRegistry: window.StyleRegistry,

        /**
         * 快速创建控制器
         * @param {L.Map} map - Leaflet地图实例
         * @param {Object} options - 配置选项
         * @returns {MapController} 控制器实例
         */
        createController: function (map, options) {
            if (!map) {
                throw new Error('Map instance is required');
            }
            return new this.MapController(map, options);
        },

        /**
         * 获取可用样式列表
         * @param {string} controlType - 控件类型
         * @returns {Array} 样式列表
         */
        getAvailableStyles: function (controlType) {
            return this.StyleRegistry.list(controlType);
        },

        /**
         * 初始化配置
         * @param {Object} config - 全局配置
         */
        configure: function (config) {
            // 预留全局配置功能
            this.config = Object.assign({}, this.config, config);
        },

        // 默认配置
        config: {
            debug: false,
            autoSavePosition: true,
            storagePrefix: 'leaflet-gis-elements-'
        }
    };

    // 导出到全局
    window.LeafletGISElements = LeafletGISElements;

    // 向后兼容（保留旧名称）
    window.DragElements = LeafletGISElements;
    window.MapController = window.MapController || LeafletGISElements.MapController;

    console.log(`✓ LeafletGISElements v${LeafletGISElements.version} 已加载`);

})(window);

