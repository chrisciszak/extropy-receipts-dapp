# extropy-receits-dapp
Ethereum Decentralised Application (DApp) for storing of receipts in a decentralised, secure and trustless manner.

## Requirements

* Truffle:
* Node / NPM:
* IPFS

## Building and the front-end

1. First run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
2. Then run `npm run dev` to build the app and serve it on http://localhost:8080

## Running the back-end

**Note: due to the way that Truffle works, if you are deploying to an environment for the first time (or to testrpc) you must build and run the font-end before you start the Node server**

1. Starting the Node Application
```
node app/javascripts/main.js
```
2. Starting IPFS
```
ipfs daemon
```

## Common Errors

* **Error: Can't resolve '../build/contracts/MetaCoin.json'**

This means you haven't compiled or migrated your contracts yet. Run `truffle compile` and `truffle migrate` first.

Full error:

```
ERROR in ./app/main.js
Module not found: Error: Can't resolve '../build/contracts/MetaCoin.json' in '/Users/tim/Documents/workspace/Consensys/test3/app'
 @ ./app/main.js 11:16-59
```
