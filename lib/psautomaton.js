/* psautomaton */

const Automaton = require("./automaton");
const Placement = require("./placement");
const Style = require("./style");

function Psautomaton () {
  this.automaton = new Automaton();
  this.placement = new Placement();
  this.style = new Style();
}

Psautomaton.prototype = {
  getAutomaton: function() {
    return this.automaton;
  },
  getPlacement: function() {
    return this.placement;
  },
  getStyle: function() {
    return this.style;
  }
};
    
