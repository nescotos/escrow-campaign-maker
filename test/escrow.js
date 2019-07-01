const Escrow = artifacts.require("Escrow");
const {catchRevert} = require('./exceptionHelpers');


contract("Escrow", accounts => {
  const creator = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];

  let instance;
  
  const AMOUNT = 2000;
  
  beforeEach(async () => {
    instance = await Escrow.new();
  });
  
  describe('Contract Setup', async () => {

    it('should set Owner Property to the deploying address', async() => {
      const owner = await instance.owner();
      assert.equal(owner, creator, 'the deploying address should match the owner');
    });

    it('should not have any escrow created when deployed', async() => {
      const currentEscrow = await instance.currentEscrow();
      assert.equal(currentEscrow.toNumber(), 0, 'the just deployed contract should not have any escrow inside it');
    });
  });

  describe('Contract Functionality', () => {
    describe('Escrow Creation', () => {
      it('the buyer should be able to create a new escrow with a minimum of 100 weis', async () => {
        const receipt = await instance.addEscrow.call(bob, { from: alice, value: 100 });
        assert.equal(receipt.toNumber(), 1, 'the escrow should be created');
      });

      it('the buyer should no be able to create a new escrow with a value less than 100 weis', async() => {
        await catchRevert(instance.addEscrow(bob, { from: alice, value: 99}));
      });

      it('should match the information in getEscrow()', async () => {
        await instance.addEscrow(bob, { from: alice, value: AMOUNT });
        const escrow = await instance.getEscrow.call(1);
        assert.equal(escrow['0'], alice, 'the buyer should match');
        assert.equal(escrow['1'], bob, 'the seller should match');
        assert.equal(escrow['2'], AMOUNT, 'the value should match');
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
        await instance.addEscrow(bob, { from: alice, value: AMOUNT });
        await instance.vote(1, true, {from: alice});
        await instance.vote(1, false, {from: bob});
        const escrow = await instance.getEscrow(1);
        assert.equal(escrow['3'], true, 'the buyerAgreement should match the vote');
        assert.equal(escrow['4'], false, 'the sellerAgreement should match the vote');
        assert.equal(escrow['5'], true, 'the buyerVote should be true after voting');
        assert.equal(escrow['6'], true, 'the sellerVote should be true after voting');
        assert.equal(escrow['7'], false, 'the isOpen should be false after voting');
      });
      it('should not allow to vote addresses that are not buyer/seller', async() => {
        await instance.addEscrow(bob, { from: alice, value: AMOUNT });
        await catchRevert(instance.vote(0, {from: accounts[3]}));
      });
    });

    describe('Escrow Payment', () => {
      describe('should not allow the seller to withdraw', () => {
        it('the escrow did not meet the conditions', async() => {
          await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          await instance.vote(1, false, {from: alice});
          await instance.vote(1, true, {from: bob});
          await catchRevert(instance.withdraw(1, {from: bob}));
        });
        it('is not the seller', async() => {
          await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          await instance.vote(1, false, {from: alice});
          await instance.vote(1, true, {from: bob});
          await catchRevert(instance.withdraw(1, {from: accounts[4]}));
        });
        it('the escrow is open', async() => {
          await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          await catchRevert(instance.withdraw(1, { from: bob }));
        });
        it('the escrow is already withdrawn', async() => {
          await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          await instance.vote(1, true, { from: alice });
          await instance.vote(1, true, { from: bob })
          await instance.withdraw(1, {from: bob});
          await catchRevert(instance.withdraw(1, { from: bob }));
        });
      });

      describe('should allow the owner to transfer if', () => {
        it('the escrow did meet the conditions', async() => {
          await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          await instance.vote(1, true, { from: alice });
          await instance.vote(1, true, { from: bob });
          await catchRevert(instance.transferWhenBlocked(1, bob, {from: creator}));
        });
        it('the escrow is open', async() => {
          const receipt = await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          await catchRevert(instance.transferWhenBlocked(receipt, alice, {from: creator}));
        });
        it('the address provided is not buyer nor seller', async() => {
          const receipt = await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          await instance.vote(receipt, false, { from: alice });
          await instance.vote(receipt, true, { from: bob });
          await catchRevert(instance.transferWhenBlocked(receipt, accounts[5], { from: creator }));
        });
      });

      describe('should allow the seller to withdraw if', () => {
        it('the scrow met the conditions', async() => {
          const receipt = await instance.addEscrow(bob, { from: alice, value: AMOUNT });
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
          const receipt = await instance.addEscrow(bob, { from: alice, value: AMOUNT });
          const aliceBalance = await web3.eth.getBalance(alice);
          await instance.vote(receipt, false, { from: alice });
          await instance.vote(receipt, true, { from: bob });
          const aliceBalanceAfter = await web3.eth.getBalance(alice);
          await instance.transferWhenBlocked(receipt, alice, { from: creator });
          assert.isAbove(Number(aliceBalanceAfter), Number(aliceBalance), "alice's balance should be increased");
        });
      });
    });

    describe('Events', () => {
      it('should emit an event when a new escrow is created', async() => {
        const amount = 100;
        const receipt = await instance.addEscrow(bob, { from: alice, value: amount });
        const expectedBuyer = receipt.logs[0].args.buyerAddress;
        const expectedSeller = receipt.logs[0].args.sellerAddress;
        const expectedAmount = receipt.logs[0].args.amount.toNumber();
        assert.equal(alice, expectedBuyer, "LogEscrowCreated event buyerAddress not emitted correctly");
        assert.equal(bob, expectedSeller, "LogEscrowCreated event sellerAddress not emitted correctly");
        assert.equal(amount, expectedAmount, "LogEscrowCreated event amount not emitted correctly");
      });

      it('should emit an event when a vote happens', async() => {
        const receipt = await instance.addEscrow(bob, { from: alice, value: AMOUNT });
        const buyerVote = await instance.vote(receipt, true, { from: alice });
        let expectedAddress = buyerVote.logs[0].args.address;
        let expectedVote = buyerVote.logs[0].args.vote;
        let expectedId = buyerVote.logs[0].args.id.toNumber();
        assert.equal(alice, expectedAddress, "LogVote event address not emitted correctly");
        assert.equal(expectedVote, true, "LogVote event vote not emitted correctly");
        assert.equal(expectedId, receipt, "LogVote event id not emitted correctly");
        const sellerVote = await instance.vote(receipt, false, { from: bob });
        expectedAddress = sellerVote.logs[0].args.address;
        expectedVote = sellerVote.logs[0].args.vote;
        expectedId = sellerVote.logs[0].args.id.toNumber();
        assert.equal(bob, expectedAddress, "LogVote event address not emitted correctly");
        assert.equal(expectedVote, false, "LogVote event vote not emitted correctly");
        assert.equal(expectedId, receipt, "LogVote event id not emitted correctly");        
      });

      it('should emit an event when a withdraw happens', async() => {
        const receipt = await instance.addEscrow(bob, { from: alice, value: AMOUNT });
        await instance.vote(receipt, true, { from: alice });
        await instance.vote(receipt, true, { from: bob })
        const results = await instance.withdraw(receipt, { from: bob });
        const expectedAddress = results.logs[0].args.address;
        const expectedAmount = results.logs[0].args.amount.toNumber();
        const expectedId = results.logs[0].args.id.toNumber();
        assert.equal(bob, expectedAddress, "LogWithdraw event address not emitted correctly");
        assert.equal(expectedAmount, AMOUNT, "LogWithdraw event amount not emitted correctly");
        assert.equal(expectedId, receipt, "LogWithdraw event id not emitted correctly");  
      });

      it('should emit an event when the creator transfer the amount', async() => {
        const receipt = await instance.addEscrow(bob, { from: alice, value: AMOUNT });
        await instance.vote(receipt, false, { from: alice });
        await instance.vote(receipt, true, { from: bob });
        const results = await instance.transferWhenBlocked(receipt, alice, { from: creator });
        const expectedAddress = results.logs[0].args.address;
        const expectedAmount = results.logs[0].args.amount.toNumber();
        const expectedId = results.logs[0].args.id.toNumber();
        assert.equal(alice, expectedAddress, "LogTransfer event address not emitted correctly");
        assert.equal(expectedAmount, AMOUNT, "LogTransfer event amount not emitted correctly");
        assert.equal(expectedId, receipt, "LogTransfer event id not emitted correctly");  
      });
    });

    describe('Design Pattern', () => {
      it('should have a public accesible variable to handle circuit breaker pattern initialized on false', async () => {
        const stopped = await instance.stopped();
        assert.equal(stopped, false, 'stopped should be false');
      });

      it('only creator should be able to change the stopped variable', async () => {
        await instance.setStopped(true, {from: creator});
        const stopped = await instance.stopped();
        assert.equal(stopped, true, 'stopped should be true');
        await catchRevert(instance.setStopped(true, {from: alice}));
      });

      it('should disallow Escrow creation when stopped', async () => {
        await catchRevert(instance.addEscrow(bob, { from: alice, value: AMOUNT }));
      });
    }); 
    
  });
});
