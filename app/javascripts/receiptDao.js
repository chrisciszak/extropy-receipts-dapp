const Receipt = require('./receipt.js');
const S = require('string');
const web3 = require('web3');

const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
//const ReceiptRegistry = web3.contract(receiptRegistryAbi);
var receiptRegistryInstance;

// Private
function init() {
    console.log(web3);
}

var retrieveAllReceipts = function(address) {
    init();
    console.log(accs);
    if(S(address).isEmpty()) {
        return Promise.reject(TypeError("Unable to marshal empty or blank data"));
    }
}

var retrieveReceipt = function(address, receiptId, storageId) {

}

module.exports = {
    retrieveAllReceipts: retrieveAllReceipts,
    retrieveReceipt: retrieveReceipt
}