// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import rps_artifacts from '../../build/contracts/rps.json'

var  Rps= contract(rps_artifacts);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Rps.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshWinner();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshWinner: function() {
    var self = this;

    var rps;
    Rps.deployed().then(function(instance) {
      rps = instance;
      return rps.getLastWinner.call({from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("winner");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  register: function() {
    var self = this;
    var amount = parseInt(document.getElementById("amount").value);
    this.setStatus("Initiating transaction... (please wait)");
    var rps;
    Rps.deployed().then(function(instance) {
      rps= instance;
      return rps.register({value: amount, from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshWinner();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  play: function() {
    var self = this;
    var  selection = document.getElementById("selection").value;
    var rps;
    Rps.deployed().then(function(instance) {
      rps= instance;
      return rps.play(selection, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshWinner();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });

  }

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
