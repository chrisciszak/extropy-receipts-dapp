pragma solidity ^0.4.10;

// import "http://github.com/ExtropyIO/ethereum-standard-contracts/contracts/management/Mortal.sol";
import "../../ethereum-standard-contracts/contracts/management/Mortal.sol";

contract ReceiptRegistry is Mortal {
    // Events
    event ReceiptStored(address indexed receiptOwner, string receiptId, uint8 storeId, string imageHash, string metadataHash);
    event ReceiptDeleted(address indexed receiptOwner, string receiptId, uint8 storeId);

    // Constructor
    function ReceiptRegistry(){

    }

    // Create
    function storeReceipt(string receiptId, uint8 storeId, string imageHash, string metadataHash) {
        ReceiptStored(msg.sender, receiptId, storeId, imageHash, metadataHash);
    }

    // Update
    function updateReceipt(string receiptId, uint8 storeId, string imageHash, string metadataHash) {
        ReceiptStored(msg.sender, receiptId, storeId, imageHash, metadataHash);
    }

    // Delete
    function deleteReceipt(string receiptId, uint8 storeId) {
        ReceiptDeleted(msg.sender, receiptId, storeId);
    }
}
