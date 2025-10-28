#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LeafletGISElements - 可拖拽地图元素模块
提供Flask应用工厂和模块初始化
"""

from flask import Flask
from .config import config


def create_app(config_name='default'):
    """
    应用工厂函数
    
    Args:
        config_name: 配置名称 ('development', 'production', 'testing', 'default')
    
    Returns:
        Flask应用实例
    """
    app = Flask(__name__,
                static_folder='../static',
                template_folder='../templates')
    
    # 加载配置
    app.config.from_object(config[config_name])
    
    # 注册蓝图
    from .views import main_bp
    app.register_blueprint(main_bp)
    
    # 注册错误处理器
    from .errors import register_error_handlers
    register_error_handlers(app)
    
    return app


__version__ = '1.0.0'
__all__ = ['create_app']

