# Leaflet GIS Elements - API 类型注解文档

## 📋 文档说明

本文档为 Leaflet GIS Elements 模块提供完整的类型注解，供 AI 和开发者阅读。

---

## 🌍 模块概述

**模块名称**: `LeafletGISElements` / `L.GISElements`

**全局对象**: `window.LeafletGISElements` (CDN) 或 `L.GISElements` (Leaflet扩展)

**依赖**: Leaflet.js (>=1.0.0)

---

## 📦 主要控件

1. **NorthArrow** - 指北针控件
2. **ScaleBar** - 比例尺控件  
3. **Legend** - 图例控件
4. **Graticule** - 经纬网控件
5. **Export** - 地图导出控件

---

## 🎯 1. 指北针控件 (NorthArrow)

### 类型定义

```typescript
interface NorthArrowOptions {
  // 控件位置: 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
  position?: string;
  
  // 是否可拖动，默认: true
  draggable?: boolean;
  
  // 指北针大小（像素），默认: 80
  size?: number;
  
  // 样式名称: 'gis' | 'leaflet' | 'compact' | 'compass'
  style?: string;
  
  // 自定义样式对象集合（高级用法）
  styles?: object;
}

interface NorthArrowControl {
  // 添加到地图
  addTo(map: L.Map): this;
  
  // 从地图移除
  remove(): this;
  
  // 设置大小（像素）
  setSize(size: number): void;
  
  // 切换样式
  setStyle(styleName: string): void;
  
  // 获取当前样式名称
  getStyle(): string;
  
  // 获取可用样式列表
  getAvailableStyles(): string[];
  
  // 重新渲染
  render(): void;
}
```

### 创建方法

```javascript
// 方法1: 工厂函数（推荐）
const northArrow = L.control.northArrow({
  position: 'topleft',
  size: 80,
  style: 'gis',
  draggable: true
}).addTo(map);

// 方法2: 构造函数
const northArrow = new L.Control.NorthArrow({
  position: 'topleft',
  size: 80
}).createControl().addTo(map);
```

### 可用样式

- `'gis'` - GIS专业风格（默认）
- `'leaflet'` - Leaflet原生风格
- `'compact'` - 紧凑型
- `'compass'` - 罗盘风格

---

## 📏 2. 比例尺控件 (ScaleBar)

### 类型定义

```typescript
interface ScaleBarOptions {
  // 控件位置，默认: 'bottomleft'
  position?: string;
  
  // 是否可拖动，默认: true
  draggable?: boolean;
  
  // 最大宽度（像素），默认: 300
  maxWidth?: number;
  
  // 是否显示公制单位，默认: true
  metric?: boolean;
  
  // 是否显示英制单位，默认: false
  imperial?: boolean;
  
  // 地图空闲时更新（false则实时更新），默认: false
  updateWhenIdle?: boolean;
  
  // 样式名称: 'gis' | 'leaflet' | 'minimal' | 'double' | 'striped'
  style?: string;
  
  // 自定义样式对象集合
  styles?: object;
}

interface ScaleBarControl {
  // 添加到地图
  addTo(map: L.Map): this;
  
  // 从地图移除
  remove(): this;
  
  // 手动更新比例尺
  update(): void;
  
  // 切换样式
  setStyle(styleName: string): void;
  
  // 获取当前样式
  getStyle(): string;
  
  // 获取可用样式列表
  getAvailableStyles(): string[];
  
  // 获取当前比例尺数据
  scaleData: {
    meters: number;    // 实际距离（米）
    width: number;     // 显示宽度（像素）
    label: string;     // 标签文本（如 "500 m"）
  };
}
```

### 创建方法

```javascript
// 工厂函数（推荐）
const scaleBar = L.control.scaleBar({
  position: 'bottomleft',
  maxWidth: 300,
  metric: true,
  imperial: false,
  style: 'gis'
}).addTo(map);
```

### 可用样式

- `'gis'` - GIS专业风格（默认）
- `'leaflet'` - Leaflet原生风格
- `'minimal'` - 极简风格
- `'double'` - 双行显示
- `'striped'` - 条纹样式

