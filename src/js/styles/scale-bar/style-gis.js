/**
 * GIS经典样式
 * 带上下边线的经典GIS比例尺样式
 */

(function () {
    const ScaleBarGISClassicStyle = {
        name: 'GIS经典',

        render: (scaleData) => {
            const { width, label } = scaleData;

            return `
                <div class="scale-bar-gis-classic" style="width: ${width}px;">
                    <div class="scale-bar-line-top"></div>
                    <div class="scale-bar-segments">
                        <div class="scale-segment-black"></div>
                        <div class="scale-segment-white"></div>
                    </div>
                    <div class="scale-bar-line-bottom"></div>
                    <div class="scale-bar-label">${label}</div>
                </div>
            `;
        }
    };

    // 自动注册风格
    L.GISElements.StyleRegistry.register('scale-bar', 'gis', ScaleBarGISClassicStyle);
})();

