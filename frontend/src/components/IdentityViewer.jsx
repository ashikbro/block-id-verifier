import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/web3';
import { getFromIPFS } from '../utils/ipfs';
import { decryptData } from '../utils/encryption';
import { useWeb3 } from '../contexts/Web3Context';
import deployments from '../contracts/deployments.json';
import IdentityRegistryABI from '../contracts/IdentityRegistry.json';
import './IdentityViewer.css';

const IdentityViewer = () => {
  const { account } = useWeb3();
  const [identity, setIdentity] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loadIdentity = async () => {
    if (!password) {
      setError('Password is required to decrypt identity');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const contract = await getContract(
        deployments.IdentityRegistry,
        IdentityRegistryABI.abi
      );

      const ipfsHash = await contract.getIdentity(account);
      const encryptedData = await getFromIPFS(ipfsHash);
      const decryptedData = await decryptData(encryptedData, password);

      setIdentity(decryptedData);
    } catch (err) {
      setError('Failed to load identity. Check your password.');
      console.error('Error loading identity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadIdentity();
  };

  return (
    <div className="identity-viewer">
      <h2>View Your Identity</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {!identity ? (
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="password">Enter Password to Decrypt</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your encryption password"
              required
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show password
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Load Identity'}
          </button>
        </form>
      ) : (
        <div className="identity-details">
          <div className="detail-card">
            <label>Full Name</label>
            <p>{identity.name}</p>
          </div>
          <div className="detail-card">
            <label>Email</label>
            <p>{identity.email}</p>
          </div>
          <div className="detail-card">
            <label>Date of Birth</label>
            <p>{identity.dateOfBirth}</p>
          </div>
          <div className="detail-card">
            <label>Nationality</label>
            <p>{identity.nationality}</p>
          </div>
          <div className="detail-card">
            <label>Created At</label>
            <p>{new Date(identity.createdAt).toLocaleString()}</p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setIdentity(null);
              setPassword('');
            }}
          >
            Hide Identity
          </button>
        </div>
      )}
    </div>
  );
};

export default IdentityViewer;
