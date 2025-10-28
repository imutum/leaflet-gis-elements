# LeafletGISElements - 可拖拽地图元素模块

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.7+-green.svg)
![Flask](https://img.shields.io/badge/flask-2.0+-orange.svg)
![License](https://img.shields.io/badge/license-MIT-red.svg)

**基于 Flask + Leaflet 的模块化地图控件库**

[快速开始](#快速开始) · [在线演示](#在线演示) · [API文档](#api文档) · [集成指南](INTEGRATION.md)

</div>

---

## ✨ 特性

- 🎯 **模块化设计** - 高度解耦，易于集成和扩展
- 🎨 **多样式主题** - 提供多种预设样式，支持自定义
- 🖱️ **可拖拽控件** - 所有控件支持拖拽，位置自动保存
- 📱 **响应式设计** - 完美支持桌面端和移动端
- 🔧 **完整API** - 丰富的API接口，灵活控制
- 📦 **开箱即用** - 提供完整示例，快速上手

## 🎬 在线演示

运行项目后访问 `http://localhost:5000` 查看完整演示。

## 📦 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

### 运行应用

```bash
python app.py
```

访问 `http://localhost:5000` 即可看到演示页面。

### 基础使用

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="/static/css/main.css">
</head>
<body>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="/static/js/leaflet-gis-elements-index.js"></script>
    
    <script>
        window.addEventListener('leaflet-gis-elements-loaded', function() {
            const map = L.map('map').setView([39.9, 116.4], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            
            const controller = LeafletGISElements.createController(map, {
                northArrow: { style: 'gis' },
                scaleBar: { style: 'leaflet' },
                legend: { style: 'modern', layers: [] }
            });
        });
    </script>
</body>
</html>
```

## 🎨 控件展示

### 指北针 (North Arrow)
- **样式**：simple, gis, modern, compass
- **特性**：可拖拽、可调整大小、多种风格

### 比例尺 (Scale Bar)
- **样式**：leaflet, gis（默认）, gis-classic, minimal, double
- **特性**：自动计算、多单位支持、可拖拽

### 图例 (Legend)
- **样式**：gis, modern
- **类型**：渐变图例、符号图例
- **特性**：动态更新、自定义样式

### 经纬度格网 (Graticule)
- **特性**：自动间隔、标注显示、可配置边框
- **功能**：支持自定义经纬度间隔

### 导出控件 (Export)
- **格式**：PNG, JPEG
- **区域**：格网区域、可见区域、全图
- **特性**：高质量导出

## 📚 项目结构

```
LeafletGISElements/
├── leaflet_gis_elements/              # Python模块（Flask应用）
│   ├── __init__.py             # 应用工厂
│   ├── config.py               # 配置管理
│   ├── views/                  # 视图蓝图
│   │   ├── __init__.py
│   │   └── main.py
│   ├── errors/                 # 错误处理
│   │   ├── __init__.py
│   │   └── handlers.py
│   └── utils/                  # 工具函数（预留）
│
├── static/                     # 静态资源（可独立使用）
│   ├── js/                     # JavaScript模块
│   │   ├── leaflet-gis-elements-index.js            # 模块加载器（入口）
│   │   ├── leaflet-gis-elements-main.js   # 统一API
│   │   ├── map-controller.js  # 主控制器
│   │   ├── style-registry.js  # 样式注册器
│   │   ├── core/               # 核心类
│   │   │   ├── base-control.js
│   │   │   ├── stylable-control.js
│   │   │   ├── map-exporter.js
│   │   │   └── utils/
│   │   ├── controls/           # 控件实现
│   │   │   ├── legend/
│   │   │   ├── scale-bar/
│   │   │   ├── north-arrow/
│   │   │   ├── graticule/
│   │   │   └── export/
│   │   └── styles/             # 样式定义
│   │       ├── scale-bar/
│   │       ├── legend/
│   │       └── graticule/
│   │
│   └── css/                    # CSS样式（原子化）
│       ├── main.css            # 主入口
│       ├── base/               # 基础样式
│       │   ├── variables.css   # CSS变量
│       │   └── reset.css       # 重置样式
│       ├── layout/             # 布局
│       │   ├── map.css
│       │   └── panel.css
│       ├── components/         # 通用组件
│       │   ├── buttons.css
│       │   ├── forms.css
│       │   ├── notifications.css
│       │   └── scrollbar.css
│       ├── controls/           # 控件主题
│       │   ├── scale-bar-themes.css
│       │   ├── legend-themes.css
│       │   └── ...
│       └── utilities/          # 工具样式
│           ├── animations.css
│           ├── responsive.css
│           └── print.css
│
├── templates/                  # HTML模板
│   ├── demo.html               # 演示页面
│   ├── 404.html
│   └── 500.html
│
├── app.py                      # 应用启动文件
├── setup.py                    # 安装配置
├── requirements.txt            # Python依赖
├── README.md                   # 项目说明（本文件）
├── INTEGRATION.md              # 集成指南
└── 文件结构.md                 # 详细文件结构
```

## 🔧 API文档

### 创建控制器

```javascript
const controller = LeafletGISElements.createController(map, options);
```

### 控制器方法

```javascript
// 显示/隐藏控件
controller.show('northArrow');
controller.hide('scaleBar');
controller.toggle('legend');

// 切换样式
controller.setStyle('scaleBar', 'gis');

// 重置位置
controller.resetPosition('northArrow');
controller.resetAllPositions();

// 更新图例
controller.updateLegendLayers(layers);

// 销毁控制器
controller.destroy();
```

详细API文档请查看 [INTEGRATION.md](INTEGRATION.md)。

## 🎯 集成到其他项目

### 作为Flask蓝图

```python
from leaflet_gis_elements import create_app

app = create_app('production')
```

### 仅使用前端模块

复制 `static/` 目录到你的项目，然后引入：

```html
<script src="/static/js/leaflet-gis-elements-index.js"></script>
```

详细集成方式请查看 [INTEGRATION.md](INTEGRATION.md)。

## 🛠️ 技术栈

- **后端**：Flask 2.0+
- **前端**：
  - Leaflet 1.9.4（地图库）
  - 原生JavaScript（ES6+）
  - 原生CSS（CSS变量）
- **架构**：
  - Python：应用工厂 + 蓝图
  - JavaScript：模块化 + 单一职责
  - CSS：原子化 + 主题分离

## 📖 开发文档

- [JavaScript模块说明](static/js/README.md)
- [CSS样式说明](static/css/README.md)
- [集成指南](INTEGRATION.md)

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 作者

Your Name - your.email@example.com

## 🙏 致谢

- [Leaflet](https://leafletjs.com/) - 优秀的开源地图库
- [Flask](https://flask.palletsprojects.com/) - 轻量级Python Web框架

---

<div align="center">
如果这个项目对你有帮助，请给一个 ⭐️
</div>

