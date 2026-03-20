import fs from 'node:fs';
import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { ConfigEnv, UserConfig } from 'vite';
import { loadEnv } from 'vite';
import svgLoader from 'vite-svg-loader';

const CWD = process.cwd();

function resolveHttpsConfig(enabled: boolean, keyPath?: string, certPath?: string) {
  if (!enabled) return undefined;

  if (!keyPath || !certPath) {
    throw new Error('VITE_DEV_HTTPS=true 时必须同时提供 VITE_DEV_SSL_KEY 和 VITE_DEV_SSL_CERT');
  }

  const resolvedKeyPath = path.resolve(CWD, keyPath);
  const resolvedCertPath = path.resolve(CWD, certPath);

  if (!fs.existsSync(resolvedKeyPath) || !fs.existsSync(resolvedCertPath)) {
    throw new Error(
      [
        '本地 HTTPS 证书文件不存在。',
        `VITE_DEV_SSL_KEY: ${resolvedKeyPath}`,
        `VITE_DEV_SSL_CERT: ${resolvedCertPath}`,
        '如果你走 Caddy/Nginx 反代 443，请删除 VITE_DEV_HTTPS、VITE_DEV_SSL_KEY、VITE_DEV_SSL_CERT。',
        '如果你要让 Vite 直接提供 HTTPS，请先生成证书，或把环境变量改成正确的证书路径。',
      ].join('\n'),
    );
  }

  return {
    key: fs.readFileSync(resolvedKeyPath),
    cert: fs.readFileSync(resolvedCertPath),
  };
}

// https://vitejs.dev/config/
export default ({ mode, command }: ConfigEnv): UserConfig => {
  const {
    VITE_BASE_URL,
    VITE_API_URL_PREFIX,
    VITE_API_URL,
    VITE_DEV_ALLOWED_HOST,
    VITE_DEV_HMR_CLIENT_PORT,
    VITE_DEV_HMR_HOST,
    VITE_DEV_HMR_PROTOCOL,
    VITE_DEV_HOST,
    VITE_DEV_HTTPS,
    VITE_DEV_PORT,
    VITE_DEV_SSL_CERT,
    VITE_DEV_SSL_KEY,
  } = loadEnv(mode, CWD);
  const appSide = (process.env.VITE_APP_SIDE || 'enterprise').toLowerCase();
  const isAdmin = appSide === 'admin';
  const port = Number(VITE_DEV_PORT) || (isAdmin ? 3001 : 3002);
  const httpsEnabled = VITE_DEV_HTTPS === 'true';
  const https = resolveHttpsConfig(httpsEnabled, VITE_DEV_SSL_KEY, VITE_DEV_SSL_CERT);
  const allowedHosts = [VITE_DEV_ALLOWED_HOST, VITE_DEV_HMR_HOST].filter(Boolean);
  const hmrClientPort = Number(VITE_DEV_HMR_CLIENT_PORT);
  const hmrHost = VITE_DEV_HMR_HOST || VITE_DEV_ALLOWED_HOST;

  const proxy: NonNullable<UserConfig['server']>['proxy'] = {};
  if (VITE_API_URL_PREFIX && VITE_API_URL) {
    proxy[VITE_API_URL_PREFIX] = {
      target: VITE_API_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(new RegExp(`^${VITE_API_URL_PREFIX}`), ''),
    };
  }
  proxy['/__download_proxy__'] = {
    target: 'https://cdn.lingjieyun.com',
    changeOrigin: true,
    rewrite: (requestPath: string) => requestPath.replace(/^\/__download_proxy__/, ''),
  };

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
      port,
      strictPort: true,
      host: VITE_DEV_HOST || '0.0.0.0',
      https,
      allowedHosts: allowedHosts.length ? allowedHosts : undefined,
      hmr: hmrHost
        ? {
            host: hmrHost,
            protocol: VITE_DEV_HMR_PROTOCOL || (httpsEnabled ? 'wss' : 'ws'),
            ...(Number.isFinite(hmrClientPort) && hmrClientPort > 0 ? { clientPort: hmrClientPort } : {}),
          }
        : undefined,
      proxy: Object.keys(proxy).length ? proxy : undefined,
    },
    build:
      command === 'build'
        ? {
            outDir: isAdmin ? 'dist/admin' : 'dist/enterprise',
            rollupOptions: {
              input: isAdmin ? path.resolve(__dirname, 'admin.html') : path.resolve(__dirname, 'enterprise.html'),
              output: {
                manualChunks(id) {
                  if (!id.includes('node_modules')) return;

                  if (
                    id.includes('/vue/') ||
                    id.includes('/pinia/') ||
                    id.includes('/vue-router/') ||
                    id.includes('/vue-i18n/')
                  ) {
                    return 'vendor-vue';
                  }

                  if (
                    id.includes('/tdesign-vue-next/') ||
                    id.includes('/tdesign-icons-vue-next/') ||
                    id.includes('/@form-create/tdesign/')
                  ) {
                    return 'vendor-tdesign';
                  }

                  if (id.includes('/echarts/')) {
                    return 'vendor-echarts';
                  }

                  if (id.includes('/@wangeditor/')) {
                    return 'vendor-editor';
                  }

                  if (id.includes('/lodash/')) {
                    return 'vendor-lodash';
                  }

                  return 'vendor-misc';
                },
              },
            },
          }
        : undefined,
  };
};
