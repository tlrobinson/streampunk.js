
import stream from "stream";

export class Port extends stream.Transform {
  constructor(name, parent) {
    super({
      objectMode: true,
      allowHalfOpen: false
    });

    this._name = name;
    this._parent = parent;

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
  _transform(data, encoding, callback) {
    callback(null, data);
  }
  name() {
    return (this._parent ? this._parent.name() + "." : "") + this.constructor.name + "(" + this._name + ")";
  }
}

export class InPort extends Port {
}
export class OutPort extends Port {
}

export class PortArray {
  constructor(name, parent, _Port=Port) {
    this._name = name;
    this._parent = parent;

    this._ports = {};
    this._Port = _Port;
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
      port = array._ports[key] = new this._Port(key, this);
    }
    if (!(port instanceof Port)) {
      throw new Error("Wrong port type for key, expected Port: " + key);
    }
    return port;
  }

  array(key) {
    let array = this._ports[key];
    if (array === undefined) {
      array = this._ports[key] = new PortArray(key, this, this._Port);
    }
    if (!(array instanceof PortArray)) {
      throw new Error("Wrong port type for key, expected PortArray: " + key);
    }
    return array;
  }

  ports(recursive) {
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
    return (this._parent ? this._parent.name() + "." : "") + this.constructor.name + "(" + this._name + ")";
  }
}