---

## 🗺️ 3. 图例控件 (Legend)

### 类型定义

```typescript
interface LegendLayer {
  // 图层名称
  name: string;
  
  // 图例项数组
  items: Array<{
    // 图例项标签
    label: string;
    
    // 颜色（CSS颜色值）
    color?: string;
    
    // 图标HTML（可选，优先级高于color）
    icon?: string;
    
    // 图案类型: 'fill' | 'line' | 'point'（可选）
    type?: string;
  }>;
}

interface LegendOptions {
  // 控件位置，默认: 'bottomright'
  position?: string;
  
  // 是否可拖动，默认: true
  draggable?: boolean;
  
  // 最大宽度（像素），默认: 300
  maxWidth?: number;
  
  // 最大高度（像素），默认: 400
  maxHeight?: number;
  
  // 图层数据数组
  layers?: LegendLayer[];
  
  // 样式名称: 'gis' | 'modern'
  style?: string;
  
  // 自定义样式对象集合
  styles?: object;
}

interface LegendControl {
  // 添加到地图
  addTo(map: L.Map): this;
  
  // 从地图移除
  remove(): this;
  
  // 设置所有图层数据
  setLayers(layers: LegendLayer[]): void;
  
  // 添加单个图层
  addLayer(layer: LegendLayer): void;
  
  // 移除图层（按名称）
  removeLayer(layerName: string): void;
  
  // 清空所有图层
  clearLayers(): void;
  
  // 更新显示
  update(): void;
  
  // 切换样式
  setStyle(styleName: string): void;
  
  // 获取当前样式
  getStyle(): string;
  
  // 获取可用样式列表
  getAvailableStyles(): string[];
}
```

### 创建方法

```javascript
// 工厂函数（推荐）
const legend = L.control.legend({
  position: 'bottomright',
  maxWidth: 300,
  layers: [
    {
      name: '土地利用类型',
      items: [
        { label: '耕地', color: '#ffeb3b' },
        { label: '林地', color: '#4caf50' },
        { label: '水域', color: '#2196f3' },
        { label: '建设用地', color: '#f44336' }
      ]
    }
  ],
  style: 'gis'
}).addTo(map);

// 动态更新
legend.addLayer({
  name: '人口密度',
  items: [
    { label: '< 100人/km²', color: '#fee5d9' },
    { label: '100-500', color: '#fcae91' },
    { label: '500-1000', color: '#fb6a4a' },
    { label: '> 1000', color: '#cb181d' }
  ]
});
```

### 可用样式

- `'gis'` - GIS专业风格（默认）
- `'modern'` - 现代简约风格

---

## 🌐 4. 经纬网控件 (Graticule)

### 类型定义

