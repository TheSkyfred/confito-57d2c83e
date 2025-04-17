
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initStorageBuckets } from './utils/initStorage';

// Initialize storage buckets
initStorageBuckets()
  .catch(error => {
    console.error('Failed to initialize storage buckets:', error);
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
