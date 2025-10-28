# LeafletGISElements - 可拖拽地图元素模块

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![Leaflet](https://img.shields.io/badge/leaflet-1.9+-green.svg)
![License](https://img.shields.io/badge/license-MIT-red.svg)

**基于 Leaflet 的模块化可拖拽地图控件库**

[快速开始](#-快速开始) · [在线演示](#-在线演示) · [完整API文档](docs/TYPES.md)

</div>

---

## ✨ 特性

- 🎯 **模块化设计** - 高度解耦，易于集成和扩展
- 🎨 **多样式主题** - 提供多种预设样式，支持自定义
- 🖱️ **可拖拽控件** - 所有控件支持拖拽，位置自动保存
- 📱 **响应式设计** - 完美支持桌面端和移动端
- 🔧 **完整API** - 丰富的API接口，灵活控制
- 📦 **开箱即用** - 提供完整示例，快速上手

## 📦 包含控件

| 控件       | 说明             | 可用样式                               |
| ---------- | ---------------- | -------------------------------------- |
| **指北针** | 动态旋转指向北方 | gis, leaflet, compact, compass         |
| **比例尺** | 自动计算地图比例 | gis, leaflet, minimal, double, striped |
| **图例**   | 可视化图层分类   | gis, modern                            |
| **经纬网** | 显示经纬度网格   | simple, dense（可自定义间隔）          |
| **导出**   | 导出地图为图片   | PNG, JPEG（支持多种导出范围）          |

> 📖 **详细API文档和使用示例**：请查看 [docs/TYPES.md](docs/TYPES.md)

## 🎬 在线演示

```bash
# 克隆项目后，安装依赖
npm install

# 启动演示（自动打开浏览器）
npm run demo
```

访问 `http://localhost:8080` 查看完整的交互式演示。

## 🚀 快速开始

### 通过 CDN 使用（推荐）

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-gis-elements@1.0.0/dist/leaflet-gis-elements.min.css">
</head>
<body>
    <!-- 重要：添加命名空间类防止样式污染 -->
    <div class="leaflet-gis-elements">
        <div id="map"></div>
    </div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet-gis-elements@1.0.0/dist/leaflet-gis-elements.min.js"></script>
    
    <script>
        // 创建地图
        const map = L.map('map').setView([39.9, 116.4], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // 添加控件 - 方式1：单独添加
        L.control.northArrow({ position: 'topleft', style: 'gis' }).addTo(map);
        L.control.scaleBar({ position: 'bottomleft', style: 'leaflet' }).addTo(map);
        L.control.legend({ position: 'bottomright', style: 'modern', layers: [] }).addTo(map);
        L.control.graticule({ interval: 1 }).addTo(map);
        L.control.export({ position: 'topright' }).addTo(map);
        
        // 或者方式2：使用控制器统一管理
        const controller = LeafletGISElements.createController(map, {
            northArrow: { style: 'compass' },
            scaleBar: { style: 'gis' }
        });
    </script>
</body>
</html>
```

> 💡 **更多使用方式**：查看 [examples/cdn-usage.html](examples/cdn-usage.html) 和 [examples/demo.html](examples/demo.html)

## 📚 使用文档

### 完整API文档
📖 **[docs/TYPES.md](docs/TYPES.md)** - 包含：
- 所有控件的详细配置选项
- 完整的类型定义和接口说明
- 丰富的代码示例
- 事件系统和高级用法
- 自定义样式开发指南

### 开发指南
- **[构建指南](docs/BUILD.md)** - 如何构建和发布
- **[集成指南](docs/INTEGRATION.md)** - 集成到现有项目
- **[JavaScript模块说明](src/js/README.md)** - 代码架构
- **[CSS样式说明](src/css/README.md)** - 样式系统

## 📚 项目结构

```
leaflet-gis-elements/
├── src/                        # 📦 插件源代码
│   ├── js/                     # JavaScript源码
│   │   ├── core/               # 核心类
│   │   │   ├── base-control.js
│   │   │   ├── stylable-control.js
│   │   │   ├── map-exporter.js
│   │   │   └── utils/          # 工具函数
│   │   ├── controls/           # 控件实现
│   │   │   ├── north-arrow/
│   │   │   ├── scale-bar/
│   │   │   ├── legend/
│   │   │   ├── graticule/
│   │   │   └── export/
│   │   ├── styles/             # 样式定义
│   │   │   ├── north-arrow/
│   │   │   ├── scale-bar/
│   │   │   ├── legend/
│   │   │   └── graticule/
│   │   ├── map-controller.js   # 主控制器
│   │   ├── style-registry.js   # 样式注册器
│   │   └── leaflet-gis-elements-main.js  # 统一API
│   ├── css/                    # CSS样式（原子化）
│   │   ├── main.css            # 主入口
│   │   ├── base/               # 基础样式
│   │   ├── components/         # 通用组件
│   │   ├── controls/           # 控件主题
│   │   ├── layout/             # 布局
│   │   └── utilities/          # 工具样式
│   └── index.js                # Webpack入口
│
├── dist/                       # 🚀 构建输出（发布到npm/CDN）
│   ├── leaflet-gis-elements.js
│   ├── leaflet-gis-elements.min.js
│   ├── leaflet-gis-elements.css
│   └── leaflet-gis-elements.min.css
│
├── examples/                   # 🎨 使用示例
│   ├── demo.html               # 完整功能演示
│   ├── cdn-usage.html          # CDN使用示例
│   └── README.md               # 示例说明
│
├── docs/                       # 📚 文档
│   └── TYPES.md                # 完整API文档
│
├── package.json                # npm配置
├── webpack.config.js           # Webpack配置
├── postcss.config.js           # PostCSS配置
├── LICENSE                     # MIT许可证
└── README.md                   # 项目说明
```

## 🔧 开发和构建

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run watch

# 构建生产版本（输出到 dist/）
npm run build

# 启动本地演示
npm run demo
```

## 🛠️ 技术栈

- **核心依赖**：Leaflet 1.9.4+
- **语言**：ES6+ JavaScript、原生CSS（CSS变量）
- **构建工具**：Webpack 5、PostCSS、Terser
- **架构设计**：模块化 + 单一职责原则

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- [Leaflet](https://leafletjs.com/) - 优秀的开源地图库
- [Webpack](https://webpack.js.org/) - 强大的模块打包工具

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️**

</div>