```typescript
interface GraticuleOptions {
  // === 格网间隔 ===
  // 统一间隔（度数），如果设置则覆盖lngInterval和latInterval
  interval?: number | null;
  
  // 经线间隔（度数），默认: 自动计算
  lngInterval?: number | null;
  
  // 纬线间隔（度数），默认: 自动计算
  latInterval?: number | null;
  
  // === 标签显示 ===
  // 是否显示坐标标签，默认: true
  showLabels?: boolean;
  
  // === 经线样式 ===
  // 经线颜色，默认: '#666'
  meridianColor?: string;
  
  // 经线宽度，默认: 1
  meridianWeight?: number;
  
  // 经线透明度，默认: 0.5
  meridianOpacity?: number;
  
  // 经线虚线样式，如 '5, 5'，默认: null（实线）
  meridianDashArray?: string | null;
  
  // === 纬线样式 ===
  // 纬线颜色，默认: '#666'
  parallelColor?: string;
  
  // 纬线宽度，默认: 1
  parallelWeight?: number;
  
  // 纬线透明度，默认: 0.5
  parallelOpacity?: number;
  
  // 纬线虚线样式，默认: null（实线）
  parallelDashArray?: string | null;
  
  // === 统一样式（兼容旧API，优先级低于单独设置） ===
  color?: string;        // 统一颜色
  weight?: number;       // 统一宽度
  opacity?: number;      // 统一透明度
  
  // === 标签样式 ===
  // 标签字体大小（像素），默认: 11
  labelFontSize?: number;
  
  // 标签字体类型，默认: 'Arial, sans-serif'
  labelFontFamily?: string;
  
  // === 边框配置 ===
  // 是否显示格网边框，默认: true
  frameEnabled?: boolean;
  
  // 边框颜色，默认: '#333'
  frameColor?: string;
  
  // 边框宽度，默认: 2
  frameWeight?: number;
  
  // 边框透明度，默认: 0.8
  frameOpacity?: number;
  
  // 边框是否可拖动，默认: true
  frameDraggable?: boolean;
  
  // 边框是否可调整大小，默认: true
  frameResizable?: boolean;
  
  // 边框初始位置和大小（像素坐标）
  frameRect?: {
    left: number;    // 左侧位置，默认: 100
    top: number;     // 顶部位置，默认: 100
    width: number;   // 宽度，默认: 400
    height: number;  // 高度，默认: 300
  };
  
  // === 其他 ===
  // 是否启用，默认: true
  enabled?: boolean;
}

interface GraticuleControl {
  // === 基础方法 ===
  // 添加到地图
  addTo(map: L.Map): this;
  
  // 从地图移除
  remove(): this;
  
  // 更新格网（updateFrame: 是否更新边框，默认true）
  updateGraticule(updateFrame?: boolean): void;
  
  // 清除所有格网元素
  clearGraticule(): void;
  
  // === 启用/禁用 ===
  // 启用格网显示
  enable(): void;
  
  // 禁用格网显示
  disable(): void;
  
  // 切换显示状态
  toggle(): void;
  
  // 显示格网（同 enable）
  showGraticule(): void;
  
  // 隐藏格网（同 disable）
  hideGraticule(): void;
  
  // === 间隔设置 ===
  // 设置统一间隔（度数）
  setInterval(interval: number): void;
  
  // 设置经线间隔
  setLngInterval(interval: number): void;
  
  // 设置纬线间隔
  setLatInterval(interval: number): void;
  
  // 同时设置经纬度间隔
  setIntervals(lngInterval: number, latInterval: number): void;
  
  // 获取当前经线间隔
  getLngInterval(): number;
  
  // 获取当前纬线间隔
  getLatInterval(): number;
  
  // === 边框设置 ===
  // 启用边框
  enableFrame(): void;
  
  // 禁用边框
  disableFrame(): void;
  
  // 设置边框矩形（像素坐标）
  setFrameRect(rect: {left: number, top: number, width: number, height: number}): void;
  
  // 获取边框矩形（像素坐标）
  getFrameRect(): {left: number, top: number, width: number, height: number};
  
  // 设置边框范围（地理坐标，兼容旧API）
  setFrameBounds(bounds: L.LatLngBounds): void;
  
  // 获取边框范围（地理坐标，兼容旧API）
  getFrameBounds(): L.LatLngBounds;
  
  // === 样式设置 ===
  // 设置经线样式
  setMeridianStyle(options: {
    color?: string;
    weight?: number;
    opacity?: number;
    dashArray?: string;
  }): void;
  
  // 设置纬线样式
  setParallelStyle(options: {
    color?: string;
    weight?: number;
    opacity?: number;
    dashArray?: string;
  }): void;
  
  // 设置标签样式
  setLabelStyle(options: {
    fontSize?: number;
    fontFamily?: string;
  }): void;
  
  // 获取经线样式
  getMeridianStyle(): {color: string, weight: number, opacity: number, dashArray: string};
  
  // 获取纬线样式
  getParallelStyle(): {color: string, weight: number, opacity: number, dashArray: string};
  
  // 获取标签样式
  getLabelStyle(): {fontSize: number, fontFamily: string};
}
```

### 创建方法

