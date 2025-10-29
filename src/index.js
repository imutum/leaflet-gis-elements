/**
 * LeafletGISElements - Main Entry Point
 * 
 * 这是插件的主入口文件，webpack会从这里开始打包
 * 构建后生成单一的 JS 和 CSS 文件，可直接通过 CDN 使用
 */

// ==================== 导入 CSS ====================
// 只导入控件样式，不包含会污染其他项目的全局样式
import './css/controls.css';

// ==================== 1. 常量配置 ====================
import './js/constants.js';

// ==================== 2. 核心工具 ====================
import './js/utils/storage.js';
import './js/utils/coordinate.js';
import './js/utils/draggable.js';
import './js/utils/notification.js';

// ==================== 3. 样式注册器 ====================
import './js/controllers/style-registry.js';

// ==================== 4. 核心功能类 ====================
import './js/base/base-control.js';
import './js/base/stylable-control.js';

// ==================== 4.5. 导出系统 ====================
import './js/export/export-config.js';     // 导出配置
import './js/export/bounds-calculator.js'; // 边界计算器
import './js/export/svg-fixer.js';         // SVG修复工具
import './js/export/map-exporter.js';      // 地图导出器

// ==================== 5. 控件样式定义 ====================
// 指北针样式
import './js/styles/north-arrow/style-gis.js';
import './js/styles/north-arrow/style-leaflet.js';
import './js/styles/north-arrow/style-compact.js';
import './js/styles/north-arrow/style-compass.js';

// 比例尺样式
import './js/styles/scale-bar/style-leaflet.js';
import './js/styles/scale-bar/style-gis.js';
import './js/styles/scale-bar/style-minimal.js';
import './js/styles/scale-bar/style-double.js';

// 图例样式
import './js/styles/legend/style-gis.js';
import './js/styles/legend/style-modern.js';

// 经纬网格样式
import './js/styles/graticule/style-simple.js';
import './js/styles/graticule/style-dense.js';

// 地图注记样式
import './js/styles/map-info/style-professional.js';
import './js/styles/map-info/style-compact.js';

// 导出预览样式
import './js/styles/export-preview/style-default.js';

// ==================== 6. 控件实现 ====================
import './js/controls/north-arrow/north-arrow-control.js';
import './js/controls/scale-bar/scale-bar-control.js';
import './js/controls/legend/legend-control.js';
import './js/controls/graticule/graticule-control.js';
import './js/controls/map-info/map-info-control.js';
import './js/controls/export-preview/export-preview-control.js';

// ==================== 7. 主控制器 ====================
import './js/controllers/map-controller.js';

// ==================== 8. API导出 ====================
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

// ==================== UMD导出 ====================
// 所有模块已经挂载到 L.GISElements
// 这里直接导出供 UMD 模块使用
export default L.GISElements;

// 同时支持命名导出
export const {
    version,
    MapController,
    BaseControl,
    StylableControl,
    StyleRegistry,
    MapExporter,
    SVGFixer,
    BoundsCalculator,
    ExportConfig,
    Notification,
    Draggable,
    Resizable,
    createController,
    getAvailableStyles,
    configure,
    config
} = L.GISElements;

