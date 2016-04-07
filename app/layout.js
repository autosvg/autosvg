export default function layout() {

  let automata = {
    type: "finite",
    alphabet: [ ],
    states: [ ],
    transitions: [ ]
  };

  let accessor = {};

  accessor.automata = function(x) {
    if(!arguments.length) return automata;
    automata = x;
    x.transitions.forEach((t) => {
      if (typeof t.source == "number") t.source = x.states[t.source];
      if (typeof t.target == "number") t.target = x.states[t.target];
      if (typeof t.symbol == "number") t.symbol = x.alphabet[t.symbol];
    });
    return accessor;
  };

  accessor.lay = function() {
    automata.states.forEach((s, i) => {
      s.x = 50 + (i % 3)*120;
      s.y = 50 + ((i / 3) | 0)*120;
    });
    return accessor;
  };

  return accessor;
}
