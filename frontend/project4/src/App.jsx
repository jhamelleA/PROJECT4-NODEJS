import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthForm from './AuthForm'; // No 'components/' here
import Dashboard from './Dashboard'; // No 'components/' here

function App() {
  return (
    <Router>
      <Routes>
        {/* This path="/" ensures AuthForm shows up at http://localhost:5173 */}
        <Route path="/" element={<AuthForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;