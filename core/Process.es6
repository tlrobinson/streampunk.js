
import Promise from "bluebird";
import { PortArray, InPort, OutPort } from "./Port";
import { Stream } from "stream";

export default class Process {
  constructor(func, name, parent) {
    this._func = func;
    this._name = name || func.name;
    this._parent = parent;

    this._inputs = new PortArray("i", this, InPort);
    this._outputs = new PortArray("o", this, OutPort);
  }

  input(...args)   { return this._inputs.port(...args); }
  output(...args)  { return this._outputs.port(...args); }
  inputArray(key)  { return this._inputs.array(key).ports(); }
  outputArray(key) { return this._outputs.array(key).ports(); }

  run() {
    let func = this._func;
    if (func.constructor.name === "GeneratorFunction") {
      func = Promise.coroutine(func);
    }

    let result = func.call(this);

    if (result && typeof result.then === "function") {
      return result.then(() => {
        this._outputs.ports(true).forEach((port) => port.end());
      });
    } else {
      // TODO: Only care whether output ports get closed?
      let ports = this._outputs.ports(true);
      return Promise.all(ports.map((port) => {
        return new Promise((resolve, reject) => {
          port.on("end", () => resolve());
          port.on("error", (err) => reject(err));
        });
      }));
      // TODO: Is there any reason to close input ports?
      // TODO: Should we automatically close output ports when input ports are closed? Probably not.
    }
  }

  name() {
    return (this._parent ? this._parent.name() + "." : "") + this.constructor.name + "(" + this._name + ")";
  }
}
