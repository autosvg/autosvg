import {default as check, exception} from "./utils/check";
import fsm from "./fsm";
import { checks } from "./pipeline";
import dagre from "dagre";
import precedence, {lazy as lazyPrecedence} from "./utils/precedence";

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

  data.symbols.ids = new Map();
  data.states.ids = new Map();

  checks.label = check().optional().ofType("string");

  checks.symbolId = check().mandatory().ofType("string").add((id) => {
    return data.symbols.ids.has(id) ? exception.create(exception.existingId) : id;
  });

  const symbolsMixin = (FsmSymbol) => {
    class Symbol extends FsmSymbol {
      get id() { return data.symbols.get(this).id; }
      get label() {
        const symData = data.symbols.get(this);
        return symData.label != null ? symData.label : symData.id;
      }
      get description() {
        const a = data.symbols.get(this);
        const d = {};
        for(let prop of [ "id", "label", "color", "bold", "italic" ]) {
          d[prop] = a[prop];
        }
        return d;
      }
      static add(descriptor) {
        descriptor = check().object({
          id: checks.symbolId,
          label: checks.label,
          color: checks.color.opt,
          bold: checks.bool.opt,
          italic: checks.bool.opt
        }).resolve(descriptor);
        if(exception(descriptor)) { return descriptor; }
        const symbol = super.add();
        if(exception(symbol)) { return symbol; }
        data.symbols.set(symbol, descriptor);
        data.symbols.ids.set(descriptor.id, symbol);
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

  checks.stateId = check().mandatory().ofType("string").add((id) => {
    return data.states.ids.has(id) ? exception.create(exception.existingId) : id;
  });

  const statesMixin = (FsmState) => {
    class State extends FsmState {
      get id() { return data.states.get(this).id; }
      get label() {
        const stateData = data.states.get(this);
        return stateData.label != null ? stateData.label : stateData.id;
      }
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
        data.states.ids.set(descriptor.id, state);
        return state;
      }
    }
    addAccessors(State.prototype, "states", data, {
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
    get symbols() {
      return Array.from(
        data.edges.get(this).transitions,
        (t) => t.by);
    }
    get from() {
      return data.edges.get(this).from;
    }
    get to() {
      return data.edges.get(this).to;
    }
    get points() {
      const edgeData = data.edges.get(this);
      const points = copyPoints(precedence(
        edgeData.controls,
        edgeData.computedControls,
        []));
      points.splice(0, 0, {x: edgeData.from.x(), y: edgeData.from.y()});
      points.splice(points.length, 0, {x: edgeData.to.x(), y: edgeData.to.y()});
      return points;
    }
    static all() {
      return data.edges.keys();
    }
  }
  addAccessors(Edge.prototype, "edges", data, {
    controls: { check: check().iterable() /*TODO*/, precedence: [
      function() { return data.edges.get(this).controls; },
      function() { return copyPoints(data.edges.get(this).computedControls); }
    ]},
    height: { check: checks.integer, precedence: [], default: 0},
    width: { check: checks.integer, precedence: [], default: 0},
    x: { check: checks.integer, precedence: [
      function() { return data.edges.get(this).x; },
      function() { return data.edges.get(this).computedX; }
    ], default: 0 },
    y: { check: checks.integer, precedence: [
      function() { return data.edges.get(this).y; },
      function() { return data.edges.get(this).computedY; }
    ], default: 0 },
    label: { check: check().iterable(), precedence: [
      function() { return data.edges.get(this).label; },
      function() {
        return Array.from(
          data.edges.get(this).transitions,
          (t) => t.by.label)
          .join(", ");
      }
    ]}
  });

  function computeLayout() {
    let graph = new dagre.graphlib.Graph({
      directed: true
    }).setGraph({
      marginx: 30,
      marginy: 30,
      nodesep: 30,
      ranksep: 30,
      edgesep: 20,
      rankdir: "LR"
    });

    function addState(s) {
      graph.setNode(s.id, {
        width: s.width(),
        height: s.height(),
        label: s.label,
        state: s
      });
    }

    function addEdge(e) {
      graph.setEdge(e.from.id, e.to.id, {
        width: e.width(),
        height: e.height(),
        label: e.label,
        labelpos: "c",
        edge: e
      });
    }

    for(let s of data.fsm.states.initials()) {
      addState(s);
    }
    for(let s of data.fsm.states.all()) {
      if(!s.initial) { addState(s); }
    }
    for(let e of Edge.all()) {
      addEdge(e);
    }
    dagre.layout(graph);
    for(let n of graph.nodes()) {
      n = graph.node(n);
      const stateData = data.states.get(n.state);
      stateData.computedX = n.x;
      stateData.computedY = n.y;
    }
    for(let e of graph.edges()) {
      e = graph.edge(e.v, e.w);
      const edgeData = data.edges.get(e.edge);
      const points = copyPoints(e.points);
      const labelPos = points[(points.length - 1) / 2];
      edgeData.computedX = labelPos.x;
      edgeData.computedY = labelPos.y;
      points.splice(0, 1);
      points.splice(points.length - 1, 1);
      edgeData.computedControls = points;
    }
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

  const importError = fromTree(cfg.data, this, data);

  if(exception(importError)) {
    return importError;
  }

  log.debug(data);
}

const randomHash = () => Math.random().toString(36).substring(2);

const randomId = (ids) => {
  let id;
  do {
    id = randomHash();
  } while(ids.has(id));
  return id;
};

const fromTree = (descriptor, struct, data) => {
  const errors = {};
  let hasErrors = false;

  let symbols = check()
  .iterable(check().add((a) => {
    return struct.symbols.add(a);
  })).resolve(descriptor.symbols);

  let states = check()
  .iterable(check().add((s) => {
    return struct.states.add(s);
  }))
  .resolve(descriptor.states);

  const dummyDescriptor = {};

  if(exception(symbols)) {
    errors.symbols = symbols;
    symbols = symbols.output;
    for(let i = 0, dummySymbol; i < symbols.length; i++) {
      if(symbols[i] === undefined) {
        dummyDescriptor.id = randomId(data.symbols.ids);
        // TODO bypass it
        dummySymbol = struct.symbols.add(dummyDescriptor);
        // Assuming this doesn't fail
        if(exception(dummySymbol)) { throw dummySymbol; }
        symbols[i] = dummySymbol;
      }
    }
    hasErrors = true;
  }

  if(exception(states)) {
    errors.states = states;
    states = states.output;
    for(let i = 0, dummyState; i < states.length; i++) {
      if(states[i] === undefined) {
        // TODO bypass it
        dummyDescriptor.id = randomId(data.states.ids);
        dummyState = struct.states.add(dummyDescriptor);
        // Assuming this doesn't fail
        if(exception(dummyState)) { throw dummyState; }
        states[i] = dummyState;
      }
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

const copyPoints = (points) => {
  if(points == null) { return points; }
  return points.map((p) => Object.assign({}, p));
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

