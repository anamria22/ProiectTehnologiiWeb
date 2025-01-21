import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LoginSignup from './loginSignup/loginSignup';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/app/:username" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
  
);
