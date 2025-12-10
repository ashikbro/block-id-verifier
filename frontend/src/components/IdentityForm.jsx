import React, { useState } from 'react';
import { encryptData } from '../utils/encryption';
import { uploadToIPFS } from '../utils/ipfs';
import { getContract } from '../utils/web3';
import deployments from '../contracts/deployments.json';
import IdentityRegistryABI from '../contracts/IdentityRegistry.json';
import './IdentityForm.css';

const IdentityForm = ({ onIdentityCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    nationality: '',
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

      const identityData = {
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        createdAt: new Date().toISOString()
      };

      const encryptedData = await encryptData(identityData, formData.password);
      const ipfsHash = await uploadToIPFS(encryptedData);

      const contract = await getContract(
        deployments.IdentityRegistry,
        IdentityRegistryABI.abi
      );

      const tx = await contract.createIdentity(ipfsHash);
      await tx.wait();

      setSuccess('Identity created successfully!');
      setFormData({
        name: '',
        email: '',
        dateOfBirth: '',
        nationality: '',
        password: ''
      });

      if (onIdentityCreated) {
        onIdentityCreated();
      }
    } catch (err) {
      setError(err.message || 'Failed to create identity');
      console.error('Error creating identity:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="identity-form">
      <h2>Create Your Decentralized Identity</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth *</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nationality">Nationality *</label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
            placeholder="USA"
          />
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
            placeholder="Enter a strong password"
            minLength="8"
          />
          <small>This password will encrypt your identity data. Keep it safe!</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Identity...' : 'Create Identity'}
        </button>
      </form>
    </div>
  );
};

export default IdentityForm;
