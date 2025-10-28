# LeafletGISElements 集成指南

## 项目介绍

LeafletGISElements 是一个可拖拽地图元素模块，基于 Flask + Leaflet 开发，提供指北针、比例尺、图例、经纬度格网等地图控件。该模块设计为高度解耦和模块化，可轻松集成到其他Web项目中。

## 特性

- ✅ 模块化设计，易于集成和扩展
- ✅ 支持多种控件样式主题
- ✅ 控件位置可拖拽并自动保存
- ✅ 响应式设计，支持移动端
- ✅ 完整的API文档和使用示例

## 集成方式

### 方式一：作为独立Flask应用运行

适合快速演示和独立部署。

```bash
# 1. 进入项目目录
cd LeafletGISElements

# 2. 安装依赖
pip install -r requirements.txt

# 3. 运行应用
python app.py

# 访问 http://localhost:5000
```

### 方式二：作为Flask蓝图集成到现有项目

适合集成到已有Flask应用中。

```python
from flask import Flask
from leaflet_gis_elements import create_app

# 方法1：使用应用工厂
app = create_app('production')

# 方法2：集成到现有应用
from leaflet_gis_elements.views import main_bp

app = Flask(__name__)
app.register_blueprint(main_bp, url_prefix='/map-elements')

# 访问 http://yoursite.com/map-elements/
```

### 方式三：仅使用前端JS/CSS模块

适合非Flask项目或纯前端集成。

#### 1. 复制静态文件到你的项目

```bash
cp -r static/js /your-project/static/
cp -r static/css /your-project/static/
```

#### 2. 在HTML中引入

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <!-- LeafletGISElements CSS -->
    <link rel="stylesheet" href="/static/css/main.css">
</head>
<body>
    <div id="map"></div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <!-- LeafletGISElements JS（自动加载所有依赖） -->
    <script src="/static/js/leaflet-gis-elements-index.js"></script>
    
    <script>
        // 等待模块加载完成
        window.addEventListener('leaflet-gis-elements-loaded', function() {
            // 初始化地图
            const map = L.map('map').setView([39.9, 116.4], 10);
            
            // 添加底图
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            
            // 创建控制器
            const controller = LeafletGISElements.createController(map, {
                northArrow: {
                    style: 'gis',
                    size: 80
                },
                scaleBar: {
                    style: 'leaflet',
                    maxWidth: 150
                },
                legend: {
                    style: 'modern',
                    layers: []
                },
                graticule: {
                    enabled: true,
                    showLabels: true
                }
            });
        });
    </script>
</body>
</html>
```

### 方式四：通过npm安装（未来支持）

```bash
npm install leaflet-gis-elements
```

## 配置选项

### MapController 配置

```javascript
const options = {
    // 指北针配置
    northArrow: {
        position: 'topleft',      // Leaflet位置: 'topleft', 'topright', 'bottomleft', 'bottomright'
        style: 'gis',             // 样式: 'simple', 'gis', 'modern', 'compass'
        size: 80,                 // 大小(像素)
        draggable: true           // 是否可拖拽
    },
    
    // 比例尺配置
    scaleBar: {
        position: 'bottomleft',
        style: 'gis',             // 样式: 'leaflet', 'gis'（默认）, 'gis-classic', 'minimal', 'double'
        maxWidth: 150,            // 最大宽度(像素)
        draggable: true
    },
    
    // 图例配置
    legend: {
        position: 'bottomright',
        style: 'modern',          // 样式: 'gis', 'modern'
        layers: [],               // 图层数组
        draggable: true
    },
    
    // 经纬度格网配置
    graticule: {
        interval: null,           // 统一间隔(度)
        lngInterval: null,        // 经度间隔(度)
        latInterval: null,        // 纬度间隔(度)
        showLabels: true,         // 显示标注
        enabled: true,            // 是否启用
        frameEnabled: true,       // 显示边框
        frameDraggable: true,     // 边框可拖拽
        frameResizable: true      // 边框可调整大小
    },
    
    // 导出控件配置
    export: {
        position: 'topright',
        exportArea: 'graticule',  // 导出区域: 'graticule', 'visible', 'full'
        format: 'png',            // 格式: 'png', 'jpeg'
        quality: 1.0,             // 质量: 0.0-1.0
        filename: 'map'           // 文件名
    }
};

const controller = LeafletGISElements.createController(map, options);
```

## API文档

### LeafletGISElements 全局对象

```javascript
// 创建控制器
LeafletGISElements.createController(map, options)

