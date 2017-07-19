const http = require("http");
const express = require('express');
const formidable = require('express-formidable');
const app = express();

const ReceiptDao = require('./receiptDao');
const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
const contract = require('truffle-contract');
const Web3 = require('web3');
const async = require('async');

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
            console.log(err);
            res.status(500).send('Internal Server Error: ' + err);
        })
    }

    // call next step
    next();
};

var retrieveReceiptData = function (imageHash, metaDataHash) {
    const data = {};
    return DocumentPersistence.retrieveDocument(imageHash)
        .then((imageData) => {
            data.image = imageData;
            console.log("IMAGE");
            console.log(imageData);
            return DocumentPersistence.retrieveDocument(metaDataHash);
        })
        .then( (metadataData) => {
            data.metadata = metadataData;
            console.log("METADATA");
            console.log(metadataData);
            return data;
        });
};

var getReceiptJson = function(data) {
    if(data == undefined || ! (data instanceof Map)) {
        return Promise.resolve([]);
    }

    let json = [];
    let receipts = Array.from(data.values());

    return new Promise( (resolve, reject) => {
        async.each(
            // Collection
            receipts,
            // Async function
            function (receipt, callback) {
                retrieveReceiptData(receipt.imageHash, receipt.metadataHash)
                    .then( (data) => {
                        json.push(
                            {
                                "id": receipt.receiptId,
                                "blockNumber": receipt.blockNum,
                                "image": data.image,
                                "metadata" : data.metadata
                            }
                        );
                        callback();
                    });
            },
            // callback
            function (err) {
                if(err) {
                    console.log(err);
                    reject(err);
                }
                console.log("DONE");
                resolve(json);
            }
        )
    });
};

var getMetadataJson = function(amount, purchaseType, purchaseDate) {

    return {
        "amount" : amount,
        "type" : purchaseType,
        "date" : purchaseDate
    }
};

// Add the init 'middleware'
app.use(init);
app.use(formidable());

app.get('/receipts/:address', function (req, res) {
  const address = req.params.address;

  return receiptDao.retrieveAllReceipts(address)
  .then( (receipts) => {
      console.log(receipts.values());
      return getReceiptJson(receipts);
  })
  .then( (data) => {
    res.jsonp(data);
  })
  .catch( (err) => {
      console.log(err);
      res.status(500).send('Internal Server Error' + err);
  })
});

app.get('/receipt/:id/address/:address', function (req, res) {
    const id = req.params.id;
    const address = req.params.address;

    return receiptDao.retrieveReceipt(address, id, 0)
    .then( (receipt) => {
        console.log(receipt);
        return getReceiptJson(receipt);
    })
    .then( (data) => {
        res.jsonp(data);
    })
    .catch( (err) => {
        console.log(err);
        res.status(500).send('Internal Server Error' + err);
    })

});

app.get('/receipt/:id/address/:address/image', function (req, res) {

});

app.post('/receipt', function (req, res) {
  let json = {};
  return DocumentPersistence.persistDocument(req.files.fileupload.path)
  .then( (result) => {
    json.image = result;
    const fields = req.fields;
    const metadataString = JSON.stringify(getMetadataJson(fields.pamount, fields.ptype, fields.pdate));
    const buffer = Buffer.from(metadataString);
    return DocumentPersistence.persistDocument(buffer);
  })
  .then( (result) => {
    json.metadata = result;
    res.jsonp(json);
  })
  .catch( (err) => {
    console.log(err);
    res.end();
  })
});

app.listen(3000);
