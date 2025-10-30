// Type definitions for leaflet-gis-elements 1.0.0
// Project: https://github.com/yourusername/leaflet-gis-elements
// Definitions by: imutum
// TypeScript Version: 4.0+

import * as L from 'leaflet';

declare module 'leaflet' {
  namespace control {
    /**
     * 创建指北针控件
     * @param options 配置选项
     */
    function northArrow(options?: Control.NorthArrowOptions): Control.NorthArrow;

    /**
     * 创建比例尺控件
     * @param options 配置选项
     */
    function scaleBar(options?: Control.ScaleBarOptions): Control.ScaleBar;

    /**
     * 创建图例控件
     * @param options 配置选项
     */
    function legend(options?: Control.LegendOptions): Control.Legend;

    /**
     * 创建经纬网控件
     * @param options 配置选项
     */
    function graticule(options?: Control.GraticuleOptions): Control.Graticule;

    /**
     * 创建地图注记控件
     * @param options 配置选项
     */
    function mapInfo(options?: Control.MapInfoOptions): Control.MapInfo;

    /**
     * 创建导出预览控件
     * @param options 配置选项
     */
    function exportPreview(options?: Control.ExportPreviewOptions): Control.ExportPreview;
  }

  namespace Control {
    // ========== 指北针控件 ==========
    interface NorthArrowOptions extends ControlOptions {
      /** 控件位置，默认: 'topleft' */
      position?: ControlPosition;
      /** 是否可拖动，默认: true */
      draggable?: boolean;
      /** 指北针大小（像素），默认: 80 */
      size?: number;
      /** 样式名称: 'gis' | 'leaflet' | 'compact' | 'compass'，默认: 'gis' */
      style?: string;
      /** 自定义样式对象集合 */
      styles?: Record<string, any>;
    }

    class NorthArrow extends Control {
      constructor(options?: NorthArrowOptions);
      
      /** 设置大小（像素） */
      setSize(size: number): void;
      /** 切换样式 */
      setStyle(styleName: string): void;
      /** 获取当前样式名称 */
      getStyle(): string;
      /** 获取可用样式列表 */
      getAvailableStyles(): string[];
      /** 重新渲染 */
      render(): void;
    }

    // ========== 比例尺控件 ==========
    interface ScaleBarOptions extends ControlOptions {
      /** 控件位置，默认: 'bottomleft' */
      position?: ControlPosition;
      /** 是否可拖动，默认: true */
      draggable?: boolean;
      /** 最大宽度（像素），默认: 300 */
      maxWidth?: number;
      /** 是否显示公制单位，默认: true */
      metric?: boolean;
      /** 是否显示英制单位，默认: false */
      imperial?: boolean;
      /** 地图空闲时更新（false则实时更新），默认: false */
      updateWhenIdle?: boolean;
      /** 样式名称: 'gis' | 'leaflet' | 'minimal' | 'double' | 'striped'，默认: 'gis' */
      style?: string;
      /** 自定义样式对象集合 */
      styles?: Record<string, any>;
    }

    interface ScaleBarData {
      /** 实际距离（米） */
      meters: number;
      /** 显示宽度（像素） */
      width: number;
      /** 标签文本（如 "500 m"） */
      label: string;
    }

    class ScaleBar extends Control {
      constructor(options?: ScaleBarOptions);
      
      /** 当前比例尺数据 */
      scaleData: ScaleBarData;
      
      /** 手动更新比例尺 */
      update(): void;
      /** 切换样式 */
      setStyle(styleName: string): void;
      /** 获取当前样式 */
      getStyle(): string;
      /** 获取可用样式列表 */
      getAvailableStyles(): string[];
    }

    // ========== 图例控件 ==========
    interface LegendItem {
      /** 图例项标签 */
      label: string;
      /** 颜色（CSS颜色值） */
      color?: string;
      /** 图标HTML（可选，优先级高于color） */
      icon?: string;
      /** 图案类型: 'fill' | 'line' | 'point' */
      type?: 'fill' | 'line' | 'point';
    }

