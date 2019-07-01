pragma solidity ^0.5.0;

/// @title Escrow
/// @author Nestor R. Escoto
/// @notice This contract allow the implementation of Escrow payments trough Ethereum

contract Escrow {
  /// @author Nestor R. Escoto

  /*
    Escrow Struct
  */
  struct EscrowPayment {
    address buyer;
    address payable seller;
    uint256 amount; //In weis
    mapping(address => bool) agreement;
    mapping(address => bool) vote;
    bool isOpen;
    bool isWithdraw;
  }
  /*
    Local Variables
  */
  address public owner;
  uint public currentEscrow;
  mapping(uint => EscrowPayment) private escrows;
  uint private MIN_AMOUNT = 99;

  /*
    Modifiers
  */

  /// @notice Checks if msg.value is greater than the Min Amount allowed
  modifier checkMin() {
    require(msg.value > MIN_AMOUNT, "value must be greater than min amount");
    _;
  }

  /// @notice Only allow to buyer/seller to perform certain operation
  modifier onlyBuyerSeller(uint _id, address _address) {
    EscrowPayment memory myEscrow = escrows[_id];
    require(_address == myEscrow.buyer || _address == myEscrow.seller, "the sender must be buyer or seller");
    _;
  }

  /// @notice Checks if the Escrow is open
  modifier escrowIsOpen(uint _id){
    EscrowPayment memory myEscrow = escrows[_id];
    require(!myEscrow.isOpen, "the escrow must be closed to withdraw");
    _;
  }

  /// @notice Checks if the Escrow is withdrawn
  modifier isWithDrawn(uint _id){
    EscrowPayment memory myEscrow = escrows[_id];
    require(!myEscrow.isWithdraw, "the escrow is already withdrawn");
    _;
  }

  /// @notice Checks if the msg.sender is the owner
  modifier restricted(){
    require(msg.sender == owner, "only owner is able to perform this operation");
    _;
  }


  /// @notice Contract's Constructor, it will set the msg.sender as owner
  constructor() public {
    currentEscrow = 0;
    owner = msg.sender;
  }

  /// @notice Creates a new Escrow Payment into the contract
  /// @param _seller The address of the seller
  /// @return id of the Escrow Contract just created
  function addEscrow(address payable _seller) public payable checkMin returns (uint) {
    currentEscrow = currentEscrow + 1;
    escrows[currentEscrow] = EscrowPayment({ buyer: msg.sender, seller: _seller, amount: msg.value, isOpen: true, isWithdraw: false});
    return currentEscrow;
  }

  /// @notice Returns a specific Escrow based on the received id
  /// @param _id Id of the Escrow Payment
  /// @return escrow structure of the matched Escrow Payment
  function getEscrow(uint _id) public view returns(
    address buyer,
    address seller,
    uint amount,
    bool buyerAgreement,
    bool sellerAgreement,
    bool buyerVote,
    bool sellerVote,
    bool isOpen,
    bool isWithdraw){
      EscrowPayment storage myEscrow = escrows[_id];
      buyer = myEscrow.buyer;
      seller = myEscrow.seller;
      amount = myEscrow.amount;
      buyerAgreement = myEscrow.agreement[buyer];
      sellerAgreement = myEscrow.agreement[seller];
      buyerVote = myEscrow.vote[buyer];
      sellerVote = myEscrow.vote[seller];
      isOpen = myEscrow.isOpen;
      isWithdraw = myEscrow.isWithdraw;
      return (buyer, seller, amount, buyerAgreement, sellerAgreement, buyerVote, sellerVote, isOpen, isWithdraw);
  }

  /// @notice Performs a vote from the involved parties in the Escrow Payment
  /// @param _id Id of the Escrow Payment
  /// @param _vote Boolean value to represent the vote
  /// @return true if everything went well
  function vote(uint _id, bool _vote) public onlyBuyerSeller(_id, msg.sender) returns (bool){
    EscrowPayment storage myEscrow = escrows[_id];
    myEscrow.agreement[msg.sender] = _vote;
    myEscrow.vote[msg.sender] = true;
    //If both seller and buyer already voted the payment should be closed
    if(myEscrow.vote[myEscrow.seller] && myEscrow.vote[myEscrow.buyer]){
      myEscrow.isOpen = false;
    }
    return true;
  }

  /// @notice Allows to withdraw the money from the escrow payment
  /// @param _id Id of the Escrow Payment
  /// @return true if everything went well
  function withdraw(uint _id) public escrowIsOpen(_id) isWithDrawn(_id) returns (bool){
    EscrowPayment storage myEscrow = escrows[_id];
    require(msg.sender == myEscrow.seller, "the sender must be the seller");
    require(myEscrow.agreement[myEscrow.buyer] && myEscrow.agreement[myEscrow.seller], "there must be an agreement between buyer and seller");
    myEscrow.seller.transfer(myEscrow.amount);
    myEscrow.isWithdraw = true;
    return true;
  }

  /// @notice Allows to transfer a blocked escrow payment to the buyer or seller
  /// @param _id Id of the Escrow Payment
  /// @param _address Recipient of transaction
  /// @return true if everything went well
  function transferWhenBlocked(uint _id, address payable _address) public
  escrowIsOpen(_id)
  onlyBuyerSeller(_id, _address)
  restricted() returns (bool){
    EscrowPayment storage myEscrow = escrows[_id];
    require(!myEscrow.agreement[myEscrow.buyer] || !myEscrow.agreement[myEscrow.seller], "there must not be an agreement");
    _address.transfer(myEscrow.amount);
    myEscrow.isWithdraw = true;
    return true;
  }
}
