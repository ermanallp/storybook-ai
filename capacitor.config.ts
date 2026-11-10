import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kidoredo.app',
  appName: 'Kidoredo',
  webDir: 'public',
  server: {
    url: 'https://kidoredo.com',
    cleartext: true
  }
};

export default config;
