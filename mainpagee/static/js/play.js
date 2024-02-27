const button = document.querySelector('#bet');
const button2 = document.querySelector('#fold')
const button5 = document.querySelector('#raise');
const button6 = document.querySelector('#check');
const button7 = document.querySelector('#call');
const status = document.querySelector('#status');
const milliethers = document.querySelector('#milliethersCount');
const text1 = document.querySelector('#betmsg');
const text2 = document.querySelector('#bet_total');


var milliethersCount = 100;
var max_card = 2;
var chose = 0;
var approve = false;
var bet_total = 0;
var clicked_bet = false;
var finished_Turn = false;
var finished_River = false;
var picked_2cards = false;
var timer = false;
var folded = false;
var first_round = true;
let call_bet = 1;
var casino_folded = false;
var casino_called = false;
var casino_raised = false;
var casino_checked = false;
var player_folded = false;
var player_called = false;
var player_raised = false;
var player_checked = false;
// var casino_card1 ="";
// var casino_card2 ="";
var casino_cards = [];
var player_cards = [];
var phase = "Pre-flop";
var playerIndex = [];
var casinoIndex = [];
var communityIndex = [];

var share; // player's share of private key
var publicKey; // public keys
var playerAddress;
var dealComplete = false;
var choices = []; // what they picked for their cards(0,1 player, 2-3 casino)
var communityPile = [];
var lookUpTable = [];
var L = []; // holds cards in play, encrypted
var partialCards = []; // holds partially decr cards for player
//var activeGame = false;
var entered = false;

// these dont have to be reset after game
var contractAddress; //contract address
var playerObj; // holds web3 obj of player
var contractInstance;
var abi;
var BigInteger = forge.jsbn.BigInteger;

document.getElementById("phase").innerText = phase;


var deck = ["1S","2S","3S","4S","5S","6S","7S","8S", "9S", "10S","11S","12S","13S",
"1D","2D","3D","4D","5D","6D","7D","8D", "9D", "10D","11D","12D","13D",
"1C","2C","3C","4C","5C","6C","7C","8C", "9C", "10C","11C","12C","13C",
"1H","2H","3H","4H","5H","6H","7H","8H", "9H", "10H","11H","12H","13H"
];

function encrypt(m,pubKeys){ // m can be "0","1",...,"52" in string form
  console.log("STARTING ENCRYPT...");
  let mBig = new BigInteger(m);
  let u;
  let gcdUN;
  // to generate a suitable u..
  do{   // amount of bytes here might have to be lower than 200, could affect padding
    let bytes = forge.util.bytesToHex(forge.random.getBytesSync(100));
    let bytesBig = new BigInteger(bytes,16);
    u = bytesBig.mod(pubKeys[2]);
    gcdUN = u.gcd(pubKeys[2]);
  }while(gcdUN.toString() != "1");
  console.log("u was found.");
  console.log("u is: ", u.toString());
  console.log("bit length of u is: ", u.bitLength());
  console.log("gcd(u,n) is: ", gcdUN.toString());

  //encrypting below:
  let yRaisedM = pubKeys[0].pow(mBig);
  let uRaisedR = u.pow(pubKeys[1]);
  let ymMult = yRaisedM.multiply(uRaisedR);
  let enc = ymMult.mod(pubKeys[2]);
  return enc;
}

function partialDecryptPlayer(c,share,pubKeys){
  let dec = c.modPow(share,pubKeys[2]);
  return dec;
  
}
function partialDecryptFinal(c1,c2,pubKeys,table){

  let c1c2 = c1.multiply(c2);  // c^d
  let m;
  let dec = c1c2.mod(pubKeys[2]); // decrypting has the property: c^d mod n = y^(md) mod n, where d = phi(n) / r
  for(var i = 0; i < 53; i++){
    if(table[i] == dec.toString()){
      m = i.toString();
      break;
    }
    
  }
  return m;
}
async function enter(){
  console.log("entered play page");
  playerObj = new Web3(window.ethereum);
  await ethereum.enable();
  let playerAddresses = await playerObj.eth.getAccounts();
    //gets first account thats connected
  playerAddress = playerAddresses[0];
  let initBalance = await playerObj.eth.getBalance(playerAddress); //gives balance in wei
  milliethersCount = await playerObj.utils.fromWei(initBalance, 'milliether');
  milliethers.innerText = milliethersCount;
  console.log("initialized balanced");
  entered = true;
}



