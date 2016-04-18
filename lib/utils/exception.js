/**
 * Check if the argument is of a registered exception type.
 * @param {mdn:Object} object - the object to check
 * @return {mdn:Boolean} whether the object is a registered exception
 */
export default function exception(object) {
  return object == null ? false : registry.has(object[tokenAccessor]);
}

/**
 * The registry of every registered type of exception.
 * The keys are tokens that uniquely identifies a type of exception
 * and the values are the constructors used to instanciate them
 */
const registry = new Map();

/**
 * A symbol to access the token property of the created exceptions.
 */
const tokenAccessor = Symbol("token property name");


/**
 * A helper function to efficiently use property descriptors in
 * {@link mdn:Object.defineProperty}.
 */
function propertyDescriptor(value) {
  propertyDescriptor.d.value = value;
  return propertyDescriptor.d;
}

propertyDescriptor.d = {
  enumerable: false,
  configurable: false,
  writable: false
};

/**
 * A default constructor for an exception
 */
function Exception(value) {
  this.name = this.constructor.name;
  this.value = value;
}

const depthAccessor = Symbol("depth property name");
const incDepthAccessor = Symbol("increment depth property name");

const properties = {
  token: {
    get: function() {
      return this[tokenAccessor];
    },
    configurable: false,
    enumerable: false
  },
  onIt: {
    value: function(handler) {
      return handler.call(undefined, this);
    },
    writable: false,
    configurable: false,
    enumerable: false
  },
  dispatch: {
    value: function(handlers) {
      if(!registry.has(this[tokenAccessor])) {
        throw new Error("Not a recognized exception");
      }
      let handler = handlers[this[tokenAccessor]];
      if(handler == null) {
        handler = handlers.default;
        if(handler == null) {
          throw this;
        }
      }
      return this.onIt(handler);
    },
    writable: false,
    configurable: false,
    enumerable: false
  }
};

const messageProperty = {
  get: function() {
    return `${this.name} raised`;
  },
  configurable: true,
  enumerable: true
};

const incDepthProperty = {
  value: function() {
    this[depthAccessor]++;
  },
  configurable: false,
  enumerable: true,
  writable: false
};

Object.defineProperties(Exception.prototype, properties);
Object.defineProperty(Exception.prototype, "message", messageProperty);

/**
 * Registers a new type of exception.
 * @param {mdn:String} name - The name of the new type
 * @param {Class} superClass - An optional constructor that will be extended
 * @return {Symbol} The token of the newly created type of exception
 */
export function register(name, superClass=Exception) {
  const newExceptionClass = class extends superClass {
    constructor(...args) {
      super(...args);
      this.name = name;
      this[depthAccessor] = 0;
    }
  };
  const token = Symbol(name);
  if(superClass !== Exception) {
    Object.defineProperties(newExceptionClass.prototype, properties);
    if(!("message" in newExceptionClass.prototype)) {
      Object.defineProperty(newExceptionClass.prototype, "message", messageProperty);
    }
    if(!(incDepthAccessor in newExceptionClass.prototype)) {
      Object.defineProperty(newExceptionClass.prototype, incDepthAccessor, incDepthProperty);
    }
  }
  Object.defineProperty(newExceptionClass.prototype, tokenAccessor, propertyDescriptor(token));
  registry.set(token, newExceptionClass);
  return token;  
};


/**
 * Creates an exception of a given type
 * @param {Symbol} The token
 * @param ...args The arguments to pass to the exception constructor
 * @return {Exception} The newly created exception
 * @throws Error When the supplied token does not match a registered type of 
 * exception
 */
export function create(token, ...args) {
  const exceptionClass = registry.get(token);
  if(exceptionClass === undefined) {
    throw new Error("Not a recognized exception");
  }
  return new exceptionClass(...args);
}

/**
 * A collection of exceptions
 */
class ObjectExceptions {
  constructor(descriptor, definition, exceptions) {
    this.value = descriptor;
    this.definition = definition;
    this.exceptions = exceptions;
    this[incDepthAccessor]();
    this[depthAccessor] = 0;
  }
  get message() {
    let m = `${this.name}: exceptions on the following properties: `;
    for(let prop of Object.keys(this.exceptions)) {
      m += "\n";
      m += "  ".repeat(this.exceptions[prop][depthAccessor]);
      m += `${prop}: ${this.exceptions[prop].message}`;
    }
    return m;
  }
  onProperties(objectCallbacks) {
    const results = {};
    var callback, exception;
    for(let prop of Object.keys(this.exceptions)) {
      callback = objectCallbacks[prop];
      exception = this.exceptions[prop];
      if(callback == null) {
        throw exception;
      }
      results[prop] = callback.call(undefined, exception);
    }
    return results;
  }
}

Object.defineProperty(ObjectExceptions, incDepthAccessor, propertyDescriptor(function() {
  this[depthAccessor]++;
  for(let prop of Object.keys(this.exceptions)) {
    this.exceptions[prop][incDepthAccessor]();
  }
}));

/**
 * A collection of exceptions
 */
class ArrayExceptions {
  constructor(value, definition, exceptions) {
    this.value = value;
    this.definition = definition;
    this.exceptions = exceptions;
    this[incDepthAccessor]();
    this[depthAccessor]--;
  }
  get message() {
    let m = `${this.name}: exceptions on the following indexes: `;
    exceptions.forEach((err, i) => {
      if(err != null) {
        m +="\n";
        m += "  ".repeat(err[depthAccessor]);
        m += `index ${i}: ${err.message}`;
      }
    });
  }
  onEach(callback) {
    const results = [];
    for(let err, i = 0; i < this.exceptions.length; i++) {
      err = this.exceptions[i];
      if(err !== undefined) {
        results[i] = callback.call(undefined, err, i);
      }
    }
    return results;
  }
}

// FIXME: Investigate why identation doesn't work
Object.defineProperty(ArrayExceptions, incDepthAccessor, propertyDescriptor(function() {
  this[depthAccessor]++;
  for(let e of this.exceptions) {
    e[incDepthAccessor]();
  }
}));
/**
 * The token for an array of exceptions
 */
export const array = register("ArrayExceptions", ArrayExceptions);
/**
 * The token for a record of exceptions
 */
export const object = register("ObjectExceptions", ObjectExceptions);
