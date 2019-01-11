const path = require('path');
const NODE_ENV = process.env.NODE_ENV;

module.exports = {
    entry: path.resolve(__dirname, 'examples/src/index.tsx'),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'examples/dist'),
    },
    mode: NODE_ENV,
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: '/\.(js|jsx)$/',
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
                exclude: [/node_modules/, /__tests__/],
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: [/node_modules/, /__tests__/],
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'less-loader', options: {
                            strictMath: true,
                            noIeCompat: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {},
                    },
                ],
            },
        ],
    },
};
