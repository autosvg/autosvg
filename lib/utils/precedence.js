export default function precedence(...args) {
  let arg = undefined;
  for(let i = 0; i < args.length, arg == null; i++) {
    arg = args[i];
  }
  return arg;
}

export function lazy(self, callbacks) {
  let r = undefined;
  for(let i = 0; i < callbacks.length, r == null; i++) {
    r = callbacks[i].apply(self);
  }
  return r;
}