// function for the start button
async function bet() {
  if (clicked_bet == true){
    
    document.getElementById("betmsg").innerText = "Game started already. You can either play the game or forfeit.";
  }
  if (entered == false){
    
    document.getElementById("casinomsg").innerText = "Still getting your balance";
  }
  else if (1 <= milliethersCount ){
    document.getElementById("casinomsg").innerText = "Running keygen..";
    show_loader();
    //ajax request
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET","/init",true);
    xhttp.onloadend = async function(){
      let data = JSON.parse(xhttp.responseText);
      console.log("share,public key and contract address are: ", data);
      share = data.share;
      publicKey = data.pub;
      contractAddress = data.contract;
      abi = data.abi;
      lookUpTable = data.table;
      //converting public key to big integer
      for(var i = 0;i < 3;i++){
        let temp = new BigInteger(publicKey[i]);
        publicKey[i] = temp;
      }
      //new stuff below***********
      let playerRandomness = [];
    for(var i = 0; i < 9; i++){
      let r = Math.floor(Math.random() * 52);
      let enc = encrypt(r.toString(),publicKey);
      playerRandomness.push(enc.toString());
    }
    console.log("player randomness is: ", playerRandomness);
    let sendRandom = {
      "playerR": playerRandomness,
      "playerShare":share
    }
    console.log(JSON.stringify(sendRandom));
    document.getElementById("casinomsg").innerText = "Generating cards cooperatively..";
    let xhttp2 = new XMLHttpRequest();
    xhttp2.open("POST","/cardGen",true);
    xhttp2.setRequestHeader("Content-Type","application/json");
    xhttp2.onloadend = function(){
        let data2 = JSON.parse(xhttp2.responseText);
        choices = data2.choices;
        partialCards.push(choices[0],choices[1]);
        console.log("PARTIAL CARDS IS: ",partialCards);
        L = data2.L;
        console.log("L IS: ", L);
        dealComplete = true;
        CasinoPlaceBigBlind();
        approve = true;
        clicked_bet = true;
        //decrypt players cards:
        
        //card 1
        let card1 = new BigInteger(choices[0]);
        let shareBig = new BigInteger(share);
        let l1Big = new BigInteger(L[1]);
        let card1Partial = partialDecryptPlayer(l1Big,shareBig,publicKey);
        let card1Dec = partialDecryptFinal(card1,card1Partial,publicKey,lookUpTable);
        
        //card 2
        let card2 = new BigInteger(choices[1]);
        let l2Big = new BigInteger(L[2]);
        let card2Partial = partialDecryptPlayer(l2Big,shareBig,publicKey);
        let card2Dec = partialDecryptFinal(card2,card2Partial,publicKey,lookUpTable);

        choices[0] = card1Dec;
        choices[1] = card2Dec;
        //timeleft = 60;
        //onTimer();
        console.log("dealComplete is: ", dealComplete);
        console.log("choices is: ", choices);
        timeleft = 60;
        onTimer();
        hide_loader();
        
    }
    xhttp2.send(JSON.stringify(sendRandom));

    //creating contract instance
    contractInstance = await new playerObj.eth.Contract(JSON.parse(abi),contractAddress);
    console.log("contract instance is: ", contractInstance);
    let playerAddresses = await playerObj.eth.getAccounts();
    //gets first account thats connected
    playerAddress = playerAddresses[0];
    console.log("player's address is",playerAddress);
    
  // small blind
  console.log("sending transaction for small blind and committing player's share");
  await contractInstance.methods.joinGame(share).send({
    from: playerAddress,
    gas:400000, // play around with this value to minimize amt of gas 
    value: playerObj.utils.toWei("1","milliether")
  });
  console.log("small blind was set");

    bet_total += 1;
    let weiBalance = await playerObj.eth.getBalance(playerAddress); //gives balance in wei
    milliethersCount = await playerObj.utils.fromWei(weiBalance, 'milliether');
    milliethers.innerText = milliethersCount;
    document.getElementById("betmsg").innerText = "Placed 1 milliethers for small blind";
    document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
    // timeleft = 60;
    // onTimer();
    // hide_loader();
      
    }
    xhttp.send();
    
    
  }
  else{
    document.getElementById("betmsg").innerText = "You don't have not enough milliethers to bet.";
  }

}
function Casnio_pick_cards(choice){
  let r1 = choices[choice];
  let r1Int = parseInt(r1,10);
  casino_cards.push(deck[r1Int]);
  casinoIndex.push(r1Int);
  
}

// function to choose first 4 cards
function pickCard1() {
  if (max_card > 0 && clicked_bet == true){
    pickaRandomCards("card1",0);
  }
}

function pickCard2() {
  if (max_card > 0 && clicked_bet == true){
    pickaRandomCards("card2",1);
  }
}


function pickCard3() {
  if (max_card > 0 && clicked_bet == true){
    pickaRandomCards("card3",2);
  }
}

function pickCard4() {
  if (max_card > 0 && clicked_bet == true){
    pickaRandomCards("card4",3);
  }
}
console.log(player_cards);

