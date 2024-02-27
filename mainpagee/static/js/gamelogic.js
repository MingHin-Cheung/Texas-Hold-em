var suit = ["spades", "diamonds", "clubs", "hearts"];
var value = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var deckG = [];

function Deck()
{
	for (var i = 0; i < suit.length; i++)
	{
		for (var j = 0; j < value.length; j++)
		{
			var card = {Value: value[j], Suit: suit[i]};
			deckG.push(card);
		}
	}
}

Deck();
function getDeck(){return deckG;}

//console.log(deck[1]);


function EvaluateWinner(pHand, cHand, pHandString, cHandString)
{
	var winner = "";
	var pHandValue = 0;
	var cHandValue = 0;
	
	//Assign value to string, will become redundant if we switch to numerical representation instead of string
	//Assign value for Player Hand
	if (pHandString == "Royal Flush")
	{
		pHandValue = 10;
	}
	else if (pHandString == "Straight Flush")
	{
		pHandValue = 9;
	}
	else if (pHandString == "Four of A Kind")
	{
		pHandValue = 8;
	}
	else if (pHandString == "Full House")
	{
		pHandValue = 7;
	}
	else if (pHandString == "Flush")
	{
		pHandValue = 6;
	}
	else if (pHandString == "Straight")
	{
		pHandValue = 5;
	}
	else if (pHandString == "Three of A Kind")
	{
		pHandValue = 4;
	}
	else if (pHandString == "Two Pair")
	{
		pHandValue = 3;
	}
	else if (pHandString == "One Pair")
	{
		pHandValue = 2;
	}
	else if (pHandString == "High Card")
	{
		pHandValue = 1;
	}

	//Assign value for Casino hand
	if (cHandString == "Royal Flush")
	{
		cHandValue = 10;
	}
	else if (cHandString == "Straight Flush")
	{
		cHandValue = 9;
	}
	else if (cHandString == "Four of A Kind")
	{
		cHandValue = 8;
	}
	else if (cHandString == "Full House")
	{
		cHandValue = 7;
	}
	else if (cHandString == "Flush")
	{
		cHandValue = 6;
	}
	else if (cHandString == "Straight")
	{
		cHandValue = 5;
	}
	else if (cHandString == "Three of A Kind")
	{
		cHandValue = 4;
	}
	else if (cHandString == "Two Pair")
	{
		cHandValue = 3;
	}
	else if (cHandString == "One Pair")
	{
		cHandValue = 2;
	}
	else if (cHandString == "High Card")
	{
		cHandValue = 1;
	}
	
	//Compare hands and determine winner, go to tiebreaker if same
	if (pHandValue > cHandValue)
	{
		winner = "Player wins!" ;
	}
	else if (pHandValue < cHandValue)
	{
		winner = "Casino wins!" ;
	}
	else if (pHandValue == cHandValue)
	{
		winner = checkTie(pHand, cHand, pHandString, cHandString);
	}
	return winner;
}

function EvaluateHand(handtocheck)
{
	var result = ""; //empty string that will be filled containing best hand e.g, "One Pair", holder in place for now, could change to an int representation
	var suitCounter = [0,0,0,0]; //used to tally occurences of suit in each hand
	var valueCounter = [0,0,0,0,0,0,0,0,0,0,0,0,0]; //used to tally occurences of card value in each hand

	suitCounter = updateSuitCounter(handtocheck, suitCounter);
	valueCounter = updateValueCounter(handtocheck, valueCounter);

	//check for Straight Flush/Royal if condition met
	if (result == "")
	{
		result = checkStraightFlush(valueCounter, suitCounter);
	}
	//check for four of a kind
	 if(result == "")
	{
		result = checkFourOfAKind(valueCounter);
	}
	//check for Full House
	if(result == "")
	{
		result = checkFullHouse(valueCounter);
	}
	//check for flush
	if(result == "")
	{
		result = checkFlush(suitCounter);
	}
	//check for straight
	if(result == "")
	{
		result = checkStraight(valueCounter);
	}
	//check for three of a kind
	if(result == "")
	{
		result = checkThreeOfAKind(valueCounter);
	}
	//check for two pair
	if(result == "")
	{
		result = checkTwoPair(valueCounter);
	}
	//check for one pair
	if(result == "")
	{
		result = checkOnePair(valueCounter);
	}
	//check for high card
	if(result == "")
	{
		result = checkHighCard(valueCounter);
	}

	return result;
}

function checkOnePair(a)
{
	var resOP = "";

 	for (var i = a.length; i > 0; i--)
 	{
 		if (a[i-1] > 1)
 		{
 			resOP = "One Pair";
 			break;
 		}
 	}
 	return resOP;
}


function checkHighCard(a)
{
 	var resHC = "";

 	for (var i = a.length; i > 0; i--)
 	{
 		if (a[i-1] > 0)
 		{
 			resHC = "High Card";
 			break;
 		}
 	}

 	return resHC;
}

function checkThreeOfAKind(a)
{
 	var resTOK = "";

 	for (var i = a.length; i > 0; i--)
 	{
 		if (a[i-1] > 2)
 		{
 			resTOK = "Three of A Kind";
 			break;
 		}
 	}
 	return resTOK;
}

function checkFourOfAKind(a)
{
 	var resFOK = "";

 	for (var i = 0; i < a.length; i++)
 	{
 		if (a[i] == 4)
 		{
 			resFOK = "Four of A Kind";
 			break;
 		}
 	}
 	return resFOK;
}

function checkTwoPair(a)
{
 	var resTP = "";
 	var pairOne = 0;
 	var pairTwo = 0;

 	for (var i = a.length; i > 0; i--)
 	{
 		if ((pairOne < 1) || (pairTwo < 1))
 		{
 			if((a[i-1] > 1) && (pairOne < 1))
 			{
 				pairOne = i;
 			}
 			else if (a[i-1] > 1)
 			{
 				pairTwo = i;
 			}
 		}
 		else
 		{
 			break;
 		}
 	}

 	if ((pairOne > 0) && (pairTwo > 0))
 	{
 		resTP = "Two Pair";
 	} 

 	return resTP;
}

function checkStraight (a)
{
 	var resStr = "";

 	//Check if 10-A Straight
 	if ((a[0] > 0) && (a[12] > 0) && (a[11] > 0) && (a[10] > 0) && (a[9] > 0))
 	{
 		resStr = "Straight";
 	}

 	//Check non 10-A Straight (includes A-5)
 	for (var i = a.length; i > 4; i--)
 	{
 		if ((a[i-5] > 0) && (a[i-4] > 0) && (a[i-3] > 0) && (a[i-2] > 0) && (a[i-1] > 0))
 		{
 			resStr = "Straight";
 			break;
 		}
 	}
 	return resStr;
}


function checkFlush(a)
{
 	var resFlush = "";

 	if (a[0] > 4 || a[1] > 4 || a[2] > 4 || a[3] > 4)
 	{
 		resFlush = "Flush";
 	}

 	return resFlush;
}

function checkFullHouse(a)
{
	var resFH = "";
	var ThreeKind = 0;
	var TwoKind = 0;

	for (var i = a.length; i > 0; i--)
	{
		if ((ThreeKind < 1) || (TwoKind < 1))
		{
			if (a[i-1] > 2)
			{
				ThreeKind = i;
			}
			else if (a[i-1] > 1)
			{
				TwoKind = i;
			}
		}
		else
		{
			break;
		}
	}
	if (ThreeKind > 0 && TwoKind > 0)
	{
		resFH = "Full House";
	}
	return resFH;
}

function checkStraightFlush(a, b)
{
	var resSF = "";

	if (b[0] > 4 || b[1] > 4 ||b[2] > 4 ||b[3] > 4)
 	{

 		if ((a[0] > 0) && (a[12] > 0) && (a[11] > 0) && (a[10] > 0) && (a[9] > 0))
 		{
 			resStr = "Royal Flush";
 		}

 		for (var i = a.length; i > 4; i--)
 		{
 			if ((a[i-5] > 0) && (a[i-4] > 0) && (a[i-3] > 0) && (a[i-2] > 0) && (a[i-1] > 0))
 			{
 				resSF = "Straight Flush";
 				break;
 			}
 		}
 	}
 	return resSF;
}