```javascript
// 工厂函数（推荐）
const graticule = L.control.graticule({
  interval: 1,              // 1度间隔
  showLabels: true,
  meridianColor: '#666',
  parallelColor: '#666',
  frameEnabled: true,
  frameRect: {
    left: 100,
    top: 100,
    width: 600,
    height: 400
  }
}).addTo(map);

// 动态控制
graticule.setInterval(0.5);      // 改为0.5度间隔
graticule.disable();              // 禁用显示
graticule.enable();               // 启用显示
```

### 自动间隔算法

当 `interval`、`lngInterval`、`latInterval` 均为 `null` 时，根据缩放级别自动计算：

| 缩放级别 | 间隔（度） |
| -------- | ---------- |
| ≥ 17     | 0.001      |
| 15-16    | 0.005      |
| 13-14    | 0.01       |
| 11-12    | 0.05       |
| 9-10     | 0.1        |
| 7-8      | 0.5        |
| 5-6      | 1          |
| 3-4      | 5          |
| ≤ 2      | 10         |

---

## 📤 5. 导出控件 (Export)

### 类型定义

```typescript
interface ExportOptions {
  // 控件位置，默认: 'topright'
  position?: string;
  
  // 导出区域: 'graticule' | 'viewport' | 'auto'
  // - 'graticule': 仅导出格网范围（包括边框和标签）
  // - 'viewport': 导出整个视口
  // - 'auto': 自动计算包含所有控件的最小范围
  // 默认: 'graticule'
  exportArea?: string;
  
  // 导出格式: 'png' | 'jpg'，默认: 'png'
  format?: string;
  
  // 图片质量（0-1），默认: 1.0
  quality?: number;
  
  // 文件名前缀，默认: 'thematic_map'
  filename?: string;
  
  // 要排除的元素（CSS选择器数组）
  // 默认排除: 缩放栏、控制面板、版权信息、导出按钮
  excludeSelectors?: string[];
  
  // 要包含的控件（CSS选择器数组，白名单）
  // 默认包含: 图例、比例尺、指北针、格网
  includeControls?: string[];
}

interface ExportControl {
  // 添加到地图
  addTo(map: L.Map): this;
  
  // 从地图移除
  remove(): this;
  
  // 执行导出（异步）
  export(): Promise<void>;
  
  // 切换预览边框显示
  togglePreview(): void;
  
  // 设置导出区域
  setExportArea(area: 'graticule' | 'viewport' | 'auto'): void;
  
  // 设置导出格式
  setFormat(format: 'png' | 'jpg'): void;
  
  // 设置导出质量
  setQuality(quality: number): void;
  
  // 设置文件名
  setFilename(filename: string): void;
  
  // 是否正在导出
  isExporting: boolean;
}
```

### 创建方法

```javascript
// 工厂函数（推荐）
const exportControl = L.control.export({
  position: 'topright',
  exportArea: 'auto',      // 自动计算范围
  format: 'png',
  quality: 1.0,
  filename: 'my_map'
}).addTo(map);

// 执行导出
exportControl.export();

// 显示预览边框（可拖动调整）
exportControl.togglePreview();
```

### 重要依赖

导出功能需要 `html2canvas` 库：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### 导出区域说明

- **`'graticule'`**: 自动计算格网边框和标签的范围，适合导出经纬网专题图
- **`'viewport'`**: 导出整个地图视口
- **`'auto'`**: 智能计算包含所有可见控件（图例、比例尺、指北针、格网等）的最小范围

---

## 🎨 样式注册系统

### 类型定义

```typescript
interface StyleObject {
  // 样式名称
  name: string;
  
  // 样式描述
  description?: string;
  
  // 渲染函数（具体签名取决于控件类型）
  render?: Function;
  
  // SVG内容（仅指北针）
  svg?: string | Function;
  
  // 渲染容器函数（仅图例）
  renderContainer?: Function;
}

interface StyleRegistry {
  // 注册样式
  register(controlType: string, styleName: string, styleObject: StyleObject): void;
  
  // 获取样式
  get(controlType: string, styleName: string): StyleObject | null;
  
  // 获取某类型的所有样式
  getStyles(controlType: string): Record<string, StyleObject>;
  
  // 列出某类型的样式名称
  list(controlType: string): string[];
  
  // 检查样式是否存在
  has(controlType: string, styleName: string): boolean;
}

// 全局访问
L.GISElements.StyleRegistry: StyleRegistry;
```