// randomize cards
function pickaRandomCards(id,choice){
  let r1 = choices[choice];
  let r1Int = parseInt(r1,10);
  var card = deck[r1Int];
  document.getElementById(id).style.display='none';
  document.getElementById(id).src = "/poker-img/"+card+".jpg";
  
  document.getElementById("status").innerText = "You picked " + card ;
  player_cards.push(card);
  playerIndex.push(r1Int);
  

  

  

  if(chose == 0){
    timeleft=61;
    document.getElementById("yourcard1").height = 225;
    document.getElementById("yourcard1").width = 150;

    document.getElementById("yourcard1").style.display='unset';
    document.getElementById("yourcard1").src = "/poker-img/"+card+".jpg" ;
    document.getElementById("yourcard1").value == "1";
    document.getElementById("yourcards").innerText = "Your Cards:" ;
    chose += 1
  }
  else {
    document.getElementById("yourcard2").height = 225;
    document.getElementById("yourcard2").width = 150;
    document.getElementById("yourcard2").style.display='unset';
    document.getElementById("yourcard2").src = "/poker-img/"+card+".jpg" ;
    document.getElementById("status1").innerText = "Casino's cards: ";
    document.getElementById("betmsg").innerText = "Choose call/ raise/ fold."
    document.getElementById("casinomsg").innerText = "";
    picked_2cards = true;
    
    document.getElementById("check").style.visibility='hidden';
    
    if (timer == true){
      timeleft=61;
    }
    else{
      onTimer();
    }
   
  }
  
  Casnio_pick_cards(choice + 2);
  max_card -= 1;

}

//casion place blind (2milliethers)
function CasinoPlaceBigBlind(){
  bet_total += 2;
  document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
  document.getElementById("casinomsg").innerText = "Casino placed a big blind (2 milliethers). Pick the first two cards";
  
}

//casino action choice check/fold/raise
 function CasinoAction(){
  //var action = Math.floor(Math.random() * 3);
  let action;
  let deckG = getDeck();
  let casinoHand = [deckG[casinoIndex[0]],deckG[casinoIndex[1]]];
  let communityPileG;
  
  //console.log(casinoHand);
  console.log("phase is: ", phase);
  if(phase == "Pre-flop"){
    action = 1;
  }
  else if(phase == "Flop"){
    console.log("flop block");
    communityPileG = [deckG[communityIndex[0]],deckG[communityIndex[1]], deckG[communityIndex[2]]];
    console.log("community pile is: ",communityPileG);
    casinoHand = casinoHand.concat(communityPileG);
    console.log("casino hand is: ", casinoHand);
    let result = EvaluateHand(casinoHand);
    action = decisionForFlop(result);
    console.log("their hand is: ", casinoHand);
    console.log("result is: ", result);
    console.log("action is",action);
  }
  else if(phase == "Turn"){
    console.log("turn block");
    communityPileG = [deckG[communityIndex[0]],deckG[communityIndex[1]], deckG[communityIndex[2]],deckG[communityIndex[3]]];
    console.log("community pile is: ",communityPileG);
    casinoHand = casinoHand.concat(communityPileG);
    let result = EvaluateHand(casinoHand);
    action = decisionForTurn(result);
    console.log("their hand is: ", casinoHand);
    console.log("result is: ", result);
    console.log("action is",action);
  }
  else if(phase == "River"){
    console.log("river block");
    communityPileG = [deckG[communityIndex[0]],deckG[communityIndex[1]], deckG[communityIndex[2]],deckG[communityIndex[3]],deckG[communityIndex[4]]];
    console.log("community pile is: ",communityPileG);
    casinoHand = casinoHand.concat(communityPileG);
    let result = EvaluateHand(casinoHand);
    action = decisionForRiver(result);
    console.log("their hand is: ", casinoHand);
    console.log("result is: ", result);
    console.log("action is",action);
  }

  if (action == 1){
    document.getElementById("casinomsg").innerText = phase +":  Dealer Checked! You can call Check/ fold/ raise";
    if(player_checked == true && phase == "River" ){ 
      //show_loader();
      showdown();
    }
     else if ( phase =="Pre-flop"){
        change_phase();
      }
     else if (  player_checked == true){
      casino_checked = true;
      player_checked = false;
      change_phase();


    }
    document.getElementById("check").style.visibility='visible';
    document.getElementById("fold").style.visibility='visible';
    document.getElementById("raise").style.visibility='visible';
    document.getElementById("call").style.visibility='hidden';
    if(phase!= "River"){
      hide_loader();
    }
    

  }
  else if (action == 0){
    let xhttp = new XMLHttpRequest();
    show_loader();
    xhttp.open("GET","/casinoFold",true);
    xhttp.onloadend = function(){
      document.getElementById("casinomsg").innerText =  phase +": Dealer Folded! You gained " + bet_total +" milliethers!";
      milliethersCount += bet_total;
      milliethers.innerText = milliethersCount;
      casino_folded = true;
      restart_game();
      hide_loader();
    }
    xhttp.send();

     
  }

  else if (action == 2){
    let raise;
    if(call_bet >= 5){
      raise = call_bet + 1
    }
    else{
      raise = 5;
    }
    document.getElementById("casinomsg").innerText =  phase +":  Dealer raised "+ raise+ " milliethers! You can call/ raise/ fold.";
    //let callTemp = call_bet;
    // call_bet = 5;
    let data ={
      "amt": playerObj.utils.toWei(raise.toString(),"milliether")
    }
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST","/casinoRaise",false);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.onloadend = function(){
      bet_total += raise;
      document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
      document.getElementById("call").style.visibility='visible';
      document.getElementById("fold").style.visibility='visible';
      document.getElementById("raise").style.visibility='visible';
      document.getElementById("check").style.visibility='hidden';
      casino_raised = true;
      call_bet = raise - call_bet;
      hide_loader();
    }
    xhttp.send(JSON.stringify(data));
    
    
  }
}

