import React, { useState } from 'react';
import { encryptData } from '../utils/encryption';
import { uploadToIPFS } from '../utils/ipfs';
import { getContract } from '../utils/web3';
import deployments from '../contracts/deployments.json';
import CredentialManagerABI from '../contracts/CredentialManager.json';
import './CredentialForm.css';

const CredentialForm = ({ onCredentialIssued }) => {
  const [formData, setFormData] = useState({
    subject: '',
    credentialType: '',
    credentialData: '',
    expiresAt: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.password) {
        throw new Error('Password is required for encryption');
      }

      const credentialData = {
        type: formData.credentialType,
        data: formData.credentialData,
        issuedAt: new Date().toISOString()
      };

      const encryptedData = await encryptData(credentialData, formData.password);
      const ipfsHash = await uploadToIPFS(encryptedData);

      const contract = await getContract(
        deployments.CredentialManager,
        CredentialManagerABI.abi
      );

      const expiresAtTimestamp = formData.expiresAt 
        ? Math.floor(new Date(formData.expiresAt).getTime() / 1000)
        : 0;

      const tx = await contract.issueCredential(
        formData.subject,
        formData.credentialType,
        ipfsHash,
        expiresAtTimestamp
      );
      await tx.wait();

      setSuccess('Credential issued successfully!');
      setFormData({
        subject: '',
        credentialType: '',
        credentialData: '',
        expiresAt: '',
        password: ''
      });

      if (onCredentialIssued) {
        onCredentialIssued();
      }
    } catch (err) {
      setError(err.message || 'Failed to issue credential');
      console.error('Error issuing credential:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="credential-form">
      <h2>Issue a Credential</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject Address *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="0x..."
          />
          <small>Ethereum address of the credential subject</small>
        </div>

        <div className="form-group">
          <label htmlFor="credentialType">Credential Type *</label>
          <select
            id="credentialType"
            name="credentialType"
            value={formData.credentialType}
            onChange={handleChange}
            required
          >
            <option value="">Select type</option>
            <option value="EducationCredential">Education Credential</option>
            <option value="EmploymentCredential">Employment Credential</option>
            <option value="IdentityCredential">Identity Credential</option>
            <option value="LicenseCredential">License Credential</option>
            <option value="MembershipCredential">Membership Credential</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="credentialData">Credential Data *</label>
          <textarea
            id="credentialData"
            name="credentialData"
            value={formData.credentialData}
            onChange={handleChange}
            required
            placeholder="Enter credential details..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="expiresAt">Expiration Date (Optional)</label>
          <input
            type="date"
            id="expiresAt"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
          <small>Leave empty for no expiration</small>
        </div>

        <div className="form-group">
          <label htmlFor="password">Encryption Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter encryption password"
            minLength="8"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Issuing Credential...' : 'Issue Credential'}
        </button>
      </form>
    </div>
  );
};

export default CredentialForm;
