console.warn = () => {}; // to suppress web3 warnings
const Web3 = require('web3');
const fs = require('fs');
var forge = require('node-forge');
const NodeRSA = require('node-rsa');
const protocol = require('./protocol');
var HDWalletProvider = require("truffle-hdwallet-provider");
var BigInteger = forge.jsbn.BigInteger;
const address = "0x6DE29c6a03E2694C3217820ed2e595E24f1145B9";
var seed = "doctor grow remind robust fresh shaft stay crush clerk urge tiger dignity";
const provider = new HDWalletProvider(seed,"https://kovan.infura.io/v3/b1be893adce946fe83841884d990ebf3",0,2);
const web3 = new Web3(provider);
var abi = fs.readFileSync("abi.json").toString();

//holds ciphertexts of cards currently in play in BigInteger(joint encryptions)
var L = new Array();
var contractAddress; 

function getL(){
    return L;
}
function getContractAddress(){
    return contractAddress;
}
function getCasinoAddress(){
    return address;
}

function clearL(){ L.length = 0;}

async function deployContract(){
    //const accounts = await web3.eth.getAccounts();
    //let abi = fs.readFileSync("abi.json").toString();
    let bytecode = fs.readFileSync("bytecode.txt").toString();
    console.log("Starting deployment of contract...");
    let contract = await new web3.eth.Contract(JSON.parse(abi)).deploy({data: '0x'+ bytecode}).send(
        {
            from: address,
            gas: 10000000,
            gasPrice: await web3.eth.getGasPrice()
        }
    );
    console.log("Deployment transaction finished broadcasting");
    contractAddress = contract.options.address;
    console.log("Contract Address is: ",contractAddress);
}
// checks if card generated is in play(in L), if it is in play returns true(card is no good), if card isnt in play
//returns the card,indicating it is good for use
function isInL(c,share,publicKey){
    let result = false;
    for(var i = 0;i < L.length;i++){
        let cClean = new BigInteger(c.toString());
        let lClean = new BigInteger(L[i].toString());
        let exponent = (parseInt(forge.util.bytesToHex(forge.random.getBytesSync(32)),16) % 52) + 1;
        //console.log("EXPONENT IS: ", exponent);
        cClean = cClean.pow(exponent);
        lClean = lClean.pow(exponent);
        let decr1 = protocol.decryptWithShares(cClean,share,publicKey);
        let decr2 = protocol.decryptWithShares(lClean,share,publicKey);
        if(decr1 == decr2){
            result = true;
            break;
        }
        
    }
    if(result == false){
        return c;
    }
    else if(result == true){
        return result;
    }
}

function initL(publicKey){
    let sentinelEnc = protocol.encrypt("52",publicKey);
    L.push(sentinelEnc);
}

// generates a valid card thats a joint encryption and then pushes it to L. playerEnc is random encryption player made
function getValidCard(playerEnc,playerShare,publicKey){
    let result;
    do{
    let casinoRandom = parseInt(forge.util.bytesToHex(forge.random.getBytesSync(32)),16) % 52;
    casinoRandom = casinoRandom.toString();
    let casinoEnc = protocol.encrypt(casinoRandom,publicKey);
    let c1c2 = playerEnc.multiply(casinoEnc);
    result = isInL(c1c2,playerShare,publicKey);
    } while(result == true);
    L.push(result);
    //return result;
}

// deals cards face down to players, their cards are stored in the contract, partially decrypted,
// assumes that cards for the deal are already generated(getValidCard was called 4 times)
async function deal(playerShare,publicKey){
    if(L.size < 10){
        console.log("Not enough cards in L for a game(L needs to have 10 cards.)");
    }
    console.log("Starting deal..");
    let sendResult = new Array();
    // partially decrypting cards for the player:
    let playerCard1 = protocol.partialDecryptCasino(L[1],publicKey);
    let playerCard2 = protocol.partialDecryptCasino(L[2],publicKey);
    let casinoCard1 = protocol.partialDecryptPlayer(L[3],playerShare,publicKey);
    let casinoCard2 = protocol.partialDecryptPlayer(L[4],playerShare,publicKey);
    sendResult.push(playerCard1.toString(),playerCard2.toString(),casinoCard1.toString(),casinoCard2.toString());
    // now send SendResult to contract
    console.log("Sending card deal....");
    //const accounts = await web3.eth.getAccounts();
    let contractInstance = await new web3.eth.Contract(JSON.parse(abi),contractAddress);
    await contractInstance.methods.cardDeal(sendResult).send({
        // from: address,
        // gas: 1000000
        from:address

    });
    console.log("Dealt cards were sent");
    //console.log(contractAddress);
}

// sends fully decrypted cards to the contract(face up)
async function flop(playerShare,publicKey){
    if(L.size < 10){
        throw "Not enough cards in L for a game(L needs to have 10 cards.)";
    }
    console.log("Starting flop..");
    let sendResult = new Array();
    let card1 = protocol.decryptWithShares(L[5],playerShare,publicKey);
    let card2 = protocol.decryptWithShares(L[6],playerShare,publicKey);
    let card3 = protocol.decryptWithShares(L[7],playerShare,publicKey);
    sendResult.push(card1,card2,card3);
    // now send to contract
    let contractInstance = await new web3.eth.Contract(JSON.parse(abi),contractAddress);
    await contractInstance.methods.flop(sendResult).send({
        // from: address,
        // gas: 1000000
        from:address

    });
    console.log("Cards for the flop were sent");
}

async function turn(playerShare,publicKey){
    if(L.size < 10){
        throw "Not enough cards in L for a game(L needs to have 10 cards.)";
    }
    console.log("Starting turn");
    let card = protocol.decryptWithShares(L[8],playerShare,publicKey);
    let contractInstance = await new web3.eth.Contract(JSON.parse(abi),contractAddress);
    await contractInstance.methods.turn(card).send({
        // from: address,
        // gas: 1000000
        from:address

    });
    console.log("Cards for the turn were sent");

}
async function river(playerShare,publicKey){
    if(L.size < 10){
        throw "Not enough cards in L for a game(L needs to have 10 cards.)";
    }
    console.log("Starting river");
    let card = protocol.decryptWithShares(L[9],playerShare,publicKey);
    let contractInstance = await new web3.eth.Contract(JSON.parse(abi),contractAddress);
    await contractInstance.methods.river(card).send({
        // from: address,
        // gas: 1000000
        from:address

    });
    console.log("Cards for the river were sent");

}


module.exports = {
    deal,getValidCard,initL,deployContract,L,getContractAddress,flop,turn,river,getCasinoAddress,clearL,getL
}
//close provider proccess
provider.engine.stop();
