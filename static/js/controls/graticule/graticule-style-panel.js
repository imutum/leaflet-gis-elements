/**
 * 经纬度格网样式配置面板
 * 用于动态修改格网线和标签的样式
 */

class GraticuleStylePanel {
    constructor(graticuleControl, options = {}) {
        this.graticuleControl = graticuleControl;
        this.container = null;
        this.isExpanded = options.expanded !== false;
        this.position = options.position || 'topright';
    }

    /**
     * 添加到地图
     */
    addTo(map) {
        this.map = map;
        this._createPanel();
        return this;
    }

    /**
     * 创建面板
     */
    _createPanel() {
        // 创建容器
        this.container = document.createElement('div');
        this.container.className = 'graticule-style-panel leaflet-control';
        this.container.style.position = 'absolute';

        // 根据位置设置样式
        if (this.position.includes('top')) {
            this.container.style.top = '10px';
        } else {
            this.container.style.bottom = '10px';
        }
        if (this.position.includes('right')) {
            this.container.style.right = '10px';
        } else {
            this.container.style.left = '10px';
        }

        // 创建标题栏
        const header = document.createElement('div');
        header.className = 'graticule-style-panel-header';
        header.innerHTML = `
            <span class="graticule-style-panel-title">格网样式</span>
            <button class="graticule-style-panel-toggle" title="展开/折叠">
                <span class="toggle-icon">${this.isExpanded ? '−' : '+'}</span>
            </button>
        `;
        this.container.appendChild(header);

        // 创建内容区域
        const content = document.createElement('div');
        content.className = 'graticule-style-panel-content';
        content.style.display = this.isExpanded ? 'block' : 'none';

        // 经线样式
        content.appendChild(this._createSection('经线样式', [
            this._createColorInput('meridianColor', '颜色', this.graticuleControl.meridianColor),
            this._createNumberInput('meridianWeight', '线宽', this.graticuleControl.meridianWeight, 0.1, 10, 0.5),
            this._createLineStyleSelect('meridianDashArray', '线型', this.graticuleControl.meridianDashArray)
        ]));

        // 纬线样式
        content.appendChild(this._createSection('纬线样式', [
            this._createColorInput('parallelColor', '颜色', this.graticuleControl.parallelColor),
            this._createNumberInput('parallelWeight', '线宽', this.graticuleControl.parallelWeight, 0.1, 10, 0.5),
            this._createLineStyleSelect('parallelDashArray', '线型', this.graticuleControl.parallelDashArray)
        ]));

        // 标签样式
        content.appendChild(this._createSection('标签样式', [
            this._createNumberInput('labelFontSize', '字号', this.graticuleControl.labelFontSize, 8, 24, 1),
            this._createFontFamilySelect('labelFontFamily', '字体', this.graticuleControl.labelFontFamily)
        ]));

        this.container.appendChild(content);

        // 添加到地图容器
        this.map.getContainer().appendChild(this.container);

        // 绑定事件
        this._bindEvents(header.querySelector('.graticule-style-panel-toggle'), content);
    }

    /**
     * 创建分组区域
     */
    _createSection(title, controls) {
        const section = document.createElement('div');
        section.className = 'graticule-style-section';

        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'graticule-style-section-title';
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);

        controls.forEach(control => section.appendChild(control));

