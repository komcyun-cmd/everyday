
import React from 'https://esm.sh/react@19.0.0';
import ReactDOM from 'https://esm.sh/react-dom@19.0.0/client';
import App from './App';

// 확장 프로그램 환경에서 process 객체 모킹
const win = window as any;
if (typeof win.process === 'undefined') {
  win.process = { env: { API_KEY: "" } };
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
