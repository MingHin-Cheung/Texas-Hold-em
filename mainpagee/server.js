console.warn = () => {}; // to suppress web3 warnings
const Web3 = require('web3');
const express = require('express');
var forge = require('node-forge');
var fs = require('fs');
var HDWalletProvider = require("truffle-hdwallet-provider");
var protocol = require('./bot/protocol');
var interaction = require('./bot/interaction');
var path = require('path');
//var http = require('http');
var BigInteger = forge.jsbn.BigInteger;
var seed = "doctor grow remind robust fresh shaft stay crush clerk urge tiger dignity";
const provider = new HDWalletProvider(seed,"https://kovan.infura.io/v3/b1be893adce946fe83841884d990ebf3",0,2);
const web3 = new Web3(provider);
var abi = fs.readFileSync("abi.json").toString();

var contractAddress; // address of contract
var contractInstance; // web3 contract object
var casinoPartial = []; //holds casino's partially decrypted cards

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//to serve static files (js,css,jpg....)
app.use(express.static("static"));

// get requests for serving html files
app.get('/index.html',function(req,res){
    res.sendFile("index.html", {root: path.join(__dirname)});

});
app.get('/about.html',function(req,res){
    res.sendFile("about.html", {root: path.join(__dirname)});
});

app.get('/ranking.html',function(req,res){
    res.sendFile("ranking.html", {root: path.join(__dirname)});
});

app.get('/rules.html',function(req,res){
    res.sendFile("rules.html", {root: path.join(__dirname)});
});

app.get('/play.html',function(req,res){
    res.sendFile("play.html", {root: path.join(__dirname)});
});

//request for deploying contract 
app.get('/deploy', async function(req,res){
    await interaction.deployContract();
    contractAddress = interaction.getContractAddress();
    contractInstance = await new web3.eth.Contract(JSON.parse(abi),contractAddress);
    res.send(contractAddress);
});

//for initialzing the crypto and handling commitment for casino (player paying small blind,player commitment handled by client)
app.get('/init',async function(req,res){
    
    
    await protocol.keygen();
    console.log("Sending commit of casinos share to smart contract...");
    await protocol.commitCasino(contractInstance,interaction.getCasinoAddress());
    console.log("commitment of casino was sent");
    console.log("transferring big blind to the contract");
    await contractInstance.methods.setBigBlind().send({
        from: interaction.getCasinoAddress(),
        value: web3.utils.toWei("2","milliether")  
    });
    console.log("Big blind was transferred");
    let p = protocol.getPubKey();
    let pubString= [];
    for(var i = 0; i < p.length;i++){
        pubString.push(p[i].toString());
    }
    console.log("pubString is: ", pubString);
    let keys = {
        "share": protocol.getShare().toString(),
        "pub": pubString,
        "contract": contractAddress,
        "abi": abi,
        "table":protocol.getLookUpTable()
    }
    res.send(keys);
});

// for generation of cards
app.post('/cardGen',async function(req,res){
    let pub = protocol.getPubKey();
    interaction.initL(pub);
    let shareBig = new BigInteger(req.body.playerShare);
    console.log("body of request is: ", req.body);
    for(var i = 0 ; i < 9 ;i++){
        let encBig = new BigInteger(req.body.playerR[i]);
        interaction.getValidCard(encBig,shareBig,pub);
    }

    console.log("done generating cards");
    // do the deal:
    await interaction.deal(shareBig,pub);
    //now send the choices of the players to front end
    let choices = [];
    let data;
    // do while to catch the rare cases where values in smart contract didnt get updated yet
    do{
        
        data = await contractInstance.methods.getHands().call({
            // from: interaction.address,
            // gas: 1000000
            from:interaction.getCasinoAddress()

        });
    } while(data[0]=="" || data[1]=="" || data[2]=="" || data[3]=="");
    console.log("data from contract is ", data);
    casinoPartial.push(data[2],data[3]);
    
    // get choices ready to be sent
    
    for(var i = 0; i < 4 ;i++){
        let dataBig = new BigInteger(data[i]);
        let decPartial;
        let dec;
        if(i < 2){
            //send partially decrypted cards to front end
            choices.push(dataBig.toString());

        }else{
            //send fully decrypted casino cards 
            decPartial = protocol.partialDecryptCasino(interaction.L[i+1],pub);
            console.log("DECPARTIAL IS: ", decPartial);
            console.log("LOOKUP TABLE IS: ", protocol.getLookUpTable());
            dec = protocol.partialDecryptFinal(dataBig,decPartial,pub,protocol.getLookUpTable());
            choices.push(dec);

        }
    }
    console.log("Card choices are: ", choices);
    let l = interaction.getL();
    let lString = [];
    for(var i =0;i < l.length ; i++){
        lString.push(l[i].toString());
    }
    let send = {
        "choices": choices,
        "L":lString
    }
    // for checking if decryptions are working correctly, delete this for loop later
    for(var i = 0; i < 9;i++){
        let decr = protocol.decryptWithShares(interaction.L[i+1],shareBig,pub);
        console.log("L",i+1," IS: ", decr);

    }
    
  console.log("done");
    res.send(send);
});

