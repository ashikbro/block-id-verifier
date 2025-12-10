import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/web3';
import { getFromIPFS } from '../utils/ipfs';
import { decryptData } from '../utils/encryption';
import { useWeb3 } from '../contexts/Web3Context';
import deployments from '../contracts/deployments.json';
import CredentialManagerABI from '../contracts/CredentialManager.json';
import './CredentialList.css';

const CredentialList = () => {
  const { account } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);

  useEffect(() => {
    if (account) {
      loadCredentials();
    }
  }, [account]);

  const loadCredentials = async () => {
    setLoading(true);
    setError('');

    try {
      const contract = await getContract(
        deployments.CredentialManager,
        CredentialManagerABI.abi
      );

      const credentialIds = await contract.getSubjectCredentials(account);
      
      const credentialPromises = credentialIds.map(async (id) => {
        try {
          const cred = await contract.getCredential(id);
          const isValid = await contract.verifyCredential(id);
          
          return {
            id: id,
            subject: cred[0],
            issuer: cred[1],
            type: cred[2],
            ipfsHash: cred[3],
            issuedAt: new Date(Number(cred[4]) * 1000),
            expiresAt: Number(cred[5]) > 0 ? new Date(Number(cred[5]) * 1000) : null,
            revoked: cred[6],
            isValid
          };
        } catch (err) {
          console.error('Error loading credential:', err);
          return null;
        }
      });

      const loadedCredentials = (await Promise.all(credentialPromises)).filter(c => c !== null);
      setCredentials(loadedCredentials);
    } catch (err) {
      setError('Failed to load credentials');
      console.error('Error loading credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async (credential) => {
    if (!password) {
      alert('Please enter password');
      return;
    }

    try {
      const encryptedData = await getFromIPFS(credential.ipfsHash);
      const decrypted = await decryptData(encryptedData, password);
      setDecryptedData(decrypted);
      setSelectedCredential(credential);
    } catch (err) {
      alert('Failed to decrypt. Check your password.');
      console.error('Decryption error:', err);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="credential-list">
      <h2>My Credentials</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading credentials...</div>
      ) : credentials.length === 0 ? (
        <div className="no-credentials">
          <p>No credentials found</p>
        </div>
      ) : (
        <>
          <div className="password-input">
            <input
              type="password"
              placeholder="Enter password to decrypt credentials"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="credentials-grid">
            {credentials.map((cred) => (
              <div key={cred.id} className={`credential-card ${!cred.isValid ? 'invalid' : ''}`}>
                <div className="credential-header">
                  <h3>{cred.type}</h3>
                  <span className={`status-badge ${cred.isValid ? 'valid' : 'invalid'}`}>
                    {cred.revoked ? 'Revoked' : cred.isValid ? 'Valid' : 'Expired'}
                  </span>
                </div>
                
                <div className="credential-info">
                  <div className="info-row">
                    <label>Issuer:</label>
                    <span>{formatAddress(cred.issuer)}</span>
                  </div>
                  <div className="info-row">
                    <label>Issued:</label>
                    <span>{cred.issuedAt.toLocaleDateString()}</span>
                  </div>
                  {cred.expiresAt && (
                    <div className="info-row">
                      <label>Expires:</label>
                      <span>{cred.expiresAt.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-small"
                  onClick={() => handleDecrypt(cred)}
                  disabled={!password}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {decryptedData && selectedCredential && (
        <div className="modal-overlay" onClick={() => setDecryptedData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Credential Details</h3>
            <div className="decrypted-data">
              <p><strong>Type:</strong> {decryptedData.type}</p>
              <p><strong>Data:</strong> {decryptedData.data}</p>
              <p><strong>Issued At:</strong> {new Date(decryptedData.issuedAt).toLocaleString()}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setDecryptedData(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialList;
