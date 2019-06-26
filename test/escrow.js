const Escrow = artifacts.require("Escrow");
const {catchRevert} = require('./exceptionHelpers');
const BN = web3.utils.BN
contract("Escrow", accounts => {
  const creator = accounts[0];
  const alice = accounts[1];
  const bob = accounts[1];

  let instance;

  beforeEach(async() => {  
    instance = await Escrow.new();
  });

  describe('Contract Setup', async () => {
    it('should set Owner Property to the deploying address', async() => {
      const owner = await instance.owner();
      assert.equal(owner, creator, 'the deploying address should match the owner');
    });

    it('should not have any escrow created when deployed', async() => {
      const currentEscrow = await instance.currentEscrow();
      assert.equal(currentEscrow, 0, 'the just deployed contract should not have any escrow inside it');
    });
  });

  describe('Contract Functionality', () => {
    describe('Escrow Creation', () => {
      it('the buyer should be able to create a new escrow with a minimum of 100 weis', async () => {
        const receipt = await instance.addEscrow(bob, 100, {from: alice});
        assert.equal(receipt, 0, 'the escrow should be created');
      });

      it('the buyer should no be able to create a new escrow with a value less than 100 weis', async() => {
        await catchRevert(instance.addEscrow(bob, 99, { from: alice }));
      });

      it('should match the information in getEscrow()', async () => {
        const escrow = await instance.getEscrow(0);
        assert.equal(escrow['0'], alice, 'the buyer should match');
        assert.equal(escrow['1'], bob, 'the seller should match');
        assert.equal(escrow['2'], 100, 'the value should match');
        assert.equal(escrow['3'], false, 'the buyerAgreement should be false at the beginning');
        assert.equal(escrow['4'], false, 'the sellerAgreement should be false at the beginning');
        assert.equal(escrow['5'], false, 'the buyerVote should be false at the beginning');
        assert.equal(escrow['6'], false, 'the sellerVote should be false at the beginning');
        assert.equal(escrow['7'], true, 'the isOpen should be true at the beginning');
        assert.equal(escrow['8'], false, 'the isWithdraw should be false at the beginning');
      });
    });

    describe('Escrow Interaction', () => {
      it('should allow the buyer and seller to vote, the escrow should be closed when buyer/seller voted', async() => {
        await instance.vote(0, true, {from: alice});
        await instance.vote(0, false, {from: bob});
        const escrow = await instance.getEscrow(0);
        assert.equal(escrow['3'], true, 'the buyerAgreement should match the vote');
        assert.equal(escrow['4'], false, 'the sellerAgreement should match the vote');
        assert.equal(escrow['5'], true, 'the buyerVote should be true after voting');
        assert.equal(escrow['6'], true, 'the sellerVote should be true after voting');
        assert.equal(escrow['7'], false, 'the isOpen should be false after voting');
      });
    });

    describe('Escrow Payment', () => {
      describe('should not allow the seller to withdraw', () => {
        it('the escrow did not meet the conditions', async() => {
          const receipt = await instance.add(bob, 2000);
          await instance.vote(receipt, false, {from: alice});
          await instance.vote(receipt, true, {from: bob});
          await catchRevert(instance.withdraw(receipt, {from: bob}));
        });
        it('the escrow is open', async() => {
          const receipt = await instance.add(bob, 2000)
          await catchRevert(instance.withdraw(receipt, { from: bob }));
        });
        it('the escrow is already withdrawn', async() => {
          const receipt = await instance.add(bob, 2000);
          await instance.vote(receipt, true, { from: alice });
          await instance.vote(receipt, true, { from: bob })
          await instance.withdraw(receipt, {from: bob});
          await catchRevert(instance.withdraw(receipt, { from: bob }));
        });
      });

      describe('should now allow the owner to transfer if', () => {
        it('the escrow did meet the conditions', async() => {
          const receipt = await instance.add(bob, 2000);
          await instance.vote(receipt, true, { from: alice });
          await instance.vote(receipt, true, { from: bob });
          await catchRevert(instance.transferWhenBlocked(receipt, bob, {from: creator}));
        });
        it('the escrow is open', async() => {
          const receipt = await instance.add(bob, 2000);
          await catchRevert(instance.transferWhenBlocked(receipt, alice, {from: creator}));
        });
        it('the address provided is not buyer nor seller', async() => {
          const receipt = await instance.add(bob, 2000);
          await instance.vote(receipt, false, { from: alice });
          await instance.vote(receipt, true, { from: bob });
          await catchRevert(instance.transferWhenBlocked(receipt, accounts[5], { from: creator }));
        });
      });

      describe('should allow the seller to withdraw if', () => {
        it('the scrow met the conditions', async() => {
          const receipt = await instance.add(bob, 2000);
          const bobBalance = await web3.eth.getBalance(bob);
          await instance.vote(receipt, true, { from: alice });
          await instance.vote(receipt, true, { from: bob });
          await instance.withdraw(receipt, {from: bob});
          const bobBalanceAfter = await web3.eth.getBalance(bob);
          assert.isAbove(Number(bobBalanceAfter), Number(bobBalance), "bob's balance should be increased");
        });
      });

      describe('should allow the creator to transfer if', () => {
        it('the scrow did not meet the conditions', async() => {
          const receipt = await instance.add(bob, 2000);
          const aliceBalance = await web3.eth.getBalance(alice);
          await instance.vote(receipt, false, { from: alice });
          await instance.vote(receipt, true, { from: bob });
          const aliceBalanceAfter = await web3.eth.getBalance(alice);
          await instance.transferWhenBlocked(receipt, alice, { from: creator });
          assert.isAbove(Number(aliceBalanceAfter), Number(aliceBalance), "alice's balance should be increased");
        });
      });
    });
    
  });
});
