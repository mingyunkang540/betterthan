import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

const CONSOLE_BRAND_ICON_URL =
  'https://static.toss.im/appsintoss/60223/fbecb575-1537-4486-968e-e81aae24cc02.png';

export default defineConfig({
  scheme: 'intoss',
  appName: 'betterthan',
  plugins: [
    appsInToss({
      brand: {
        displayName: '어제보다',
        primaryColor: '#3182F6',
        icon: CONSOLE_BRAND_ICON_URL,
      },
      permissions: [],
    }),
  ],
});
