# Two Player Poker
How to set up the project:

1.  Install nodejs. Can do so at the link: https://nodejs.org/en/
2.  Install metamask(https://metamask.io/) and switch the network to Kovan Test Network. Example shown below:
![](https://github.com/FerianiAiden/CSC59866_2P_POKER/blob/main/metamaskKovan.PNG)

3. if you do not have test ether for the kovan network, you can get some at: https://faucet.kovan.network/. The small blind is .001 ether.
4. cd into the CSC_59866_2P_POKER folder on the terminal and run the following command to install all of the dependencies: npm install
5. To start up the server,cd into the mainpagee folder and type the command: node server.js on the terminal. If the terminal prints Hosting on port 3000..., then it's working.
6. Go to: http://127.0.0.1:3000/index.html to play the game

**Things to note**
- The smart contract and protocol are in the bot folder. Interaction.js has functions which send cards to the smart contract based on the phase of the game
- If you want to run the test script for the protocol, cd into the bot folder and type: node testingProtocol.js
- Inside the bot folder there is also another test script named testingInteraction.js. This file runs the full game on the back end side and tests if it can decrypt the partially decrypted cards that were sent to the smart contract
- static/js/gamelogic.js is the file that determines the highest possible combination that can be made given the player's cards and the community pile. This file is also responsible for determining the winner
- static/js/bott.js is the file that determines the decision that the casino should make(check,call,fold or raise) during each of the game
- static/js/play.js is the file that interacts with the server and the file that implements all of the UI's functionality
- The address of the casino will always be 0x6DE29c6a03E2694C3217820ed2e595E24f1145B9
- When you start the first game, a new contract is deployed for the entire session. Subsequent games will use the same smart contract address
- To get a better idea of what is happening under the hood, view the terminal as the game progresses.
- In order to check if the transactions are occurring correctly, all of the transactions with the contract can be looked up on Etherscan: https://kovan.etherscan.io/. To do this, it is best to look up the contract address on etherscan and view all of the transactions made to it. The contract address will be printed on the terminal corresponding to the server. Copy the contract address from the terminal and paste it on Etherscan. Below is an example of where to get the contract address once a game has been started:
![](https://github.com/FerianiAiden/CSC59866_2P_POKER/blob/main/contractAddress.PNG)

