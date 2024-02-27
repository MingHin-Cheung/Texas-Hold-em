console.warn = () => {}; // to suppress web3 warnings
const Web3 = require('web3');
var forge = require('node-forge');
const NodeRSA = require('node-rsa');
var suit = ["spades", "diamonds", "clubs", "hearts"];
var value = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var deck = new Array();

var seed = "doctor grow remind robust fresh shaft stay crush clerk urge tiger dignity";
var HDWalletProvider = require("truffle-hdwallet-provider");
const provider = new HDWalletProvider(seed,"https://kovan.infura.io/v3/b1be893adce946fe83841884d990ebf3",0,2);
const web3 = new Web3(provider);
//var sjcl = require('sjcl/sjcl');
var BigInteger = forge.jsbn.BigInteger;

//will be array that holds public key
var keys;

//will hold the additive shares of private key d
var shares = Array();


var lookUpTable =[]; // stores y^md in string
function Deck()
{
	for (var i = 0; i < suit.length; i++)
	{
		for (var j = 0; j < value.length; j++)
		{
            let message = value[j].concat(suit[i]);
			var card = {Value: value[j], Suit: suit[i]};
			deck.push(card);
		}
	}
}

function getDeck(){
  return deck;
}
function getLookUpTable(){
  return lookUpTable;
}
function getPrime(){ // returns 256 bit prime as biginteger
  let k1 = new NodeRSA({b:512});
  let pString =  k1.keyPair.p.toString()
  let pBig = new BigInteger(pString);
  return pBig;

 }

// based on benaloh's dense probabilistic encryption using rsa
async function keygen(){
  console.log("Starting keygen...");
  //finding suitable p
  let divides;
  let r = new BigInteger("53");
  let p;
  let n;
  let gcdP;
  let totientP;
  do{
    p = getPrime();
    //totient of p is p-1
    totientP = p.subtract(BigInteger.ONE);
    divides = totientP.mod(r);
    totientPOverR = totientP.divide(r);
    gcdP = totientPOverR.gcd(r);
  } while(divides.toString() != "0" || gcdP.toString() != "1");
  console.log("found a suitable p.");
  console.log("p is: ", p.toString());
  console.log("The remainder of p-1 / r is: ", divides.toString(), ", so r divides p-1");
  console.log("Gcd between (p-1)/r and r is: ",gcdP.toString());

  console.log("Now finding a suitable q...");
  let gcdQ;
  let q;
  let totientQ;
  do{
    q = getPrime();
    totientQ = q.subtract(BigInteger.ONE);
    gcdQ = totientQ.gcd(r);
  }while(gcdQ.toString()!= "1");
  console.log("Found a suitable q.");
  console.log("q is: ",q.toString());
  console.log("the gcd of q-1 and r is: ", gcdQ.toString());

  // computing n
  n = p.multiply(q);
  console.log("n is: ", n.toString());
  console.log("n bit length is: ", n.bitLength());
  console.log("Now finding y...");
  let y;
  let gcdYN; // gcd of y and n
  let yRaised;
  let totientN = totientP.multiply(totientQ);
  let totientNOverR = totientN.divide(r);
  do{
     // get random y
    let bytes = forge.util.bytesToHex(forge.random.getBytesSync(100));
    let bytesBig = new BigInteger(bytes,16);
    y = bytesBig.mod(n);
    gcdYN = y.gcd(n);
    // yRaisedMod is y^ (phi(n) / r mod n)
  yRaised = y.modPow(totientNOverR,n);
  }while(gcdYN.toString() != "1" || yRaised.toString() =="1" );
  console.log("Found a suitable y.");
  console.log("Y is: ", y.toString());
  console.log("bit length of y is: ", y.bitLength());
  console.log("Gcd between y and n is: ", gcdYN.toString());
  console.log("y^(phi(n) / r) mod n is: ", yRaised.toString());
  let bytes = forge.util.bytesToHex(forge.random.getBytesSync(30));
  let d1 = new BigInteger(bytes,16);
  let d2 = totientNOverR.subtract(d1);
  // constructing look up table(y^md mod n for messages {0..52}),stored in string
  for(var i = 0 ;i < 53;i++){
    let m = new BigInteger(i.toString());
    let md = m.multiply(totientNOverR);
    let ymd = y.modPow(md,n);
    lookUpTable.push(ymd.toString());

  }
  
  shares = [d1,d2];
  keys = [y,r,n];
  //module.exports.pKey = pKey 
}

// to encrypt
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



// decrypts given ciphertext and shares of private key d(both in biginteger)
function decryptWithShares(c,share1,pubKeys){
  let m;
  let d = share1.add(shares[0]);
  let dec = c.modPow(d,pubKeys[2]);

  for(var i = 0; i < 53; i++){
    let iBig = new BigInteger(i.toString());
    let md = iBig.multiply(d);
    let val = pubKeys[0].modPow(md,pubKeys[2]);
    if(dec.toString() == val.toString()){
      m = i.toString();
      break;
    }
  }
  return m;
}

// PLAYER partially decrypts ciphertext c given a share of the private key, private key in biginteger, only computes c^d mod n,
//returns biginteger
//function corresponding to dealing cards face down
function partialDecryptPlayer(c,share,pubKeys){
  let dec = c.modPow(share,pubKeys[2]);
  return dec;
  
}

//CASINO partially decrypts ciphertext c with his share of d
function partialDecryptCasino(c,pubKeys){
  let dec = c.modPow(shares[0],pubKeys[2]);
  return dec;
  
}

// decrypts c given that c1 is c partially decrypted with one share and c2 is c partially decrypted with the other share
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

function getPubKey(){
return keys;
}
function clearKeys(){
  keys.length = 0;
  shares.length = 0;
  lookUpTable.length = 0;

}

// distributes share of private key, in biginteger. returns null if player already got his share
function getShare(){
  if(shares.length < 2){return;}
  else{
    let distribute = shares[1];
    shares.pop();
    return distribute;
  
  }

}


// sends casino's share to contract so it can be hashed
async function commitCasino(contractInstance,casinoAddress){
  await contractInstance.methods.commitCasinoShare(shares[0].toString()).send({
    // from: address,
    // gas: 1000000
    from:casinoAddress

});
}

// calls casinoReveal function on the smart contract
async function revealCasino(contractInstance,casinoAddress){
  await contractInstance.methods.revealCasino(shares[0].toString()).send({
    // from: address,
    // gas: 1000000
    from:casinoAddress

});
}





module.exports = { 
  keygen,
  getShare,
  getPubKey,
  partialDecryptFinal,
  partialDecryptPlayer,
  partialDecryptCasino,
  decryptWithShares,
  encrypt,
  Deck,
  getDeck,
  clearKeys,
  commitCasino,
  revealCasino,
  getLookUpTable
}

// module.exports.keygen = keygen;
// module.exports.getShare = getShare;
// module.exports.getPubKey = getPubKey;
// module.exports.partialDecryptFinal = partialDecryptFinal;
// module.exports.partialDecryptPlayer = partialDecryptPlayer;
// module.exports.partialDecryptCasino = partialDecryptCasino;
// module.exports.decryptWithShares = decryptWithShares;
// module.exports.encrypt = encrypt;
// module.exports.Deck = Deck;
// module.exports.getDeck = getDeck;
// module.exports.clearKeys = clearKeys;
// module.exports.commitCasino = commitCasino;
// module.exports.pKey = pKey;
provider.engine.stop();