//casino action choice call/fold/raise
function CasinoAction2(){
  let action;
  let deckG = getDeck();
  let casinoHand = [deckG[casinoIndex[0]],deckG[casinoIndex[1]]];
  let communityPileG;
  
  //console.log(casinoHand);
  console.log("phase is: ", phase);
  if(phase == "Pre-flop"){
    action = 1;
  }
  else if(phase == "Flop"){
    communityPileG = [deckG[communityIndex[0]],deckG[communityIndex[1]], deckG[communityIndex[2]]];
    console.log("community pile is: ",communityPileG);
    casinoHand = casinoHand.concat(communityPileG);
    let result = EvaluateHand(casinoHand);
    action = decisionForFlop(result);
    console.log("their hand is: ", casinoHand);
    console.log("result is: ", result);
    console.log("action is",action);
  }
  else if(phase == "Turn"){
    communityPileG = [deckG[communityIndex[0]],deckG[communityIndex[1]], deckG[communityIndex[2]],deckG[communityIndex[3]]];
    console.log("community pile is: ",communityPileG);
    casinoHand = casinoHand.concat(communityPileG);
    let result = EvaluateHand(casinoHand);
    action = decisionForTurn(result);
    console.log("their hand is: ", casinoHand);
    console.log("result is: ", result);
    console.log("action is",action);
  }
  else if(phase == "River"){
    communityPileG = [deckG[communityIndex[0]],deckG[communityIndex[1]], deckG[communityIndex[2]],deckG[communityIndex[3]],deckG[communityIndex[4]]];
    console.log("community pile is: ",communityPileG);
    casinoHand = casinoHand.concat(communityPileG);
    let result = EvaluateHand(casinoHand);
    action = decisionForRiver(result);
    console.log("their hand is: ", casinoHand);
    console.log("result is: ", result);
    console.log("action is",action);
  }
  if (action == 1){
    let callWei = playerObj.utils.toWei(call_bet.toString(),"milliether");
    let data = {
      "amt": callWei
    }
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST","/casinoCall",false);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.onload = function(){
      if(phase!= "River"){
        hide_loader();
      }
      document.getElementById("casinomsg").innerText =  phase +": Dealer called! Total bet + "+call_bet+ " You can call Check/ fold/ raise";
      bet_total += call_bet;
      call_bet = 0;

      document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
      if(player_raised == true && phase == "River" ){ 
      //show_loader();
      showdown();

      }
      else{
        change_phase();
        casino_called = true;

      }
      document.getElementById("check").style.visibility='visible';
      document.getElementById("fold").style.visibility='visible';
      document.getElementById("raise").style.visibility='visible';
      document.getElementById("call").style.visibility='hidden';
    }
    xhttp.send(JSON.stringify(data));
    
    

  }
  else if (action == 0){
    let xhttp = new XMLHttpRequest();
    show_loader();
    xhttp.open("GET","/casinoFold",true);
    xhttp.onloadend = function(){
      document.getElementById("casinomsg").innerText =  phase +": Dealer Folded! You gained " + bet_total +" milliethers!";
      milliethersCount += bet_total;
      milliethers.innerText = milliethersCount;
      casino_folded = true;
      restart_game();
      hide_loader();
    }
    xhttp.send();  
  }

  else if (action == 2){
    let raise;
    if(call_bet >= 5){
      raise = call_bet + 1
    }
    else{
      raise = 5;
    }
    document.getElementById("casinomsg").innerText =  phase +":  Dealer raised "+ raise+ " milliethers! You can call/ raise/ fold.";
    //let callTemp = call_bet;
    // call_bet = 5;
    let data ={
      "amt": playerObj.utils.toWei(raise.toString(),"milliether")
    }
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST","/casinoRaise",false);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.onloadend = function(){
      bet_total += raise;
      document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
      document.getElementById("call").style.visibility='visible';
      document.getElementById("fold").style.visibility='visible';
      document.getElementById("raise").style.visibility='visible';
      document.getElementById("check").style.visibility='hidden';
      casino_raised = true;
      call_bet = raise - call_bet;
      hide_loader();
    }
    xhttp.send(JSON.stringify(data));
    
  }
}

