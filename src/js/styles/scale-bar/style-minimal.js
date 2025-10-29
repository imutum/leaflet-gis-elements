/**
 * 简约线条样式
 * 极简主义风格，只有一条顶线
 */

(function () {
    const ScaleBarMinimalStyle = {
        name: '简约线条',

        render: (scaleData) => {
            const { width, label } = scaleData;

            return `
                <div class="lge-scale-bar-minimal" style="width: ${width}px;">
                    <div class="lge-scale-bar-top-line"></div>
                    <div class="lge-scale-bar-label">${label}</div>
                </div>
            `;
        }
    };

    // 自动注册风格
    L.GISElements.StyleRegistry.register('scale-bar', 'minimal', ScaleBarMinimalStyle);
})();

