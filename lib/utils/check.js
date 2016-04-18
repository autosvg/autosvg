/**
 * @module lib/utils/descriptor
 * @requires lib/utils/exception
 */

import exception from "./exception";

/**
 * Creates a new check builder
 */
function check() {
  return new Check();
}

export { check as default, exception };

const queueAccessor = Symbol("queue property name");

const identityBypass = (x) => x;
identityBypass.bypass = true;

const emptyArrayDescriptor = () => {
  emptyArrayDescriptor.d.value = [];
  return emptyArrayDescriptor.d;
};

emptyArrayDescriptor.d = {
  enumerable: false,
  writable: false,
  configurable: false
};

class Check {
  constructor() {
    Object.defineProperty(this, queueAccessor, emptyArrayDescriptor());
  }
  /**
   * @return {Any|CheckError<notMember>}
   */
  inMap(map) {
    const inMap = (value) => {
      if(map.has(value)) {
        return value;
      }
      return exception.create(exception.notMember, value, map);
    };
    this[queueAccessor].push(inMap);
    return this;
  };

  /**
   * @return {Any|CheckError<notMember>}
   */
  inSet(map) {
    const inSet = (value) => {
      if(map.has(value)) {
        return value;
      }
      return exception.create(exception.notMember, value, map);
    };
    this[queueAccessor].push(inSet);
    return this;
  };
  /**
   * @return {Any|CheckError<notMember>}
   */
  inArray(array) {
    const inArray = (value) => {
      if(array.includes(value)) {
        return value;
      }
      return exception.create(exception.notMember, value, array);
    };
    this[queueAccessor].push(inArray);
    return this;
  };

  /**
   * @return {Any|CheckError<wrongType>}
   */
  ofType(type) {
    const ofType = (value) => {
      if(typeof value === type) {
        return value;
      }
      return exception.create(exception.wrongType, value, type);
    };
    this[queueAccessor].push(ofType);
    return this;
  };

  /**
   * @return {Any|CheckError<wrongClass>}
   */
  instanceOf(constructor) {
    const instanceOf = (value) => {
      if(value instanceof constructor) {
        return value;
      }
      return exception.create(exception.wrongClass, value, constructor);
    };
    this[queueAccessor].push(instanceOf);
    return this;
  };

  /**
   * @return {Any|CheckError<array>|CheckError<notIterable>}
   */
  iterable(checker) {
    const iterable = (value) => {
      const exceptions = [];
      const output = [];
      if(value[Symbol.iterator] == null) {
        return exception.create(exception.wrongType, value, "iterable");
      }
      if(checker === undefined) {
        return value;
      }
      let i = 0;
      for(let v of value) {
        const c = checker.resolve(v);
        if(exception(c)) {
          exceptions[i] = c;
        } else {
          output[i] = c;
        }
        i++;
      }
      if(exceptions.length > 0) {
        exceptions.length = i;
        output.length = i;
        return exception.create(exception.array, value, check, exceptions, output);
      }
      return output;
    };
    this[queueAccessor].push(iterable);
    return this;
  };

  /**
   * @return {Any|CheckError<object>}
   */
  object(definition={}, fireUnknown=false) {
    const object = (value) => {
      value = value || {};
      const output = {};
      const exceptions = {};
      let c;
      for(let prop of Object.keys(definition)) {
        if(definition[prop] === undefined) {
          continue;
        }
        c = definition[prop].resolve(value[prop]);
        if(exception(c)) {
          exceptions[prop] = c;
        } else {
          output[prop] = c;
        }
      }
      if(fireUnknown) {
        for(let prop of Object.keys(value)) {
          if(!definition.hasOwnProperty(prop)) {
            exceptions[prop] = exception.create(exception.unknownProp, value, definition, prop);
          }
        }
      }
      if(Object.keys(exceptions).length > 0) {
        return exception.create(exception.object, value, definition, exceptions, output);
      }
      return output;
    };
    this[queueAccessor].push(object);
    return this;
  };

  /**
   * @return {Any|CheckError<missingValue>}
   */
  mandatory() {
    const mandatory = (value) => {
      if(value == null) {
        return exception.create(exception.missingValue, value);
      }
      return value;
    };
    this[queueAccessor].push(mandatory);
    return this;
  };


  compose(check) {
    const queue = this[queueAccessor];
    for(let f of check[queueAccessor]) {
      queue.push(f);
    }
    return this;
  };

  add(f) {
    this[queueAccessor].push(f);
    return this;
  };

  optional() {
    this[queueAccessor].push(identityBypass);
    return this;
  };

  defaults(defaultValue) {
    const f = () => {
      return defaultValue;
    };
    f.bypass = true;
    this[queueAccessor].push(f);
    return this;
  };

  resolve(value) {
    for(let f of this[queueAccessor]) {
      if(exception(value)) {
        return value;
      }
      if(f.bypass && value == null) {
        log.error(value);
        return f.call(undefined, value);
      }
      value = f.call(undefined, value);
    }
    return value;
  };

  hold() {
    return this.resolve.bind(this);
  };
}
