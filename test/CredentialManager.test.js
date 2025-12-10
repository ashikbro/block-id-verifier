const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialManager", function () {
  let credentialManager;
  let owner, issuer, subject, verifier;
  const ISSUER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ISSUER_ROLE"));
  const VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("VERIFIER_ROLE"));

  beforeEach(async function () {
    [owner, issuer, subject, verifier] = await ethers.getSigners();
    const CredentialManager = await ethers.getContractFactory("CredentialManager");
    credentialManager = await CredentialManager.deploy();
    await credentialManager.waitForDeployment();

    await credentialManager.grantRole(ISSUER_ROLE, issuer.address);
    await credentialManager.grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("Credential Issuance", function () {
    it("Should issue a new credential", async function () {
      const credType = "EducationCredential";
      const ipfsHash = "QmCredential123";
      const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

      await expect(
        credentialManager.connect(issuer).issueCredential(
          subject.address,
          credType,
          ipfsHash,
          expiresAt
        )
      ).to.emit(credentialManager, "CredentialIssued");
    });

    it("Should not allow non-issuer to issue credential", async function () {
      await expect(
        credentialManager.connect(subject).issueCredential(
          subject.address,
          "TestCredential",
          "QmTest",
          0
        )
      ).to.be.reverted;
    });

    it("Should not allow empty credential type", async function () {
      await expect(
        credentialManager.connect(issuer).issueCredential(
          subject.address,
          "",
          "QmTest",
          0
        )
      ).to.be.revertedWith("Credential type required");
    });
  });

  describe("Credential Verification", function () {
    let credentialId;

    beforeEach(async function () {
      const tx = await credentialManager.connect(issuer).issueCredential(
        subject.address,
        "TestCredential",
        "QmTest123",
        0
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "CredentialIssued"
      );
      credentialId = event.args[0];
    });

    it("Should verify valid credential", async function () {
      expect(await credentialManager.verifyCredential(credentialId)).to.be.true;
    });

    it("Should not verify revoked credential", async function () {
      await credentialManager.connect(issuer).revokeCredential(credentialId);
      expect(await credentialManager.verifyCredential(credentialId)).to.be.false;
    });

    it("Should not verify expired credential", async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 1000;
      const tx = await credentialManager.connect(issuer).issueCredential(
        subject.address,
        "ExpiredCredential",
        "QmTest456",
        pastTime
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "CredentialIssued"
      );
      const expiredCredId = event.args[0];

      expect(await credentialManager.verifyCredential(expiredCredId)).to.be.false;
    });
  });

  describe("Credential Revocation", function () {
    let credentialId;

    beforeEach(async function () {
      const tx = await credentialManager.connect(issuer).issueCredential(
        subject.address,
        "TestCredential",
        "QmTest123",
        0
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "CredentialIssued"
      );
      credentialId = event.args[0];
    });

    it("Should allow issuer to revoke credential", async function () {
      await expect(credentialManager.connect(issuer).revokeCredential(credentialId))
        .to.emit(credentialManager, "CredentialRevoked");
    });

    it("Should not allow non-issuer to revoke credential", async function () {
      await expect(
        credentialManager.connect(subject).revokeCredential(credentialId)
      ).to.be.revertedWith("Only issuer can revoke");
    });
  });

  describe("Credential Access", function () {
    let credentialId;

    beforeEach(async function () {
      const tx = await credentialManager.connect(issuer).issueCredential(
        subject.address,
        "TestCredential",
        "QmTest123",
        0
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "CredentialIssued"
      );
      credentialId = event.args[0];
    });

    it("Should allow subject to view their credential", async function () {
      const cred = await credentialManager.connect(subject).getCredential(credentialId);
      expect(cred[0]).to.equal(subject.address);
    });

    it("Should allow issuer to view credential", async function () {
      const cred = await credentialManager.connect(issuer).getCredential(credentialId);
      expect(cred[0]).to.equal(subject.address);
    });

    it("Should allow verifier to view credential", async function () {
      const cred = await credentialManager.connect(verifier).getCredential(credentialId);
      expect(cred[0]).to.equal(subject.address);
    });
  });
});
