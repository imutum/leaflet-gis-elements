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

## ✨ 核心特性

- 🎯 **模块化设计** - 高度解耦，每个控件独立工作，易于集成和扩展
- 🎨 **多样式主题** - 提供多种预设样式，支持自定义主题开发
- 🖱️ **可拖拽控件** - 所有控件支持拖拽定位，位置自动本地保存
- 🎛️ **外部控制** - 控件无内置UI面板，通过API完全由外部控制
- 🧠 **智能UI** - 控件未启用时设置自动折叠，界面简洁清晰
- 📱 **响应式设计** - 完美支持桌面端和移动端，自适应屏幕尺寸
- 🔧 **完整API** - 丰富的API接口，灵活控制所有行为
- 📦 **开箱即用** - 提供完整示例和文档，快速上手
- 🚫 **零样式污染** - 使用命名空间，不影响其他项目样式

## 📦 包含控件

| 控件         | 说明                 | 可用样式                        |
| ------------ | -------------------- | ------------------------------- |
| **指北针**   | 动态旋转指向北方     | gis, leaflet, compact, compass  |
| **比例尺**   | 自动计算地图比例     | gis, leaflet, minimal, double   |
| **图例**     | 可视化图层分类       | gis, modern                     |
| **经纬网**   | 显示经纬度网格       | simple, dense（可自定义间隔）   |
| **地图注记** | 显示地图标题和元数据 | professional, compact           |
| **导出预览** | 预览并导出地图为图片 | default（支持PNG/JPEG多种范围） |

> 📖 **详细API文档和使用示例**：请查看 [docs/TYPES.md](docs/TYPES.md)

## 🎬 在线演示

```bash
# 克隆项目
git clone https://github.com/your-repo/leaflet-gis-elements.git
cd leaflet-gis-elements

# 安装依赖
npm install

# 启动开发服务器（自动打开浏览器）
npm run demo
```

访问 `http://localhost:8080` 查看完整的交互式演示，包含所有控件的实时配置和效果预览。

## 🚀 快速开始

### 📦 安装方式

#### 方式1：通过 CDN 使用（推荐）

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet GIS Elements 示例</title>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <!-- Leaflet GIS Elements CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-gis-elements@1.0.0/dist/leaflet-gis-elements.min.css">
    
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <!-- 重要：添加命名空间类防止样式污染 -->
    <div class="leaflet-gis-elements">
        <div id="map"></div>
    </div>
    
    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <!-- Leaflet GIS Elements JS -->
    <script src="https://cdn.jsdelivr.net/npm/leaflet-gis-elements@1.0.0/dist/leaflet-gis-elements.min.js"></script>
    
    <script>
        // 1. 创建地图
        const map = L.map('map').setView([39.9, 116.4], 10);
        
        // 2. 添加底图
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // 3. 添加控件 - 方式1：单独添加
        L.control.northArrow({ 
            position: 'topleft', 
            style: 'gis' 
        }).addTo(map);
        
        L.control.scaleBar({ 
            position: 'bottomleft', 
            style: 'leaflet' 
        }).addTo(map);
        
        L.control.legend({ 
            position: 'bottomright', 
            style: 'modern', 
            layers: [] 
        }).addTo(map);
        
        L.control.graticule({ 
            interval: 1 
        }).addTo(map);
        
        L.control.mapInfo({ 
            position: 'topright', 
            title: '我的地图',
            subtitle: '基于 Leaflet GIS Elements'
        }).addTo(map);
        
        L.control.exportPreview({ 
            position: 'topright' 
        }).addTo(map);
        
        // 或者方式2：使用控制器统一管理（推荐）
        const controller = L.GISElements.createController(map, {
            northArrow: { 
                style: 'compass',
                position: 'topleft'
            },
            scaleBar: { 
                style: 'gis',
                position: 'bottomleft'
            },
            mapInfo: { 
                title: '我的地图',
                subtitle: '2024年度规划图'
            }
        });
        
        // 通过控制器访问控件实例
        // controller.getControl('northArrow').setStyle('leaflet');
    </script>
