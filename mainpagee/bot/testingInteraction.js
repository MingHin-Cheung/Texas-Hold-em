console.warn = () => {}; // to suppress web3 warnings
const Web3 = require('web3');
const fs = require('fs');
var path = require('path');
var forge = require('node-forge');
const NodeRSA = require('node-rsa');
var seed = "doctor grow remind robust fresh shaft stay crush clerk urge tiger dignity";
const protocol = require('./protocol');
const interaction = require('./interaction');
var HDWalletProvider = require("truffle-hdwallet-provider");
var BigInteger = forge.jsbn.BigInteger;
const provider = new HDWalletProvider(seed,"https://kovan.infura.io/v3/b1be893adce946fe83841884d990ebf3",0,2);
const web3 = new Web3(provider);
var abi = fs.readFileSync("abi.json").toString();

//script to test if things are interacting with the contract correctly
//similar to how functions will have to be called in the front end 
async function test(){
    console.log("Starting test...");
    await interaction.deployContract();

    //getting cryptosystem ready
    protocol.keygen();
    let playerShare = protocol.getShare();
    let pubKey = protocol.getPubKey();
    let table = protocol.getLookUpTable();

    console.log("Sending commit of players share to smart contract...");
    let contractInstance = await new web3.eth.Contract(JSON.parse(abi),interaction.getContractAddress());
    //console.log(interaction.getCasinoAddress());
    await contractInstance.methods.commitPlayerShare(playerShare.toString()).send({
        from: interaction.getCasinoAddress()

    });

    console.log("Sending commit of casinos share to smart contract...");
    await protocol.commitCasino(contractInstance,interaction.getCasinoAddress());
    console.log("Now reading commits for both players...");
    const shareCommit = await contractInstance.methods.getSharesCommit().call({
        // from: interaction.address,
        // gas: 1000000
        from:interaction.getCasinoAddress()

    });
    console.log("Commitment of shares are:",shareCommit);

    console.log("Starting generation of cards...");
    interaction.initL(pubKey);
    //Getting all cards needed for the game
    for(var i = 0; i < 9;i++){
        let playerRandom = parseInt(forge.util.bytesToHex(forge.random.getBytesSync(32)),16) % 52;
        playerRandom = playerRandom.toString();
        let enc = protocol.encrypt(playerRandom,pubKey);
        interaction.getValidCard(enc,playerShare,pubKey);
    }

    for(var i = 0; i < 9;i++){
        let decr = protocol.decryptWithShares(interaction.L[i+1],playerShare,pubKey);
        console.log("L",i+1," IS: ", decr);

    }

    console.log("Now doing Deal..");
    await interaction.deal(playerShare,pubKey);
    console.log("Now reading data sent to the smart contract..");
    //let contractInstance = await new web3.eth.Contract(JSON.parse(abi),interaction.getContractAddress());
    const data = await contractInstance.methods.getP1Hand().call({
        // from: interaction.address,
        // gas: 1000000
        from:interaction.getCasinoAddress()

    });
    console.log("Reading player's hand from the contract I get: ", data);
    console.log("Testing that partial decryption of card sent works..");
    let dataBig = new BigInteger(data[0]);
    let decPartial = protocol.partialDecryptPlayer(interaction.L[1],playerShare,pubKey);
    let dec1 = protocol.partialDecryptFinal(dataBig,decPartial,pubKey,table);
    console.log("Decrypting the card through partial decryptions gives: ", dec1);
    let dec2 = protocol.decryptWithShares(interaction.L[1], playerShare,pubKey);
    console.log("Decrypting cards straight up gives: ", dec2);
    await interaction.flop(playerShare,pubKey);
    console.log("Now reading the community pile from contract..");
    const communityPile = await contractInstance.methods.getCommunityPile().call({
        // from: interaction.address,
        // gas: 1000000
        from:interaction.getCasinoAddress()

    });
    console.log("Community pile is: ", communityPile);
    let dec3 = protocol.decryptWithShares(interaction.L[5], playerShare,pubKey);
    let dec4 = protocol.decryptWithShares(interaction.L[6], playerShare,pubKey);
    let dec5 = protocol.decryptWithShares(interaction.L[7], playerShare,pubKey);
    console.log("Decryptions of cards corresponding to the community pile are: ",dec3,dec4,dec5);
    await interaction.turn(playerShare,pubKey);
    await interaction.river(playerShare,pubKey);
    console.log("getting commitments..");
    const finalPile = await contractInstance.methods.getCommunityPile().call({
        // from: interaction.address,
        // gas: 1000000
        from:interaction.getCasinoAddress()

    });

    console.log("The community pile now is: ",finalPile);
    const commitment = await contractInstance.methods.getCommunityPileCommitment().call({
        // from: interaction.address,
        // gas: 1000000
        from:interaction.getCasinoAddress()

    });
    console.log("The community pile commitment is: ", commitment);
}

test();
provider.engine.stop();