//function to show the community pile

function showCommunityCards_Flop(){
  
  let data = {
    "share": share
  }
  //show_loader();
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST","/flop",false);
  xhttp.setRequestHeader("Content-type","application/json");
  xhttp.onloadend = function(){
    //hide_loader();
    let data = JSON.parse(xhttp.responseText)
    communityPile = data.pile;
    console.log("community pile is: ", communityPile);
    let i;
    for (i = 1; i<=3; i++){
      let r = communityPile[i-1];
      let rInt = parseInt(r,10);
      var card = deck[rInt];
      document.getElementById("communitycards"+i).height = 225;
      document.getElementById("communitycards"+i).width = 150;
      document.getElementById("communitycards"+i).src = "/poker-img/"+card+".jpg" ;
      document.getElementById("communitycards"+i).style.display='unset';
      document.getElementById("communitycards").innerText = "Community pile:" ;
      communityIndex.push(rInt);
      
      
    }
    for (i = 4; i<=5; i++){
      
      document.getElementById("communitycards"+i).height = 225;
      document.getElementById("communitycards"+i).width = 150;
      document.getElementById("communitycards"+i).style.display='unset';
      document.getElementById("communitycards"+i).src = "/poker-img/back.jpg" ;    
    }
    
  }
  xhttp.send(JSON.stringify(data));
  
}

//Turn function (show fourth card)

function Turn(){
    let data = {
      "share": share
    }
    //show_loader();
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST","/turn",false);
    xhttp.setRequestHeader("Content-type","application/json");
    xhttp.onloadend = function(){
      //hide_loader();
      let data = JSON.parse(xhttp.responseText);
      communityPile = data.pile;
      console.log("community pile is: ", communityPile);
      let r = communityPile[3];
      let rInt = parseInt(r,10);
      var card = deck[rInt];
      document.getElementById("communitycards4").src = "/poker-img/"+card+".jpg" ;
      communityIndex.push(r);

    }
    xhttp.send(JSON.stringify(data));
}

//Turn function (show fifth card)
function River(){
  let data = {
    "share": share
  }
  //show_loader();
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST","/river",false);
  xhttp.setRequestHeader("Content-type","application/json");
  xhttp.onloadend = function(){
    //hide_loader();
    let data = JSON.parse(xhttp.responseText);
    communityPile = data.pile;
    console.log("community pile is: ", communityPile);
    let r = communityPile[4];
    let rInt = parseInt(r,10)
    var card = deck[rInt];
    document.getElementById("communitycards5").src = "/poker-img/"+card+".jpg" ;
    communityIndex.push(r);
    hide_loader();

  }
  xhttp.send(JSON.stringify(data));
  
}


