# Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Dashboard  │    │ Credentials  │    │    Navbar    │          │
│  │     Page     │    │     Page     │    │  (MetaMask)  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                    │                   │
│         ├───────────────────┼────────────────────┤                   │
│         │                   │                    │                   │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌───────▼────┐              │
│  │   Identity  │    │ Credential  │    │    Web3    │              │
│  │  Components │    │ Components  │    │   Context  │              │
│  └─────────────┘    └─────────────┘    └────────────┘              │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                        Utility Layer                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │
│  │   web3.js   │    │   ipfs.js   │    │encryption.js│           │
│  │             │    │             │    │             │           │
│  │ • Connect   │    │ • Upload    │    │ • AES-GCM   │           │
│  │ • Sign      │    │ • Download  │    │ • PBKDF2    │           │
│  │ • Listen    │    │ • Encrypt   │    │ • 250k iter │           │
│  └─────────────┘    └─────────────┘    └─────────────┘           │
│                                                                     │
└─────────────┬──────────────────────┬────────────────────────────┘
              │                      │
              │                      │
┌─────────────▼─────────┐  ┌─────────▼─────────┐
│   MetaMask Wallet     │  │   IPFS Network    │
│                       │  │                   │
│  • Private Keys       │  │  • Encrypted Data │
│  • Transaction Sign   │  │  • Content Hash   │
│  • Account Management │  │  • Decentralized  │
└───────────┬───────────┘  └───────────────────┘
            │
            │
┌───────────▼────────────────────────────────────────────────────┐
│                    Blockchain Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │   IdentityRegistry       │  │   CredentialManager      │   │
│  │                          │  │                          │   │
│  │  • createIdentity()      │  │  • issueCredential()     │   │
│  │  • updateIdentity()      │  │  • revokeCredential()    │   │
│  │  • authorizeViewer()     │  │  • verifyCredential()    │   │
│  │  • revokeViewer()        │  │  • getCredential()       │   │
│  │  • getIdentity()         │  │  • Role Management       │   │
│  │                          │  │                          │   │
│  │  Storage:                │  │  Storage:                │   │
│  │  • Owner → IPFS Hash     │  │  • CredID → Credential   │   │
│  │  • Authorizations        │  │  • Subject → CredIDs     │   │
│  │  • Metadata              │  │  • Issuer → CredIDs      │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │
                    ┌─────────▼─────────┐
                    │  Ethereum Network │
                    │                   │
                    │  • Transactions   │
                    │  • Events         │
                    │  • State          │
                    └───────────────────┘
```

## Data Flow

### Creating an Identity

```
1. User fills form → Frontend
   ↓
2. Encrypt with password → encryption.js (AES-GCM + PBKDF2)
   ↓
3. Upload encrypted data → ipfs.js
   ↓
4. Receive IPFS hash → "QmXXX..."
   ↓
5. Call createIdentity(hash) → IdentityRegistry.sol
   ↓
6. Transaction confirmed → Ethereum
   ↓
7. Event emitted → IdentityCreated
   ↓
8. UI updates → Success message
```

### Issuing a Credential

```
1. Issuer fills form → Frontend
   ↓
2. Check ISSUER_ROLE → CredentialManager
   ↓
3. Encrypt credential data → encryption.js
   ↓
4. Upload to IPFS → ipfs.js
   ↓
5. Receive IPFS hash → "QmYYY..."
   ↓
6. Call issueCredential() → CredentialManager.sol
   ↓
7. Generate CredentialID → keccak256(subject + issuer + type + timestamp)
   ↓
8. Store on-chain → Ethereum
   ↓
9. Event emitted → CredentialIssued
   ↓
10. Subject can now view credential
```

### Verifying a Credential

```
1. Verifier receives CredentialID → Frontend
   ↓
2. Call verifyCredential(id) → CredentialManager.sol
   ↓
3. Check conditions:
   • Exists? ✓
   • Not revoked? ✓
   • Not expired? ✓
   ↓
4. Return validation result → true/false
   ↓
5. (Optional) Get credential details → getCredential()
   ↓
6. (Optional) Decrypt data → encryption.js
   ↓
