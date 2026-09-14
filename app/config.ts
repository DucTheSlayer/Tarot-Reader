import type { Config } from '@alf/app-sdk'

const adsQaMode = import.meta.env.DEV || import.meta.env.VITE_ADS_QA === 'true'

export const config: Config = {
  settings: {
    dev: adsQaMode,
    isGame: false,
    isApp: true,
    appName: 'Serein Tarot',
    appVersion: '1.0',
    environment: adsQaMode ? 'dev' : 'production',
    hasChooseLanguageScreen: false,
    hasOnboardingScreen: false,
    hasSettingsScreen: true,
    hasGameplayScreen: false,
    defaultLocale: 'vi',
  },
  keys: {
    applovin: {
      android: {
        sdkKey:
          'eQt0q3679KmUyKeNcSzqC01eB-lILmfTnJoufGxpSn__n1NVhHLeMgxZOaICke451El4ZBfuZum9Qw4WxzpW52',
        banner: '1ef5fff83b24e5bc',
        mrec: 'aadcf48420ee7bdf',
        interstitial: '3ae34d183afd1856',
        rewarded: '5a3f29bcf5a022d7',
        appOpen: 'b6b9f89100411bec',
      },
      ios: {
        sdkKey:
          'eQt0q3679KmUyKeNcSzqC01eB-lILmfTnJoufGxpSn__n1NVhHLeMgxZOaICke451El4ZBfuZum9Qw4WxzpW52',
        banner: 'YOUR_BANNER_AD_UNIT_IOS',
        mrec: 'YOUR_MREC_AD_UNIT_IOS',
        interstitial: 'YOUR_INTERSTITIAL_AD_UNIT_IOS',
        rewarded: 'YOUR_REWARDED_AD_UNIT_IOS',
        appOpen: 'YOUR_APP_OPEN_AD_UNIT_IOS',
      },
    },
    admob: {
      android: {
        appId: 'ca-app-pub-8467610367562059~6827880762',
        banner: 'ca-app-pub-8467610367562059/9097006795',
        interstitial: 'ca-app-pub-8467610367562059/1026945086',
        rewarded: 'ca-app-pub-8467610367562059/3653108421',
        openApp: 'ca-app-pub-8467610367562059/9643801704',
        native: 'ca-app-pub-8467610367562059/2886821660',
      },
      ios: {
        appId: 'ca-app-pub-8467610367562059~6827880762',
        banner: 'ca-app-pub-8467610367562059/9097006795',
        interstitial: 'ca-app-pub-8467610367562059/1026945086',
        rewarded: 'ca-app-pub-8467610367562059/3653108421',
        openApp: 'ca-app-pub-8467610367562059/9643801704',
        native: 'ca-app-pub-8467610367562059/2886821660',
      },
    },
    firebase: {
      apiKey: 'AIzaSyCxP5NJRYD1zzg4XvLPX4QJFyo9TVSZoX0',
      projectId: 'eye-reading-5d10e',
      appId: '1:710097540013:android:2c87b06e9103e58028c724',
      messagingSenderId: '710097540013',
    },
  },
}
