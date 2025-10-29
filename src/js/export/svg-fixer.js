/**
 * SVG修复工具
 * 修复html2canvas对SVG元素的渲染问题
 * 策略: 将SVG转换为Canvas以确保正确渲染
 */

L.GISElements = L.GISElements || {};

class SVGFixer {
    constructor(map) {
        this.map = map;
        this.config = L.GISElements.ExportConfig;
    }

    /**
     * 修复克隆文档中的所有SVG问题
     */
    fixAll(clonedDoc) {
        this.fixGraticuleLabels(clonedDoc);
        this.fixSVGElements(clonedDoc);
    }

    /**
     * 修复格网标签位置
     * html2canvas对CSS transform支持不好,需要转换为绝对定位
     */
    fixGraticuleLabels(clonedDoc) {
        const originalLabels = document.querySelectorAll(
            this.config.SELECTORS.GRATICULE.LABELS
        );
        const clonedLabels = clonedDoc.querySelectorAll(
            this.config.SELECTORS.GRATICULE.LABELS
        );

        if (originalLabels.length === 0) return;

        const mapRect = this.map.getContainer().getBoundingClientRect();

        originalLabels.forEach((originalLabel, index) => {
            if (index >= clonedLabels.length) return;

            const clonedLabel = clonedLabels[index];
            const originalSpan = originalLabel.querySelector('span');
            const clonedSpan = clonedLabel.querySelector('span');

            if (!originalSpan || !clonedSpan) return;

            // 获取原始标签的渲染位置
            const rect = originalSpan.getBoundingClientRect();
            const left = rect.left - mapRect.left;
            const top = rect.top - mapRect.top;

            // 转换为绝对定位
            clonedLabel.style.cssText = `
                position: absolute !important;
                left: ${left}px !important;
                top: ${top}px !important;
                transform: none !important;
            `;

            clonedSpan.style.cssText = `
                transform: none !important;
                position: static !important;
                margin: 0 !important;
            `;
        });
    }

    /**
     * 修复SVG元素: 转换为Canvas
     */
    fixSVGElements(clonedDoc) {
        const originalPane = this.map.getContainer().querySelector(
            this.config.SELECTORS.LEAFLET_PANES.OVERLAY
        );
        const clonedPane = clonedDoc.querySelector(
            this.config.SELECTORS.LEAFLET_PANES.OVERLAY
        );

        if (!originalPane || !clonedPane) return;

        const originalSvg = originalPane.querySelector('svg');
        const clonedSvg = clonedPane.querySelector('svg');

        if (!originalSvg || !clonedSvg) return;

        this._convertSVGToCanvas(clonedDoc, originalSvg, clonedPane, clonedSvg);
    }

    /**
     * 将SVG转换为Canvas
     * @private
     */
    _convertSVGToCanvas(clonedDoc, originalSvg, clonedPane, clonedSvg) {
        const mapRect = this.map.getContainer().getBoundingClientRect();
        const svgRect = originalSvg.getBoundingClientRect();

        const left = svgRect.left - mapRect.left;
        const top = svgRect.top - mapRect.top;
        const width = Math.round(svgRect.width);
        const height = Math.round(svgRect.height);

        if (width <= 0 || height <= 0) {
            this._log('warn', 'SVG尺寸无效');
            return false;
        }

        // 创建Canvas
        const canvas = clonedDoc.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.cssText = `
            position: absolute;
            left: ${left}px;
            top: ${top}px;
            pointer-events: none;
        `;

        const ctx = canvas.getContext('2d');

        if (this._drawSVGToCanvas(originalSvg, canvas, ctx)) {
            clonedPane.innerHTML = '';
            clonedPane.appendChild(canvas);
            this._log('info', 'SVG转Canvas成功');
            return true;
        }

        this._log('warn', 'SVG转Canvas失败');
        return false;
    }

    /**
     * 手动将SVG路径绘制到Canvas
     * @private
     */
    _drawSVGToCanvas(svg, canvas, ctx) {
        const paths = svg.querySelectorAll('path');
        if (paths.length === 0) return false;

        // 获取SVG坐标变换参数
        const transform = this._getSVGTransform(svg, canvas);

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (transform) {
            ctx.translate(transform.offsetX, transform.offsetY);
            ctx.scale(transform.scaleX, transform.scaleY);
        }

        // 绘制所有路径
        let successCount = 0;
        paths.forEach(path => {
            if (this._drawPath(ctx, path)) {
                successCount++;
            }
        });

        ctx.restore();

        this._log('info', `绘制了 ${successCount}/${paths.length} 条路径`);
        return successCount > 0;
    }

    /**
     * 获取SVG变换参数
     * @private
     */
    _getSVGTransform(svg, canvas) {
        const viewBox = svg.getAttribute('viewBox');
        if (!viewBox) return null;

        const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(/\s+/).map(Number);
        const svgWidth = parseFloat(svg.getAttribute('width')) || canvas.width;
        const svgHeight = parseFloat(svg.getAttribute('height')) || canvas.height;

        return {
            offsetX: -vbX * (svgWidth / vbWidth),
            offsetY: -vbY * (svgHeight / vbHeight),
            scaleX: svgWidth / vbWidth,
            scaleY: svgHeight / vbHeight
        };
    }

    /**
     * 绘制单个路径
     * @private
     */
    _drawPath(ctx, path) {
        try {
            const d = path.getAttribute('d');
            if (!d) return false;

            const style = window.getComputedStyle(path);

            // 设置样式
            ctx.strokeStyle = style.stroke || path.getAttribute('stroke') || '#666';
            ctx.lineWidth = parseFloat(style.strokeWidth || path.getAttribute('stroke-width')) || 1;
            ctx.globalAlpha = parseFloat(style.opacity || path.getAttribute('opacity') || '1') *
                parseFloat(style.strokeOpacity || path.getAttribute('stroke-opacity') || '1');

            // 虚线样式
            this._applyDashArray(ctx, style, path);

            // 线条样式
            ctx.lineCap = style.strokeLinecap || 'butt';
            ctx.lineJoin = style.strokeLinejoin || 'miter';

            // 绘制
            ctx.beginPath();
            const path2d = new Path2D(d);
            ctx.stroke(path2d);

            return true;
        } catch (error) {
            this._log('error', '路径绘制失败', error);
            return false;
        }
    }

    /**
     * 应用虚线样式
     * @private
     */
    _applyDashArray(ctx, style, path) {
        const dashArray = style.strokeDasharray || path.getAttribute('stroke-dasharray');
        if (dashArray && dashArray !== 'none') {
            const dashes = dashArray
                .split(/[\s,]+/)
                .map(v => parseFloat(v))
                .filter(v => !isNaN(v));

            if (dashes.length > 0) {
                ctx.setLineDash(dashes);
                return;
            }
        }
        ctx.setLineDash([]);
    }

    /**
     * 日志输出
     * @private
     */
    _log(level, message, data = null) {
        if (!this.config.DEBUG && level === 'info') return;

        const prefix = '[SVGFixer]';
        const methods = { info: 'log', warn: 'warn', error: 'error' };
        const method = methods[level] || 'log';

        console[method](prefix, message, data || '');
    }
}

L.GISElements.SVGFixer = SVGFixer;
