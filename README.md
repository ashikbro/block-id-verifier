# Block ID Verifier - Decentralized Identity Platform

A secure, decentralized identity verification system using blockchain technology, IPFS storage, and MetaMask wallet integration. Users can create, manage, and share verifiable credentials with privacy-first encryption.

## 🌟 Features

- **Decentralized Identity Management**: Create and manage your digital identity on the Ethereum blockchain
- **IPFS Storage**: Encrypted data storage on IPFS for decentralization and resilience
- **MetaMask Integration**: Seamless wallet connection and transaction signing
- **End-to-End Encryption**: Client-side encryption using Web Crypto API
- **Verifiable Credentials**: Issue, view, and verify credentials with role-based access control
- **Privacy-First**: Your data is encrypted before being stored, ensuring privacy
- **Role-Based Sharing**: Share credentials with specific parties based on roles

## 🏗️ Architecture

### Smart Contracts (Solidity)
- **IdentityRegistry**: Manages decentralized identities with IPFS hash storage
- **CredentialManager**: Handles verifiable credentials with role-based access control

### Frontend (React)
- Modern React dashboard with Vite
- Web3 integration with ethers.js
- IPFS integration for decentralized storage
- Responsive UI with custom styling

### Storage & Security
- IPFS for decentralized data storage
- AES-GCM encryption for sensitive data
- PBKDF2 key derivation for password-based encryption
- MetaMask for secure wallet management

## 📋 Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ashikbro/block-id-verifier.git
cd block-id-verifier
```

### 2. Install Smart Contract Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## 🔧 Configuration

### Smart Contracts

The project uses Hardhat for smart contract development. Configuration is in `hardhat.config.js`.

### Frontend

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_IPFS_PROJECT_ID=your_infura_project_id
VITE_IPFS_PROJECT_SECRET=your_infura_project_secret
```

**Note**: The application includes a fallback to local storage for development if IPFS credentials are not provided.

## 🎯 Usage

### 1. Start Local Blockchain

In a terminal, start a local Hardhat node:

```bash
npm run node
```

### 2. Deploy Smart Contracts

In a new terminal, deploy contracts to the local network:

```bash
npm run deploy:local
```

This will create contract ABIs in the `artifacts` directory and save deployment addresses to `frontend/src/contracts/deployments.json`.

### 3. Copy Contract ABIs

Copy the contract ABIs to the frontend:

```bash
cp artifacts/contracts/IdentityRegistry.sol/IdentityRegistry.json frontend/src/contracts/
cp artifacts/contracts/CredentialManager.sol/CredentialManager.json frontend/src/contracts/
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Configure MetaMask

1. Install MetaMask browser extension
2. Add local Hardhat network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH
3. Import one of the test accounts from Hardhat node output

## 📖 How to Use

### Creating an Identity

1. Connect your MetaMask wallet
2. Navigate to the "Identity" tab
3. Fill in your identity information
4. Enter an encryption password (remember this!)
5. Click "Create Identity"
6. Confirm the transaction in MetaMask

### Viewing Your Identity

1. Navigate to the "Identity" tab
2. Enter your encryption password
3. Click "Load Identity"
4. Your decrypted identity information will be displayed

### Issuing a Credential

1. Connect your MetaMask wallet (must have ISSUER_ROLE)
2. Navigate to the "Credentials" tab
3. Fill in credential details including subject address
4. Enter an encryption password
5. Click "Issue Credential"
6. Confirm the transaction in MetaMask

### Viewing Credentials

1. Navigate to the "Credentials" tab
2. Enter your encryption password
3. Your credentials will be listed
4. Click "View Details" to decrypt and view credential data

## 🧪 Testing

Run smart contract tests:

```bash
npm test
```

## 🔒 Security Features

1. **Client-Side Encryption**: All sensitive data is encrypted on the client before being sent to IPFS
2. **Password-Based Key Derivation**: Uses PBKDF2 with 100,000 iterations
3. **AES-GCM Encryption**: Industry-standard encryption algorithm
4. **Role-Based Access Control**: Smart contracts enforce access permissions
5. **Authorization System**: Users can control who views their identity

## 📝 Smart Contract Functions

### IdentityRegistry

- `createIdentity(string ipfsHash)`: Create a new identity
- `updateIdentity(string ipfsHash)`: Update existing identity
- `authorizeViewer(address viewer)`: Allow someone to view your identity
- `revokeViewer(address viewer)`: Remove viewing permission
- `getIdentity(address owner)`: Get identity IPFS hash (requires permission)

### CredentialManager

- `issueCredential(address subject, string credentialType, string ipfsHash, uint256 expiresAt)`: Issue a credential
- `revokeCredential(bytes32 credentialId)`: Revoke a credential
- `verifyCredential(bytes32 credentialId)`: Verify if credential is valid
- `getCredential(bytes32 credentialId)`: Get credential details
- `getSubjectCredentials(address subject)`: Get all credentials for a subject

## 🛠️ Tech Stack

- **Blockchain**: Ethereum, Solidity ^0.8.20
- **Smart Contract Framework**: Hardhat
- **Frontend**: React 18, Vite
- **Web3 Library**: ethers.js v6
- **Storage**: IPFS (via ipfs-http-client)
- **Wallet**: MetaMask
- **Styling**: Custom CSS
- **Routing**: React Router v6

## 📦 Project Structure

```
block-id-verifier/
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── contracts/     # Contract ABIs and addresses
├── hardhat.config.js      # Hardhat configuration
└── package.json           # Project dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Ethereum](https://ethereum.org/)
- [IPFS](https://ipfs.io/)
- [MetaMask](https://metamask.io/)
- [Hardhat](https://hardhat.org/)
- [React](https://react.dev/)

## ⚠️ Disclaimer

This is a proof-of-concept implementation. For production use, conduct thorough security audits and testing.
