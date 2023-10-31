import presetWind from '@unocss/preset-wind';
import { defineConfig } from '@unocss/vite';

export default defineConfig({
  presets: [presetWind()],
  rules: [
    [
      'ireptu-logo',
      {
        background: 'url("https://redmine.ireptu.film/themes/circle/images/logo.png") no-repeat 20px 13px',
        'background-color': 'initial',
        'font-family': '"helvetica neue",helvetica,arial,sans-serif',
        'text-transform': 'uppercase',
        'font-weight': '700',
        'font-size': '13px',
        'letter-spacing': '1px',
        padding: '25px 10px 25px 70px',
        margin: '0px',
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
      }
    ]
  ]
});
