import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TreePage from './pages/TreePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tree" element={<TreePage />} />
    </Routes>
  );
}

export default App;
