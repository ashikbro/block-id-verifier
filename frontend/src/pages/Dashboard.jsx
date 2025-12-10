import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import IdentityForm from '../components/IdentityForm';
import IdentityViewer from '../components/IdentityViewer';
import './Dashboard.css';

const Dashboard = () => {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <div className="dashboard">
        <div className="connect-prompt">
          <div className="prompt-card">
            <h2>🔐 Welcome to Block ID Verifier</h2>
            <p>Connect your MetaMask wallet to get started with decentralized identity management.</p>
            <div className="features">
              <div className="feature">
                <span className="icon">🛡️</span>
                <h3>Secure</h3>
                <p>Your data is encrypted and stored on IPFS</p>
              </div>
              <div className="feature">
                <span className="icon">🔗</span>
                <h3>Decentralized</h3>
                <p>Full control of your identity on blockchain</p>
              </div>
              <div className="feature">
                <span className="icon">🔒</span>
                <h3>Private</h3>
                <p>End-to-end encryption for your credentials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Identity Dashboard</h1>
        <p>Manage your decentralized identity and credentials</p>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <IdentityForm />
        </div>
        
        <div className="section">
          <IdentityViewer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
