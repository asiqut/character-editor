import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './providers/ThemeProvider';
import { BrowserRouter } from 'react-router-dom';
import { PSDLoaderProvider } from './providers/PSDLoaderProvider';
import './styles/main.css';

// Инициализация Sentry для мониторинга ошибок (опционально)
if (process.env.NODE_ENV === 'production') {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN',
      integrations: [new Sentry.BrowserTracing()],
      tracesSampleRate: 1.0,
    });
  });
}

// Создание корневого элемента
const root = ReactDOM.createRoot(document.getElementById('root'));

// Рендер приложения с провайдерами
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <ThemeProvider>
          <PSDLoaderProvider>
            <App />
          </PSDLoaderProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Регистрация Service Worker (для PWA)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful');
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}
