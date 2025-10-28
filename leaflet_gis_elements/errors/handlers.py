#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
错误处理器
"""

from flask import render_template


def register_error_handlers(app):
    """
    注册错误处理器
    
    Args:
        app: Flask应用实例
    """
    
    @app.errorhandler(404)
    def page_not_found(e):
        """404错误处理"""
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def internal_server_error(e):
        """500错误处理"""
        return render_template('500.html'), 500

