/**
 * GIS专业样式
 * 专业GIS图例样式
 */

(function () {
    const LegendGISStyle = {
        name: 'GIS专业',

        renderContainer: (layers) => {
            if (!layers || layers.length === 0) {
                return `
                    <div class="lge-legend-gis-container">
                        <div class="lge-legend-gis-title">图例</div>
                        <div class="lge-legend-gis-no-layer">无图层</div>
                    </div>
                `;
            }

            const itemsHtml = layers.map((layer, index) => {
                const marginTop = index > 0 ? 'style="margin-top: 8px;"' : '';
                return `<div class="lge-legend-gis-item" ${marginTop}>${LegendGISStyle.renderItem(layer)}</div>`;
            }).join('');

            return `
                <div class="lge-legend-gis-container">
                    <div class="lge-legend-gis-title">图例</div>
                    ${itemsHtml}
                </div>
            `;
        },

        renderItem: (layer) => {
            let content = `<div class="lge-legend-gis-layer-name">${layer.name || '未命名图层'}</div>`;

            if (layer.type === 'gradient') {
                content += LegendGISStyle.renderGradientLegend(layer);
            } else {
                content += LegendGISStyle.renderSimpleLegend(layer);
            }

            return content;
        },

        renderGradientLegend: (layer) => {
            const colors = layer.colors || ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'];
            const labels = layer.labels || ['低', '', '', '', '高'];
            const unit = layer.unit || '';

            // 创建渐变色带
            const gradient = `linear-gradient(to right, ${colors.join(', ')})`;

            return `
                <div class="lge-legend-gis-gradient">
                    <div class="lge-legend-gis-colorbar" style="background: ${gradient};"></div>
                    <div class="lge-legend-gis-labels">
                        ${labels.map(label => `<div class="lge-legend-gis-label">${label}</div>`).join('')}
                    </div>
                    ${unit ? `<div class="lge-legend-gis-unit">${unit}</div>` : ''}
                </div>
            `;
        },

        renderSimpleLegend: (layer) => {
            const color = layer.color || '#3388ff';
            const fillOpacity = layer.fillOpacity !== undefined ? layer.fillOpacity : 0.5;
            const type = layer.type || 'polygon';

            let symbolHtml = '';

            switch (type) {
                case 'point':
                    // 圆形点
                    symbolHtml = `<div class="lge-legend-gis-symbol-point" style="background: ${color};"></div>`;
                    break;
                case 'line':
                    // 线条
                    symbolHtml = `<div class="lge-legend-gis-symbol-line" style="background: ${color};"></div>`;
                    break;
                case 'polygon':
                default:
                    // 矩形（面）
                    symbolHtml = `<div class="lge-legend-gis-symbol-polygon" style="background: ${LegendGISStyle.hexToRgba(color, fillOpacity)}; border: 2px solid ${color};"></div>`;
                    break;
            }

            return `
                <div class="lge-legend-gis-simple">
                    ${symbolHtml}
                </div>
            `;
        },

        hexToRgba: (hex, alpha) => {
            hex = hex.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    };

    // 自动注册风格
    L.GISElements.StyleRegistry.register('legend', 'gis', LegendGISStyle);
})();

