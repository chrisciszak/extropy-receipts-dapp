const http = require("http");
const express = require('express')
const formidable = require('express-formidable');
const app = express()

const ReceiptDao = require('./receiptDao');
const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
const contract = require('truffle-contract');
const Web3 = require('web3');

const DocumentPersistence = require('../../../extropy-document-persistence');

var ReceiptRegistry;
var receiptRegistryInstance;
var web3;
var receiptDao;


// Private
var init = function(req, res, next) {
    if (web3 === undefined) {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    if(receiptRegistryInstance === undefined || ReceiptRegistry === undefined) {
        ReceiptRegistry = contract(receiptRegistryAbi);
        ReceiptRegistry.setProvider(web3.currentProvider);
        return ReceiptRegistry.deployed()
        .then( (instance) => {
            receiptDao = new ReceiptDao(instance);
            receiptRegistryInstance = instance;

            // call next step
            next();
        })
        .catch( (err) => {
            res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
        })
    }

    // call next step
    next();
}

var getReceiptJson = function(data) {
    if(data == undefined || ! (data instanceof Map)) {
        return [];
    }

    var json = [];
    var receipts = Array.from(data.values());
    for(let i = 0; i < receipts.length; i++) {
        var receipt = receipts[i];
        json.push(
            {
                "id": receipt.receiptId,
                "blockNumber": receipt.blockNum,
                "image": "https://ipfs.infura.io/ipfs/"+receipt.imageHash,
                "metadata" : "https://ipfs.infura.io/ipfs/"+receipt.metadataHash
            }
        )
    }

    return json;
}

var getMetadataJson = function(amount, purchaseType, purchaseDate) {

    return {
        "amount" : amount,
        "type" : purchaseType,
        "date" : purchaseDate
    }
}

// Add the init 'middleware'
app.use(init);
app.use(formidable());

app.get('/receipts/:address', function (req, res) {
  const address = req.params.address;

  return receiptDao.retrieveAllReceipts(address)
  .then( (receipts) => {
    console.log(receipts.values());
    res.json(getReceiptJson(receipts));
  })
  .catch( (err) => {
    res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
  })
})

app.post('/receipt', function (req, res) {
  var json = {};
  return DocumentPersistence.persistDocument(req.files.fileupload.path)
  .then( (result) => {
    json.image = result;
    var fields = req.fields;
    var metadataString = JSON.stringify(getMetadataJson(fields.pamount, fields.ptype, fields.pdate));
    var buffer = Buffer.from(metadataString);
    return DocumentPersistence.persistDocument(buffer);
  })
  .then( (result) => {
    json.metadata = result;
    res.json(json);
  })
  .catch( (err) => {
    console.log(err);
    res.end();
  })
})
app.listen(3000)
