/**
 * @module lib/fsm
 * @requires lib/utils/iterator
 * @requires lib/utils/descriptor
 */

import * as utilsIterator from "./utils/iterator";
import {default as check, exception} from "./utils/check";

/**
 * @param {?module:lib/fsm~Cfg} cfg
 */
export default function fsm(cfg) {
  return new Fsm(cfg);
}

const checks = {};

/**
 * A function that augments a class.
 *
 * It should not mutate its argument and return a new constructor that
 * implements a compatible interface.
 * @callback Mixin
 * @param {Class} inputClass
 * @return {Class} outputClass
 * @global
 */

// const identity = (x) => x;

// FIXME
// checks.Mixin = check().defaults(identity).instanceOf(Function);
checks.Mixin = check().instanceOf(Function);

/**
 * An object literal that holds data meant to be digested by a constructor.
 * @typedef Descriptor
 * @type mdn:Object
 * @global
 */

/**
 * Mixins to be applied on the inner classes of a finite state machine.
 *
 * Each inner class is replaced by the output of the corresponding mixin.
 * This is used to augment the functionalities before instanciation.
 * Make sure to keep every method defined.
 * @typedef Mixins
 * @property {Mixin} symbols
 * The mixin that will be applied on {@link module:fsm~Fsm~Symbol}.
 * @property {Mixin} states
 * The mixin that will be applied on {@link module:fsm~Fsm~State}.
 * @property {Mixin} transitions
 * The mixin that will be applied on {@link module:fsm~Fsm~Transition}.
 */
checks.FsmMixins = check().object({
  symbols: checks.Mixin,
  states: checks.Mixin,
  transitions: checks.Mixin,
});

/**
 * Descriptors defining the default values for each inner class
 *
 * When passing a descriptor through the `add` method,
 * it checks for every property defined in the respective default
 * descriptor. If the value of such property is missing, it is replaced
 * by the one in the default descriptor.
 * @typedef Defaults
 * @type Descriptor
 * @property {Descriptor} symbols
 * Default descriptor for the symbols.
 * @property {Descriptor} states
 * Default descriptor for the states.
 * @property {Descriptor} transitions
 * Default descriptor for the transitions.
 */
// checks.FsmDefaults = check().object({
//   symbols: checks.descriptor,
//   states: checks.descriptor,
//   transitions: checks.descriptor
// });

/**
 * Descriptor for the data of a finite state machine
 *
 * Each property should hold an array of descriptors that will be passed
 * to the respective `add` method at instanciation.
 * The `from`, `to` and `by` fields of the transitions' descriptors should
 * hold the indexes of the corresponding state or symbol in the other arrays.
 * @typedef FsmDescriptor
 * @type Descriptor
 * @property {Array.<Descriptor>} symbols
 * An array of descriptors used to create the symbols.
 * @property {Array.<Descriptor>} states
 * An array of descriptors used to create the states.
 * @property {Array.<Descriptor>} transitions
 * An array of descriptors used to create the transitions. Beware of the
 * `from`, `to` and `by` properties.
 */
// checks.FsmDescriptor = check().object({
// });
// cfg = check().definition({
//   mixins: check().definition({
//     symbols: checks.mixin,
//     states: checks.mixin,
//     transitions: checks.mixin
//   }),
//   descriptor: check().definition({
//     symbols: check().array((a) => Symbol.add(a)),
//     states: check().array((s) => State.add(s)),
//     transitions: check().array(checks.transitionNum),
//   })
// });


/**
 * A configuration object for a finite state machine
 * @typedef Cfg
 * @type Object
 * @property {Mixins} mixins
 * Used to extend the functionalities of the finite state machine.
 * @property {FsmDescriptor} descriptor - The initial data.
 */
checks.Cfg = check().object({
  mixins: checks.FsmMixins
});

/**
 * @constructor
 * @param {module:lib/fsm~Cfg} cfg={}
 * @protected
 */
