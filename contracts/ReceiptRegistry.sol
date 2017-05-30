pragma solidity ^0.4.10;

// import "http://github.com/ExtropyIO/ethereum-standard-contracts/contracts/management/Mortal.sol";
import "../../ethereum-standard-contracts/contracts/management/Mortal.sol";

contract ReceiptRegistry is Mortal {

    // Local variables
    struct Receipt {
        bytes32 receiptId;
        bytes32 imageHash;
        bytes32 metadataHash;
        bool isDeleted;
    }

    mapping(address => Receipt[]) private receipts;

    // Events

    // Modifiers
    modifier only_when_new_receipt(bytes32 id) {
        if(retrieveReceipt(msg.sender, id).isDeleted) {
            _;
        }
        throw;
    }

    modifier only_when_existing_receipt(bytes32 id) {
        if(! retrieveReceipt(msg.sender, id).isDeleted) {
            _;
        }
        throw;
    }

    // Constructor
    function ReceiptRegistry(){

    }


    // Create
    function storeReceipt(bytes32 _receiptId, bytes32 _imageHash, bytes32 _metadataHash) external only_when_new_receipt(_receiptId) {
        receipts[msg.sender].push(Receipt(_receiptId, _imageHash, _metadataHash, false));
    }

    // Read
    function retrieveReceipt(bytes32 id) constant external returns (bytes32, bytes32) {
        Receipt memory tempReceipt = retrieveReceipt(msg.sender, id);
        return (tempReceipt.imageHash, tempReceipt.metadataHash);
    }

    function retrieveNumReceiptsStored() constant external returns (uint) {
        return receipts[msg.sender].length;
    }

    // Update


    // Delete


    // Helper functions
    function retrieveReceipt(address receiptOwner, bytes32 id) constant internal returns (Receipt) {
        Receipt[] tempReceipts = receipts[receiptOwner];
        for(uint i = 0; i < tempReceipts.length; i++) {
            Receipt tempReceipt = tempReceipts[i];
            if(tempReceipt.receiptId == id) {
                return tempReceipt;
            }
        }
    }
}
