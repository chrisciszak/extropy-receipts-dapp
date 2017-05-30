var ReceiptRegistry = artifacts.require("./ReceiptRegistry.sol");

module.exports = function(deployer) {
    deployer.deploy(ReceiptRegistry);
};
