/**
 * Leaflet经典样式
 * 黑白交替的经典比例尺样式
 */

(function () {
    const ScaleBarLeafletStyle = {
        name: 'Leaflet经典',

        render: (scaleData) => {
            const { width, label } = scaleData;

            return `
                <div class="scale-bar-leaflet" style="width: ${width}px;">
                    <div class="scale-bar-label">${label}</div>
                    <div class="scale-bar-line">
                        <div class="scale-segment" style="width: 50%; background: #000;"></div>
                        <div class="scale-segment" style="width: 50%; background: #fff; border: 1px solid #000; border-left: none;"></div>
                    </div>
                </div>
            `;
        }
    };

    // 自动注册风格
    L.GISElements.StyleRegistry.register('scale-bar', 'leaflet', ScaleBarLeafletStyle);
})();

