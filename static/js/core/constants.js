/**
 * 全局常量配置
 * 统一管理所有魔法数字和配置值
 */

// ==================== 拖动相关常量 ====================

/**
 * 拖动阈值（像素）
 * 鼠标移动超过此距离才认为是拖动操作
 */
const DRAG_THRESHOLD = 5;

/**
 * 拖动时的透明度
 */
const DRAG_OPACITY = 0.6;

/**
 * 拖动时的光标样式
 */
const DRAG_CURSOR = 'grabbing';

// ==================== 调整大小相关常量 ====================

/**
 * 最小边框尺寸（像素）
 */
const MIN_FRAME_WIDTH = 100;
const MIN_FRAME_HEIGHT = 100;

/**
 * 调整大小控制点尺寸（像素）
 */
const RESIZE_HANDLE_SIZE = 12;

/**
 * 控制点放大倍数（拖动时）
 */
const RESIZE_HANDLE_SCALE = 1.3;

/**
 * 控制点边框宽度（像素）
 */
const RESIZE_HANDLE_BORDER_WIDTH = 2;

// ==================== 边距和间距 ====================

/**
 * 导出边界的内边距（像素）
 */
const EXPORT_BOUNDS_PADDING = 10;

/**
 * 自动计算边界时的扩展边距（像素）
 */
const AUTO_BOUNDS_PADDING = 20;

/**
 * 控件之间的默认间距（像素）
 */
const CONTROL_SPACING = 10;

// ==================== Z-Index层级 ====================

/**
 * Z-Index层级定义
 * 确保各元素正确叠加
 */
const Z_INDEX = {
    MAP_BASE: 0,                    // 地图基础层
    GRATICULE_LINES: 100,           // 格网线
    GRATICULE_LABELS: 200,          // 格网标签
    GRATICULE_FRAME: 400,           // 格网边框
    EXPORT_PREVIEW: 500,            // 导出预览边框
    EXPORT_PREVIEW_HANDLES: 501,    // 导出预览控制点
    CONTROL_CONTAINER: 1000,        // 控件容器
    RESIZE_HANDLES: 1001,           // 调整大小控制点
    NOTIFICATION: 10000             // 通知消息
};

// ==================== 动画时长 ====================

/**
 * 过渡动画时长（毫秒）
 */
const TRANSITION_DURATION = 300;

/**
 * 通知消息显示时长（毫秒）
 */
const NOTIFICATION_DURATION = 2000;

/**
 * 地图渲染等待时长（毫秒）
 */
const MAP_RENDER_WAIT = 200;

// ==================== 颜色配置 ====================

/**
 * 默认颜色
 */
const COLORS = {
    FRAME_BORDER: '#333',           // 边框颜色
    PREVIEW_BORDER: '#ff6b6b',      // 预览边框颜色
    HANDLE_BG: '#fff',              // 控制点背景色
    HANDLE_BORDER: '#333',          // 控制点边框色
    SUCCESS: '#4CAF50',             // 成功提示色
    WARNING: '#ff9800',             // 警告提示色
    ERROR: '#f44336'                // 错误提示色
};

// ==================== 格网相关常量 ====================

/**
 * 格网默认配置
 */
const GRATICULE_DEFAULTS = {
    FRAME_LEFT: 100,                // 默认边框左边距
    FRAME_TOP: 100,                 // 默认边框上边距
    FRAME_WIDTH: 400,               // 默认边框宽度
    FRAME_HEIGHT: 300,              // 默认边框高度
    FRAME_WEIGHT: 2,                // 默认边框线宽
    FRAME_OPACITY: 0.8,             // 默认边框透明度
    LINE_COLOR: '#666',             // 默认线条颜色
    LINE_WEIGHT: 1,                 // 默认线条粗细
    LINE_OPACITY: 0.5,              // 默认线条透明度
    LABEL_FONT_SIZE: 11,            // 默认标签字体大小
    LABEL_FONT_FAMILY: 'Arial, sans-serif'  // 默认标签字体
};

/**
 * 格网间隔自动计算规则
 * 基于缩放级别
 */
const GRATICULE_INTERVALS = {
    17: 0.001,
    15: 0.005,
    13: 0.01,
    11: 0.05,
    9: 0.1,
    7: 0.5,
    5: 1,
    3: 5,
    DEFAULT: 10
};

// ==================== 导出相关常量 ====================

/**
 * 导出配置
 */
const EXPORT_DEFAULTS = {
    FORMAT: 'png',                  // 默认格式
    QUALITY: 1.0,                   // 默认质量
    SCALE: 2,                       // 导出分辨率倍数
    FILENAME: 'thematic_map',       // 默认文件名
    AREA: 'auto'                    // 默认导出区域类型
};

