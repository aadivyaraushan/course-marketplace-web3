// You can use files without explicitly importing them in testing files.
// Truffle uses the mocha testing framework for its tests and chai for assertions
const CourseMarketplace = artifacts.require("CourseMarketplace");
const { catchRevert } = require("./utils/exceptions.js");

const getGas = async (result) => {
  const tx = await web3.eth.getTransaction(result.tx);
  const gasUsed = web3.utils.toBN(result.receipt.gasUsed);
  const gasPrice = web3.utils.toBN(tx.gasPrice);
  return gasUsed.mul(gasPrice);
};

contract("CourseMarketplace", (accounts) => {
  const courseId = "0x00000000000000000000000000003131";
  const proof =
    "0x0000000000000000000000000000313000000000000000000000000000003130";
  const value = "900000000";
  const courseId2 = "0x00000000000000000000000000003130";
  const proof2 =
    "0x0000000000000000000000000000213000000000000000000000000000002130";
  let _contract = null;
  let contractOwner = null;
  let buyer = null;
  let courseHash = null;

  let courseHash2 = null;

  before(async () => {
    // function to prepare the environment for testing
    _contract = await CourseMarketplace.deployed();
    contractOwner = accounts[0];
    buyer = accounts[1];

    // console.log(_contract);
    // console.log(contractOwner);
    // console.log(buyer);
  });

  describe("Purchase of new course", () => {
    // describe wraps groups of tests related to one feature'
    before(async () => {
      await _contract.purchaseCourse(courseId, proof, { from: buyer, value });
    });

    it("should be able to receive the purchased course hash by its index", async function () {
      courseHash = await _contract.getCourseHash(0); // index 0 is used because after purchasing only one course the 0th course would be the course purchased.
      // console.log("course hash received: ", courseHash);
      const expectedHash = web3.utils.soliditySha3(
        { type: "bytes16", value: courseId },
        { type: "address", value: buyer }
      );

      assert.equal(
        courseHash,
        expectedHash,
        "Course hash is not matching the expected one!"
      );
    });

    it("purchase data of the course purchased by the buyer should be valid", async () => {
      const course = await _contract.getCourseByHash(courseHash);

      assert.equal(course.id, 0, "Course index should be zero.");
      assert.equal(course.state, 0, "Course state should be purchased.");
      assert.equal(course.owner, buyer, "Course should be owned by buyer");
      assert.equal(
        course.price,
        value,
        `Course should have a price of ${value} wei`
      );
      assert.equal(course.proof, proof, `Course proof should be ${proof}`);
    });

    it("should not allow repurchase of already owned course by buyer", async () => {
      await catchRevert(
        _contract.purchaseCourse(courseId, proof, { from: buyer })
      );
    });
  });

  describe("Activation of course", () => {
    // before(async () => {
    // })

    it("should not allow activation by non-contract owner", async function () {
      catchRevert(_contract.activateCourse(courseHash, { from: buyer }));
    });

    it("should have 'activated' state", async function () {
      await _contract.activateCourse(courseHash, { from: contractOwner });
      const course = await _contract.getCourseByHash(courseHash);
      assert.equal(course.state, 1, "Course state should be activated");
    });
  });

  describe("Transfer ownership", () => {
    let currentOwner = null;
    before(async () => {
      currentOwner = await _contract.getContractOwner();
    });

    it("getContractOwner should return deployer address", async () => {
      assert.equal(
        contractOwner,
        currentOwner,
        "getContractOwner does not return deployer's address"
      );
    });

    it("should allow owner to transfer ownership to non-owner", async () => {
      await _contract.transferOwnership(buyer, { from: currentOwner });
      const owner = await _contract.getContractOwner();
      assert.equal(owner, buyer, "Ownership was not transferred");
    });

    it("should not allow owner to transfer ownership to themselves", async () => {
      await catchRevert(_contract.transferOwnership(buyer, { from: buyer }));
    });

    it("should not allow non-owner to transfer ownership", async () => {
      await catchRevert(
        _contract.transferOwnership(accounts[3], { from: accounts[4] })
      );
    });

    it("should allow to transfer ownership back to initial contract owner", async () => {
      await _contract.transferOwnership(contractOwner, { from: buyer });
      const owner = await _contract.getContractOwner();
      assert.equal(owner, contractOwner, "Ownership was not transferred back");
    });
  });

  describe("Deactivate course", () => {
    before(async () => {
      await _contract.purchaseCourse(courseId2, proof2, { from: buyer, value });
      courseHash2 = await _contract.getCourseHash(1);
    });

    it("should not allow deactivation by non-contract owner", async () => {
      await catchRevert(
        _contract.deactivateCourse(courseHash2, { from: buyer })
      );
    });

    it("should allow deactivation by the owner", async () => {
      const ownerBalanceBeforeTransaction = await web3.eth.getBalance(
        contractOwner
      );
      const buyerBalanceBeforeTransaction = await web3.eth.getBalance(buyer);
      const contractBalanceBeforeTransaction = await web3.eth.getBalance(
        _contract.address
      );
      const result = await _contract.deactivateCourse(courseHash2, {
        from: contractOwner,
      });
      const course = await _contract.getCourseByHash(courseHash2);
      const ownerBalanceAfterTransaction = await web3.eth.getBalance(
        contractOwner
      );
      const buyerBalanceAfterTransaction = await web3.eth.getBalance(buyer);
      const contractBalanceAfterTransaction = await web3.eth.getBalance(
        _contract.address
      );
      const gas = await getGas(result);
      assert.equal(course.state, 2, "Course state is not deactivated");
      assert.equal(course.price, 0, "Course price is not zero");
      assert.equal(
        web3.utils.toBN(ownerBalanceBeforeTransaction).sub(gas).toString(),
        ownerBalanceAfterTransaction,
        "Owner balance after transaction is not correct"
      );
      assert.equal(
        web3.utils
          .toBN(buyerBalanceBeforeTransaction)
          .add(web3.utils.toBN(value))
          .toString(),
        buyerBalanceAfterTransaction,
        "Buyer balance after transaction is not correct"
      );
      assert.equal(
        web3.utils
          .toBN(contractBalanceBeforeTransaction)
          .sub(web3.utils.toBN(value))
          .toString(),
        contractBalanceAfterTransaction,
        "Contract balance after transaction is not correct"
      );
    });

    it("should not allow reactivation of deactivated course", async () => {
      await catchRevert(
        _contract.activateCourse(courseHash2, { from: contractOwner })
      );
    });
  });

  describe("Repurchase course", () => {
    it("should not allow to repurchase course that is not created", async () => {
      await catchRevert(
        _contract.repurchaseCourse(
          "0x0ef9d8f8804d174666011a394cab7901679a8944d24249fd148a6a36071151f8",
          { from: buyer }
        )
      );
    });

    it("should not allow to repurchase course when sender is not course owner", async () => {
      await catchRevert(
        _contract.repurchaseCourse(courseHash2, { from: accounts[2] })
      );
    });

    it("should allow original buyer to repurchase", async () => {
      const buyerBalanceBeforeTransaction = await web3.eth.getBalance(buyer);
      const contractBalanceBeforeTransaction = await web3.eth.getBalance(
        _contract.address
      );
      const result = await _contract.repurchaseCourse(courseHash2, {
        from: buyer,
        value,
      });
      const course = await _contract.getCourseByHash(courseHash2);
      const buyerBalanceAfterTransaction = await web3.eth.getBalance(buyer);
      const contractBalanceAfterTransaction = await web3.eth.getBalance(
        _contract.address
      );
      const gas = await getGas(result);
      assert.equal(course.state, 0, "Course state is not purchased");
      assert.equal(course.price, value, "Course price is not original price");
      assert.equal(
        web3.utils
          .toBN(buyerBalanceBeforeTransaction)
          .sub(web3.utils.toBN(value))
          .sub(gas)
          .toString(),
        buyerBalanceAfterTransaction,
        "Client balance after transaction is not correct"
      );
      assert.equal(
        web3.utils
          .toBN(contractBalanceBeforeTransaction)
          .add(web3.utils.toBN(value))
          .toString(), // gas price wouldn't be here because gas goes to the miner
        contractBalanceAfterTransaction,
        "Contract balance after transaction is not correct"
      );
    });

    it("should not allow to repurchase purchased course", async () => {
      await catchRevert(
        _contract.repurchaseCourse(courseHash2, { from: buyer, value })
      );
    });
  });

  describe("Receive funds", () => {
    it("should allow sending funds to contract", async () => {
      const balanceBeforeTx = await web3.eth.getBalance(_contract.address);

      await web3.eth.sendTransaction({
        from: buyer,
        to: _contract.address,
        value: "100000000000000000",
      });

      const balanceAfterTx = await web3.eth.getBalance(_contract.address);

      assert.equal(
        web3.utils
          .toBN(balanceBeforeTx)
          .add(web3.utils.toBN("100000000000000000"))
          .toString(),
        balanceAfterTx,
        "Balance after transaction does not match the expected value!"
      );
    });
  });

  describe("Normal withdraw", () => {
    const fundsToDeposit = "100000000000000000";
    const fundsToWithdraw = "10000000000000000";
    const overLimitFunds = "999900000000000000000";
    let currentOwner;

    before(async () => {
      currentOwner = await _contract.getContractOwner();
      await web3.eth.sendTransaction({
        from: buyer,
        to: _contract.address,
        value: fundsToDeposit,
      });
    });

    it("should not allow withdrawing from non-owner address", async () => {
      await catchRevert(_contract.withdraw(fundsToWithdraw, { from: buyer }));
    });

    it("should not allow withdrawing over limit", async () => {
      await catchRevert(
        _contract.withdraw(overLimitFunds, { from: currentOwner })
      );
    });

    it("should allow withdrawing from owner address", async () => {
      const balanceBeforeTx = await web3.eth.getBalance(currentOwner);
      const result = await _contract.withdraw(fundsToWithdraw, {
        from: currentOwner,
      });
      const balanceAfterTx = await web3.eth.getBalance(currentOwner);
      const gas = await getGas(result);

      assert.strictEqual(
        web3.utils
          .toBN(balanceBeforeTx)
          .add(web3.utils.toBN(fundsToWithdraw))
          .sub(gas)
          .toString(),
        balanceAfterTx,
        "Owner balance after withdraw does not match!"
      );
    });
  });

  describe("Emergency withdraw", () => {
    let currentOwner;
    before(async () => {
      currentOwner = await _contract.getContractOwner();
    });

    it("should not allow emergency withdraw when the contract is not stopped", async () => {
      await catchRevert(_contract.emergencyWithdraw({ from: currentOwner }));
    });

    it("should not allow emergency withdraw by non-owner", async () => {
      await _contract.stopContract({ from: currentOwner });
      await catchRevert(_contract.emergencyWithdraw({ from: buyer }));
    });

    it("should allow emergency withdraw by owner", async () => {
      await _contract.stopContract({ from: currentOwner });
      const contractBalanceBeforeTx = await web3.eth.getBalance(
        _contract.address
      );
      const ownerBalanceBeforeTx = await web3.eth.getBalance(currentOwner);
      const result = await _contract.emergencyWithdraw({ from: contractOwner });
      const ownerBalanceAfterTx = await web3.eth.getBalance(currentOwner);
      const contractBalanceAfterTransaction = await web3.eth.getBalance(
        _contract.address
      );
      const gas = await getGas(result);

      assert.strictEqual(
        web3.utils
          .toBN(ownerBalanceBeforeTx)
          .add(web3.utils.toBN(contractBalanceBeforeTx))
          .sub(gas)
          .toString(),
        ownerBalanceAfterTx
      );

      assert.strictEqual(contractBalanceAfterTransaction, "0");
    });

    after(async () => {
      await _contract.resumeContract({ from: currentOwner });
      await web3.eth.sendTransaction({
        from: currentOwner,
        to: _contract.address,
        value: "100000000000000000",
      });
    });
  });

  describe("Self destruct", () => {
    let currentOwner;

    before(async () => {
      currentOwner = await _contract.getContractOwner();
    });

    it("should not allow self destruct when contract is not stopped", async () => {
      await catchRevert(_contract.selfDestruct({ from: currentOwner }));
    });

    it("should not allow self destruct by non-owner", async () => {
      await catchRevert(_contract.selfDestruct({ from: buyer }));
    });

    it("should have +contract funds on owner", async () => {
      await _contract.stopContract({ from: currentOwner });
      const contractBalanceBeforeTx = await web3.eth.getBalance(
        _contract.address
      );
      const ownerBalanceBeforeTx = await web3.eth.getBalance(currentOwner);
      const result = await _contract.selfDestruct({ from: contractOwner });
      const ownerBalanceAfterTx = await web3.eth.getBalance(currentOwner);
      _contract.address;
      const gas = await getGas(result);

      assert.strictEqual(
        web3.utils
          .toBN(ownerBalanceBeforeTx)
          .add(web3.utils.toBN(contractBalanceBeforeTx))
          .sub(gas)
          .toString(),
        ownerBalanceAfterTx
      );
    });

    it("should make contract balance 0", async () => {
      const contractBalance = await web3.eth.getBalance(_contract.address);

      assert.strictEqual(contractBalance, "0", "Contract balance is not zero");
    });

    it("should have 0x bytecode", async () => {
      const code = await web3.eth.getCode(_contract.address);

      assert.strictEqual(code, "0x", "Contract is not destroyed");
    });
  });
});
