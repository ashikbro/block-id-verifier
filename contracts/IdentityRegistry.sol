// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IdentityRegistry
 * @dev Manages decentralized identities with IPFS integration
 */
contract IdentityRegistry is Ownable {
    
    struct Identity {
        address owner;
        string ipfsHash;
        uint256 createdAt;
        uint256 updatedAt;
        bool exists;
    }
    
    mapping(address => Identity) private identities;
    mapping(address => mapping(address => bool)) private authorizedViewers;
    
    event IdentityCreated(address indexed owner, string ipfsHash, uint256 timestamp);
    event IdentityUpdated(address indexed owner, string ipfsHash, uint256 timestamp);
    event ViewerAuthorized(address indexed owner, address indexed viewer);
    event ViewerRevoked(address indexed owner, address indexed viewer);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new identity
     * @param _ipfsHash IPFS hash containing encrypted identity data
     */
    function createIdentity(string memory _ipfsHash) external {
        require(!identities[msg.sender].exists, "Identity already exists");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        identities[msg.sender] = Identity({
            owner: msg.sender,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });
        
        emit IdentityCreated(msg.sender, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Update existing identity
     * @param _ipfsHash New IPFS hash
     */
    function updateIdentity(string memory _ipfsHash) external {
        require(identities[msg.sender].exists, "Identity does not exist");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        identities[msg.sender].ipfsHash = _ipfsHash;
        identities[msg.sender].updatedAt = block.timestamp;
        
        emit IdentityUpdated(msg.sender, _ipfsHash, block.timestamp);
    }
    
    /**
     * @dev Authorize an address to view identity
     * @param _viewer Address to authorize
     */
    function authorizeViewer(address _viewer) external {
        require(identities[msg.sender].exists, "Identity does not exist");
        require(_viewer != address(0), "Invalid viewer address");
        require(_viewer != msg.sender, "Cannot authorize self");
        
        authorizedViewers[msg.sender][_viewer] = true;
        emit ViewerAuthorized(msg.sender, _viewer);
    }
    
    /**
     * @dev Revoke viewer authorization
     * @param _viewer Address to revoke
     */
    function revokeViewer(address _viewer) external {
        require(identities[msg.sender].exists, "Identity does not exist");
        
        authorizedViewers[msg.sender][_viewer] = false;
        emit ViewerRevoked(msg.sender, _viewer);
    }
    
    /**
     * @dev Get identity IPFS hash
     * @param _owner Identity owner address
     * @return IPFS hash if authorized
     */
    function getIdentity(address _owner) external view returns (string memory) {
        require(identities[_owner].exists, "Identity does not exist");
        require(
            msg.sender == _owner || authorizedViewers[_owner][msg.sender],
            "Not authorized to view this identity"
        );
        
        return identities[_owner].ipfsHash;
    }
    
    /**
     * @dev Check if identity exists
     * @param _owner Address to check
     */
    function identityExists(address _owner) external view returns (bool) {
        return identities[_owner].exists;
    }
    
    /**
     * @dev Check if viewer is authorized
     * @param _owner Identity owner
     * @param _viewer Viewer address
     */
    function isAuthorized(address _owner, address _viewer) external view returns (bool) {
        return authorizedViewers[_owner][_viewer];
    }
    
    /**
     * @dev Get identity metadata
     * @param _owner Identity owner
     */
    function getIdentityMetadata(address _owner) external view returns (
        address owner,
        uint256 createdAt,
        uint256 updatedAt,
        bool exists
    ) {
        Identity memory identity = identities[_owner];
        return (identity.owner, identity.createdAt, identity.updatedAt, identity.exists);
    }
}