//reveal casino cards
function showdown(){
  console.log("start of showdown...");
  for (i = 1; i <=4; i++){
    document.getElementById("card"+i).style.display='none';
    document.getElementById("card"+i).style.display='none';
  }
  document.getElementById("casinocard1").height = 225;
  document.getElementById("casinocard1").width = 150;
  document.getElementById("casinocard2").height = 225;
  document.getElementById("casinocard2").width = 150;
  document.getElementById("casinocard1").src = "/poker-img/"+casino_cards[0]+".jpg" ;
  document.getElementById("casinocard2").src = "/poker-img/"+casino_cards[1]+".jpg" ;
  document.getElementById("casinocard1").style.display='unset';
  document.getElementById("casinocard2").style.display='unset';
  // reveal and determining winner here...
  let deckG = getDeck();
  let playerHandG = [deckG[playerIndex[0]],deckG[playerIndex[1]]];
  let casinoHandG = [deckG[casinoIndex[0]],deckG[casinoIndex[1]]];
  let communityPileG = [deckG[communityIndex[0]],deckG[communityIndex[1]], deckG[communityIndex[2]],deckG[communityIndex[3]],deckG[communityIndex[4]]];
  console.log("playerIndex is: ", playerIndex);
  console.log("casinoIndex is: ", casinoIndex);
  //console.log("player hand g is: ",playerHandG);
  console.log("Players handG is: ", playerHandG);
  console.log("casino handG is: ", casinoHandG);
  console.log("community pileG is: ", communityPileG);
  console.log("Player cards is: ",player_cards);
  console.log("Casino card 1 is: ", casino_cards[0]);
  console.log("Casino card 2 is: ", casino_cards[1]);

  playerHandG = playerHandG.concat(communityPileG);
  casinoHandG = casinoHandG.concat(communityPileG);
  let resultPlayer = EvaluateHand(playerHandG);
  let resultCasino = EvaluateHand(casinoHandG);
  console.log("Players result is: ", resultPlayer);
  console.log("Casinos result is: ", resultCasino);
  let finalResult = EvaluateWinner(playerHandG,casinoHandG,resultPlayer,resultCasino);
  

  let data = {
    "playerCards" : partialCards,
    "communityPile": communityPile,
    "share":share,
    "winner": finalResult
  }
  
  document.getElementById("casinomsg").innerText =  "Revealing shares and determining winner" ;
  timeleft = 200;
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST","/reveal",true);
  xhttp.setRequestHeader("Content-type","application/json");
  xhttp.onloadend = async function(){
    hide_loader();
    
    for (i = 1; i <=4; i++){
      document.getElementById("card"+i).style.display='none';
      document.getElementById("card"+i).style.display='none';
    }
    document.getElementById("casinocard1").height = 225;
    document.getElementById("casinocard1").width = 150;
    document.getElementById("casinocard2").height = 225;
    document.getElementById("casinocard2").width = 150;
    document.getElementById("casinocard1").src = "/poker-img/"+casino_cards[0]+".jpg" ;
    document.getElementById("casinocard2").src = "/poker-img/"+casino_cards[1]+".jpg" ;
    document.getElementById("casinocard1").style.display='unset';
    document.getElementById("casinocard2").style.display='unset';
  

    phase = "Showdown";
    document.getElementById("phase").innerText = phase;
    document.getElementById("betmsg").innerText =  "The game will restart in 15 seconds! " ;
    document.getElementById("casinomsg").innerText = finalResult;
    timeleft = 15;
    let weiBalance = await playerObj.eth.getBalance(playerAddress); //gives balance in wei
    milliethersCount = await playerObj.utils.fromWei(weiBalance, 'milliether');
    milliethers.innerText = milliethersCount;

  }
  xhttp.send(JSON.stringify(data));
  
  

}

//check button function for player

function check(){
  player_checked = true;
  if(picked_2cards == true && casino_checked == true && phase ==  "River"){ 
    showdown();
  }
  else if (casino_checked == true && picked_2cards == true ){
    show_loader();
    player_checked = true;
    document.getElementById("betmsg").innerText =  "You checked! " ;
    document.getElementById("casinomsg").innerText = "Waiting casino decision...";
    //show_loader();
    hide_all_button();
    change_phase();  
    setTimeout(function(){
      CasinoAction();

    }, 1000);
    //hide_loader();
  }
  else if(casino_checked == false && picked_2cards == true ){
    show_loader();
    player_checked = true;
    document.getElementById("betmsg").innerText =  "You checked! " ;
    document.getElementById("casinomsg").innerText = "Waiting casino decision...";
    //show_loader();
    hide_all_button();
    setTimeout(function(){
      CasinoAction();
    }, 1000);  
    //hide_loader();
    //casino_checked = false;
  }
  if (timer == true){
    timeleft=61;
  }
}

function reset_record(){
  casino_folded = false;
  casino_called = false;
  casino_raised = false;
  casino_checked = false;
  player_folded = false;
  player_called = false;
  player_raised = false;
  player_checked = false;
}

// raise button function for player

async function raise(){
  var raise_amount = Number(document.getElementById('raise_amount').value);

  if (picked_2cards == true && raise_amount > milliethersCount){
    document.getElementById("status").innerText = "Not enough milliethers to raise";
  }
  else if(picked_2cards == true && raise_amount == 0){
    document.getElementById("status").innerText = "Raise amount not entered!";
  }
  else if(picked_2cards == true && raise_amount <= call_bet){
    document.getElementById("status").innerText = "Raise amount is less than call!";
  }

  else if (picked_2cards == true ){
    // call contract to raise
    show_loader();
    document.getElementById("betmsg").innerText = "Processing transaction";
    timeleft = 61;
    let raiseWei = playerObj.utils.toWei(raise_amount.toString(),"milliether");
    await contractInstance.methods.Raise(raiseWei).send({
      from: playerAddress,
      gas:400000, // play around with this value to minimize amt of gas 
      value: raiseWei
    });

     player_raised = true;
     milliethersCount -= raise_amount ;
     milliethers.innerText = milliethersCount;
     bet_total += raise_amount;
     call_bet = raise_amount - call_bet;
     document.getElementById("bet_total").innerText =  "Total bet: " + bet_total;
     document.getElementById("betmsg").innerText =  "You raised " + raise_amount +" milliethers!" ;
     document.getElementById("casinomsg").innerText = "Waiting casino decision...";
     //show_loader();
     hide_all_button();
     setTimeout(function(){
      CasinoAction2();

    }, 1000);
    //hide_loader();
     

  }
  if (timer == true){
    timeleft=61;
  }

}
// call button function for player

