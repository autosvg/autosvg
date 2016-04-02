"use strict";

module.exports = Automaton;

/*      SYMBOL       */


function Symbol(name) {
  this.name = name;
}

Symbol.prototype = {
  getName: function() {
    return this.name;
  }
};

/*      STATE       */

function State(name, is_initial, is_final) {
  this.name = name;
  this.is_initial = is_initial;
  this.is_final = is_final;
}


State.prototype = {
  isFinal: function() {
    return this.is_final;
  },
  isInitial: function() {
    return this.is_initial; 
  },
  getName: function() {
    return this.name;
  }
};

/*      TRANSITION       */


//from & to => id State // symbol => id Symbol
function Transition(from, symbol, to) {
  this.from = from;
  this.symbol = symbol;
  this.to = to;
}


/*      AUTOMATON       */

function Automaton(type) {
  this.type = type;
  this.states = new Array();
  this.transitions = new Array();
  this.symbols = new Array();
}

Automaton.prototype = {
  getType: function () {
    return this.type;
  },
  getNbStates: function () {
    return this.states.length;
  },
  getState: function (id) {
    return this.states[id];
  },
  getNbTransitions: function () {
    return this.transitions.length;
  },
  deleteState: function (id) {
    this.states.splice(id, 1);
  },
  getTransition: function (id) {
    return this.transitions[id];
  },
  getTransitions: function () {
    return this.transitions;
  },
  deleteTransition: function (id) {
    this.transition.splice(id, 1);
  },
  getSymbol: function (id) {
    return this.symbols[id];
  },
  getNbSymbol: function () {
    return this.symbols.length;
  },
  getSymbols: function () {
    return this.symbols;
  },
  deleteSymbol: function (id) {
    this.symbols.splice(id, 1);
  },
  addState: function (name, is_initial, is_final) {
    let s = new State(name, is_initial, is_final);
    this.states.push(s);
  },
  addTransition: function (from, symbol, to) {
    let t = new Transition(from, symbol, to);
    this.transitions.push(t);
  },
  addSymbol: function (name) {
    let s = new Symbol(name);
    this.symbols.push(s);
  }
};
