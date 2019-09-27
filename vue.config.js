const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']

const isProd = process.env.NODE_ENV === 'production'

const path = require('path')
function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    publicPath: process.env.VUE_APP_ENV_CONFIG === 'dev' ? '/' : process.env.publicPath,

    // outputDir: 在npm run build时 生成文件的目录 type:string, default:'dist'
    outputDir: process.env.outputDir,

    assetsDir: 'static',

    //   lintOnSave：{ type:Boolean default:true } 问你是否使用eslint
    lintOnSave: false,

    // productionSourceMap：{ type:Bollean,default:true } 生产源映射
    // 如果您不需要生产时的源映射，那么将此设置为false可以加速生产构建
    productionSourceMap: false,

    configureWebpack: config => {
        config.devtool = 'source-map'
        if (isProd) {
            // cdn引用时配置externals
            config.externals = {
                vue: 'Vue',
                vuex: 'Vuex',
                'vue-router': 'VueRouter',
                axios: 'axios',
                'element-ui': 'ELEMENT'
            }
            // 打包生产.gz包
            config.plugins.push(
                new CompressionWebpackPlugin({
                    algorithm: 'gzip',
                    test: new RegExp(
                        '\\.(' + productionGzipExtensions.join('|') + ')$'
                    ),
                    threshold: 10240,
                    minRatio: 0.8
                })
            )
        }
    },

    chainWebpack(config) {
        // config.plugins.delete('preload') // TODO: need test
        // config.plugins.delete('prefetch') // TODO: need test

        // main是入口js文件
        config.entry('main').add('babel-polyfill')

        // set svg-sprite-loader
        config.module
            .rule('svg')
            .exclude.add(resolve('src/icons'))
            .end()

        config.module
            .rule('icons')
            .test(/\.svg$/)
            .include.add(resolve('src/icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
            .end()

        // 为了补删除换行而加的配置
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions.preserveWhitespace = true
                return options
            })
            .end()

        // 关闭包大小告警提示
        config.performance.set('hints', false)

        // config
        //     .when(process.env.NODE_ENV === 'development',
        //         config => config.devtool('cheap-source-map')
        //     )

        // config
        //     .when(process.env.NODE_ENV !== 'development',
        //         config => {
        //             config
        //                 .plugin('ScriptExtHtmlWebpackPlugin')
        //                 .after('html')
        //                 .use('script-ext-html-webpack-plugin', [{
        //                     // `runtime` must same as runtimeChunk name. default is `runtime`
        //                     inline: /runtime\..*\.js$/
        //                 }])
        //                 .end()

        // config
        //     .optimization.splitChunks({
        //         chunks: 'all',
        //         cacheGroups: {
        //             libs: {
        //                 name: 'chunk-libs',
        //                 test: /[\\/]node_modules[\\/]/,
        //                 priority: 10,
        //                 chunks: 'initial' // only package third parties that are initially dependent
        //             },
        //             elementUI: {
        //                 name: 'chunk-elementUI', // split elementUI into a single package
        //                 priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
        //                 test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
        //             },
        //             commons: {
        //                 name: 'chunk-commons',
        //                 test: resolve('src/components'), // can customize your rules
        //                 minChunks: 3, //  minimum common number
        //                 priority: 5,
        //                 reuseExistingChunk: true
        //             }
        //         }
        //     })
        // config.optimization.runtimeChunk('single')

        if (process.env.use_analyzer) {
            config
                .plugin('webpack-bundle-analyzer')
                .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
        }
    },

    devServer: {
        port: 8826, // 端口号
        host: '0.0.0.0',
        https: false, // https:{type:Boolean}
        // open: false, //配置自动启动浏览器
        proxy: {
            '/api/': {
                target: 'http://39.98.82.88:8085',
                // target: 'http://192.168.10.253:10999',
                // target: 'http://192.168.10.64:10999',
                // target: 'http://47.100.175.25/his-api/',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/ws/': {
                target: 'ws://39.98.82.88:8085',
                changeOrigin: true,
                pathRewrite: {
                    '^/ws': ''
                }
            }
        }
    }
}