function Fsm(cfg) {

  // Data

  // symbols: Map of:
  //   - keys: symbols ; let `a` be the key
  //   - values: objects with:
  //     - transitions: Set of transitions, where `by = a`
  // states: Map of:
  //  - keys: states ; let `k` be the key
  //  - values: objects with:
  //    - initial: boolean
  //    - final: boolean
  //    - pred : Map of: 
  //      - keys: symbols ; let `a` be the key
  //      - values: Set of transitions, where `to = k` and `by = a`
  //    - succ: Map of:
  //      - keys: states ; let `s` be the key
  //      - values: Map of:
  //        - keys: symbols ; let `a` be the key
  //        - values: transition, where `to = s`, `from = k` and `by = a`
  // transitions: Map of:
  //   - keys: transitions
  //   - values: objects with:
  //     - from: state
  //     - to: state
  //     - by: symbol
  
  cfg = checks.Cfg.resolve(cfg);

  const data = {
    symbols: new Map(),
    states: new Map(),
    transitions: new Map()
  };

  data.states.initials = new Set();
  data.states.terminals = new Set();

  const struct = this;

  // API

  /**
   * @class
   * @memberof module:lib/fsm~Fsm
   * @inner
   * @protected
   */
  class Symbol {
    /**
     * The accessor of the finite state machine owning the symbol.
     * @type {module:lib/fsm} 
     * @readonly
     */
    get struct() { return struct; }
    /**
     * Iterates on the symbols owned by the finite state machine.
     * @return {Iterator.<module:lib/fsm~Fsm~Symbol>} an iterator of every symbol
     */
    static all() { return getSymbols(data); }
    /**
     * Creates a symbol, adds it to the finite state machine and returns it.
     *
     * The symbol has the prototype of the calling class.
     * @return {module:lib/fsm~Fsm~Symbol} the newly created symbol
     */
    static add() {
      return addSymbol({}, new AugmentedSymbol(arguments), data);
    }
    /**
     * Removes a symbol and its associated transitions. Chainable.
     *
     * If there is no such symbol, the function silently fails and still
     * returns the accessor.
     * @param {module:lib/fsm~Fsm~Symbol} symbol - symbol to remove
     * @return {module:lib/fsm} the accessor of the finite state machine
     */
    static remove(symbol) {
      symbol = checks.Symbol.remove.resolve(symbol);
      if(exception(symbol)) return symbol;
      removeSymbol(symbol, data);
      return struct;
    }
  };
  
  /**
   * @class
   * @memberof module:lib/fsm~Fsm
   * @inner
   * @protected
   */
  class State {
    /**
     * The accessor of the finite state machine owning the symbol
     * @type {module:lib/fsm} 
     * @readonly
     */
    get struct() { return struct; }
    /**
     * Whether the state is initial
     * @type {boolean} 
     * @readonly
     */
    get initial() { return data.states.get(this).initial; }
    /**
     * Whether the state is terminal
     * @type {boolean} 
     * @readonly
     */
    get terminal() { return data.states.get(this).terminal; }
    /**
     * @return {Iterator.<module:lib/fsm~Fsm~State>} every state
     */
    static all() { return getStates(data); }
    /**
     * @return {Iterator.<module:lib/fsm~Fsm~State>} every initial state
     */
    static initials() { return getInitialStates(data); }
    /**
     * @return {Iterator.<module:lib/fsm~Fsm~State>} every initial state
     */
    static terminals() { return getTerminalStates(data); }
    /**
     * Removes a state and the associated transitions
     * @param {module:lib/fsm~Fsm~State} state - state to remove
     * @return {module:lib/fsm} the finite state machine
     */
    static remove(state) {
      // state = checks.State.remove.resolve(state); TODO
      if(exception(state)) return state;
      removeState(state, data);
      return struct;
    }
    /**
     * Creates and adds a state
     * @param {?Object} descriptor state descriptor
     * @param {?boolean} descriptor.initial false if omitted
     * @param {?boolean} descriptor.terminal false if omitted
     * @return {module:lib/fsm~Fsm~Transition} the newly created state
     */
    static add(descriptor, ...args) {
      // descriptor = checks.State.add.resolve(descriptor); TODO
      descriptor = Object.assign({}, descriptor);
      if(exception(descriptor)) return descriptor;
      return addState(descriptor, new AugmentedState(arguments), data);
    }
  };

  /**
   * @class
   * @memberof module:lib/fsm~Fsm
   * @inner
   * @protected
   */
  class Transition {
    /**
     * The accessor of the finite state machine that owns the transition
     * @type {module:lib/fsm} 
     * @readonly
     */
    get struct() { return struct; }
    /**
     * The source of the transition
     * @type {module:lib/fsm~Fsm~State} 
     * @readonly
     */
    get from() { return data.transitions.get(this).from; }
    /**
     * The target of the transition
     * @type {module:lib/fsm~Fsm~State} 
     * @readonly
     */
    get to() { return data.transitions.get(this).to; }
    /**
     * The symbol of the transition
     * @type {module:lib/fsm~Fsm~State} 
     * @readonly
     */
    get by() { return data.transitions.get(this).by; }
    /**
     * @return {Iterator.<module:lib/fsm~Fsm~Transition>} every transition
     */
    static all() { return getTransitions(data); }
    /**
     * Get a transition
     * @function
     * @param {Object} descriptor
     * @param {!module:lib/fsm~Fsm~State} descriptor.from source
     * @param {!module:lib/fsm~Fsm~State} descriptor.to target
     * @param {!module:lib/fsm~Fsm~Symbol} descriptor.by symbol
     * @return {module:lib/fsm~Fsm~Transition}
     * @throws {TypeError} Will throw if the descriptor is invalid
     */
    static get(descriptor) {
      // descriptor = checks.Transition.get.resolve(descriptor); TODO
      descriptor = Object.assign({}, descriptor);
      if(exception(descriptor)) return descriptor;
      return getTransition(descriptor.from, descriptor.to, descriptor.by, data);
    }
    /**
     * Creates and adds a transition
     *
     * If an equivalent transition already exists, the function returns it
     * (thus failing silently)
     * @param {Object} descriptor
     * @param {!module:lib/fsm~Fsm~State} descriptor.from source
     * @param {!module:lib/fsm~Fsm~State} descriptor.to target
     * @param {!module:lib/fsm~Fsm~Symbol} descriptor.by symbol
     * @return {module:lib/fsm~Fsm~Transition} the newly created transition
     */
    static add(descriptor) {
      // descriptor = checks.Transition.add.resolve(descriptor); TODO
      descriptor = Object.assign({}, descriptor);
      if(exception(descriptor)) return descriptor;
      return addTransition(descriptor, new AugmentedTransition(arguments), data);
    }
    /**
     * Removes a transition
     * @param {module:lib/fsm~Fsm~Transition} transition - transition to remove
     * @return {module:lib/fsm} the finite state machine
     */
    static remove(transition) {
      // transition = checks.Transition.remove.resolve(transition); TODO
      if(exception(transition)) return transition;
      removeTransition(transition);
      return struct;
    }
    /**
     * Creates an iterator of transitions that match the selector attributes
     * @param {Object} selector
     * @param {?module:lib/fsm~Fsm~State} selector.from source
     * @param {?module:lib/fsm~Fsm~State} selector.to target
     * @param {?module:lib/fsm~Fsm~Symbol} selector.by symbol
     * @return {Iterator.<module:lib/fsm~Fsm~Transition>} the selected transitions
     */
    static select(selector) {
      // selector = checks.Transition.select.resolve(selector); TODO
      selector = Object.assign({}, selector);
      if(exception(selector)) return selector;
      let args = [];
      let getter = getTransitions;
      if(selector.from != null) {
        getter = getter.from;
        args.push(selector.from);
      }
      if(selector.to != null) {
        getter = getter.to;
        args.push(selector.to);
      }
      if(selector.by != null) {
        getter = getter.by;
        args.push(selector.by);
      }
      args.push(data);
      return getter.apply(null, args);
    }

    /**
     * Creates nested iterators
     * The transitions are first split by their source state, then their target
     * states
     * @return {Iterator.<Iterator.<Iterator.<module:lib/fsm~Fsm~Transition>>>} the collection
     */
    static groups() { return getTransitions.groups(data); }
  };
  
  const AugmentedSymbol = cfg.mixins.symbols(Symbol);
  const AugmentedState = cfg.mixins.states(State);
  const AugmentedTransition = cfg.mixins.transitions(Transition);

  /**
   * @type {Class}
   */
  this.symbols = AugmentedSymbol;
  /**
   * @type {Class}
   */
  this.states = AugmentedState;
  /**
   * @type {Class}
   */
  this.transitions = AugmentedTransition;
};

