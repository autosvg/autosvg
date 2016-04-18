import * as checks from "./checks";
import check from "../utils/check";
import fsm from "../fsm";
import dagreD3 from "dagre-d3";

export default function sketchFsm(cfg) {
  return new Fsm(cfg);
}

function Fsm(cfg) {

  cfg = checks.cfg.resolve(cfg);  
  if(check.error(cfg)) {
    return cfg;
  }

  const data = {
    color: cfg.color,
    bold: cfg.color,
    italic: cfg.color
  };

  data.symbols = new WeakMap();
  data.states = new WeakMap();
  data.transitions = new WeakMap();
  data.edges = new Map();

  data.symbols.labels = new Map();
  data.states.labels = new Map();
  data.ids = new Set();

  checks.symbolLabel = check().mandatory().ofType("string").add((l) => {
    if(data.symbols.labels.has(l)) {
      return check.error(check.error.existingLabel);
    }
    return l;
  });

  const symbolsMixin = (FsmSymbol) => {
    class Symbol extends FsmSymbol {
      get label() { return data.symbols.get(this).label; };
      get description() {
        const a = data.symbols.get(this);
        const d = {};
        for(let prop of [ "label", "color", "bold", "italic" ]) {
          d[prop] = a[prop];
        }
        return d;
      }
      static add(descriptor) {
        descriptor = check().object({
          label: checks.symbolLabel,
          color: checks.color,
          bold: checks.bool.opt,
          bold: checks.bool.opt
        }).resolve(descriptor);
        if(check.error(descriptor)) { return descriptor; }
        const symbol = super.add();
        if(check.error(symbol)) { return symbol; }
        data.symbols.set(symbol, descriptor);
        return symbol;
      }
    }
    addAccessors(Symbol, "symbols", data, {
      color: { check: checks.color },
      bold: { check: checks.bool, default: false },
      italic: { check: checks.bool, default: false }
    });
    return Symbol;
  };

  checks.stateLabel = check().mandatory().ofType("string").add((l) => {
    if(data.states.labels.has(l)) {
      return check.error(check.error.existingLabel);
    }
    return label;
  });

  const statesMixin = (FsmState) => {
    class State extends FsmState {
      get description() {
        const s = data.states.get(this);
        const d = {};
        const properties = [
          "label", "x", "y", "width", "height", "color", "border-color",
          "text-color", "background-color", "bold", "italic"
        ];
        for(let prop of properties) {
          d[prop] = s[prop];
        }
        d.initial = super.initial;
        d.terminal = super.terminal;
        return d;
      }
      static add(descriptor) {
        // TODO check
        descriptor = Object.assign({}, descriptor);
        log.warn(descriptor);
        const state = FsmState.add({
          initial: descriptor.initial,
          terminal: descriptor.terminal
        });
        if(check.error(state)) { return state; }
        data.states.set(state, descriptor);
        // TODO cleanup
        const id = randomId(data);
        data.states.get(state).id = id;
        data.graph.setNode(id, { label: state.label });
        log.error(id);
        return state;
      }
    }
    addAccessors(State, "states", data, {
      label: { check: checks.string, precedence: [ ], default: "" },
      x: { check: checks.integer, precedence: [ ], default: 0 },
      y: { check: checks.integer, precedence: [ ], default: 0 },
      border_color: { check: checks.color, precedence: [
        function() { return data.states.get(this).color; },
        () => data.defaults.states["border-color"],
        () => data.defaults.states.color,
        () => data.color
      ]},
      text_color: { check: checks.color, precedence: [
        function() { return data.states.get(this).color; },
        () => data.defaults.states["text-color"],
        () => data.defaults.states.color,
        () => data.color
      ]},
      background_color: { check: checks.color },
      bold: { check: checks.bool, default: false },
      italic: { check: checks.bool, default: false },
      height: { check: checks.integer, precedence: [ /*TODO*/ () => 60 ]},
      width: { check: checks.integer, precedence: [ /*TODO*/ () => 60 ]}
    });
    return State;
  };

  const transitionsMixin = (FsmTransition) => {
    class Transition extends FsmTransition {
      get description() {
        const t = data.transitions.get(this);
        const d = {};
        for(let prop of [ "text-color", "bold", "italic" ]) {
          d[prop] = t[prop];
        }
        d.from = super.from;
        d.to = super.to;
        d.by = super.by;
        return d;
      }
      static add(descriptor) {
        // TODO check
        descriptor = Object.assign({}, descriptor);
        log.error(descriptor);
        const transition = super.add({
          from: descriptor.from,
          to: descriptor.to,
          by: descriptor.by
        });
        if(check.error(transition)) { return transition; }
        data.transitions.set(transition, descriptor);
        // TODO cleanup - add edge
        let fromDesc, sameFrom, edge;
        fromDesc = data.states.get(transition.from);
        sameFrom = fromDesc.edges
        if(sameFrom === undefined) {
          sameFrom = new Map();
          fromDesc.edges = sameFrom;
        } 
        edge = sameFrom.get(transition.to);
        if(edge === undefined) {
          edge = new Edge();
          sameFrom.set(transition.to, edge);
          data.edges.set(edge, {
            from: transition.from,
            to: transition.to,
            transitions: new Set()
          });
          data.graph.setEdge(
            fromDesc.id,
            data.states.get(transition.to).id,
            { label: edge.label });
        } else {
          data.edges.get(edge).transitions.add(transition);
          // TODO ugly
          data.graph.removeEdge(fromDesc.id, data.states.get(transition.to).id);
          data.graph.setEdge(
            fromDesc.id,
            data.states.get(transition.to).id,
            { label: edge.label });
        }
        return transition;
      }
    }
    addAccessors(Transition, "transitions", data, {
      text_color: { check: checks.color, precedence: [
        function() { return data.symbols.get(this.by).color; },
        () => data.defaults.transitions.color,
        () => data.defaults.symbols.color,
        () => data.color
      ], default: false },
      bold: { check: checks.bool, precedence: [
        function() { return data.symbols.get(this.by).bold; },
        () => data.defaults.transitions.bold,
        () => data.defaults.symbols.bold,
        () => data.bold
      ], default: false },
      italic: { check: checks.bool, precedence: [
        function() { return data.symbols.get(this.by).italic; },
        () => data.defaults.transitions.italic,
        () => data.defaults.symbols.italic,
        () => data.italic
      ], default:false }
    });
    return Transition;
  };
  
  // TODO sort symbols
  class Edge {
    get label() {
      return Array.from(
        data.edges.get(this).transitions,
        (t) => t.by.label).join(", ");
    }
  }

  data.fsm = fsm({
    mixins: {
      symbols: symbolsMixin,
      states: statesMixin,
      transitions: transitionsMixin
    }
  });

  data.graph = new dagreD3.graphlib.Graph().setGraph({rankdir: "LR"});

  this.symbols = data.fsm.symbols;
  this.states = data.fsm.states;
  this.transitions = data.fsm.transitions;

  // TODO hide this
  this.graph = data.graph;

  const importError = fromTree(cfg.descriptor, this);

  if(check.error(importError)) {
    return importError;
  }
}

