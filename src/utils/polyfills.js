// Polyfill global environment objects for React Native / Expo Fast Refresh / HMR
if (typeof global !== 'undefined') {
  const defaultLocation = {
    protocol: 'http:',
    host: 'localhost:8081',
    hostname: 'localhost',
    href: 'http://localhost:8081/',
    pathname: '/',
    search: '',
    origin: 'http://localhost:8081',
  };

  if (!global.location) {
    global.location = defaultLocation;
  }
  if (!global.document) {
    global.document = { currentScript: null };
  }
  if (!global.window) {
    global.window = global;
  }
  if (!global.window.location) {
    global.window.location = defaultLocation;
  }
  if (!global.window.document) {
    global.window.document = global.document;
  }
}