//request for flop 
app.post("/flop", async function(req,res){
    let share = new BigInteger(req.body.share);
    await interaction.flop(share,protocol.getPubKey());
    console.log("Now reading the community pile from contract..");
    let communityPile;
    do{
        communityPile = await contractInstance.methods.getCommunityPile().call({
            from:interaction.getCasinoAddress()

        });
    } while(communityPile[0] =="" || communityPile[1] == "" || communityPile[2] == "");
    console.log("community pile was read");
    let send = {
        "pile": communityPile
    }
    res.send(send);
});

// request for turn
app.post("/turn", async function(req,res){
    let share = new BigInteger(req.body.share);
    await interaction.turn(share,protocol.getPubKey());
    console.log("Now reading the community pile from contract..");
    let communityPile;
    do{
        communityPile = await contractInstance.methods.getCommunityPile().call({
            from:interaction.getCasinoAddress()

        });
    }while(communityPile[3] == "");
    console.log("community pile was read");
    let send = {
        "pile": communityPile
    }
    res.send(send);
});

//request for river
app.post("/river", async function(req,res){
    let share = new BigInteger(req.body.share);
    await interaction.river(share,protocol.getPubKey());
    console.log("Now reading the community pile from contract..");
    let communityPile;
    do{
        communityPile = await contractInstance.methods.getCommunityPile().call({
            // from: interaction.address,
            // gas: 1000000
            from:interaction.getCasinoAddress()

        });
    }while(communityPile[4] == "");
    console.log("community pile was read");
    let send = {
        "pile": communityPile
    }
    res.send(send);
});

// when player folded
app.get('/playerFold',async function(req,res){
    console.log("Player folded. Transferring money to casino");
    await contractInstance.methods.leaveGame().send({
        from: interaction.getCasinoAddress()  
    });
    console.log("done");
    res.end();
});

// when casino folded
app.get('/casinoFold',async function(req,res){
    console.log("Casino folded. Transferring money to player");
    await contractInstance.methods.Fold().send({
        from: interaction.getCasinoAddress()  
    });
    console.log("done");
    res.end();
});

// when casino raises
app.post('/casinoRaise',async function(req,res){
    let amtRaise = req.body.amt;
    console.log("Casino raised. Transferring money to contract");
    console.log("amount to raise by is: ", amtRaise);
    await contractInstance.methods.Raise(amtRaise).send({
        from: interaction.getCasinoAddress(),
        value: amtRaise  
    });
    console.log("done");
    res.end();
});

// when casino calls
app.post('/casinoCall',async function(req,res){
    let amtRaise = req.body.amt;
    console.log("Casino called. Transferring money to contract");
    console.log("amount to raise by is: ", amtRaise);
    await contractInstance.methods.Call(amtRaise).send({
        from: interaction.getCasinoAddress(),
        value: amtRaise  
    });
    console.log("done");
    res.end();
});

//to handle reveal and payout
app.post('/reveal',async function(req,res){
    console.log("revealing casino share...");
    await protocol.revealCasino(contractInstance,interaction.getCasinoAddress());
    console.log("Done. Now revealing player share...");
    await contractInstance.methods.revealPlayer(req.body.share).send({
        from: interaction.getCasinoAddress(), 
    });
    console.log("Done. now determining winner");
    if(req.body.winner == "Casino wins!" || req.body.winner == "Player wins!"){
        console.log(req.body.winner,". Now transferring the money accordingly");
        console.log("request body is: ",req.body);
        await contractInstance.methods.determineWinner(req.body.winner,req.body.communityPile,req.body.playerCards,casinoPartial).send({
            from: interaction.getCasinoAddress(), 
        });
        console.log("done");
    }
    else{
        console.log("there was a dead tie. Transferring the money accordingly");
        await contractInstance.methods.splitPot().send({
            from: interaction.getCasinoAddress(), 
        });
        console.log("done");
    }
    res.end();
});

// to restart the game
app.get('/restart',function(req,res){
    console.log("Restarting game..");
    protocol.clearKeys();
    interaction.clearL();
    casinoPartial.length = 0;
    console.log("game has restarted");
    res.end();
    
});
// when player lets time run to 0, gives casino his money back
app.get('/timeout',async function(req,res){
    console.log("Player let the time run out, sending money back to casino");
    await contractInstance.methods.leaveGame().send({
        from: interaction.getCasinoAddress()  
    });
    console.log("done");
    res.end();
});
app.listen(3000,"0.0.0.0",function(){
    console.log("Hosting on port 3000....");
});
