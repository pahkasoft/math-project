
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {

    let config = {
        mode: argv.mode,
        entry: path.resolve(__dirname, "src/index.ts"),
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "math-lib.umd.js",
            library: "MathLib",
            libraryTarget: "umd",
            globalObject: "this",
            clean: true
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"],
            modules: [
                path.resolve(__dirname, "./src"),
                "node_modules"
            ],
            fallback: { "crypto": false }
        },
        module: {
            rules: [
                {
                    test: /\.(js)x?$/i,
                    use: ["babel-loader"],
                },
                {
                    test: /\.(ts)x?$/i,
                    use: ["babel-loader", "ts-loader"],
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.(png|jpg|gif|mp3)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: Infinity,
                            },
                        },
                    ],
                }
            ]
        }
    }

    if (argv.mode == 'production') {
        config.optimization = {
            minimize: true,
            minimizer: [new TerserPlugin()],
        }
    }
    else {
        config.optimization = {
            minimize: false,
            minimizer: []
        }
        config.devtool = 'source-map';
    }

    return config;
}