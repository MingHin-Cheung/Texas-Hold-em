



 // using Math.floor(random(1, 5))-1 to select random cards from deck[]
var CardCombos = new Map([
	["High Card", 1],
	["One Pair", 2],
	["Two Pair", 3],
	["Three of A Kind", 4],
	["Straight", 5],
	["Flush", 6],
	["Full House", 7],
	["Four of A Kind", 8],
	["Straight Flush", 9],
	["Royal Flush", 10]
	
]);



var handtocheck = [];
var counter = 0;
var pastHand = [];

function resetCounter(){
	counter = 0;
}

function clearHistory(){
	pastHand.length = 0;
}

var length = 7; //the evaluate function takes in arrays of size 7

function randomFill(handtocheck, length){
	for (i = 0; i < length; i++){
		handtocheck.push(deck[Math.round(random(0,51))]);
	}
	}



 function random(mn, mx) {  //retrieved from GeeksforGeeks
    return Math.random() * (mx - mn) + mn; 
} 






function decisionForFlop(combo)
{
 pastHand.push(combo);
 
 
 if(CardCombos.has(combo)){

	if(CardCombos.get(combo) >= 2){
		if(counter > 0 ){return 1;}
		else{
			counter+=1;
			return 2;
		}
	}
			
		else if(CardCombos.get(combo) >= 3){
			return 1;
		} else if (CardCombos.get(combo) >= 2){
			return 1;
		} else return 1;
}
}

function decisionForTurn(combo){

	pastHand.push(combo);
	let diff = CardCombos.get(combo) - CardCombos.get(pastHand[0]);
	//console.log(handtocheck);

	if(CardCombos.has(combo)){

		if(CardCombos.get(combo) >= 4 || diff >= 2)
		{
			if(counter > 0 ){return 1;}
			else{
				counter+=1;
				return 2;
			}
		}
			else if(CardCombos.get(combo) >= 2){
				return 1;
			} else if (CardCombos.get(combo) >= 4){
				return 1;
			} else return 1;
	}
}

function decisionForRiver(combo){

	
	

	
    let diff = CardCombos.get(combo) - CardCombos.get(pastHand[1]);
	

	if(CardCombos.has(combo)){

		if(CardCombos.get(combo) >= 4 || diff >= 2)
		{
			if(counter > 0 ){return 1;}
			else{
				counter+=1;
				return 2;
			}
		}
			else if(CardCombos.get(combo) >= 2){
				return 1;
			} else if (CardCombos.get(combo) >= 2){
				return 1;
			} else return 1;
	}
}







