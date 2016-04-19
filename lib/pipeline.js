import {default as check, exception} from "../utils/check";

exception.existingId = exception.register("ExistingId");
exception.unknownId = exception.register("UnkownId");
exception.fsmType = exception.register(
  "WrongFsmType",
  function(type) {
    this.type = type;
    this.message = `WrongFsmType: \
      ${type} is not a valid finite state machine type`;
  }
);

const symbolsIds = new Map();
const statesIds = new Map();
// let symbolIndex = 0;
// let stateIndex = 0;

const steps = { };

function pipeline() {
  let p = check().object();
  p.cleanup = cleanup;
  p.resolve = resolve;
  p.deepCompose(steps.config)
  .deepCompose(steps.redundancy)
  .deepCompose(steps.inference);
  return p;
}

function resolve(...args) {
  const result = this.constructor.prototype.resolve.apply(this, args);
  this.cleanup();
  return result;
};

function cleanup() {
  symbolIds.clear();
  statesIds.clear();
  symbolIndex = 0;
  stateIndex = 0;
};

const pipeline = check().object();

pipeline
.deepCompose(steps.config)
.deepCompose(steps.redundancy)
.deepCompose(steps.inference);

steps.config = check().object({
  type: fsmType,
  color: color.opt,
  bold: bool.opt,
  italic: bool.opt,
  defaults: check().object({
    symbols: check().object().deepCompose(defaultSymbol),
    states: check().object().deepCompose(defaultState),
    transitions: check().object().deepCompose(defaultState)
  }),
  data: check().object({}, true, ["symbols", "states", "transitions"])
});

steps.redundancy = check.object({
  data: check.object({
    symbols: check().iterable(check().object({
      id: check().add((id, a) => {
        if(symbolsIds.has(id)) {
          return exception.create(exception.existingId, id, "symbol");
        }
        symbolsIds.set(id, a);
        return id;
      })
    })),
    states: check().iterable(check().object({
      id: check().add((id, s) => {
        if(statesIds.has(id)) {
          return exception.create(exception.existingId, id, "state");
        }
        statesIds.set(id, s);
        return id;
      })
    }))
  })
});

steps.inference = check().object({
  data: check.object({
    transitions: check().iterable(check().object({
      from: check().add((from) => {
        if(!statesIds.has(from)) {
          statesIds.set(from, {id: from});
        }
        return from;
      }),
      to: check().add((to) => {
        if(!statesIds.has(to)) {
          statesIds.set(to, {id: to});
        }
        return to;
      }),
      by: check().add((by) => {
        if(!symbolsIds.has(by)) {
          symbolsIds.set(by, {id: by});
        }
        return by;
      })
    }))
  })
});

steps.strictness = check().object({
  data: check.object({
    transitions: check().iterable(check().object({
      from: check().add((from) => {
        if(!statesIds.has(from)) {
          return exception.create(exception.unknownId, from, "state");
        }
        return from;
      }),
      to: check().add((to) => {
        if(!statesIds.has(to)) {
          return exception.create(exception.unknownId, to, "state");
        }
        return to;
      }),
      by: check().add((by) => {
        if(!symbolsIds.has(by)) {
          return exception.create(exception.unknownId, to, "symbols");
        }
        return by;
      })
    }))
  })
});

export const color = check(); // TODO
color.opt = check().optional().compose(color);
export const bool = check().ofType("boolean");
bool.opt = check().optional().compose(bool);
export const integer = check(); // TODO
integer.opt = check().optional().compose(integer);

export const fsmType = check().defaults("finite-state-machine");

export const defaultSymbol = check().object({
  color: color.opt,
  bold: bool.opt,
  italic: bool.opt
});

export const defaultState = check().object({
  color: color.opt,
  "border-color": color.opt,
  "text-color": color.opt,
  "background-color": color.opt,
  bold: bool.opt,
  italic: bool.opt,
  width: integer.opt, 
  height: integer.opt
});

export const defaultTransition = check().object({
  "text-color": color.opt,
  bold: bool.opt,
  italic: bool.opt
});