    interface LegendLayer {
      /** 图层名称 */
      name: string;
      /** 图例项数组 */
      items: LegendItem[];
    }

    interface LegendOptions extends ControlOptions {
      /** 控件位置，默认: 'bottomright' */
      position?: ControlPosition;
      /** 是否可拖动，默认: true */
      draggable?: boolean;
      /** 最大宽度（像素），默认: 300 */
      maxWidth?: number;
      /** 最大高度（像素），默认: 400 */
      maxHeight?: number;
      /** 图层数据数组 */
      layers?: LegendLayer[];
      /** 样式名称: 'gis' | 'modern'，默认: 'gis' */
      style?: string;
      /** 自定义样式对象集合 */
      styles?: Record<string, any>;
    }

    class Legend extends Control {
      constructor(options?: LegendOptions);
      
      /** 设置所有图层数据 */
      setLayers(layers: LegendLayer[]): void;
      /** 添加单个图层 */
      addLayer(layer: LegendLayer): void;
      /** 移除图层（按名称） */
      removeLayer(layerName: string): void;
      /** 清空所有图层 */
      clearLayers(): void;
      /** 更新显示 */
      update(): void;
      /** 切换样式 */
      setStyle(styleName: string): void;
      /** 获取当前样式 */
      getStyle(): string;
      /** 获取可用样式列表 */
      getAvailableStyles(): string[];
    }

    // ========== 经纬网控件 ==========
    interface GraticuleFrameRect {
      /** 左侧位置（像素） */
      left: number;
      /** 顶部位置（像素） */
      top: number;
      /** 宽度（像素） */
      width: number;
      /** 高度（像素） */
      height: number;
    }

    interface GraticuleLineStyle {
      /** 颜色 */
      color?: string;
      /** 线宽 */
      weight?: number;
      /** 透明度 */
      opacity?: number;
      /** 虚线样式 */
      dashArray?: string;
    }

    interface GraticuleLabelStyle {
      /** 字体大小（像素） */
      fontSize?: number;
      /** 字体类型 */
      fontFamily?: string;
    }

    interface GraticuleOptions {
      /** 统一间隔（度数），如果设置则覆盖lngInterval和latInterval */
      interval?: number | null;
      /** 经线间隔（度数），默认: 自动计算 */
      lngInterval?: number | null;
      /** 纬线间隔（度数），默认: 自动计算 */
      latInterval?: number | null;
      /** 是否显示坐标标签，默认: true */
      showLabels?: boolean;
      
      /** 经线颜色，默认: '#666' */
      meridianColor?: string;
      /** 经线宽度，默认: 1 */
      meridianWeight?: number;
      /** 经线透明度，默认: 0.5 */
      meridianOpacity?: number;
      /** 经线虚线样式，如 '5, 5'，默认: null（实线） */
      meridianDashArray?: string | null;
      
      /** 纬线颜色，默认: '#666' */
      parallelColor?: string;
      /** 纬线宽度，默认: 1 */
      parallelWeight?: number;
      /** 纬线透明度，默认: 0.5 */
      parallelOpacity?: number;
      /** 纬线虚线样式，默认: null（实线） */
      parallelDashArray?: string | null;
      
      /** 统一颜色（兼容旧API，优先级低于单独设置） */
      color?: string;
      /** 统一宽度（兼容旧API，优先级低于单独设置） */
      weight?: number;
      /** 统一透明度（兼容旧API，优先级低于单独设置） */
      opacity?: number;
      
      /** 标签字体大小（像素），默认: 11 */
      labelFontSize?: number;
      /** 标签字体类型，默认: 'Arial, sans-serif' */
      labelFontFamily?: string;
      
