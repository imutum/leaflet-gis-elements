/**
 * 导出预览默认样式
 */

(function () {
    'use strict';

    const ExportPreviewDefaultStyle = {
        name: '默认样式',

        render: () => {
            // 导出预览控件不渲染UI
            // 按钮等UI应在示例代码中实现，通过调用控件的公开方法
            return '';
        }
    };

    // 注册到 L.GISElements.StyleRegistry
    L.GISElements.StyleRegistry.register('export-preview', 'default', ExportPreviewDefaultStyle);

})();

