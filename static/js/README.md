# LeafletGISElements JavaScript 模块

## 模块结构

```
js/
├── index.js                   # 模块加载器（入口）
├── drag-elements.js          # 统一API入口
├── map-controller.js         # 主控制器
├── style-registry.js         # 样式注册器
│
├── core/                     # 核心模块
│   ├── base-control.js       # 控件基类
│   ├── stylable-control.js   # 可样式化控件基类
│   ├── map-exporter.js       # 地图导出器
│   └── utils/                # 工具函数
│       ├── coordinate.js     # 坐标转换
│       └── storage.js        # 本地存储
│
├── controls/                 # 控件实现
│   ├── legend/              # 图例控件
│   ├── scale-bar/           # 比例尺控件
│   ├── north-arrow/         # 指北针控件
│   ├── graticule/           # 经纬度格网控件
│   └── export/              # 导出控件
│
└── styles/                  # 样式定义
    ├── north-arrow/        # 指北针样式
    ├── scale-bar/          # 比例尺样式
    ├── legend/             # 图例样式
    └── graticule/          # 格网样式
```

## 使用方式

### 方式一：使用模块加载器（推荐）

```html
<!-- 只需引入index.js，自动加载所有依赖 -->
<script src="/static/js/index.js"></script>

<script>
  // 等待模块加载完成
  window.addEventListener('leaflet-gis-elements-loaded', function() {
    const map = L.map('map').setView([39.9, 116.4], 10);
    
    // 使用统一API创建控制器
    const controller = LeafletGISElements.createController(map, {
      northArrow: { style: 'gis' },
      scaleBar: { style: 'leaflet' },
      legend: { layers: [] }
    });
  });
</script>
```

### 方式二：手动引入（需按顺序）

```html
<!-- 1. 核心工具 -->
<script src="/static/js/core/utils/storage.js"></script>
<script src="/static/js/core/utils/coordinate.js"></script>

<!-- 2. 样式注册器 -->
<script src="/static/js/style-registry.js"></script>

<!-- 3. 控件基类 -->
<script src="/static/js/core/base-control.js"></script>
<script src="/static/js/core/stylable-control.js"></script>

<!-- 4. 样式定义 -->
<script src="/static/js/styles/north-arrow/style-gis.js"></script>
<script src="/static/js/styles/scale-bar/style-gis.js"></script>
<!-- ... 其他样式文件 ... -->

<!-- 5. 控件实现 -->
<script src="/static/js/controls/north-arrow/north-arrow-control.js"></script>
<script src="/static/js/controls/scale-bar/scale-bar-control.js"></script>
<!-- ... 其他控件文件 ... -->

<!-- 6. 主控制器 -->
<script src="/static/js/map-controller.js"></script>

<!-- 7. 统一入口 -->
<script src="/static/js/drag-elements.js"></script>
```

## API 文档

### LeafletGISElements 对象

全局对象，提供所有公共API。

#### createController(map, options)

创建地图控制器。

**参数：**
- `map` {L.Map} - Leaflet地图实例
- `options` {Object} - 配置选项
  - `northArrow` {Object} - 指北针配置
  - `scaleBar` {Object} - 比例尺配置
  - `legend` {Object} - 图例配置
  - `graticule` {Object} - 经纬度格网配置
  - `export` {Object} - 导出控件配置

**返回：** MapController实例

#### getAvailableStyles(controlType)

获取可用样式列表。

**参数：**
- `controlType` {string} - 控件类型（'scale-bar', 'legend'等）

**返回：** Array<{id, name}>

### MapController 类

统一管理所有地图控件。

#### 方法

- `show(controlName)` - 显示控件
- `hide(controlName)` - 隐藏控件
- `toggle(controlName)` - 切换控件显示状态
- `setStyle(controlName, styleName)` - 设置控件样式
- `resetPosition(controlName)` - 重置控件位置
- `updateLegendLayers(layers)` - 更新图例图层
- `destroy()` - 销毁控制器

## 模块化原则

1. **单一职责**：每个文件只负责一个功能
2. **依赖明确**：通过全局对象声明依赖关系
3. **接口清晰**：通过 LeafletGISElements 对象暴露公共API
4. **易于扩展**：新增控件/样式只需添加文件并注册

## 扩展开发

### 添加新控件

1. 在 `controls/` 下创建新目录
2. 继承 `BaseControl` 或 `StylableControl`
3. 在 `map-controller.js` 中注册
4. 在 `index.js` 中添加加载顺序

### 添加新样式

1. 在 `styles/[控件类型]/` 下创建新文件
2. 使用 `StyleRegistry.register()` 注册
3. 在 `index.js` 中添加加载顺序