      /** 是否显示格网边框，默认: true */
      frameEnabled?: boolean;
      /** 边框颜色，默认: '#333' */
      frameColor?: string;
      /** 边框宽度，默认: 2 */
      frameWeight?: number;
      /** 边框透明度，默认: 0.8 */
      frameOpacity?: number;
      /** 边框是否可拖动，默认: true */
      frameDraggable?: boolean;
      /** 边框是否可调整大小，默认: true */
      frameResizable?: boolean;
      /** 边框初始位置和大小（像素坐标） */
      frameRect?: GraticuleFrameRect;
      
      /** 是否启用，默认: true */
      enabled?: boolean;
    }

    class Graticule extends Control {
      constructor(options?: GraticuleOptions);
      
      /** 更新格网（updateFrame: 是否更新边框，默认true） */
      updateGraticule(updateFrame?: boolean): void;
      /** 清除所有格网元素 */
      clearGraticule(): void;
      
      /** 启用格网显示 */
      enable(): void;
      /** 禁用格网显示 */
      disable(): void;
      /** 切换显示状态 */
      toggle(): void;
      /** 显示格网（同 enable） */
      showGraticule(): void;
      /** 隐藏格网（同 disable） */
      hideGraticule(): void;
      
      /** 设置统一间隔（度数） */
      setInterval(interval: number): void;
      /** 设置经线间隔 */
      setLngInterval(interval: number): void;
      /** 设置纬线间隔 */
      setLatInterval(interval: number): void;
      /** 同时设置经纬度间隔 */
      setIntervals(lngInterval: number, latInterval: number): void;
      /** 获取当前经线间隔 */
      getLngInterval(): number;
      /** 获取当前纬线间隔 */
      getLatInterval(): number;
      
      /** 启用边框 */
      enableFrame(): void;
      /** 禁用边框 */
      disableFrame(): void;
      /** 设置边框矩形（像素坐标） */
      setFrameRect(rect: GraticuleFrameRect): void;
      /** 获取边框矩形（像素坐标） */
      getFrameRect(): GraticuleFrameRect;
      /** 设置边框范围（地理坐标，兼容旧API） */
      setFrameBounds(bounds: LatLngBounds): void;
      /** 获取边框范围（地理坐标，兼容旧API） */
      getFrameBounds(): LatLngBounds;
      
      /** 设置经线样式 */
      setMeridianStyle(options: GraticuleLineStyle): void;
      /** 设置纬线样式 */
      setParallelStyle(options: GraticuleLineStyle): void;
      /** 设置标签样式 */
      setLabelStyle(options: GraticuleLabelStyle): void;
      /** 获取经线样式 */
      getMeridianStyle(): Required<GraticuleLineStyle>;
      /** 获取纬线样式 */
      getParallelStyle(): Required<GraticuleLineStyle>;
      /** 获取标签样式 */
      getLabelStyle(): Required<GraticuleLabelStyle>;
    }

    // ========== 地图注记控件 ==========
    interface MapInfoOptions extends ControlOptions {
      /** 控件位置，默认: 'topleft' */
      position?: ControlPosition;
      /** 是否可拖动，默认: true */
      draggable?: boolean;
      /** 样式名称: 'professional' | 'compact'，默认: 'professional' */
      style?: string;
      
      /** 地图标题 */
      title?: string;
      /** 副标题 */
      subtitle?: string;
      /** 制图者 */
      author?: string;
      /** 制图单位 */
      organization?: string;
      /** 制图日期（默认当前日期） */
      date?: string;
      /** 数据来源 */
      dataSource?: string;
      /** 投影坐标系，默认: 'WGS84 / EPSG:4326' */
      projection?: string;
      /** 地图比例尺，默认: '1:100000' */
      scale?: string;
      /** 备注说明 */
      notes?: string;
      
