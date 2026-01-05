import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateRCA from './pages/CreateRCA';
import RCADetails from './pages/RCADetails';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateRCA />} />
            <Route path="/rca/:id" element={<RCADetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