</body>
</html>
```

#### 方式2：通过 npm/yarn 安装

```bash
# npm
npm install leaflet-gis-elements

# yarn
yarn add leaflet-gis-elements

# pnpm
pnpm add leaflet-gis-elements
```

在项目中使用：

```javascript
// 导入 CSS
import 'leaflet-gis-elements/dist/leaflet-gis-elements.min.css';

// 导入 JS（会自动扩展 L 对象）
import 'leaflet-gis-elements';

// 或者按需导入
import { createController } from 'leaflet-gis-elements';

// 创建地图并添加控件
const map = L.map('map').setView([39.9, 116.4], 10);
L.control.northArrow({ style: 'gis' }).addTo(map);
```

> 💡 **完整交互式示例**：查看 [examples/index.html](examples/index.html)

## 📚 使用文档

### 📖 完整API文档
**[docs/TYPES.md](docs/TYPES.md)** - 包含：
- 所有控件的详细配置选项和方法
- 完整的类型定义和接口说明
- 丰富的代码示例和最佳实践
- 事件系统和高级用法
- 自定义样式开发指南

### 🎨 样式系统文档
**[test/src/css/README.md](test/src/css/README.md)** - CSS架构说明：
- 样式组织结构和命名规范
- 如何自定义和扩展样式
- CSS变量系统使用

## 📚 项目结构

```
leaflet-gis-elements/
├── test/src/                      # 📦 插件源代码
│   ├── js/                        # JavaScript源码
│   │   ├── base/                  # 核心基类
│   │   │   ├── base-control.js        # 控件基类
│   │   │   └── stylable-control.js    # 可样式化控件基类
│   │   ├── controllers/           # 控制器和注册器
│   │   │   ├── map-controller.js      # 主控制器
│   │   │   └── style-registry.js      # 样式注册器
│   │   ├── controls/              # 控件实现
│   │   │   ├── north-arrow/           # 指北针控件
│   │   │   ├── scale-bar/             # 比例尺控件
│   │   │   ├── legend/                # 图例控件
│   │   │   ├── graticule/             # 经纬网控件
│   │   │   ├── map-info/              # 地图注记控件
│   │   │   └── export-preview/        # 导出预览控件
│   │   ├── styles/                # 样式定义（JS配置）
│   │   │   ├── north-arrow/           # 指北针样式
│   │   │   ├── scale-bar/             # 比例尺样式
│   │   │   ├── legend/                # 图例样式
│   │   │   ├── graticule/             # 经纬网样式
│   │   │   ├── map-info/              # 地图注记样式
│   │   │   └── export-preview/        # 导出预览样式
│   │   ├── export/                # 导出系统
│   │   │   ├── export-config.js       # 导出配置
│   │   │   ├── bounds-calculator.js   # 边界计算
│   │   │   ├── svg-fixer.js           # SVG修复
│   │   │   └── map-exporter.js        # 地图导出器
│   │   ├── utils/                 # 工具函数
│   │   │   ├── coordinate.js          # 坐标工具
│   │   │   ├── draggable.js           # 拖拽工具
│   │   │   ├── storage.js             # 本地存储
│   │   │   └── notification.js        # 通知工具
│   │   └── constants.js           # 常量定义
│   ├── css/                       # CSS样式
│   │   ├── controls.css               # 控件样式入口
│   │   ├── base/                      # 基础样式
│   │   │   ├── variables.css          # CSS变量
│   │   │   └── control-base.css       # 控件基础样式
│   │   ├── controls/                  # 各控件样式
│   │   │   ├── graticule-styles.css
│   │   │   ├── legend-styles.css
│   │   │   ├── map-info-styles.css
│   │   │   └── scale-bar-styles.css
│   │   └── utilities/                 # 工具样式
│   │       ├── animations.css         # 动画效果
│   │       ├── helpers.css            # 辅助类
│   │       ├── print.css              # 打印样式
│   │       └── responsive.css         # 响应式
│   ├── index.js                   # Webpack入口
│   └── index.d.ts                 # TypeScript类型定义
│
├── dist/                          # 🚀 构建输出（发布到npm/CDN）
│   ├── leaflet-gis-elements.min.js    # 压缩JS
│   ├── leaflet-gis-elements.min.js.map
│   ├── leaflet-gis-elements.min.css   # 压缩CSS
│   └── leaflet-gis-elements.min.css.map
│
├── examples/                      # 🎨 使用示例
│   ├── index.html                     # 完整交互式演示
│   ├── js/                            # 示例脚本
│   │   ├── config.js                  # 配置
│   │   ├── demo.js                    # 演示逻辑
│   │   └── ui-controller.js           # UI控制
│   └── styles/                        # 示例样式
│       └── main.css
│
├── docs/                          # 📚 文档
│   └── TYPES.md                       # 完整API文档
│
├── package.json                   # npm配置
├── webpack.config.js              # Webpack配置
├── postcss.config.js              # PostCSS配置
├── LICENSE                        # MIT许可证
└── README.md                      # 项目说明
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
- **语言**：ES6+ JavaScript、原生CSS3（CSS变量）
- **构建工具**：Webpack 5、PostCSS、Terser
- **架构设计**：模块化 + 单一职责原则 + 控件与UI解耦
- **兼容性**：现代浏览器（Chrome、Firefox、Safari、Edge）

