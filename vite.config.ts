import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const port = Number(env.PORT);

  return {
    server: { port, strictPort: true, origin: `http://localhost:${port}` },
    preview: { port, strictPort: true },
    build: { target: 'esnext' },
    plugins: [
      react(),
      federation({
        name: 'wp_dashboard',
        filename: 'remoteEntry.js',
        exposes: {
          './routes': './src/routing/routeConfig.tsx',
        },
        remotes: {
          wp_shared: { type: 'module', name: 'wp_shared', entry: env.VITE_WP_SHARED_URL },
        },
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
          '@tanstack/react-query': { singleton: true },
          '@tanstack/react-router': { singleton: true },
        },
      }),
    ],
  };
});
