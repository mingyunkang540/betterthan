import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

const iconUrl = process.env.AIT_ICON_URL ?? '';

export default defineConfig({
  scheme: 'intoss',
  appName: 'betterthan',
  plugins: [
    appsInToss({
      brand: {
        displayName: '어제보다',
        primaryColor: '#3182F6',
        icon: iconUrl,
      },
      permissions: [],
    }),
  ],
});
