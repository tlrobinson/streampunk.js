
import Promise from "bluebird";
import { Stream } from "stream";
import path from "path";

import { PortArray, InPort, OutPort } from "./Port.es6";
import { IP, OpenBracket, CloseBracket } from "./IP.es6";

export default class Process {
  constructor(component, name, parent) {
    this._component = this._resolveComponent(component);
    this._name = name || this._component.name || (typeof component === "string" && component) || "[unknown]";
    this._parent = parent;

    this._inputs = new PortArray("inputs", this, InPort);
    this._outputs = new PortArray("outputs", this, OutPort);

    this._ownedIPs = {};
  }

  _resolveComponent(component) {
    if (typeof component === "string") {
      let match = component.match(/^sbp\/(.*)$/);
      if (match) {
        component = path.resolve(module.filename, "../..", match[1]);
      }
      component = require(component).default;
    }
    return component;
  }

  input(...args)   { return this._inputs.port(...args); }
  output(...args)  { return this._outputs.port(...args); }
  inputArray(key)  { return this._inputs.array(key).ports(); }
  outputArray(key) { return this._outputs.array(key).ports(); }

  async run() {
    let component = this._component;
    
    let result = component.call(this);

    if (result && typeof result.then === "function") {
      await result
    } else {
      // TODO: Only care whether output ports get closed?
      let ports = this._outputs.ports(true);
      await Promise.all(ports.map((port) => {
        return new Promise((resolve, reject) => {
          port.on("end", resolve);
          port.on("error", reject);
        });
      }));
      // TODO: Is there any reason to close input ports?
      // TODO: Should we automatically close output ports when input ports are closed? Probably not.
    }
    this._outputs.ports(true).forEach((port) => port.end());
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
