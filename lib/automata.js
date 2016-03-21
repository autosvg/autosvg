"use strict";



/*      SYMBOL       */


function Symbol(name) {
    this.name = name;
}

Symbol.prototype = {
    getName: function() {
        return this.name;
    }
}

/*      STATE       */

// flags => 0(rien) 1(intial) 2(final) 3(final+initial)

var StateEnum = {
    NOTHING: 0,
    INITIAL: 1,
    FINAL: 2,
    BOTH: 3
};

function State(name, flags) {
    this.name = name;
    this.flags = flags;
}


State.prototype = {
    isFinal: function() {
        return ((this.flags & StateEnum.FINAL) == StateEnum.FINAL);
    },
    isInitial: function() {
        return ((this.flags & StateEnum.INITIAL) == StateEnum.INITIAL);
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

function Automaton(type, states, transitions, symbols) {
    this.type = type;
    this.states = states;
    this.transitions = transitions;
    this.symbols = symbols;
}

Automaton.prototype = {
    getType: function() {
        return this.type;
    },
    getNbStates: function() {
        return states.length;
    },
    getState: function(id) {
        return states[id];
    },
    getNbTransitions: function() {
        return transitions.length;
    },
    deleteState: function(id) {
        this.transitions.remove[id];
    }

}



/*

let alphabet = [new Sym("a"), new Sym("b")];
let states = [new State(0), new State(1)];
let automata = {
    alphabet,
    states,
    init: [states[0]],
    term: [states[1]],
    transitions: [
        new Transition(states[0], alphabet[0], states[1]),
        new Transition(states[1], alphabet[1], states[1])
    ]
};

exports.automata = () => automata;

*/