import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TreePage from './pages/TreePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tree" element={<ProtectedRoute element={<TreePage />} />} />
    </Routes>
  );
}

export default App;
