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
        ReceiptRegistry = contract(receiptRegistryAbi);
        ReceiptRegistry.setProvider(web3.currentProvider);

        return ReceiptRegistry.deployed().then((instance) => {
            receiptRegistryInstance = instance;
        });
    }

    return Promise.resolve();
}

function getEvents(instance, paramsObj, argsObj) {
    return new Promise(function(resolve, reject) {
        instance.ReceiptStored({}, {fromBlock: 0, toBlock: 'latest'}).get( (err, result) => {
            if(err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

var retrieveAllReceipts = function(address) {
    if(S(address).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve the receipts for a blank address"));
    }

    const receiptsMap = new Map();

    return init()
    .then( () => {
        return getEvents(receiptRegistryInstance);
    })
    .then((results) => {
        for(let i = 0; i < results.length; i++) {
            var receipt = Receipt.marshalReceipt(results[i]);
            if(receipt != undefined) {
                // Composite key
                var id = receipt.receiptId + receipt.storeId;
                receiptsMap.set(id, receipt);
            }
        }
        return Promise.resolve(receiptsMap);
    })
    .catch( (err) => {
        Promise.resolve(new Map());
    })
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