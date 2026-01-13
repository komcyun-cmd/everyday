
import React from 'https://esm.sh/react@19.0.0';
import ReactDOM from 'https://esm.sh/react-dom@19.0.0/client';
import App from './App';

// 배포 환경의 process.env.API_KEY를 보존하면서 모킹
const win = window as any;
if (typeof win.process === 'undefined') {
  win.process = { env: { API_KEY: "" } };
} else if (!win.process.env) {
  win.process.env = { API_KEY: "" };
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
