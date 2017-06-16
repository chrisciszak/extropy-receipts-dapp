const http = require("http");
const express = require('express')
const app = express()

const ReceiptDao = require('./receiptDao');
const receiptRegistryAbi = require('../../build/contracts/ReceiptRegistry.json');
const contract = require('truffle-contract');
const Web3 = require('web3');

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

app.use(init);

app.get('/receipts/:address', function (req, res) {
  const address = req.params.address;

  return receiptDao.retrieveAllReceipts(address)
  .then( (receipts) => {
    res.json(receipts.values());
  })
  .catch( (err) => {
    res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
  })
})

app.post('/receipt', function (req, res) {
  res.send('Stored Hello World!')
})
app.listen(3000)
