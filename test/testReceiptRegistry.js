var ReceiptRegistry = artifacts.require("./ReceiptRegistry.sol");
const EthereumEventAssertions = require('../../ethereum-standard-contracts/test/javascript/ethereumEventAssertions.js');

contract('ReceiptRegistry', function(accounts) {
    var receiptRegistryInstance;
    var deployingAccount = accounts[0];

    before('Retrieve contract instances', () => {
        return ReceiptRegistry.deployed().then((instance) => {
            receiptRegistryInstance = instance;
        });
    });

    describe('Production deployment sanity tests', () => {



    });

});