const Receipt = require('./receipt.js');
const S = require('string');
const contract = require('truffle-contract');
const async = require('async');

// To avoid problems with requests for logs timing out, batch the requests by number of blocks.
const MAX_BATCH_SIZE = 200;

let receiptRegistryInstance;

// Constructor
function ReceiptDao(contractInstance) {
    if(contractInstance === undefined) {
        return TypeError("Unable to retrieve the receipts for a blank contract instance");
    }

    receiptRegistryInstance = contractInstance;
}

// Private
function getWeb3Instance() {
    return new Promise( (resolve, reject) => {
        if(receiptRegistryInstance === undefined || receiptRegistryInstance.constructor === undefined ||
            receiptRegistryInstance.constructor.web3 === undefined) {
            reject("Unable to get a web3 instance");
        }
        resolve(receiptRegistryInstance.constructor.web3);
    })
}

function getCurrentBlockHeight() {
    return getWeb3Instance()
        .then( (web3) => {
            return new Promise((resolve, reject) => {
                web3.eth.getBlockNumber((error, result) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                    resolve(result);
                });
            });
        });
}

function getStartBlockNumber() {
    return new Promise( (resolve, reject) => {
        resolve(receiptRegistryInstance.block_number_deployed_in || 0);
    });
}

function getEvents(instance, address) {
    if(instance === undefined) {
        return Promise.reject(TypeError("A contract instance must be provided"));
    }

    if(address === undefined) {
        return Promise.reject(TypeError("An address must be provided"));
    }

    let results = [];
    let blockHeight = 0;
    return getCurrentBlockHeight()
        .then( (_blockHeight) => {
            blockHeight = _blockHeight;
            return getStartBlockNumber();
        })
        .then( (startBlock) => {
            const numIterations = Math.ceil((blockHeight - startBlock) / MAX_BATCH_SIZE);
            let currentIteration = 0;
            let endBlock;
            return new Promise( (resolve, reject) => {
                async.whilst(
                    // Test
                    function () {
                        if(currentIteration === numIterations) {
                            return false;
                        }
                        if(currentIteration !== 0) {
                            startBlock = endBlock;
                        }
                        endBlock = (startBlock + MAX_BATCH_SIZE <= blockHeight) ? startBlock + MAX_BATCH_SIZE : blockHeight;
                        currentIteration = currentIteration + 1;
                        return true;
                    },
                    // Action
                    function(callback) {
                        instance.ReceiptStored({receiptOwner : address}, {fromBlock: startBlock, toBlock: endBlock}).get( (err, result) => {
                            if(err) {
                                console.log("ERROR");
                                console.log(err);
                                reject(err);
                            }
                            results = results.concat(result);
                            callback();
                        });
                    },
                    // When complete
                    function () {
                        return resolve(results);
                    }
                );
            })
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
        if(results === undefined || results.length === 0) {
            return Promise.resolve(receiptsMap);
        }
        for(let i = 0; i < results.length; i++) {
            const receipt = Receipt.marshalReceipt(results[i]);
            if(receipt !== undefined) {
                // Composite key
                const id = receipt.receiptId + receipt.storeId;
                receiptsMap.set(id, receipt);
            }
        }
        return Promise.resolve(receiptsMap);
    })
    .catch( (err) => {
        console.log(err);
        return Promise.resolve(new Map());
    })
};

ReceiptDao.prototype.retrieveReceipt = function(address, receiptId, storageId) {
    if(S(address).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve a receipt for a blank address"));
    }

    if(S(receiptId).isEmpty()) {
        return Promise.reject(TypeError("Unable to retrieve a receipt for a blank receipt ID"));
    }

    if(storageId === undefined) {
        return Promise.reject(TypeError("Unable to retrieve a receipt for a blank storage ID"));
    }

    const receiptsMap = new Map();
    // Composite key
    const id = receiptId + storageId;

    return getEvents(receiptRegistryInstance, address)
    .then((results) => {
        for(let i = 0; i < results.length; i++) {
            var receipt = Receipt.marshalReceipt(results[i]);
            if(receipt != undefined && (receipt.receiptId != undefined && receipt.receiptId == receiptId) && (receipt.storeId != undefined && receipt.storeId == storageId)) {
                receiptsMap.set(id, receipt);
            }
        }
        return Promise.resolve(receiptsMap.get(id));
    })
    .catch( (err) => {
        console.log(err);
        return Promise.resolve(new Map());
    })
};

module.exports = ReceiptDao;