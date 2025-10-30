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
     * 预设配置
     */
    presets: {
        // 学术样式预设
        academic: {
            autoShow: true,
            northArrow: {
                style: 'gis',
                position: 'topleft',
                size: 80,
                draggable: true
            },
            scaleBar: {
                style: 'gis',
                position: 'bottomleft',
                maxWidth: 200,
                draggable: true
            },
            legend: {
                style: 'gis',
                position: 'bottomright',
                layers: [],
                draggable: true
            },
            mapInfo: {
                style: 'professional',
                position: 'topright',
                draggable: true,
                title: '专题地图',
                subtitle: '',
                author: '',
                organization: '',
                date: new Date().toISOString().split('T')[0],
                dataSource: '',
                projection: '',
                scale: '',
                notes: ''
            },
            graticule: {
                enabled: true,
                interval: 'auto',
                showLines: true,
                showFrame: true,
                draggable: true
            },
            exportPreview: {
                format: 'png',
                quality: 1.0,
                scale: 2
            }
        }
    },

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
     * 快速启动 - 一行代码完成所有配置（最简单的使用方式）
     * @param {L.Map} map - Leaflet地图实例
     * @param {Object} options - 快速配置选项
     * @param {string} [options.preset] - 预设名称: academic, web, print, minimal
     * @param {string} [options.title] - 地图标题
     * @param {string} [options.subtitle] - 地图副标题
     * @param {string} [options.author] - 作者/制图者
     * @param {string} [options.organization] - 制图单位
     * @param {string} [options.dataSource] - 数据来源
     * @param {Array} [options.layers] - 图例图层数组
     * @param {Object} [options.overrides] - 覆盖预设的其他配置
     * @returns {MapController} 控制器实例
     * 
     * @example
     * // 最简单的用法 - 使用学术样式预设
     * L.GISElements.quickStart(map);
     * 
     * @example
     * // 自定义内容
     * L.GISElements.quickStart(map, {
     *     title: '北京市温度分布图',
     *     subtitle: '2025年10月气温数据',
     *     author: '张三',
     *     layers: [
     *         { name: '温度', type: 'gradient', colors: ['#0000ff', '#ff0000'], labels: ['-10°C', '30°C'] }
     *     ]
     * });
     */
    quickStart: function (map, options = {}) {
        if (!map) {
            throw new Error('Map instance is required');
        }

        // 使用学术样式预设
        const preset = this.presets[options.preset || 'academic'];

        // 合并预设配置和用户覆盖配置
        const config = Object.assign({}, preset, options.overrides || {});

        // 创建控制器
        const controller = new this.MapController(map, config);

        // 快速设置地图信息（如果提供）
        if (options.title || options.subtitle || options.author || options.organization || options.dataSource) {
            const mapInfo = controller.getControl('mapInfo');
            if (mapInfo) {
                if (options.title) mapInfo.setTitle(options.title);
                if (options.subtitle) mapInfo.setSubtitle(options.subtitle);
                if (options.author) mapInfo.setAuthor(options.author);
                if (options.organization) mapInfo.setOrganization(options.organization);
                if (options.dataSource) mapInfo.setDataSource(options.dataSource);
            }
        }

        // 快速设置图例图层（如果提供）
        if (options.layers && Array.isArray(options.layers)) {
            controller.updateLegendLayers(options.layers);
        }

        return controller;
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