### 自定义样式示例

```javascript
// 注册自定义比例尺样式
L.GISElements.StyleRegistry.register('scale-bar', 'custom', {
  name: '自定义样式',
  description: '我的自定义比例尺样式',
  render: function(scaleData) {
    return `
      <div style="background: #000; color: #fff; padding: 5px;">
        <div style="width: ${scaleData.width}px; height: 4px; background: #fff;"></div>
        <div>${scaleData.label}</div>
      </div>
    `;
  }
});

// 使用自定义样式
const scaleBar = L.control.scaleBar({
  style: 'custom'
}).addTo(map);
```

---

## 🛠️ 工具类

### 坐标格式化工具

```typescript
interface CoordinateFormatter {
  // 格式化为度分秒 (DMS)
  toDMS(lat: number, lng: number): string;
  
  // 格式化为度分 (DM)
  toDM(lat: number, lng: number): string;
  
  // 格式化为十进制度 (DD)
  toDD(lat: number, lng: number, precision?: number): string;
  
  // 解析度分秒字符串
  parseDMS(dmsString: string): {lat: number, lng: number} | null;
}

// 全局访问
L.GISElements.CoordinateFormatter: CoordinateFormatter;
```

### 存储工具

```typescript
interface StorageUtils {
  // 保存数据到本地存储
  save(key: string, value: any): void;
  
  // 从本地存储读取
  load(key: string): any;
  
  // 删除存储项
  remove(key: string): void;
  
  // 清空所有存储
  clear(): void;
}

// 全局访问
L.GISElements.StorageUtils: StorageUtils;
```

---

## 🔧 全局配置

### 配置对象

```typescript
interface GlobalConfig {
  // 调试模式，默认: false
  debug: boolean;
  
  // 自动保存控件位置，默认: true
  autoSavePosition: boolean;
  
  // 存储键前缀，默认: 'leaflet-gis-elements-'
  storagePrefix: string;
}

// 配置方法
L.GISElements.configure({
  debug: true,
  autoSavePosition: true,
  storagePrefix: 'my-app-'
});

// 访问当前配置
L.GISElements.config;
```

---

## 📚 完整使用示例

### 基础示例

```javascript
// 1. 创建地图
const map = L.map('map').setView([39.9, 116.4], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 2. 添加指北针
const northArrow = L.control.northArrow({
  position: 'topleft',
  size: 80,
  style: 'compass'
}).addTo(map);

// 3. 添加比例尺
const scaleBar = L.control.scaleBar({
  position: 'bottomleft',
  maxWidth: 250,
  style: 'gis'
}).addTo(map);

// 4. 添加图例
const legend = L.control.legend({
  position: 'bottomright',
  layers: [{
    name: '土地类型',
    items: [
      { label: '耕地', color: '#ffeb3b' },
      { label: '林地', color: '#4caf50' }
    ]
  }]
}).addTo(map);

// 5. 添加经纬网
const graticule = L.control.graticule({
  interval: 1,
  showLabels: true
}).addTo(map);

// 6. 添加导出按钮
const exportControl = L.control.export({
  position: 'topright',
  exportArea: 'auto',
  format: 'png'
}).addTo(map);
```

### 高级示例：动态控制

```javascript
// 动态更新图例
legend.addLayer({
  name: '新图层',
  items: [
    { label: '类别A', color: '#e91e63' },
    { label: '类别B', color: '#9c27b0' }
  ]
});

// 切换指北针样式
northArrow.setStyle('gis');

// 改变经纬网间隔
graticule.setInterval(0.5);

// 临时禁用经纬网
graticule.disable();
setTimeout(() => graticule.enable(), 5000);

// 导出地图并自定义设置
exportControl.setExportArea('graticule');
exportControl.setFormat('jpg');
exportControl.setQuality(0.9);
exportControl.export();
```

