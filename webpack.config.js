const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: argv.mode || 'production',
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? 'leaflet-gis-elements.min.js' : 'leaflet-gis-elements.js',
            library: {
                name: 'LeafletGISElements',
                type: 'umd',
                export: 'default',
                umdNamedDefine: true
            },
            globalObject: 'typeof self !== \'undefined\' ? self : this',
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        require('postcss-prefix-selector')({
                                            prefix: '.leaflet-gis-elements',
                                            transform: function (prefix, selector, prefixedSelector) {
                                                // 不给 :root 和 html/body 添加前缀
                                                if (selector === ':root' || selector === 'html' || selector === 'body') {
                                                    return selector;
                                                }
                                                // 不给 @keyframes 添加前缀
                                                if (selector.match(/^@/)) {
                                                    return selector;
                                                }
                                                return prefixedSelector;
                                            }
                                        })
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: isProduction ? 'leaflet-gis-elements.min.css' : 'leaflet-gis-elements.css'
            })
        ],
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        format: {
                            comments: false,
                            preamble: '/*! LeafletGISElements v1.0.0 | MIT License | https://github.com/yourusername/leaflet-gis-elements */'
                        }
                    },
                    extractComments: false
                })
            ]
        },
        externals: {
            leaflet: {
                commonjs: 'leaflet',
                commonjs2: 'leaflet',
                amd: 'leaflet',
                root: 'L'
            }
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        performance: {
            hints: isProduction ? 'warning' : false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000
        }
    };
};

