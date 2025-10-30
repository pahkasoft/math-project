module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'src/**/*.test.ts'
        ],
        preprocessors: {
            'src/**/*.test.ts': ['webpack']
        },
        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: 'ts-loader',
                        exclude: /node_modules/
                    }
                ]
            },
            resolve: {
                extensions: ['.ts', '.js']
            }
        },
        reporters: ['progress'],
        browsers: ['ChromeHeadless'],
        singleRun: true
    });
};

