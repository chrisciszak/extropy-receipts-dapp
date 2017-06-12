const receiptDao = require('../../app/javascripts/receiptDao.js');

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

const initialReceiptId = 'CD87EFA868F333C135F67798D7E0E2D99863996BCFCCCA37DCE4A0BCA580DD52';
const initialStoreId = 1;
const initialImageHash = 'QmT4AeWE9Q9EaoyLJiqaZuYQ8mJeq4ZBncjjFH9dQ9uDVA';
const initialMetadataHash = 'QmT9qk3CRYbFDWpDFYeAv8T8H1gnongwKhh5J68NLkLir6';

before( () => {
    if (web3 === undefined) {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        return;
      }

      if (accs.length == 0) {
        return;
      }

      accounts = accs;
      deployingAccount = accounts[0];
    });

    if(receiptRegistryInstance === undefined || ReceiptRegistry === undefined) {
        ReceiptRegistry = contract(receiptRegistryAbi);
        ReceiptRegistry.setProvider(web3.currentProvider);

        return ReceiptRegistry.deployed()
        .then((instance) => {
            receiptRegistryInstance = instance;
            return instance.storeReceipt(initialReceiptId, initialStoreId, initialImageHash, initialMetadataHash, {from: deployingAccount});
        })
        .then( (result) => {
            return Promise.resolve();
        });
    }
})

describe('Receipt DAO tests:', () => {

    describe('Retrieve All Receipts tests:', () => {
        it('should be true that an error is thrown if no address is supplied', () => {
            return receiptDao.retrieveAllReceipts().should.be.rejectedWith(TypeError);
        });

        it('should be true that only the initial event is returned', () => {
            return receiptDao.retrieveAllReceipts(deployingAccount)
            .then((receipts) => {
                assert.equal(receipts.size, 1, 'Expected that only the initial receipt would be retrieved');
                for (let receipt of receipts.values()) {
                    assert.equal(receipt.receiptId, initialReceiptId, 'Expected the retrieved id to match');
                    assert.equal(receipt.storeId, initialStoreId, 'Expected the retrieved store id to match');
                    assert.equal(receipt.imageHash, initialImageHash, 'Expected the retrieved image hash to match');
                    assert.equal(receipt.metadataHash, initialMetadataHash, 'Expected the retrieved metadata hash to match');
                }

            })
            .should.be.fulfilled;
        });
    })

    /*describe('Retrieve single Receipt test:', () => {

    })*/

});