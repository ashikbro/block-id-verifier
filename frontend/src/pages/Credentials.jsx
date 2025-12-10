import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import CredentialForm from '../components/CredentialForm';
import CredentialList from '../components/CredentialList';
import './Credentials.css';

const Credentials = () => {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <div className="credentials-page">
        <div className="connect-prompt">
          <h2>Connect Wallet</h2>
          <p>Please connect your wallet to manage credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="credentials-page">
      <div className="page-header">
        <h1>Credential Management</h1>
        <p>Issue and manage verifiable credentials</p>
      </div>

      <div className="page-content">
        <div className="section">
          <CredentialForm />
        </div>
        
        <div className="section">
          <CredentialList />
        </div>
      </div>
    </div>
  );
};

export default Credentials;
