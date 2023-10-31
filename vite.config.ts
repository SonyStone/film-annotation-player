import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

import solidSvg from 'vite-plugin-solid-svg';
// import devtools from 'solid-devtools/vite';
import suidPlugin from '@suid/vite-plugin';
import UnocssPlugin from '@unocss/vite';

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    UnocssPlugin({
      // your config or in uno.config.ts
    }),
    suidPlugin(),
    solidPlugin(),
    solidSvg()
  ],
  resolve: {
    alias: {
      '@utils': resolve(__dirname, './src/utils')
    }
  },
  server: {
    port: 3030
  },
  build: {
    target: 'esnext'
  }
});