// 获取可用样式
LeafletGISElements.getAvailableStyles('scale-bar')

// 全局配置
LeafletGISElements.configure({
    debug: true,
    autoSavePosition: true
})
```

### MapController 实例方法

```javascript
// 显示/隐藏控件
controller.show('northArrow')
controller.hide('scaleBar')
controller.toggle('legend')

// 切换样式
controller.setStyle('scaleBar', 'gis')
controller.setStyle('legend', 'modern')

// 重置位置
controller.resetPosition('northArrow')
controller.resetAllPositions()

// 更新图例
controller.updateLegendLayers([
    {
        name: '人口密度',
        type: 'gradient',
        colors: ['#fff', '#f00'],
        labels: ['低', '高'],
        unit: '人/km²'
    }
])

// 销毁控制器
controller.destroy()
```

## 图层配置示例

### 渐变图例

```javascript
{
    name: '温度分布',
    type: 'gradient',
    colors: ['#0000ff', '#00ff00', '#ffff00', '#ff0000'],
    labels: ['-10°C', '0°C', '10°C', '20°C'],
    unit: '摄氏度'
}
```

### 简单图例（多边形）

```javascript
{
    name: '土地利用',
    type: 'simple',
    geometryType: 'polygon',
    color: '#4CAF50',
    label: '农田'
}
```

### 简单图例（线）

```javascript
{
    name: '道路',
    type: 'simple',
    geometryType: 'line',
    color: '#FF9800',
    label: '主干道'
}
```

### 简单图例（点）

```javascript
{
    name: '学校',
    type: 'simple',
    geometryType: 'point',
    color: '#2196F3',
    label: '教育设施'
}
```

## 样式自定义

### 修改CSS变量

```css
<style>
:root {
    /* 修改主色调 */
    --primary-color: #ff5722;
    --primary-hover: #e64a19;
    
    /* 修改圆角 */
    --radius-md: 8px;
    
    /* 修改间距 */
    --spacing-md: 16px;
}
</style>
```

### 按需引入样式

```html
<!-- 只引入需要的样式 -->
<link rel="stylesheet" href="/static/css/base/variables.css">
<link rel="stylesheet" href="/static/css/base/reset.css">
<link rel="stylesheet" href="/static/css/layout/map.css">
<link rel="stylesheet" href="/static/css/controls/scale-bar-themes.css">
```

## 目录结构

```
LeafletGISElements/
├── leaflet_gis_elements/              # Python模块
│   ├── __init__.py             # 应用工厂
│   ├── config.py               # 配置
│   ├── views/                  # 视图蓝图
│   └── errors/                 # 错误处理
│
├── static/                     # 静态资源（可独立使用）
│   ├── js/                     # JavaScript模块
│   │   ├── index.js            # 模块加载器
│   │   ├── leaflet-gis-elements.js   # 统一API入口
│   │   ├── core/               # 核心类
│   │   ├── controls/           # 控件实现
│   │   └── styles/             # 样式定义
│   │
│   └── css/                    # CSS样式
│       ├── main.css            # 样式入口
│       ├── base/               # 基础样式
│       ├── layout/             # 布局
│       ├── components/         # 组件
│       ├── controls/           # 控件主题
│       └── utilities/          # 工具样式
│
├── templates/                  # HTML模板
├── app.py                      # 应用启动文件
└── requirements.txt            # Python依赖
```

## 依赖要求

### Python依赖

```
Flask>=2.0.0
```

### JavaScript依赖

```
Leaflet >= 1.9.4
```

### 浏览器兼容

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14

## 完整示例

参考 `templates/demo.html` 查看完整的集成示例。

## 常见问题

### 1. 控件不显示？

检查是否正确加载了所有依赖：
- Leaflet CSS和JS
- LeafletGISElements CSS和JS
- 是否等待 `leaflet-gis-elements-loaded` 事件

### 2. 样式不生效？

确保CSS加载顺序正确：
1. variables.css (变量定义)
2. reset.css (重置)
3. 其他样式文件

或直接使用 `main.css`。

### 3. 控件位置不能保存？

检查浏览器LocalStorage是否启用。可以通过配置禁用：

```javascript
LeafletGISElements.configure({
    autoSavePosition: false
})
```

## 技术支持

- 文档：查看各目录下的 README.md
- 示例：templates/demo.html
- 问题反馈：提交Issue到项目仓库

## 许可证

请参考项目根目录下的 LICENSE 文件。

