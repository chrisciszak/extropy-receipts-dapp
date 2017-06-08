var ReceiptRegistry = artifacts.require("./ReceiptRegistry.sol");
const EthereumEventAssertions = require('../../ethereum-standard-contracts/test/javascript/ethereumEventAssertions.js');

var unregisterLogEventListener = function(filter) {
    filter.stopWatching();
}

contract('ReceiptRegistry', function(accounts) {
    var receiptRegistryInstance;
    var deployingAccount = accounts[0];

    before('Retrieve contract instances', () => {
        return ReceiptRegistry.deployed().then((instance) => {
            receiptRegistryInstance = instance;
        });
    });

    describe('Post-deployment sanity tests', () => {

        it('should be true that the owner of the contract is the deploying address', () => {
            return receiptRegistryInstance.owner()
            .then((owner) => {
                // Verify that account 0 is the owner of the contract.
                assert.equal(owner, deployingAccount, "Expected that the first account / coinbase was the contract owner.");
            });
        });


        it("should not be possible for an account other than the owners to change the owner of the contract", () => {
            var accountToAttemptToMakeOwner = accounts[3];

            return receiptRegistryInstance.owner()
            .then((owner) => {
                // Verify that account 0 is the owner of the contract.
                assert.equal(deployingAccount, owner, "Expected that the first account / coinbase was the contract owner.");

                return receiptRegistryInstance.changeOwner(accountToAttemptToMakeOwner, {from: accounts[1]});
            }).then((result) => {
                EthereumEventAssertions.assertNoEventsHappened(result);
                return receiptRegistryInstance.owner();
            }).then((owner) => {
                assert.equal(deployingAccount, owner, "Expected that the first account / coinbase was still the contract owner.");
            });
        });

        it("should be possible for the contract owners to change the owner of the contract to another address", () => {
            var newOwner = accounts[1];

            return receiptRegistryInstance.owner()
            then((owner) => {
                // Verify that account 0 is the owner of the contract.
                assert.equal(deployingAccount, owner, "Expected that the first account / coinbase was the contract owner.");

                return receiptRegistryInstance.changeOwner(newOwner);
            }).then((result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'OwnerChanged', {oldOwner: deployingAccount, newOwner: newOwner});
                return receiptRegistryInstance.owner();
            }).then((owner) => {
                assert.equal(newOwner, owner, "Expected that the new account, address, would now be the contract owner.");

                // Change the owner back to being the coinbase account
                return receiptRegistryInstance.changeOwner(deployingAccount, {from: newOwner});
            });
        });
    });

    describe('Mortal sanity tests', () => {

        let killableReceiptRegistryInstance;

        beforeEach('create kill-able instance', () => {
            return ReceiptRegistry.new({from: deployingAccount})
            .then((instance)=>{
                killableReceiptRegistryInstance = instance;
            });
        });

        it('should not be possible for a non-owner address to kill the contract', () => {
            return killableReceiptRegistryInstance.owner()
            then((owner) => {
                // Verify that account 0 is the owner of the contract.
                assert.equal(deployingAccount, owner, "Expected that the first account / coinbase was the contract owner.");

                return killableReceiptRegistryInstance.kill({from: accounts[1]});
            }).then((result) => {
                EthereumEventAssertions.assertNoEventsHappened(result);
                return killableReceiptRegistryInstance.owner();
            }).then((owner) => {
                assert.equal(deployingAccount, owner, "Expected that the first account / coinbase was still the contract owner.");
            });
        });

        it('should be possible for the owner to kill the contract', () => {
            return killableReceiptRegistryInstance.owner()
            .then((owner) => {
                // Verify that account 0 is the owner of the contract.
                assert.equal(deployingAccount, owner, "Expected that the first account / coinbase was the contract owner.");
                return killableReceiptRegistryInstance.kill();
            }).then((result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ContractTerminated', {contractAddress: killableReceiptRegistryInstance.address, msgSender: deployingAccount});
                return killableReceiptRegistryInstance.owner();
            }).then((owner) => {
                assert.equal('0x', owner, "Expected that the contract owner variable was empty now that the contract has been killed.");
            });
        });
    });
});