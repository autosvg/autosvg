/**
 * @module lib/utils/descriptor
 * @requires lib/utils/exception
 */

import * as e from "./exception";

/**
 * Creates a new check builder
 */
export default function check(firstFunction) {
  return new Check(firstFunction);
}

class NotMember {
  constructor(value, collection) {
    this.value = value;
    this.collection = collection;
  }
  get message() {
    return `${this.name}: not a member of the supplied collection`;
  }
}

class WrongType {
  constructor(value, type) {
    this.value = value;
    this.type = type;
  }
  get message() {
    return `${this.name}: should be of type ${this.type}`;
  }
}

class WrongClass {
  constructor(value, classConstructor) {
    this.value = value;
    this.classConstructor = classConstructor;
  }
  get message() {
    return `${this.name}: not an instance of the given class/constructor`;
  }
}

class MissingValue {
  constructor(value, allowNull=false) {
    this.value = value;
    this.allowNull = allowNull;
  }
  get message() {
    return `${this.name}: undefined ${this.allowNull ? "" : "or null"},\
      but variable is ${this.value}`;
  }
}

class UnknownPropertyName {
  constructor(value, definition, propertyName) {
    this.value = value;
    this.definition = definition;
    this.propertyName = propertyName;
  }
  get message() {
    return `${this.name}: the property ${this.propertyName} has not been defined`;
  }
}

const tokens = new Set();

check.error = (object) => {
  return object == null ? false : tokens.has(object.token);
};

check.error.register = (name, superClass) => {
  const token = e.register(name, superClass);
  tokens.add(token);
  return token;
};

check.error.create = (token, ...args) => {
  if(!tokens.has(token)) {
    throw new Error("Not a recognized check error");
  }
  return create(token, ...args);
};

const localRegister = (errorClass, prop, name) => {
  if(name === undefined) {
    name = errorClass.constructor.name;
  }
  const token = check.error.register(name, errorClass);
  check.error[prop] = token;
};

localRegister(e.create(e.array).constructor, "array", "ArrayCheckErrors");
localRegister(e.create(e.object).constructor, "object", "ObjectCheckErrors");
localRegister(MissingValue, "missingValue");
localRegister(NotMember, "notMember");
localRegister(WrongClass, "wrongClass");
localRegister(WrongType, "wrongType");
localRegister(UnknownPropertyName, "unknownProp");

for(let t of Object.keys(check.error)) {
  tokens.add(t);
}

const queueAccessor = Symbol("queue property name");

const checkFunctions = {};

/**
 * @return {Any|CheckError<notMember>}
 */
checkFunctions.inMap = function(map) {
  const value = this;
  if(map.has(value)) {
    return value;
  }
  return e.create(check.error.notMember, value, map);
};

/**
 * @return {Any|CheckError<notMember>}
 */
checkFunctions.inSet = checkFunctions.inMap;

/**
 * @return {Any|CheckError<notMember>}
 */
checkFunctions.inArray = function(array) {
  const value = this;
  if(array.includes(value)) {
    return value;
  }
  return e.create(check.error.notMember, value, array);
};

/**
 * @return {Any|CheckError<wrongType>}
 */
checkFunctions.ofType = function(type) {
  const value = this;
  if(typeof value === type) {
    return value;
  }
  return e.create(check.error.wrongType, value, type);
};

/**
 * @return {Any|CheckError<wrongClass>}
 */
checkFunctions.instanceOf = function(constructor) {
  const value = this;
  if(value instanceof constructor) {
    return value;
  }
  return e.create(check.error.wrongClass, value, constructor);
};

/**
 * @return {Any|CheckError<object>}
 */
checkFunctions.object = function(definition={}, fireUnknown=false) {
  const value = this == null ? {} : this;
  const output = {};
  const exceptions = {};
  let c;
  for(let prop of Object.keys(definition)) {
    if(definition[prop] === undefined) {
      continue;
    }
    c = definition[prop].resolve(value[prop]);
    if(check.error(c)) {
      exceptions[prop] = c;
    } else {
      output[prop] = c;
    }
  }
  if(fireUnknown) {
    for(let prop of Object.keys(value)) {
      if(!definition.hasOwnProperty(prop)) {
        exception[prop] = e.create(check.error.unknownProp, value, definition, prop);
      }
    }
  }
  if(Object.keys(exceptions).length > 0) {
    return e.create(check.error.object, value, definition, exceptions);
  }
  return output;
};

/**
 * @return {Any|CheckError<array>|CheckError<notIterable>}
 */
checkFunctions.iterable = function(checker) {
  const value = this == null ? [] : this;
  const exceptions = [];
  const output = [];
  if(value[Symbol.iterator] == null) {
    return e.create(check.error.wrongType, value, "iterable");
  }
  if(checker === undefined) {
    return value;
  }
  let i = 0;
  for(let v of value) {
    const c = checker.resolve(v);
    if(check.error(c)) {
      exceptions[i] = c;
    } else {
      output[i] = c;
    }
    i++;
  }
  if(exceptions.length > 0) {
    exceptions.length = i;
    output.length = i;
    return e.create(check.error.array, value, check, exceptions, output);
  }
  return output;
};

/**
 * @return {Any|CheckError<missingValue>}
 */
checkFunctions.mandatory = function() {
  const value = this;
  if(value == null) {
    return new MissingValue(value);
  }
  return value;
};


function propertyDescriptor(value, writable=false) {
  propertyDescriptor.d.value = value;
  propertyDescriptor.d.writable = writable;
  return propertyDescriptor.d;
}

propertyDescriptor.d = {
  enumerable: false,
  configurable: false
};

function Check() {
  Object.defineProperty(this, queueAccessor, propertyDescriptor([]));
}

const properties = {};

const bindCheckFunction = (checkFunction, args) => function(value) {
  return checkFunction.apply(value, args);
};

const resolveCheck = function(value) {
  for(let f of this[queueAccessor]) {
    if(check.error(value)) {
      return value;
    }
    if(f.bypass && value == null) {
      return f.call(undefined, value);
    }
    value = f.call(undefined, value);
  }
  return value;
};

properties.resolve = resolveCheck;

properties.hold = function() {
  return resolveCheck.bind(this);
};

properties.compose = function(check) {
  const queue = this[queueAccessor];
  for(let f of check[queueAccessor]) {
    queue.push(f);
  }
  return this;
};

properties.add = function(f) {
  this[queueAccessor].push(f);
  return this;
};

const identityBypass = (x) => x;
identityBypass.bypass = true;

properties.optional = function() {
  this[queueAccessor].push(identityBypass);
  return this;
};

// FIXME
properties.defaults = function(defaultValue) {
  const f = () => {
    return defaultValue;
  };
  f.bypass = true;
  this[queueAccessor].push(f);
  return this;
};

const makeCheckMethod = (prop) => function(...args) {
  this[queueAccessor].push(bindCheckFunction(checkFunctions[prop], args));
  return this;
};

for(let prop of Object.keys(checkFunctions)) {
  Object.defineProperty(Check.prototype, prop, propertyDescriptor(makeCheckMethod(prop)));
}

for(let prop of Object.keys(properties)) {
  Object.defineProperty(Check.prototype, prop, propertyDescriptor(properties[prop]));
}