const randomHash = () => Math.random().toString(36).substring(2);

const randomId = (data) => {
  let id;
  do {
    id = randomHash();
  } while(data.ids.has(id));
  data.ids.add(id);
  return id;
}

const fromTree = (descriptor, struct) => {

  const errors = {};
  const labels = new Set();
  let hasErrors = false;

  let symbols = check().iterable(check().add((a) => {
    const symbol = struct.symbols.add(a);
    if(!check.error(symbol)) {
      labels.add(symbol.label);
    }
    return symbol;
  })).resolve(descriptor.symbols);

  if(check.error(symbols)) {
    const dummyDescriptor = {};
    errors.symbols = symbols;
    log.error(symbols);
    symbols = symbols.output;
    for(let i = 0, dummySymbol; i < symbols.length; i++) {
      if(symbols[i] === undefined) {
        do {
          dummyDescriptor.label = randomHash();
        } while(labels.has(dummyDescriptor.label));
        // TODO bypass it
        dummySymbol = struct.symbols.add(dummyDescriptor);
        // Assuming this doesn't fail
        if(check.error(dummySymbol)) { throw dummySymbol; }
        symbols[i] = dummySymbol;
      }
    }
    hasErrors = true;
  }

  let states = check()
  .iterable(check().add((s) => {
    log.warn(s);
    return struct.states.add(s);
  }))
  .resolve(descriptor.states);

  if(check.error(states)) {
    const dummyDescriptor = {};
    errors.states = states;
    states = states.output;
    for(let i = 0, dummyState; i < states.length; i++) {
      // TODO bypass it
      dummyState = struct.states.add(dummyDescriptor);
      // Assuming this doesn't fail
      if(check.error(dummyState)) { throw dummyState; }
      states[i] = dummyState;
    }
    hasErrors = true;
  }

  let transitions = check().iterable(check().add((t) => {
    const d = Object.assign({}, t);
    d.from = states[t.from];
    d.to = states[t.to];
    log.error(t.by);
    d.by = symbols[t.by];
    return struct.transitions.add(d);
  })).resolve(descriptor.transitions);

  if(check.error(transitions)) {
    errors.transitions = transitions;
    transitions = transitions.output;
    hasErrors = true;
  }

  if(hasErrors) {
    return check().object({
      symbols: check(),
      states: check(),
      transitions: check()
    }).resolve(errors);
  }

};

const addAccessors = (proto, kind, data, object) => {
  let arg;
  for(let method of Object.keys(object)) {
    arg = object[method];
    makeAccessor(
      proto, kind,
      method.replace("_", "-"), method,
      arg.check, data, arg.precedence, arg.default);
  }
};

const makeAccessor = (proto, kind, prop, method, check, data, callbacks, defaults) => {
  if(callbacks === undefined) {
    callbacks = [
      () => data.defaults[kind][prop],
      () => data[prop]
    ];
  }
  if(defaults !== undefined) {
    callbacks.push(() => defaults);
  }
  callbacks.unshift(function() {
    return data[kind].get(this)[prop];
  });
  proto[method] = function(arg) {
    if(arg === undefined) {
      return precedence.lazy(this, callbacks);
    }
    arg = check.resolve(arg);
    if(error(arg)) return arg;
    data[kind].get(this)[prop] = arg;
    return this;
  };
};

