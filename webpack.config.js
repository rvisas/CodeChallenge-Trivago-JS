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
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            require('babel-plugin-transform-object-rest-spread'),
                        ],
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
                        loader: require.resolve('css-loader'),
                        options: {
                            modules: true,
                            sourceMap: false,
                            localIdentName: '[hash:base64:5]', // '[local]'
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                require('autoprefixer')({
                                    remove: false,
                                    add: true,
                                    flexbox: 'no-2009',
                                }),
                                require('cssnano')({
                                    zindex: false,
                                    discardUnused: {
                                        fontFace: false,
                                    },
                                    reduceIdents: {
                                        keyframes: false,
                                    },
                                }),
                            ],
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
        ],
    },
    devServer: {
        contentBase: resolve('public'),
        port: 3456,
        watchOptions: {
            ignored: /node_modules/,
        },
        overlay: false,
    },
};
