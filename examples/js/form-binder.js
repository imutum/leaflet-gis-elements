/**
 * 表单绑定工具类
 * 提供通用的DOM元素与对象方法的绑定功能
 */

(function (window) {
    'use strict';

    /**
     * 表单绑定器 - 减少UI控制器中的重复代码
     */
    function FormBinder() { }

    /**
     * 绑定输入框到对象方法或回调函数
     * @param {string} elementId - DOM元素ID
     * @param {Object|Function} targetObjectOrCallback - 目标对象或回调函数
     * @param {string} methodName - 方法名（当第二参数为对象时）
     * @param {string} event - 事件类型 (默认: 'input')
     */
    FormBinder.bindInput = function (elementId, targetObjectOrCallback, methodName, event = 'input') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // 支持直接传递回调函数
        if (typeof targetObjectOrCallback === 'function') {
            element.addEventListener(typeof methodName === 'string' ? methodName : 'input', (e) => {
                targetObjectOrCallback(e.target.value);
            });
            return;
        }

        // 支持对象方法
        if (targetObjectOrCallback && typeof targetObjectOrCallback[methodName] === 'function') {
            element.addEventListener(event, (e) => {
                targetObjectOrCallback[methodName](e.target.value);
            });
        }
    };

    /**
     * 绑定选择框到对象方法或回调函数
     * @param {string} elementId - DOM元素ID
     * @param {Object|Function} targetObjectOrCallback - 目标对象或回调函数
     * @param {string} methodName - 方法名（当第二参数为对象时）
     */
    FormBinder.bindSelect = function (elementId, targetObjectOrCallback, methodName) {
        if (typeof targetObjectOrCallback === 'function') {
            this.bindInput(elementId, targetObjectOrCallback, 'change');
        } else {
            this.bindInput(elementId, targetObjectOrCallback, methodName, 'change');
        }
    };

    /**
     * 绑定复选框到对象方法
     * @param {string} elementId - DOM元素ID
     * @param {Function} callback - 回调函数，接收checked状态
     */
    FormBinder.bindCheckbox = function (elementId, callback) {
        const element = document.getElementById(elementId);
        if (element && typeof callback === 'function') {
            element.addEventListener('change', (e) => {
                callback(e.target.checked);
            });
        }
    };

    /**
     * 绑定数字输入框到对象方法或回调函数
     * @param {string} elementId - DOM元素ID
     * @param {Object|Function} targetObjectOrCallback - 目标对象或回调函数
     * @param {string} methodName - 方法名（当第二参数为对象时）
     */
    FormBinder.bindNumberInput = function (elementId, targetObjectOrCallback, methodName) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (isNaN(value)) return;

            // 支持直接传递回调函数
            if (typeof targetObjectOrCallback === 'function') {
                targetObjectOrCallback(value);
                return;
            }

            // 支持对象方法
            if (targetObjectOrCallback && typeof targetObjectOrCallback[methodName] === 'function') {
                targetObjectOrCallback[methodName](value);
            }
        });
    };

    /**
     * 绑定范围滑块到显示元素和回调
     * @param {string} rangeId - 滑块元素ID
     * @param {string} displayId - 显示元素ID
     * @param {Function} formatter - 格式化函数
     * @param {Function} callback - 值变化回调
     */
    FormBinder.bindRange = function (rangeId, displayId, formatter, callback) {
        const rangeInput = document.getElementById(rangeId);
        const displayElement = document.getElementById(displayId);

        if (rangeInput && displayElement) {
            rangeInput.addEventListener('input', (e) => {
                const value = e.target.value;
                displayElement.textContent = formatter ? formatter(value) : value;
                if (callback) callback(value);
            });
        }
    };

    /**
     * 绑定按钮点击事件
     * @param {string} buttonId - 按钮元素ID
     * @param {Function} callback - 点击回调
     */
    FormBinder.bindButton = function (buttonId, callback) {
        const button = document.getElementById(buttonId);
        if (button && typeof callback === 'function') {
            button.addEventListener('click', callback);
        }
    };

    /**
     * 批量绑定输入框到对象方法
     * @param {Object} bindings - 绑定配置对象 { elementId: { object, method, event? } }
     */
    FormBinder.bindInputs = function (bindings) {
        Object.entries(bindings).forEach(([elementId, config]) => {
            this.bindInput(
                elementId,
                config.object,
                config.method,
                config.event || 'input'
            );
        });
    };

    /**
     * 获取元素的值（带默认值）
     * @param {string} elementId - 元素ID
     * @param {*} defaultValue - 默认值
     * @returns {*} 元素值或默认值
     */
    FormBinder.getValue = function (elementId, defaultValue) {
        const element = document.getElementById(elementId);
        return element ? element.value : defaultValue;
    };

    /**
     * 获取复选框的选中状态（带默认值）
     * @param {string} elementId - 元素ID
     * @param {boolean} defaultValue - 默认值
     * @returns {boolean} 选中状态或默认值
     */
    FormBinder.getChecked = function (elementId, defaultValue) {
        const element = document.getElementById(elementId);
        return element ? element.checked : defaultValue;
    };

    /**
     * 设置元素的值
     * @param {string} elementId - 元素ID
     * @param {*} value - 值
     */
    FormBinder.setValue = function (elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    };

    /**
     * 设置复选框的选中状态
     * @param {string} elementId - 元素ID
     * @param {boolean} checked - 选中状态
     */
    FormBinder.setChecked = function (elementId, checked) {
        const element = document.getElementById(elementId);
        if (element) {
            element.checked = checked;
        }
    };

    // 暴露到全局
    window.FormBinder = FormBinder;

})(window);

