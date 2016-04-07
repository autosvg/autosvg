export default function automaton() {
  return {
    alphabet,
    states,
    init: [ states[0] ],
    term: [ states[1] ],
    transitions: [
      new Transition(states[0], alphabet[0], states[1]),
      new Transition(states[1], alphabet[1], states[1])
    ]
  };
}

function Sym(name) {
  this.name = name;
}

function State(num) {
  this.num = num;
}

function Transition(from, symbol, to) {
  this.from = from;
  this.symbol = symbol;
  this.to = to;
}

let alphabet = [ new Sym("a"), new Sym("b") ];
let states = [ new State(0), new State(1) ];
