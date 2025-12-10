# Deployment Guide

## Prerequisites

Before deploying the decentralized identity platform, ensure you have:

1. **Node.js** (v16+) installed
2. **MetaMask** browser extension
3. **Internet connection** for downloading Solidity compiler and dependencies
4. **Test ETH** for local development or testnet deployment

## Step-by-Step Deployment

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/ashikbro/block-id-verifier.git
cd block-id-verifier

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Compile Smart Contracts

```bash
npm run compile
```

This will:
- Download the Solidity compiler (if not cached)
- Compile all contracts in the `contracts/` directory
- Generate artifacts in the `artifacts/` directory
- Generate TypeChain types

### 3. Run Tests

```bash
npm test
```

Expected output:
- All IdentityRegistry tests pass
- All CredentialManager tests pass
- Code coverage report (optional)

### 4. Deploy to Local Network

#### Start Local Blockchain

In terminal 1:
```bash
npm run node
```

This starts a local Hardhat node with 20 test accounts, each funded with 10,000 ETH.

#### Deploy Contracts

In terminal 2:
```bash
npm run deploy:local
```

Expected output:
```
Deploying contracts...
IdentityRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
CredentialManager deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

Deployment info saved to frontend/src/contracts/deployments.json

Deployment complete!
```

#### Copy Contract ABIs

```bash
cp artifacts/contracts/IdentityRegistry.sol/IdentityRegistry.json frontend/src/contracts/
cp artifacts/contracts/CredentialManager.sol/CredentialManager.json frontend/src/contracts/
```

### 5. Configure MetaMask

1. Open MetaMask
2. Click on network dropdown → Add Network → Add a network manually
3. Enter the following details:
   - **Network Name**: Hardhat Local
   - **New RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH
4. Click "Save"

5. Import a test account:
   - Copy a private key from the Hardhat node output (terminal 1)
   - Click on account icon → Import Account
   - Paste the private key
   - Click "Import"

### 6. Start Frontend

In terminal 3:
```bash
cd frontend
npm run dev
```

The application will open at `http://localhost:3000`

### 7. Use the Application

1. **Connect Wallet**:
   - Click "Connect Wallet" button
   - Select your MetaMask account
   - Approve the connection

2. **Create Identity**:
   - Go to "Identity" tab
   - Fill in your information
   - Enter an encryption password (remember this!)
   - Click "Create Identity"
   - Confirm transaction in MetaMask

3. **View Identity**:
   - Enter your encryption password
   - Click "Load Identity"
   - Your decrypted information appears

4. **Issue Credential** (requires ISSUER_ROLE):
   - Go to "Credentials" tab
   - Fill in credential details
   - Enter encryption password
   - Click "Issue Credential"
   - Confirm transaction

5. **View Credentials**:
   - Enter password to decrypt
   - View your credential list
   - Click "View Details" on any credential

## Deploy to Testnet

### Goerli Testnet Example

1. **Get Test ETH**:
   - Visit a Goerli faucet
   - Request test ETH for your account

2. **Update hardhat.config.js**:

```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY]
    }
  }
};
```

3. **Deploy**:

```bash
npx hardhat run scripts/deploy.js --network goerli
```

4. **Update Frontend**:
   - Update `frontend/src/contracts/deployments.json` with new addresses
   - Configure MetaMask to Goerli network

## Deploy to Mainnet

⚠️ **WARNING**: Deploying to mainnet requires real ETH and thorough testing.

1. **Audit**: Get a professional smart contract audit
2. **Test**: Thoroughly test on multiple testnets
3. **Gas Optimization**: Optimize for gas efficiency
4. **Deploy**: Use the same process as testnet with mainnet configuration

### Mainnet Configuration

```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [PRIVATE_KEY],
      gasPrice: 'auto'
    }
  }
};
```

## IPFS Configuration (Optional)

For production, use Infura IPFS or your own IPFS node:

1. **Sign up** at [infura.io](https://infura.io)
2. **Create** an IPFS project
3. **Get** Project ID and Secret
4. **Create** `frontend/.env`:

```env
VITE_IPFS_PROJECT_ID=your_project_id
VITE_IPFS_PROJECT_SECRET=your_project_secret
```

5. **Restart** the frontend

## Troubleshooting

### Contract Compilation Fails
- Ensure internet connection for compiler download
- Check Solidity version compatibility
- Clear cache: `npx hardhat clean`

### MetaMask Connection Issues
- Ensure correct network is selected
- Check that MetaMask is unlocked
- Refresh the page

### Transaction Failures
- Ensure sufficient balance for gas
- Check that contract addresses are correct
- Verify you have required roles (for credential issuance)

### IPFS Upload Fails
- Check IPFS credentials
- Verify network connectivity
- Use localStorage fallback for development

## Post-Deployment Checklist

- [ ] Smart contracts deployed successfully
- [ ] Contract addresses updated in frontend
- [ ] Contract ABIs copied to frontend
- [ ] MetaMask configured correctly
- [ ] Frontend running and accessible
- [ ] Wallet connection working
- [ ] Identity creation tested
- [ ] Identity viewing tested
- [ ] Credential issuance tested
- [ ] Credential viewing tested
- [ ] Role assignments verified
- [ ] IPFS integration tested

## Maintenance

### Granting Roles

To grant ISSUER_ROLE to an address:

```javascript
const credentialManager = await ethers.getContractAt(
  "CredentialManager",
  CREDENTIAL_MANAGER_ADDRESS
);

const ISSUER_ROLE = await credentialManager.ISSUER_ROLE();
await credentialManager.grantRole(ISSUER_ROLE, ADDRESS_TO_GRANT);
```

### Monitoring

- Monitor contract events for activity
- Track gas usage
- Monitor IPFS pin status
- Backup deployment information

## Support

For issues and questions:
- Check the [README.md](README.md)
- Review [SECURITY.md](SECURITY.md)
- Check [API.md](API.md) for API documentation
- Open an issue on GitHub

## Next Steps

After successful deployment:
1. Test all functionality thoroughly
2. Share contract addresses with users
3. Monitor for issues
4. Plan for upgrades if needed
5. Consider implementing additional features