        return section;
    }

    /**
     * 创建颜色输入控件
     */
    _createColorInput(name, label, value) {
        const control = document.createElement('div');
        control.className = 'graticule-style-control';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'graticule-style-label';

        const input = document.createElement('input');
        input.type = 'color';
        input.value = value;
        input.className = 'graticule-style-input graticule-color-input';
        input.addEventListener('change', (e) => {
            if (name.startsWith('meridian')) {
                this.graticuleControl.setMeridianStyle({ color: e.target.value });
            } else if (name.startsWith('parallel')) {
                this.graticuleControl.setParallelStyle({ color: e.target.value });
            }
        });

        control.appendChild(labelEl);
        control.appendChild(input);
        return control;
    }

    /**
     * 创建数值输入控件
     */
    _createNumberInput(name, label, value, min, max, step) {
        const control = document.createElement('div');
        control.className = 'graticule-style-control';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'graticule-style-label';

        const inputGroup = document.createElement('div');
        inputGroup.className = 'graticule-input-group';

        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.min = min;
        input.max = max;
        input.step = step;
        input.className = 'graticule-style-input graticule-number-input';

        const updateValue = () => {
            const val = parseFloat(input.value);
            if (name.startsWith('meridian')) {
                this.graticuleControl.setMeridianStyle({ weight: val });
            } else if (name.startsWith('parallel')) {
                this.graticuleControl.setParallelStyle({ weight: val });
            } else if (name === 'labelFontSize') {
                this.graticuleControl.setLabelStyle({ fontSize: val });
            }
        };

        input.addEventListener('change', updateValue);
        input.addEventListener('input', (e) => {
            // 实时更新显示
            slider.value = e.target.value;
        });

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.value = value;
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.className = 'graticule-style-slider';
        slider.addEventListener('input', (e) => {
            input.value = e.target.value;
        });
        slider.addEventListener('change', updateValue);

        inputGroup.appendChild(input);
        inputGroup.appendChild(slider);

        control.appendChild(labelEl);
        control.appendChild(inputGroup);
        return control;
    }

    /**
     * 创建线型选择控件
     */
    _createLineStyleSelect(name, label, value) {
        const control = document.createElement('div');
        control.className = 'graticule-style-control';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'graticule-style-label';

        const select = document.createElement('select');
        select.className = 'graticule-style-input graticule-select-input';

        const lineStyles = [
            { value: '', label: '实线', dashArray: null },
            { value: '5, 5', label: '虚线', dashArray: '5, 5' },
            { value: '10, 5', label: '长虚线', dashArray: '10, 5' },
            { value: '1, 4', label: '点线', dashArray: '1, 4' },
            { value: '10, 5, 1, 5', label: '点划线', dashArray: '10, 5, 1, 5' }
        ];

        lineStyles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.value;
            option.textContent = style.label;
            if (value === style.dashArray) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const dashArray = e.target.value || null;
            if (name.startsWith('meridian')) {
                this.graticuleControl.setMeridianStyle({ dashArray });
            } else if (name.startsWith('parallel')) {
                this.graticuleControl.setParallelStyle({ dashArray });
            }
        });

        control.appendChild(labelEl);
        control.appendChild(select);
        return control;
    }

    /**
     * 创建字体选择控件
     */
    _createFontFamilySelect(name, label, value) {
        const control = document.createElement('div');
        control.className = 'graticule-style-control';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'graticule-style-label';

        const select = document.createElement('select');
        select.className = 'graticule-style-input graticule-select-input';

        const fonts = [
            { value: 'Arial, sans-serif', label: 'Arial' },
            { value: '"Times New Roman", serif', label: 'Times New Roman' },
            { value: '"Courier New", monospace', label: 'Courier New' },
            { value: 'Georgia, serif', label: 'Georgia' },
            { value: 'Verdana, sans-serif', label: 'Verdana' },
            { value: '"Microsoft YaHei", sans-serif', label: '微软雅黑' },
            { value: 'SimSun, serif', label: '宋体' },
            { value: 'SimHei, sans-serif', label: '黑体' }
        ];

        fonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font.value;
            option.textContent = font.label;
            if (value === font.value) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.graticuleControl.setLabelStyle({ fontFamily: e.target.value });
        });

        control.appendChild(labelEl);
        control.appendChild(select);
        return control;
    }

    /**
     * 绑定事件
     */
    _bindEvents(toggleButton, content) {
        toggleButton.addEventListener('click', () => {
            this.isExpanded = !this.isExpanded;
            content.style.display = this.isExpanded ? 'block' : 'none';
            toggleButton.querySelector('.toggle-icon').textContent = this.isExpanded ? '−' : '+';
        });
    }

    /**
     * 从地图移除
     */
    remove() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        return this;
    }
}

// 导出到全局
window.GraticuleStylePanel = GraticuleStylePanel;

