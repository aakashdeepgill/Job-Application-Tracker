import React from 'react';
import { createRoot } from 'react-dom/client';
import JobTracker from './JobTracker.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import './job-tracker.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <JobTracker />
    </ErrorBoundary>
  </React.StrictMode>
);