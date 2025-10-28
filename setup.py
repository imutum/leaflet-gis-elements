#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LeafletGISElements 安装配置
"""

from setuptools import setup, find_packages

with open('README.md', 'r', encoding='utf-8') as f:
    long_description = f.read()

with open('requirements.txt', 'r', encoding='utf-8') as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]

setup(
    name='leaflet-gis-elements',
    version='1.0.0',
    author='Your Name',
    author_email='your.email@example.com',
    description='可拖拽地图元素模块 - 基于Flask和Leaflet的地图控件库',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/yourusername/leaflet-gis-elements',
    packages=find_packages(),
    include_package_data=True,
    package_data={
        '': ['static/**/*', 'templates/**/*']
    },
    install_requires=requirements,
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Framework :: Flask',
    ],
    python_requires='>=3.7',
    keywords='flask leaflet map controls draggable gis',
    project_urls={
        'Documentation': 'https://github.com/yourusername/leaflet-gis-elements/wiki',
        'Source': 'https://github.com/yourusername/leaflet-gis-elements',
        'Bug Reports': 'https://github.com/yourusername/leaflet-gis-elements/issues',
    },
)