// Logic

// Conventions:
//   - `a` is a symbol ; `as` is a collection of symbols
//   - `s` is a state ; `ss` is a collection of states
//   - `t` is a transition ; `ts` is a collection of transitions
//   - `sf` is a source state (state from)
//   - `st` is a target state (state to)

const addSymbol = (o, symbol, data) => {
  o.tran = new Set();
  data.symbols.set(symbol, o);
  return symbol;
};

const addState = (o, state, data) => {
  o.succ = new Map();
  o.pred = new Map();
  data.states.set(state, o);
  if(o.initial) {
    data.states.initials.add(state);
  }
  if(o.terminal) {
    data.states.terminals.add(state);
  }
  return state;
};

const addTransition = (o, transition, data) => {
  const succ = data.states.get(o.from).succ;
  let as = succ.get(o.to);
  if(as == null) {
    as = new Map();
    succ.set(o.to, as);
  }
  let t = as.get(o.by);
  // TODO transition already exists
  if(t == null) {
    t = transition;
    as.set(o.by, t);
    const pred = data.states.get(o.to).pred;
    let ts = pred.get(o.by);
    if(ts == null) {
      ts = new Set();
      pred.set(o.by, ts);
    }
    ts.add(t);
    data.symbols.get(o.by).tran.add(t);
    data.transitions.set(t, o);
  };
  return t;
};

