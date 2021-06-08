import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'bloom.app.com',
  appName: 'Bloom',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    CapacitorFirebaseAuth: {
      providers: ['phone'],
      languageCode: 'en',
      nativeAuth: false
    }
  }
}

export default config
