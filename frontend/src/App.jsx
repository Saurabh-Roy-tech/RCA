import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateRCA from './pages/CreateRCA';
import RCADetails from './pages/RCADetails';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
        <Toaster position="top-right" />
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateRCA />} />
            <Route path="/rca/:id" element={<RCADetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
