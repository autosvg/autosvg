import {default as check, exception} from "./utils/check";
import sketchFsm from "./sketchFsm";
import parser from "./parser";

const steps = { };

export default function pipeline(aml) {
  const l = parser.parse(aml);
  log.warn(l);
  if(exception(l)) { return l; }
  const desc = makePipeline()
  .deepCompose(steps.config)
  .deepCompose(steps.redundancy)
  .deepCompose(steps.inference)
  .compose(steps.gather)
  .deepCompose(steps.indexes)
  .resolve(l);
  log.warn(desc);
  if(exception(desc)) { return desc; }
  return sketchFsm(desc);
}

function makePipeline() {
  const p = check().object();
  p.resolve = resolve;
  return p;
}

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
const symbolsIndexes = new Map();
const statesIndexes = new Map();
let symbolIndex = 0;
let stateIndex = 0;

function cleanup() {
  symbolsIds.clear();
  statesIds.clear();
  symbolsIndexes.clear();
  statesIndexes.clear();
  symbolIndex = 0;
  stateIndex = 0;
};

function resolve(...args) {
  const result = this.constructor.prototype.resolve.apply(this, args);
  cleanup();
  return result;
};

const color = check().ofType("string"); // TODO
color.opt = check().optional().compose(color);
const bool = check().ofType("boolean");
bool.opt = check().optional().compose(bool);
const integer = check().ofType("number"); // TODO
integer.opt = check().optional().compose(integer);

const fsmType = check().defaults("finite-state-machine");

const tagsSymbol = check().object({
  color: color.opt,
  bold: bool.opt,
  italic: bool.opt
});

const tagsState = check().object({
  color: color.opt,
  "border-color": color.opt,
  "text-color": color.opt,
  "background-color": color.opt,
  bold: bool.opt,
  italic: bool.opt,
  width: integer.opt, 
  height: integer.opt
});

const tagsTransition = check().object({
  "text-color": color.opt,
  bold: bool.opt,
  italic: bool.opt
});

steps.gather = check().object({
  data: check().object({
    symbols: check().add(() => symbolsIds.values()),
    states: check().add(() => statesIds.values())
  })
}, true, ["symbols", "states", "transitions"]);

steps.indexes = check().object({
  data: check().object({
    symbols: check().iterable(check().add((a) => {
      symbolsIndexes.set(a.id, symbolIndex++);
      if(a.label === undefined) { a.label = a.id; }
      delete a.id;
      return a;
    })),
    states: check().iterable(check().add((s) => {
      statesIndexes.set(s.id, stateIndex++);
      if(s.label === undefined) { s.label = s.id; }
      delete s.id;
      return s;
    })),
    transitions: check().iterable(check().add((t) => {
      t.from = statesIndexes.get(t.from);
      t.to = statesIndexes.get(t.to);
      t.by = symbolsIndexes.get(t.by);
      return t;
    }))
  }) 
});

steps.config = check().object({
  type: fsmType,
  color: color.opt,
  bold: bool.opt,
  italic: bool.opt,
  defaults: check().object({
    symbols: check().object({}, true).deepCompose(tagsSymbol),
    states: check().object({}, true).deepCompose(tagsState),
    transitions: check().object({}, true).deepCompose(tagsTransition)
  }, true),
  data: check().object({}, true, ["symbols", "states", "transitions"])
}, true);

steps.redundancy = check().object({
  data: check().object({
    symbols: check().iterable(check().object({
      id: check().add((id, a) => {
        if(symbolsIds.has(id)) {
          log.warn(symbolsIds);
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
  data: check().object({
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
  data: check().object({
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
          return exception.create(exception.unknownId, by, "symbols");
        }
        return by;
      })
    }))
  })
});

export const checks = {
  color,
  bool,
  integer
};
