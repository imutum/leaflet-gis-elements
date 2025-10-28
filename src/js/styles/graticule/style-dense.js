/**
 * 密集样式
 * 更密集的经纬度格网样式，适合精确定位
 */

(function () {
    const GraticuleDenseStyle = {
        name: '密集样式',

        /**
         * 获取格网线样式
         */
        getLineStyle: (control) => {
            return {
                color: control.color || '#4A90E2',
                weight: control.weight || 0.8,
                opacity: control.opacity || 0.4,
                dashArray: '2, 3',
                interactive: false
            };
        },

        /**
         * 获取标注样式
         */
        getLabelStyle: (control) => {
            return {
                className: 'graticule-label-dense'
            };
        },

        /**
         * 渲染控件面板
         */
        render: (control) => {
            const lngInterval = control.getLngInterval();
            const latInterval = control.getLatInterval();

            return `
                <div class="graticule-dense-container">
                    <div class="graticule-dense-header">
                        <span class="graticule-dense-title">经纬度格网</span>
                        <label class="graticule-dense-switch">
                            <input type="checkbox" class="graticule-toggle" ${control.enabled ? 'checked' : ''}>
                            <span class="graticule-dense-slider"></span>
                        </label>
                    </div>
                    ${control.enabled ? `
                        <div class="graticule-dense-info">
                            <div class="graticule-interval-item" style="margin-bottom: 6px;">
                                <span class="graticule-interval-label">边框窗格:</span>
                                <label class="graticule-dense-switch" style="width: 36px; height: 18px;">
                                    <input type="checkbox" class="graticule-frame-toggle" ${control.frameEnabled ? 'checked' : ''}>
                                    <span class="graticule-dense-slider" style="border-radius: 18px;"></span>
                                </label>
                            </div>
                            <div class="graticule-dense-interval">
                                <span>经度: ${lngInterval}°</span>
                                <span>纬度: ${latInterval}°</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    };

    // 自动注册样式
    L.GISElements.StyleRegistry.register('graticule', 'dense', GraticuleDenseStyle);
})();

