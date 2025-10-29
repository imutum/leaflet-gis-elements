/**
 * 现代样式
 * 现代化的图例样式
 */

(function () {
    const LegendModernStyle = {
        name: '现代样式',

        renderContainer: (layers) => {
            if (!layers || layers.length === 0) {
                return `
                    <div class="lge-legend-modern-container">
                        <div class="lge-legend-modern-header">
                            <span class="lge-legend-modern-title">图例</span>
                        </div>
                        <div class="lge-legend-modern-content">
                            <div class="lge-legend-modern-empty">暂无图层</div>
                        </div>
                    </div>
                `;
            }

            const itemsHtml = layers.map(layer =>
                `<div class="lge-legend-modern-item">${LegendModernStyle.renderItem(layer)}</div>`
            ).join('');

            return `
                <div class="lge-legend-modern-container">
                    <div class="lge-legend-modern-header">
                        <span class="lge-legend-modern-title">图例</span>
                    </div>
                    <div class="lge-legend-modern-content">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        },

        renderItem: (layer) => {
            let content = `<div class="lge-legend-modern-layer-name">${layer.name || '未命名图层'}</div>`;

            if (layer.type === 'gradient') {
                content += LegendModernStyle.renderGradientLegend(layer);
            } else {
                content += LegendModernStyle.renderSimpleLegend(layer);
            }

            return content;
        },

        renderGradientLegend: (layer) => {
            const colors = layer.colors || ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'];
            const labels = layer.labels || ['低', '', '', '', '高'];
            const unit = layer.unit || '';

            const gradient = `linear-gradient(to right, ${colors.join(', ')})`;

            return `
                <div class="lge-legend-modern-gradient">
                    <div class="lge-legend-modern-colorbar" style="background: ${gradient};"></div>
                    <div class="lge-legend-modern-labels">
                        ${labels.map(label => `<span class="lge-legend-modern-label">${label}</span>`).join('')}
                    </div>
                    ${unit ? `<div class="lge-legend-modern-unit">${unit}</div>` : ''}
                </div>
            `;
        },

        renderSimpleLegend: (layer) => {
            const color = layer.color || '#3388ff';
            const type = layer.type || 'polygon';
            const fillOpacity = layer.fillOpacity !== undefined ? layer.fillOpacity : 0.8;

            let symbolHtml = '';

            switch (type) {
                case 'point':
                    // 圆形点
                    symbolHtml = `<div class="lge-legend-modern-symbol-point" style="background: ${color};"></div>`;
                    break;
                case 'line':
                    // 线条
                    symbolHtml = `<div class="lge-legend-modern-symbol-line" style="background: ${color};"></div>`;
                    break;
                case 'polygon':
                default:
                    // 矩形（面）
                    symbolHtml = `<div class="lge-legend-modern-symbol-polygon" style="background: ${color}; opacity: ${fillOpacity};"></div>`;
                    break;
            }

            return `
                <div class="lge-legend-modern-simple">
                    ${symbolHtml}
                </div>
            `;
        }
    };

    // 自动注册风格
    L.GISElements.StyleRegistry.register('legend', 'modern', LegendModernStyle);
})();

