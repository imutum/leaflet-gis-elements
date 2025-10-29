/**
 * Demo 配置文件
 * 集中管理示例的配置项
 */

(function (window) {
    'use strict';

    window.DemoConfig = {
        // 地图初始配置
        map: {
            center: [39.9042, 116.4074], // 北京
            zoom: 10,
            maxZoom: 18
        },

        // 底图配置
        basemap: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },

        // 示例图层数据
        sampleLayers: [
            {
                name: '温度分布',
                type: 'gradient',
                colors: ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'],
                labels: ['-10°C', '0°C', '10°C', '20°C', '30°C'],
                unit: '摄氏度 (°C)'
            },
            {
                name: '降水量',
                type: 'gradient',
                colors: ['#ffffff', '#b3e5fc', '#4fc3f7', '#0288d1', '#01579b'],
                labels: ['0', '25', '50', '75', '100'],
                unit: '毫米 (mm)'
            },
            {
                name: '人口密度',
                color: '#ff6b6b',
                type: 'polygon'
            },
            {
                name: '交通路网',
                color: '#4ecdc4',
                type: 'line'
            },
            {
                name: '重点设施',
                color: '#45b7d1',
                type: 'point'
            }
        ],

        // 控件初始配置
        controls: {
            mapInfo: {
                position: 'topleft',
                style: 'professional',
                draggable: true
            },
            northArrow: {
                position: 'topleft',
                style: 'gis',
                size: 80,
                draggable: true
            },
            scaleBar: {
                position: 'bottomleft',
                style: 'gis',
                maxWidth: 300,
                draggable: true
            },
            legend: {
                position: 'bottomright',
                style: 'gis',
                draggable: true
            },
            graticule: {
                position: 'topleft',
                style: 'simple',
                enabled: true,
                showLabels: true,
                draggable: true
            }
        },

        // 导出默认配置
        export: {
            format: 'png',
            quality: 1.0,
            filename: 'thematic_map',
            scale: 2,
            autoCalculateBounds: true
        }
    };

})(window);
