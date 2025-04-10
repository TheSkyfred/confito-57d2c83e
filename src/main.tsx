
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from "next-themes";
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
    <ThemeProvider attribute="class" defaultTheme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
