const Receipt = require('./receipt.js');
const S = require('string');
const contract = require('truffle-contract');

const Web3 = require('web3');

const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
var ReceiptRegistry;
var receiptRegistryInstance;
var web3;

// Constructor
function ReceiptDao(contractInstance) {
    if(contractInstance == undefined) {
        return TypeError("Unable to retrieve the receipts for a blank contract instance");
    }

    receiptRegistryInstance = contractInstance;
}

// Private
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

// Public instance methods
ReceiptDao.prototype.retrieveAllReceipts = function(address) {
    if(S(address).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve the receipts for a blank address"));
    }

    const receiptsMap = new Map();

    return getEvents(receiptRegistryInstance)
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

ReceiptDao.prototype.retrieveReceipt = function(address, receiptId, storageId) {
    if(S(address).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve the receipts for a blank address"));
    }
}

module.exports = ReceiptDao;