---

## 🌟 事件系统

所有控件继承自 `L.Control`，支持 Leaflet 标准事件：

```javascript
const northArrow = L.control.northArrow().addTo(map);

// Leaflet标准事件
map.on('controladd', (e) => {
  if (e.control === northArrow) {
    console.log('指北针已添加');
  }
});

map.on('controlremove', (e) => {
  if (e.control === northArrow) {
    console.log('指北针已移除');
  }
});
```

---

## ⚠️ 注意事项

### 1. 控件位置说明

- `'topleft'` - 左上角
- `'topright'` - 右上角
- `'bottomleft'` - 左下角
- `'bottomright'` - 右下角

### 2. 拖动功能

- 所有控件默认支持拖动（除 Export）
- 拖动位置会自动保存到 localStorage
- 可通过 `draggable: false` 禁用

### 3. 样式切换

- 运行时可随时切换样式：`control.setStyle('styleName')`
- 查看可用样式：`control.getAvailableStyles()`

### 4. 导出限制

- 导出功能需要 html2canvas 库
- 跨域图片需要服务器支持 CORS
- 大尺寸地图可能导致性能问题

### 5. 经纬网性能

- 格网线数量与间隔和地图范围成反比
- 建议根据缩放级别调整间隔
- 密集格网会影响渲染性能

---

## 📖 版本信息

- **当前版本**: 1.0.0
- **Leaflet 兼容性**: >= 1.0.0
- **浏览器兼容性**: Chrome, Firefox, Safari, Edge (现代浏览器)

---

## 🔗 命名空间结构

```
window.LeafletGISElements
├── version: string
├── MapController: class
├── controls: object
│   ├── NorthArrow: class
│   ├── ScaleBar: class
│   ├── Legend: class
│   ├── Graticule: class
│   └── Export: class
├── utils: object
│   ├── CoordinateFormatter: object
│   ├── StorageUtils: object
│   └── Draggable: class
├── StyleRegistry: object
├── createController: function
├── getAvailableStyles: function
├── configure: function
└── config: object

L.Control (Leaflet扩展)
├── NorthArrow: class
├── ScaleBar: class
├── Legend: class
├── Graticule: class
└── Export: class

L.control (工厂方法)
├── northArrow: function
├── scaleBar: function
├── legend: function
├── graticule: function
└── export: function
```

---

## 💡 AI 使用建议

### 代码生成提示词示例

1. **添加基础控件**:
   ```
   "在地图上添加指北针、比例尺和图例控件，使用GIS专业样式"
   ```

2. **自定义样式**:
   ```
   "创建一个自定义比例尺样式，背景为深色，文字为白色"
   ```

3. **导出功能**:
   ```
   "添加地图导出功能，自动包含所有可见控件，导出为高质量PNG"
   ```

4. **动态控制**:
   ```
   "根据用户选择动态更新图例内容，显示不同的图层分类"
   ```

### 常见模式

```javascript
// 模式1: 快速初始化
const controls = {
  northArrow: L.control.northArrow({position: 'topleft'}).addTo(map),
  scaleBar: L.control.scaleBar({position: 'bottomleft'}).addTo(map),
  legend: L.control.legend({position: 'bottomright'}).addTo(map),
  graticule: L.control.graticule().addTo(map),
  export: L.control.export({position: 'topright'}).addTo(map)
};

// 模式2: 条件加载
function addControl(type, options) {
  const factory = L.control[type];
  return factory ? factory(options).addTo(map) : null;
}

// 模式3: 批量配置
const controlConfig = {
  northArrow: {position: 'topleft', size: 80},
  scaleBar: {position: 'bottomleft', style: 'gis'}
};

Object.entries(controlConfig).forEach(([type, opts]) => {
  L.control[type](opts).addTo(map);
});
```

---

**文档完成。如有疑问或需要更详细的说明，请参考源代码或提交 Issue。**

