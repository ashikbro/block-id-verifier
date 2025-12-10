# Usage Examples

This guide provides practical examples of using the Block ID Verifier platform.

## Example 1: Creating a Personal Identity

Alice wants to create her decentralized identity:

### Step 1: Connect Wallet
```
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Alice's address is now displayed: 0x1234...5678
```

### Step 2: Create Identity
```
Form Data:
- Full Name: Alice Johnson
- Email: alice@example.com
- Date of Birth: 1990-05-15
- Nationality: USA
- Encryption Password: MySecurePassword123!

Action: Click "Create Identity"
Result: Transaction confirmed, identity stored on blockchain with IPFS hash
```

### Step 3: View Identity
```
1. Enter password: MySecurePassword123!
2. Click "Load Identity"
3. Identity data is decrypted and displayed
```

**IPFS Hash Example**: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`

**Blockchain Record**:
- Owner: 0x1234...5678
- IPFS Hash: QmYw...PbdG
- Created: 2024-01-15 10:30:00
- Status: Active

---

## Example 2: University Issuing Education Credential

University of Example wants to issue a degree credential to Bob:

### Prerequisites
- University wallet has ISSUER_ROLE
- Bob's address: 0x9876...4321

### Issuing Process

```javascript
Credential Data:
- Subject Address: 0x9876543210987654321098765432109876543210
- Credential Type: EducationCredential
- Data: {
    degree: "Bachelor of Science",
    major: "Computer Science",
    university: "University of Example",
    graduationDate: "2023-06-15",
    gpa: "3.8",
    honors: "Magna Cum Laude"
  }
- Expiration: Never (0)
- Encryption Password: UniversitySecure2024!
```

**Transaction**:
```
From: 0xUniversity...Address
To: CredentialManager Contract
Function: issueCredential()
Gas Used: 150,000
Status: Success
Credential ID: 0xabcd1234...
```

**Result**:
- Credential issued to Bob
- Encrypted data stored on IPFS
- Bob can now view and share his degree credential

---

## Example 3: Sharing Identity with Authorized Viewer

Alice wants to share her identity with her employer:

### Step 1: Authorize Viewer
```solidity
// Alice's action
contract.authorizeViewer("0xEmployer...Address");

Event Emitted:
ViewerAuthorized(
  owner: 0xAlice...Address,
  viewer: 0xEmployer...Address
)
```

### Step 2: Employer Views Identity
```javascript
// Employer's wallet connected
const ipfsHash = await contract.getIdentity("0xAlice...Address");
// ipfsHash: QmYw...PbdG

// Employer needs Alice's encryption password to decrypt
// Alice shares password securely offline
const encryptedData = await getFromIPFS(ipfsHash);
const identity = await decryptData(encryptedData, password);

// Result: Employer sees Alice's verified identity
```

### Step 3: Revoke Access
```solidity
// Alice revokes access after employment verification
contract.revokeViewer("0xEmployer...Address");

Event Emitted:
ViewerRevoked(
  owner: 0xAlice...Address,
  viewer: 0xEmployer...Address
)
```

---

## Example 4: Verifying a Credential

A company wants to verify Bob's degree:

### Step 1: Request Credential
```
Bob shares his credential ID: 0xabcd1234...
```

### Step 2: Verify On-Chain
```javascript
const isValid = await credentialManager.verifyCredential(
  "0xabcd1234..."
);

console.log(isValid); // true
```

### Step 3: Check Details (with permission)
```javascript
const credential = await credentialManager.getCredential(
  "0xabcd1234..."
);

Result:
{
  subject: "0x9876...4321",
  issuer: "0xUniv...Address",
  type: "EducationCredential",
  ipfsHash: "QmEdu...Hash",
  issuedAt: 1704096000,
  expiresAt: 0,
  revoked: false
}
```

### Step 4: View Encrypted Data
```javascript
// Company needs Bob's permission and password
const encryptedData = await getFromIPFS("QmEdu...Hash");
const credentialData = await decryptData(encryptedData, password);

// Bob provides password: UniversitySecure2024!

Result:
{
  degree: "Bachelor of Science",
  major: "Computer Science",
  university: "University of Example",
  graduationDate: "2023-06-15",
  gpa: "3.8",
  honors: "Magna Cum Laude"
}
```

---

## Example 5: Revoking a Credential

University discovers an error and needs to revoke a credential:

### Revocation Process
```javascript
// University's wallet (issuer)
await credentialManager.revokeCredential("0xabcd1234...");

Event Emitted:
CredentialRevoked(
  credentialId: 0xabcd1234...,
  timestamp: 1704096500
)
```

### Verification After Revocation
```javascript
const isValid = await credentialManager.verifyCredential(
  "0xabcd1234..."
);

