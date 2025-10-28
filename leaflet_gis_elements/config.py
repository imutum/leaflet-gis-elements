#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置模块
"""

import os


class Config:
    """基础配置"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JSON_AS_ASCII = False
    
    # 静态文件缓存
    SEND_FILE_MAX_AGE_DEFAULT = 0  # 开发环境不缓存


class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    TESTING = False
    SEND_FILE_MAX_AGE_DEFAULT = 31536000  # 生产环境缓存1年


class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DEBUG = True


# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

