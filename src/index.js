import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';
import { CHARACTER_CONFIG } from './lib/characterConfig';

console.log('CHARACTER_CONFIG loaded:', !!CHARACTER_CONFIG); // Должно быть true
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
