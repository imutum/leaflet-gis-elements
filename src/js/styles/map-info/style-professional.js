/**
 * 地图注记样式 - 专业版
 * 适合正式的GIS专题图输出
 */

L.GISElements = L.GISElements || {};
L.GISElements.StyleRegistry = L.GISElements.StyleRegistry || {};

L.GISElements.StyleRegistry.register('map-info', 'professional', {
    id: 'professional',
    name: '专业版',
    description: '标准GIS专题图样式，适合正式出版',

    render(info) {
        const parts = [];

        // 标题
        if (info.title) {
            parts.push(`
                <div class="lge-map-info-title">
                    ${this._escapeHtml(info.title)}
                </div>
            `);
        }

        // 副标题
        if (info.subtitle) {
            parts.push(`
                <div class="lge-map-info-subtitle">
                    ${this._escapeHtml(info.subtitle)}
                </div>
            `);
        }

        // 分隔线
        if (info.title || info.subtitle) {
            parts.push('<div class="lge-map-info-divider"></div>');
        }

        // 制图信息
        const metadata = [];

        if (info.author) {
            metadata.push(`<div class="lge-map-info-item">
                <span class="lge-map-info-label">制图者：</span>
                <span class="lge-map-info-value">${this._escapeHtml(info.author)}</span>
            </div>`);
        }

        if (info.organization) {
            metadata.push(`<div class="lge-map-info-item">
                <span class="lge-map-info-label">制图单位：</span>
                <span class="lge-map-info-value">${this._escapeHtml(info.organization)}</span>
            </div>`);
        }

        if (info.date) {
            metadata.push(`<div class="lge-map-info-item">
                <span class="lge-map-info-label">制图日期：</span>
                <span class="lge-map-info-value">${this._escapeHtml(info.date)}</span>
            </div>`);
        }

        if (info.dataSource) {
            metadata.push(`<div class="lge-map-info-item">
                <span class="lge-map-info-label">数据来源：</span>
                <span class="lge-map-info-value">${this._escapeHtml(info.dataSource)}</span>
            </div>`);
        }

        if (info.projection) {
            metadata.push(`<div class="lge-map-info-item">
                <span class="lge-map-info-label">坐标系统：</span>
                <span class="lge-map-info-value">${this._escapeHtml(info.projection)}</span>
            </div>`);
        }

        if (info.scale) {
            metadata.push(`<div class="lge-map-info-item">
                <span class="lge-map-info-label">比例尺：</span>
                <span class="lge-map-info-value">${this._escapeHtml(info.scale)}</span>
            </div>`);
        }

        if (metadata.length > 0) {
            parts.push(`
                <div class="lge-map-info-metadata">
                    ${metadata.join('')}
                </div>
            `);
        }

        // 备注
        if (info.notes) {
            parts.push(`
                <div class="lge-map-info-notes">
                    ${this._escapeHtml(info.notes)}
                </div>
            `);
        }

        return parts.join('');
    },

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});

