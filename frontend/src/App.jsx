import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Credentials from './pages/Credentials';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="app">
          <Navbar />
          
          <nav className="tab-nav">
            <Link to="/" className="tab-link">Identity</Link>
            <Link to="/credentials" className="tab-link">Credentials</Link>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/credentials" element={<Credentials />} />
            </Routes>
          </main>

          <footer className="footer">
            <p>&copy; 2024 Block ID Verifier. Decentralized Identity Platform.</p>
          </footer>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
