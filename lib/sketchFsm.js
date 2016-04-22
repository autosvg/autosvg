import {default as check, exception} from "./utils/check";
import fsm from "./fsm";
import { checks } from "./pipeline";
import dagre from "dagre";
import {lazy as lazyPrecedence} from "./utils/precedence";

export default function sketchFsm(cfg) {
  return new Fsm(cfg);
}

function Fsm(cfg) {

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
      return exception(exception.existingLabel);
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
          color: checks.color.opt,
          bold: checks.bool.opt,
          bold: checks.bool.opt
        }).resolve(descriptor);
        if(exception(descriptor)) { return descriptor; }
        const symbol = super.add();
        if(exception(symbol)) { return symbol; }
        data.symbols.set(symbol, descriptor);
        return symbol;
      }
    }
    addAccessors(Symbol.prototype, "symbols", data, {
      color: { check: checks.color },
      bold: { check: checks.bool, default: false },
      italic: { check: checks.bool, default: false }
    });
    return Symbol;
  };

  checks.stateLabel = check().mandatory().ofType("string").add((l) => {
    if(data.states.labels.has(l)) {
      return exception(exception.existingLabel);
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
        const state = FsmState.add({
          initial: descriptor.initial,
          terminal: descriptor.terminal
        });
        if(exception(state)) { return state; }
        data.states.set(state, descriptor);
        // TODO cleanup
        const id = randomId(data);
        data.states.get(state).id = id;
        return state;
      }
    }
    addAccessors(State.prototype, "states", data, {
      label: { check: checks.string, precedence: [ ], default: "" },
      x: { check: checks.integer, precedence: [
        function() { return data.states.get(this).x; },
        function() { return data.states.get(this).computedX; },
        () => 0
      ], default: 0 },
      y: { check: checks.integer, precedence: [
        function() { return data.states.get(this).y; },
        function() { return data.states.get(this).computedY; },
        () => 0
      ], default: 0 },
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
        const transition = super.add({
          from: descriptor.from,
          to: descriptor.to,
          by: descriptor.by
        });
        if(exception(transition)) { return transition; }
        data.transitions.set(transition, descriptor);
        // TODO cleanup - add edge
        let fromDesc, sameFrom, edge;
        fromDesc = data.states.get(transition.from);
        sameFrom = fromDesc.edges;
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
            transitions: new Set([transition])
          });
        } else {
          data.edges.get(edge).transitions.add(transition);
        }
        return transition;
      }
    }
    addAccessors(Transition.prototype, "transitions", data, {
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
    get points() {
      return data.edges.get(this).points;
    }
    static all() {
      return data.edges.keys();
    }
  }
  addAccessors(Edge.prototype, "edges", data, {
    height: { check: checks.integer, precedence: [ /*TODO*/ () => 60 ]},
    width: { check: checks.integer, precedence: [ /*TODO*/ () => 60 ]},
    x: { check: checks.integer, precedence: [
      function() { return data.edges.get(this).x; },
      function() { return data.edges.get(this).computedX; },
      () => 0
    ], default: 0 },
    y: { check: checks.integer, precedence: [
      function() { return data.edges.get(this).y; },
      function() { return data.edges.get(this).computedY; },
      () => 0
    ], default: 0 },
  });

  function computeLayout() {
    let graph = new dagre.graphlib.Graph({
      directed: true
    }).setGraph({
      rankdir: "LR"
    });
    for(let s of data.fsm.states.all()) {
      graph.setNode(data.states.get(s).id, {
        width: s.width(),
        height: s.height(),
        label: s.label(),
        state: s
      });
    }
    for(let e of Edge.all()) {
      const edgeData = data.edges.get(e);
      graph.setEdge(
        data.states.get(edgeData.from).id,
        data.states.get(edgeData.to).id, {
          width: e.width(),
          height: e.height(),
          label: e.label,
          edge: e
        }
      );
    }
    dagre.layout(graph);
    for(let n of graph.nodes()) {
      n = graph.node(n);
      log.debug(n);
      const stateData = data.states.get(n.state);
      stateData.computedX = n.x;
      stateData.computedY = n.y;
    }
    for(let e of graph.edges()) {
      e = graph.edge(e.v, e.w);
      const edgeData = data.edges.get(e.edge);
      edgeData.points = e.points.slice();
      edgeData.computedX = e.x;
      edgeData.computedY = e.y;
    }
    this.graph = graph;
    return this;
  };

  data.fsm = fsm({
    mixins: {
      symbols: symbolsMixin,
      states: statesMixin,
      transitions: transitionsMixin
    }
  });

  this.symbols = data.fsm.symbols;
  this.states = data.fsm.states;
  this.transitions = data.fsm.transitions;
  this.edges = Edge;
  this.layout = computeLayout;
  
  const importError = fromTree(cfg.data, this);

  if(exception(importError)) {
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
};

const fromTree = (descriptor, struct) => {
  const errors = {};
  const labels = new Set();
  let hasErrors = false;

  let symbols = check().iterable(check().add((a) => {
    const symbol = struct.symbols.add(a);
    if(!exception(symbol)) {
      labels.add(symbol.label);
    }
    return symbol;
  })).resolve(descriptor.symbols);

  if(exception(symbols)) {
    const dummyDescriptor = {};
    errors.symbols = symbols;
    symbols = symbols.output;
    for(let i = 0, dummySymbol; i < symbols.length; i++) {
      if(symbols[i] === undefined) {
        do {
          dummyDescriptor.label = randomHash();
        } while(labels.has(dummyDescriptor.label));
        // TODO bypass it
        dummySymbol = struct.symbols.add(dummyDescriptor);
        // Assuming this doesn't fail
        if(exception(dummySymbol)) { throw dummySymbol; }
        symbols[i] = dummySymbol;
      }
    }
    hasErrors = true;
  }

  let states = check()
  .iterable(check().add((s) => {
    return struct.states.add(s);
  }))
  .resolve(descriptor.states);

  if(exception(states)) {
    const dummyDescriptor = {};
    errors.states = states;
    states = states.output;
    for(let i = 0, dummyState; i < states.length; i++) {
      // TODO bypass it
      dummyState = struct.states.add(dummyDescriptor);
      // Assuming this doesn't fail
      if(exception(dummyState)) { throw dummyState; }
      states[i] = dummyState;
    }
    hasErrors = true;
  }

  let transitions = check().iterable(check().add((t) => {
    const d = Object.assign({}, t);
    d.from = states[t.from];
    d.to = states[t.to];
    d.by = symbols[t.by];
    return struct.transitions.add(d);
  })).resolve(descriptor.transitions);

  if(exception(transitions)) {
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
      return lazyPrecedence(this, callbacks);
    }
    arg = check.resolve(arg);
    if(exception(arg)) return arg;
    data[kind].get(this)[prop] = arg;
    return this;
  };
};

