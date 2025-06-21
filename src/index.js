import { CHARACTER_CONFIG } from './lib/characterConfig';
console.log('Config loaded:', CHARACTER_CONFIG); // Проверка загрузки

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
