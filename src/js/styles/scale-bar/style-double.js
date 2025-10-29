/**
 * 双行对比样式
 * 显示公制和英制两种单位
 */

(function () {
    const ScaleBarDoubleStyle = {
        name: '双行对比',

        render: (scaleData) => {
            const { width, label, meters } = scaleData;

            // 计算英里数（1米 ≈ 0.000621371英里）
            const miles = (meters * 0.000621371).toFixed(2);
            const mileLabel = miles >= 1 ? miles + ' mi' : (miles * 5280).toFixed(0) + ' ft';

            return `
                <div class="lge-scale-bar-double" style="width: ${width}px;">
                    <div class="lge-scale-row">
                        <div class="lge-scale-bar-label">${label}</div>
                        <div class="lge-scale-bar-line">
                            <div class="lge-scale-segment" style="width: 50%; background: #000;"></div>
                            <div class="lge-scale-segment" style="width: 50%; background: #fff; border: 1px solid #000; border-left: none;"></div>
                        </div>
                    </div>
                    <div class="lge-scale-row">
                        <div class="lge-scale-bar-label">${mileLabel}</div>
                        <div class="lge-scale-bar-line">
                            <div class="lge-scale-segment" style="width: 50%; background: #555;"></div>
                            <div class="lge-scale-segment" style="width: 50%; background: #ddd; border: 1px solid #555; border-left: none;"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // 自动注册风格
    L.GISElements.StyleRegistry.register('scale-bar', 'double', ScaleBarDoubleStyle);
})();

