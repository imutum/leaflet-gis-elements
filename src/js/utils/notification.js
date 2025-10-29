/**
 * 通知工具模块
 * 用于显示提示消息
 */

// 初始化 L.GISElements 命名空间
L.GISElements = L.GISElements || {};

L.GISElements.Notification = {
    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    success(message, duration = 2000) {
        this._show(message, 'success', duration);
    },

    /**
     * 显示错误消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    error(message, duration = 3000) {
        this._show(message, 'error', duration);
    },

    /**
     * 显示警告消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    warning(message, duration = 2500) {
        this._show(message, 'warning', duration);
    },

    /**
     * 显示普通消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    info(message, duration = 2000) {
        this._show(message, 'info', duration);
    },

    /**
     * 内部方法：显示通知
     * @private
     */
    _show(message, type, duration) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `lge-notification lge-notification-${type}`;
        notification.textContent = message;

        // 样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: L.GISElements.Constants?.Z_INDEX?.NOTIFICATION || '10000',
            fontSize: '14px',
            color: '#fff',
            backgroundColor: this._getColor(type),
            transition: 'opacity 0.3s, transform 0.3s',
            transform: 'translateX(0)',
            opacity: '1'
        });

        // 添加到页面
        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    /**
     * 获取通知类型对应的颜色
     * @private
     */
    _getColor(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }
};