      /** 是否显示标题，默认: true */
      showTitle?: boolean;
      /** 是否显示副标题，默认: true */
      showSubtitle?: boolean;
      /** 是否显示制图者，默认: true */
      showAuthor?: boolean;
      /** 是否显示制图单位，默认: true */
      showOrganization?: boolean;
      /** 是否显示日期，默认: true */
      showDate?: boolean;
      /** 是否显示数据来源，默认: true */
      showDataSource?: boolean;
      /** 是否显示投影，默认: true */
      showProjection?: boolean;
      /** 是否显示比例尺，默认: true */
      showScale?: boolean;
      /** 是否显示备注，默认: true */
      showNotes?: boolean;
      
      /** 最大宽度，默认: 400 */
      maxWidth?: number;
      /** 最小宽度，默认: 200 */
      minWidth?: number;
    }

    interface MapInfoData {
      title?: string;
      subtitle?: string;
      author?: string;
      organization?: string;
      date?: string;
      dataSource?: string;
      projection?: string;
      scale?: string;
      notes?: string;
    }

    interface MapInfoShowConfig {
      showTitle?: boolean;
      showSubtitle?: boolean;
      showAuthor?: boolean;
      showOrganization?: boolean;
      showDate?: boolean;
      showDataSource?: boolean;
      showProjection?: boolean;
      showScale?: boolean;
      showNotes?: boolean;
    }

    class MapInfo extends Control {
      constructor(options?: MapInfoOptions);
      
      /** 设置标题 */
      setTitle(title: string): this;
      /** 设置副标题 */
      setSubtitle(subtitle: string): this;
      /** 设置制图者 */
      setAuthor(author: string): this;
      /** 设置制图单位 */
      setOrganization(organization: string): this;
      /** 设置日期 */
      setDate(date: string): this;
      /** 设置数据来源 */
      setDataSource(dataSource: string): this;
      /** 设置投影 */
      setProjection(projection: string): this;
      /** 设置比例尺 */
      setScale(scale: string): this;
      /** 设置备注 */
      setNotes(notes: string): this;
      
      /** 批量设置信息 */
      setInfo(info: Partial<MapInfoData>): this;
      
      /** 显示字段 */
      showField(field: string): this;
      /** 隐藏字段 */
      hideField(field: string): this;
      /** 设置显示配置 */
      setShowConfig(config: Partial<MapInfoShowConfig>): this;
      
      /** 设置最大宽度 */
      setMaxWidth(width: number): this;
      /** 设置最小宽度 */
      setMinWidth(width: number): this;
      
      /** 获取信息 */
      getInfo(): MapInfoData;
      /** 获取显示配置 */
      getShowConfig(): MapInfoShowConfig;
      
      /** 切换样式 */
      setStyle(styleName: string): void;
      /** 获取当前样式 */
      getStyle(): string;
      /** 获取可用样式列表 */
      getAvailableStyles(): string[];
    }

    // ========== 导出预览控件 ==========
    interface ExportBounds {
      /** 左侧位置（像素） */
      left: number;
      /** 顶部位置（像素） */
      top: number;
      /** 宽度（像素） */
      width: number;
      /** 高度（像素） */
      height: number;
    }

    interface ExportPreviewOptions extends ControlOptions {
      /** 控件位置，默认: 'topright' */
      position?: ControlPosition;
      /** 样式名称: 'default' */
      style?: string;
      
      /** 导出格式: 'png' | 'jpg'，默认: 'png' */
      format?: 'png' | 'jpg';
      /** 图片质量（0-1），默认: 1.0 */
      quality?: number;
      /** 文件名前缀，默认: 'map_export' */
      filename?: string;
      /** 导出缩放比例，默认: 2 */
      scale?: number;
      
      /** 导出边界（像素坐标） */
      exportBounds?: ExportBounds;
      /** 是否自动计算边界，默认: true */
      autoCalculateBounds?: boolean;
      /** 边界计算模式: 'graticule' | 'all' | 'viewport'，默认: 'graticule' */
      boundsMode?: 'graticule' | 'all' | 'viewport';
    }

