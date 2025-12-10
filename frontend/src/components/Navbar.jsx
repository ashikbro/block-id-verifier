import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import './Navbar.css';

const Navbar = () => {
  const { account, isConnected, isConnecting, connect, disconnect } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>🔐 Block ID Verifier</h1>
          <p>Decentralized Identity Platform</p>
        </div>
        
        <div className="navbar-actions">
          {isConnected ? (
            <div className="wallet-info">
              <span className="account-badge">{formatAddress(account)}</span>
              <button onClick={disconnect} className="btn btn-secondary">
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connect} 
              className="btn btn-primary"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