async function call(){
  if (picked_2cards == true && call_bet> milliethersCount ){
    document.getElementById("status").innerText = "Not enough milliethers to call";

  }
  else if( picked_2cards == true && phase ==  "River" ){
    show_loader();
    document.getElementById("betmsg").innerText = "Processing transaction";
    timeleft = 61;
    let callWei = playerObj.utils.toWei(call_bet.toString(),"milliether");
    await contractInstance.methods.Call(callWei).send({
      from: playerAddress,
      gas:400000, 
      value: callWei
    });
    //hide_loader();
    bet_total += call_bet;
    document.getElementById("bet_total").innerText = "Total bet:" + bet_total; 
    showdown();

  }
  else if (picked_2cards == true && phase == "Pre-flop"){
    show_loader();
    console.log("Player called");
    document.getElementById("betmsg").innerText = "Processing transaction";
    timeleft = 61;
    let callWei = playerObj.utils.toWei(call_bet.toString(),"milliether");
    await contractInstance.methods.Call(callWei).send({
      from: playerAddress,
      gas:400000,  
      value: callWei
    }); 
    player_called = true;
    bet_total += call_bet;
    document.getElementById("betmsg").innerText = "You called using " + call_bet+ " milliethers";
    milliethersCount -= call_bet ;
    milliethers.innerText = milliethersCount;
    document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
    
    document.getElementById("casinomsg").innerText = "Waiting casino decision...";
    //show_loader();
    hide_all_button();
    setTimeout(function(){
      CasinoAction();
    }, 1000); 
    //hide_loader();
  }
  else if (picked_2cards == true && casino_raised == true ){
    show_loader();
    timeleft = 61;
    let callWei = playerObj.utils.toWei(call_bet.toString(),"milliether");
    document.getElementById("betmsg").innerText = "Processing transaction";
    await contractInstance.methods.Call(callWei).send({
      from: playerAddress,
      gas:400000,  
      value: callWei
    }); 
    player_called = true;
    bet_total += call_bet;
    document.getElementById("betmsg").innerText = "You called using " + call_bet+ " milliethers";
    milliethersCount -= call_bet ;
    milliethers.innerText = milliethersCount;
    document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
    document.getElementById("casinomsg").innerText = "";
    document.getElementById("casinomsg").innerText = "Waiting casino decision...";
    //show_loader();
    hide_all_button();
    change_phase();
    setTimeout(function(){
      CasinoAction();
    }, 1000);
    //hide_loader();
    
    
    
  }
  else if (picked_2cards == true && casino_raised == false){
    //player_called_casino_not_raised= true;
    show_loader();
    timeleft = 61;
    let callWei = playerObj.utils.toWei(call_bet.toString(),"milliether");
    await contractInstance.methods.Call(callWei).send({
      from: playerAddress,
      gas:400000, 
      value: callWei
    }); 
    player_called = true;
    bet_total += call_bet;
    document.getElementById("betmsg").innerText = "You called using " + call_bet+ " milliethers";
    milliethersCount -= call_bet ;
    milliethers.innerText = milliethersCount;
    document.getElementById("bet_total").innerText = "Total bet:" + bet_total;
    document.getElementById("casinomsg").innerText = "Waiting casino decision...";
    //show_loader();
    hide_all_button();
    setTimeout(function(){
      CasinoAction();
    }, 1000);
    //hide_loader();
    }
    //hide_loader();
  if (timer == true){
    timeleft=61;
  }
  call_bet = 0;
}
// fold button function for player
function fold() {
  if(picked_2cards == true){
    folded = true;
    document.getElementById("betmsg").innerText = "Processing transaction";
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET","/playerFold",true);
    show_loader();
    xhttp.onloadend = function(){
      timeleft = 15;
      document.getElementById("betmsg").innerText = "You folded. Restarting game in 15 seconds";
      //restart_game();
      hide_loader();
    }
    xhttp.send();
  }
}

// function to change phase

async function change_phase(){
  if (phase == "Pre-flop"){
    
    showCommunityCards_Flop();
  
    phase = "Flop";
    document.getElementById("phase").innerText = phase;
    
  }
  else if(phase == "Flop"){
    
    Turn();
    
    phase = "Turn";
    document.getElementById("phase").innerText = phase;
  }
  else if(phase == "Turn"){
    
    River();
    
    phase = "River";
    document.getElementById("phase").innerText = phase;
  }
  resetCounter();
  reset_record();

}


console.log(phase);


