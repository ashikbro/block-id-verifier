const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityRegistry", function () {
  let identityRegistry;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = await IdentityRegistry.deploy();
    await identityRegistry.waitForDeployment();
  });

  describe("Identity Creation", function () {
    it("Should create a new identity", async function () {
      const ipfsHash = "QmTest123";
      await expect(identityRegistry.connect(user1).createIdentity(ipfsHash))
        .to.emit(identityRegistry, "IdentityCreated")
        .withArgs(user1.address, ipfsHash, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      expect(await identityRegistry.identityExists(user1.address)).to.be.true;
    });

    it("Should not allow creating duplicate identity", async function () {
      await identityRegistry.connect(user1).createIdentity("QmTest123");
      await expect(
        identityRegistry.connect(user1).createIdentity("QmTest456")
      ).to.be.revertedWith("Identity already exists");
    });

    it("Should not allow empty IPFS hash", async function () {
      await expect(
        identityRegistry.connect(user1).createIdentity("")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
  });

  describe("Identity Updates", function () {
    beforeEach(async function () {
      await identityRegistry.connect(user1).createIdentity("QmTest123");
    });

    it("Should update existing identity", async function () {
      const newHash = "QmTest456";
      await expect(identityRegistry.connect(user1).updateIdentity(newHash))
        .to.emit(identityRegistry, "IdentityUpdated");

      const hash = await identityRegistry.connect(user1).getIdentity(user1.address);
      expect(hash).to.equal(newHash);
    });

    it("Should not update non-existent identity", async function () {
      await expect(
        identityRegistry.connect(user2).updateIdentity("QmTest456")
      ).to.be.revertedWith("Identity does not exist");
    });
  });

  describe("Authorization", function () {
    beforeEach(async function () {
      await identityRegistry.connect(user1).createIdentity("QmTest123");
    });

    it("Should authorize viewer", async function () {
      await expect(identityRegistry.connect(user1).authorizeViewer(user2.address))
        .to.emit(identityRegistry, "ViewerAuthorized")
        .withArgs(user1.address, user2.address);

      expect(await identityRegistry.isAuthorized(user1.address, user2.address)).to.be.true;
    });

    it("Should revoke viewer", async function () {
      await identityRegistry.connect(user1).authorizeViewer(user2.address);
      await expect(identityRegistry.connect(user1).revokeViewer(user2.address))
        .to.emit(identityRegistry, "ViewerRevoked");

      expect(await identityRegistry.isAuthorized(user1.address, user2.address)).to.be.false;
    });

    it("Should allow authorized viewer to get identity", async function () {
      await identityRegistry.connect(user1).authorizeViewer(user2.address);
      const hash = await identityRegistry.connect(user2).getIdentity(user1.address);
      expect(hash).to.equal("QmTest123");
    });

    it("Should not allow unauthorized viewer to get identity", async function () {
      await expect(
        identityRegistry.connect(user2).getIdentity(user1.address)
      ).to.be.revertedWith("Not authorized to view this identity");
    });
  });
});
