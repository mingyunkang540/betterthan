import { AppsInToss } from '@apps-in-toss/framework';
import type { InitialProps } from '@granite-js/react-native';
import type { PropsWithChildren } from 'react';
import { context } from '../require.context';
import { AppProvider } from './state/app-context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <AppProvider>{children}</AppProvider>;
}

export default AppsInToss.registerApp(AppContainer, { context });
