
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 확장 프로그램 환경에서의 CSP 위반을 방지하기 위해 인라인이 아닌 모듈 내부에서 process 설정
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { API_KEY: (process.env as any).API_KEY || "" } };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
