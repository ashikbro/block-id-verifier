// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CredentialManager
 * @dev Manages verifiable credentials with role-based access control
 */
contract CredentialManager is AccessControl {
    
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct Credential {
        address subject;
        address issuer;
        string credentialType;
        string ipfsHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
        bool exists;
    }
    
    mapping(bytes32 => Credential) private credentials;
    mapping(address => bytes32[]) private subjectCredentials;
    mapping(address => bytes32[]) private issuerCredentials;
    
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed subject,
        address indexed issuer,
        string credentialType,
        uint256 issuedAt
    );
    event CredentialRevoked(bytes32 indexed credentialId, uint256 timestamp);
    event CredentialShared(bytes32 indexed credentialId, address indexed viewer, uint256 timestamp);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Issue a new credential
     * @param _subject Address of credential subject
     * @param _credentialType Type of credential
     * @param _ipfsHash IPFS hash of encrypted credential data
     * @param _expiresAt Expiration timestamp (0 for no expiration)
     */
    function issueCredential(
        address _subject,
        string memory _credentialType,
        string memory _ipfsHash,
        uint256 _expiresAt
    ) external onlyRole(ISSUER_ROLE) returns (bytes32) {
        require(_subject != address(0), "Invalid subject address");
        require(bytes(_credentialType).length > 0, "Credential type required");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        if (_expiresAt > 0) {
            require(_expiresAt > block.timestamp, "Expiration must be in future");
        }
        
        bytes32 credentialId = keccak256(
            abi.encodePacked(_subject, msg.sender, _credentialType, block.timestamp)
        );
        
        require(!credentials[credentialId].exists, "Credential already exists");
        
        credentials[credentialId] = Credential({
            subject: _subject,
            issuer: msg.sender,
            credentialType: _credentialType,
            ipfsHash: _ipfsHash,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            revoked: false,
            exists: true
        });
        
        subjectCredentials[_subject].push(credentialId);
        issuerCredentials[msg.sender].push(credentialId);
        
        emit CredentialIssued(credentialId, _subject, msg.sender, _credentialType, block.timestamp);
        
        return credentialId;
    }
    
    /**
     * @dev Revoke a credential
     * @param _credentialId Credential ID to revoke
     */
    function revokeCredential(bytes32 _credentialId) external {
        require(credentials[_credentialId].exists, "Credential does not exist");
        require(
            credentials[_credentialId].issuer == msg.sender,
            "Only issuer can revoke"
        );
        require(!credentials[_credentialId].revoked, "Already revoked");
        
        credentials[_credentialId].revoked = true;
        emit CredentialRevoked(_credentialId, block.timestamp);
    }
    
    /**
     * @dev Verify a credential
     * @param _credentialId Credential ID
     */
    function verifyCredential(bytes32 _credentialId) external view returns (bool) {
        Credential memory cred = credentials[_credentialId];
        
        if (!cred.exists || cred.revoked) {
            return false;
        }
        
        if (cred.expiresAt > 0 && block.timestamp > cred.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get credential details
     * @param _credentialId Credential ID
     */
    function getCredential(bytes32 _credentialId) external view returns (
        address subject,
        address issuer,
        string memory credentialType,
        string memory ipfsHash,
        uint256 issuedAt,
        uint256 expiresAt,
        bool revoked
    ) {
        require(credentials[_credentialId].exists, "Credential does not exist");
        Credential memory cred = credentials[_credentialId];
        
        require(
            msg.sender == cred.subject ||
            msg.sender == cred.issuer ||
            hasRole(VERIFIER_ROLE, msg.sender),
            "Not authorized to view credential"
        );
        
        return (
            cred.subject,
            cred.issuer,
            cred.credentialType,
            cred.ipfsHash,
            cred.issuedAt,
            cred.expiresAt,
            cred.revoked
        );
    }
    
    /**
     * @dev Get all credentials for a subject
     * @param _subject Subject address
     */
    function getSubjectCredentials(address _subject) external view returns (bytes32[] memory) {
        require(
            msg.sender == _subject || hasRole(VERIFIER_ROLE, msg.sender),
            "Not authorized"
        );
        return subjectCredentials[_subject];
    }
    
    /**
     * @dev Get all credentials issued by an issuer
     * @param _issuer Issuer address
     */
    function getIssuerCredentials(address _issuer) external view returns (bytes32[] memory) {
        require(
            msg.sender == _issuer || hasRole(VERIFIER_ROLE, msg.sender),
            "Not authorized"
        );
        return issuerCredentials[_issuer];
    }
}