7. Display verification result → UI
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│           Application Security              │
│  • Input Validation                         │
│  • XSS Prevention                           │
│  • CSRF Protection                          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Encryption Layer                    │
│  • AES-GCM 256-bit                          │
│  • PBKDF2 250k iterations                   │
│  • Random Salt & IV                         │
│  • Client-side only                         │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Smart Contract Security             │
│  • Role-Based Access Control                │
│  • Authorization Checks                     │
│  • Input Validation                         │
│  • Reentrancy Protection                    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Blockchain Security                 │
│  • Immutable Transactions                   │
│  • Consensus Mechanism                      │
│  • Network Decentralization                 │
└─────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Web3Provider (Context)
│   └── Router
│       ├── Navbar
│       │   ├── Brand
│       │   └── WalletConnection
│       │       └── MetaMask Integration
│       │
│       ├── TabNav
│       │   ├── Identity Link
│       │   └── Credentials Link
│       │
│       ├── Routes
│       │   ├── Dashboard (/)
│       │   │   ├── IdentityForm
│       │   │   │   ├── Form Fields
│       │   │   │   ├── Password Input
│       │   │   │   └── Submit → Blockchain
│       │   │   │
│       │   │   └── IdentityViewer
│       │   │       ├── Password Input
│       │   │       ├── Load Button
│       │   │       └── Decrypted Display
│       │   │
│       │   └── Credentials (/credentials)
│       │       ├── CredentialForm
│       │       │   ├── Subject Address
│       │       │   ├── Credential Type
│       │       │   ├── Data Input
│       │       │   ├── Expiration
│       │       │   └── Submit → Blockchain
│       │       │
│       │       └── CredentialList
│       │           ├── Password Input
│       │           ├── Credential Cards
│       │           │   ├── Header (Type, Status)
│       │           │   ├── Info (Issuer, Dates)
│       │           │   └── View Button
│       │           │
│       │           └── Modal (Details)
│       │
│       └── Footer
```

## Technology Integration

```
┌─────────────────────────────────────────────┐
│              Frontend Stack                 │
├─────────────────────────────────────────────┤
│  React 18        → Component Framework      │
│  Vite            → Build Tool               │
│  React Router    → Navigation               │
│  ethers.js v6    → Web3 Integration         │
│  Custom CSS      → Styling                  │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│           Development Tools                 │
├─────────────────────────────────────────────┤
│  Hardhat         → Smart Contract Dev       │
│  OpenZeppelin    → Security Libraries       │
│  npm             → Package Management       │
│  Git             → Version Control          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│            Infrastructure                   │
├─────────────────────────────────────────────┤
│  Ethereum        → Blockchain Network       │
│  IPFS            → Decentralized Storage    │
│  MetaMask        → Wallet & Identity        │
│  Infura          → RPC Provider (optional)  │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

```
                Development Environment
┌─────────────────────────────────────────────┐
│  Local Machine                              │
│                                             │
│  ┌─────────────┐    ┌──────────────┐       │
│  │   Hardhat   │    │     Vite     │       │
│  │    Node     │────│  Dev Server  │       │
│  │ (Port 8545) │    │ (Port 3000)  │       │
│  └─────────────┘    └──────────────┘       │
│         │                   │               │
│         │                   │               │
│  ┌──────▼────────┐  ┌───────▼──────┐       │
│  │   Contracts   │  │   Frontend   │       │
│  │   Deployed    │  │   Running    │       │
│  └───────────────┘  └──────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
                       │
                       │ User Access
                       ▼
              ┌────────────────┐
              │    Browser     │
              │   + MetaMask   │
              └────────────────┘


                Production Environment
┌─────────────────────────────────────────────┐
│  Ethereum Mainnet                           │
│                                             │
│  ┌─────────────┐    ┌──────────────┐       │
│  │   Smart     │    │     IPFS     │       │
│  │  Contracts  │    │   Network    │       │
│  │  (Deployed) │    │  (Infura)    │       │
│  └─────────────┘    └──────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
                       │
                       │
                       ▼
              ┌────────────────┐
              │  Static Host   │
              │ (Vercel/IPFS)  │
              │   Frontend     │
              └────────────────┘
                       │
                       │ User Access
                       ▼
              ┌────────────────┐
              │    Browser     │
              │   + MetaMask   │
              └────────────────┘
```

## Key Design Decisions

1. **Client-Side Encryption**: All encryption happens in the browser for maximum privacy
2. **IPFS Storage**: Off-chain storage reduces blockchain costs and enables larger data
3. **Role-Based Access**: Flexible permission model for credential issuance
4. **Event-Driven**: Smart contracts emit events for frontend listening
5. **Modular Design**: Separate contracts for identity and credentials
6. **OpenZeppelin**: Use battle-tested security libraries
7. **React Context**: Global state management without Redux complexity
8. **Vite**: Fast development builds and hot reload

## Performance Characteristics

- **Identity Creation**: ~150,000 gas
- **Credential Issuance**: ~200,000 gas
- **Credential Verification**: Read-only (no gas)
- **Authorization**: ~50,000 gas
- **IPFS Upload**: <1 second (fallback instant)
- **Frontend Load**: <100ms initial load
- **Encryption**: <100ms per operation

This architecture provides a scalable, secure, and user-friendly platform for decentralized identity management.
