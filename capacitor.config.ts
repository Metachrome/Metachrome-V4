import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.metachrome.app',
  appName: 'METACHROME',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'https://metachrome.io',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;

