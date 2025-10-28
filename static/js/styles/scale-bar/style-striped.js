/**
 * GIS专业样式
 * betterscale风格，棋盘格交替样式
 */

(function () {
    const ScaleBarGISStyle = {
        name: 'GIS专业',

        render: (scaleData) => {
            const { width, label, meters } = scaleData;

            // 计算中间值和终点值（中间值也需要舍入）
            const halfMeters = meters / 2;
            const fullValue = meters;

            // 格式化标签（整数或 .5 结尾的小数）
            let middleLabel, endLabel;
            if (fullValue >= 1000) {
                const halfKm = halfMeters / 1000;
                middleLabel = halfKm % 1 === 0 ? halfKm : halfKm;
                const fullKm = fullValue / 1000;
                endLabel = (fullKm % 1 === 0 ? fullKm : fullKm.toFixed(1)) + ' km';
            } else {
                middleLabel = halfMeters % 1 === 0 ? halfMeters : halfMeters;
                endLabel = (fullValue % 1 === 0 ? fullValue : fullValue.toFixed(1)) + ' m';
            }

            return `
                <div class="scale-bar-gis" style="width: ${width}px;">
                    <div class="scale-bar-ruler">
                        <!-- 上排：黑-白-黑-白 -->
                        <div class="scale-segment scale-segment-black" style="top: 0; left: 0; width: 25%;"></div>
                        <div class="scale-segment scale-segment-white" style="top: 0; left: 25%; width: 25%;"></div>
                        <div class="scale-segment scale-segment-black" style="top: 0; left: 50%; width: 25%;"></div>
                        <div class="scale-segment scale-segment-white" style="top: 0; left: 75%; width: 25%;"></div>
                        <!-- 下排：白-黑-白-黑 -->
                        <div class="scale-segment scale-segment-white" style="top: 50%; left: 0; width: 25%;"></div>
                        <div class="scale-segment scale-segment-black" style="top: 50%; left: 25%; width: 25%;"></div>
                        <div class="scale-segment scale-segment-white" style="top: 50%; left: 50%; width: 25%;"></div>
                        <div class="scale-segment scale-segment-black" style="top: 50%; left: 75%; width: 25%;"></div>
                    </div>
                    <div class="scale-bar-labels">
                        <div class="scale-label scale-label-start">0</div>
                        <div class="scale-label scale-label-middle">${middleLabel}</div>
                        <div class="scale-label scale-label-end">${endLabel}</div>
                    </div>
                </div>
            `;
        }
    };

    // 自动注册风格
    window.StyleRegistry.register('scale-bar', 'gis', ScaleBarGISStyle);
})();

