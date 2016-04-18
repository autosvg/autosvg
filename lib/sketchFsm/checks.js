import check from "../utils/check";

export const error = {};

error.fsmType = check.error.register(
  "WrongFsmType",
  function(type) {
    this.type = type;
    this.message = `WrongFsmType: \
      ${type} is not a valid finite state machine type`;
  }
);

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

export const defaults = check().object({
  symbols: defaultSymbol,
  states: defaultState,
  transitions: defaultTransition
});

// TODO
export const descriptor = check().object({
  symbols: check().iterable(),
  states: check().iterable(),
  transitions: check().iterable()
});

export const cfg = check().object({
  type: fsmType,
  color: color.opt,
  "background-color": color.opt,
  bold: bool.opt,
  italic: bool.opt,
  defaults: defaults,
  descriptor: descriptor
});
