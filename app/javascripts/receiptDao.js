const Receipt = require('./receipt.js');
const S = require('string');
const contract = require('truffle-contract');

var receiptRegistryInstance;

// Constructor
function ReceiptDao(contractInstance) {
    if(contractInstance == undefined) {
        return TypeError("Unable to retrieve the receipts for a blank contract instance");
    }

    receiptRegistryInstance = contractInstance;
}

// Private
function getEvents(instance, address) {
    if(instance == undefined) {
        return Promise.reject(TypeError("A contract instance must be provided"));
    }

    if(address == undefined) {
        return Promise.reject(TypeError("An address must be provided"));
    }

    return new Promise(function(resolve, reject) {
        instance.ReceiptStored({receiptOwner : address}, {fromBlock: 0, toBlock: 'latest'}).get( (err, result) => {
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

    return getEvents(receiptRegistryInstance, address)
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
        console.log(err);
        Promise.resolve(new Map());
    })
}

ReceiptDao.prototype.retrieveReceipt = function(address, receiptId, storageId) {
    if(S(address).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve a receipt for a blank address"));
    }

    if(S(receiptId).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve a receipt for a blank receipt ID"));
    }

    if(storageId == undefined) {
        return Promise.reject(TypeError("Unable to retrieve a receipt for a blank storage ID"));
    }

    const receiptsMap = new Map();

    return getEvents(receiptRegistryInstance, address)
    .then((results) => {
        for(let i = 0; i < results.length; i++) {
            var receipt = Receipt.marshalReceipt(results[i]);
            if(receipt != undefined && (receipt.receiptId != undefined && receipt.receiptId == receiptId) && (receipt.storeId != undefined && receipt.storeId == storageId)) {
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

module.exports = ReceiptDao;