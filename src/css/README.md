# CSS 样式目录结构说明

本目录采用 **ITCSS（倒三角CSS）** 架构，从通用到具体分层组织样式。

## 📁 目录结构

```
css/
├── controls.css              # 主入口文件，按顺序导入所有样式
├── base/                     # 基础层
│   ├── variables.css         # CSS 变量定义（颜色、字体、间距等）
│   └── control-base.css      # 控件基础样式
├── controls/                 # 控件层
│   ├── scale-bar-styles.css  # 比例尺样式
│   ├── legend-styles.css     # 图例样式
│   ├── graticule-styles.css  # 经纬度格网样式
│   └── map-info-styles.css   # 地图注记样式
└── utilities/                # 工具层
    ├── helpers.css           # 工具类（文本、间距、布局等）
    ├── animations.css        # 动画定义
    ├── responsive.css        # 响应式样式
    └── print.css             # 打印样式
```

## 🎯 设计原则

### 1. 层级分离
- **基础层**：变量、控件基础样式
- **控件层**：具体的地图控件样式（仅包含控件本身，不含演示UI）
- **工具层**：辅助类和特殊场景样式

**注意**：本库不包含演示页面的样式（如控制面板、按钮等），演示样式在 `examples/styles/` 中独立维护。

### 2. 命名规范
- 使用 `lge-` 作为统一前缀（LeafletGISElements）
- 采用 BEM 命名法：`block__element--modifier`
- 示例：`lge-legend-gis-container`, `lge-scale-bar-leaflet`

### 3. CSS 变量
所有可配置项都定义为 CSS 变量，便于主题定制：
```css
:root {
    --lge-primary-color: #667eea;
    --lge-font-family: Arial, 'Microsoft YaHei', sans-serif;
    --lge-spacing-md: 12px;
    /* ... */
}
```

### 4. 可访问性
- 所有交互元素支持 `:focus-visible`
- 使用语义化的颜色变量
- 提供 `.lge-sr-only` 屏幕阅读器专用类
- 触摸目标不小于 20x20px

## 📝 使用指南

### 引入样式
```html
<link rel="stylesheet" href="path/to/controls.css">
```

### 自定义主题
```css
:root {
    --lge-primary-color: #your-color;
    --lge-font-family: 'Your Font', sans-serif;
}
```

### 使用工具类
```html
<div class="lge-flex-between lge-mt-md">
    <span class="lge-text-muted">标签</span>
    <span class="lge-text-ellipsis">长文本内容...</span>
</div>
```

### 应用动画
```html
<div class="lge-animate-fade-in">淡入效果</div>
```

## 🔧 代码规范

1. **缩进**：使用 4 个空格
2. **注释**：每个文件和主要区块都应有注释
3. **排序**：属性按功能分组（定位 → 盒模型 → 排版 → 视觉 → 其他）
4. **避免**：
   - 不使用 `!important`（除非必要）
   - 不硬编码颜色值，使用 CSS 变量
   - 不使用深层嵌套（最多 3 层）

## 📊 优化建议

### 已完成优化
✅ 统一 CSS 变量定义，添加语义化颜色  
✅ 移除 `!important` 滥用  
✅ 清理未使用的代码（toggle-switch 等）  
✅ 增强可访问性（焦点样式、触摸目标）  
✅ 添加工具类系统（helpers.css）  
✅ 完善动画定义和命名  
✅ 明确核心样式与演示样式边界  

### 未来改进
- [ ] 支持暗色主题切换
- [ ] 添加更多控件样式变体
- [ ] 支持 CSS Layers（@layer）
- [ ] 提供 SASS/LESS 源码版本

## 🐛 常见问题

**Q: 为什么有些样式没生效？**  
A: 检查 CSS 变量是否正确导入，确保 `variables.css` 在最前面加载。

**Q: 如何覆盖默认样式？**  
A: 建议通过 CSS 变量自定义，或使用更具体的选择器。

**Q: 打印时样式异常？**  
A: 查看 `utilities/print.css`，可能需要针对特定元素调整。

## 📄 许可证

MIT License - 详见项目根目录 LICENSE 文件

