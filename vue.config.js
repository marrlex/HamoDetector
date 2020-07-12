module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "publicPath": './',
  
  pwa: {
    name: 'Anmy',
    themeColor: '#96fac8',
    msTileColor: '#96fac8',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    manifestOptions: {
      'background_color': '#96fac8'
    },
    iconPaths: {
      appleTouchIcon: 'img/icons/apple-touch-icon.png',
    }
  }
}