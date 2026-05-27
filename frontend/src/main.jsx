import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from 'react-router'
import "./index.css";
import axios from 'axios';

// Configure a global axios interceptor to automatically route all hardcoded localhost API calls 
// to the deployed Render backend URL when VITE_API_URL is set in production.
axios.interceptors.request.use((config) => {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  
  if (config.url) {
    if (config.url.startsWith("http://localhost:5001/api")) {
      config.url = config.url.replace("http://localhost:5001/api", baseURL);
    } else if (config.url.startsWith("http://localhost:5001")) {
      const serverBase = baseURL.endsWith("/api") ? baseURL.slice(0, -4) : baseURL;
      config.url = config.url.replace("http://localhost:5001", serverBase);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Configure withCredentials globally for all standard axios calls to support cross-origin sessions
axios.defaults.withCredentials = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>
)
