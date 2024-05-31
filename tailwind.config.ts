import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';
import themes from 'daisyui/src/theming/themes';

const config: Config = {
  content: ['./pages/*.{html,js}'],
  theme: {
    extend: {}
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        business: {
          ...themes['business'],
          primary: '#169F47'
        }
      }
    ]
  }
};

export default config;
