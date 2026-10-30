import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { enableMocking } from './mocks/browser';

async function bootstrap() {
  await enableMocking();

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Elemento root não encontrado no documento.');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap().catch((err) => {
  console.error('Falha ao inicializar aplicação com MSW:', err);
});
