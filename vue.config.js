module.exports = {
  // 打包时需要配置该三个选项
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV !== 'production',
  productionSourceMap: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'production' ? 'eval-cheap-source-map' : 'source-map', //'source-map',
    resolve: {
      // 重定义路径
      alias: {
        components: '@/components',
        assets: '@/assets',
        pages: '@/pages',
        api: '@/api'
      }
    }
  },
  devServer: {
    open: false,
    port: '8080',
    https: false,
    hotOnly: false,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_BASE_PATH, //环境变量控制访问地址
        // target:'https://usv.tongji.cq.cn/',   //'http://192.168.110.234:8766',  //访问的后端服务器地址    ----接口的前半段
        changeOrigin: true, //是否跨域
        pathRewrite: {
          // '^/api':''
        }
      }
    }
  }
};
