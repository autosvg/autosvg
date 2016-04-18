/**
 * @module lib/utils/iterator
 */

/**
 * Transforms an iterable of iterables into a flat iterable
 */
export function flatten(iterable, accessIterable) {
  const iterator = iterable[Symbol.iterator]();
  let oldNext = iterator.next.bind(iterator);
  let c;
  let subIterator;
  let subc = {done: true};
  iterator.next = () => {
    while(subc.done) {
      c = oldNext();
      if(c.done) {
        return c;
      }
      subIterator = accessIterable(c.value)[Symbol.iterator];
      subc = subIterator.next();
    }
    return subc;
  };
  iterator[Symbol.iterator] = () => iterator;
  return iterator; 
};

/**
 * Creates an empty iterator
 */
export function empty() {
  const iterator = {
    next: () => ({done: true})
  };
  iterator[Symbol.iterator] = () => iterator;
  return iterator;
};

/**
 * Wraps a variable in an iterator
 */
export function wrap(value) {
  let seen = false;
  const iterator = {
    next: () => {
      if(seen) {
        return {done: true};
      } 
      seen = true;
      return {value};
    }
  };
  iterator[Symbol.iterator] = () => iterator;
  return iterator;
};

/**
 * Apply a function on a value when accessing it
 */
export function hijack(iterable, callback) {
  const iterator = iterable[Symbol.iterator]();
  const oldNext = iterator.next.bind(iterator);
  iterator.next = () => {
    const c = oldNext();
    if(!c.done) {
      c.value = callback(c.value);
    }
    return n;
  };
  iterator[Symbol.iterator] = () => iterator;
  return newIterator;
};
