import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { ConfigEnv, UserConfig } from 'vite';
import { loadEnv } from 'vite';
import svgLoader from 'vite-svg-loader';

const CWD = process.cwd();

// https://vitejs.dev/config/
export default ({ mode, command }: ConfigEnv): UserConfig => {
  const { VITE_BASE_URL, VITE_API_URL_PREFIX, VITE_API_URL } = loadEnv(mode, CWD);
  const appSide = (process.env.VITE_APP_SIDE || 'enterprise').toLowerCase();
  const isAdmin = appSide === 'admin';

  const proxy =
    VITE_API_URL_PREFIX && VITE_API_URL
      ? {
          [VITE_API_URL_PREFIX]: {
            target: VITE_API_URL,
            changeOrigin: true,
            rewrite: (path: string) => path.replace(new RegExp(`^${VITE_API_URL_PREFIX}`), ''),
          },
        }
      : undefined;

  return {
    base: VITE_BASE_URL || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${path.resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },

    plugins: [vue(), vueJsx(), svgLoader()],

    server: {
      port: isAdmin ? 3001 : 3002,
      host: '0.0.0.0',
      proxy,
    },
    build:
      command === 'build'
        ? {
            outDir: isAdmin ? 'dist/admin' : 'dist/enterprise',
            rollupOptions: {
              input: isAdmin ? path.resolve(__dirname, 'admin.html') : path.resolve(__dirname, 'enterprise.html'),
            },
          }
        : undefined,
  };
};
