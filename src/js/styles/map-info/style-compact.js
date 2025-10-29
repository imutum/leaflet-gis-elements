/**
 * 地图注记样式 - 紧凑版
 * 简洁风格，占用更少空间
 */

L.GISElements = L.GISElements || {};
L.GISElements.StyleRegistry = L.GISElements.StyleRegistry || {};

L.GISElements.StyleRegistry.register('map-info', 'compact', {
    id: 'compact',
    name: '紧凑版',
    description: '简洁风格，适合空间有限的地图',

    render(info) {
        const parts = [];

        // 标题
        if (info.title) {
            parts.push(`
                <div class="lge-map-info-title-compact">
                    ${this._escapeHtml(info.title)}
                </div>
            `);
        }

        // 副标题
        if (info.subtitle) {
            parts.push(`
                <div class="lge-map-info-subtitle-compact">
                    ${this._escapeHtml(info.subtitle)}
                </div>
            `);
        }

        // 制图信息（紧凑排列）
        const metadata = [];

        if (info.author) {
            metadata.push(this._escapeHtml(info.author));
        }

        if (info.organization) {
            metadata.push(this._escapeHtml(info.organization));
        }

        if (info.date) {
            metadata.push(this._escapeHtml(info.date));
        }

        if (metadata.length > 0) {
            parts.push(`
                <div class="lge-map-info-metadata-compact">
                    ${metadata.join(' · ')}
                </div>
            `);
        }

        // 其他信息
        const extra = [];

        if (info.dataSource) {
            extra.push(`来源: ${this._escapeHtml(info.dataSource)}`);
        }

        if (info.projection) {
            extra.push(this._escapeHtml(info.projection));
        }

        if (info.scale) {
            extra.push(this._escapeHtml(info.scale));
        }

        if (extra.length > 0) {
            parts.push(`
                <div class="lge-map-info-extra-compact">
                    ${extra.join(' | ')}
                </div>
            `);
        }

        // 备注
        if (info.notes) {
            parts.push(`
                <div class="lge-map-info-notes-compact">
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

