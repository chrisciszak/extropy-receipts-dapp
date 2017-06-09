const receiptDao = require('../../app/javascripts/receiptDao.js');
const contract = require('truffle-contract');
const Web3 = require('web3');

const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
var ReceiptRegistry;
var receiptRegistryInstance;
var web3;
var accounts;
var deployingAccount;


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

        ReceiptRegistry.deployed().then((instance) => {
            receiptRegistryInstance = instance;
            return instance.storeReceipt('a', 1, 'a', 'a', {from: deployingAccount})
            .then( (result) => {
            });
        });
    }
})

describe('Receipt DAO tests:', () => {

    describe('Retrieve All Receipts tests:', () => {
        it('should be true that an error is thrown if no address is supplied', () => {
            try {
                receiptDao.retrieveAllReceipts();
                assert(false, "Expected that an error would have been thrown");
            } catch(err) {
            }
        });

        it('should be true that ', () => {
            receiptDao.retrieveAllReceipts(deployingAccount, (receipts) => {
                console.log(receipts);
            });
        });
    })

    describe('Retrieve single Receipt test:', () => {

    })


});