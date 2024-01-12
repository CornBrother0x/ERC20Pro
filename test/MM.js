// Importing necessary libraries and tools
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MM Contract Tests", function () {
  let MM;
  let mm;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Hook that runs before all tests: deploy the contract
  beforeEach(async function () {
    MM = await ethers.getContractFactory("MM");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    mm = await MM.deploy();
    await mm.deployed();
  });

  ///notes
  // Test #1: Check initial total supply
  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await mm.balanceOf(owner.address);
    expect(await mm.totalSupply()).to.equal(ownerBalance);
  });

  ///notes
  // Test #2: Transfer tokens between accounts
  it("Should transfer tokens between accounts", async function () {
    // Transfer 50 tokens from owner to addr1
    await mm.transfer(addr1.address, 50);
    expect(await mm.balanceOf(addr1.address)).to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    await mm.connect(addr1).transfer(addr2.address, 50);
    expect(await mm.balanceOf(addr2.address)).to.equal(50);
  });

  ///notes
  // Test #3: Cannot transfer more than balance
  it("Should fail if sender doesn’t have enough tokens", async function () {
    const initialOwnerBalance = await mm.balanceOf(owner.address);

    // Try to send 1 token from addr1 (0 tokens) to owner (10000 tokens).
    // `require` will evaluate false and revert the transaction.
    await expect(mm.connect(addr1).transfer(owner.address, 1)).to.be.reverted;

    // Owner balance shouldn't have changed.
    expect(await mm.balanceOf(owner.address)).to.equal(initialOwnerBalance);
  });

  ///notes
  // Test #4: Check balances after transfers
  it("Should update balances after transfers", async function () {
    const initialOwnerBalance = await mm.balanceOf(owner.address);

    // Transfer 100 tokens from owner to addr1.
    await mm.transfer(addr1.address, 100);

    // Transfer another 50 tokens from owner to addr2.
    await mm.transfer(addr2.address, 50);

    // Check balances
    const finalOwnerBalance = await mm.balanceOf(owner.address);
    expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

    const addr1Balance = await mm.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(100);

    const addr2Balance = await mm.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });

  ///notes
  // Test #5: Allowance and approve
  it("Should correctly set allowance and approve", async function () {
    await mm.approve(addr1.address, 100);
    expect(await mm.allowance(owner.address, addr1.address)).to.equal(100);
  });

  ///notes
  // Test #6: Transfer from another account
  it("Should transfer tokens using transferFrom", async function () {
    await mm.transfer(addr1.address, 100);
    await mm.connect(addr1).approve(owner.address, 50);
    await mm.connect(owner).transferFrom(addr1.address, addr2.address, 50);

    expect(await mm.balanceOf(addr2.address)).to.equal(50);
  });

  ///notes
  // Test #7: Cannot transfer more than allowed
  it("Should not allow to transfer more than allowance", async function () {
    await mm.transfer(addr1.address, 100);
    await mm.connect(addr1).approve(owner.address, 50);

    await expect(mm.connect(owner).transferFrom(addr1.address, addr2.address, 60)).to.be.reverted;
  });

  ///notes
  // Test #8: Burn tokens
  it("Should burn tokens correctly", async function () {
    const initialSupply = await mm.totalSupply();
    await mm.burn(100);

    const currentSupply = await mm.totalSupply();
    expect(currentSupply).to.equal(initialSupply - 100);
  });

  ///notes
  // Test #9: Check ownership transfer
  it("Should transfer ownership", async function () {
    await mm.transferOwnership(addr1.address);
    expect(await mm.owner()).to.equal(addr1.address);
  });

  ///notes
  // Test #10: Only owner can transfer ownership
  it("Should only allow owner to transfer ownership", async function () {
    await expect(mm.connect(addr1).transferOwnership(addr2.address)).to.be.reverted;
  });
});
