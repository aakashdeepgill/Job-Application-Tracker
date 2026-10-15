import React from 'react';
import { createRoot } from 'react-dom/client';
import JobTracker from './JobTracker.jsx';
import './job-tracker.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <JobTracker />
  </React.StrictMode>
);