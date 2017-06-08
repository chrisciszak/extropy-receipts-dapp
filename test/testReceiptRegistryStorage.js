var ReceiptRegistry = artifacts.require("./ReceiptRegistry.sol");
const EthereumEventAssertions = require('../../ethereum-standard-contracts/test/javascript/ethereumEventAssertions.js');

contract('ReceiptRegistry Storage', function(accounts) {
    var receiptRegistryInstance;
    var deployingAccount = accounts[0];

    let storageId1 = 0;
    let storageId2 = 1;

    let receiptId1 = 'B11099930C69EFA2DE5E74A75404F5AC76BDEA19EAF271B68705DE7D015EA686';
    let imageHash1 = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
    let metadataHash1 = 'QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx';

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
            // Store a receipt
            return receiptRegistryInstance.storeReceipt(receiptId1, storageId1, imageHash1, metadataHash1, {from: receiptOwner1})
            .then( (result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ReceiptStored', {receiptOwner: receiptOwner1, receiptId: receiptId1, imageHash: imageHash1, metadataHash: metadataHash1});
            })
        })

        it('should be possible to store a reference to the details of the receipt twice', () => {
            // Store a receipt
            return receiptRegistryInstance.storeReceipt(receiptId1, storageId1, imageHash1, metadataHash1, {from: receiptOwner1})
            .then( (result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ReceiptStored', {receiptOwner: receiptOwner1, receiptId: receiptId1, imageHash: imageHash1, metadataHash: metadataHash1});
            })
        })

        it('should be possible to store updates to the metadata', () => {
            // Store a receipt
            return receiptRegistryInstance.storeReceipt(receiptId1, storageId1, imageHash1, metadataHash2, {from: receiptOwner1})
            .then( (result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ReceiptStored', {receiptOwner: receiptOwner1, receiptId: receiptId1, imageHash: imageHash1, metadataHash: metadataHash2});
            })
        })

        it('should be possible to store a reference to the details of multiple receipt in the contract', () => {
            // Store a receipt
            return receiptRegistryInstance.storeReceipt(receiptId2, storageId1, imageHash2, metadataHash2, {from: receiptOwner1})
            .then( (result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ReceiptStored', {receiptOwner: receiptOwner1, receiptId: receiptId2, imageHash: imageHash2, metadataHash: metadataHash2});
            })
        })

        it('should be possible for multiple users to store a reference to the details of a receipt that already exists in the contract', () => {
            // Store a receipt
            return receiptRegistryInstance.storeReceipt(receiptId1, storageId1, imageHash1, metadataHash1, {from: receiptOwner2})
            .then( (result) => {
                EthereumEventAssertions.assertEventContainedInformation(result, 'ReceiptStored', {receiptOwner: receiptOwner2, receiptId: receiptId1, imageHash: imageHash1, metadataHash: metadataHash1});
            })
        })
    });
});