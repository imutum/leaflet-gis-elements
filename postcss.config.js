module.exports = {
    plugins: [
        require('postcss-prefix-selector')({
            prefix: '.leaflet-gis-elements',
            transform: function (prefix, selector, prefixedSelector) {
                // 保持 :root 变量不变
                if (selector === ':root') {
                    return ':root';
                }
                // 保持 html/body 不变
                if (selector === 'html' || selector === 'body') {
                    return selector;
                }
                // 跳过伪元素和关键帧
                if (selector.match(/^@/) || selector.match(/^::/)) {
                    return selector;
                }
                return prefixedSelector;
            },
            exclude: []
        })
    ]
};


