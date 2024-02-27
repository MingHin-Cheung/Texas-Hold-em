pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;


contract Poker {
     
     enum STAGES {
         DEALING, //Will include blindfees
         PREFLOP,
         FLOP,
         TURN,
         RIVER,
         PAYOUT
          }
    
    STAGES stages;
    address payable public player1; //The first player(casino) to deploy the contract will be assigned player1
    address payable public player2; 
    uint256 public blindFeeBig = 0.002 ether;
    uint256 public blindFeeSmall = 0.001 ether;
    uint256 public betPlayer1;
    uint256 public betPlayer2;
    //their hands encrypted
    string[2] public playerHand;
    string[2] public casinoHand;
    
    //community pile cards (not encrypted)
    string[5] public communityPile;
    
    
    // hashes of their hand. Hashes them one by one and puts them here
    bytes32[2] public playerCommitment;
    bytes32[2] public casinoCommitment;
    bytes32[5] public communityPileCommitment;
    bytes32[2] public sharesCommitment; // first index is player, second is casino
    
    
    //bool public Folded = false; 
    //bool public gameOver;
    //uint256 public gameTimeInterval; 
    //uint256 public gameTime = 2**256 - 1;
    
    //event gameHosted();
    
    // struct gameState {
    //     uint8 num;
    //     address whoseTurn;
    // }
    
    //gameState public state;
    
    constructor() {
        player1 = msg.sender;
        stages = STAGES.DEALING;
        betPlayer1 = blindFeeBig; //first player to join is dealer aka P1, this part should be handled in joinGame
        
    }
    
    // function that can be called to receive ether, might not be needed
    function setBigBlind() external payable{
        require(msg.value == .002 ether,"Wrong value. Must be .002 ether");
        
    }
    
    // returns current balance of contract
    function getBalance() external view returns(uint){
        return address(this).balance;
    }
    // for player to join game
    function joinGame(string memory x) public payable {
        //require(!gameOver, "Game was canceled."); // maybe take this out
        require(msg.value == blindFeeSmall, "invalid bet amount. Must be .001 ether");
        player2 = msg.sender;
        betPlayer2 = msg.value;
        commitPlayerShare(x);
        // state.whoseTurn = player1; // this should adjust when determining who the Dealer is 
        
        //emit gameHosted();
        }
        
     // This is called when player wants to leave(press quit on front end), transfers the funds back to casino:
    function leaveGame() public {
        require(msg.sender == player1, "Only casino has access to this.");
        player1.transfer(address(this).balance);
    }
    
    // commits share of the player by hashing
    function commitPlayerShare(string memory x) public{
        sharesCommitment[0] = keccak256(abi.encodePacked(x));
    }
    
    function commitCasinoShare(string memory x) public{
        sharesCommitment[1] = keccak256(abi.encodePacked(x));
    }
    function getSharesCommit() public view returns(bytes32[2] memory){
        return sharesCommitment;
    }
    //deal function, assigns card to its according player
    function cardDeal(string[4] memory x) public{
        playerHand[0] = x[0];
        playerHand[1] = x[1];
        casinoHand[0] = x[2];
        casinoHand[1] = x[3];
        
        // now commitment
        playerCommitment[0] = keccak256(abi.encodePacked(x[0]));
        playerCommitment[1] = keccak256(abi.encodePacked(x[1]));
        casinoCommitment[0] = keccak256(abi.encodePacked(x[2]));
        casinoCommitment[1] = keccak256(abi.encodePacked(x[3]));
        
        //change stage of game
        stages = STAGES.PREFLOP;
    }
    
     function getHands()public view returns ( string[4] memory){
        string[4] memory data;
        data[0] = playerHand[0];
        data[1] = playerHand[1];
        data[2] = casinoHand[0];
        data[3] = casinoHand[1];
        return data;
        
    }
    
    
    function getP1Hand()public view returns ( string[2] memory){
        return playerHand;
    }
    
    function getP2Hand()public view returns ( string[2] memory){
        return casinoHand;
    }
    
    function getP1Commitment() public view returns(bytes32[2] memory){
        return casinoCommitment;
    }
    
    function getP2Commitment() public view returns(bytes32[2] memory){
        return playerCommitment;
    }
    
    function flop(string[3] memory x) public{
        communityPile[0] = x[0];
        communityPile[1] = x[1];
        communityPile[2] = x[2];
        
        //commitment 
        communityPileCommitment[0] = keccak256(abi.encodePacked(x[0]));
        communityPileCommitment[1] = keccak256(abi.encodePacked(x[1]));
        communityPileCommitment[2] = keccak256(abi.encodePacked(x[2]));
        stages = STAGES.FLOP;
    }
    
    // getters for flop
    function getCommunityPile() public view returns (string[5] memory){
        return communityPile;
    }
    
    function getCommunityPileCommitment() public view returns (bytes32[5] memory){
        return communityPileCommitment;
    }
    
    function turn(string memory x) public{
        communityPile[3] = x;
        communityPileCommitment[3] = keccak256(abi.encodePacked(x));
        stages = STAGES.TURN;
    }
    
    function river(string memory x) public{
        communityPile[4] = x;
        communityPileCommitment[4] = keccak256(abi.encodePacked(x));
        stages = STAGES.RIVER;
    }
    
    
    
    
    
    function  Call(uint256 amount) public payable {
        // amount is how much to call in wei
       //require(msg.sender == state.whoseTurn, "Denied - not your turn");
       require(msg.value == amount, "Not calling by the correct amount");
       if(msg.sender == player1){
           betPlayer1+=amount;
       }
       
       else if(msg.sender == player2){
           betPlayer2+=amount;
       }
    }
    
    function Raise(uint256 amount) payable public { //needs to be tweaked to control raise factor
        //require(msg.sender == state.whoseTurn, "Denied - not your turn");
        require(msg.value == amount,"raised by wrong amount");
         if ( msg.sender == player1){
             betPlayer1+=amount;
             
         }
        else if(msg.sender == player2){
           betPlayer2+=amount;
       }
    }
    
    // function to get contract ready for new game
    function restartGame() public{
        stages = STAGES.DEALING;
        betPlayer1 = blindFeeBig;
        betPlayer2 = 0;
        playerHand[0] = "";
        playerHand[1] = "";
        casinoHand[0] = "";
        casinoHand[1] = "";
        playerCommitment[0] = "";
        playerCommitment[1] = "";
        casinoCommitment[0] = "";
        casinoCommitment[1] = "";
        communityPile[0] = "";
        communityPile[1] = "";
        communityPile[2] = "";
        communityPile[3] = "";
        communityPile[4] = "";
        communityPileCommitment[0] = "";
        communityPileCommitment[1] = "";
        communityPileCommitment[2] = "";
        communityPileCommitment[3] = "";
        communityPileCommitment[4] = "";
        sharesCommitment[0] = 0;
        sharesCommitment[1] = 0;
        
    }
    
    function Fold() public {
        //require(msg.sender == state.whoseTurn, "Denied - not your turn");
         if ( msg.sender == player1){
             //player2.transfer(betPlayer2+betPlayer1);
             player2.transfer(address(this).balance);
         }
        else if (msg.sender == player2){player1.transfer(address(this).balance);}
        restartGame();
        
    
    }
    
    // for revealing shares 
    function revealPlayer(string memory playerShare) public {
        require(keccak256(abi.encodePacked(playerShare)) == sharesCommitment[0],"Player's hash is not the same");
        stages = STAGES.PAYOUT;
    }
    function revealCasino(string memory casinoShare) public {
        require(keccak256(abi.encodePacked(casinoShare)) == sharesCommitment[1],"Casino's hash is not the same");
        stages = STAGES.PAYOUT;
        
    }
    
    // to reveal cards, for player and casino hands, pass the partially decrypted cards
    function cardsReveal(string[5] memory pile,string[2] memory playerCards,string[2] memory casinoCards) public view{
        //community pile
        require(keccak256(abi.encodePacked(pile[0])) == communityPileCommitment[0],"First card of community pile didnt match");
        require(keccak256(abi.encodePacked(pile[1])) == communityPileCommitment[1],"Second card of community pile didnt match");
        require(keccak256(abi.encodePacked(pile[2])) == communityPileCommitment[2],"Third card of community pile didnt match");
        require(keccak256(abi.encodePacked(pile[3])) == communityPileCommitment[3],"Fourth card of community pile didnt match");
        require(keccak256(abi.encodePacked(pile[4])) == communityPileCommitment[4],"Fifth card of community pile didnt match");
        
        //player's hand
        require(keccak256(abi.encodePacked(playerCards[0])) == playerCommitment[0],"First card of player's hand didnt match");
        require(keccak256(abi.encodePacked(playerCards[1])) == playerCommitment[1],"Second card of player's hand didnt match");
        
        // casino's hand
        require(keccak256(abi.encodePacked(casinoCards[0])) == casinoCommitment[0],"First card of casino's hand didnt match");
        require(keccak256(abi.encodePacked(casinoCards[1])) == casinoCommitment[1],"Second card of casino's hand didnt match");
        
        
    }
    
    // if there is a winner,call this function to transfer money accordingly,(make sure to call revealCasino before this function)
    function determineWinner(string memory winner,string[5] memory pile,string[2] memory playerCards,string[2] memory casinoCards) public{
        require(stages == STAGES.PAYOUT,"Denied - Not in Payout stage");
        cardsReveal(pile,playerCards,casinoCards);
        
        bytes32 result = keccak256(abi.encodePacked(winner));
        if(result == keccak256(abi.encodePacked("Player wins!"))){
            player2.transfer(address(this).balance);
            
        }
        else if(result == keccak256(abi.encodePacked("Casino wins!"))){
            player1.transfer(address(this).balance);
        }
        restartGame();
    }
    
    //If a dead tie was determined, call this function
    function splitPot() public{
        require(stages == STAGES.PAYOUT, "Denied - Not in Payout stage");
            player1.transfer(betPlayer1);
            player2.transfer(betPlayer2);
            restartGame();
    }
    
    
}