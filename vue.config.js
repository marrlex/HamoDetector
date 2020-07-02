module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "publicPath": './',
  
  pwa: {
    name: 'HamoDetector',
    themeColor: '#96fac8',
    msTileColor: '#96fac8',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    manifestOptions: {
      'background_color': '#96fac8'
    }
  }
}