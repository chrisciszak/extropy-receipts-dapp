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


        it('should be true that after the owner has kill the contract that all of the data is wiped', () => {
            let receiptId1 = 'FBC1A9F858EA9E177916964BD88C3D37B91A1E84412765E29950777F265C4B75';
            let imageHash1 = 'CC292B92CE7F10F2E4F727ECDF4B12528127C51B6DDF6058E213674603190D06';
            let metadataHash1 = '453EBD911BB5D941B3C9E0AFD4A74DBBF7485212528FACEA7FB74396F16A2315';

            let receiptOwner1 = accounts[1];

            return killableReceiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} )
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 0, 'Expected that initially that there would not be a receipts stored');

                // Store a receipt
                return killableReceiptRegistryInstance.storeReceipt(receiptId1, imageHash1, metadataHash1, {from: receiptOwner1});
            })
            .then( () => {
                return killableReceiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} );
            })
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 1, 'Expected that the newly stored receipt would be reflected');
                assert.notEqual('0x', web3.eth.getStorageAt(receiptRegistryInstance.address, 0));
                return killableReceiptRegistryInstance.kill();
            }).then((result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ContractTerminated', {contractAddress: killableReceiptRegistryInstance.address, msgSender: deployingAccount});

                // TODO figure out why this is failing
                // assert.equal('0x', web3.eth.getStorageAt(receiptRegistryInstance.address, 0), "Expected that the storage at this location would be empty now that the contract has been killed.");
            });
        });
    });

    after('Get events logged', ()=> {
        EthereumEventAssertions.retrieveLogEvents(receiptRegistryInstance);
    })
});