/**
 * 导出排除的元素选择器
 */
const EXPORT_EXCLUDE_SELECTORS = [
    '.leaflet-control-zoom',
    '.control-panel',
    '.toggle-panel',
    '.leaflet-control-attribution',
    '.leaflet-control-export'
];

/**
 * 导出包含的控件选择器（白名单）
 */
const EXPORT_INCLUDE_SELECTORS = [
    '.leaflet-control-legend',
    '.leaflet-control-scale-bar',
    '.leaflet-control-north-arrow',
    '.leaflet-control-graticule',
    '.graticule-frame',
    '.graticule-label'
];

// ==================== 控件默认配置 ====================

/**
 * 控件默认位置
 */
const CONTROL_POSITIONS = {
    NORTH_ARROW: 'topleft',
    SCALE_BAR: 'bottomleft',
    LEGEND: 'bottomright',
    EXPORT: 'topright',
    GRATICULE: 'topleft'
};

/**
 * 控件默认样式
 */
const CONTROL_DEFAULT_STYLES = {
    NORTH_ARROW: 'gis',
    SCALE_BAR: 'gis',
    LEGEND: 'gis'
};

/**
 * 控件默认尺寸
 */
const CONTROL_SIZES = {
    NORTH_ARROW: 80,                // 指北针默认大小
    SCALE_BAR_MAX_WIDTH: 150,       // 比例尺最大宽度
    LEGEND_MAX_WIDTH: 300,          // 图例最大宽度
    LEGEND_MAX_HEIGHT: 400          // 图例最大高度
};

// ==================== 存储键名 ====================

/**
 * LocalStorage 键名
 */
const STORAGE_KEYS = {
    NORTH_ARROW_POSITION: 'northArrowPosition',
    SCALE_BAR_POSITION: 'scaleBarPosition',
    LEGEND_POSITION: 'legendPosition',
    GRATICULE_FRAME: 'graticuleFrame'
};

// ==================== 事件名称 ====================

/**
 * 自定义事件名称
 */
const EVENTS = {
    CONTROL_POSITION_CHANGED: 'controlPositionChanged',
    CONTROL_STYLE_CHANGED: 'controlStyleChanged',
    GRATICULE_UPDATED: 'graticuleUpdated',
    EXPORT_STARTED: 'exportStarted',
    EXPORT_COMPLETED: 'exportCompleted',
    EXPORT_FAILED: 'exportFailed'
};

// ==================== 工具函数 ====================

/**
 * 获取格网间隔
 * @param {number} zoom - 缩放级别
 * @returns {number} 间隔值
 */
function getGraticuleInterval(zoom) {
    for (const [level, interval] of Object.entries(GRATICULE_INTERVALS)) {
        if (level === 'DEFAULT') continue;
        if (zoom >= parseInt(level)) {
            return interval;
        }
    }
    return GRATICULE_INTERVALS.DEFAULT;
}

// ==================== 导出 ====================

// 导出到全局
window.Constants = {
    // 拖动
    DRAG_THRESHOLD,
    DRAG_OPACITY,
    DRAG_CURSOR,

    // 调整大小
    MIN_FRAME_WIDTH,
    MIN_FRAME_HEIGHT,
    RESIZE_HANDLE_SIZE,
    RESIZE_HANDLE_SCALE,
    RESIZE_HANDLE_BORDER_WIDTH,

    // 边距
    EXPORT_BOUNDS_PADDING,
    AUTO_BOUNDS_PADDING,
    CONTROL_SPACING,

    // Z-Index
    Z_INDEX,

    // 动画
    TRANSITION_DURATION,
    NOTIFICATION_DURATION,
    MAP_RENDER_WAIT,

    // 颜色
    COLORS,

    // 格网
    GRATICULE_DEFAULTS,
    GRATICULE_INTERVALS,

    // 导出
    EXPORT_DEFAULTS,
    EXPORT_EXCLUDE_SELECTORS,
    EXPORT_INCLUDE_SELECTORS,

    // 控件
    CONTROL_POSITIONS,
    CONTROL_DEFAULT_STYLES,
    CONTROL_SIZES,

    // 存储
    STORAGE_KEYS,

    // 事件
    EVENTS,

    // 工具函数
    getGraticuleInterval
};

// 兼容旧代码：单独导出常用常量
window.DRAG_THRESHOLD = DRAG_THRESHOLD;
window.MIN_FRAME_SIZE = MIN_FRAME_WIDTH; // 向后兼容

