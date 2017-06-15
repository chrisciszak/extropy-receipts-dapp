const ReceiptDao = require('../../app/javascripts/receiptDao.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

const assert = require('chai').assert;

const contract = require('truffle-contract');
const Web3 = require('web3');

const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
var ReceiptRegistry;
var receiptRegistryInstance;
var web3;
var accounts;
var deployingAccount;
var user1;
var user2;
var receiptDao;

const initialReceiptId = 'CD87EFA868F333C135F67798D7E0E2D99863996BCFCCCA37DCE4A0BCA580DD52';
const receiptId2 = '1D087C4E4EF875470CD8F2E186AC05C7CC65F73CFC4393CEE241871950C0AC1A';
const initialStoreId = 1;
const storeId2 = 2;
const initialImageHash = 'QmT4AeWE9Q9EaoyLJiqaZuYQ8mJeq4ZBncjjFH9dQ9uDVA';
const imageHash2 = 'QmdiA1atSBgU178s5rsWont8cYns3fmwHxELTpiP9uFfLW';
const initialMetadataHash = 'QmT9qk3CRYbFDWpDFYeAv8T8H1gnongwKhh5J68NLkLir6';
const metadataHash2 = 'QmT9qk3CRYbFDWpDFYeAv8T8H1gnongwKhh5J68NLkLir6';

function getAccounts(web3Instance) {
    return new Promise(function(resolve, reject) {

        web3Instance.eth.getAccounts( (err, result) => {
            if(err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

describe('Receipt DAO tests:', function() {
    // Increase the timeout for this before hook to 20 seconds
    this.timeout(20000);

    before( () => {
        if (web3 === undefined) {
            // set the provider you want from Web3.providers
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        return getAccounts(web3)
        .then( (accs)  => {
          accounts = accs;
          deployingAccount = accounts[0];
          user1 = accounts[1];
          user2 = accounts[2];
          return accounts;
        })
        .then( () => {
            if(receiptRegistryInstance === undefined || ReceiptRegistry === undefined) {
                ReceiptRegistry = contract(receiptRegistryAbi);
                ReceiptRegistry.setProvider(web3.currentProvider);

                console.log(ReceiptRegistry);

                return ReceiptRegistry.new( {from: deployingAccount, gas: 1000000});
            }
            return Promise.resolve();
        })
        .then((instance) => {
            receiptDao = new ReceiptDao(instance);
            receiptRegistryInstance = instance;
            return instance.storeReceipt(initialReceiptId, initialStoreId, initialImageHash, initialMetadataHash, {from: deployingAccount});
        })
        .then( (result) => {
            return Promise.resolve();
        });
    })

    describe('Retrieve All Receipts tests:', () => {
        it('should be true that an error is thrown if no address is supplied', () => {
            return receiptDao.retrieveAllReceipts().should.be.rejectedWith(TypeError);
        });

        it('should be true that only the initial event / receipt is returned', () => {
            return receiptDao.retrieveAllReceipts(deployingAccount)
            .then((receipts) => {
                assert.equal(receipts.size, 1, 'Expected that only the initial receipt would be retrieved');
                var receipt = Array.from(receipts.values())[0];
                assert.equal(receipt.receiptId, initialReceiptId, 'Expected the retrieved id to match');
                assert.equal(receipt.storeId, initialStoreId, 'Expected the retrieved store id to match');
                assert.equal(receipt.imageHash, initialImageHash, 'Expected the retrieved image hash to match');
                assert.equal(receipt.metadataHash, initialMetadataHash, 'Expected the retrieved metadata hash to match');
            })
            .should.be.fulfilled;
        });

        it('should be true that a user does not have any receipt stored then none are returned', () => {
            return receiptDao.retrieveAllReceipts(user2)
            .then((receipts) => {
                console.log(receipts);
                assert.equal(receipts.size, 0, 'Expected that only the initial receipt would be retrieved');
                var receipt = Array.from(receipts.values())[0];
            })
            .should.be.fulfilled;
        });

        it('should be true that only the single receipt is returned for a new address', () => {
            return receiptRegistryInstance.storeReceipt(initialReceiptId, initialStoreId, initialImageHash, initialMetadataHash, {from: user1})
            .then( (results) => {
                return receiptDao.retrieveAllReceipts(user1);
            })
            .then((receipts) => {
                assert.equal(receipts.size, 1, 'Expected that only the initial receipt would be retrieved');
                var receipt = Array.from(receipts.values())[0];
                assert.equal(receipt.receiptId, initialReceiptId, 'Expected the retrieved id to match');
                assert.equal(receipt.storeId, initialStoreId, 'Expected the retrieved store id to match');
                assert.equal(receipt.imageHash, initialImageHash, 'Expected the retrieved image hash to match');
                assert.equal(receipt.metadataHash, initialMetadataHash, 'Expected the retrieved metadata hash to match');
            })
            .should.be.fulfilled;
        });


        it('should be true that only the same receipt details can exist on two different stores and be retrieved', () => {
            return receiptRegistryInstance.storeReceipt(initialReceiptId, storeId2, initialImageHash, initialMetadataHash, {from: user1})
            .then( (results) => {
                return receiptDao.retrieveAllReceipts(user1);
            })
            .then((receipts) => {
                assert.equal(receipts.size, 2, 'Expected that only the initial receipt would be retrieved');
                var receipt = Array.from(receipts.values())[0];
                assert.equal(receipt.receiptId, initialReceiptId, 'Expected the retrieved id to match');
                assert.equal(receipt.storeId, initialStoreId, 'Expected the retrieved store id to match');
                assert.equal(receipt.imageHash, initialImageHash, 'Expected the retrieved image hash to match');
                assert.equal(receipt.metadataHash, initialMetadataHash, 'Expected the retrieved metadata hash to match');

                receipt = Array.from(receipts.values())[1];
                assert.equal(receipt.receiptId, initialReceiptId, 'Expected the retrieved id to match');
                assert.equal(receipt.storeId, storeId2, 'Expected the retrieved store id to match');
                assert.equal(receipt.imageHash, initialImageHash, 'Expected the retrieved image hash to match');
                assert.equal(receipt.metadataHash, initialMetadataHash, 'Expected the retrieved metadata hash to match');

            })
            .should.be.fulfilled;
        });

        it('should be true that multiple receipts can be stored and be retrieved', () => {
            return receiptRegistryInstance.storeReceipt(receiptId2, storeId2, imageHash2, metadataHash2, {from: user1})
            .then( (results) => {
                return receiptDao.retrieveAllReceipts(user1);
            })
            .then((receipts) => {
                assert.equal(receipts.size, 3, 'Expected that only the initial receipt would be retrieved');
                var receipt = Array.from(receipts.values())[0];
                assert.equal(receipt.receiptId, initialReceiptId, 'Expected the retrieved id to match');
                assert.equal(receipt.storeId, initialStoreId, 'Expected the retrieved store id to match');
                assert.equal(receipt.imageHash, initialImageHash, 'Expected the retrieved image hash to match');
                assert.equal(receipt.metadataHash, initialMetadataHash, 'Expected the retrieved metadata hash to match');

                receipt = Array.from(receipts.values())[1];
                assert.equal(receipt.receiptId, initialReceiptId, 'Expected the retrieved id to match');
                assert.equal(receipt.storeId, storeId2, 'Expected the retrieved store id to match');
                assert.equal(receipt.imageHash, initialImageHash, 'Expected the retrieved image hash to match');
                assert.equal(receipt.metadataHash, initialMetadataHash, 'Expected the retrieved metadata hash to match');

                receipt = Array.from(receipts.values())[2];
                assert.equal(receipt.receiptId, receiptId2, 'Expected the retrieved id to match');
                assert.equal(receipt.storeId, storeId2, 'Expected the retrieved store id to match');
                assert.equal(receipt.imageHash, imageHash2, 'Expected the retrieved image hash to match');
                assert.equal(receipt.metadataHash, metadataHash2, 'Expected the retrieved metadata hash to match');
            })
            .should.be.fulfilled;
        });
    })

    /*describe('Retrieve single Receipt test:', () => {

    })*/

});