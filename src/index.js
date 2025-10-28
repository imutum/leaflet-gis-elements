/**
 * LeafletGISElements - Main Entry Point
 * 
 * 这是插件的主入口文件，webpack会从这里开始打包
 * 构建后生成单一的 JS 和 CSS 文件，可直接通过 CDN 使用
 */

// ==================== 导入 CSS ====================
import './css/main.css';

// ==================== 1. 常量配置 ====================
import './js/core/constants.js';

// ==================== 2. 核心工具 ====================
import './js/core/utils/storage.js';
import './js/core/utils/coordinate.js';
import './js/core/utils/draggable.js';

// ==================== 3. 样式注册器 ====================
import './js/style-registry.js';

// ==================== 4. 控件基类 ====================
import './js/core/base-control.js';
import './js/core/stylable-control.js';
import './js/core/map-exporter.js';

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
import './js/styles/scale-bar/style-striped.js';

// 图例样式
import './js/styles/legend/style-gis.js';
import './js/styles/legend/style-modern.js';

// 经纬网格样式
import './js/styles/graticule/style-simple.js';
import './js/styles/graticule/style-dense.js';

// ==================== 6. 控件实现 ====================
import './js/controls/north-arrow/north-arrow-control.js';
import './js/controls/scale-bar/scale-bar-control.js';
import './js/controls/legend/legend-control.js';
import './js/controls/graticule/graticule-control.js';
import './js/controls/graticule/graticule-style-panel.js';
import './js/controls/export/export-control.js';

// ==================== 7. 主控制器 ====================
import './js/map-controller.js';

// ==================== 8. 统一入口 ====================
import './js/leaflet-gis-elements-main.js';

// ==================== 导出 API ====================
// 所有模块已经挂载到 window.LeafletGISElements
// 这里直接导出供 UMD 模块使用
export default window.LeafletGISElements;

// 同时支持命名导出
export const {
    version,
    MapController,
    controls,
    utils,
    StyleRegistry,
    createController,
    getAvailableStyles,
    configure,
    config
} = window.LeafletGISElements;

