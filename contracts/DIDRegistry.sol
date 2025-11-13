// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Simple DID registry with anchors and revocation
/// @notice Minimal DID registry for MVP. Each DID owner is an Ethereum address.
contract DIDRegistry {
    struct DIDRecord {
        address owner;
        string controller; // optional controller DID or metadata
        string ipfsCid;    // latest IPFS CID anchor
        bool exists;
    }

    mapping(string => DIDRecord) private records; // mapping DID string -> record
    mapping(string => bool) public revoked;       // mapping credentialId -> revoked

    event DIDRegistered(string did, address owner, string ipfsCid);
    event DIDUpdated(string did, address owner, string ipfsCid);
    event CredentialRevoked(string credentialId);

    modifier onlyOwner(string memory did) {
        require(records[did].exists, "DID not registered");
        require(records[did].owner == msg.sender, "Only DID owner");
        _;
    }

    /// Register a DID. DID is application-level (e.g. "did:ethr:0xabc...") but stored as string.
    function registerDID(string calldata did, string calldata ipfsCid, string calldata controller) external {
        require(!records[did].exists, "DID already registered");
        records[did] = DIDRecord({
            owner: msg.sender,
            controller: controller,
            ipfsCid: ipfsCid,
            exists: true
        });
        emit DIDRegistered(did, msg.sender, ipfsCid);
    }

    /// Update anchor or controller — only owner
    function updateDID(string calldata did, string calldata ipfsCid, string calldata controller) external onlyOwner(did) {
        records[did].ipfsCid = ipfsCid;
        records[did].controller = controller;
        emit DIDUpdated(did, msg.sender, ipfsCid);
    }

    /// Read record
    function getDID(string calldata did) external view returns (address owner, string memory ipfsCid, string memory controller, bool exists) {
        DIDRecord storage r = records[did];
        return (r.owner, r.ipfsCid, r.controller, r.exists);
    }

    /// Revoke a credential (credentialId should be unique ID string)
    function revokeCredential(string calldata credentialId) external {
        // For MVP: allow anyone to request revoke but only the credential issuer would call this (off-chain policy).
        revoked[credentialId] = true;
        emit CredentialRevoked(credentialId);
    }

    function isRevoked(string calldata credentialId) external view returns (bool) {
        return revoked[credentialId];
    }
}