// timer function
var timeleft = 60;
function onTimer(){
  var downloadTimer = setInterval(function(){
  timeleft--;
  document.getElementById("mycounter").innerHTML= "Timer: " +timeleft;
  if(timeleft <= 0){
    clearInterval(downloadTimer);
    if (folded == true){
      // alert("You folded! Game restart!");
      // document.getElementById("casinomsg").innerText = "You folded. Restarting the game";
    }
    else if (phase != "Showdown"){
      // give casino back his money if player lets time run out
      // alert("You let the time run out. Restarting the game");
      document.getElementById("casinomsg").innerText = "You let the time run out. Restarting the game";
      let xhttp = new XMLHttpRequest();
      xhttp.open("GET","/timeout",false);
      xhttp.send();
    }

    restart_game();
  }
 },1000);
  timer = true;
  folded = false;
  casino_folded = false;
}


//function to hide button
function hide_all_button(){
  document.getElementById("check").style.visibility='hidden';
  document.getElementById("call").style.visibility='hidden';
  document.getElementById("fold").style.visibility='hidden';
  document.getElementById("raise").style.visibility='hidden';
}

function show_loader(){
  document.getElementById("loader").style.visibility='visible';
}

function hide_loader(){
  document.getElementById("loader").style.visibility='hidden';
}


//function to restart the game reset everything

function restart_game(){
  timeleft = 60;
  let xhttp = new XMLHttpRequest();
  xhttp.open("GET","/restart",false);
  //xhttp.send();
  xhttp.onloadend = function(){
    
    console.log("restarting game..");
    deck = ["1S","2S","3S","4S","5S","6S","7S","8S", "9S", "10S","11S","12S","13S",
  "1D","2D","3D","4D","5D","6D","7D","8D", "9D", "10D","11D","12D","13D",
  "1C","2C","3C","4C","5C","6C","7C","8C", "9C", "10C","11C","12C","13C",
  "1H","2H","3H","4H","5H","6H","7H","8H", "9H", "10H","11H","12H","13H"
  ];
  //deck = deck1;
    timeleft = 1;
    max_card = 2;
    chose = 0;
    approve = false;
    bet_total = 0;
    call_bet = 1;
    clicked_bet = false;
    finished_Turn = false;
    finished_River = false;
    picked_2cards = false;
    timer = false;
    first_round = true;
    casino_folded = false;
    casino_called = false;
    casino_raised = false;
    casino_checked = false;
    player_folded = false;
    player_called = false;
    player_raised = false;
    player_checked = false;
    phase = "Pre-flop";
    playerIndex.length = 0;
    casinoIndex.length = 0;
    communityIndex.length = 0;
    player_cards.length = 0;
    casino_cards.length = 0;
    
    
    share = "";
    publicKey.length = 0;
    //playerAddress = "";
    dealComplete = false;
    choices.length = 0;
    communityPile.length = 0;
    lookUpTable.length = 0;
    L.length = 0;
    partialCards.length = 0;
    //activeGame = false;
    resetCounter(); // reset counter in bott.js
    clearHistory(); // clear the history of card results in bott.js
    
    document.getElementById("status1").innerText= "Pick two cards";
    document.getElementById("casinocard1").style.display='none';
    document.getElementById("casinocard2").style.display='none';
    document.getElementById("communitycards1").style.display='none';
    document.getElementById("communitycards2").style.display='none';
    document.getElementById("communitycards3").style.display='none';
    document.getElementById("communitycards4").style.display='none';
    document.getElementById("communitycards5").style.display='none';
    document.getElementById("yourcard1").style.display='none';
    document.getElementById("yourcard2").style.display='none';
    document.getElementById("card1").src="/poker-img/back.jpg";
    document.getElementById("card1").style.display='unset';
    document.getElementById("card2").style.display='unset';
    document.getElementById("card3").style.display='unset';
    document.getElementById("card4").style.display='unset';
    document.getElementById("card2").src="/poker-img/back.jpg";
    document.getElementById("card3").src="/poker-img/back.jpg";
    document.getElementById("card4").src="/poker-img/back.jpg";
    document.getElementById("bet_total").innerText = "Total bet: " + 0;
    document.getElementById("betmsg").innerText = "Game restarted";
    document.getElementById("communitycards").innerText = "";
    document.getElementById("yourcards").innerText = "" ;
    document.getElementById("check").style.visibility='visible';
    document.getElementById("call").style.visibility='visible';
    document.getElementById("fold").style.visibility='visible';
    document.getElementById("raise").style.visibility='visible';
    document.getElementById("phase").innerText = phase;
    console.log("game restarted");
  }
  xhttp.send();
  

}

//make button clickable

button.addEventListener('click', bet);
button2.addEventListener('click', fold);
button5.addEventListener('click', raise);
button6.addEventListener('click', check);
button7.addEventListener('click', call);