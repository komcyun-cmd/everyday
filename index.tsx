
import React from 'react';
import ReactDOM from 'react-dom/client';
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