function updateSuitCounter (handtocheck, sc)
{
	for (var i = 0; i < handtocheck.length; i++)
	{
		if (handtocheck[i].Suit == "spades")
		{
			sc[0] = sc[0] + 1;
		}
		else if (handtocheck[i].Suit == "diamonds")
		{
			sc[1] = sc[1] + 1;
		}
		else if (handtocheck[i].Suit == "clubs")
		{
			sc[2] = sc[2] + 1;
		}
		else if (handtocheck[i].Suit == "hearts")
		{
			sc[3] = sc[3] + 1;
		}
	}

	return sc;
}

function updateValueCounter (handtocheck, vc)
{
	for (var i = 0; i < handtocheck.length; i++)
	{
		if (handtocheck[i].Value == "A")
		{
			vc[0] = vc[0] + 1;
		}
		else if (handtocheck[i].Value == "2")
		{
			vc[1] = vc[1] + 1;
		}
		else if (handtocheck[i].Value == "3")
		{
			vc[2] = vc[2] + 1;
		}
		else if (handtocheck[i].Value == "4")
		{
			vc[3] = vc[3] + 1;
		}
		else if (handtocheck[i].Value == "5")
		{
			vc[4] = vc[4] + 1;
		}
		else if (handtocheck[i].Value == "6")
		{
			vc[5] = vc[5] + 1;
		}
		else if (handtocheck[i].Value == "7")
		{
			vc[6] = vc[6] + 1;
		}
		else if (handtocheck[i].Value == "8")
		{
			vc[7] = vc[7] + 1;
		}
		else if (handtocheck[i].Value == "9")
		{
			vc[8] = vc[8] + 1;
		}
		else if (handtocheck[i].Value == "10")
		{
			vc[9] = vc[9] + 1;
		}
		else if (handtocheck[i].Value == "J")
		{
			vc[10] = vc[10] + 1;
		}
		else if (handtocheck[i].Value == "Q")
		{
			vc[11] = vc[11] + 1;
		}
		else if (handtocheck[i].Value == "K")
		{
			vc[12] = vc[12] + 1;
		}
	}
	return vc;
}


