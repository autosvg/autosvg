import sketchFsm from "./sketchFsm";

export const fsmFromTree = function(input) {
  const struct = sketchFsm();

  input.states.forEach((s) => {
    if(s.initial == null) s.initial = false;
    if(s.terminal == null) s.terminal = false;
    struct.states.add(s);
  });

  input.symbols.forEach((a) => {
    struct.symbols.add(a);
  });

  const states = Array.from(struct.states.all());
  const symbols = Array.from(struct.symbols.all());
  input.transitions.forEach((t) => {
    t.from = states[t.from];
    t.to = states[t.to];
    t.by = symbols[t.by];
    struct.transitions.add(t);
  });

  return struct;
};

export const fsmToTree = function(struct) {

  const output = {
    type: "finite-state-machine",
    symbols: [],
    states: [],
    transitions: []
  };
  const indexes = {
    symbols: new Map(),
    states: new Map()
  };
  
  let i = 0;
  for(let a of struct.symbols.all()) {
    output.symbols.push(a.description);
    indexes.symbols.set(a, i++);
  }
  i = 0;
  for(let s of struct.states.all()) {
    output.states.push(s.description);
    indexes.states.set(s, i++);
  };

  for(let t of struct.transitions.all()) {
    const td = t.description;
    td.from = indexes.states.get(t.from);
    td.to = indexes.states.get(t.to);
    td.by = indexes.states.get(t.by);
    output.transitions.push(td);
  };

  return output;
};
