import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ElderlyLogin from "./pages/ElderlyLogin";

import { BrowserRouter, Routes, Route } from "react-router-dom";


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/" element={<ElderlyLogin />} />

        {/* All authenticated pages */}
        <Route path="/app/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