const getTransition = (sf, st, a, data) => {
  let as = data.states.get(sf).succ.get(st);
  if(as == null) return null;
  return as.get(a);
};

const getSymbols = (data) => data.symbols.keys();

const getStates = (data) => data.states.keys();

const getInitialStates = (data) => data.states.initials.values();

const getTerminalStates = (data) => data.states.terminals.values();

const getTransitions = (data) => data.transitions.keys();

getTransitions.groups = () => utilsIterator.apply(
  data.states.entries(),
  ([sf, map1]) => {
    const iter = utilsIterator.apply(
      map1.entries(),
      ([st, map2]) => {
        const subiter = map2.values();
        subiter.to = st;
        return subiter;
      }
    );
    iter.from = sf;
    return iter;
  }
);

getTransitions.from = (sf) => utilsIterator.flatten(
  data.states.get(sf).succ.values(),
  (map) => map.values()
);

getTransitions.to = (st) => states.get(st).pred.values();

getTransitions.by = (a) => symbols.get(a).transitions.values();

getTransitions.from.to = (sf, st) => states.get(sf).succ.get(st).values();

getTransitions.to.by = (st, a) => states.get(st).pred.get(a).values();

getTransitions.from.by = (sf, a) => utilsIterator.flatten(
  states.get(sf).succ.values(),
  (map) => {
    let t = map.get(a);
    if(t == null) {
      return utilsIterator.empty();
    }
    return utilsIterator.wrap(t);
  }
);

getTransitions.from.to.by = (sf, st, a, data) => {
  const t = getTransition(sf, st, a, data);
  if(t == null) {
    return utilsIterator.empty();
  }
  return utilsIterator.wrap(t);
};

const removeSymbol = (a, data) => {
  for(let t of getTransitions.by(a)) {
    const o = data.transitions.get(t);
    data.states.get(o.from).succ.get(o.from).delete(a);
    data.states.get(o.to).pred.delete(a);
    data.transitions.delete(t);
  }
  data.symbols.delete(a);
};

const removeState = (s, data) => {
  for(let t of getTransitions.to(s)) {
    const o = data.transitions.get(t);
    data.states.get(o.to).succ.delete(s);
    data.symbols.get(o.by).transitions.delete(t);
    data.transitions.delete(t);
  }
  for(let t of getTransitions.from(s)) {
    const o = data.transitions.get(t);
    data.states.get(o.from).pred.get(o.by).delete(t);
    data.symbols.get(o.by).transitions.delete(t);
    data.transitions.delete(t);
  }
  if(s.initial) {
    data.states.initials.delete(s);
  }
  if(s.terminal) {
    data.states.terminals.delete(s);
  }
  data.states.delete(s);
};

const removeTransition = (t, data) => {
  const o = data.transitions.get(t);
  if(o != null) {
    data.states.get(o.from).succ.get(o.to).delete(o.by);
    data.states.get(o.to).pred.get(o.by).delete(t);
    data.symbols.get(o.by).transitions.delete(t);
    data.transitions.delete(t);
  }
};
