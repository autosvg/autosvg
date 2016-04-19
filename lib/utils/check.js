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

  optional() {
    this[queueAccessor].push(identityBypass);
    return this;
  };

  defaults(defaultValue) {
    const checkDefaults = () => {
      return defaultValue;
    };
    checkDefaults.bypass = true;
    this[queueAccessor].push(checkDefaults);
    return this;
  };
  /**
   * @return {Any|CheckError<notMember>}
   */
  inMap(map) {
    const checkInMap = (value) => {
      if(map.has(value)) {
        return value;
      }
      return exception.create(exception.notMember, value, map);
    };
    this[queueAccessor].push(checkInMap);
    return this;
  };

  /**
   * @return {Any|CheckError<notMember>}
   */
  inSet(map) {
    const checkInSet = (value) => {
      if(map.has(value)) {
        return value;
      }
      return exception.create(exception.notMember, value, map);
    };
    this[queueAccessor].push(checkInSet);
    return this;
  };
  /**
   * @return {Any|CheckError<notMember>}
   */
  inArray(array) {
    const checkInArray = (value) => {
      if(array.includes(value)) {
        return value;
      }
      return exception.create(exception.notMember, value, array);
    };
    this[queueAccessor].push(checkInArray);
    return this;
  };

  /**
   * @return {Any|CheckError<wrongType>}
   */
  ofType(type) {
    const checkOfType = (value) => {
      if(typeof value === type) {
        return value;
      }
      return exception.create(exception.wrongType, value, type);
    };
    this[queueAccessor].push(checkOfType);
    return this;
  };

  /**
   * @return {Any|CheckError<wrongClass>}
   */
  instanceOf(constructor) {
    const checkInstanceOf = (value) => {
      if(value instanceof constructor) {
        return value;
      }
      return exception.create(exception.wrongClass, value, constructor);
    };
    this[queueAccessor].push(checkInstanceOf);
    return this;
  };

  /**
   * @return {Any|CheckError<array>|CheckError<notIterable>}
   */
  iterable(check) {
    const checkIterable = (value, ...parents) => {
      const exceptions = [];
      const output = [];
      if(value[Symbol.iterator] == null) {
        return exception.create(exception.wrongType, value, "iterable");
      }
      if(checkIterable.check === undefined) {
        return value;
      }
      let i = 0;
      for(let v of value) {
        const c = checkIterable.check.resolve(v,  output, ...parents);
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
        return exception.create(exception.array, value, checkIterable.check, exceptions, output);
      }
      return output;
    };
    checkIterable.iterable = true;
    checkIterable.check = check;
    this[queueAccessor].push(checkIterable);
    return this;
  };
  /**
   * @return {Any|CheckError<object>}
   */
  object(definition, fireUnknown=true, order) {
    definition = definition || {};
    order = order || [];
    const checkObject = (value, ...parents) => {
      value = value || {};
      const output = {};
      const exceptions = {};
      let c;
      order = order.concat(
        Object.keys(checkObject.definition).filter(
          (prop) => !order.includes(prop)));
      for(let prop of order) {
        if(checkObject.definition[prop] === undefined) {
          continue;
        }
        c = checkObject.definition[prop].resolve(value[prop], output, ...parents);
        if(exception(c)) {
          exceptions[prop] = c;
        } else {
          output[prop] = c;
        }
      }
      for(let prop of Object.keys(value)) {
        if(checkObject.definition[prop] === undefined) {
          if(fireUnkwnown) {
            exceptions[prop] = exception.create(exception.unknownProp, value, checkObject.definition, prop);
          } else {
            output[prop] = value[prop];
          }
        }
      }
      if(Object.keys(exceptions).length > 0) {
        return exception.create(exception.object, value, checkObject.definition, exceptions, output);
      }
      return output;
    };
    checkObject.object = true;
    checkObject.definition = definition;
    checkObject.order = order;
    this[queueAccessor].push(checkObject);
    return this;
  };

  /**
   * @return {Any|CheckError<missingValue>}
   */
  mandatory() {
    const checkMandatory = (value) => {
      if(value == null) {
        return exception.create(exception.missingValue, value);
      }
      return value;
    };
    this[queueAccessor].push(checkMandatory);
    return this;
  };

  compose(check) {
    const queue = this[queueAccessor];
    for(let f of check[queueAccessor]) {
      queue.push(f);
    }
    return this;
  };
  
  // TODO merge orders
  deepCompose(append) {
    const queue = this[queueAccessor];
    const appendQueue = append[queueAccessor];
    if(appendQueue.length <= 0) {
      return this;
    }
    if(queue.length <= 0) {
      this[queueAccessor] = appendQueue.slice();
      return this;
    }
    const tip = queue[queue.length - 1];
    const toCompose = appendQueue[0];
    if(tip.object === true && toCompose.object === true) {
      const newDef = Object.assign({}, tip.definition);
      for(let prop of Object.keys(toCompose.definition)) {
        if(newDef[prop] === undefined) {
          newDef[prop] = toCompose.definition[prop];
        } else {
          newDef[prop] = check().compose(newDef[prop]).deepCompose(toCompose.definition[prop]);
        }
      }
      tip.definition = newDef;
      return this;
    }
    if(tip.iterable === true && toCompose.iterable === true) {
      tip.check = check().compose(tip.check).deepCompose(toCompose.check);
      return this;
    }
    return this.compose(append);
  }

  add(f) {
    this[queueAccessor].push(f);
    return this;
  };

  resolve(value, ...parents) {
    for(let f of this[queueAccessor]) {
      if(exception(value)) {
        return value;
      }
      if(f.bypass && value == null) {
        return f.call(undefined, value, ...parents);
      }
      value = f.call(undefined, value, ...parents);
    }
    return value;
  };

  hold() {
    return this.resolve.bind(this);
  };
}
