/**
 * 地图注记控件
 * 显示地图标题、副标题、制图信息、数据来源、坐标系统等
 * 这是GIS专题图的重要组成部分
 */

L.GISElements = L.GISElements || {};

class MapInfoControl extends L.GISElements.StylableControl {
    constructor(options = {}) {
        super({
            position: options.position || 'topleft',
            draggable: options.draggable !== false,
            storageKey: 'mapInfoPosition',
            style: options.style || 'professional'
        });

        // 地图信息
        this.info = {
            title: options.title || '',
            subtitle: options.subtitle || '',
            author: options.author || '',
            organization: options.organization || '',
            date: options.date || this._getCurrentDate(),
            dataSource: options.dataSource || '',
            projection: options.projection || 'WGS84 / EPSG:4326',
            scale: options.scale || '1:100000',
            notes: options.notes || ''
        };

        // 显示配置
        this.showConfig = {
            title: options.showTitle !== false,
            subtitle: options.showSubtitle !== false,
            author: options.showAuthor !== false,
            organization: options.showOrganization !== false,
            date: options.showDate !== false,
            dataSource: options.showDataSource !== false,
            projection: options.showProjection !== false,
            scale: options.showScale !== false,
            notes: options.showNotes !== false
        };

        // 尺寸设置
        this.maxWidth = options.maxWidth || 400;
        this.minWidth = options.minWidth || 200;
    }

    getContainerClass() {
        return 'lge-control-map-info';
    }

    getDefaultStyles() {
        return L.GISElements.StyleRegistry.getStyles('map-info');
    }

    getDefaultStyleName() {
        return 'professional';
    }

    render() {
        if (!this.container) return;

        const style = this.getCurrentStyleObject();
        if (!style) {
            console.warn(`地图注记样式 "${this.currentStyle}" 不存在`);
            return;
        }

        // 只渲染已启用的字段
        const visibleInfo = {};
        Object.keys(this.info).forEach(key => {
            if (this.showConfig[key]) {
                visibleInfo[key] = this.info[key];
            }
        });

        this.container.innerHTML = style.render(visibleInfo);
        this.container.style.maxWidth = this.maxWidth + 'px';
        this.container.style.minWidth = this.minWidth + 'px';
    }

    // ==================== 信息设置 ====================

    setTitle(title) {
        this.info.title = title;
        this.render();
        return this;
    }

    setSubtitle(subtitle) {
        this.info.subtitle = subtitle;
        this.render();
        return this;
    }

    setAuthor(author) {
        this.info.author = author;
        this.render();
        return this;
    }

    setOrganization(organization) {
        this.info.organization = organization;
        this.render();
        return this;
    }

    setDate(date) {
        this.info.date = date;
        this.render();
        return this;
    }

    setDataSource(dataSource) {
        this.info.dataSource = dataSource;
        this.render();
        return this;
    }

    setProjection(projection) {
        this.info.projection = projection;
        this.render();
        return this;
    }

    setScale(scale) {
        this.info.scale = scale;
        this.render();
        return this;
    }

    setNotes(notes) {
        this.info.notes = notes;
        this.render();
        return this;
    }

    // 批量设置
    setInfo(info) {
        Object.assign(this.info, info);
        this.render();
        return this;
    }

    // ==================== 显示配置 ====================

    showField(field) {
        if (field in this.showConfig) {
            this.showConfig[field] = true;
            this.render();
        }
        return this;
    }

    hideField(field) {
        if (field in this.showConfig) {
            this.showConfig[field] = false;
            this.render();
        }
        return this;
    }

    setShowConfig(config) {
        Object.assign(this.showConfig, config);
        this.render();
        return this;
    }

    // ==================== 尺寸设置 ====================

    setMaxWidth(width) {
        this.maxWidth = width;
        if (this.container) {
            this.container.style.maxWidth = width + 'px';
        }
        return this;
    }

    setMinWidth(width) {
        this.minWidth = width;
        if (this.container) {
            this.container.style.minWidth = width + 'px';
        }
        return this;
    }

    // ==================== 辅助方法 ====================

    _getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ==================== 导出信息 ====================

    getInfo() {
        return { ...this.info };
    }

    getShowConfig() {
        return { ...this.showConfig };
    }
}

// 导出
L.Control.MapInfo = MapInfoControl;

L.control.mapInfo = function (options) {
    const control = new L.Control.MapInfo(options);
    return control.createControl();
};

