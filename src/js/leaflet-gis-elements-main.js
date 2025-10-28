/**
 * LeafletGISElements - 统一模块入口
 * 
 * 导出所有公共API和控件类
 * 使用方式：
 *   const controller = new L.GISElements.MapController(map, options);
 *   或使用工厂方法：
 *   const northArrow = L.control.northArrow({...}).addTo(map);
 */

(function (window) {
    'use strict';

    // 确保 L.GISElements 命名空间已初始化
    L.GISElements = L.GISElements || {};

    /**
     * LeafletGISElements 模块扩展
     */
    Object.assign(L.GISElements, {
        // 版本信息
        version: '1.0.0',

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
    });

    console.log(`✓ Leaflet GIS Elements v${L.GISElements.version} 已加载`);
    console.log('命名空间：L.GISElements');
    console.log('控件类：L.Control.NorthArrow, L.Control.ScaleBar, L.Control.Legend 等');
    console.log('工厂方法：L.control.northArrow(), L.control.scaleBar(), L.control.legend() 等');

})(window);

