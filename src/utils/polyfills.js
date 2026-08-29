// Safe environment guards for React Native
if (typeof global !== 'undefined') {
  if (typeof global.window !== 'undefined') {
    if (!global.window.location) {
      global.window.location = {
        protocol: 'http:',
        host: 'localhost:8081',
        hostname: 'localhost',
        href: 'http://localhost:8081/',
        pathname: '/',
        search: '',
        origin: 'http://localhost:8081',
      };
    }
    if (!global.window.document) {
      global.window.document = { currentScript: null };
    }
  }
}
