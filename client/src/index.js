import React from 'react';
import ReactDOM from 'react-dom/client';
import './shared/styles/global.css';
import 'react-toastify/dist/ReactToastify.css';
import App from './app/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