function checkTie(pHand, cHand, pHandString, cHandString)
{
	var tieResult = "";

	//Royal Flush tiebreaker
	if (pHandString == "Royal Flush" && cHandString == "Royal Flush")
	{
		tieResult = "Tie.";
	}

	//Straight Flush tiebreaker
	if (pHandString == "Straight Flush" && cHandString == "Straight Flush")
	{
		var pSF = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pSF.push(pHand[a]);
		}
		var cSF = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cSF.push(cHand[a]);
		}
		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pSF.length; i++)
		{
			if(pSF[i].Value == "A")
			{
				pSF[i].Value = 14;
			}
			else if(pSF[i].Value == "2")
			{
				pSF[i].Value = 2;
			}
			else if(pSF[i].Value == "3")
			{
				pSF[i].Value = 3;
			}
			else if(pSF[i].Value == "4")
			{
				pSF[i].Value = 4;
			}
			else if(pSF[i].Value == "5")
			{
				pSF[i].Value = 5;
			}
			else if(pSF[i].Value == "6")
			{
				pSF[i].Value = 6;
			}
			else if(pSF[i].Value == "7")
			{
				pSF[i].Value = 7;
			}
			else if(pSF[i].Value == "8")
			{
				pSF[i].Value = 8;
			}
			else if(pSF[i].Value == "9")
			{
				pSF[i].Value = 9;
			}
			else if(pSF[i].Value == "10")
			{
				pSF[i].Value = 10;
			}
			else if(pSF[i].Value == "J")
			{
				pSF[i].Value = 11;
			}
			else if(pSF[i].Value == "Q")
			{
				pSF[i].Value = 12;
			}
			else if(pSF[i].Value == "K")
			{
				pSF[i].Value = 13;
			}
		}
		for (var j = 0; j < cSF.length; j++)
		{
			if(cSF[j].Value == "A")
			{
				cSF[j].Value = 14;
			}
			else if(cSF[j].Value == "2")
			{
				cSF[j].Value = 2;
			}
			else if(cSF[j].Value == "3")
			{
				cSF[j].Value = 3;
			}
			else if(cSF[j].Value == "4")
			{
				cSF[j].Value = 4;
			}
			else if(cSF[j].Value == "5")
			{
				cSF[j].Value = 5;
			}
			else if(cSF[j].Value == "6")
			{
				cSF[j].Value = 6;
			}
			else if(cSF[j].Value == "7")
			{
				cSF[j].Value = 7;
			}
			else if(cSF[j].Value == "8")
			{
				cSF[j].Value = 8;
			}
			else if(cSF[j].Value == "9")
			{
				cSF[j].Value = 9;
			}
			else if(cSF[j].Value == "10")
			{
				cSF[j].Value = 10;
			}
			else if(cSF[j].Value == "J")
			{
				cSF[j].Value = 11;
			}
			else if(cSF[j].Value == "Q")
			{
				cSF[j].Value = 12;
			}
			else if(cSF[j].Value == "K")
			{
				cSF[j].Value = 13;
			}
		}

		//console.log("presort P", pSF);
		//console.log("presort C", cSF);

		var pSFTemp1 = 0;
		var pSFTemp2 = 0;
		var pSFTemp3 = 0;
		var pSFTemp4 = 0;
		var pSFTemp5 = 0;
		var cSFTemp1 = 0;
		var cSFTemp2 = 0;
		var cSFTemp3 = 0;
		var cSFTemp4 = 0;
		var cSFTemp5 = 0;

		pSF.sort((a, b) => {if(a.Suit < b.Suit){return -1} if (a.Suit > b.Suit) {return 1} return 0});
		cSF.sort((a, b) => {if(a.Suit < b.Suit){return -1} if (a.Suit > b.Suit) {return 1} return 0});

		//console.log("postsort P", pSF);
		//console.log("postsort C", cSF);

		var pTrue = 0;
		var cTrue = 0;
		for (var k = 0; k < 3; k++)
		{
			if ((pSF[k].Suit == "spades" && pSF[k+1].Suit == "spades" && pSF[k+2].Suit == "spades" && pSF[k+3].Suit == "spades" && pSF[k+4].Suit == "spades") && pTrue == 0)
			{
				pSFTemp5 = pSF[k].Value;
				pSFTemp4 = pSF[k+1].Value;
				pSFTemp3 = pSF[k+2].Value;
				pSFTemp2 = pSF[k+3].Value;
				pSFTemp1 = pSF[k+4].Value;
				pTrue = 1;
				break;
			}
			else if ((pSF[k].Suit == "diamonds" && pSF[k+1].Suit == "diamonds" && pSF[k+2].Suit == "diamonds" && pSF[k+3].Suit == "diamonds" && pSF[k+4].Suit == "diamonds") && pTrue == 0)
			{
				pSFTemp5 = pSF[k].Value;
				pSFTemp4 = pSF[k+1].Value;
				pSFTemp3 = pSF[k+2].Value;
				pSFTemp2 = pSF[k+3].Value;
				pSFTemp1 = pSF[k+4].Value;
				pTrue = 1;
				break;
			}
			else if ((pSF[k].Suit == "clubs" && pSF[k+1].Suit == "clubs" && pSF[k+2].Suit == "clubs" && pSF[k+3].Suit == "clubs" && pSF[k+4].Suit == "clubs") && pTrue == 0)
			{
				pSFTemp5 = pSF[k].Value;
				pSFTemp4 = pSF[k+1].Value;
				pSFTemp3 = pSF[k+2].Value;
				pSFTemp2 = pSF[k+3].Value;
				pSFTemp1 = pSF[k+4].Value;
				pTrue = 1;
				break;
			}
			else if ((pSF[k].Suit == "hearts" && pSF[k+1].Suit == "hearts" && pSF[k+2].Suit == "hearts" && pSF[k+3].Suit == "hearts" && pSF[k+4].Suit == "hearts") && pTrue == 0)
			{
				pSFTemp5 = pSF[k].Value;
				pSFTemp4 = pSF[k+1].Value;
				pSFTemp3 = pSF[k+2].Value;
				pSFTemp2 = pSF[k+3].Value;
				pSFTemp1 = pSF[k+4].Value;
				pTrue = 1;
				break;
			}
		}
		for (var g = 0; g < 3; g++)
		{
			if ((cSF[g].Suit == "spades" && cSF[g+1].Suit == "spades" && cSF[g+2].Suit == "spades" && cSF[g+3].Suit == "spades" && cSF[g+4].Suit == "spades") && cTrue == 0)
			{
				cSFTemp5 = cSF[g].Value;
				cSFTemp4 = cSF[g+1].Value;
				cSFTemp3 = cSF[g+2].Value;
				cSFTemp2 = cSF[g+3].Value;
				cSFTemp1 = cSF[g+4].Value;
				cTrue = 1;
				break;
			}
			else if ((cSF[g].Suit == "diamonds" && cSF[g+1].Suit == "diamonds" && cSF[g+2].Suit == "diamonds" && cSF[g+3].Suit == "diamonds" && cSF[g+4].Suit == "diamonds") && cTrue == 0)
			{
				cSFTemp5 = cSF[g].Value;
				cSFTemp4 = cSF[g+1].Value;
				cSFTemp3 = cSF[g+2].Value;
				cSFTemp2 = cSF[g+3].Value;
				cSFTemp1 = cSF[g+4].Value;
				cTrue = 1;
				break;
			}
			else if ((cSF[g].Suit == "clubs" && cSF[g+1].Suit == "clubs" && cSF[g+2].Suit == "clubs" && cSF[g+3].Suit == "clubs" && cSF[g+4].Suit == "clubs") && cTrue == 0)
			{
				cSFTemp5 = cSF[g].Value;
				cSFTemp4 = cSF[g+1].Value;
				cSFTemp3 = cSF[g+2].Value;
				cSFTemp2 = cSF[g+3].Value;
				cSFTemp1 = cSF[g+4].Value;
				cTrue = 1;
				break;
			}
			else if ((cSF[g].Suit == "hearts" && cSF[g+1].Suit == "hearts" && cSF[g+2].Suit == "hearts" && cSF[g+3].Suit == "hearts" && cSF[g+4].Suit == "hearts") && cTrue == 0)
			{
				cSFTemp5 = cSF[g].Value;
				cSFTemp4 = cSF[g+1].Value;
				cSFTemp3 = cSF[g+2].Value;
				cSFTemp2 = cSF[g+3].Value;
				cSFTemp1 = cSF[g+4].Value;
				cTrue = 1;
				break;
			}
		}

		pSF.splice(0,7);
		cSF.splice(0,7);

		//console.log("Spliced P", pSF);
		//console.log("Spliced C", cSF);

		pSF.push(pSFTemp1, pSFTemp2, pSFTemp3, pSFTemp4, pSFTemp5);
		cSF.push(cSFTemp1, cSFTemp2, cSFTemp3, cSFTemp4, cSFTemp5);
		pSF.sort(function(a, b){return a-b});
		cSF.sort(function(a, b){return a-b});

		//console.log("pushed P", pSF);
		//console.log("pushed C", cSF);

		if (pSF[4] > cSF[4])
		{
			tieResult = "Player wins!";
		}
		else if (pSF[4] < cSF[4])
		{
			tieResult = "Casino wins!";
		}
		else if (pSF[4] == cSF[4])
		{
			tieResult = "Tie.";
		}
	}

	//Four of a Kind tiebreaker
	if (pHandString == "Four of A Kind" && cHandString == "Four of A Kind")
	{
		var pFOK = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pFOK.push(pHand[a].Value);
		}
		var cFOK = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cFOK.push(cHand[a].Value);
		}

		for (var i = 0; i < pFOK.length; i++)
		{
			if(pFOK[i] == "A")
			{
				pFOK[i] = 14;
			}
			else if(pFOK[i] == "2")
			{
				pFOK[i] = 2;
			}
			else if(pFOK[i] == "3")
			{
				pFOK[i] = 3;
			}
			else if(pFOK[i] == "4")
			{
				pFOK[i] = 4;
			}
			else if(pFOK[i] == "5")
			{
				pFOK[i] = 5;
			}
			else if(pFOK[i] == "6")
			{
				pFOK[i] = 6;
			}
			else if(pFOK[i] == "7")
			{
				pFOK[i] = 7;
			}
			else if(pFOK[i] == "8")
			{
				pFOK[i] = 8;
			}
			else if(pFOK[i] == "9")
			{
				pFOK[i] = 9;
			}
			else if(pFOK[i] == "10")
			{
				pFOK[i] = 10;
			}
			else if(pFOK[i] == "J")
			{
				pFOK[i] = 11;
			}
			else if(pFOK[i] == "Q")
			{
				pFOK[i] = 12;
			}
			else if(pFOK[i] == "K")
			{
				pFOK[i] = 13;
			}
		}
		for (var j = 0; j < cFOK.length; j++)
		{
			if(cFOK[j] == "A")
			{
				cFOK[j] = 14;
			}
			else if(cFOK[j] == "2")
			{
				cFOK[j] = 2;
			}
			else if(cFOK[j] == "3")
			{
				cFOK[j] = 3;
			}
			else if(cFOK[j] == "4")
			{
				cFOK[j] = 4;
			}
			else if(cFOK[j] == "5")
			{
				cFOK[j] = 5;
			}
			else if(cFOK[j] == "6")
			{
				cFOK[j] = 6;
			}
			else if(cFOK[j] == "7")
			{
				cFOK[j] = 7;
			}
			else if(cFOK[j] == "8")
			{
				cFOK[j] = 8;
			}
			else if(cFOK[j] == "9")
			{
				cFOK[j] = 9;
			}
			else if(cFOK[j] == "10")
			{
				cFOK[j] = 10;
			}
			else if(cFOK[j] == "J")
			{
				cFOK[j] = 11;
			}
			else if(cFOK[j] == "Q")
			{
				cFOK[j] = 12;
			}
			else if(cFOK[j] == "K")
			{
				cFOK[j] = 13;
			}
		}
		

		//console.log("Pre P: ", pFOK);
		//console.log("Pre C: ", cFOK);

		pFOK.sort(function(a, b){return a-b});
		cFOK.sort(function(a, b){return a-b});


		//console.log("Sorted P: ", pFOK);
		//console.log("Sorted C: ", cFOK);

		var pFOKTemp = 0;
		var cFOKTemp = 0;

		var pTrue = 0;
		var cTrue = 0;
		for (var v = pFOK.length; v >= 3; v--)
		{
			if ((pFOK[v] == pFOK[v-1]) && (pFOK[v] == pFOK[v-2]) && (pFOK[v] == pFOK[v-3]) && pTrue == 0)
			{
				pFOKTemp = pFOK[v];
				pFOK.splice(v-3, 4);
				pTrue = 1;
				break;
			}
		}

		//console.log("Spliced P", pFOK);
		for (var d = cFOK.length; d >= 3; d--)
		{
			if ((cFOK[d] == cFOK[d-1] && (cFOK[d] == cFOK[d-2]) && (cFOK[d] == cFOK[d-3])) && cTrue == 0)
			{
				cFOKTemp = cFOK[d];
				cFOK.splice(d-3, 4);
				cTrue = 1;
				break;
			}
		}
		//console.log("Spliced C", cFOK);

		pFOK.splice(0, 2);
		cFOK.splice(0, 2);
		//console.log("Before Push P ", pFOK);
		//console.log("Before Push C ", cFOK);
		pFOK.push(pFOKTemp);
		cFOK.push(cFOKTemp);

		//console.log("Final P ", pFOK);
		//console.log("Final C ", cFOK);

		for (var y = pFOK.length - 1; y >= 0; y--)
		{
			if (pFOK[y] > cFOK[y])
			{
				tieResult = "Player wins!";
				break;
			}
			else if (pFOK[y] < cFOK[y])
			{
				tieResult = "Casino wins!";
				break;
			}
			else if (pFOK[y] == cFOK[y])
			{
				tieResult = "Tie.";
			}
		}
	}

	//Full House Tiebreaker
	if (pHandString == "Full House" && cHandString == "Full House")
	{
		var pFH = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pFH.push(pHand[a].Value);
		}
		var cFH = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cFH.push(cHand[a].Value);
		}
		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pFH.length; i++)
		{
			if(pFH[i] == "A")
			{
				pFH[i] = 14;
			}
			else if(pFH[i] == "2")
			{
				pFH[i] = 2;
			}
			else if(pFH[i] == "3")
			{
				pFH[i] = 3;
			}
			else if(pFH[i] == "4")
			{
				pFH[i] = 4;
			}
			else if(pFH[i] == "5")
			{
				pFH[i] = 5;
			}
			else if(pFH[i] == "6")
			{
				pFH[i] = 6;
			}
			else if(pFH[i] == "7")
			{
				pFH[i] = 7;
			}
			else if(pFH[i] == "8")
			{
				pFH[i] = 8;
			}
			else if(pFH[i] == "9")
			{
				pFH[i] = 9;
			}
			else if(pFH[i] == "10")
			{
				pFH[i] = 10;
			}
			else if(pFH[i] == "J")
			{
				pFH[i] = 11;
			}
			else if(pFH[i] == "Q")
			{
				pFH[i] = 12;
			}
			else if(pFH[i] == "K")
			{
				pFH[i] = 13;
			}
		}
		for (var j = 0; j < cFH.length; j++)
		{
			if(cFH[j] == "A")
			{
				cFH[j] = 14;
			}
			else if(cFH[j] == "2")
			{
				cFH[j] = 2;
			}
			else if(cFH[j] == "3")
			{
				cFH[j] = 3;
			}
			else if(cFH[j] == "4")
			{
				cFH[j] = 4;
			}
			else if(cFH[j] == "5")
			{
				cFH[j] = 5;
			}
			else if(cFH[j] == "6")
			{
				cFH[j] = 6;
			}
			else if(cFH[j] == "7")
			{
				cFH[j] = 7;
			}
			else if(cFH[j] == "8")
			{
				cFH[j] = 8;
			}
			else if(cFH[j] == "9")
			{
				cFH[j] = 9;
			}
			else if(cFH[j] == "10")
			{
				cFH[j] = 10;
			}
			else if(cFH[j] == "J")
			{
				cFH[j] = 11;
			}
			else if(cFH[j] == "Q")
			{
				cFH[j] = 12;
			}
			else if(cFH[j] == "K")
			{
				cFH[j] = 13;
			}
		}

		//console.log("Pre P: ", pH);
		//console.log("Pre C: ", cH);

		pFH.sort(function(a, b){return a-b});
		cFH.sort(function(a, b){return a-b});

		//console.log("Sorted P: ", pFH);
		//console.log("Sorted C: ", cFH);

		var pFHTemp1 = 0;
		var pFHTemp2 = 0;
		var cFHTemp1 = 0;
		var cFHTemp2 = 0;

		var pTripTrue = 0;
		var pPairTrue = 0;
		var cTripTrue = 0;
		var cPairTrue = 0;
		
		for (var a = 0; a < 4; a++)
		{
			if (((pFH[a] == pFH[a+1]) && (pFH[a+1] == pFH[a+2])) && pTripTrue == 0)
			{
				pFHTemp1 = pFH[a];
				pFH.splice(a, 3);
				a = 0;
				pTripTrue = 1;
				break;
			}
		}
		for (var b = 0; b < 4; b++)
		{
			if (((pFH[b] == pFH[b+1])) && pPairTrue == 0)
			{
				pFHTemp2 = pFH[b];
				pFH.splice(b, 2);
				b = 0;
				pPairTrue = 1;
				break;
			}
		}
		for (var c = 0; c < 4; c++)
		{
			if (((cFH[c] == cFH[c+1]) && (cFH[c+1] == cFH[c+2])) && cTripTrue == 0)
			{
				cFHTemp1 = cFH[c];
				cFH.splice(c, 3);
				c = 0;
				cTripTrue = 1;
			}
		}

		for (var d = 0; d < 4; d++)
		{
			 if (((cFH[d] == cFH[d+1])) && cPairTrue == 0)
			{
				cFHTemp2 = cFH[d];
				cFH.splice(d, 2);
				d = 0;
				cPairTrue = 1;
			}
		}

		//console.log("Spliced P: ", pFH);
		//console.log("Spliced C: ", cFH);

		pFH.splice(0,2);
		cFH.splice(0,2);

		//console.log("PrePush P: ", pFH);
		//console.log("PrePush C: ", cFH);

		pFH.push(pFHTemp2, pFHTemp1);
		cFH.push(cFHTemp2, cFHTemp1);

		//console.log("Post P: ", pFH);
		//console.log("Post C: ", cFH);

		for (var g = pFH.length - 1; g >= 0; g--)
		{
			if (pFH[g] > cFH[g])
			{
				tieResult = "Player wins!";
				break;
			}
			else if (pFH[g] < cFH[g])
			{
				tieResult = "Casino wins!";
				break;
			}
			else if (pFH[g] == cFH[g])
			{
				tieResult = "Tie.";
			}
		}
	}

	//Flush tiebreaker
	if (pHandString == "Flush" && cHandString == "Flush")
	{
		var pF = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pF.push(pHand[a]);
		}
		var cF = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cF.push(cHand[a]);
		}

		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pF.length; i++)
		{
			if(pF[i].Value == "A")
			{
				pF[i].Value = 14;
			}
			else if(pF[i].Value == "2")
			{
				pF[i].Value = 2;
			}
			else if(pF[i].Value == "3")
			{
				pF[i].Value = 3;
			}
			else if(pF[i].Value == "4")
			{
				pF[i].Value = 4;
			}
			else if(pF[i].Value == "5")
			{
				pF[i].Value = 5;
			}
			else if(pF[i].Value == "6")
			{
				pF[i].Value = 6;
			}
			else if(pF[i].Value == "7")
			{
				pF[i].Value = 7;
			}
			else if(pF[i].Value == "8")
			{
				pF[i].Value = 8;
			}
			else if(pF[i].Value == "9")
			{
				pF[i].Value = 9;
			}
			else if(pF[i].Value == "10")
			{
				pF[i].Value = 10;
			}
			else if(pF[i].Value == "J")
			{
				pF[i].Value = 11;
			}
			else if(pF[i].Value == "Q")
			{
				pF[i].Value = 12;
			}
			else if(pF[i].Value == "K")
			{
				pF[i].Value = 13;
			}
		}
		for (var j = 0; j < cF.length; j++)
		{
			if(cF[j].Value == "A")
			{
				cF[j].Value = 14;
			}
			else if(cF[j].Value == "2")
			{
				cF[j].Value = 2;
			}
			else if(cF[j].Value == "3")
			{
				cF[j].Value = 3;
			}
			else if(cF[j].Value == "4")
			{
				cF[j].Value = 4;
			}
			else if(cF[j].Value == "5")
			{
				cF[j].Value = 5;
			}
			else if(cF[j].Value == "6")
			{
				cF[j].Value = 6;
			}
			else if(cF[j].Value == "7")
			{
				cF[j].Value = 7;
			}
			else if(cF[j].Value == "8")
			{
				cF[j].Value = 8;
			}
			else if(cF[j].Value == "9")
			{
				cF[j].Value = 9;
			}
			else if(cF[j].Value == "10")
			{
				cF[j].Value = 10;
			}
			else if(cF[j].Value == "J")
			{
				cF[j].Value = 11;
			}
			else if(cF[j].Value == "Q")
			{
				cF[j].Value = 12;
			}
			else if(cF[j].Value == "K")
			{
				cF[j].Value = 13;
			}
		}

		//console.log("presort P", pF);
		//console.log("presort C", cF);

		var pFTemp1 = 0;
		var pFTemp2 = 0;
		var pFTemp3 = 0;
		var pFTemp4 = 0;
		var pFTemp5 = 0;
		var cFTemp1 = 0;
		var cFTemp2 = 0;
		var cFTemp3 = 0;
		var cFTemp4 = 0;
		var cFTemp5 = 0;

		pF.sort((a, b) => {if(a.Suit < b.Suit){return -1} if (a.Suit > b.Suit) {return 1} return 0});
		cF.sort((a, b) => {if(a.Suit < b.Suit){return -1} if (a.Suit > b.Suit) {return 1} return 0});

		//console.log("postsort P", pF);
		//console.log("postsort C", cF);

		var pTrue = 0;
		var cTrue = 0;
		for (var k = 0; k < 3; k++)
		{
			if ((pF[k].Suit == "spades" && pF[k+1].Suit == "spades" && pF[k+2].Suit == "spades" && pF[k+3].Suit == "spades" && pF[k+4].Suit == "spades") && pTrue == 0)
			{
				pFTemp5 = pF[k].Value;
				pFTemp4 = pF[k+1].Value;
				pFTemp3 = pF[k+2].Value;
				pFTemp2 = pF[k+3].Value;
				pFTemp1 = pF[k+4].Value;
				pTrue = 1;
				break;
			}
			else if ((pF[k].Suit == "diamonds" && pF[k+1].Suit == "diamonds" && pF[k+2].Suit == "diamonds" && pF[k+3].Suit == "diamonds" && pF[k+4].Suit == "diamonds") && pTrue == 0)
			{
				pFTemp5 = pF[k].Value;
				pFTemp4 = pF[k+1].Value;
				pFTemp3 = pF[k+2].Value;
				pFTemp2 = pF[k+3].Value;
				pFTemp1 = pF[k+4].Value;
				pTrue = 1;
				break;
			}
			else if ((pF[k].Suit == "clubs" && pF[k+1].Suit == "clubs" && pF[k+2].Suit == "clubs" && pF[k+3].Suit == "clubs" && pF[k+4].Suit == "clubs") && pTrue == 0)
			{
				pFTemp5 = pF[k].Value;
				pFTemp4 = pF[k+1].Value;
				pFTemp3 = pF[k+2].Value;
				pFTemp2 = pF[k+3].Value;
				pFTemp1 = pF[k+4].Value;
				pTrue = 1;
				break;
			}
			else if ((pF[k].Suit == "hearts" && pF[k+1].Suit == "hearts" && pF[k+2].Suit == "hearts" && pF[k+3].Suit == "hearts" && pF[k+4].Suit == "hearts") && pTrue == 0)
			{
				pFTemp5 = pF[k].Value;
				pFTemp4 = pF[k+1].Value;
				pFTemp3 = pF[k+2].Value;
				pFTemp2 = pF[k+3].Value;
				pFTemp1 = pF[k+4].Value;
				pTrue = 1;
				break;
			}
		}
		for (var g = 0; g < 3; g++)
		{
			if ((cF[g].Suit == "spades" && cF[g+1].Suit == "spades" && cF[g+2].Suit == "spades" && cF[g+3].Suit == "spades" && cF[g+4].Suit == "spades") && cTrue == 0)
			{
				cFTemp5 = cF[g].Value;
				cFTemp4 = cF[g+1].Value;
				cFTemp3 = cF[g+2].Value;
				cFTemp2 = cF[g+3].Value;
				cFTemp1 = cF[g+4].Value;
				cTrue = 1;
				break;
			}
			else if ((cF[g].Suit == "diamonds" && cF[g+1].Suit == "diamonds" && cF[g+2].Suit == "diamonds" && cF[g+3].Suit == "diamonds" && cF[g+4].Suit == "diamonds") && cTrue == 0)
			{
				cFTemp5 = cF[g].Value;
				cFTemp4 = cF[g+1].Value;
				cFTemp3 = cF[g+2].Value;
				cFTemp2 = cF[g+3].Value;
				cFTemp1 = cF[g+4].Value;
				cTrue = 1;
				break;
			}
			else if ((cF[g].Suit == "clubs" && cF[g+1].Suit == "clubs" && cF[g+2].Suit == "clubs" && cF[g+3].Suit == "clubs" && cF[g+4].Suit == "clubs") && cTrue == 0)
			{
				cFTemp5 = cF[g].Value;
				cFTemp4 = cF[g+1].Value;
				cFTemp3 = cF[g+2].Value;
				cFTemp2 = cF[g+3].Value;
				cFTemp1 = cF[g+4].Value;
				cTrue = 1;
				break;
			}
			else if ((cF[g].Suit == "hearts" && cF[g+1].Suit == "hearts" && cF[g+2].Suit == "hearts" && cF[g+3].Suit == "hearts" && cF[g+4].Suit == "hearts") && cTrue == 0)
			{
				cFTemp5 = cF[g].Value;
				cFTemp4 = cF[g+1].Value;
				cFTemp3 = cF[g+2].Value;
				cFTemp2 = cF[g+3].Value;
				cFTemp1 = cF[g+4].Value;
				cTrue = 1;
				break;
			}
		}

		pF.splice(0, 7);
		cF.splice(0, 7);

		//console.log("Spliced", pF);
		//console.log("Spliced", cF);

		pF.push(pFTemp1, pFTemp2, pFTemp3, pFTemp4, pFTemp5);
		cF.push(cFTemp1, cFTemp2, cFTemp3, cFTemp4, cFTemp5);
		pF.sort(function(a, b){return a-b});
		cF.sort(function(a, b){return a-b});

		//console.log("Pushed", pF);
		//console.log("Pushed", cF);

		for (var y = pF.length - 1; y >= 0; y--)
		{
			if (pF[y] > cF[y])
			{
				tieResult = "Player wins!";
				break;
			}
			else if (pF[y] < cF[y])
			{
				tieResult = "Casino wins!";
				break;
			}
			else if (pF[y] == cF[y])
			{
				tieResult = "Tie.";
			}
		}
	}

	//Straight tiebreaker
	if (pHandString == "Straight" && cHandString == "Straight")
	{
		var pS = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pS.push(pHand[a].Value);
		}
		var cS = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cS.push(cHand[a].Value);
		}

		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pS.length; i++)
		{
			if(pS[i] == "A")
			{
				pS[i] = 14;
			}
			else if(pS[i] == "2")
			{
				pS[i] = 2;
			}
			else if(pS[i] == "3")
			{
				pS[i] = 3;
			}
			else if(pS[i] == "4")
			{
				pS[i] = 4;
			}
			else if(pS[i] == "5")
			{
				pS[i] = 5;
			}
			else if(pS[i] == "6")
			{
				pS[i] = 6;
			}
			else if(pS[i] == "7")
			{
				pS[i] = 7;
			}
			else if(pS[i] == "8")
			{
				pS[i] = 8;
			}
			else if(pS[i] == "9")
			{
				pS[i] = 9;
			}
			else if(pS[i] == "10")
			{
				pS[i] = 10;
			}
			else if(pS[i] == "J")
			{
				pS[i] = 11;
			}
			else if(pS[i] == "Q")
			{
				pS[i] = 12;
			}
			else if(pS[i] == "K")
			{
				pS[i] = 13;
			}
		}
		for (var j = 0; j < cS.length; j++)
		{
			if(cS[j] == "A")
			{
				cS[j] = 14;
			}
			else if(cS[j] == "2")
			{
				cS[j] = 2;
			}
			else if(cS[j] == "3")
			{
				cS[j] = 3;
			}
			else if(cS[j] == "4")
			{
				cS[j] = 4;
			}
			else if(cS[j] == "5")
			{
				cS[j] = 5;
			}
			else if(cS[j] == "6")
			{
				cS[j] = 6;
			}
			else if(cS[j] == "7")
			{
				cS[j] = 7;
			}
			else if(cS[j] == "8")
			{
				cS[j] = 8;
			}
			else if(cS[j] == "9")
			{
				cS[j] = 9;
			}
			else if(cS[j] == "10")
			{
				cS[j] = 10;
			}
			else if(cS[j] == "J")
			{
				cS[j] = 11;
			}
			else if(cS[j] == "Q")
			{
				cS[j] = 12;
			}
			else if(cS[j] == "K")
			{
				cS[j] = 13;
			}
		}		

		//console.log("Pre Sort P", pS);
		//console.log("Pre Sort C", cS);

		pS.sort(function(a, b){return a-b});
		cS.sort(function(a, b){return a-b});

		//console.log("Post Sort P", pS);
		//console.log("Post Sort C", cS);

		var repi, repj;
		for (repi = 0; repi < pS.length; repi++)
		{
			for (var repj = repi+1; repj < pS.length; repj++)
			{
				if (pS[repi] == pS[repj])
				{
					pS.splice(repj, 1);
					repj--;
				} 
			}
		}
		for (repi = 0; repi < cS.length; repi++)
		{
			for (var repj = repi+1; repj < cS.length; repj++)
			{
				if (cS[repi] == cS[repj])
				{
					cS.splice(repj, 1);
					repj--;
				} 
			}
		}

		var pSTemp1 = 0;
		var pSTemp2 = 0;
		var pSTemp3 = 0;
		var pSTemp4 = 0;
		var pSTemp5 = 0;
		var cSTemp1 = 0;
		var cSTemp2 = 0;
		var cSTemp3 = 0;
		var cSTemp4 = 0;
		var cSTemp5 = 0;


		for (var w = pS.length - 1; w > 3; w--)
 		{
 			if ((pS[w-1] == pS[w]-1) && (pS[w-2] == pS[w]-2) && (pS[w-3] == pS[w]-3) && (pS[w-4] == pS[w]-4))
 			{
 				pSTemp1 = pS[w-4];
 				pSTemp2 = pS[w-3];
 				pSTemp3 = pS[w-2];
 				pSTemp4 = pS[w-1];
 				pSTemp5 = pS[w];
 			}
 		}

 		for (var y = cS.length - 1; y > 3; y--)
 		{
 			if ((cS[y-1] == cS[y]-1) && (cS[y-2] == cS[y]-2) && (cS[y-3] == cS[y]-3) && (cS[y-4] == cS[y]-4))
 			{
 				cSTemp1 = cS[y-4];
 				cSTemp2 = cS[y-3];
 				cSTemp3 = cS[y-2];
 				cSTemp4 = cS[y-1];
 				cSTemp5 = cS[y];
 			}
 		}
 		pS.splice(0, pS.length);
 		cS.splice(0, cS.length);
 		pS.push(pSTemp1, pSTemp2, pSTemp3, pSTemp4, pSTemp5);
 		cS.push(cSTemp1, cSTemp2, cSTemp3, cSTemp4, cSTemp5);

 		//console.log("Post Push P", pS);
		//console.log("Post Push C", cS);

 		//Compare the highest card in Straight. User w higher value wins. Split if they have same exact value
		if (pS[4] > cS[4])
		{
			tieResult = "Player wins!";
		}
		else if (pS[4] < cS[4])
		{
			tieResult = "Casino wins!";
		}
		else
		{
			tieResult = "Tie.";
		}
	}

	//Three of A Kind tiebreaker
	if (pHandString == "Three of A Kind" && cHandString == "Three of A Kind")
	{
		var pTOK = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pTOK.push(pHand[a].Value);
		}
		var cTOK = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cTOK.push(cHand[a].Value);
		}

		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pTOK.length; i++)
		{
			if(pTOK[i] == "A")
			{
				pTOK[i] = 14;
			}
			else if(pTOK[i] == "2")
			{
				pTOK[i] = 2;
			}
			else if(pTOK[i] == "3")
			{
				pTOK[i] = 3;
			}
			else if(pTOK[i] == "4")
			{
				pTOK[i] = 4;
			}
			else if(pTOK[i] == "5")
			{
				pTOK[i] = 5;
			}
			else if(pTOK[i] == "6")
			{
				pTOK[i] = 6;
			}
			else if(pTOK[i] == "7")
			{
				pTOK[i] = 7;
			}
			else if(pTOK[i] == "8")
			{
				pTOK[i] = 8;
			}
			else if(pTOK[i] == "9")
			{
				pTOK[i] = 9;
			}
			else if(pTOK[i] == "10")
			{
				pTOK[i] = 10;
			}
			else if(pTOK[i] == "J")
			{
				pTOK[i] = 11;
			}
			else if(pTOK[i] == "Q")
			{
				pTOK[i] = 12;
			}
			else if(pTOK[i] == "K")
			{
				pTOK[i] = 13;
			}
		}
		for (var j = 0; j < cTOK.length; j++)
		{
			if(cTOK[j] == "A")
			{
				cTOK[j] = 14;
			}
			else if(cTOK[j] == "2")
			{
				cTOK[j] = 2;
			}
			else if(cTOK[j] == "3")
			{
				cTOK[j] = 3;
			}
			else if(cTOK[j] == "4")
			{
				cTOK[j] = 4;
			}
			else if(cTOK[j] == "5")
			{
				cTOK[j] = 5;
			}
			else if(cTOK[j] == "6")
			{
				cTOK[j] = 6;
			}
			else if(cTOK[j] == "7")
			{
				cTOK[j] = 7;
			}
			else if(cTOK[j] == "8")
			{
				cTOK[j] = 8;
			}
			else if(cTOK[j] == "9")
			{
				cTOK[j] = 9;
			}
			else if(cTOK[j] == "10")
			{
				cTOK[j] = 10;
			}
			else if(cTOK[j] == "J")
			{
				cTOK[j] = 11;
			}
			else if(cTOK[j] == "Q")
			{
				cTOK[j] = 12;
			}
			else if(cTOK[j] == "K")
			{
				cTOK[j] = 13;
			}
		}

		//console.log("Pre P: ", pTOK);
		//console.log("Pre C: ", cTOK);

		pTOK.sort(function(a, b){return a-b});
		cTOK.sort(function(a, b){return a-b});

		//console.log("Sorted P: ", pTOK);
		//console.log("Sorted C: ", cTOK);
		
		var pTOKTemp = 0;
		var cTOKTemp = 0;

		var pTrue = 0;
		var cTrue = 0;
		for (var v = 0; v < pTOK.length; v++)
		{
			if ((pTOK[v] == pTOK[v+1]) && pTrue == 0)
			{
				pTOKTemp = pTOK[v];
				pTOK.splice(v, 2);
				pTrue = 1;
				break;
			}
		}
		//console.log("splice 1 P: ", pTOK);
		pTrue = 0;
		for (var c = 0; c < pTOK.length; c++)
		{
			if ((pTOK[c] == pTOKTemp) && pTrue == 0)
			{
				pTOK.splice(c, 1);
				pTrue = 1;
				break;
			}
		}
		//console.log("splice 2 P: ", pTOK);
		
		for (var a = 0; a < cTOK.length; a++)
		{
			if ((cTOK[a] == cTOK[a+1]) && cTrue == 0)
			{
				cTOKTemp = cTOK[a];
				cTOK.splice(a, 2);
				cTrue = 1;
				break;
			}
		}
		//console.log("splice 1 C: ", cTOK);
		cTrue = 0;
		for (var d = 0; d < cTOK.length; d++)
		{
			if ((cTOK[d] == cTOKTemp) && cTrue == 0)
			{
				cTOK.splice(d, 1);
				cTrue = 1;
				break;
			}
		}
		//console.log("splice 2 C: ", cTOK);

		pTOK.splice(0, 2);
		cTOK.splice(0, 2);
		pTOK.push(pTOKTemp);
		cTOK.push(cTOKTemp);


		//Compare the Two Pair value and Kickers. User w higher value wins. Split if they have same exact value
		for (var y = pTOK.length - 1; y >= 0; y--)
		{
			if (pTOK[y] > cTOK[y])
			{
				tieResult = "Player wins!";
				break;
			}
			else if (pTOK[y] < cTOK[y])
			{
				tieResult = "Casino wins!";
				break;
			}
			else if (pTOK[y] == cTOK[y])
			{
				tieResult = "Tie.";
			}
		}
	}

	//Two Pairs tiebreaker
	if (pHandString == "Two Pair" && cHandString == "Two Pair")
	{
		var pTP = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pTP.push(pHand[a].Value);
		}
		var cTP = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cTP.push(cHand[a].Value);
		}

		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pTP.length; i++)
		{
			if(pTP[i] == "A")
			{
				pTP[i] = 14;
			}
			else if(pTP[i] == "2")
			{
				pTP[i] = 2;
			}
			else if(pTP[i] == "3")
			{
				pTP[i] = 3;
			}
			else if(pTP[i] == "4")
			{
				pTP[i] = 4;
			}
			else if(pTP[i] == "5")
			{
				pTP[i] = 5;
			}
			else if(pTP[i] == "6")
			{
				pTP[i] = 6;
			}
			else if(pTP[i] == "7")
			{
				pTP[i] = 7;
			}
			else if(pTP[i] == "8")
			{
				pTP[i] = 8;
			}
			else if(pTP[i] == "9")
			{
				pTP[i] = 9;
			}
			else if(pTP[i] == "10")
			{
				pTP[i] = 10;
			}
			else if(pTP[i] == "J")
			{
				pTP[i] = 11;
			}
			else if(pTP[i] == "Q")
			{
				pTP[i] = 12;
			}
			else if(pTP[i] == "K")
			{
				pTP[i] = 13;
			}
		}
		for (var j = 0; j < cTP.length; j++)
		{
			if(cTP[j] == "A")
			{
				cTP[j] = 14;
			}
			else if(cTP[j] == "2")
			{
				cTP[j] = 2;
			}
			else if(cTP[j] == "3")
			{
				cTP[j] = 3;
			}
			else if(cTP[j] == "4")
			{
				cTP[j] = 4;
			}
			else if(cTP[j] == "5")
			{
				cTP[j] = 5;
			}
			else if(cTP[j] == "6")
			{
				cTP[j] = 6;
			}
			else if(cTP[j] == "7")
			{
				cTP[j] = 7;
			}
			else if(cTP[j] == "8")
			{
				cTP[j] = 8;
			}
			else if(cTP[j] == "9")
			{
				cTP[j] = 9;
			}
			else if(cTP[j] == "10")
			{
				cTP[j] = 10;
			}
			else if(cTP[j] == "J")
			{
				cTP[j] = 11;
			}
			else if(cTP[j] == "Q")
			{
				cTP[j] = 12;
			}
			else if(cTP[j] == "K")
			{
				cTP[j] = 13;
			}
		}
		
		//console.log(pTP);
		//console.log(cTP);
		pTP.sort(function(a, b){return a-b});
		cTP.sort(function(a, b){return a-b});
		//console.log("pre ", pTP);
		//console.log("pre ", cTP);

		var pTPTemp1 = 0;
		var pTPTemp2 = 0;
		var cTPTemp1 = 0;
		var cTPTemp2 = 0;

		var pTrue = 0;
		var cTrue = 0;

		for (var v = pTP.length - 1; v >= 0; v--)
		{
			if ((pTP[v] == pTP[v-1]) && pTrue == 0)
			{
				pTPTemp1 = pTP[v];
				pTP.splice(v-1, 2);
				pTrue = 1;
				break;
			}
		}
		//console.log("splice 1 ", pTP);
		pTrue = 0;
		for (var c = pTP.length - 1; c >= 0; c--)
		{
			if ((pTP[c] == pTP[c-1]) && pTrue == 0)
			{
				pTPTemp2 = pTP[c];
				pTP.splice(c-1, 2);
				pTrue = 1;
				break;
			}
		}
		//console.log("splice 2 ", pTP);
		for (var v = cTP.length - 1; v >= 0; v--)
		{
			if ((cTP[v] == cTP[v-1]) && cTrue == 0)
			{
				cTPTemp1 = cTP[v];
				cTP.splice(v-1, 2);
				cTrue = 1;
				break;
			}
		}
		cTrue = 0;
		//console.log("splice 1 ",cTP);
		for (var c = cTP.length - 1; c >= 0; c--)
		{
			if ((cTP[c] == cTP[c-1]) && cTrue == 0)
			{
				cTPTemp2 = cTP[c];
				cTP.splice(c-1, 2);
				cTrue = 1;
				break;
			}
		}
		//console.log("splice 2 ", cTP);


		pTP.splice(0, 2);
		cTP.splice(0, 2);

		//console.log(pTP);
		//console.log(cTP);

		if (pTPTemp1 > pTPTemp2)
		{
			pTP.push(pTPTemp2);
			pTP.push(pTPTemp1);
		}
		else
		{
			pTP.push(pTPTemp1);
			pTP.push(pTPTemp2);
		}

		if (cTPTemp1 > cTPTemp2)
		{
			cTP.push(cTPTemp2);
			cTP.push(cTPTemp1);
		}
		else
		{
			cTP.push(cTPTemp1);
			cTP.push(cTPTemp2);
		}

		//console.log(pTP);
		//console.log(cTP);

		//Compare the Two Pair value and Kickers. User w higher value wins. Split if they have same exact value
		for (var y = pTP.length - 1; y >= 0; y--)
		{
			if (pTP[y] > cTP[y])
			{
				tieResult = "Player wins!";
				break;
			}
			else if (pTP[y] < cTP[y])
			{
				tieResult = "Casino wins!";
				break;
			}
			else
			{
				tieResult = "Tie.";
			}
		}
	}

	//One Pair tiebreaker
	if (pHandString == "One Pair" && cHandString == "One Pair")
	{
		var pOP = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pOP.push(pHand[a].Value);
		}
		var cOP = [];
		for (var a = 0; a < cHand.length; a++)
		{
			cOP.push(cHand[a].Value);
		}

		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pOP.length; i++)
		{
			if(pOP[i] == "A")
			{
				pOP[i] = 14;
			}
			else if(pOP[i] == "2")
			{
				pOP[i] = 2;
			}
			else if(pOP[i] == "3")
			{
				pOP[i] = 3;
			}
			else if(pOP[i] == "4")
			{
				pOP[i] = 4;
			}
			else if(pOP[i] == "5")
			{
				pOP[i] = 5;
			}
			else if(pOP[i] == "6")
			{
				pOP[i] = 6;
			}
			else if(pOP[i] == "7")
			{
				pOP[i] = 7;
			}
			else if(pOP[i] == "8")
			{
				pOP[i] = 8;
			}
			else if(pOP[i] == "9")
			{
				pOP[i] = 9;
			}
			else if(pOP[i] == "10")
			{
				pOP[i] = 10;
			}
			else if(pOP[i] == "J")
			{
				pOP[i] = 11;
			}
			else if(pOP[i] == "Q")
			{
				pOP[i] = 12;
			}
			else if(pOP[i] == "K")
			{
				pOP[i] = 13;
			}
		}
		for (var j = 0; j < cOP.length; j++)
		{
			if(cOP[j] == "A")
			{
				cOP[j] = 14;
			}
			else if(cOP[j] == "2")
			{
				cOP[j] = 2;
			}
			else if(cOP[j] == "3")
			{
				cOP[j] = 3;
			}
			else if(cOP[j] == "4")
			{
				cOP[j] = 4;
			}
			else if(cOP[j] == "5")
			{
				cOP[j] = 5;
			}
			else if(cOP[j] == "6")
			{
				cOP[j] = 6;
			}
			else if(cOP[j] == "7")
			{
				cOP[j] = 7;
			}
			else if(cOP[j] == "8")
			{
				cOP[j] = 8;
			}
			else if(cOP[j] == "9")
			{
				cOP[j] = 9;
			}
			else if(cOP[j] == "10")
			{
				cOP[j] = 10;
			}
			else if(cOP[j] == "J")
			{
				cOP[j] = 11;
			}
			else if(cOP[j] == "Q")
			{
				cOP[j] = 12;
			}
			else if(cOP[j] == "K")
			{
				cOP[j] = 13;
			}
		}

		pOP.sort(function(a, b){return a-b});
		cOP.sort(function(a, b){return a-b});
		
		var pOPTemp = 0;
		var cOPTemp = 0;

		//console.log(pOP);
		//console.log(cOP);

		var pTrue = 0;
		var cTrue = 0;
		for (var v = pOP.length - 1; v >= 0; v--)
		{
			for (var w = pOP.length - 2; w >= 0; w--)
			{
				if ((pOP[v] == pOP[w]) && pTrue == 0)
				{
					pOPTemp = pOP[v];
					pOP.splice(v-1, 2);
					console.log("splice: ",pOP);
					pTrue = 1;
					//pOP.splice(w, 1);
					//console.log("splice: ",pOP);
				}
			}
		}
		for (var a = cOP.length - 1; a >= 0; a--)
		{
			for (var b = cOP.length - 2; b >= 0; b--)
			{
				if ((cOP[a] == cOP[b]) && cTrue == 0)
				{
					cOPTemp = cOP[b];
					cOP.splice(a-1, 2);
					console.log("splice: ", cOP);
					cTrue = 1;
					//cOP.splice(b, 1);
					//console.log("splice: ", cOP);
				}
			}
		}

		pOP.splice(0, 2);
		cOP.splice(0, 2);
		pOP.push(pOPTemp);
		cOP.push(cOPTemp);
		//console.log(pOP);
		//console.log(cOP);


		//Compare the Pair value and Kickers. User w higher value wins. Split if they have same exact value
		for (var y = pOP.length - 1; y >= 0; y--)
		{
			if (pOP[y] > cOP[y])
			{
				tieResult = "Player wins!";
				break;
			}
			else if (pOP[y] < cOP[y])
			{
				tieResult = "Casino wins!";
				break;
			}
			else if (pOP[y] == cOP[y])
			{
				tieResult = "Tie.";
			}
		}
	}

	//High Card tiebreaker
	if (pHandString == "High Card" && cHandString == "High Card")
	{
		var pHigh = [];
		for (var a = 0; a < pHand.length; a++)
		{
			pHigh.push(pHand[a].Value);
		}
		var cHigh = [];
		for (var b = 0; b < pHand.length; b++)
		{
			cHigh.push(cHand[b].Value);
		}

		//Converts A, K, Q, J to numerical values and stores all 7 cards into array. 2 lowest are then removed
		for (var i = 0; i < pHigh.length; i++)
		{
			if(pHigh[i] == "A")
			{
				pHigh[i] = 14;
			}
			else if(pHigh[i] == "2")
			{
				pHigh[i] = 2;
			}
			else if(pHigh[i] == "3")
			{
				pHigh[i] = 3;
			}
			else if(pHigh[i] == "4")
			{
				pHigh[i] = 4;
			}
			else if(pHigh[i] == "5")
			{
				pHigh[i] = 5;
			}
			else if(pHigh[i] == "6")
			{
				pHigh[i] = 6;
			}
			else if(pHigh[i] == "7")
			{
				pHigh[i] = 7;
			}
			else if(pHigh[i] == "8")
			{
				pHigh[i] = 8;
			}
			else if(pHigh[i] == "9")
			{
				pHigh[i] = 9;
			}
			else if(pHigh[i] == "10")
			{
				pHigh[i] = 10;
			}
			else if(pHigh[i] == "J")
			{
				pHigh[i] = 11;
			}
			else if(pHigh[i] == "Q")
			{
				pHigh[i] = 12;
			}
			else if(pHigh[i] == "K")
			{
				pHigh[i] = 13;
			}
		}
		for (var j = 0; j < cHigh.length; j++)
		{
			if(cHigh[j] == "A")
			{
				cHigh[j] = 14;
			}
			else if(cHigh[j] == "2")
			{
				cHigh[j] = 2;
			}
			else if(cHigh[j] == "3")
			{
				cHigh[j] = 3;
			}
			else if(cHigh[j] == "4")
			{
				cHigh[j] = 4;
			}
			else if(cHigh[j] == "5")
			{
				cHigh[j] = 5;
			}
			else if(cHigh[j] == "6")
			{
				cHigh[j] = 6;
			}
			else if(cHigh[j] == "7")
			{
				cHigh[j] = 7;
			}
			else if(cHigh[j] == "8")
			{
				cHigh[j] = 8;
			}
			else if(cHigh[j] == "9")
			{
				cHigh[j] = 9;
			}
			else if(cHigh[j] == "10")
			{
				cHigh[j] = 10;
			}
			else if(cHigh[j] == "J")
			{
				cHigh[j] = 11;
			}
			else if(cHigh[j] == "Q")
			{
				cHigh[j] = 12;
			}
			else if(cHigh[j] == "K")
			{
				cHigh[j] = 13;
			}
		}

		//console.log("pHigh and cHigh Original");
		//console.log(pHigh);
		//console.log(cHigh);

		pHigh.sort(function(a, b){return b - a});
		cHigh.sort(function(a, b){return b - a});

		//console.log("pHigh and cHigh Sorted");
		//console.log(pHigh);
		//console.log(cHigh);

		pHigh.splice(5,2);
		cHigh.splice(5,2);

		//console.log("pHigh and cHigh Spliced");
		//console.log(pHigh);
		//console.log(cHigh);

		//Compare the High Card and Kickers. User w higher value wins. Split if they have same exact value
		for (var y = 0; y < pHigh.length; y++)
		{
			if (pHigh[y] > cHigh[y])
			{
				tieResult = "Player wins!";
				break;
			}
			else if (pHigh[y] < cHigh[y])
			{
				tieResult = "Casino wins!";
				break;
			}
			else if (pHigh[y] == cHigh[y])
			{
				tieResult = "Tie."; 
			}
		}
	}
	return tieResult;
}

//var pH = [deck[36],deck[37],deck[35],deck[34],deck[33],deck[27],deck[43]];
//var cH = [deck[32],deck[31],deck[35],deck[34],deck[33],deck[27],deck[43]];
//console.log(pH);
//console.log(cH);
//var PlayerString = EvaluateHand(pH);
//var CasinoString = EvaluateHand(cH);
//console.log("result is: ", PlayerString);
//console.log("result is: ", CasinoString);
//pH.sort((a,b) => (a.Value > b.Value ? 1 : -1));
//cH.sort((a,b) => (a.Value > b.Value ? 1 : -1));
//console.log(pH);
//console.log(cH);
//var GameWinner = EvaluateWinner(pH, cH, PlayerString, CasinoString);
//console.log("Winner is: ", GameWinner);	

// module.exports = {
//   EvaluateHand,
//   checkOnePair,
//   checkHighCard,
//   checkThreeOfAKind,
//   checkFourOfAKind,
//   checkTwoPair,
//   checkStraight,
//   checkFlush,
//   checkFullHouse,
//   checkStraightFlush,
//   updateSuitCounter,
//   updateValueCounter,
//   checkTie,
//   EvaluateWinner
// }
