import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx'; // New Import
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider> {/* Wrap App with the context provider */}
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);