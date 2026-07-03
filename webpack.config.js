const webpack = require('webpack');
const path = require('path');

const resolve = path.resolve.bind(path, path.resolve(__dirname, './'));

module.exports = {
    devtool: 'eval-source-map',
    entry: {
        main: resolve('src/index.js'),
    },
    output: {
        path: resolve('public'),
        filename: '[name].js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        // babel.config.json will be used
                    },
                },
            },
            {
                test: /\.twig$/,
                use: [
                    'babel-loader',
                    {
                        loader: 'melody-loader',
                        options: {
                            plugins: ['idom'],
                        },
                    },
                ],
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[hash:base64:5]',
                            },
                            sourceMap: false,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'autoprefixer',
                                    ['cssnano', {
                                        zindex: false,
                                        discardUnused: {
                                            fontFace: false,
                                        },
                                        reduceIdents: {
                                            keyframes: false,
                                        },
                                    }],
                                ],
                            },
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require('sass'),
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        static: {
            directory: resolve('public'),
        },
        port: 3456,
        watchFiles: ['src/**/*', 'public/**/*'],
        hot: true,
        open: true,
    },
    resolve: {
        extensions: ['.js', '.json'],
        modules: ['node_modules', 'src'],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};