console.log(isValid); // false
```

**Result**: Anyone verifying the credential will see it's no longer valid.

---

## Example 6: Managing Multiple Credentials

Carol has multiple credentials:

### View All Credentials
```javascript
const credentials = await credentialManager.getSubjectCredentials(
  "0xCarol...Address"
);

Result:
[
  "0xabcd1234...", // Education Credential
  "0xefgh5678...", // Employment Credential
  "0xijkl9012..."  // License Credential
]
```

### Check Each Credential
```javascript
for (const credId of credentials) {
  const cred = await credentialManager.getCredential(credId);
  const isValid = await credentialManager.verifyCredential(credId);
  
  console.log({
    type: cred.type,
    issuer: cred.issuer,
    valid: isValid
  });
}

Output:
[
  { type: "EducationCredential", issuer: "0xUniv...", valid: true },
  { type: "EmploymentCredential", issuer: "0xComp...", valid: true },
  { type: "LicenseCredential", issuer: "0xGov...", valid: false }
]
```

---

## Example 7: Role-Based Access Control

Admin wants to grant issuer role to a new university:

### Grant ISSUER_ROLE
```javascript
const ISSUER_ROLE = await credentialManager.ISSUER_ROLE();

await credentialManager.grantRole(
  ISSUER_ROLE,
  "0xNewUniversity...Address"
);
```

### Grant VERIFIER_ROLE
```javascript
const VERIFIER_ROLE = await credentialManager.VERIFIER_ROLE();

await credentialManager.grantRole(
  VERIFIER_ROLE,
  "0xVerificationCompany...Address"
);
```

**Result**: New university can now issue credentials, and verification company can verify all credentials.

---

## Example 8: Updating Identity

Alice wants to update her email address:

### Step 1: Prepare Updated Data
```javascript
const updatedIdentity = {
  name: "Alice Johnson",
  email: "alice.new@example.com", // Updated
  dateOfBirth: "1990-05-15",
  nationality: "USA",
  updatedAt: new Date().toISOString()
};
```

### Step 2: Encrypt and Upload
```javascript
const encryptedData = await encryptData(
  updatedIdentity,
  "MySecurePassword123!"
);

const newIpfsHash = await uploadToIPFS(encryptedData);
```

### Step 3: Update On-Chain
```javascript
await identityRegistry.updateIdentity(newIpfsHash);

Event Emitted:
IdentityUpdated(
  owner: 0xAlice...Address,
  ipfsHash: QmNew...Hash,
  timestamp: 1704096600
)
```

---

## Best Practices

### For Users
1. **Strong Passwords**: Use unique, strong passwords for encryption
2. **Backup**: Keep a secure backup of your encryption password
3. **Verification**: Always verify contract addresses before transactions
4. **Privacy**: Only share credentials with trusted parties
5. **Review**: Regularly review authorized viewers

### For Issuers
1. **Verification**: Verify subject identity before issuing credentials
2. **Data Accuracy**: Ensure credential data is accurate
3. **Expiration**: Set appropriate expiration dates
4. **Revocation**: Have a process for revoking invalid credentials
5. **Security**: Keep issuer wallet keys secure

### For Verifiers
1. **On-Chain Check**: Always verify on-chain before trusting credentials
2. **Expiration**: Check credential expiration dates
3. **Issuer Trust**: Verify the issuer is trustworthy
4. **Revocation**: Check if credential has been revoked
5. **Privacy**: Request only necessary information

---

## Common Workflows

### Workflow 1: Job Application
```
1. Job seeker creates identity
2. University issues education credential
3. Previous employer issues employment credential
4. Job seeker shares credentials with new employer
5. Employer verifies credentials on-chain
6. Job seeker provides decryption password
7. Employer views verified credentials
```

### Workflow 2: Age Verification
```
1. User creates identity with date of birth
2. Government agency issues identity credential
3. Service provider requests age verification
4. User shares credential with service provider
5. Service provider verifies on-chain
6. Age verification complete without revealing full identity
```

### Workflow 3: Professional Licensing
```
1. Professional creates identity
2. Licensing board issues license credential
3. License credential includes expiration date
4. Employers can verify active license status
5. Licensing board revokes expired licenses
6. System automatically flags invalid credentials
```

---

## Troubleshooting Common Issues

### Issue: "Identity already exists"
**Solution**: Use `updateIdentity()` instead of `createIdentity()`

### Issue: "Not authorized to view this identity"
**Solution**: Identity owner must call `authorizeViewer()` first

### Issue: "Failed to decrypt"
**Solution**: Verify you're using the correct password

### Issue: "Transaction failed"
**Solution**: Check gas balance and contract address

### Issue: "IPFS upload failed"
**Solution**: Check IPFS configuration or use localStorage fallback

---

## Next Steps

- Explore advanced features in [API.md](API.md)
- Review security considerations in [SECURITY.md](SECURITY.md)
- Follow deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md)
