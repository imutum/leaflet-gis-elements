# LeafletGISElements CSS 样式模块

## 样式结构

```
css/
├── main.css                      # 主入口文件
│
├── base/                         # 基础样式
│   ├── variables.css             # CSS变量定义
│   └── reset.css                 # CSS重置
│
├── layout/                       # 布局样式
│   ├── map.css                   # 地图容器布局
│   └── panel.css                 # 控制面板布局
│
├── components/                   # 通用组件
│   ├── buttons.css               # 按钮样式
│   ├── forms.css                 # 表单样式
│   ├── notifications.css         # 通知样式
│   └── scrollbar.css             # 滚动条样式
│
├── controls/                     # 控件特定样式
│   ├── scale-bar-themes.css      # 比例尺主题
│   ├── legend-themes.css         # 图例主题
│   ├── export-styles.css         # 导出控件样式
│   ├── graticule-styles.css      # 格网控件样式
│   └── graticule-style-panel.css # 格网配置面板样式
│
└── utilities/                    # 工具样式
    ├── animations.css            # 动画定义
    ├── responsive.css            # 响应式设计
    └── print.css                 # 打印样式
```

## 使用方式

### 方式一：使用主入口文件（推荐）

```html
<!-- 只需引入main.css，自动导入所有必需样式 -->
<link rel="stylesheet" href="/static/css/main.css">
```

### 方式二：按需引入

```html
<!-- 1. 基础样式（必需） -->
<link rel="stylesheet" href="/static/css/base/variables.css">
<link rel="stylesheet" href="/static/css/base/reset.css">

<!-- 2. 布局样式（必需） -->
<link rel="stylesheet" href="/static/css/layout/map.css">
<link rel="stylesheet" href="/static/css/layout/panel.css">

<!-- 3. 组件样式（按需） -->
<link rel="stylesheet" href="/static/css/components/buttons.css">
<link rel="stylesheet" href="/static/css/components/forms.css">

<!-- 4. 控件主题（按需） -->
<link rel="stylesheet" href="/static/css/controls/scale-bar-themes.css">
<link rel="stylesheet" href="/static/css/controls/legend-themes.css">

<!-- 5. 工具样式（按需） -->
<link rel="stylesheet" href="/static/css/utilities/animations.css">
<link rel="stylesheet" href="/static/css/utilities/responsive.css">
```

## CSS变量

所有CSS变量定义在 `base/variables.css` 中，可以通过覆盖变量来自定义主题。

### 主要变量

```css
:root {
    /* 主色调 */
    --primary-color: #667eea;
    --primary-hover: #5568d3;
    
    /* 文本颜色 */
    --text-primary: #333;
    --text-secondary: #555;
    
    /* 间距 */
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 15px;
    
    /* 圆角 */
    --radius-md: 4px;
    --radius-lg: 6px;
    
    /* 阴影 */
    --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 2px 12px rgba(0, 0, 0, 0.15);
}
```

### 自定义主题

```html
<style>
  :root {
    --primary-color: #ff5722;  /* 覆盖主色调 */
    --primary-hover: #e64a19;
    --radius-md: 8px;           /* 更大的圆角 */
  }
</style>
```

## 模块化原则

1. **单一职责**：每个文件只负责一类样式
2. **原子化**：样式尽可能细分，便于复用
3. **变量优先**：使用CSS变量统一管理样式参数
4. **解耦独立**：各模块之间相互独立，可单独使用

## 扩展开发

### 添加新组件样式

1. 在 `components/` 下创建新文件
2. 使用CSS变量保持一致性
3. 在 `main.css` 中导入

```css
/* components/my-component.css */
.my-component {
    padding: var(--spacing-md);
    background: var(--bg-white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
}
```

### 添加新控件主题

1. 在 `controls/` 下创建新主题文件
2. 使用统一的命名规范（控件名-主题名）
3. 在 `main.css` 中导入（或按需引入）

```css
/* controls/my-control-themes.css */
.my-control-theme-dark {
    background: #333;
    color: white;
}

.my-control-theme-light {
    background: white;
    color: #333;
}
```

## 样式命名规范

- **控件容器**：`.控件名-容器` (如 `.legend-gis-container`)
- **控件元素**：`.控件名-元素名` (如 `.legend-gis-title`)
- **主题样式**：`.控件名-主题名` (如 `.scale-bar-leaflet`)
- **通用组件**：`.组件名` (如 `.btn-primary`)
- **工具类**：`.功能名` (如 `.help-text`)

## 浏览器兼容性

- 支持现代浏览器（Chrome, Firefox, Safari, Edge）
- CSS变量需要IE 11+或现代浏览器
- Grid/Flexbox布局需要IE 11+或现代浏览器

