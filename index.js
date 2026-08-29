// Safeguard global.window and global.location for Fast Refresh / HMR on native platforms
if (typeof global !== 'undefined') {
  const defaultLocation = {
    protocol: 'http:',
    host: 'localhost:8081',
    hostname: 'localhost',
    href: 'http://localhost:8081',
    pathname: '/',
    search: '',
    origin: 'http://localhost:8081',
  };

  if (!global.location) {
    global.location = defaultLocation;
  }
  if (global.window && !global.window.location) {
    global.window.location = defaultLocation;
  }
}

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
