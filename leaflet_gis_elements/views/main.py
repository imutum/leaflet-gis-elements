#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
主路由视图
"""

from flask import Blueprint, render_template, send_from_directory, current_app
import os

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """主页 - 地图元素演示"""
    return render_template('demo.html')


@main_bp.route('/favicon.ico')
def favicon():
    """Favicon处理"""
    static_path = os.path.join(current_app.root_path, '../static')
    return send_from_directory(
        static_path,
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

