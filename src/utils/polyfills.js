// Polyfill global environment objects ONLY in DEV mode for Fast Refresh / HMR stability
if (typeof __DEV__ !== 'undefined' && __DEV__) {
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
}
