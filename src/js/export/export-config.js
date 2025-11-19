/**
 * 导出功能配置常量
 */

L.GISElements = L.GISElements || {};

L.GISElements.ExportConfig = {
    // 默认导出设置
    DEFAULTS: {
        FORMAT: 'png',
        QUALITY: 1.0,
        SCALE: 2,
        BACKGROUND_COLOR: '#ffffff',
        INCLUDE_BASEMAP: true,
        FILENAME: 'map_export'
    },

    // 边界计算设置
    BOUNDS: {
        DEFAULT_PADDING: 10,
        MIN_WIDTH: 100,
        MIN_HEIGHT: 100,
        DEFAULT_PREVIEW: {
            left: 100,
            top: 100,
            width: 600,
            height: 400
        }
    },

    // UI元素选择器
    SELECTORS: {
        GIS_ELEMENTS: [
            '.lge-graticule-frame',
            '.lge-graticule-label',
            '.lge-control-legend',
            '.lge-control-scale-bar',
            '.lge-control-north-arrow'
        ],
        GRATICULE: {
            FRAME: '.lge-graticule-frame',
            LABELS: '.lge-graticule-label'
        },
        LEAFLET_PANES: {
            TILE: '.leaflet-tile-pane',
            OVERLAY: '.leaflet-overlay-pane',
            SHADOW: '.leaflet-shadow-pane',
            MARKER: '.leaflet-marker-pane',
            TOOLTIP: '.leaflet-tooltip-pane',
            POPUP: '.leaflet-popup-pane'
        }
    },

    // 预览边框样式
    PREVIEW: {
        BORDER_COLOR: '#ff6b6b',
        BORDER_WIDTH: 2,
        BACKGROUND_ALPHA: 0.1,
        HINT_TEXT: '导出范围（可拖动调整）'
    },

    // 渲染等待时间(毫秒)
    RENDER_WAIT_TIME: 500,

    // html2canvas配置
    HTML2CANVAS: {
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 0,
        removeContainer: false
    },

    // 调试模式
    DEBUG: false
};

