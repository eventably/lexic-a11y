// Library entry point.
//
// This is the entry built by Rollup into the published package (see
// `rollup.config.js`). Unlike `src/index.js` — which bootstraps the demo app
// into `#root` for local development with Vite — this module has NO side
// effects: importing the package must never touch the DOM or render anything,
// so it can be safely consumed by any host application.
import Editor from './components/Editor';
import { ToolbarPlugin } from './components/ToolbarPlugin';
import './styles/Editor.css';
import i18n from './utils/i18n';

export { Editor as default, i18n, ToolbarPlugin };
