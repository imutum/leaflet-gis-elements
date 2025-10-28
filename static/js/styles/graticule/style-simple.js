/**
 * 简单样式
 * 简洁的经纬度格网样式
 */

(function () {
    const GraticuleSimpleStyle = {
        name: '简单样式',

        /**
         * 获取格网线样式
         */
        getLineStyle: (control) => {
            return {
                color: control.color || '#666',
                weight: control.weight || 1,
                opacity: control.opacity || 0.5,
                dashArray: '3, 5',
                interactive: false
            };
        },

        /**
         * 获取标注样式
         */
        getLabelStyle: (control) => {
            return {
                className: 'graticule-label-simple'
            };
        },

        /**
         * 渲染控件面板
         */
        render: (control) => {
            const lngInterval = control.getLngInterval();
            const latInterval = control.getLatInterval();

            return `
                <div class="graticule-simple-container">
                    <div class="graticule-simple-header">
                        <span class="graticule-simple-title">格网</span>
                        <label class="graticule-simple-switch">
                            <input type="checkbox" class="graticule-toggle" ${control.enabled ? 'checked' : ''}>
                            <span class="graticule-simple-slider"></span>
                        </label>
                    </div>
                    ${control.enabled ? `
                        <div class="graticule-simple-info">
                            <div class="graticule-interval-item">
                                <span class="graticule-interval-label">边框:</span>
                                <label class="graticule-simple-switch" style="width: 32px; height: 16px;">
                                    <input type="checkbox" class="graticule-frame-toggle" ${control.frameEnabled ? 'checked' : ''}>
                                    <span class="graticule-simple-slider" style="border-radius: 16px;"></span>
                                </label>
                            </div>
                            <div class="graticule-interval-item">
                                <span class="graticule-interval-label">经度:</span>
                                <span class="graticule-interval-value">${lngInterval}°</span>
                            </div>
                            <div class="graticule-interval-item">
                                <span class="graticule-interval-label">纬度:</span>
                                <span class="graticule-interval-value">${latInterval}°</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    };

    // 自动注册样式
    window.StyleRegistry.register('graticule', 'simple', GraticuleSimpleStyle);
})();

