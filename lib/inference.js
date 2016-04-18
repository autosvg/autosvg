import {default as check, exception} from "./utils/check";

exception.existingId = exception.register("ExistingId");

const symbolsIds = new Map();
const statesIds = new Map();

const checks = {
  symbols: check().iterable(check().add((a) => {
    if(symbolsIds.has(a.id)) {
      return exception.create(exception.existingId, a.id, "symbol");
    }
    symbolsIds.set(a.id, a);
    return a;
  })),
  states: check().iterable(check().add((s) => {
    if(statesIds.has(s.id)) {
      return exception.create(exception.existingId, s.id, "state");
    }
    statesIds.set(s.id, s);
    return s;
  })),
  transitions: check().iterable(check().add((t) => {
    if(!statesIds.has(t.from)) {
      statesIds.set(t.from, {id: t.from});
    }
    if(!statesIds.has(t.to)) {
      statesIds.set(t.to, {id: t.to});
    }
    if(!symbolsIds.has(t.by)) {
      statesIds.set(t.by, {id: t.by});
    }
    return t;
  }))
};

export default function inference(descriptor) {
  let symbols = checks.symbols.resolve(descriptor.symbols);
  let states = checks.states.resolve(descriptor.states);
  let transitions = checks.transitions.resolve(descriptor.transitions);
  const properties = [symbols, states, transitions];
  if(properties.some(exception)) {
    const names = ["symbols", "states", "transitions"];
    const output = {};
    const exceptions = {};
    for(let i = 0; i < 3; i++) {
      if(exception(properties[i])) {
        exceptions[names[i]] = properties[i];
      } else {
        output[names[i]] = properties[i];
      }
    }
    descriptor = exception(exception.objet, descriptor, null, exceptions, output);
  } else {
    descriptor = {
      symbols: Array.from(symbolsIds.values()),
      states: Array.from(statesIds.values()),
      transitions
    };
  }
  symbolsIds.clear();
  statesIds.clear();
  return descriptor;
};
