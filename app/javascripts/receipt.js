// Public
function Receipt(_receiptId, _storeId, _imageHash, _metadataHash, _blockNum) {
    this.receiptId = _receiptId;
    this.storeId = _storeId;
    this.imageHash = _imageHash;
    this.metadataHash = _metadataHash;
    this.blockNum = _blockNum;
}

// Static function
Receipt.marshalReceipt = function(data) {
    if(data == undefined) {
        throw new TypeError("Unable to marshal empty or blank data");
    }

    return new Receipt();
}


module.exports = Receipt;