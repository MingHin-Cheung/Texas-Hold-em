// script to test if protocol works as intended
var forge = require('node-forge');
const NodeRSA = require('node-rsa');
var BigInteger = forge.jsbn.BigInteger;
const protocol = require('./protocol');

console.log("Starting test....");
protocol.keygen();
var message1 = parseInt(forge.util.bytesToHex(forge.random.getBytesSync(5)),16) % 53;
var message2 = parseInt(forge.util.bytesToHex(forge.random.getBytesSync(5)),16) % 53;
var pubKey = protocol.getPubKey();
var m = (message1 + message2) % 53;
message1 = message1.toString();
message2 = message2.toString();
var m = m.toString();

console.log("\nThe message that player1 is going to encrypt is: ",message1);
console.log("The message that player2 is going to encrypt is: ",message2);
console.log("The actual message they are jointly encrypting(sum of their cards mod 53) is: ",m);
console.log("Encrypting player1 message...");
let c1 = protocol.encrypt(message1,pubKey);
console.log("Ciphertext of player1's message(c1) is: ",c1.toString());
console.log("Encrypting player2 message...");
let c2 = protocol.encrypt(message2,pubKey);
// uses additive homomorphism property E(m1)*E(m2) = E(m1 + m2)
console.log("Ciphertext of player2's message(c2) is: ",c2.toString());
let c1c2 = c1.multiply(c2);
console.log("The result of c1*c2 is: ",c1c2.toString());
var share = protocol.getShare();
var table = protocol.getLookUpTable();
console.log("\nDecrypting c1*c2 given both shares of private key d (This decryption corresponds to giving out the card face up):...");
var decBothShares = protocol.decryptWithShares(c1c2,share,pubKey);
console.log("The original message is: ",m,"Result of decryption is: ", decBothShares);
console.log("\nNow testing if partially decrypting the message works(This decryption corresponds to giving out the card face down)");
console.log("Partially decrypting with a share of the private key...");
var cP = protocol.partialDecryptPlayer(c1c2,share,pubKey);
console.log("Result of this decryption is: ",cP.toString());
var cPC = protocol.partialDecryptCasino(c1c2,pubKey);
console.log("Result of partial decrypting previous ciphertext with other share of d is: ", cPC.toString());
console.log("Now decrypting...");
var dec = protocol.partialDecryptFinal(cP,cPC,pubKey,table);
console.log("The original message is: ",m,"Result of decrypting the partial decrypted card with other share is: ", dec);
 console.log("Testing that decrypting partial decrypted card with the SAME share doesnt work:..");
var decBad = protocol.partialDecryptFinal(cP,cP,pubKey,table);
console.log("Result of this is: ", decBad);







