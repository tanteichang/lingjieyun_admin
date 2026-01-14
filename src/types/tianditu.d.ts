import 'tianditu-v4-types';

declare global {
  interface Window {
    T: typeof import('tianditu-v4-types').T;
  }
}