    class ExportPreview extends Control {
      constructor(options?: ExportPreviewOptions);
      
      /** 预览是否可见 */
      previewVisible: boolean;
      
      /** 显示预览边框 */
      showPreview(): void;
      /** 隐藏预览边框 */
      hidePreview(): void;
      /** 切换预览边框显示 */
      togglePreview(): void;
      
      /** 执行导出（异步） */
      export(): Promise<void>;
      
      /** 添加要导出的图层 */
      addLayer(layer: Layer): this;
      /** 添加要导出的UI元素 */
      addUIElement(element: HTMLElement): this;
      /** 移除图层 */
      removeLayer(layer: Layer): this;
      /** 移除UI元素 */
      removeUIElement(element: HTMLElement): this;
      /** 清空白名单 */
      clearWhitelist(): this;
      
      /** 设置导出边界 */
      setExportBounds(rect: ExportBounds): this;
      /** 设置边界计算模式 */
      setBoundsMode(mode: 'graticule' | 'all' | 'viewport'): this;
      /** 重新计算边界 */
      recalculateBounds(): this;
      
      /** 设置导出格式 */
      setFormat(format: 'png' | 'jpg'): this;
      /** 设置导出质量 */
      setQuality(quality: number): this;
      /** 设置文件名 */
      setFilename(filename: string): this;
      /** 设置缩放比例 */
      setScale(scale: number): this;
      
      /** 切换样式 */
      setStyle(styleName: string): void;
      /** 获取当前样式 */
      getStyle(): string;
    }
  }

  // ========== GIS Elements 命名空间 ==========
  namespace GISElements {
    /** 版本号 */
    const version: string;

    // ========== 样式注册系统 ==========
    interface StyleObject {
      /** 样式名称 */
      name: string;
      /** 样式描述 */
      description?: string;
      /** 渲染函数 */
      render?: (...args: any[]) => string;
      /** SVG内容（仅指北针） */
      svg?: string | ((...args: any[]) => string);
      /** 渲染容器函数（仅图例） */
      renderContainer?: (...args: any[]) => string;
    }

    interface StyleInfo {
      id: string;
      name: string;
      description?: string;
    }

    interface StyleRegistry {
      /** 注册样式 */
      register(controlType: string, styleId: string, styleObject: StyleObject): void;
      /** 获取样式 */
      getStyle(controlType: string, styleId: string): StyleObject | null;
      /** 获取某类型的所有样式 */
      getStyles(controlType: string): Record<string, StyleObject>;
      /** 列出某类型的样式名称列表 */
      list(controlType?: string): StyleInfo[] | Record<string, StyleInfo[]>;
      /** 检查样式是否存在 */
      hasStyle(controlType: string, styleId: string): boolean;
    }

    const StyleRegistry: StyleRegistry;

    // ========== 坐标格式化工具 ==========
    interface CoordinateFormatter {
      /** 格式化为度分秒 (DMS) */
      toDMS(lat: number, lng: number): string;
      /** 格式化为度分 (DM) */
      toDM(lat: number, lng: number): string;
      /** 格式化为十进制度 (DD) */
      toDD(lat: number, lng: number, precision?: number): string;
      /** 解析度分秒字符串 */
      parseDMS(dmsString: string): { lat: number; lng: number } | null;
    }

    const CoordinateFormatter: CoordinateFormatter;

    // ========== 存储工具 ==========
    interface StorageUtils {
      /** 保存数据到本地存储 */
      save(key: string, value: any): void;
      /** 从本地存储读取 */
      load(key: string): any;
      /** 删除存储项 */
      remove(key: string): void;
      /** 清空所有存储 */
      clear(): void;
    }

    const StorageUtils: StorageUtils;

    // ========== 全局配置 ==========
    interface GlobalConfig {
      /** 调试模式，默认: false */
      debug: boolean;
      /** 自动保存控件位置，默认: true */
      autoSavePosition: boolean;
      /** 存储键前缀，默认: 'leaflet-gis-elements-' */
      storagePrefix: string;
    }

