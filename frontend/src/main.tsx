import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
// import { ThemeProvider } from './context/ThemeContext'; // ✅ Comment this out for now
import './index.css';

console.log("🔥 main.tsx is running!");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <ThemeProvider> */}
      <AppRoutes />
    {/* </ThemeProvider> */}
  </React.StrictMode>,
);