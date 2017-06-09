const Receipt = require('./receipt.js');
const S = require('string');
const contract = require('truffle-contract');

const Web3 = require('web3');

const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
var ReceiptRegistry;
var receiptRegistryInstance;
var web3;

// Private
function init() {
    if (web3 === undefined) {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    if(receiptRegistryInstance === undefined || ReceiptRegistry === undefined) {
        console.log("Initialising contract instance");

        ReceiptRegistry = contract(receiptRegistryAbi);
        ReceiptRegistry.setProvider(web3.currentProvider);

        ReceiptRegistry.deployed().then((instance) => {
            receiptRegistryInstance = instance;
        });
    }
}

// Private
/*function aggregate(username, permalink) {
    return steem.formatter.commentPermlink(username, permalink);
}*/

var retrieveAllReceipts = function(address, callback) {
    init();

    if(S(address).isEmpty()) {
        return TypeError("Unable to retrieve the receipts for a blank address");
    }

    var receiptsMap = new Map();

    receiptRegistryInstance.ReceiptStored({}, {fromBlock: 0, toBlock: 'latest'}).get(function(error, logs){
        console.log("IN");
        if(error) {
            return Promise.reject(Error(error));
        }

        console.log("THE LOGS");
        console.log(logs);

        for(let i = 0; i < logs.size; i++) {
            var receipt = Receipt.marshalReceipt(logs);
            // Composite key
            var id = receipt.receiptId + receipt.storeId;
            receiptsMap.set(id, receipt);
        }
        callback(receiptsMap.values());
    });
}

var retrieveReceipt = function(address, receiptId, storageId) {
    console.log("Before init");
    init();
    console.log("End initialisation");

    if(S(address).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve the receipts for a blank address"));
    }
}

module.exports = {
    retrieveAllReceipts: retrieveAllReceipts,
    retrieveReceipt: retrieveReceipt
}