# API Documentation

## Smart Contracts

### IdentityRegistry

The IdentityRegistry contract manages decentralized identities with IPFS integration.

#### Functions

##### createIdentity
```solidity
function createIdentity(string memory _ipfsHash) external
```
Creates a new identity for the caller.

**Parameters:**
- `_ipfsHash`: IPFS hash containing encrypted identity data

**Events:** Emits `IdentityCreated(address owner, string ipfsHash, uint256 timestamp)`

**Requirements:**
- Identity must not already exist
- IPFS hash cannot be empty

---

##### updateIdentity
```solidity
function updateIdentity(string memory _ipfsHash) external
```
Updates an existing identity.

**Parameters:**
- `_ipfsHash`: New IPFS hash

**Events:** Emits `IdentityUpdated(address owner, string ipfsHash, uint256 timestamp)`

**Requirements:**
- Identity must exist
- IPFS hash cannot be empty

---

##### authorizeViewer
```solidity
function authorizeViewer(address _viewer) external
```
Authorizes an address to view the caller's identity.

**Parameters:**
- `_viewer`: Address to authorize

**Events:** Emits `ViewerAuthorized(address owner, address viewer)`

**Requirements:**
- Identity must exist
- Viewer address must be valid
- Cannot authorize self

---

##### revokeViewer
```solidity
function revokeViewer(address _viewer) external
```
Revokes viewer authorization.

**Parameters:**
- `_viewer`: Address to revoke

**Events:** Emits `ViewerRevoked(address owner, address viewer)`

---

##### getIdentity
```solidity
function getIdentity(address _owner) external view returns (string memory)
```
Gets identity IPFS hash if authorized.

**Parameters:**
- `_owner`: Identity owner address

**Returns:** IPFS hash as string

**Requirements:**
- Identity must exist
- Caller must be owner or authorized viewer

---

##### identityExists
```solidity
function identityExists(address _owner) external view returns (bool)
```
Checks if an identity exists.

**Parameters:**
- `_owner`: Address to check

**Returns:** True if identity exists

---

##### isAuthorized
```solidity
function isAuthorized(address _owner, address _viewer) external view returns (bool)
```
Checks if a viewer is authorized.

**Parameters:**
- `_owner`: Identity owner
- `_viewer`: Viewer address

**Returns:** True if authorized

---

##### getIdentityMetadata
```solidity
function getIdentityMetadata(address _owner) external view returns (
    address owner,
    uint256 createdAt,
    uint256 updatedAt,
    bool exists
)
```
Gets identity metadata (publicly viewable).

**Parameters:**
- `_owner`: Identity owner

**Returns:** Identity metadata tuple

---

### CredentialManager

The CredentialManager contract handles verifiable credentials with role-based access control.

#### Roles

- `DEFAULT_ADMIN_ROLE`: Can grant/revoke other roles
- `ISSUER_ROLE`: Can issue credentials
- `VERIFIER_ROLE`: Can verify and view all credentials

#### Functions

##### issueCredential
```solidity
function issueCredential(
    address _subject,
    string memory _credentialType,
    string memory _ipfsHash,
    uint256 _expiresAt
) external onlyRole(ISSUER_ROLE) returns (bytes32)
```
Issues a new credential.

**Parameters:**
- `_subject`: Credential subject address
- `_credentialType`: Type of credential
- `_ipfsHash`: IPFS hash of encrypted credential data
- `_expiresAt`: Expiration timestamp (0 for no expiration)

**Returns:** Credential ID (bytes32)

**Events:** Emits `CredentialIssued(...)`

**Requirements:**
- Caller must have ISSUER_ROLE
- Subject address must be valid
- Credential type and IPFS hash required
- If expiration set, must be in future

---

##### revokeCredential
```solidity
function revokeCredential(bytes32 _credentialId) external
```
Revokes a credential.

**Parameters:**
- `_credentialId`: Credential ID to revoke

**Events:** Emits `CredentialRevoked(bytes32 credentialId, uint256 timestamp)`

**Requirements:**
- Credential must exist
- Only issuer can revoke
- Credential must not already be revoked

---

##### verifyCredential
```solidity
function verifyCredential(bytes32 _credentialId) external view returns (bool)
```
Verifies if a credential is valid.

**Parameters:**
- `_credentialId`: Credential ID

**Returns:** True if valid (not revoked and not expired)

---

##### getCredential
```solidity
function getCredential(bytes32 _credentialId) external view returns (
    address subject,
    address issuer,
    string memory credentialType,
    string memory ipfsHash,
    uint256 issuedAt,
    uint256 expiresAt,
    bool revoked
)
```
Gets credential details.

**Parameters:**
- `_credentialId`: Credential ID

**Returns:** Credential details tuple

**Requirements:**
- Credential must exist
- Caller must be subject, issuer, or have VERIFIER_ROLE

---

##### getSubjectCredentials
```solidity
function getSubjectCredentials(address _subject) external view returns (bytes32[] memory)
```
Gets all credentials for a subject.

**Parameters:**
- `_subject`: Subject address

**Returns:** Array of credential IDs

**Requirements:**
- Caller must be subject or have VERIFIER_ROLE

---

##### getIssuerCredentials
```solidity
function getIssuerCredentials(address _issuer) external view returns (bytes32[] memory)
```
Gets all credentials issued by an issuer.

**Parameters:**
- `_issuer`: Issuer address

**Returns:** Array of credential IDs

**Requirements:**
- Caller must be issuer or have VERIFIER_ROLE

---

## Frontend API

### Web3 Utilities (`utils/web3.js`)

#### connectWallet()
Connects to MetaMask wallet.

**Returns:** `{ address, chainId }`

---

#### getContract(address, abi)
Gets a contract instance.

**Parameters:**
- `address`: Contract address
- `abi`: Contract ABI

**Returns:** Contract instance

---

### IPFS Utilities (`utils/ipfs.js`)

#### uploadToIPFS(data)
Uploads data to IPFS.

**Parameters:**
- `data`: Data object to upload

**Returns:** IPFS hash (string)

---

#### getFromIPFS(hash)
Retrieves data from IPFS.

**Parameters:**
- `hash`: IPFS hash

**Returns:** Data object

---

### Encryption Utilities (`utils/encryption.js`)

#### encryptData(data, password)
Encrypts data with password.

**Parameters:**
- `data`: Data object to encrypt
- `password`: Encryption password

**Returns:** Encrypted data object

---

#### decryptData(encryptedData, password)
Decrypts data with password.

**Parameters:**
- `encryptedData`: Encrypted data object
- `password`: Decryption password

**Returns:** Decrypted data object

---

#### hashData(data)
Creates SHA-256 hash of data.

**Parameters:**
- `data`: Data to hash

**Returns:** Hash string
