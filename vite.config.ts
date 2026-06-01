import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './', // 必须使用相对路径，否则桌面端无法加载资源
    plugins: [
      react(),
      tailwindcss(),
      electron([
        {
          // 桌面端主进程入口
          entry: 'electron/main.ts',
        },
      ]),
      renderer(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Zenless Lab Analyzer',
          short_name: 'ZenlessLab',
          description: 'Professional damage calculator for Zenless Zone Zero.',
          theme_color: '#f37f0f',
          background_color: '#09090b',
          display: 'standalone',
          icons: [
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