## 🗺️ 应用场景

- **GIS应用开发**：为Web GIS应用快速添加专业地图元素
- **数据可视化**：为数据地图添加图例、比例尺等必要组件
- **地图制图**：生成带有标准地图元素的专业制图产品
- **学术研究**：为学术论文和报告生成规范的地图
- **业务系统集成**：在企业系统中嵌入完整的地图展示功能

## 💡 设计理念

本项目遵循以下核心设计原则：

1. **单一职责**：每个控件只负责一项功能，不包含复杂的业务逻辑
2. **控件与UI解耦**：控件本身不提供配置面板，所有设置通过外部API控制
3. **高度可扩展**：支持自定义样式主题，易于二次开发
4. **零依赖污染**：除 Leaflet 外无其他依赖，样式使用命名空间隔离
5. **用户体验优先**：所有控件可拖拽，位置自动保存，交互流畅

## ❓ 常见问题

<details>
<summary><strong>如何自定义控件样式？</strong></summary>

每个控件都支持自定义样式配置，有两种方式：

1. **使用预设样式**：通过 `style` 参数选择内置样式
2. **自定义样式对象**：参考 `test/src/js/styles/` 目录下的样式定义，创建自己的样式配置

详见 [docs/TYPES.md](docs/TYPES.md) 中的自定义样式章节。
</details>

<details>
<summary><strong>控件位置如何保存和恢复？</strong></summary>

控件位置默认会自动保存到 `localStorage`，下次加载时自动恢复。可以通过全局配置关闭：

```javascript
L.GISElements.configure({
    autoSavePosition: false
});
```
</details>

<details>
<summary><strong>如何在导出时包含/排除特定控件？</strong></summary>

导出预览控件支持白名单配置，可以指定哪些控件需要包含在导出图片中：

```javascript
const exportControl = L.control.exportPreview({
    includeControls: ['northArrow', 'scaleBar', 'mapInfo']
});
```
</details>

<details>
<summary><strong>是否支持 TypeScript？</strong></summary>

目前使用 JavaScript 编写，但提供了完整的 JSDoc 注释。TypeScript 类型定义文件正在计划中。
</details>

## 🤝 贡献指南

欢迎贡献代码、提出建议或报告问题！

### 如何贡献

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范

- 遵循 ES6+ 语法规范
- 保持代码简洁，单一职责
- 添加必要的注释和文档
- 确保构建无错误 (`npm run build`)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Leaflet](https://leafletjs.com/) - 优秀的开源地图库
- [Webpack](https://webpack.js.org/) - 强大的模块打包工具
- 所有为本项目贡献代码和建议的开发者

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️**

Made with ❤️ by GIS Developers

</div>


