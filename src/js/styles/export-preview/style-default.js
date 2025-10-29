/**
 * 导出预览默认样式
 */

(function () {
    'use strict';

    const ExportPreviewDefaultStyle = {
        name: '默认样式',

        render: () => {
            return `
                <div class="lge-export-preview-buttons">
                    <button class="lge-export-preview-btn" title="显示/隐藏预览边框">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <rect x="2" y="2" width="16" height="16" 
                                  fill="none" stroke="currentColor" 
                                  stroke-width="2" stroke-dasharray="2,2"/>
                            <circle cx="10" cy="10" r="3" fill="currentColor"/>
                        </svg>
                        <span>预览</span>
                    </button>
                    <button class="lge-export-btn" title="导出地图">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M10 2 L10 12 M10 12 L7 9 M10 12 L13 9" 
                                  fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M4 14 L4 18 L16 18 L16 14" 
                                  fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span>导出</span>
                    </button>
                </div>
            `;
        }
    };

    // 注册到 L.GISElements.StyleRegistry
    L.GISElements.StyleRegistry.register('export-preview', 'default', ExportPreviewDefaultStyle);

})();

