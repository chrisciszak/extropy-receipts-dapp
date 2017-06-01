var ReceiptRegistry = artifacts.require("./ReceiptRegistry.sol");
const EthereumEventAssertions = require('../../ethereum-standard-contracts/test/javascript/ethereumEventAssertions.js');

contract('ReceiptRegistry', function(accounts) {
    var receiptRegistryInstance;
    var deployingAccount = accounts[0];

    let receiptId1 = 'FBC1A9F858EA9E177916964BD88C3D37B91A1E84412765E29950777F265C4B75';
    let imageHash1 = 'CC292B92CE7F10F2E4F727ECDF4B12528127C51B6DDF6058E213674603190D06';
    let metadataHash1 = '453EBD911BB5D941B3C9E0AFD4A74DBBF7485212528FACEA7FB74396F16A2315';

    let receiptId2 = 'ABC1A9F858EA9E177916964BD88C3D37B91A1E84412765E29950777F265C4B75';
    let imageHash2 = 'AC292B92CE7F10F2E4F727ECDF4B12528127C51B6DDF6058E213674603190D06';
    let metadataHash2 = 'A53EBD911BB5D941B3C9E0AFD4A74DBBF7485212528FACEA7FB74396F16A2315';

    let receiptId3 = 'BBC1A9F858EA9E177916964BD88C3D37B91A1E84412765E29950777F265C4B75';
    let imageHash3 = 'BC292B92CE7F10F2E4F727ECDF4B12528127C51B6DDF6058E213674603190D06';
    let metadataHash3 = 'B53EBD911BB5D941B3C9E0AFD4A74DBBF7485212528FACEA7FB74396F16A2315';

    let receiptOwner1 = accounts[1];
    let receiptOwner2 = accounts[2];

    before('Retrieve contract instances', () => {
        return ReceiptRegistry.deployed().then((instance) => {
            receiptRegistryInstance = instance;
        });
    });

    describe('Create tests', () => {
        it('should be possible to store a reference to the details of the receipt in the contract', () => {
            return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} )
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 0, 'Expected that initially that there would not be a receipts stored');

                // Store a receipt
                return receiptRegistryInstance.storeReceipt(receiptId1, imageHash1, metadataHash1, {from: receiptOwner1});
            })
            .then( () => {
                return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} );
            })
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 1, 'Expected that the newly stored receipt would be reflected');
            })
        })

        it('should not be possible to re-store a reference to the details of the receipt in the contract', () => {
            return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} )
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 1, 'Expected that initially that there would not be a receipts stored');

                // Store a receipt
                return receiptRegistryInstance.storeReceipt(receiptId1, imageHash1, metadataHash1, {from: receiptOwner1});
            })
            .then( (result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ReceiptStored', {receiptOwner: receiptOwner1});
                return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} );
            })
            .then( (numReceipts) => {
                assert.fail('Expected that an exception would be thrown');
            })
            .catch( (err) => {
                assert.notEqual(null, err);
            })
        })

        it('should be possible for the same owner to store multiple reference to unique details of receipts in the contract', () => {
            return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} )
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 1, 'Expected that a receipt from this owner would have been stored in a previous test');

                // Store a receipt
                return receiptRegistryInstance.storeReceipt(receiptId2, imageHash2, metadataHash2, {from: receiptOwner1});
            })
            .then( (result1) => {
                EthereumEventAssertions.assertEventContainedInformation(result1, 'ReceiptStored', {receiptOwner: receiptOwner1});
                // Store a receipt
                return receiptRegistryInstance.storeReceipt(receiptId3, imageHash3, metadataHash3, {from: receiptOwner1});
            })
            .then( (result2) => {
                EthereumEventAssertions.assertEventContainedInformation(result2, 'ReceiptStored', {receiptOwner: receiptOwner1});
                return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner1} );
            })
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 3, 'Expected that the newly stored receipt would be reflected');
            })
        })

        it('should be possible for different owners to store a the same reference to details of a receipt in the contract', () => {
            return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner2} )
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 0, 'Expected that initially that there would not be a receipts stored');

                // Store a receipt
                return receiptRegistryInstance.storeReceipt(receiptId1, imageHash1, metadataHash1, {from: receiptOwner2});
            })
            .then( (result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ReceiptStored', {receiptOwner: receiptOwner2});
                return receiptRegistryInstance.retrieveNumReceiptsStored( {from: receiptOwner2} );
            })
            .then( (numReceipts) => {
                assert.equal(numReceipts.toNumber(), 1, 'Expected that the newly stored receipt would be reflected');
            })
        })
    });

});