    /** 全局配置 */
    function configure(options: Partial<GlobalConfig>): void;

    /** 当前配置 */
    const config: GlobalConfig;

    // ========== 地图控制器 ==========
    interface MapControllerControlOptions {
      enabled?: boolean;
      [key: string]: any;
    }

    interface MapControllerOptions {
      controls?: {
        northArrow?: MapControllerControlOptions;
        scaleBar?: MapControllerControlOptions;
        legend?: MapControllerControlOptions;
        graticule?: MapControllerControlOptions;
        mapInfo?: MapControllerControlOptions;
        exportPreview?: MapControllerControlOptions;
      };
    }

    interface MapController {
      /** 地图实例 */
      map: Map;
      /** 控件实例集合 */
      controls: {
        northArrow?: Control.NorthArrow;
        scaleBar?: Control.ScaleBar;
        legend?: Control.Legend;
        graticule?: Control.Graticule;
        mapInfo?: Control.MapInfo;
        exportPreview?: Control.ExportPreview;
      };
      
      /** 启用控件 */
      enableControl(name: string): void;
      /** 禁用控件 */
      disableControl(name: string): void;
      /** 获取控件 */
      getControl(name: string): Control | null;
      /** 销毁控制器 */
      destroy(): void;
    }

    /** 创建地图控制器 */
    function createController(map: Map, options?: MapControllerOptions): MapController;

    /** 获取可用样式列表 */
    function getAvailableStyles(controlType?: string): StyleInfo[] | Record<string, StyleInfo[]>;

    // ========== 导出相关 ==========
    interface ExportConfig {
      /** 默认导出格式 */
      DEFAULT_FORMAT: string;
      /** 默认图片质量 */
      DEFAULT_QUALITY: number;
      /** 默认文件名 */
      DEFAULT_FILENAME: string;
      /** 默认缩放比例 */
      DEFAULT_SCALE: number;
      /** 支持的格式 */
      SUPPORTED_FORMATS: string[];
    }

    const ExportConfig: ExportConfig;

    class MapExporter {
      constructor(map: Map, options?: any);
      export(): Promise<void>;
    }

    class BoundsCalculator {
      constructor(map: Map);
      calculate(mode: string): any;
    }

    class SVGFixer {
      static fix(svgElement: SVGElement): void;
    }

    // ========== 通知工具 ==========
    interface Notification {
      /** 显示成功消息 */
      success(message: string, duration?: number): void;
      /** 显示错误消息 */
      error(message: string, duration?: number): void;
      /** 显示警告消息 */
      warning(message: string, duration?: number): void;
      /** 显示信息消息 */
      info(message: string, duration?: number): void;
    }

    const Notification: Notification;

    // ========== 拖拽工具 ==========
    class Draggable {
      constructor(element: HTMLElement, options?: any);
      enable(): void;
      disable(): void;
      destroy(): void;
    }

    // ========== 调整大小工具 ==========
    class Resizable {
      constructor(element: HTMLElement, options?: any);
      enable(): void;
      disable(): void;
      destroy(): void;
    }

    // ========== 基础控件类 ==========
    class BaseControl extends Control {
      constructor(options?: any);
      createControl(): this;
    }

    class StylableControl extends BaseControl {
      constructor(options?: any);
      setStyle(styleName: string): void;
      getStyle(): string;
      getAvailableStyles(): string[];
    }

    // ========== 常量 ==========
    interface Constants {
      CONTROL_TYPES: {
        NORTH_ARROW: string;
        SCALE_BAR: string;
        LEGEND: string;
        GRATICULE: string;
        MAP_INFO: string;
        EXPORT_PREVIEW: string;
      };
      [key: string]: any;
    }

    const Constants: Constants;
  }
}

export {};

