#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
应用启动文件
"""

import os
from leaflet_gis_elements import create_app

# 从环境变量获取配置名称，默认为development
config_name = os.environ.get('FLASK_CONFIG', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    # 开发环境运行配置
    app.run(
        host='0.0.0.0',  # 允许外部访问
        port=5000,       # 端口号
        debug=True       # 开发模式，自动重载
    )
