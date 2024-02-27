var playerWeb3;
// var contractAddress;

function toggleErrorPopup() {
  document.getElementById("popup-error").classList.toggle("active");
}

function toggleTokenPopup() {
  document.getElementById("popup-token").classList.toggle("active");
}

function initToken() {
  //sets storagesession var, displays tokens on screen
  //sessionStorage.setItem("tokens","Tokens: 0"); // so tokens stays the same after reload, tostring with base 10
  if (sessionStorage.getItem("tokens") == null) {
    document.getElementById("token-display").innerHTML = "Tokens: 0";
  }
  else {
    document.getElementById("token-display").innerHTML = "Tokens: " + sessionStorage.getItem("tokens");
  }

}

async function loadWeb3() {
  //connects to metamask via web3
  if (window.ethereum) {
    var web3js = new Web3(window.ethereum);
    await ethereum.enable();
    //can use web3 with metamask
    //after this go to game page
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET","/deploy",true);
    xhttp.onloadend = function(){
      console.log("contract address is: ", xhttp.responseText);
      location.replace('./play.html');
    }
    xhttp.send();
  }
  else if (window.web3) {
    //older versions of metamask
    web3js = new Web3(window.web3.currentProvider);
  }
  else {
    //they dont have metamask, popup shows up asking to install
    toggleErrorPopup();
    window.onbeforeunload = function(){
            return 'Are you sure you want to continue?';
        }
  }
}

/* Set the width of the sidebar to 250px (show it) */
function openNav() {
  document.getElementById("mySidepanel").style.width = "120px";
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
  document.getElementById("mySidepanel").style.width = "0";
}