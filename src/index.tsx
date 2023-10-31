import './index.scss';

import { render } from 'solid-js/web';
import 'uno.css';

import App from './app';

if (import.meta.env.DEV && !(document.body instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
  );
}

render(() => <App />, document.body);
