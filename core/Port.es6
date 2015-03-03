
import stream from "stream";
import { IP } from "./IP";
import { receive, receiveContents, send } from "./stream";

export class Port extends stream.PassThrough {
  constructor(name, proc) {
    super({
      objectMode: true,
      allowHalfOpen: false,
      highWaterMark: 0
    });

    this._name = name;
    this._proc = proc;

    // Keep track of the number of ports piped into this port:
    this._pipeCount = 0;
    this.on("pipe",   () => this._pipeCount++);
    this.on("unpipe", () => this._pipeCount--);
  }

  end(...args) {
    // Only end writable side if this is the last pipe
    // TODO: this assumes all writers are piped (is this a safe assumption?)
    if (this._pipeCount > 1) {
      return;
    }
    return super.end(...args);
  }
  name() {
    return this._proc.name() + "." + this.constructor.name + "(" + this._name + ")";
  }
}

export class InPort extends Port {
  // take ownership of IPs as they're sent to an input port:
  write(ip, encoding, callback) {
    if (ip instanceof IP) {
      ip.transferOwnership(this._proc);
    } else {
      console.warn("Warning: not an IP", ip);
    }
    return super.write(ip, encoding, callback);
  }
}

export class OutPort extends Port {
  // relinquish ownership of IPs as they're written to an output port:
  // TODO: is this necessary/good?
  // write(ip, encoding, callback) {
  //   if (ip instanceof IP) {
  //     ip.transferOwnership(null);
  //   } else {
  //     console.warn("Warning: not an IP", ip);
  //   }
  //   return super.write(ip, encoding, callback);
  // }
}

Port.prototype.receive = receive;
Port.prototype.receiveContents = receiveContents;
Port.prototype.send = send;

export class PortArray {
  constructor(name, proc, PortClass) {
    this._name = name;
    this._proc = proc;

    this._ports = {};
    this._PortClass = PortClass;
  }

  port(key, index) {
    let array;
    if (arguments.length > 1) {
      array = this.array(key);
      key = index;
    } else {
      array = this;
    }
    let port = array._ports[key];
    if (port === undefined) {
      port = array._ports[key] = new this._PortClass(this._name+"."+key, this._proc);
    }
    if (!(port instanceof Port)) {
      throw new Error("Wrong port type for key, expected Port: " + key);
    }
    return port;
  }

  array(key) {
    let array = this._ports[key];
    if (array === undefined) {
      array = this._ports[key] = new PortArray(this._name+"."+key, this._proc, this._Port);
    }
    if (!(array instanceof PortArray)) {
      throw new Error("Wrong port type for key, expected PortArray: " + key);
    }
    return array;
  }

  ports(recursive=false) {
    let ports = [];
    for (let key in this._ports) {
      let port = this._ports[key];
      if (port instanceof Port) {
        ports.push(port);
      } else if (recursive) {
        ports.push.apply(ports, port.ports(true));
      }
    }
    return ports;
  }

  name() {
    return this._proc.name() + "." + this.constructor.name + "(" + this._name + ")";
  }
}
