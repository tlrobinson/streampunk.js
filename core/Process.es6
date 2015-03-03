
import Promise from "bluebird";
import { Stream } from "stream";
import { PortArray, InPort, OutPort } from "./Port";
import { IP, OpenBracket, CloseBracket } from "./IP";

export default class Process {
  constructor(func, name, parent) {
    this._func = func;
    this._name = name || func.name;
    this._parent = parent;

    this._inputs = new PortArray("inputs", this, InPort);
    this._outputs = new PortArray("outputs", this, OutPort);

    this._ownedIPs = {};
  }

  input(...args)   { return this._inputs.port(...args); }
  output(...args)  { return this._outputs.port(...args); }
  inputArray(key)  { return this._inputs.array(key).ports(); }
  outputArray(key) { return this._outputs.array(key).ports(); }

  run() {
    let self = this;
    return (Promise.coroutine(function*() {
      let func = self._func;
      if (func.constructor.name === "GeneratorFunction") {
        func = Promise.coroutine(func);
      }

      let result = func.call(self);

      if (result && typeof result.then === "function") {
        yield result
      } else {
        // TODO: Only care whether output ports get closed?
        let ports = self._outputs.ports(true);
        yield Promise.all(ports.map((port) => {
          return new Promise((resolve, reject) => {
            port.on("end", resolve);
            port.on("error", reject);
          });
        }));
        // TODO: Is there any reason to close input ports?
        // TODO: Should we automatically close output ports when input ports are closed? Probably not.
      }
      self._outputs.ports(true).forEach((port) => port.end());
    }))();
  }

  name() {
    return (this._parent ? this._parent.name() + "." : "") + this.constructor.name + "(" + this._name + ")";
  }

  ownedIPs() {
    return Object.getOwnPropertySymbols(this._ownedIPs).map((sym) => this._ownedIPs[sym]);
  }

  createIP(contents) {
    return new IP(contents, this);
  }

  createOpenIP(contents) {
    return new OpenBracket(contents, this);
  }

  createCloseIP(contents) {
    return new CloseBracket(contents, this);
  }

  drop(ip) {
    if (ip.isOwner(this)) {
      ip.drop();
    } else {
      this.warn("Process " + this.name() + " tried to drop IP (" + ip.contents() + " ) it didn't own: ", (ip._owner && ip._owner.name()));
    }
  }

  log(...args) { console.log(...args); }
  warn(...args) { console.warn("Warning:", ...args); }
}
